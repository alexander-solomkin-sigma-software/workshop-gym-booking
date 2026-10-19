# Non-Functional Requirements — Gym Class Booking

> **Offline backup.** The source of truth is the Confluence page [NFR — Gym Class Booking](https://vs5-ssw.atlassian.net/wiki/spaces/~5a858650a0fcf74179510e1d/pages/1540098). Use this copy only when Confluence or the Atlassian MCP connector is unavailable. Copy of page version 1, taken 2026-10-19; see [`../README.md`](../README.md#offline-fallback).

**Date:** 2026-08-21 (baseline) | **Last revised:** 2026-09-29

## Revision History

| Date | Change | Rationale / source |
| --- | --- | --- |
| 2026-09-29 | Moved from repo `docs/Business/NFR/` to Confluence (now the source of truth) | Business layer lives in Confluence; downstream docs stay in the repo |
| 2026-08-26 | Added **UI styling** requirement: minimize custom CSS, use an out-of-the-box Tailwind (daisyUI) theme | [ui-styling design](../../Architectural/Design/ui-styling.md) |
| 2026-08-21 | Baseline approved | Initial baseline NFRs |

Kept intentionally light — this is a small, local, single-instance app used as a learning baseline.

| Area | Requirement |
| --- | --- |
| **Runtime** | Runs locally on Node ≥ 22 LTS (consistent major — native `better-sqlite3`); no external services, database server, or containers. |
| **Persistence** | A local SQLite DB file, seeded deterministically so every checkout starts from the same data. |
| **Setup** | One command (`npm run setup`) brings it up in under 5 minutes. |
| **Performance** | Instant for the seeded data volume (tens of classes/sessions); no performance tuning required. |
| **Simplicity** | Minimal dependencies; readable code over cleverness — it is meant to be extended by learners. |
| **Correctness** | Business rules (capacity, double-booking, cancellation) enforced in the API, covered by tests. |
| **Security** | No auth hardening; a simple member/admin distinction only. Not for production or real personal data. |
| **Portability** | Works on Windows, macOS, and Linux (LF line endings enforced). |
| **UI styling** `[Revised 2026-08-26]` | **Minimize custom CSS.** Use **Tailwind CSS + daisyUI** with an out-of-the-box theme; hand-written CSS only where the theme/utilities cannot express a need. See [ui-styling design](../../Architectural/Design/ui-styling.md). |
| **Accessibility / design** | Functional UI from a prebuilt theme; bespoke brand/visual design and deep a11y work remain out of scope. |
