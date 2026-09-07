# UC-03 — View assigned sessions and rosters (Trainer)

**Covers:** Trainer view — extra-feature backlog (first item) (see [extra-feature-backlog.md](../extra-feature-backlog.md) and [trainer-view-design.md](../../Architectural/Design/trainer-view-design.md))

## Actor
Trainer.

## Preconditions
- The app is running with seeded classes and sessions.
- Some sessions have a **trainer** assigned (an optional trainer id set by the admin when scheduling; the seed assigns trainers to some sessions).
- The user is acting as a trainer (a trainer id, entered exactly like the member "acting as" field — no real authentication).

## Main flow — a trainer reviews their sessions and rosters
1. Trainer opens the **Trainer** view from the left sidebar.
2. Trainer sets the **trainer id** field (labelled "Acting as", in the sidebar) to their id (e.g. `t-morgan`).
3. System lists the sessions assigned to that trainer: class name, date, and start–finish time.
4. For each session, the system shows its **roster** — the member ids currently booked — and the **booked count**.
5. Trainer reads the roster to see who is expected at each session.

## Alternate flows
- **A1 — Unknown trainer:** at step 2, if the trainer id matches no assigned sessions, the system shows an empty state ("no sessions assigned"). Nothing else changes; no error.
- **A2 — Empty trainer id:** if the trainer id field is blank, the system shows the empty state and makes no request (or the request returns no sessions). No sessions are listed.
- **A3 — Session with no bookings:** a session assigned to the trainer that has no bookings appears in the list with an **empty roster and a count of 0** — it is still shown, because the trainer is assigned to it.

## Postconditions
- No data is changed — this is a **read-only** view. Bookings, sessions, and classes are untouched.
- The trainer sees exactly the sessions assigned to their id, each with an accurate roster and count consistent with current bookings.

## Rules referenced
- A session may have at most one trainer; the assignment is optional (see design; extra-feature backlog: Trainer view).
- Rosters are **derived** from current bookings — the member ids booked on the session (see design; mirrors the derived `spotsLeft`).
- Existing scheduling rules (single-day, working hours 06:00–22:00, duration 30 min–3 h) are unchanged by this feature (see UC-02).
- No real authentication: a trainer id stands in for sign-in, exactly like the member field (see [ADR-0003](../../Architectural/ADR/0003-trainer-role-minimal-auth.md)).
