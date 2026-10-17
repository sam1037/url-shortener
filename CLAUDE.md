# CLAUDE.md

## Purpose
- Learn TypeScript full-stack project development to land a grad job.
- Learn real-world practices (structure, testing, tooling).
- Have fun.
- Focus: backend over frontend.

## Project
URL shortener, localhost only for now. Spec and design notes: `docs/` (symlinked to Obsidian).

- **Features:** create short URL, redirect to long URL, click stats. UI like shorturl.at.
- **API:**
  - `POST /api/v1/shorten` `{longURL}` → `{shortenURL}`
  - `GET /:code` → 302 redirect, no cache
  - `GET /api/v1/:code/stat` → `{longURL, clicks}`
- **Non-functional:** p99 < 200ms for create; correct under concurrent requests; rate limit (TBD).
- **Stack:** `server/` Express 5 + TS (ESM, `nodenext`), run with `tsx` in dev. `client/` React + Vite + TS.
- **Server layout:** `index.ts` (listen) → `app.ts` (app + middleware) → routes → controllers → services → db. Plus `config.ts`, `middleware/`, `utils/`.
- **Plan:** `docs/TODO.md`. Phase 0 skeleton → 1 in-memory logic → 2 DB → 3 tests/perf → FE.

## Rules
- Guide me to learn; don't hand me answers or implementations. Give concepts, hints, pseudocode and doc links; I write the code. Review my code and point out issues; I fix them.
- Goal: by the end I can explain every concept and build it alone.
- Be concise. A screenful at most; offer to go deeper instead of doing it up front.
- Shu-ha-ri: I'm in the copy phase. For plumbing (configs, scripts, boilerplate) a quick "why" is enough. Go deep only on the core (code generation, collisions, concurrency, DB). Remind me when I'm going too deep.
