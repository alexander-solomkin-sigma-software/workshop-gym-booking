# Trainer view — Feature Description

**Status:** Implemented.
**Issue:** #5 (trainer-view golden path)
**Design:** [trainer-view-design.md](../../Architectural/Design/trainer-view-design.md)
**Plan:** [2026-08-26-trainer-view-plan.md](../../Implementation/Plans/2026-08-26-trainer-view-plan.md)
**Decision:** [ADR-0003](../../Architectural/ADR/0003-trainer-role-minimal-auth.md)

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-08-26 | Trainer view shipped: assigned sessions + rosters | Implements UC-03 (extra-feature backlog: Trainer view) |

## Overview

A **trainer** sees, before a session, **which sessions they are running** and
**who is booked** on each. Acting as a trainer id (the "Acting as" field, exactly
like the member field — a demo stand-in for sign-in, no real authentication), the
trainer opens the **Trainer** view and reads their assigned sessions, each with
its **roster** (the booked member ids) and **count**. This describes *behaviour*;
the technical shape lives in the design.

Covers **UC-03** and the [extra-feature backlog](../extra-feature-backlog.md)
(Trainer view, the first backlog item). Read-only — it changes no bookings,
sessions, or classes.

## Behaviour

- **Assigned sessions.** The view lists only the sessions whose `trainer` matches
  the acting trainer id, ordered by start time; each row shows the class name,
  date, start–finish time, the roster, and the count.
- **Roster.** The roster is the member ids currently booked on the session, with a
  count equal to its length. It is **derived** from `bookings` at read time, so it
  always reflects current bookings and cannot drift (mirrors the derived
  `spotsLeft`).
- **Assigned session with no bookings.** Still listed, with an **empty roster and
  count 0** — it is shown because the trainer is assigned to it (UC-03 A3).
- **Unknown / blank trainer id.** The view shows a **"no sessions assigned"** empty
  state; `GET /api/trainer/:trainerId/sessions` returns `200 []`, never `404`
  (UC-03 A1/A2).
- **Sessions with no trainer (`NULL`).** Appear in **no** trainer's list.
- **Optional trainer on scheduling.** The Admin schedule form gains an optional
  **Trainer** field; when set, the session appears in that trainer's view, and when
  blank the session is unassigned. All existing scheduling rules (single-day,
  working hours, duration) are unchanged.

## Rule ownership

The one rule — "an assigned trainer sees their sessions with rosters" — lives in
the **API service layer** (`trainer-service.getTrainerSessions`); the route only
maps the request to it. The roster is derived from `bookings`; nothing new is
stored for it. The UI holds no business logic — it renders the API result and
posts the optional trainer id unchanged. Booking, capacity, and scheduling
invariants are untouched.

## Persistence

A single additive, **nullable** `trainer TEXT` column on the SQLite `sessions`
table; no new table (see [ADR-0003](../../Architectural/ADR/0003-trainer-role-minimal-auth.md)
and [ADR-0001](../../Architectural/ADR/0001-sqlite-local-db-file.md)). The seed
assigns `t-morgan` to the two Yoga sessions (one with a booking, one empty) and
`t-lee` to a full Spin session, leaving the rest unassigned, so a non-empty
roster, an empty roster, and unassigned sessions are all demonstrable on first
run.

## Testing

- Unit (Vitest): `getTrainerSessions` returns only the trainer's sessions ordered
  by start time; correct roster contents and counts; assigned-but-unbooked → empty
  roster; unknown/blank id → `[]`; other/NULL trainers excluded
  (`trainer-service.test.ts`).
- Unit (Vitest): scheduling with/without an optional trainer, all scheduling rules
  still enforced (`class-service.test.ts`).
- API (supertest): `GET /api/trainer/:id/sessions` shape for a seeded trainer,
  `200 []` for an unknown one, and scheduling with an optional trainer surfacing in
  the trainer view (`app.test.ts`).
- E2e (Playwright): open the Trainer view, act as a seeded trainer → sessions and
  rosters; act as an unknown trainer → empty state (`web/e2e/trainer.spec.ts`).

See the [booking checklist](../../Testing/TestCases/booking-checklist.md) (TC-19…24)
and [TF-06 / TF-07](../../Testing/TestScenarios/TF-06-trainer-view.md).

## Out of scope

Trainer self-scheduling, editing sessions, messaging/notifying members, payroll,
multiple trainers per session, and real authentication or trainer accounts — see
the [extra-feature backlog](../extra-feature-backlog.md) and the design's
"Out of scope".
