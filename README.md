# Gym Class Booking

A small, runnable web app for booking gym classes. Members browse a class **timetable**, **book** and **cancel** places (capacity-limited); admins **manage classes and capacity**.

It is deliberately simple and self-contained, and serves as the baseline for practising an **AI-assisted delivery workflow** — you extend it with a new feature and produce the documentation artifacts for that increment alongside the code.

Upstream template: [github.com/alexander-solomkin-sigma-software/workshop-gym-booking](https://github.com/alexander-solomkin-sigma-software/workshop-gym-booking). Work items are on the [KAN board](https://vs5-ssw.atlassian.net/jira/software/projects/KAN/boards/34) in Jira; tool links are listed in [`docs/README.md`](docs/README.md#workshop-tools).

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

Project docs live in [`docs/`](docs) — organised by artifact type (use cases, design, ADRs, plans, feature descriptions, test cases/scenarios). Start with [`docs/README.md`](docs/README.md). The business requirements (BRD, PDR, NFR) live in Confluence; see [`docs/Business/README.md`](docs/Business/README.md).

## Extending it

Add your new feature's documents into the existing `docs/` folders (use case → design + ADR → plan → feature description → test scenarios), implement in `api/` and `web/` with tests, and never rewrite the baseline docs — they are the reference to copy from. See [`CLAUDE.md`](CLAUDE.md) for the workflow.
