# Setup Notes

**Script:** `scripts/setup.mjs` · run with `npm run setup`

## What it does

1. Checks Node ≥ 20 (see `.nvmrc`).
2. `npm install` — installs both workspaces (`api`, `web`).
3. `npm run seed` — builds the deterministic local database (`api/data/gym.sqlite`).
4. Installs the Playwright Chromium browser for the e2e smoke (best-effort — a
   blocked download warns but does not fail setup; the unit/API suite still runs).
5. Prints how to run the app and tests.

Target: a cold checkout is ready in **under 5 minutes**.

## Everyday commands

```bash
npm run setup   # one-time (or after dependency changes)
npm run dev     # API on http://localhost:3001, web on http://localhost:5173
npm test        # Vitest (api) + Playwright (web)
npm run seed    # rebuild the seeded DB
```

## Troubleshooting

- **Node version.** `nvm use` (reads `.nvmrc`) or install Node 20+. `better-sqlite3`
  needs a Node it has a prebuilt binary for; on an unusual platform it compiles
  from source, which needs a C/C++ toolchain.
- **LF vs CRLF (Windows).** `.gitattributes` forces LF; keep `core.autocrlf`
  from rewriting line endings. The DB file is git-ignored, so it never causes
  checksum churn.
- **Playwright browser missing.** If setup skipped the download (offline), run
  `npx playwright install chromium` from `web/` before `npm test`.
- **Ports in use.** The API uses `3001` (`PORT` env overrides) and web uses `5173`.
- **Stale DB / schema.** Re-run `npm run seed` to rebuild from scratch.
