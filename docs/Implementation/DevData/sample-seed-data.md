# Sample Seed Data

**Source of truth:** `api/src/seed.ts` · run with `npm run seed`

The seed is **deterministic** — fixed classes, fixed session datetimes, fixed
bookings — so every checkout, test run, and demo starts from identical data. The
generated database (`api/data/gym.sqlite`) is git-ignored and rebuilt from this
script (see [ADR-0001](../../Architectural/ADR/0001-sqlite-local-db-file.md)).

## Seeded classes & sessions

| Class | Session (UTC) | Capacity | Notes |
|---|---|---|---|
| Yoga Flow | 2026-09-01 08:00 | 12 | Member `m1` is pre-booked here (11 spots left). |
| Yoga Flow | 2026-09-03 08:00 | 12 | |
| Spin | 2026-09-01 18:00 | 3 | **Filled to capacity** — demonstrates the "Full" state. |
| Spin | 2026-09-02 18:00 | 10 | |
| HIIT | 2026-09-02 07:00 | 8 | |
| Pilates | 2026-09-04 09:00 | 10 | |

## Seeded bookings

- `m1` → first Yoga Flow session (so the app opens with one booking and Cancel).
- `other-1/2/3` → the small Spin session (0 spots left, shows **Full**).

The web app defaults its **member id** to `m1`; change it (e.g. to `zoe`) to act
as a fresh member with no bookings.

## Resetting

```bash
npm run seed     # rebuild api/data/gym.sqlite from scratch (drops existing rows)
```

Tests never touch this file — they open a fresh **in-memory** database per suite.
