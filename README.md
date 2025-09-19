# node-devops-starter

A tiny Node.js + Express API with MongoDB — designed as a **DevOps practice app**. Includes Docker, docker-compose, basic health/readiness endpoints, and Kubernetes manifests (Deployment/Service/HPA/Secret).

## Endpoints
- `GET /healthz` — liveness
- `GET /ready` — readiness (true after Mongo connects)
- `GET /api/todos` — list todos
- `POST /api/todos` — create `{ title }`
- `PUT /api/todos/:id` — update `{ title, done }`
- `DELETE /api/todos/:id` — delete

## Local
```bash
npm start
docker run \
  -d \
  --name mongo \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  mongo:6

# then in another shell:
curl http://localhost:3000/healthz
curl http://localhost:3000/api/todos -H 'content-type: application/json' -d '{"title":"learn k8s"}'
```
