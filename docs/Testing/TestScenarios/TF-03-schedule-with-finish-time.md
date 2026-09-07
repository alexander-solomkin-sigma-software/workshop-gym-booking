# TF-03 — Schedule a session with a finish time

**Feature:** [gym-booking-design.md](../../Architectural/Design/gym-booking-design.md) · Covers UC-02 (F4), alternate flow A4

## Goal

Confirm an admin can schedule a session with both a start time and a finish
time, and that a finish time not after the start is rejected with a clear
message and nothing is saved.

## Preconditions

- App running via `npm run dev` with the seeded database.
- On the **Admin** ("Manage classes") view (left sidebar), with at least one class (e.g. `Yoga Flow`).

## Steps

1. Open the Admin view (left sidebar); pick an existing class.
2. In its schedule form, enter a **date** (e.g. Sep 10), a **start time** (e.g. 10:00),
   a **finish time** after it (e.g. 11:00), and a capacity, then Schedule.
3. Observe the class's session list.
4. Schedule again for the same class, this time with a **finish time equal to or
   before the start** (e.g. start Sep 10, 10:00 / finish Sep 10, 09:30), then Schedule.
5. Observe the session list and any error message.

## Expect

- After step 2: the session is saved and appears in the list showing its
  start–finish time; the member Timetable shows the same session with its
  start–finish range and full capacity available.
- After step 4: the request is rejected with a `400` and a clear message (finish
  must be after start); no new session is added to the list. A direct
  `POST /api/admin/sessions { classId, startsAt, endsAt, capacity }` with
  `endsAt <= startsAt` (or a missing `endsAt`) likewise returns `400` and creates nothing.
