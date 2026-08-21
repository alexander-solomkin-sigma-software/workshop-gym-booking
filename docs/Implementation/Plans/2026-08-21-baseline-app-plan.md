# Execution Plan — Baseline app (member + admin) — 2026-08-21

**This is the HOW.** The *why* and scope live in the requirements
(`Business/BRD`, `PDR`, `NFR`) and the [design](../../Architectural/Design/gym-booking-design.md).
This is the ordered, test-first build plan for the baseline app.

## Goal

Ship the runnable baseline: member flows (browse timetable, book, cancel) and
admin flows (manage classes, schedule sessions, set capacity), with the three
invariants enforced server-side and a green test suite.

## Architecture

- **API** — Express + `better-sqlite3`, layered **routes → services → data**.
- **Web** — Vite + React, two tabs (Timetable, Admin), no business logic in UI.
- **Persistence** — seeded SQLite file, git-ignored, rebuilt by `scripts/setup.mjs`
  (see [ADR-0001](../../Architectural/ADR/0001-sqlite-local-db-file.md)).
- **Tests** — Vitest (unit/API) + one Playwright e2e smoke.

## Constraints

- TypeScript throughout; small, readable, test-first.
- Rules (capacity, double-book, capacity-not-below-bookings) live in **services**.
- `npm run setup && npm run dev` runs the app in under 5 minutes.
- Commits are gated: `type(scope): reason #<issue>`.

---

### Task 1 — Data layer + schema

- [x] Define the schema (`classes`, `sessions`, `bookings`) with `UNIQUE
  (session_id, member_id)` and `CHECK (capacity > 0)` in `api/src/db.ts`.
- [x] Add `openDb` / `openMemoryDb` helpers (in-memory for tests).
- [x] Write thin repos in `api/src/data/` (no rules): classes, sessions, bookings,
  plus the timetable read model.
- [x] **Commit (gated):** folded into the API slice.

### Task 2 — Booking service (member rules) — test-first

- [x] Write `booking-service.test.ts`: book succeeds; second book → 409; full → 409;
  missing session → 404; cancel frees a place; cancel of another member → 404.
- [x] Implement `book()` / `cancel()` / `getTimetable()` to pass, throwing typed
  `ConflictError` / `NotFoundError`.
- [x] Confirm green.

### Task 3 — Class service (admin rules) — test-first

- [x] Write `class-service.test.ts`: create/list; blank name → 400; edit;
  non-positive capacity → 400; increase capacity; drop below bookings → 409.
- [x] Implement `createClass` / `editClass` / `scheduleSession` / `setCapacity`.
- [x] Confirm green.

### Task 4 — HTTP routes + app factory

- [x] Add routes (`timetable`, `bookings`, `admin`) + error middleware mapping
  `AppError.status` → HTTP code in `api/src/app.ts`.
- [x] Write `app.test.ts` (supertest) over the seeded app: 200/201/204/409/400.
- [x] **Commit (gated):** `feat(api): booking + admin endpoints on seeded SQLite #2`.

### Task 5 — Seed + setup

- [x] Deterministic `api/src/seed.ts` (fixed datetimes; member `m1` pre-booked;
  one small session filled to demo "Full"). Wire `npm run seed`.
- [x] `scripts/setup.mjs`: install → seed → (optional) Playwright browser → print
  run instructions. Git-ignore the generated `.sqlite`.

### Task 6 — Web

- [x] `api.ts` client; `TimetablePage` (browse/book/cancel); `AdminPage`
  (create class, schedule session, set capacity). Minimal styling.
- [x] **Commit (gated):** `feat(web): timetable, booking, and admin pages #3`.

### Task 7 — E2e smoke + suite green

- [x] Playwright `smoke.spec.ts`: browse → book → cancel in one stable row;
  config boots the seeded API + web.
- [x] `npm test` green (Vitest + Playwright).
- [x] **Commit (gated):** `test: baseline vitest + playwright suite green #4`.
