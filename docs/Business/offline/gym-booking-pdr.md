# Product Definition Requirements — Gym Class Booking

> **Offline backup.** The source of truth is the Confluence page [PDR — Gym Class Booking](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1769473). Use this copy only when Confluence or the Atlassian MCP connector is unavailable. Copy of page version 1, taken 2026-10-19; see [`../README.md`](../README.md#offline-fallback).

**Date:** 2026-08-21 (baseline) | **Last revised:** 2026-09-29

## Revision History

| Date | Change | Rationale / source |
| --- | --- | --- |
| 2026-08-21 | Baseline approved | Initial baseline feature list |
| 2026-08-26 | F4 sessions now capture a start **and** a finish time (finish must be after start) | Extend "Manage classes" (UC-02) |
| 2026-08-26 | F4 sessions are single-day: schedule captures a **date + start time + finish time**; times within working hours (06:00–22:00); duration 30 min–3 h | Refine "Manage classes" session scheduling (UC-02) |
| 2026-09-29 | Moved from repo `docs/Business/PDR/` to Confluence (now the source of truth) | Business layer lives in Confluence; downstream docs stay in the repo |

## Baseline features

| # | Feature | User | Summary |
| --- | --- | --- | --- |
| F1 | Browse timetable | Member | List upcoming sessions (class name, date/time, capacity, spots left). |
| F2 | Book a class | Member | Reserve a place in a session if a spot is free; cannot double-book; cannot book a full session. |
| F3 | Cancel a booking | Member | Cancel own booking; the freed place becomes available again. |
| F4 | Manage classes | Admin | Create/edit a class (name, description) and schedule **single-day** sessions by picking a **date, start time, finish time**, and capacity. [Revised 2026-08-26] |

## Core entities (informative)

- **Class** — a type of class (e.g. "Yoga"), with a name and description.
- **Session** — a scheduled instance of a class running from a start time to a finish time **on a single calendar day**, with a capacity.
- **Booking** — a member's reserved place in a session.

## Rules

- A session's finish time must be after its start time.
- A session is **single-day**: its start and finish fall on the same calendar day (no multi-day sessions).
- A session's start and finish must fall within **working hours, 06:00–22:00** (`OPEN_TIME`–`CLOSE_TIME`).
- A session's **duration must be between 30 minutes and 3 hours, inclusive** (`MIN_DURATION_MIN`–`MAX_DURATION_MIN`).
- A session cannot hold more bookings than its capacity.
- A member cannot hold two bookings for the same session.
- Cancelling a booking frees the place immediately.

The working-hours and duration bounds are **named, configurable constants** (`OPEN_TIME` = 06:00, `CLOSE_TIME` = 22:00, `MIN_DURATION_MIN` = 30, `MAX_DURATION_MIN` = 180), not magic numbers. **Timezone simplification:** times are validated as-is on the received timestamps — a real product would resolve venue-local time, but this app compares the timestamps it is given.

_(Extra features — trainer view, waitlist, recurring bookings, cancellation-window — are in the repo's [docs/FunctionalRequirement/extra-feature-backlog.md](../../FunctionalRequirement/extra-feature-backlog.md).)_
