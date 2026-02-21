#!/usr/bin/env bash
# Run Kubernetes locally with Kind (no VM). Use this if Minikube segfaults or fails.
# Usage: from repo root (a2z/): ./scripts/local-k8s-kind.sh
# Requires: kind and kubectl installed

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Checking kind..."
if ! command -v kind &>/dev/null; then
  echo "Kind not found. Install: curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind"
  exit 1
fi

echo "==> Creating Kind cluster..."
kind create cluster --name a2z || true

echo "==> Building Docker images (on host)..."
docker build -t issuance-service ./issuance-service
docker build -t verification-service ./verification-service
docker build -t frontend ./frontend

echo "==> Loading Docker images into Kind..."
kind load docker-image issuance-service --name a2z
kind load docker-image verification-service --name a2z
kind load docker-image frontend --name a2z

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
echo "  1. Port-forward APIs: kubectl port-forward svc/issuance-service 3000:3000 &"
echo "     kubectl port-forward svc/verification-service 5000:5000 &"
echo "  2. Port-forward frontend: kubectl port-forward svc/frontend 8080:80"
echo "  3. Open http://localhost:8080 in your browser."
