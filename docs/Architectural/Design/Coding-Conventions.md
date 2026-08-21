# Coding Conventions

Style and structure rules for this repo. Kept short; the point is consistency, not ceremony. (Most of this is enforced by `.editorconfig`; TypeScript settings live in each workspace's `tsconfig.json`.)

## General

- **TypeScript everywhere.** No plain `.js` in `api/` or `web/` source.
- 2-space indent, LF line endings, single quotes, semicolons, trailing commas (multiline). UTF-8, final newline.
- Prefer small, pure functions; keep files focused on one responsibility.
- No unused exports or dead code — delete rather than comment out.

## Naming

- **Files:** `kebab-case` for modules (`booking-service.ts`), `PascalCase.tsx` for React components (`TimetablePage.tsx`).
- **Types / interfaces / components:** `PascalCase`. **Variables / functions:** `camelCase`. **Constants:** `UPPER_SNAKE_CASE` only for true module-level constants.
- Booleans read as predicates (`isFull`, `hasBooking`).

## API (`api/`, Express + better-sqlite3)

- Layer by responsibility: **routes** (HTTP) → **services** (business rules) → **data** (SQLite access). Business rules (capacity, double-booking, cancellation window) live in **services**, never in routes or the UI.
- Validate input at the route boundary; return meaningful HTTP status codes (`400` bad input, `404` not found, `409` conflict e.g. class full).
- All DB access goes through the data layer; no raw SQL scattered in routes.
- Keep endpoints REST-shaped and small.

## Web (`web/`, React + Vite)

- Function components + hooks only. One component per file.
- Keep data-fetching in small hooks/services; components stay presentational where practical.
- No business logic in the UI — call the API and render the result. UI styling is minimal and pre-built (visual design is out of scope).

## Tests

- **Vitest** for unit/API tests, colocated as `*.test.ts` next to the code under test.
- **Playwright** for a single end-to-end smoke of the happy path.
- Follow a **test-first** cadence for new work: write the failing test, implement, confirm green.
- A doc may only claim "tested" once `npm test` is green.

## Commits

- `type(scope): reason #<issue>` — e.g. `feat(api): reject booking when class full #12`.
- Commit in small, coherent steps; commits are gated (ask before committing).
