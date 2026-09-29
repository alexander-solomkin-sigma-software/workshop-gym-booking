# Business Requirements — Gym Class Booking

**Date:** 2026-08-21 (baseline) | **Last revised:** 2026-09-22

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-08-21 | Baseline approved | Initial baseline scope |
| 2026-09-22 | Users: Trainer role added and Admin assigns trainers; note that an "Acting as" dropdown switches demo users and the role gates the menu (not authentication) | Trainer view (UC-03) + [acting-as-roles.md](../../Architectural/Design/acting-as-roles.md) |

## Product

A small web app for a single gym to run **class bookings**. Members see the upcoming class timetable and reserve a place; each class session has a limited capacity. Staff (admins) maintain the list of classes and their capacities.

## Users

- **Member** — browses the timetable, books a place in a session, cancels their own booking.
- **Admin** — creates and edits classes, schedules sessions, sets capacity, assigns trainers.
- **Trainer** — reads the sessions they are assigned to and who is booked on each; changes nothing. _[Added 2026-09-22]_

_[Added 2026-09-22] The demo switches between these users with an **"Acting as"** dropdown, and the acting user's role decides which pages the menu offers. This demonstrates roles; it is not authentication, and the API enforces no authorization._

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
