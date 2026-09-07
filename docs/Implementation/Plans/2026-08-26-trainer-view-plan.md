# Execution Plan — Trainer view (assigned sessions + rosters) — 2026-08-26

**This is the HOW.** The *why* and scope live in the extra-feature backlog
(Trainer view), UC-03, and the
[design](../../Architectural/Design/trainer-view-design.md) + decision
[ADR-0003](../../Architectural/ADR/0003-trainer-role-minimal-auth.md). This is the
ordered, test-first build plan for the Trainer-view increment.

## Goal

Ship the Trainer view: an optional trainer id on a session, a
`GET /api/trainer/:trainerId/sessions` endpoint returning each assigned session
with its roster and count, a third **Trainer** sidebar item with a trainer
"acting as" field, and a green test suite. Read-only — no change to booking,
capacity, or scheduling rules.

## Architecture

- **API** — Express + `better-sqlite3`, layered **routes → services → data**; a
  new read path scoped by `sessions.trainer`.
- **Web** — Vite + React, a third sidebar view (`TrainerPage`) + a trainer
  "acting as" field; no business logic in the UI.
- **Persistence** — additive nullable `sessions.trainer` column, seeded via
  `api/src/seed.ts` (see [ADR-0001](../../Architectural/ADR/0001-sqlite-local-db-file.md));
  no new table (see [ADR-0003](../../Architectural/ADR/0003-trainer-role-minimal-auth.md)).
- **Tests** — Vitest (unit/API) + one Playwright e2e smoke.

## Constraints

- TypeScript throughout; small, readable, test-first.
- The trainer read rule lives in a **service**; routes only validate shape and map
  errors. Roster is **derived** from `bookings`, never stored.
- Existing invariants (capacity, no double-book, capacity-not-below-bookings) and
  the single-day scheduling rules are **untouched**.
- No real auth — trainer is an id, reusing the acting-as pattern (ADR-0003).
- `npm run setup && npm run dev` still runs the app in under 5 minutes.
- Commits are gated: `type(scope): reason #<issue>`.

---

### Task 1 — Schema + seed: optional trainer on a session

- [ ] Add a nullable `trainer TEXT` column to the `sessions` table in
  `api/src/db.ts` (additive; existing inserts that omit it stay valid).
- [ ] Extend `api/src/types.ts`: `SessionRow.trainer: string | null`, and a
  `TrainerSessionEntry` DTO (`sessionId`, `classId`, `className`, `startsAt`,
  `endsAt`, `trainer`, `roster: string[]`, `booked`).
- [ ] Update `api/src/seed.ts` to assign a trainer to **some** sessions (e.g.
  `t-morgan` on the two Yoga sessions, `t-lee` on a Spin session) and leave
  others `NULL`; keep datetimes byte-stable.
- [ ] **Commit (gated):** folded into the service slice (Task 2).

### Task 2 — Trainer service (read rule) — test-first

- [ ] Write `trainer-service.test.ts` (in-memory DB): `getTrainerSessions('t-morgan')`
  returns only that trainer's sessions, ordered by `starts_at`, each with the
  correct roster (booked member ids) and `booked` count; an **assigned session
  with no bookings** → `roster: []`, `booked: 0`; an **unknown trainer** → `[]`;
  a **blank id** → `[]`; sessions with `trainer = NULL` never appear.
- [ ] Implement `getTrainerSessions(trainerId)` in
  `api/src/services/trainer-service.ts`, deriving the roster from `bookings`.
- [ ] Confirm green.

### Task 3 — Admin scheduling accepts an optional trainer — test-first

- [ ] Extend `class-service.test.ts` (or add cases): `scheduleSession` with a
  `trainer` stores it; without one stores `NULL`; **all existing scheduling
  validation (same-day, finish-after-start, working hours, duration) still holds**
  and is unaffected by the optional trainer.
- [ ] Extend `scheduleSession` to accept an optional `trainer` and persist it.
- [ ] Confirm green.

### Task 4 — HTTP route + app factory

- [ ] Add `GET /api/trainer/:trainerId/sessions` (→ `200` list, `200 []` for
  unknown) and accept optional `trainer` on `POST /api/admin/sessions` in
  `api/src/app.ts`; reuse the existing error middleware.
- [ ] Extend `app.test.ts` (supertest) over the seeded app: `200` + expected shape
  for a seeded trainer; `200 []` for an unknown trainer; scheduling with a trainer.
- [ ] **Commit (gated):** `feat(api): trainer sessions endpoint + optional session trainer #5`.

### Task 5 — Web: Trainer view + third sidebar item + acting-as field

- [ ] Add `trainerId` state and a **Trainer** sidebar item + trainer "acting as"
  field (visible "Acting as" label + no-real-auth helper text, `aria-label`
  `trainer id`) in `web/src/App.tsx`.
- [ ] Add `getTrainerSessions` to the `api.ts` client and a read-only `TrainerPage`
  (`web/src/pages/TrainerPage.tsx`) listing class name, date, start–finish, roster,
  and count; show a "no sessions assigned" empty state for unknown/blank ids.
- [ ] Add the optional **Trainer** input to the Admin schedule form
  (`web/src/pages/AdminPage.tsx`).
- [ ] **Commit (gated):** `feat(web): trainer view, sidebar item, and acting-as field #6`.

### Task 6 — E2e smoke + suite green

- [ ] Playwright `trainer.spec.ts`: open Trainer view, act as a seeded trainer →
  see their sessions + rosters; act as an unknown trainer → see the empty state.
- [ ] `npm test` green (Vitest + Playwright).
- [ ] **Commit (gated):** `test: trainer-view vitest + playwright suite green #7`.

### Task 7 — Update living docs

- [ ] Add `FunctionalRequirement/Feature/trainer-view.md` (behaviour of the shipped
  view) and record the increment in the baseline design's Revision History if it
  touches shared surfaces.
- [ ] Confirm TF-06 and the TC rows in `booking-checklist.md` match the shipped
  behaviour.
- [ ] **Commit (gated):** `docs(trainer): feature description + living-doc updates #8`.
