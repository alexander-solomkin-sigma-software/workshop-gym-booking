# Booking — Manual Test Checklist

**Feature spec:** [booking.md](../../FunctionalRequirement/Feature/booking.md)
**Issue / design:** #2 · [gym-booking-design.md](../../Architectural/Design/gym-booking-design.md)
**Tester:** ______   **Date:** ______   **Build / Env:** ______

## Test Cases

| # | Area | Test case | Steps | Expected result | Result | Notes |
|---|------|-----------|-------|-----------------|--------|-------|
| TC-01 | Browse | Timetable lists seeded sessions | 1. `npm run dev`<br>2. Open the web app on the Timetable tab | Sessions listed with class name, time, and `spots left / capacity` | ☐ Pass / ☐ Fail | |
| TC-02 | Book | Book a free session | 1. As member `zoe`, pick a session with spots free<br>2. Click Book | Booking recorded; spots left drops by 1; button becomes Cancel | ☐ Pass / ☐ Fail | |
| TC-03 | Full | Full session cannot be booked | 1. Find the pre-filled Spin session (0 / 3, Full)<br>2. Attempt to book | Book is disabled; a direct `POST /api/bookings` returns `409` | ☐ Pass / ☐ Fail | Seed fills it |
| TC-04 | Double-book | Same member cannot book twice | 1. Book a session as `zoe`<br>2. `POST /api/bookings` again for the same session/member | Second attempt returns `409`; only one booking exists | ☐ Pass / ☐ Fail | UNIQUE backstop |
| TC-05 | Cancel | Cancel frees the place | 1. Book a session<br>2. Click Cancel | Booking removed; spots left rises by 1; button returns to Book | ☐ Pass / ☐ Fail | |
| TC-06 | Cancel (negative) | Cannot cancel another member's booking | 1. Note `m1`'s seeded booking id<br>2. `DELETE /api/bookings/{id}?memberId=zoe` | Returns `404`; the booking is untouched | ☐ Pass / ☐ Fail | Member-scoped |
| TC-07 | Admin create | Create a class | 1. Admin tab → enter a name<br>2. Add class | Class appears in the list; blank name is rejected (`400`) | ☐ Pass / ☐ Fail | |
| TC-08 | Admin capacity | Cannot drop capacity below bookings | 1. Schedule a session, book 2 places<br>2. Set capacity to 1 | Rejected with `409`; setting to 2 (== booked) is allowed | ☐ Pass / ☐ Fail | |
| TC-09 | Admin schedule | Schedule a session with start + finish | 1. Admin tab → pick a class<br>2. Enter start, a finish after it, and capacity → Schedule | Session saved; list and Timetable show its start–finish time | ☐ Pass / ☐ Fail | UC-02 A4 |
| TC-10 | Admin schedule (negative) | Finish not after start is rejected | 1. Schedule with finish == or before start (or missing finish)<br>2. Submit / `POST /api/admin/sessions` | Rejected with `400` and a clear message; no session created | ☐ Pass / ☐ Fail | `endsAt > startsAt` |
