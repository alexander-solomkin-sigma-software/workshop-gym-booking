# Estimation Conventions

How work is estimated and decomposed on this project. The core idea: an estimate is not just "dev time" — it accounts for the full path from understanding a requirement to a verified, done increment.

## Definition of Done — the 12 activities

Every task estimate accounts for these activities (skip one only with a reason):

1. **Requirements analysis** — understand and clarify what is being asked.
2. **Design** — decide the approach; capture a design note and any ADR.
3. **Design review** — a second pair of eyes on the approach.
4. **Test case design** — define the test cases before implementation.
5. **Test data** — prepare fixtures / seed data needed to test.
6. **Development** — write the implementation.
7. **Unit testing** — write and run automated tests.
8. **Code review** — review the change.
9. **Dev testing** — the developer manually exercises the feature.
10. **Functional testing** — verify against the acceptance criteria.
11. **Defect correction** — fix what testing found.
12. **Defect verification** — confirm the fixes hold.

## Decomposition

- Break a feature into tasks small enough that each can be estimated with confidence and finished within a working session.
- Prefer a **test-first** cadence: write the failing test, implement, confirm green, then commit (gated).
- Size against capacity: pick what genuinely fits the sprint, and name what is cut ("scope vs capacity").

## Estimation units

Use whatever unit the team tracks (story points or ideal hours). Keep estimates comparable by always covering the 12 activities above, not just development.
