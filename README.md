# Gym Class Booking

A small, runnable web app for booking gym classes. Members browse a class **timetable**, **book** and **cancel** places (capacity-limited); admins **manage classes and capacity**.

It is deliberately simple and self-contained, and serves as the baseline for practising an **AI-assisted delivery workflow** — you extend it with a new feature and produce the documentation artifacts for that increment alongside the code.

## Stack

- **API** — Node/TypeScript, Express, SQLite (better-sqlite3) with a local DB file (no external database).
- **Web** — React (Vite).
- **Tests** — Vitest (unit/API) + Playwright (end-to-end smoke).
- npm workspaces: [`api/`](api), [`web/`](web).

## Quick start

```bash
npm run setup   # install, seed the local DB (and rebuild the native module) (one command)
npm run dev     # start API + web
npm test        # run the full test suite
```

Requires Node ≥ 22 LTS (pinned in `.nvmrc`; with `nvm` run `nvm use`).

## Documentation

All project docs live in [`docs/`](docs) — organised by artifact type (requirements, design, ADRs, plans, feature descriptions, test cases/scenarios). Start with [`docs/README.md`](docs/README.md).

## Extending it

Add your new feature's documents into the existing `docs/` folders (use case → design + ADR → plan → feature description → test scenarios), implement in `api/` and `web/` with tests, and never rewrite the baseline docs — they are the reference to copy from. See [`CLAUDE.md`](CLAUDE.md) for the workflow.
