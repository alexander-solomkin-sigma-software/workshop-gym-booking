#!/usr/bin/env node
/**
 * One-command bootstrap for the Gym Class Booking app.
 *
 *   npm run setup
 *
 * Installs dependencies, seeds the local SQLite database deterministically,
 * and prints how to run the app. Designed to complete in well under 5 minutes.
 * The generated DB file (api/data/gym.sqlite) is git-ignored — the seed script
 * is the source of truth, so every checkout starts from identical data.
 */
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit', ...opts });
}

function step(label) {
  console.log(`\n=== ${label} ===`);
}

const major = Number(process.versions.node.split('.')[0]);
if (major < 22) {
  console.error(`Node 22+ is required (found ${process.versions.node}). See .nvmrc.`);
  process.exit(1);
}

step('Installing dependencies (workspaces: api, web)');
run('npm install');

// better-sqlite3 is a native addon: its compiled binary is tied to a specific
// Node ABI. If node_modules was installed under a different Node version, npm
// install won't rebuild it ("up to date") and the app crashes with
// NODE_MODULE_VERSION mismatch. Rebuild it against THIS Node to self-heal.
step(`Rebuilding native modules for Node ${process.versions.node}`);
try {
  run('npm rebuild better-sqlite3');
} catch {
  console.warn('better-sqlite3 rebuild failed — if seeding fails with a NODE_MODULE_VERSION error, run `npm rebuild better-sqlite3`.');
}

step('Seeding the local database');
run('npm run seed');

// Playwright's browser is optional for the unit/API suite; try to install it
// so the e2e smoke can run, but do not fail setup if the download is blocked.
step('Installing Playwright browser (for the e2e smoke)');
try {
  run('npx playwright install chromium', { cwd: path.join(root, 'web') });
} catch {
  console.warn('Could not install the Playwright browser (offline?). Unit/API tests still run.');
}

console.log(`
=== Ready ===

  npm run dev     # start the API (http://localhost:3001) + web (http://localhost:5173)
  npm test        # run the test suite (Vitest unit/API + Playwright smoke)

Open http://localhost:5173 to browse the timetable, book/cancel, and manage classes.
`);
