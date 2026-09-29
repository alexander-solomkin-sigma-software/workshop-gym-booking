# Acting-as roles — a fixed user picker and role-gated navigation

**Date:** 2026-09-22 | **Last revised:** 2026-09-22

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-09-22 | Acting-as becomes a dropdown of hardcoded demo users with roles; the sidebar menu shows only the acting role's pages; the Manage-classes trainer field becomes a dropdown and each session row shows its assigned trainer | Demo clarity pass on the shipped UI; builds on [ui-layout.md](ui-layout.md) and [ADR-0003](../ADR/0003-trainer-role-minimal-auth.md) |
| 2026-09-22 | Review fixes: a role switch now also resets the picked page; the Timetable remounts per member and both pages ignore stale responses; "Viewing trainer" accessible name is `viewing trainer`; a Vitest drift guard ties `users.ts` to the seed | Code review of the acting-as increment |

## Problem

Identity was a **free-text field**: `member id` in the sidebar, swapped for
`trainer id` on the Trainer view. Three things went wrong with it.

1. **You had to know the seed to use the app.** Acting as a trainer meant typing
   `t-morgan`; a typo silently produced an empty screen indistinguishable from
   "this trainer has no sessions".
2. **Roles were invisible.** Every menu item was shown to everyone, so nothing in
   the UI connected *who you are* to *what you can do* — the one thing a role is
   for.
3. **Assigning a trainer was a second guess.** The Manage-classes schedule form
   took a free-text trainer id, unconnected to the ids you could act as, and the
   session list never showed the result — so you could not see what you had set.

## 1. A fixed list of demo users

`web/src/users.ts` holds the users, their display names, and their roles. It is
the single source for both the acting-as picker and the trainer choices on
Manage classes, so the trainer you assign is always one you can act as.

| Id | Name | Role | Why it is in the list |
|---|---|---|---|
| `m1` | Mia Chen | member | Has a seeded booking — opens on a Cancel action |
| `m2` | Zoe Park | member | No bookings — every session is free to book |
| `t-morgan` | Morgan Diaz | trainer | Two seeded Yoga sessions: one with a roster, one empty |
| `t-lee` | Lee Novak | trainer | One seeded Spin session, full |
| `a1` | Alex Rivera | admin | Manages classes |

The ids are **not** arbitrary: the trainer ids must match the `trainer` values in
`api/src/seed.ts`, or a trainer in this list sees nothing. Both files carry a
comment pointing at the other, and `api/src/demo-users.test.ts` imports the web
list and fails if a demo trainer has no seeded sessions or the member ids stop
matching (`m1` pre-booked, `m2` no bookings). _[Revised 2026-09-22]_

## 2. Role-gated navigation

`VIEWS_BY_ROLE` maps a role to the pages its menu offers:

| Role | Pages |
|---|---|
| member | Timetable |
| trainer | Timetable, Trainer |
| admin | Timetable, Admin, Trainer |

- The sidebar renders one menu item per **allowed** view, so a member simply has
  no Admin item — nothing is shown-but-disabled.
- _[Revised 2026-09-22]_ Switching user to a role that cannot see the picked page
  **resets the pick** to that role's first page, in the same change handler.
  Switching from Alex to Mia while Admin is open lands on the Timetable, and
  switching back to Alex stays on the Timetable instead of silently reopening
  Admin. The render still derives `allowed.includes(picked) ? picked :
  allowed[0]` as a defensive guard, so a page the role may not see is never shown.
- _[Added 2026-09-22]_ The Timetable is **remounted per member** (`key={user.id}`),
  so a switch starts empty rather than briefly showing the previous member's
  bookings and Cancel buttons. Both the Timetable and Trainer pages also ignore
  any response that is not the latest request, so a slow earlier load cannot
  overwrite a newer one.

**This is presentation only.** It hides pages; it does not protect them. The API
performs no authorization — `/api/admin/*` remains unguarded and any id may be
sent — exactly as [ADR-0003](../ADR/0003-trainer-role-minimal-auth.md) records.
Anyone with the API URL can still do anything.

## 3. Who the Trainer view shows

A trainer acts as themselves: the acting user's id *is* the trainer id.

An **admin** may open the Trainer view but is not a trainer, so a second sidebar
control appears for them alone — a "Viewing trainer" dropdown over the same
trainer list (accessible name `viewing trainer`, matching its visible label
_[Revised 2026-09-22]_), defaulting to the first trainer. It
renders only when an admin is on the Trainer view. `TrainerPage` is unchanged:
it still takes one `trainerId` prop and does not know who chose it.

## 4. Manage classes: trainer in, trainer out

- **Assigning** — the schedule form's free-text trainer input becomes a `<select>`
  over the trainer list with a leading `— no trainer —` option. Its empty value
  preserves the optional, nullable `sessions.trainer`; the client still posts
  `trainer.trim() || undefined` and the server's rules are untouched.
- **Showing** — each session row displays its assigned trainer as a small badge
  ("Morgan Diaz", or "No trainer"), resolving the stored id to a display name.
  The API already returned `trainer` on every session; only the web `SessionRow`
  type and the row markup needed it. Unknown ids — older rows written when the
  field was free text — render as the raw id rather than disappearing.

## Accessible names (changed)

Tests resolve these controls by accessible name, and two names moved:

| Control | Before | After |
|---|---|---|
| Acting-as identity | `member id` / `trainer id` (two inputs) | **`acting as`** (one select) |
| Trainer being viewed | — | **`viewing trainer`** (admin only) _[Revised 2026-09-22]_ |
| Trainer on schedule form | `trainer for new session of class N` | unchanged |

The `member id` accessible name required by [ui-layout.md](ui-layout.md) §3 is
**retired**; that requirement is superseded here.

## Testing

Covered by [TF-05](../../Testing/TestScenarios/TF-05-navigation-and-labels.md),
[TF-06](../../Testing/TestScenarios/TF-06-trainer-view.md), and rows TC-16, TC-17,
TC-19, TC-23, TC-24, TC-25, TC-26 in
[booking-checklist.md](../../Testing/TestCases/booking-checklist.md). The e2e
specs select a user instead of typing an id; `nav.spec` additionally asserts that
a member has no Admin or Trainer item, that the view falls back on a role change,
and that switching back does not reopen the hidden page. `smoke.spec` books as
`m2` but picks the first row still offering Book, so a dev DB dirtied by manual
testing does not break it. No API behaviour changed; the only API-side addition
is the `demo-users.test.ts` drift guard. _[Revised 2026-09-22]_

## No ADR warranted

This is a **UI refinement within an existing decision**, not a new one. The
identity model is unchanged: a bare id string, no accounts, no `trainers` table,
no authentication, no authorization. [ADR-0003](../ADR/0003-trainer-role-minimal-auth.md)
still governs it and carries a dated note pointing here. Constraining *which
strings* the UI offers, and *which menu items* it renders, introduces no new
technology and no architectural trade-off.

## Out of scope

Real authentication or accounts; any API-side authorization; editing a scheduled
session's trainer (the badge is read-only — reassignment would need a new
endpoint); per-role permissions finer than "which pages appear"; and preventing a
trainer or admin from booking a class as themselves.
