# UC-03 — View assigned sessions and rosters (Trainer)

**Covers:** Trainer view — extra-feature backlog (first item) (see [extra-feature-backlog.md](../extra-feature-backlog.md) and [trainer-view-design.md](../../Architectural/Design/trainer-view-design.md))

## Actor
Trainer.

## Preconditions
- The app is running with seeded classes and sessions.
- Some sessions have a **trainer** assigned (an optional trainer id set by the admin when scheduling; the seed assigns trainers to some sessions).
- The user is acting as a trainer — chosen in the sidebar's **"Acting as"** dropdown of demo users, which is a stand-in for sign-in, not real authentication. _[Revised 2026-09-22]_

## Main flow — a trainer reviews their sessions and rosters
1. Trainer selects themselves (e.g. **Morgan Diaz**) in the sidebar's **"Acting as"** dropdown; the menu then offers the **Trainer** page. _[Revised 2026-09-22]_
2. Trainer opens the **Trainer** view from the left sidebar.
3. System lists the sessions assigned to that trainer: class name, date, and start–finish time.
4. For each session, the system shows its **roster** — the member ids currently booked — and the **booked count**.
5. Trainer reads the roster to see who is expected at each session.

## Alternate flows
- **A1 — Session with no bookings:** a session assigned to the trainer that has no bookings appears in the list with an **empty roster and a count of 0** — it is still shown, because the trainer is assigned to it.
- **A2 — Admin reviews a trainer:** an admin may open the Trainer view too, but is not a trainer; they choose whose sessions to read in a **"Viewing trainer"** dropdown. The view is identical and equally read-only. _[Added 2026-09-22]_

_[Revised 2026-09-22] The former A1 (unknown trainer) and A2 (blank trainer id) are removed: the dropdown offers only trainers who exist, so neither is reachable from the UI. The API still answers `200 []` for an id that matches no session — see [trainer-view.md](../Feature/trainer-view.md)._

## Postconditions
- No data is changed — this is a **read-only** view. Bookings, sessions, and classes are untouched.
- The trainer sees exactly the sessions assigned to their id, each with an accurate roster and count consistent with current bookings.

## Rules referenced
- A session may have at most one trainer; the assignment is optional (see design; extra-feature backlog: Trainer view).
- Rosters are **derived** from current bookings — the member ids booked on the session (see design; mirrors the derived `spotsLeft`).
- Existing scheduling rules (single-day, working hours 06:00–22:00, duration 30 min–3 h) are unchanged by this feature (see UC-02).
- No real authentication: picking a user stands in for sign-in, and the menu hides pages rather than protecting them (see [ADR-0003](../../Architectural/ADR/0003-trainer-role-minimal-auth.md) and [acting-as-roles.md](../../Architectural/Design/acting-as-roles.md)). _[Revised 2026-09-22]_
