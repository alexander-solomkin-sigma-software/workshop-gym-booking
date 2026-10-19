# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project

**Gym Class Booking** — a small, runnable web app where members browse a class timetable, book and cancel places, and admins manage classes and capacity. It is intentionally simple and self-contained, used as the baseline for practising an **AI-assisted delivery workflow**: you extend it with **one new feature**, producing the full artifact chain for that increment.

## Layout

```
api/       # Node/TypeScript API (Express) + SQLite (better-sqlite3), local DB file
web/       # React app (Vite)
scripts/   # setup / bootstrap scripts
docs/      # all project documentation (see docs/README.md)
```

## Run it

- `npm run setup` — install, seed the local DB (and rebuild the native module) (one command, < 5 min).
- `npm run dev` — start API + web for local development.
- `npm test` — run the full test suite (Vitest unit/API + a Playwright smoke). Keep it green.

## How we document

The docs in `docs/` are **persistent memory**: you (an AI agent) lose context between sessions, so the specs carry the requirements, design rationale, and constraints forward. Write the spec before the code, and keep the living docs current — a stale doc misleads the next session.

`docs/` is organised by artifact type and follows the delivery workflow: **Requirements → Design (+ ADR) → Execution plan → Feature description → Dev testing scenarios**. Read `docs/README.md` for the taxonomy, naming conventions, and the two-tier (tactical vs living) model.

**Business requirements (BRD, PDR, NFR) live in Confluence, not in this repo.** Read them with the Atlassian MCP connector (page links in `docs/Business/README.md`). Downstream docs cite them by page and item, for example "PDR F4" or "per NFR"; never copy them into other `docs/` files. **Offline fallback:** if the Atlassian connector is unavailable or returns errors, read (and, for a business-scope change, edit) the snapshot copies in `docs/Business/offline/` instead, and tell the user you did so; Confluence wins when both are available (see `docs/Business/README.md#offline-fallback`).

Key rules:
- **One topic per document**; keep files small.
- **Separation of concerns** — feature descriptions describe behaviour, not implementation.
- **No blank templates** — start any new document by copying the closest existing filled one and adapting it.
- **Living docs carry a Revision History** table; mark inline changes with `[Revised YYYY-MM-DD]`; the body always reflects current state.
- **When you write a design, check whether it holds a decision worth an ADR** — if so, add one in `docs/Architectural/ADR/`.
- **Commit convention:** `type(scope): reason #<issue>` (a GitHub issue number or a Jira key from the KAN board, for example `#KAN-12`; links in `docs/README.md`).

## Adding a feature (what you actually do here)

You are **extending an existing, working app**. For your new feature:
1. Add a **use case** in `docs/FunctionalRequirement/Usecase/`.
2. Add a **design** in `docs/Architectural/Design/` and an **ADR** in `docs/Architectural/ADR/` for any real decision.
3. Add an **execution plan** in `docs/Implementation/Plans/` (test-first steps, gated commits).
4. Implement the code in `api/` and `web/`, with tests.
5. Add a **feature description** in `docs/FunctionalRequirement/Feature/` and **test cases/scenarios** in `docs/Testing/`.

**Only add new-feature documents into the existing folders — never rewrite the baseline docs.** They are your reference for "what good looks like".

## Conventions

- TypeScript throughout; keep changes small and test-first.
- Enforce rules (capacity, double-booking, cancellation) in the API, not just the UI.
- Ask before committing (commits are gated).
