# Sample Seed Data

**Source of truth:** `api/src/seed.ts` · run with `npm run seed`

The seed is **deterministic** — fixed classes, fixed session datetimes, fixed
bookings — so every checkout, test run, and demo starts from identical data. The
generated database (`api/data/gym.sqlite`) is git-ignored and rebuilt from this
script (see [ADR-0001](../../Architectural/ADR/0001-sqlite-local-db-file.md)).

## Seeded classes & sessions

| Class | Session (UTC) | Capacity | Trainer | Notes |
|---|---|---|---|---|
| Yoga Flow | 2026-09-01 08:00 | 12 | `t-morgan` | Member `m1` is pre-booked here (11 spots left). |
| Yoga Flow | 2026-09-03 08:00 | 12 | `t-morgan` | No bookings — demonstrates an **empty roster**. |
| Spin | 2026-09-01 18:00 | 3 | `t-lee` | **Filled to capacity** — demonstrates the "Full" state. |
| Spin | 2026-09-02 18:00 | 10 | — | Unassigned — appears in no trainer's view. |
| HIIT | 2026-09-02 07:00 | 8 | — | |
| Pilates | 2026-09-04 09:00 | 10 | — | |

_[Added 2026-09-22] The trainer column was always seeded; it is listed here because
the web app's demo users must line up with it._

## Seeded bookings

- `m1` → first Yoga Flow session (so the app opens with one booking and Cancel).
- `other-1/2/3` → the small Spin session (0 spots left, shows **Full**).

## Demo users (the "Acting as" dropdown)

_[Added 2026-09-22]_ The web app offers a fixed list of users in
`web/src/users.ts`; picking one sets the id sent to the API. **The trainer ids
must match the `trainer` values above** — otherwise a trainer in the list sees no
sessions. Keep the two files in step.

| Id | Name | Role | In the seed |
|---|---|---|---|
| `m1` | Mia Chen | member | Pre-booked on the first Yoga session |
| `m2` | Zoe Park | member | No bookings — a fresh member |
| `t-morgan` | Morgan Diaz | trainer | Two Yoga sessions |
| `t-lee` | Lee Novak | trainer | The full Spin session |
| `a1` | Alex Rivera | admin | No booking data of their own |

The app opens as `m1`; pick **Zoe Park** to act as a member with no bookings. The
filler members `other-1/2/3` fill the small Spin session and are not selectable —
they exist only to make it full.

## Resetting

```bash
npm run seed     # rebuild api/data/gym.sqlite from scratch (drops existing rows)
```

Tests never touch this file — they open a fresh **in-memory** database per suite.
