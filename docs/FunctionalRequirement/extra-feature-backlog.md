# Extra-feature backlog

Candidate features that **extend** the baseline app. Each is sized to be specified *and* implemented within a short session by following the full artifact chain (use case → design + ADR → plan → code + tests → feature description → test scenarios). Pick one and add its documents alongside the baseline — never rewrite the baseline docs.

## Trainer view
Add a lightweight **trainer** role and a page where a trainer sees the sessions they are assigned to and the roster (members booked) for each. Keep auth minimal — a trainer identifier is enough; no login hardening.
**Out of scope:** trainer self-scheduling, messaging members, payroll.

## Waitlist
When a session is full, let a member **join a waitlist** instead of being turned away. When someone cancels, the first person on the waitlist is offered the freed place (auto-promote, or mark as available).
**Out of scope:** notifications, timed offer windows.

## Recurring bookings
Let an admin schedule a class as a **weekly recurring session** (generate N weeks of sessions), and/or let a member book a whole recurring series at once.
**Out of scope:** complex recurrence rules (monthly, exceptions, holidays).

## Cancellation-window rule
Enforce a rule that a member **cannot cancel within N hours** of a session start (configurable). Cancellation attempts inside the window are refused with a clear message.
**Out of scope:** refunds/penalties, per-class overrides.
