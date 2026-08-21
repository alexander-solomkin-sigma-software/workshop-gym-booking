# Release 0.1 — Baseline Plan

**Date:** 2026-08-21 · **Scope:** planning only (deployment is out of scope)

## Goal

Ship the runnable baseline that members and admins can use locally: browse and
book classes, cancel, and manage classes/capacity — with the invariants enforced
server-side and a green test suite.

## In this release

| Item | Feature | Issue | Status |
|---|---|---|---|
| Browse timetable | F1 | #2 | Done |
| Book a class (capacity + no double-book) | F2 | #2 | Done |
| Cancel a booking (frees place) | F3 | #2 | Done |
| Manage classes / schedule sessions / set capacity | F4 | #2 | Done |
| Web UI (timetable + admin) | F1–F4 | #3 | Done |
| Test suite (Vitest + Playwright smoke) | — | #4 | Done (green) |
| One-command setup + seed | NFR | #2 | Done |

## Cut from 0.1 (backlog)

Trainer view, waitlist, recurring bookings, cancellation-window rules,
notifications, payments/memberships, real authentication, deployment, and visual
design. See the [extra-feature backlog](../../FunctionalRequirement/extra-feature-backlog.md).

## Acceptance

- `npm run setup && npm run dev` serves the app; browse/book/cancel and admin
  manage all work against the seeded data.
- A member cannot book a full session or the same session twice; cancelling frees
  the place; capacity cannot drop below current bookings.
- `npm test` is green.

## Risks / notes

- `better-sqlite3` is a native module — relies on a prebuilt binary per platform.
- No auth hardening: `member id` is a plain string, suitable for a local learning
  baseline only, not production or real personal data.
