# TF-04 — Single-day session scheduling rules

**Feature:** [gym-booking-design.md](../../Architectural/Design/gym-booking-design.md) · Covers UC-02 (F4), alternate flows A5 (working hours) and A6 (duration), plus the same-day rule

## Goal

Confirm an admin schedules a **single-day** session via a **date + start time +
finish time**, and that sessions violating the scheduling rules are rejected with
a clear message and nothing saved. Rules under test (all as named constants):
same calendar day, working hours `OPEN_TIME`–`CLOSE_TIME` (06:00–22:00), and
duration `MIN_DURATION_MIN`–`MAX_DURATION_MIN` (30 min–3 h, inclusive).

Times are validated **as-is on the received timestamps** (timezone
simplification) — cases below assume start/finish are posted in the same offset
they are entered.

## Preconditions

- App running via `npm run dev` with the seeded database.
- On the **Admin** ("Manage classes") tab, with at least one class (e.g. `Yoga Flow`).

## Steps

1. Open the Admin tab; pick an existing class. Note the schedule form now has a
   **date** field, a **start time** field, and a **finish time** field.
2. **Accept — valid session:** date Sep 10, start 10:00, finish 11:00 (1 h,
   in hours, same day), a capacity → Schedule.
3. Observe the class's session list and the member Timetable.
4. **Reject — outside working hours (A5):** `POST /api/admin/sessions` with
   `startsAt` 2026-09-10T05:30 / `endsAt` 2026-09-10T06:30 (starts before 06:00).
5. **Reject — outside working hours (A5):** post `startsAt` 2026-09-10T21:30 /
   `endsAt` 2026-09-10T22:30 (finishes after 22:00).
6. **Reject — too short (A6):** post `startsAt` 2026-09-10T10:00 / `endsAt`
   2026-09-10T10:20 (20 min < 30 min).
7. **Reject — too long (A6):** post `startsAt` 2026-09-10T10:00 / `endsAt`
   2026-09-10T14:00 (4 h > 3 h).
8. **Reject — not same day:** post `startsAt` 2026-09-10T21:00 / `endsAt`
   2026-09-11T08:00 (spans two dates).
9. **Boundary — accept edges:** post a session exactly 06:00–06:30 (30 min at the
   open edge) and another 21:30–22:00 (30 min ending at the close edge); post a
   3 h session 09:00–12:00.
10. Observe the session list and any error messages after each rejection.

## Expect

- After step 2: the session is saved and appears in the list showing its
  start–finish time; the member Timetable shows the same session with full
  capacity available.
- After steps 4–8: each request is rejected with `400` and a clear message
  (working-hours, duration, or same-day respectively); no session is added and
  the list is unchanged. The Admin form surfaces the API error message.
- After step 9: all three boundary sessions are accepted — 06:00, 22:00, 30 min,
  and 3 h are inclusive limits.
- Same-day is also enforced structurally in the UI: with a single date picker the
  form cannot express a multi-day range; the server check is the backstop for
  direct API calls (step 8).
