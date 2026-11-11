Yet another URL Shortener.

## Features

- Shorten a long URL
- View total clicks of a shortened URL
- Concurrency safe: no lost updates on click counts

## Tech stack

Express, TypeScript, Redis, PostgreSQL, React, nginx, Docker Compose

## Getting started

### Prerequisites

- Docker

### Setup

Create env files from the examples, then fill in the values:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The root `.env` holds the `POSTGRES_*` values that compose reads.

### Development

```bash
docker compose up --build   # --build only on first run or after changing deps/Dockerfiles
```

- Frontend (Vite, hot reload): http://localhost:5173
- Backend (Express, restarts on save): http://localhost:3000
- Postgres `localhost:5432` and Redis `localhost:6379` are published for tests and tools.

A plain `docker compose up` merges `compose.override.yaml` (dev) on top of `compose.yaml` (prod).

### Production (local)

```bash
docker compose down
docker compose -f compose.yaml up --build
```

- App: http://localhost:8080. nginx serves the React build and proxies `/api` and short links to Express.
- Only nginx is published; Express, Postgres and Redis are reachable only inside the compose network.

## Test and benchmark

```bash
npm install
```

Tests:

```bash
cp server/.env.test.example server/.env.test
cd server && npm test
```

Benchmark (redirect path):

```bash
cp server/.env.perf.example server/.env.perf   # also has a one-time CREATE DATABASE step
docker compose stop server client   # free port 3000; keep Postgres and Redis running
cd server
npm run start:perf   # terminal 1: builds and runs the server with .env.perf
npm run bench        # terminal 2
```
