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
| TC-11 | Admin schedule | Single-day form: date + start + finish | 1. Admin tab → pick a class<br>2. Enter a date, start 10:00, finish 11:00, capacity → Schedule | Session saved; list and Timetable show its start–finish time; form has date + two time inputs | ☐ Pass / ☐ Fail | UC-02, TF-04 |
| TC-12 | Admin schedule (negative) | Outside working hours is rejected | 1. `POST /api/admin/sessions` start 05:30 / finish 06:30<br>2. Repeat start 21:30 / finish 22:30 | Both rejected with `400` (outside 06:00–22:00); no session created | ☐ Pass / ☐ Fail | UC-02 A5 |
| TC-13 | Admin schedule (negative) | Duration out of range is rejected | 1. `POST /api/admin/sessions` 10:00–10:20 (20 min)<br>2. Repeat 10:00–14:00 (4 h) | Both rejected with `400` (must be 30 min–3 h); no session created | ☐ Pass / ☐ Fail | UC-02 A6 |
| TC-14 | Admin schedule (negative) | Not same calendar day is rejected | 1. `POST /api/admin/sessions` start Sep 10 21:00 / finish Sep 11 08:00 | Rejected with `400` (single-day only); no session created | ☐ Pass / ☐ Fail | TF-04 |
| TC-15 | Admin schedule | Inclusive boundaries accepted | 1. Schedule 06:00–06:30 and 21:30–22:00 (30 min edges)<br>2. Schedule 09:00–12:00 (3 h) | All accepted — 06:00/22:00/30 min/3 h are inclusive limits | ☐ Pass / ☐ Fail | TF-04 |
| TC-16 | Navigation | Sidebar navigates and highlights the active view | 1. Open the app (Timetable shown)<br>2. Click **Admin** in the left sidebar<br>3. Click **Timetable** | Nav is a left sidebar (title on top, Timetable/Admin items, member field below); the clicked item is clearly highlighted and its view fills the content area; exactly one item active | ☐ Pass / ☐ Fail | TF-05 |
| TC-17 | Clarity | Distinct surfaces + self-explaining member field | 1. In the dark theme, compare sidebar vs content backgrounds<br>2. Read the member field's label and helper text | Sidebar (`base-200`/`300`) visibly contrasts with content (`base-100`), no custom colours; member field has a visible label (e.g. "Acting as") + helper text noting it is a demo sign-in stand-in; `getByLabel('member id')` still resolves it | ☐ Pass / ☐ Fail | TF-05, ADR-0002 |
| TC-18 | Labels | Every Manage-classes input has a visible label | 1. Admin tab → inspect create-class and schedule forms | Visible labels shown: "Class name", "Description", "Date", "Start time", "Finish time", "Capacity"; existing `aria-label`s still present so tests resolving by them keep working | ☐ Pass / ☐ Fail | TF-05 |
