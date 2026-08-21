# Product Definition Requirements — Gym Class Booking

**Date:** 2026-08-21 (baseline) | **Last revised:** 2026-08-21

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-08-21 | Baseline approved | Initial baseline feature list |

## Baseline features

| # | Feature | User | Summary |
|---|---|---|---|
| F1 | Browse timetable | Member | List upcoming sessions (class name, date/time, capacity, spots left). |
| F2 | Book a class | Member | Reserve a place in a session if a spot is free; cannot double-book; cannot book a full session. |
| F3 | Cancel a booking | Member | Cancel own booking; the freed place becomes available again. |
| F4 | Manage classes | Admin | Create/edit a class (name, description) and schedule sessions with a capacity. |

## Core entities (informative)

- **Class** — a type of class (e.g. "Yoga"), with a name and description.
- **Session** — a scheduled instance of a class at a date/time with a capacity.
- **Booking** — a member's reserved place in a session.

## Rules

- A session cannot hold more bookings than its capacity.
- A member cannot hold two bookings for the same session.
- Cancelling a booking frees the place immediately.

_(Extra features — trainer view, waitlist, recurring bookings, cancellation-window — are in `../../FunctionalRequirement/extra-feature-backlog.md`.)_
