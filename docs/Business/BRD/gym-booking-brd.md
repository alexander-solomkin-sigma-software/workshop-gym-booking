# Business Requirements — Gym Class Booking

**Date:** 2026-08-21 (baseline) | **Last revised:** 2026-08-21

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-08-21 | Baseline approved | Initial baseline scope |

## Product

A small web app for a single gym to run **class bookings**. Members see the upcoming class timetable and reserve a place; each class session has a limited capacity. Staff (admins) maintain the list of classes and their capacities.

## Users

- **Member** — browses the timetable, books a place in a session, cancels their own booking.
- **Admin** — creates and edits classes, schedules sessions, sets capacity.

## Goals

1. Let members find and book classes in a few clicks.
2. Never let a session be overbooked beyond its capacity.
3. Let members cancel and free their place for others.
4. Let admins keep the class list and capacities up to date.

## In scope (baseline)

- Browse the class timetable.
- Book a place in a session (capacity-limited, no double-booking).
- Cancel a booking.
- Admin management of classes, sessions, and capacity.

## Out of scope (baseline)

- Payments, memberships, and pricing.
- Authentication hardening / real accounts (a simple member/admin distinction is enough).
- Notifications (email/SMS), waitlists, recurring bookings, cancellation-window rules — see the extra-feature backlog.
- Deployment, production monitoring, and visual/brand design.

## Success criteria

- A member can book and cancel a place, and cannot book a full session or the same session twice.
- An admin can add a class and set its capacity, and the timetable reflects it.
- The app runs locally from a single command with seeded data.
