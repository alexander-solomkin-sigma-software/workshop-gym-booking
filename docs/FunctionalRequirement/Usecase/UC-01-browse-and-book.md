# UC-01 — Browse and book a class (Member)

**Covers:** F1 Browse timetable · F2 Book a class · F3 Cancel a booking

## Actor
Member.

## Preconditions
- The app is running with seeded classes and sessions.
- The user is acting as a member.

## Main flow — book a place
1. Member opens the timetable.
2. System lists upcoming sessions: class name, date/time, capacity, and spots left.
3. Member selects a session that has at least one spot free.
4. Member confirms the booking.
5. System records the booking and decrements the spots left.
6. System shows the session as booked for this member.

## Alternate flows
- **A1 — Session full:** at step 3, if the session has no spots left, the system disables/refuses booking and shows "class full". No booking is created.
- **A2 — Already booked:** if the member already holds a booking for that session, the system refuses a second booking and indicates they are already booked.

## Secondary flow — cancel a booking
1. Member views a session they have booked.
2. Member cancels the booking.
3. System removes the booking and increments the spots left.
4. The session becomes bookable again for the member and others.

## Postconditions
- A booking exists for the member on the chosen session (main flow), or is removed (cancel flow).
- The session's spots-left count is consistent with its capacity and current bookings.

## Rules referenced
- Capacity limit; no double-booking; cancellation frees the place immediately (see PDR).
