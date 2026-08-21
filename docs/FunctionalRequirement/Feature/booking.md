# Booking — Feature Description

**Status:** Implemented (baseline).
**Issue:** #2 (booking + admin endpoints)
**Design:** [gym-booking-design.md](../../Architectural/Design/gym-booking-design.md)
**Plan:** [2026-08-21-baseline-app-plan.md](../../Implementation/Plans/2026-08-21-baseline-app-plan.md)

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-08-21 | Baseline behaviour documented | Implements UC-01 (F2/F3) |

## Overview

A **member** reserves a place in a class **session** from the timetable, and can
**cancel** their own reservation to free the place again. The timetable shows,
per session, how many spots remain and whether the member already holds a place.
This describes *behaviour*; the technical shape lives in the design.

Covers PDR **F2 (Book a class)** and **F3 (Cancel a booking)**; admin management
(F4) is described in the admin flow and design.

## Behaviour

- **Booking a place.** From a session with at least one free spot, the member
  books; the spot count drops by one and the session shows as booked for them.
- **Session full.** When no spots remain, the session is marked **Full** and
  booking is refused (`409`). No booking is created.
- **Already booked.** A member cannot hold two places in the same session; a
  second attempt is refused (`409`). The UI shows Cancel instead of Book.
- **Cancelling.** The member cancels their own booking; the place is freed
  **immediately** and becomes bookable again by anyone. Cancelling a booking that
  is not the member's own is refused (`404`).

`spots left` is always derived from capacity minus current bookings, so it stays
consistent no matter the order of book/cancel actions.

## Rule ownership

All three invariants — **capacity limit**, **no double-booking**, **cancel frees
a place** — are enforced in the **API service layer** (`booking-service`), not in
the UI. The UI reflects them (disabling Book on a full session) but never decides
them; a direct API call is held to the same rules, backed by a `UNIQUE
(session_id, member_id)` constraint in the database.

## Persistence

Bookings are rows in the SQLite `bookings` table (`session_id`, `member_id`,
`created_at`). The seed pre-books member `m1` on the first Yoga session and fills
one small Spin session to capacity so the "Full" and "already booked" states are
visible on first run. See [ADR-0001](../../Architectural/ADR/0001-sqlite-local-db-file.md).

## Testing

- Unit (Vitest): capacity → 409, double-book → 409, cancel frees a place,
  foreign cancel → 404 (`booking-service.test.ts`).
- API (supertest): book/cancel status codes and the full-session 409 (`app.test.ts`).
- E2e (Playwright): browse → book → cancel happy path (`web/e2e/smoke.spec.ts`).

See the [booking checklist](../../Testing/TestCases/booking-checklist.md) and
[TF-01](../../Testing/TestScenarios/TF-01-book-a-class.md).

## Out of scope

Waitlist when full, cancellation-window rules, notifications, and payments — see
the [extra-feature backlog](../extra-feature-backlog.md).
