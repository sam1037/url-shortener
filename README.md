Yet another URL Shortener.

## Features

- Shorten a long URL
- View total clicks of a shortened URL
- Concurrency safe: no lost updates on click counts

## Tech stack

Express, TypeScript, Redis, PostgreSQL, React

## Development

### Prerequisites

- Node.js 24
- Docker

### Setup

1. Create env files from the examples, then fill in the values:

    ```bash
    cp .env.example .env
    cp server/.env.example server/.env
    cp client/.env.example client/.env
    ```

2. Start PostgreSQL and Redis (reads `POSTGRES_*` from the root `.env`):

    ```bash
    docker compose up -d
    ```

3. Install dependencies (npm workspaces: installs both `client` and `server`):

    ```bash
    npm install
    ```

### Run

In two terminals:

```bash
cd server && npm run dev   # API on http://localhost:3000
```

```bash
cd client && npm run dev   # UI on http://localhost:5173
```

### Test

```bash
cp server/.env.test.example server/.env.test
cd server && npm test
```
