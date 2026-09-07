# Design — Gym Class Booking (baseline)

**Date:** 2026-08-21 (baseline) | **Last revised:** 2026-08-26

## Revision History

| Date | Change | Rationale / source |
|---|---|---|
| 2026-08-21 | Baseline design | Derived from BRD/PDR/NFR + UC-01/UC-02 |
| 2026-08-26 | Sessions gain a finish time (`ends_at`); schedule API validates `endsAt > startsAt`; timetable shows start–finish | Extend "Manage classes" (UC-02 A4 / PDR F4) |
| 2026-08-26 | Sessions are single-day; schedule validates working hours (06:00–22:00) and duration (30 min–3 h) via named constants; schedule UI captures date + start time + finish time | Refine "Manage classes" (UC-02 A5/A6 / PDR F4) |

## Problem

Members need to browse a class timetable and reserve a limited place; admins
need to keep classes and capacities current. The hard part is not the UI — it
is enforcing three invariants **consistently on the server**, regardless of
which client calls: a session is never overbooked, a member never holds two
bookings for the same session, and capacity is never set below what is already
booked. Cancelling must free a place immediately.

Traces to: BRD goals 1–4 · PDR F1–F4 · UC-01 (member) · UC-02 (admin).

## Data model

Three tables in a local SQLite database (see [ADR-0001](../ADR/0001-sqlite-local-db-file.md)).

```mermaid
erDiagram
    CLASSES ||--o{ SESSIONS : "scheduled as"
    SESSIONS ||--o{ BOOKINGS : "reserved by"
    CLASSES {
        int    id PK
        string name
        string description
    }
    SESSIONS {
        int    id PK
        int    class_id FK
        string starts_at "ISO 8601"
        string ends_at   "ISO 8601, > starts_at, same day, in hours, 30m-3h"
        int    capacity  "CHECK > 0"
    }
    BOOKINGS {
        int    id PK
        int    session_id FK
        string member_id
        string created_at
    }
```

- **classes** — a type of class (name + description).
- **sessions** — a scheduled instance of a class running from `starts_at` to
  `ends_at`, with a capacity. [Revised 2026-08-26] `ends_at` is stored as an
  ISO 8601 string alongside `starts_at`. A session must be **single-day** and
  reasonable: `ends_at` strictly after `starts_at`, both timestamps on the **same
  calendar day**, both within **working hours** (`OPEN_TIME`–`CLOSE_TIME`), and a
  **duration** between `MIN_DURATION_MIN` and `MAX_DURATION_MIN`. All of these are
  enforced in the service layer (see API surface). Existing invariants (capacity,
  no double-book) are unchanged.
- **bookings** — a member's place in a session. `UNIQUE (session_id, member_id)`
  makes double-booking impossible at the storage layer as well as the service.

There is no `members` table: identity is a free-text `member_id` string (no auth
hardening — see NFR). `spots left` is **derived** (`capacity − count(bookings)`),
never stored, so it cannot drift.

## API surface

All rules live in the **service layer**; routes only validate shape and map
errors to status codes (`400` bad input, `404` not found, `409` conflict).

| Method | Path | Actor | Purpose |
|---|---|---|---|
| GET | `/api/timetable?memberId=` | Member | Sessions annotated with `spotsLeft`, `isFull`, `myBookingId`. |
| POST | `/api/bookings` | Member | Book `{ sessionId, memberId }` → `201`; `409` if full or already booked. |
| DELETE | `/api/bookings/:id?memberId=` | Member | Cancel own booking → `204`; `404` if not the member's. |
| GET | `/api/admin/classes` | Admin | Classes with their sessions and booking counts. |
| POST | `/api/admin/classes` | Admin | Create `{ name, description }` → `201`; `400` if name blank. |
| PUT | `/api/admin/classes/:id` | Admin | Edit name/description. |
| POST | `/api/admin/sessions` | Admin | Schedule `{ classId, startsAt, endsAt, capacity }`; `400` if `endsAt` missing/not after `startsAt`, not same-day, outside working hours, or duration out of range. [Revised 2026-08-26] |
| PUT | `/api/admin/sessions/:id/capacity` | Admin | Set capacity; `409` if below current bookings. |

Layering (per Coding-Conventions): **routes → services → data**. Rules never
leak into routes or the UI.

`scheduleSession(classId, startsAt, endsAt, capacity)` keeps all validation in the
service: `startsAt`/`endsAt` non-blank, `capacity` a positive integer, and the
single-day scheduling rules below — otherwise a `ValidationError` (400) and
nothing is saved. [Revised 2026-08-26]

### Session scheduling constants and validation [Revised 2026-08-26]

The scheduling bounds are **named, configurable constants** (not magic numbers),
kept together so a venue can tune them:

| Constant | Value | Meaning |
|---|---|---|
| `OPEN_TIME` | `06:00` | Earliest a session may start/finish (working hours open). |
| `CLOSE_TIME` | `22:00` | Latest a session may start/finish (working hours close). |
| `MIN_DURATION_MIN` | `30` | Minimum session length, minutes (inclusive). |
| `MAX_DURATION_MIN` | `180` | Maximum session length, minutes (inclusive, = 3 h). |

`scheduleSession` validates, in addition to the existing checks, that:

1. **Same calendar day** — `startsAt` and `endsAt` fall on the same date (no
   multi-day / date-range sessions).
2. **Finish after start** — `endsAt` strictly after `startsAt` (existing rule).
3. **Working hours** — both `startsAt` and `endsAt` time-of-day lie within
   `OPEN_TIME`–`CLOSE_TIME`.
4. **Duration** — `endsAt − startsAt` is between `MIN_DURATION_MIN` and
   `MAX_DURATION_MIN`, inclusive.

Any failure raises `ValidationError` (400) with a clear message and saves nothing.

**Timezone simplification:** the rules are validated **as-is on the received
timestamps** — the service reads calendar day, time-of-day, and elapsed minutes
straight from the ISO strings it is given. A real product would resolve these in
the venue's local timezone; here we deliberately do not, so behaviour is simple
and deterministic to test. This is stated explicitly so tests pin it down.

_Implemented: `scheduleSession` in `api/src/services/class-service.ts` enforces
all four rules using the `OPEN_TIME` / `CLOSE_TIME` / `MIN_DURATION_MIN` /
`MAX_DURATION_MIN` constants defined there; the Admin schedule form
(`web/src/pages/AdminPage.tsx`) captures a date + start time + finish time._

_No ADR is warranted: this is a set of input-validation rules plus a form change,
built on the existing schema and service pattern — not a new architectural
decision or trade-off. (The earlier `ends_at` field addition likewise needed none.)_

## Web routes

A single-page app with two views selected from a **left sidebar menu** (no router
needed at this size; navigation and layout detail in [ui-layout.md](ui-layout.md)):

- **Timetable** — lists sessions with their **start–finish** time (e.g.
  `Tue Sep 1, 08:00–09:00`); a Book button on free sessions, Cancel on the
  member's own booking; full sessions show a "Full" tag and disable Book.
  [Revised 2026-08-26]
- **Admin** — create a class, schedule sessions, and adjust capacity inline.
  [Revised 2026-08-26] The schedule form captures a **date**, a **start time**,
  and a **finish time** (three inputs: a `date` input plus two `time` inputs),
  replacing the two `datetime-local` inputs. Because start and finish share one
  date picker, a session is **structurally single-day** in the UI; the client
  composes `startsAt`/`endsAt` ISO timestamps from `date + startTime` and
  `date + finishTime` and posts them unchanged. The server still re-validates all
  rules — the UI holds no business logic.

A `member id` field (labelled "Acting as", in the sidebar) stands in for auth so
the flows can be demonstrated as different members. The UI holds **no business logic** — it renders API results
and surfaces API error messages.

## Edge cases

| Case | Handling |
|---|---|
| Session full | `book()` throws `ConflictError` (409); UI disables Book and shows "Full". |
| Double-book | `book()` rejects if a booking already exists (409); `UNIQUE` backstops it. |
| Cancel frees a place | `cancel()` deletes the row; the derived `spotsLeft` rises immediately. |
| Cancel someone else's booking | `404` — a booking is only cancellable by its own `memberId`. |
| Capacity below bookings | `setCapacity()` throws `ConflictError` (409); equal-to-booked is allowed. |
| Invalid input | Blank name / non-positive capacity / missing `startsAt` → `ValidationError` (400). |
| Finish not after start | `scheduleSession()` throws `ValidationError` (400) when `endsAt` is missing or `endsAt <= startsAt`; nothing is saved. [Revised 2026-08-26] |
| Not same calendar day | `scheduleSession()` throws `ValidationError` (400) when `startsAt` and `endsAt` fall on different dates; nothing is saved. [Added 2026-08-26] |
| Outside working hours | `scheduleSession()` throws `ValidationError` (400) when start or finish time-of-day is outside `OPEN_TIME`–`CLOSE_TIME`; nothing is saved. [Added 2026-08-26] |
| Duration out of range | `scheduleSession()` throws `ValidationError` (400) when the session is shorter than `MIN_DURATION_MIN` or longer than `MAX_DURATION_MIN`; nothing is saved. [Added 2026-08-26] |

## Testing approach

- **Vitest** unit/service tests against an in-memory SQLite DB: capacity limit,
  double-book rejection, cancel-frees-place, admin CRUD, capacity-not-below-bookings.
- **Vitest + supertest** at the HTTP boundary: status codes for the seeded app.
- **Playwright** one e2e smoke: browse → book → cancel happy path.

See [test-strategy](../../Testing/Strategy/test-strategy.md).

## Out of scope (baseline)

Payments/memberships, real authentication, notifications, waitlist, recurring
bookings, cancellation-window rules (see the extra-feature backlog), deployment,
and visual/brand design.
