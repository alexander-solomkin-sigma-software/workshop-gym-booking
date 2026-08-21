# UC-02 — Manage classes and capacity (Admin)

**Covers:** F4 Manage classes

## Actor
Admin.

## Preconditions
- The app is running.
- The user is acting as an admin.

## Main flow — create a class and schedule a session
1. Admin opens the class management view.
2. Admin creates a class (name, description).
3. Admin schedules a session for that class: date/time and capacity.
4. System saves the class and session.
5. The new session appears on the member timetable with its full capacity available.

## Alternate flows
- **A1 — Edit a class:** admin edits a class's name/description; changes are reflected wherever the class is shown.
- **A2 — Change capacity:** admin changes a session's capacity. Increasing it adds spots; the system does not allow reducing capacity below the number already booked.
- **A3 — Invalid input:** missing name or a non-positive capacity is rejected with a clear message; nothing is saved.

## Postconditions
- The class/session list reflects the admin's changes.
- Session capacities remain consistent with existing bookings.

## Rules referenced
- Capacity cannot be set below current bookings (see PDR/NFR correctness).
