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
| 2026-09-22 | Trainer is chosen in the "Acting as" dropdown; an admin picks whose roster to read; the unknown/blank id path is no longer reachable from the UI | [acting-as-roles.md](../../Architectural/Design/acting-as-roles.md) |

## Overview

A **trainer** sees, before a session, **which sessions they are running** and
**who is booked** on each. Selecting themselves in the sidebar's **"Acting as"**
dropdown — a demo stand-in for sign-in, no real authentication — the trainer
opens the **Trainer** view and reads their assigned sessions, each with its
**roster** (the booked member ids) and **count**. This describes *behaviour*;
the technical shape lives in the design. _[Revised 2026-09-22]_

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
  count 0** — it is shown because the trainer is assigned to it (UC-03 A1).
- **Who the view shows.** A trainer sees their own sessions. An **admin** may open
  the view and chooses whose sessions to read in a "Viewing trainer" dropdown;
  the page is identical and equally read-only. _[Added 2026-09-22]_
- **Unknown / blank trainer id.** **Not reachable from the UI** since the trainer
  is chosen from a dropdown of known trainers. The API still returns `200 []`,
  never `404`, for an id matching no session, and the service tests keep covering
  it. _[Revised 2026-09-22]_
- **Sessions with no trainer (`NULL`).** Appear in **no** trainer's list.
- **Optional trainer on scheduling.** The Admin schedule form carries an optional
  **Trainer** dropdown over the known trainers, with a leading `— no trainer —`
  choice; when set, the session appears in that trainer's view, and when left
  unset the session is unassigned. Each scheduled session displays its assigned
  trainer (or "No trainer"). All existing scheduling rules (single-day, working
  hours, duration) are unchanged. _[Revised 2026-09-22]_

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
- E2e (Playwright): act as a seeded trainer, open the Trainer view → sessions and
  rosters; then act as the admin and pick another trainer → that trainer's roster
  (`web/e2e/trainer.spec.ts`). _[Revised 2026-09-22 — the unknown-trainer path
  left the e2e with the UI that reached it; it remains covered by
  `trainer-service.test.ts` and `app.test.ts`.]_

See the [booking checklist](../../Testing/TestCases/booking-checklist.md) (TC-19…24)
and [TF-06 / TF-07](../../Testing/TestScenarios/TF-06-trainer-view.md).

## Out of scope

Trainer self-scheduling, editing sessions, messaging/notifying members, payroll,
multiple trainers per session, and real authentication or trainer accounts — see
the [extra-feature backlog](../extra-feature-backlog.md) and the design's
"Out of scope".
