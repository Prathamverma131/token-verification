# A2Z – Issuance & Verification

A microservices-based application for **credential issuance** and **verification**. Users request a credential (token) by name from the Issuance service and can verify it via the Verification service. The frontend provides a simple UI for both flows.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Microservice Explanation](#microservice-explanation)
- [Folder Structure](#folder-structure)
- [API Contracts](#api-contracts)
- [Deployment Steps](#deployment-steps)
- [Assumptions Made](#assumptions-made)
- [Screenshots of Working System](#screenshots-of-working-system)

---

## Architecture Overview

```
                    ┌─────────────────────────────────────────┐
                    │              Browser (User)             │
                    └────────────────────┬────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────┐
                    │              Frontend (React)            │
                    │  Port: 80 (container) / 3001 (dev)      │
                    │  - /          → Issuance page            │
                    │  - /verification → Verification page     │
                    └────────┬─────────────────────┬───────────┘
                             │                     │
              REACT_APP_ISSUANCE_API_URL    REACT_APP_VERIFICATION_API_URL
                             │                     │
                    ┌────────▼───────────┐   ┌──────▼──────────────────┐
                    │ Issuance Service  │   │  Verification Service   │
                    │ (Express, Node)   │   │  (Express, Node)        │
                    │ Port: 3000        │   │  Port: 5000             │
                    │ - Store credentials│   │  - Validates token      │
                    │   (JSON file)     │   │  - Calls Issuance API   │
                    └────────┬──────────┘   └──────────┬──────────────┘
                             │                         │
                             │   ISSUANCE_SERVICE_URL   │
                             └─────────────────────────┘
```

- **Frontend** talks to both backend services over HTTP (CORS enabled).
- **Verification service** calls the **Issuance service** to fetch a record by ID (token).
- **Issuance service** persists data in a JSON file (no database required for this setup).

---

## Microservice Explanation

| Service | Purpose | Tech | Port (default) |
|--------|---------|------|-----------------|
| **Frontend** | Web UI for issuance and verification | React, TypeScript, React Router | 80 (Docker), 3001 (dev) |
| **Issuance Service** | Creates and stores credentials; returns a unique token (ID). Idempotent by name: same name returns existing token. | Node.js, Express, TypeScript | 3000 |
| **Verification Service** | Validates a token by fetching the issuance record from the Issuance service; returns the record and worker ID. | Node.js, Express, TypeScript, Axios | 5000 |

**Data flow**

1. **Issuance:** User submits a name → Issuance service checks if name exists → creates new credential (or returns existing) → returns token (UUID).
2. **Verification:** User submits token → Verification service calls Issuance service `GET /api/issuances/:id` → returns issuance record and worker ID (or 404).

---

## Folder Structure

```
a2z/
├── frontend/                    # React SPA
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── IssuancePage.tsx
│   │   │   ├── VerificationPage.tsx
│   │   │   └── Page.css
│   │   ├── config.ts            # API base URLs (env-driven)
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── issuance-service/           # Credential issuance API
│   ├── src/
│   │   ├── routes/index.ts      # /api/issuances
│   │   ├── use_case/            # create_issuance, find_issuance, models
│   │   └── respository/         # abstract_db_repo, json_file_repo
│   ├── data/                    # issuances.json (created at runtime)
│   ├── Dockerfile
│   └── package.json
│
├── verification-service/        # Token verification API
│   ├── src/
│   │   ├── routes/index.ts      # /api/verification/:id
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
│
├── k8s/                         # Kubernetes manifests
│   ├── issuance-deployment.yaml
│   ├── issuance-service.yaml
│   ├── verification-deployment.yaml
│   ├── verification-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   └── README.md
│
├── scripts/
│   ├── local-k8s.sh             # Minikube: build, apply, run
│   └── local-k8s-kind.sh        # Kind alternative
│
├── docs/
│   └── screenshots/             # Add screenshots here (see below)
│
└── README.md
```

---

## API Contracts

Base paths: Issuance `http://localhost:3000`, Verification `http://localhost:5000` (or your deployed URLs).

### Issuance Service

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/` | Health / info | - | `"Issuance Service is running!"` |
| GET | `/health` | Health check | - | `{ "status": "ok" }` |
| GET | `/api/issuances` | List all issuances | - | `Issuance[]` |
| GET | `/api/issuances/:id` | Get issuance by ID (token) | - | `200` Issuance or `404` `{ "error": "..." }` |
| POST | `/api/issuances` | Create or get existing by name | `{ "name": "string" }` | See below |

**POST /api/issuances**

- **Request body:** `{ "name": "Alice" }` (required).
- **Responses:**
  - `201 Created`: New credential created. Body: `{ "id": "uuid", "name": "Alice", "createdAt": "ISO8601" }`.
  - `200 OK`: Name already exists. Body: same shape plus `alreadyPresent: true`, `info`, `worker_id`.
  - `400 Bad Request`: Missing name. Body: `{ "error": "Name is required" }`.

**Issuance object**

```ts
{
  id: string;       // UUID (token)
  name: string;
  createdAt: string; // ISO date
}
```

### Verification Service

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/` | Info | - | `"Verification Service is running!"` |
| GET | `/health` | Health check | - | `"App running successfully!"` |
| GET | `/api/verification/:id` | Verify token (fetch issuance) | - | See below |

**GET /api/verification/:id**

- **Responses:**
  - `200 OK`: `{ "worker_id": "string", "issuance_record": Issuance }`
  - `404 Not Found`: `{ "error": "Issuance record not found", "worker_id": "..." }`

---

## Deployment Steps

### Prerequisites

- Node.js 18+
- Docker (and Docker Compose if using compose)
- (Optional) kubectl + Minikube or Kind for Kubernetes

### 1. Run locally (no Docker)

**Terminal 1 – Issuance**

```bash
cd issuance-service
npm install && npm run build && npm run start
# Listens on http://localhost:3000
```

**Terminal 2 – Verification**

```bash
cd verification-service
npm install && npm run build && npm run start
# Listens on http://localhost:5000
# Set ISSUANCE_SERVICE_URL=http://localhost:3000 if not default
```

**Terminal 3 – Frontend**

```bash
cd frontend
npm install
# Set API URLs (optional if backends on localhost):
# export REACT_APP_ISSUANCE_API_URL=http://localhost:3000
# export REACT_APP_VERIFICATION_API_URL=http://localhost:5000
npm start
# Opens http://localhost:3000 (or 3001 if 3000 is taken)
```

### 2. Run with Docker

Build and run each container (use different host ports if 3000/5000/80 are in use):

```bash
# From repo root
docker build -t issuance-service ./issuance-service
docker build -t verification-service ./verification-service
docker build -t frontend ./frontend

docker run -d -p 3000:3000 --name issuance issuance-service
docker run -d -p 5000:5000 -e ISSUANCE_SERVICE_URL=http://host.docker.internal:3000 --name verification verification-service
docker run -d -p 8080:80 --name frontend frontend
```

- Frontend: **http://localhost:8080**
- For the frontend to call the APIs, either:
  - Use **host.docker.internal** (or your host IP) in the frontend build (e.g. `REACT_APP_ISSUANCE_API_URL=http://host.docker.internal:3000`), or
  - Run the frontend locally and point it to `localhost:3000` and `localhost:5000` while the two backends run in Docker.

### 3. Run with Kubernetes

- See **[k8s/README.md](k8s/README.md)** for Minikube/Kind setup, image build, and `kubectl apply -f k8s/`.
- Use port-forward or Ingress to expose services; frontend expects issuance and verification at configurable URLs (e.g. via ingress host/paths or port-forward to localhost).

---

## Assumptions Made

1. **No production database:** Issuance storage is a JSON file under `issuance-service/data/` for simplicity. For production, replace the repository implementation with a real DB.
2. **Single replica for file storage:** The JSON file is not shared across replicas; multiple issuance-service replicas would need a shared store (e.g. DB or shared volume) for consistency.
3. **Token = Issuance ID:** The “token” shown to the user is the issuance `id` (UUID). Verification is “fetch by ID.”
4. **Name uniqueness:** One issuance per name; duplicate name returns the existing issuance (idempotent).
5. **CORS:** Backends allow cross-origin requests from the frontend (origin reflection or configured origins).
6. **Environment:** Default ports 3000 (issuance), 5000 (verification), 80 (frontend in Docker). All configurable via env vars (`PORT`, `ISSUANCE_SERVICE_URL`, `REACT_APP_*`, etc.).
7. **Health endpoints:** Used for liveness/readiness in containers/Kubernetes where applicable.

---


## License

ISC (or as specified in each package).
