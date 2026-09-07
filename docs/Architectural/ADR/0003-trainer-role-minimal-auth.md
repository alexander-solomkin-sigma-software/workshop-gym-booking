# ADR-0003: Trainer as an id with no real authentication

- **Status**: Accepted
- **Date**: 2026-08-26
- **Decision makers**: Gym Booking team

## Context

The Trainer-view increment (see
[trainer-view-design.md](../Design/trainer-view-design.md) and UC-03) adds a view
where a trainer sees the sessions assigned to them and each session's roster. This
raises the question of **how a trainer is identified and authenticated**.

The baseline already sidesteps real auth for members: identity is a free-text
`member_id` string, and the web app has an "Acting as" field that lets you switch
who you are with no login (see the baseline design; there is no `members` table).
The NFR explicitly keeps auth out of scope for this learning app, and the backlog
entry for Trainer view says: *"Keep auth minimal — a trainer identifier is enough;
no login hardening."*

Options considered:

- **Real authentication (accounts, login, sessions/roles)** — realistic, but pulls
  in password storage, session management, and a role model. It contradicts the
  NFR (no auth hardening) and the "small, self-contained baseline" intent, and it
  dwarfs the feature it would guard.
- **A `trainers` table with a foreign key from `sessions`** — normalised, but adds
  a table and referential machinery for what is, in this app, just a label. It is
  inconsistent with how members are modelled (a bare id string) and buys nothing
  the feature needs.
- **A trainer id string, reusing the acting-as pattern** — a nullable
  `sessions.trainer` id and a trainer "acting as" field identical to the member
  field. Consistent with the existing member treatment, minimal, and enough to
  demonstrate the view as different trainers.

## Decision

Model a trainer as an **id string with no real authentication**, reusing the
existing **acting-as** pattern.

- A session carries an **optional, nullable** `trainer` id column
  (`sessions.trainer`); there is **no `trainers` table** and no accounts.
- The web app identifies the acting trainer with an **"Acting as" trainer id
  field**, identical in behaviour and captioning to the member field — a demo
  stand-in for sign-in, with a helper note that there is no real authentication.
- `GET /api/trainer/:trainerId/sessions` is scoped purely by matching
  `sessions.trainer` to the supplied id; an unknown id simply returns an empty
  list. No authorization check beyond that match is performed.

## Consequences

- **Consistency** — trainers and members are modelled the same way (a bare id
  string switchable via "Acting as"), so the mental model and the UI pattern are
  reused, not reinvented.
- **Minimal footprint** — a single nullable column and one read endpoint; no new
  table, no login flow, no session/role plumbing. The change is additive and
  cannot destabilise the existing invariants.
- **No security boundary** — anyone can act as any trainer and read that trainer's
  roster; there is no protection of member ids in a roster. This is acceptable for
  a local, single-user learning app (per NFR) and is explicitly **not** suitable
  for production, where real authentication and authorization would be required.
- **Clear upgrade path** — if real auth is later needed, `sessions.trainer` can
  become a foreign key to a `trainers`/`users` table and the acting-as field can
  be replaced by an authenticated session, without changing the read model's shape.
