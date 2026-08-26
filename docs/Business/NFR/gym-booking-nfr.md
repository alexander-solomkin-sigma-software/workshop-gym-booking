# Non-Functional Requirements — Gym Class Booking

**Date:** 2026-08-21 (baseline) | **Last revised:** 2026-08-21

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-08-21 | Baseline approved | Initial baseline NFRs |

Kept intentionally light — this is a small, local, single-instance app used as a learning baseline.

| Area | Requirement |
|---|---|
| **Runtime** | Runs locally on Node ≥ 22 LTS (consistent major — native `better-sqlite3`); no external services, database server, or containers. |
| **Persistence** | A local SQLite DB file, seeded deterministically so every checkout starts from the same data. |
| **Setup** | One command (`npm run setup`) brings it up in under 5 minutes. |
| **Performance** | Instant for the seeded data volume (tens of classes/sessions); no performance tuning required. |
| **Simplicity** | Minimal dependencies; readable code over cleverness — it is meant to be extended by learners. |
| **Correctness** | Business rules (capacity, double-booking, cancellation) enforced in the API, covered by tests. |
| **Security** | No auth hardening; a simple member/admin distinction only. Not for production or real personal data. |
| **Portability** | Works on Windows, macOS, and Linux (LF line endings enforced). |
| **Accessibility / design** | Minimal, functional UI; visual/brand design and a11y polish are out of scope. |
