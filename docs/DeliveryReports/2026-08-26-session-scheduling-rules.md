# Delivery Status — 2026-08-26

**Milestone:** Manage classes — single-day session scheduling rules (F4 / UC-02 A5/A6 + same-day) · **Report style:** git-derived (done / verification / traceability)

## Summary

"Manage classes" session scheduling now enforces four rules on top of the
existing finish-after-start check: **same calendar day**, **working hours
06:00–22:00**, and **duration 30 min–3 h (inclusive)**. The schedule UI is now a
**date + start time + finish time** form, composed into `startsAt`/`endsAt` on
submit. The increment shipped as a docs commit followed by a code+tests commit,
and was independently re-verified here: `npm run seed`, `npm run build`, and
`npm test` are all green under Node 22, and every TF-04 / UC-02-A5/A6 acceptance
point maps to a passing automated test.

## Done

| Change | Area | Commit |
|---|---|---|
| Refine F4 / UC-02 for single-day + working-hours + duration rules (PDR named constants, UC-02 A5/A6, design constants table, TF-04, TC-11..15) | docs | `docs: single-day session scheduling rules (working hours + length) #` (`f469406`) |
| Enforce same-day / working-hours / duration in `scheduleSession` (named constants, service tests incl. inclusive boundaries, AdminPage date+start+finish form) | api/web | `feat(scheduling): enforce single-day, working-hours and duration rules #2` (`9eb5c05`) |

## Verification

Run independently under the app's target runtime (bash PATH pinned to the Node 22 install).

| Check | Result |
|---|---|
| Node version | **v22.3.0** |
| `npm run seed` | OK — seeded `api/data/gym.sqlite` |
| `npm run build` | OK — api `tsc` clean; web `tsc --noEmit` + `vite build` (34 modules, built in 2.92s) |
| `npm test` (Vitest) | **28 passed** (3 files: booking-service 6, class-service 15, app 7) |
| `npm test` (Playwright) | **1 passed** (e2e smoke: browse, book, cancel) |

`npm install` was **not** run, so the local self-dependency injection did not
recur. A scan of tracked files for prohibited external/product references found
no real occurrences; the only regex hit was a coincidental substring inside a
base64 `integrity` hash in `package-lock.json` — not a genuine reference.

## Requirement traceability

F4 (PDR) → **UC-02** main flow + alternate flows **A5** (working hours) / **A6**
(duration) + same-day rule → **TF-04** / **TC-11..15**. Rules live as named
constants in `api/src/services/class-service.ts` (`OPEN_TIME` 06:00, `CLOSE_TIME`
22:00, `MIN_DURATION_MIN` 30, `MAX_DURATION_MIN` 180), validated as-is on the
received timestamps and raising `ValidationError` → 400.

| Acceptance point (TF-04) | Covered by (passing test) |
|---|---|
| Same-day only — multi-day rejected (400) | `class-service.test.ts` › "rejects a session spanning two calendar days (400)" (asserts nothing saved) |
| Start before 06:00 rejected (400) | `class-service.test.ts` › "rejects a start before opening time (400)" |
| Finish after 22:00 rejected (400) | `class-service.test.ts` › "rejects a finish after closing time (400)" |
| Too short (< 30 min) rejected (400) | `class-service.test.ts` › "rejects a session shorter than the minimum duration (400)" |
| Too long (> 3 h) rejected (400) | `class-service.test.ts` › "rejects a session longer than the maximum duration (400)" |
| Inclusive boundaries accepted — 06:00, 22:00, exactly 30 min, exactly 3 h | `class-service.test.ts` › "accepts inclusive boundaries: 06:00 open edge, 22:00 close edge, 30 min, and 3 h" (asserts all three persist) |
| Valid single-day schedule persists and reaches the timetable | `class-service.test.ts` › "accepts a valid single-day session within working hours (30 min–3 h)"; `app.test.ts` › "admin can schedule a session with a finish time (201) and it reaches the timetable" |

The existing finish-after-start rule (UC-02 A4 / TF-03) remains covered by
`class-service.test.ts` › "rejects a finish time not after the start (400)" and
`app.test.ts` › "rejects scheduling when the finish is not after the start (400)".

## Status

**Done / Verified** — increment implemented, all builds and tests green under
Node 22, and every TF-04 (UC-02 A5/A6 + same-day) acceptance point traced to a
passing automated test.

## Notes / risks

- Rules are enforced in the service layer only; the Admin form composes the ISO
  timestamps from date + two time inputs and relies on the API for validation,
  surfacing the API error message on rejection. Same-day is additionally
  enforced structurally by the single date picker; the server check backstops
  direct API calls.
- Times are validated as-is on the received timestamps (timezone
  simplification) — no timezone resolution.
- Baseline caveats from 2026-08-21 still apply (no auth hardening;
  `better-sqlite3` native prebuilt binary per platform).
