# Xmas Santa Game - Backend Deployment

## Backend Components

The backend consists of:
- **Go REST API**: Handles global leaderboard persistence
- **PersistentVolumeClaim**: Stores rankings.json file
- **Service**: ClusterIP service for internal communication
- **Ingress**: Routes `/api/*` paths to the backend

## Build and Deploy Backend

### Local Development

```bash
# Run backend locally
make backend-run

# Test API
curl http://localhost:8080/api/scores
```

### Docker Build and Run

```bash
# Build Docker image
make backend-build

# Run locally with Docker
make backend-docker-run

# Test
curl http://localhost:8080/api/scores
```

### Kubernetes Deployment

```bash
# Build, push, and deploy backend
make backend-all

# Or step by step:
make backend-build          # Build Docker image
make backend-push           # Push to registry
make backend-get-digest     # Get image digest
make backend-apply          # Deploy to k8s
```

### Full Stack Deployment

```bash
# Deploy both frontend and backend
make full-deploy
```

## API Endpoints

- `GET /api/scores` - Get top 10 rankings
- `POST /api/scores` - Submit new score
  ```json
  {
    "name": "Player",
    "score": 1000,
    "level": 5
  }
  ```
- `POST /api/scores/reset` - Clear all rankings

## Configuration

Edit the Makefile to customize:
- `BACKEND_IMAGE`: Docker image name
- `BACKEND_DEPLOYMENT_NAME`: Kubernetes deployment name
- `BACKEND_PORT`: Port for local development

## Storage

The backend uses a PersistentVolumeClaim to store `rankings.json`:
- **Size**: 1Gi
- **Access Mode**: ReadWriteOnce
- **Mount Path**: `/app/data`

## Scaling

```bash
# Scale backend replicas
make backend-scale REPLICAS=3
```

## Monitoring

Check backend status:
```bash
kubectl get pods -n santa -l app=santa-backend
kubectl logs -n santa -l app=santa-backend
kubectl describe deployment santa-backend -n santa
```

## Troubleshooting

1. **Backend not responding**: Check pod logs
   ```bash
   kubectl logs -n santa -l app=santa-backend
   ```

2. **API 404 errors**: Verify ingress configuration
   ```bash
   kubectl get ingress -n santa
   kubectl describe ingress santa-claus-game -n santa
   ```

3. **Rankings not persisting**: Check PVC status
   ```bash
   kubectl get pvc -n santa
   kubectl describe pvc santa-backend-pvc -n santa
   ```
