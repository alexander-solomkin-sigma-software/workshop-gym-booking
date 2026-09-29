# TF-06 — Trainer sees their sessions and rosters

**Design:** [trainer-view-design.md](../../Architectural/Design/trainer-view-design.md) · Covers UC-03 · Decision [ADR-0003](../../Architectural/ADR/0003-trainer-role-minimal-auth.md)

## Goal

Confirm a trainer, selected in the "Acting as" dropdown, sees exactly the sessions
assigned to them — each with the correct roster (booked member ids) and count —
and that an admin can read any trainer's roster. Read-only: no data is changed.

_[Revised 2026-09-22] The trainer is chosen from a dropdown rather than typed; the
former "unknown trainer id" step is no longer reachable from the UI — see
[acting-as-roles.md](../../Architectural/Design/acting-as-roles.md)._

## Preconditions

- App running via `npm run dev` with the seeded database.
- The seed assigns a trainer (e.g. `t-morgan` / **Morgan Diaz**) to some sessions
  and leaves others unassigned; at least one of the trainer's sessions has bookings
  and (ideally) one has none.

## Steps

1. Open the web app; select **Morgan Diaz** in the **"Acting as"** dropdown.
2. Select the **Trainer** view from the left sidebar.
3. Read the listed sessions: each shows class name, date, start–finish, roster, and count.
4. Select **Alex Rivera (admin)** in the "Acting as" dropdown — the Trainer view stays open.
5. In the **"Viewing trainer"** dropdown, choose **Lee Novak**; observe the view.

## Expect

- After step 3: only sessions whose `trainer` is `t-morgan` are listed, ordered by
  start time; each row shows the **booked member ids** and a **count** equal to the
  roster length. A seeded assigned session with no bookings appears with an **empty
  roster and count 0**. `GET /api/trainer/t-morgan/sessions` returns `200` with the
  matching sessions and rosters.
- After step 4: the menu gains **Admin**, the Trainer view remains selected, and a
  **"Viewing trainer"** dropdown appears in the sidebar.
- After step 5: the view lists Lee Novak's full Spin session with its three booked
  members. No error is shown; no data changed anywhere.

---

# TF-07 — Unknown / blank trainer yields empty, sessions unaffected

_[Revised 2026-09-22] This scenario is now **API-only**. The UI no longer lets you
name a trainer that does not exist, so the empty-state half is dropped; the
endpoint's behaviour is unchanged and still worth checking directly._

## Goal

Confirm that an unknown or blank trainer id returns an empty list (not a `404`),
that sessions with no trainer never appear, and that the feature leaves the
booking/scheduling behaviour untouched.

## Preconditions

- Seeded app; at least one session has `trainer = NULL` (no trainer assigned).

## Steps

1. Call `GET /api/trainer/ghost/sessions` directly.
2. Confirm a session known to have no trainer does not appear for any trainer in
   the "Viewing trainer" dropdown.
3. Verify the Timetable and Admin views behave exactly as before.

## Expect

- The API returns `200 []` (never `404`) for an id that matches no session.
- A `trainer = NULL` session appears in **no** trainer's list.
- Booking, cancelling, capacity, and scheduling behave exactly as in the baseline
  scenarios (TF-01…TF-05) — the Trainer view is read-only.
