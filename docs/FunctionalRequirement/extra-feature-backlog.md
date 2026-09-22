# Extra-feature backlog

Candidate features that **extend** the baseline app. Each is sized to be specified *and* implemented within a short session by following the full artifact chain (use case → design + ADR → plan → code + tests → feature description → test scenarios).

> **How to use this in the workshop:** pick **ONE** feature from **"Available to build"** below and thread that *same* feature through **every** lab. Add its documents alongside the baseline — **never rewrite the baseline docs**. **Trainer view is already implemented** (see the bottom section) — it is your worked reference, **not** a feature to pick.

## Available to build — pick ONE

### Waitlist
When a session is full, let a member **join a waitlist** instead of being turned away. When someone cancels, the first person on the waitlist is offered the freed place (auto-promote, or mark as available).
**Out of scope:** notifications, timed offer windows.

### Recurring bookings
Let an admin schedule a class as a **weekly recurring session** (generate N weeks of sessions), and/or let a member book a whole recurring series at once.
**Out of scope:** complex recurrence rules (monthly, exceptions, holidays).

### Cancellation-window rule
Enforce a rule that a member **cannot cancel within N hours** of a session start (configurable). Cancellation attempts inside the window are refused with a clear message.
**Out of scope:** refunds/penalties, per-class overrides.

## Already implemented — your reference (do NOT pick this)

### Trainer view ✅ built
A lightweight **trainer** role and a page where a trainer sees the sessions they are assigned to and the roster (members booked) for each; minimal auth (a trainer identifier, no login hardening).
**This feature is fully built as the workshop's golden-path worked example** — the "what good looks like" set you copy from in each lab. Do **not** choose it as your increment. Its artifacts:
- `Usecase/UC-03-trainer-view.md`
- `Architectural/Design/trainer-view-design.md` + `Architectural/ADR/0003-trainer-role-minimal-auth.md`
- `Implementation/Plans/2026-08-26-trainer-view-plan.md`
- `Feature/trainer-view.md`
- `Testing/TestScenarios/TF-06-trainer-view.md`
