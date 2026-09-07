# Delivery Status — 2026-08-26

**Milestone:** Trainer view (golden-path worked example) — sessions gain an optional
`trainer`; `GET /api/trainer/:trainerId/sessions` returns that trainer's sessions
each with a derived roster (booked member ids + count); a new **Trainer** sidebar
view with an "Acting as" trainer field; minimal auth (ADR-0003) · UC-03 / TF-06 /
TF-07 / TC-19..24 · **Report style:** git-derived (done / verification / traceability)

## Summary

Trainers can now see, before a session, **which sessions they run** and **who is
booked**. The `sessions` table gained a single additive, **nullable** `trainer TEXT`
column; the API exposes `GET /api/trainer/:trainerId/sessions`, whose one rule lives
in the service layer (`trainer-service.getTrainerSessions`) — it returns only the
acting trainer's sessions, ordered by start time, each with a **roster derived from
`bookings`** and a matching count. Unknown or blank trainer ids return `200 []`
(never `404`); sessions with no trainer appear in no trainer's list. The web app
gained a **Trainer** sidebar item and a read-only page driven by an "Acting as"
trainer id field (accessible name `trainer id`), mirroring the member field; the
Admin schedule form gained an optional **Trainer** field. Read-only — no bookings,
sessions, or classes change. The increment shipped as four commits (docs → api →
web → docs) and was independently re-verified here: `npm run seed`, `npm run build`,
and `npm test` are green under Node 22, including the new `trainer-service.test.ts`,
the trainer cases in `app.test.ts`, and the `trainer.spec` e2e.

## Done

| Change | Area | Commit |
|---|---|---|
| Golden-path documentation set: UC-03, trainer-view design, ADR-0003 (trainer-role minimal auth), and the implementation plan | docs | `docs: Trainer-view golden path — requirements, design, ADR-0003, plan #5` (`57de766`) |
| Nullable `trainer` column on `sessions`; `getTrainerSessions` service (trainer-only, ordered, derived roster + count); `GET /api/trainer/:trainerId/sessions` route; optional `trainer` accepted on scheduling; seed assigns trainers; unit + api tests | api | `feat(api): trainer sessions endpoint + optional session trainer #5` (`dec8e55`) |
| Trainer sidebar item and read-only `TrainerPage` (roster + count, empty state); "Acting as" trainer field (accessible name `trainer id`); optional Trainer field on the Admin schedule form | web | `feat(web): trainer view, sidebar item, and acting-as field #5` (`fbeef90`) |
| Feature description, `trainer.spec` e2e smoke, and living-doc updates (TF-06/TF-07, TC-19..24) | docs | `docs(trainer): feature description, e2e smoke, living-doc updates #5` (`405b6ec`) |

## Verification

Run independently under the app's target runtime (bash `PATH` pinned to the Node 22
install). **`npm install` was NOT run.**

| Check | Result |
|---|---|
| Node version | **v22.15.0** |
| `npm run seed` | OK — seeded `api/data/gym.sqlite` (assigns `t-morgan` to two Yoga sessions — one booked, one empty — and `t-lee` to a full Spin session; rest unassigned) |
| `npm run build` | OK — api `tsc` clean; web `tsc --noEmit` + `vite build` (35 modules, built in 2.40s) |
| `npm test` (api, Vitest) | **41 passed** (4 files: booking-service 6, **trainer-service 7**, class-service 18, app 10) |
| `npm test` (web, Playwright) | **3 passed** — `nav.spec.ts`, **`trainer.spec.ts`**, `smoke.spec.ts` |

A scan of all tracked files for prohibited external/product and internal-project
references (the six forbidden name tokens, case-insensitive, word-boundary matched)
found **no occurrences** — including `package-lock.json`. No coincidental substring
hits this time.

## Requirement traceability

UC-03 / TF-06 / TF-07 / TC-19..24 are almost entirely **automated** at the service,
API, and e2e layers; only the visual/appearance points remain **manual**. The table
is honest about which is which.

| Acceptance point (UC-03 / TF / TC) | Coverage | Covered by |
|---|---|---|
| Trainer sees only their assigned sessions, ordered by start (UC-03 main; TC-19; TF-06) | **Automated** | `trainer-service.test.ts` › "returns only the trainer's sessions, ordered by start time" + "never includes sessions belonging to another trainer or with no trainer"; `app.test.ts` › GET trainer sessions asserts every row `trainer === 't-morgan'`; `trainer.spec.ts` lists `t-morgan`'s sessions |
| Rosters correct, count equals roster length (UC-03 step 4; TC-20; TF-06) | **Automated** | `trainer-service.test.ts` › "derives the roster (booked member ids) and matching count" (`['m1','zoe']`, count 2); `app.test.ts` asserts `booked.roster` contains `m1` and `booked.booked === roster.length`; `trainer.spec.ts` asserts `m1` appears in the roster |
| Assigned-but-unbooked session → empty roster, count 0 (UC-03 A3; TC-21) | **Automated** | `trainer-service.test.ts` › "lists an assigned-but-unbooked session with an empty roster and count 0"; `app.test.ts` asserts the 09-03 session `roster == []`, `booked === 0` |
| Unknown / blank trainer id → `200 []`, never `404`; empty state in UI (UC-03 A1/A2; TC-22; TF-07) | **Automated** | `trainer-service.test.ts` › "returns [] for an unknown trainer id" + "for a blank trainer id" (`''` and `'   '`); `app.test.ts` › GET `/api/trainer/ghost/sessions` → `200 []`; `trainer.spec.ts` asserts the "No sessions assigned." empty state and zero table rows for `nobody` |
| Scheduling with an optional trainer surfaces in that trainer's view; blank leaves it unassigned; scheduling rules unchanged (UC-03; TC-23; TF-06) | **Automated** | `trainer-service.test.ts` › "surfaces a session scheduled with an optional trainer"; `app.test.ts` › "accepts an optional trainer when scheduling and surfaces it in the trainer view" (`201`, `trainer: 't-jordan'`, appears in the trainer view); `class-service.test.ts` (18) confirms all scheduling invariants still enforced |
| `trainer = NULL` session appears in no trainer's list (TF-07) | **Automated** | `trainer-service.test.ts` › "never includes … with no trainer" (orphan session excluded) |
| Member field's accessible name stays `member id`; existing nav intact (TC-24; regression) | **Automated** | `smoke.spec.ts` resolves the input via `getByLabel('member id')` (browse/book/cancel still green); `nav.spec.ts` proves sidebar view switching still works |
| "Acting as" **visible label** + no-real-auth helper on the trainer field; active-highlight look; roster/table appearance (TC-24; TF-06 step 3) | **Manual / visual** | TF-06 — the field carries a visible "Acting as" label (accessible name `trainer id`, mirroring the member field per ADR-0003); the automated e2e proves the field resolves and the view reacts, not the label's rendered look |

Behaviour outside this feature is unchanged: the api Vitest suite (41 passing, incl.
booking, class/scheduling, and app-level tests) and the Playwright `nav` + `smoke`
flows confirm booking, cancelling, capacity, scheduling, and navigation still work.
The Trainer view is read-only and adds only an additive nullable column.

## Status

**Done / Verified** — all four commits landed; `npm run seed`, `npm run build`, and
`npm test` are green under **Node v22.15.0** (api **41**, web **3** incl. the new
`trainer.spec`). Every behavioural acceptance point in UC-03 / TF-06 / TF-07 /
TC-19..24 is covered by passing automated tests across the service, API, and e2e
layers; only the visual points (the "Acting as" label's rendered look and the
active-highlight appearance) are **manual-verified** per TF-06, as intended for a
presentational detail.

## Notes / risks

- The single new-value rule ("an assigned trainer sees their sessions with rosters")
  lives in the API service layer; the route maps the request and the UI renders the
  result — no business logic in the client.
- Rosters are **derived** from `bookings` at read time (mirroring the derived
  `spotsLeft`), so they cannot drift from actual bookings; nothing new is persisted
  for them.
- Persistence is a single additive, nullable `trainer TEXT` column — no new table
  (ADR-0003, ADR-0001); the seed makes a non-empty roster, an empty roster, and
  unassigned sessions all demonstrable on first run.
- Minimal auth per ADR-0003: the trainer id is a demo stand-in for sign-in, exactly
  like the member field — no real authentication or trainer accounts (out of scope).
