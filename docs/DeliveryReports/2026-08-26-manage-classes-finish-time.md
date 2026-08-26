# Delivery Status — 2026-08-26

**Milestone:** Manage classes — session finish time (F4 / UC-02 A4) · **Report style:** git-derived (done / verification / traceability)

## Summary

Scheduling a session now captures a **finish time** (`endsAt`) alongside the
start, with the rule that finish must be **strictly after** start. The increment
was shipped as a docs commit followed by a code+tests commit, and independently
re-verified here: `npm run seed`, `npm run build`, and `npm test` are all green
under Node 22, and every TF-03 / UC-02-A4 acceptance point maps to a passing
automated test.

## Done

| Change | Area | Commit |
|---|---|---|
| Extend F4 / UC-02 for a session finish time (PDR rule, UC-02 A4, design, TF-03, TC-09/10) | docs | `docs: schedule sessions with start + finish time (Manage classes) #` (`c6c9117`) |
| Implement `endsAt` end-to-end: db CHECK, service validation, route, seed, web form + start–finish display, tests | api/web | `feat(booking): schedule sessions with a finish time #` (`4d09f4f`) |

## Verification

Run independently under the app's target runtime (bash PATH pinned to the Node 22 install).

| Check | Result |
|---|---|
| Node version | **v22.3.0** |
| `npm run seed` | OK — seeded `api/data/gym.sqlite` |
| `npm run build` | OK — api `tsc` clean; web `tsc --noEmit` + `vite build` (34 modules, built in 2.71s) |
| `npm test` (Vitest) | **21 passed** (3 files: booking-service 6, class-service 8, app 7) |
| `npm test` (Playwright) | **1 passed** (e2e smoke: browse, book, cancel) |

`npm install` was **not** run, so the local self-dependency injection did not
recur. A scan of tracked files found no stray external references; the only regex
hit was a coincidental substring inside a base64 `integrity` hash in
`package-lock.json` — not a real occurrence.

## Requirement traceability

F4 (PDR) → **UC-02** main flow + alternate flow **A4** → **TF-03** / **TC-09/TC-10**:

| Acceptance point (TF-03 / UC-02-A4) | Covered by (passing test) |
|---|---|
| Schedule with a valid finish time persists and returns start–finish | `class-service.test.ts` › "schedules a session with a valid finish time and returns start–finish"; `app.test.ts` › "admin can schedule a session with a finish time (201) and it reaches the timetable" |
| Finish **equal to** start is rejected (400) | `class-service.test.ts` › "rejects a finish time not after the start (400)" (equal case) |
| Finish **before** start is rejected (400) | `class-service.test.ts` › same test (before case); `app.test.ts` › "rejects scheduling when the finish is not after the start (400)" |
| **Missing** finish is rejected (400) | `class-service.test.ts` › same test (missing case); `app.test.ts` › same HTTP test (missing `endsAt`) |
| Nothing is saved on rejection | `class-service.test.ts` (sessions length 0); `app.test.ts` (Barre class has 0 sessions) |
| Timetable shows the session with its start–finish range | `app.test.ts` › "GET /api/timetable includes each session endsAt" and the schedule-reaches-timetable test asserting both `startsAt` and `endsAt` |

Enforcement lives in `api/src/services/class-service.ts` (`scheduleSession`
rejects missing `endsAt` or `Date.parse(endsAt) <= Date.parse(startsAt)` with a
`ValidationError` → 400), backstopped by a DB `CHECK (ends_at > starts_at)`.

## Status

**Done / Verified** — increment implemented, all builds and tests green under
Node 22, and every TF-03 acceptance point traced to a passing automated test.

## Notes / risks

- Validation is enforced in the service layer with a DB CHECK backstop; the web
  form supplies a `datetime-local` finish input but relies on the API for the
  rule.
- Baseline caveats from 2026-08-21 still apply (no auth hardening;
  `better-sqlite3` native prebuilt binary per platform).
