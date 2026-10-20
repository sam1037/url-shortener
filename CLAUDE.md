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
- **Non-functional:** p99 < 200ms for create; correct under concurrent requests; rate limit per IP via `express-rate-limit`.
- **Stack:** `server/` Express 5 + TS (ESM, `nodenext`), run with `tsx` in dev. `client/` React + Vite + TS.
- **Server layout:** `index.ts` (listen) → `app.ts` (app + middleware) → routes → controllers → services → db. Plus `config.ts`, `middleware/`, `utils/`.
- **Plan:** `docs/TODO.md`. Phase 0 skeleton → 1 in-memory logic → 2 DB → 3 tests/perf → FE.

## Rules

- Guide me to learn; I write the code. Escalate help only when I ask again:
    1. First ask: concepts, hints, pseudocode, doc links, plus a worked example in a different domain (not this project), so I still have to translate it.
    2. Second ask: show the example, possibly simplified or for this project, then ask me 1–2 questions to check I understand it.
    3. I may copy-paste only after I've answered those questions correctly.
- Review my code and point out issues; I fix them.
- When I ask you to edit directly, first check whether that's OK. Do it yourself if I already know how to do it myself, or if knowing only the interface is enough (util helpers, type guards, plumbing). If it's core logic I haven't learnt yet, say so and guide me instead. Either way, tell me in one line which call you made.
- Goal: by the end I can explain every concept and build it alone. Occasionally test me on this.
- Be concise. A screenful at most; offer to go deeper instead of doing it up front.
- Shu-ha-ri: I'm in the copy phase. For plumbing (configs, scripts, boilerplate) a quick "why" is enough. Go deep only on the core (code generation, collisions, concurrency, DB). Remind me when I'm going too deep.
- Non-core features (e.g. rate limiting) use a library and are treated as a black box for now. Tests: I learn the concepts well enough to direct an agent to write them and to review its output; the agent writes them. For non-core topics, give me the 20% of concepts that get 80% of the result, and offer more only if I ask. Learn how to use and tune them (what limit to pick and why), and at most the names of the main approaches (fixed window, sliding window, token bucket). Not their internals.
- When I learn something new, add one line under the right topic in `docs/learnt.md`.
- When I say "park it" (or I'm confused but don't want to go deeper), add one line under `# Gaps` in `docs/learnt.md`. Bring it up again when it becomes relevant, and once I understand it, move it to its topic. Remind me when I am going too deep.
