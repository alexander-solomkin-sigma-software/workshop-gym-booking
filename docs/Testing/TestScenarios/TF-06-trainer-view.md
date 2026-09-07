# TF-06 — Trainer sees their sessions and rosters

**Design:** [trainer-view-design.md](../../Architectural/Design/trainer-view-design.md) · Covers UC-03 · Decision [ADR-0003](../../Architectural/ADR/0003-trainer-role-minimal-auth.md)

## Goal

Confirm a trainer, acting as their trainer id, sees exactly the sessions assigned
to them — each with the correct roster (booked member ids) and count — and that an
unknown trainer id shows an empty state. Read-only: no data is changed.

## Preconditions

- App running via `npm run dev` with the seeded database.
- The seed assigns a trainer (e.g. `t-morgan`) to some sessions and leaves others
  unassigned; at least one of the trainer's sessions has bookings and (ideally) one
  has none.

## Steps

1. Open the web app; select the **Trainer** view from the left sidebar.
2. Set the **trainer id** field (labelled "Acting as", in the sidebar) to `t-morgan`.
3. Read the listed sessions: each shows class name, date, start–finish, roster, and count.
4. Change the trainer id field to `nobody` (an unassigned id).
5. Observe the view.

## Expect

- After step 3: only sessions whose `trainer` is `t-morgan` are listed, ordered by
  start time; each row shows the **booked member ids** and a **count** equal to the
  roster length. A seeded assigned session with no bookings appears with an **empty
  roster and count 0**. `GET /api/trainer/t-morgan/sessions` returns `200` with the
  matching sessions and rosters.
- After step 5: the view shows a **"no sessions assigned"** empty state;
  `GET /api/trainer/nobody/sessions` returns `200 []`. No error is shown; no data
  changed anywhere.

---

# TF-07 — Unknown / blank trainer yields empty, sessions unaffected

## Goal

Confirm that an unknown or blank trainer id returns an empty list (not a `404`),
that sessions with no trainer never appear, and that the feature leaves the
booking/scheduling behaviour untouched.

## Preconditions

- Seeded app; at least one session has `trainer = NULL` (no trainer assigned).

## Steps

1. On the Trainer view, set the trainer id to an unassigned id and to blank in turn.
2. Call `GET /api/trainer/ghost/sessions` directly.
3. Confirm a session known to have no trainer does not appear for any trainer id.
4. Verify the Timetable and Admin views behave exactly as before.

## Expect

- The Trainer view shows the empty state for both the unknown and the blank id.
- The API returns `200 []` (never `404`) for an id that matches no session.
- A `trainer = NULL` session appears in **no** trainer's list.
- Booking, cancelling, capacity, and scheduling behave exactly as in the baseline
  scenarios (TF-01…TF-05) — the Trainer view is read-only.
