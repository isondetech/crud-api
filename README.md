# node-devops-starter

A tiny Node.js + Express API with MongoDB — designed as a **DevOps practice app**. Includes Docker, docker-compose, basic health/readiness endpoints, and Kubernetes manifests (Deployment/Service/HPA/Secret).

## Endpoints
- `GET /healthz` — liveness
- `GET /ready` — readiness (true after Mongo connects)
- `GET /api/todos` — list todos
- `POST /api/todos` — create `{ title }`
- `PUT /api/todos/:id` — update `{ title, done }`
- `DELETE /api/todos/:id` — delete

## Local (Docker Compose)
```bash
docker compose up --build
# then in another shell:
curl http://localhost:3000/healthz
curl http://localhost:3000/api/todos -H 'content-type: application/json' -d '{"title":"learn k8s"}'
```

## Kubernetes (example)
```bash
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

> Update the image in `k8s/deployment.yaml` to your registry (e.g., GHCR, ECR, Docker Hub).

## CI/CD (suggestion)
- Build & push Docker image on every push (GitHub Actions)
- Deploy via `kubectl` or Helm in a later job/environment
```yaml
# .github/workflows/ci.yml (snippet)
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npm test
      - run: docker build -t ghcr.io/your-org/node-devops-starter:${{ github.sha }} .
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - run: docker push ghcr.io/your-org/node-devops-starter:${{ github.sha }}
```