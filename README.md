Yet another URL Shortener. Try it [here](https://urlshortener.sam1037.com)!

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

## Deployment

Live at https://urlshortener.sam1037.com, on one AWS EC2 instance (ARM) running `compose.yaml`.

- nginx act as web server for static files, reverse proxy for backend
- Only nginx is published (80 → 443 redirect, 443); Express, Postgres and Redis are reachable only inside the compose network.
- CI/CD (`.github/workflows/ci.yml`): every PR runs lint, format, typecheck, tests and build. A merge to `main` also builds ARM images, pushes them to ECR and restarts the app on EC2 over SSH.

Prod needs the SSL cert, so it doesn't run locally; use the dev setup above.

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
