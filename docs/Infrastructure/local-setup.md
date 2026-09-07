# Local Setup & Running the App

Everything needed to get **Gym Class Booking** running on your machine and to run its tests. It is a local-only app — no external database, container, or cloud service.

## Prerequisites

- **Node.js ≥ 22 LTS** and npm (pinned in `.nvmrc`; with `nvm` run `nvm use`). Use a consistent Node **major** — the app uses a native module (`better-sqlite3`) whose binary is tied to the Node major version.
- **Git**.
- That's it. The database is a local SQLite file created by the seed step — nothing to install or configure.

## One-command setup

From the repo root:

```bash
npm run setup
```

This (`scripts/setup.mjs`) installs workspace dependencies, **seeds the local database**, and best-effort installs the Playwright browser used by the end-to-end test. It prints the run instructions when it finishes. Expect it to complete in well under 5 minutes.

## Run the app

```bash
npm run dev
```

This starts both workspaces:

| Part | URL | Notes |
|---|---|---|
| **Web** (Vite + React) | http://localhost:5173 | Open this in your browser. |
| **API** (Express) | http://localhost:3001 | The web app calls it via the `/api` prefix, proxied by Vite in dev. |

Open **http://localhost:5173** — you'll land on the timetable (member view), with a left sidebar to switch to the admin view.

You can also run the parts individually:

```bash
npm run dev --workspace api    # API only (port 3001)
npm run dev --workspace web    # web only (port 5173)
```

## The local database

- The app persists to a local SQLite file at **`api/data/gym.sqlite`**.
- That file is **git-ignored** and rebuilt from **`api/src/seed.ts`** — the seed script is the source of truth, so every checkout starts from identical, deterministic data.
- To reset to a clean seeded state at any time:

  ```bash
  npm run seed
  ```

## Run the tests

```bash
npm test
```

Runs the full suite across workspaces:

- **Vitest** (API unit/integration) — fully self-contained.
- **Playwright** (one end-to-end smoke: browse → book → cancel) — needs a browser binary.

If you only want the fast, self-contained checks (no browser needed):

```bash
npm test --workspace api        # Vitest only
```

## Environment variables (optional)

| Variable | Default | Effect |
|---|---|---|
| `PORT` | `3001` | Port the API listens on. |
| `API_URL` | `http://localhost:3001` | API target the web dev-server proxies to. |

## Troubleshooting

- **Port already in use (3001 or 5173):** stop the process using it, or set `PORT` (API) / Vite's `--port` (web). If you change the API port, set `API_URL` to match so the proxy still finds it.
- **Playwright: "browser not found" / version mismatch** when running `npm test`: install the browser once (needs network):

  ```bash
  npx playwright install chromium
  ```

  If you can't install it (offline / restricted network), skip the e2e and run `npm test --workspace api` — the Vitest suite alone is enough to verify the app's behaviour.
- **`NODE_MODULE_VERSION` mismatch** (e.g. seed crashes with *"better_sqlite3.node was compiled against a different Node.js version … NODE_MODULE_VERSION 137 … requires 127"*): the native `better-sqlite3` binary was built for a **different Node version** than the one you're running (this happens if `node_modules` was installed under another Node). Fix:

  ```bash
  npm rebuild better-sqlite3      # rebuild for your current Node
  ```

  `npm run setup` now does this automatically. If it persists, delete `node_modules` and re-run `npm run setup` under the Node version you'll use (`node -v`; the repo pins one in `.nvmrc`).
- **Windows line endings:** the repo forces LF via `.gitattributes`; if your editor rewrites files to CRLF, re-check your Git `core.autocrlf` setting so the seed/data checksums stay stable.
- **Nothing loads at 5173:** confirm both servers started (`npm run dev` shows the API "listening on http://localhost:3001" line); the web app needs the API running for data.
