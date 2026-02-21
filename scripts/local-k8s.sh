#!/usr/bin/env bash
# Run Kubernetes locally with Minikube and deploy issuance, verification, frontend.
# Usage: from repo root (a2z/): ./scripts/local-k8s.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Checking Minikube..."
if ! command -v minikube &>/dev/null; then
  echo "Minikube not found. Install it first:"
  echo "  curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64"
  echo "  sudo install minikube-linux-amd64 /usr/local/bin/minikube"
  exit 1
fi

echo "==> Starting Minikube cluster..."
if ! minikube start; then
  echo ""
  echo "Minikube failed to start. If you see 'Segmentation fault':"
  echo "  - Your minikube binary may be corrupted (e.g. incomplete download)."
  echo "  - Re-download: curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64"
  echo "  - Then: sudo install minikube-linux-amd64 /usr/local/bin/minikube"
  echo ""
  echo "Alternative: use Kind instead: ./scripts/local-k8s-kind.sh"
  exit 1
fi

echo "==> Using Minikube's Docker daemon..."
eval $(minikube docker-env)

echo "==> Building Docker images..."
docker build -t issuance-service ./issuance-service
docker build -t verification-service ./verification-service
docker build -t frontend ./frontend

echo "==> Applying Kubernetes manifests..."
kubectl apply -f k8s/

echo "==> Waiting for pods to be ready..."
kubectl wait --for=condition=Ready pod -l app=issuance --timeout=120s || true
kubectl wait --for=condition=Ready pod -l app=verification --timeout=120s || true
kubectl wait --for=condition=Ready pod -l app=frontend --timeout=120s || true

echo ""
echo "==> Status"
kubectl get pods
kubectl get svc

echo ""
echo "==> Access the app:"
echo "  1. Port-forward APIs so the frontend can reach them (frontend uses localhost:3000 and :5000):"
echo "     kubectl port-forward svc/issuance-service 3000:3000 &"
echo "     kubectl port-forward svc/verification-service 5000:5000 &"
echo "  2. Open the frontend in your browser:"
echo "     minikube service frontend"
echo "  Then use the Issuance and Verification pages."
