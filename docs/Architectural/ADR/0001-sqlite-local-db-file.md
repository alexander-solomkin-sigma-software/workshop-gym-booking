# ADR-0001: SQLite as a seeded local DB file

- **Status**: Accepted
- **Date**: 2026-08-21
- **Decision makers**: Gym Booking team

## Context

The app needs relational persistence for classes, sessions, and bookings, with
a `UNIQUE (session_id, member_id)` constraint and simple counting queries. It is
a learning baseline that must (per NFR): run locally on Node ≥ 20 with **no
external services, database server, or containers**, come up with **one command
in under 5 minutes**, and start every checkout from **identical, deterministic
data** across Windows/macOS/Linux.

Options considered:

- **A DB server (PostgreSQL/MySQL)** — realistic, but requires install/containers
  and a running service; violates the "no external services / <5-min setup" NFR.
- **A JSON/in-memory store** — trivial to start, but no SQL constraints or
  transactions, so the invariants would have to be hand-rolled and are easy to
  get wrong.
- **SQLite via `better-sqlite3`** — an embedded, file-based SQL engine with real
  constraints and synchronous, transactional access, no server to run.

## Decision

Use **SQLite through `better-sqlite3`** as the single datastore.

- Schema and data are produced by a **deterministic seed script**
  (`api/src/seed.ts`, run via `npm run seed`), which is the **source of truth**.
- The generated database file (`api/data/gym.sqlite`) is **git-ignored**; it is
  rebuilt by `scripts/setup.mjs`. We do **not** commit the binary DB.
- Tests open a fresh **in-memory** SQLite database per suite for isolation.

## Consequences

- Zero external dependencies; `npm run setup` seeds and runs well within 5 minutes.
- Business invariants are backstopped by SQL (`UNIQUE`, `CHECK (capacity > 0)`,
  `FOREIGN KEY`), in addition to the service-layer rules.
- Committing the seed **script** rather than the **binary** avoids Windows
  line-ending/checksum churn on a committed `.sqlite`; the trade-off is that a
  fresh checkout must run the seed step (folded into `setup`).
- `better-sqlite3` is a native module; a supported prebuilt binary is fetched on
  install. A toolchain is only needed if a prebuild is unavailable for the
  platform.
- SQLite is single-writer; fine for a local single-instance app, not intended
  for concurrent production traffic (out of scope per NFR).
