# Space Invaders Backend API

Simple Go backend for managing the Space Invaders leaderboard.

## Features

- **GET /api/scores** - Get top 10 rankings
- **POST /api/scores** - Add new score
- **POST /api/scores/reset** - Reset all rankings
- CORS enabled for cross-origin requests
- Persistent storage in JSON file
- Thread-safe with mutex locks

## Quick Start

### Run locally:
```bash
cd backend
go run main.go
```

Server starts on port 8080 (or PORT environment variable)

### Build:
```bash
go build -o xmas-backend
./xmas-backend
```

### Docker:
```bash
docker build -t xmas-backend .
docker run -p 8080:8080 xmas-backend
```

## API Examples

### Get Rankings:
```bash
curl http://localhost:8080/api/scores
```

### Add Score:
```bash
curl -X POST http://localhost:8080/api/scores \
  -H "Content-Type: application/json" \
  -d '{"name":"Kirk","score":320,"level":3}'
```

### Reset Rankings:
```bash
curl -X POST http://localhost:8080/api/scores/reset
```

## Response Format

```json
{
  "rankings": [
    {"name": "Kirk", "score": 320, "level": 3},
    {"name": "Spock", "score": 210, "level": 2}
  ]
}
```

## Data Storage

Rankings are stored in `rankings.json` file and loaded on startup.
