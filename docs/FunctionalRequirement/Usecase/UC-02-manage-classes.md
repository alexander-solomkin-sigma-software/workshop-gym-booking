# UC-02 — Manage classes and capacity (Admin)

**Covers:** F4 Manage classes

_[Revised 2026-08-26] Scheduling a session now captures a finish time in addition to a start time; the finish must be after the start (alternate flow A4)._

_[Revised 2026-08-26] Sessions are **single-day**: the admin now picks a **date, a start time, and a finish time** (not two full date-times). Start and finish must be within working hours 06:00–22:00 (A5) and the duration must be 30 min–3 h (A6). Same-day is enforced structurally by the date+times form, and re-checked on the server._

## Actor
Admin.

## Preconditions
- The app is running.
- The user is acting as an admin.

## Main flow — create a class and schedule a session
1. Admin opens the class management view.
2. Admin creates a class (name, description).
3. Admin schedules a single-day session for that class: a **date**, a **start time**, a **finish time**, and a capacity.
4. System composes the start and finish timestamps from the date + times and validates: same calendar day, finish strictly after start, both within working hours (06:00–22:00), and duration between 30 minutes and 3 hours — then saves the class and session.
5. The new session appears on the member timetable with its start–finish time and full capacity available.

## Alternate flows
- **A1 — Edit a class:** admin edits a class's name/description; changes are reflected wherever the class is shown.
- **A2 — Change capacity:** admin changes a session's capacity. Increasing it adds spots; the system does not allow reducing capacity below the number already booked.
- **A3 — Invalid input:** missing name or a non-positive capacity is rejected with a clear message; nothing is saved.
- **A4 — Finish not after start:** when scheduling a session, if the finish time is missing or not strictly after the start time, the system rejects it with a clear message; nothing is saved. [Added 2026-08-26]
- **A5 — Outside working hours:** if the start or finish falls outside working hours (06:00–22:00), the system rejects it with a clear message; nothing is saved. [Added 2026-08-26]
- **A6 — Duration outside allowed length:** if the session is shorter than 30 minutes or longer than 3 hours, the system rejects it with a clear message; nothing is saved. [Added 2026-08-26]

## Postconditions
- The class/session list reflects the admin's changes.
- Session capacities remain consistent with existing bookings.

## Rules referenced
- Capacity cannot be set below current bookings (see PDR/NFR correctness).
- A session's finish time must be after its start time (see PDR rules).
- A session is single-day, within working hours (06:00–22:00), and 30 min–3 h long (see PDR rules). Times are validated as-is on the received timestamps (timezone simplification).
