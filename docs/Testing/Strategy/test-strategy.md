# Test Strategy — Gym Class Booking

**Date:** 2026-08-21 (baseline) | **Last revised:** 2026-08-21

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-08-21 | Baseline strategy | Matches the baseline test suite |

## Intent

The invariants are the product risk, so testing concentrates **where the rules
live — the API service layer** — with a thin layer of HTTP and one end-to-end
smoke on top. A doc may only claim "tested" once `npm test` is green.

## Layers

| Layer | Tool | Scope | Where |
|---|---|---|---|
| Unit / service | **Vitest** | Business rules against an in-memory SQLite DB: capacity, double-book, cancel, admin CRUD, capacity-not-below-bookings | `api/src/**/*.test.ts` |
| API (HTTP) | **Vitest + supertest** | Route wiring and status codes over the seeded app (200/201/204/400/409) | `api/src/app.test.ts` |
| End-to-end | **Playwright** | One happy-path smoke: browse → book → cancel, real API + web | `web/e2e/smoke.spec.ts` |

## Coverage intent

- **Every business rule** has a direct unit test asserting the outcome and the
  HTTP status it maps to.
- Both **positive and negative** paths are covered (e.g. book succeeds *and* the
  full/double-book/foreign-cancel refusals).
- The e2e smoke is deliberately **one** flow — it proves the wiring end to end;
  breadth of rules stays at the fast unit layer.

## Running

```bash
npm test        # Vitest (api) + Playwright (web)
```

Tests are colocated as `*.test.ts` and follow a **test-first** cadence: write the
failing test, implement, confirm green.
