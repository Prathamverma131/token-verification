# Kubernetes

Apply from the **repo root** (`a2z/`), not from a service directory.

---

## Run Kubernetes locally (quick start)

**1. Install Minikube** (one-time, Linux):
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64
```

**2. Start cluster, build images, and deploy** (from repo root `a2z/`):
```bash
cd /home/pratham-verma/a2z
chmod +x scripts/local-k8s.sh
./scripts/local-k8s.sh
```

**3. Open the app in your browser:**

The frontend expects APIs at `localhost:3000` (issuance) and `localhost:5000` (verification). Port-forward so the cluster services appear on localhost:

```bash
# Terminal 1: port-forward APIs (leave running)
kubectl port-forward svc/issuance-service 3000:3000 &
kubectl port-forward svc/verification-service 5000:5000 &

# Terminal 2: open frontend (or run in background)
minikube service frontend
```

Then use the URL that opens (or `minikube service frontend --url`) and the Issuance and Verification pages will work.

**4. Check everything:**
```bash
kubectl get pods
kubectl get svc
kubectl get pods -o wide
```

**5. Stop the cluster when done:**
```bash
minikube stop
```

**6. Delete cluster (optional):**
```bash
minikube delete
```

---

## 1. Start a local cluster (required first)

**Minikube:**
```bash
minikube start
eval $(minikube docker-env)   # use Minikube's Docker so it sees your images
# Then build images (from a2z/): docker build -t issuance-service ./issuance-service etc.
```

**Kind:**
```bash
kind create cluster
# Load images after building: kind load docker-image issuance-service verification-service frontend
```

## 2. Apply manifests (from repo root)

```bash
cd /home/pratham-verma/a2z    # or: cd ~/a2z
kubectl apply -f k8s/
kubectl get pods
kubectl get svc
```

If you run `kubectl apply -f k8s/` from inside `issuance-service/`, use the full path instead:

```bash
kubectl apply -f /home/pratham-verma/a2z/k8s/
```

## 3. If "connection refused" (localhost:8080) or "minikube not found"

No cluster is running. Install a local cluster first.

**Install Minikube (Linux, e.g. Ubuntu):**
```bash
# Option A: direct download
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64

# Option B: with apt (if available)
# sudo apt install minikube
```

Then start the cluster and apply (from repo root):
```bash
minikube start
eval $(minikube docker-env)
cd /home/pratham-verma/a2z
docker build -t issuance-service ./issuance-service
docker build -t verification-service ./verification-service
docker build -t frontend ./frontend
kubectl apply -f k8s/
kubectl get pods
kubectl get svc
```

**Note:** Use `kubectl get svc` (not `svcs`).

**If Minikube crashes with "Segmentation fault":**  
The binary may be corrupted (e.g. download was interrupted). Re-download completely:
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64
minikube start
```
Then run `./scripts/local-k8s.sh` again. Or use **Kind** instead (no VM, often more reliable):

**Kind (alternative – use if Minikube segfaults):**
```bash
# Install Kind: https://kind.sigs.k8s.io/docs/user/quick-start/
curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64
chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind

# From repo root:
./scripts/local-k8s-kind.sh
```
Then: `kubectl port-forward svc/issuance-service 3000:3000 &` and `kubectl port-forward svc/verification-service 5000:5000 &` and `kubectl port-forward svc/frontend 8080:80`, and open http://localhost:8080.

## 4. Validate manifests without a cluster (optional)

To check YAML syntax and schema without a running cluster:
```bash
kubectl apply -f k8s/ --dry-run=client
```
