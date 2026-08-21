import fs from 'node:fs';
import path from 'node:path';
import { createSchema, defaultDbPath, type Db } from './db.js';
import Database from 'better-sqlite3';

/**
 * Deterministic seed. Every checkout starts from identical data so tests,
 * demos, and screenshots line up. Re-running rebuilds the DB from scratch.
 *
 * Seeded member id used by the web app is `m1`.
 */

interface SeedClass {
  name: string;
  description: string;
  sessions: Array<{ startsAt: string; capacity: number }>;
}

// Fixed datetimes (not relative to "now") so the seed is byte-stable.
const SEED: SeedClass[] = [
  {
    name: 'Yoga Flow',
    description: 'All-levels vinyasa to start the day.',
    sessions: [
      { startsAt: '2026-09-01T08:00:00.000Z', capacity: 12 },
      { startsAt: '2026-09-03T08:00:00.000Z', capacity: 12 },
    ],
  },
  {
    name: 'Spin',
    description: 'High-energy indoor cycling.',
    sessions: [
      { startsAt: '2026-09-01T18:00:00.000Z', capacity: 3 }, // small — used to demo "full"
      { startsAt: '2026-09-02T18:00:00.000Z', capacity: 10 },
    ],
  },
  {
    name: 'HIIT',
    description: 'Twenty minutes of high-intensity intervals.',
    sessions: [{ startsAt: '2026-09-02T07:00:00.000Z', capacity: 8 }],
  },
  {
    name: 'Pilates',
    description: 'Core strength and mobility.',
    sessions: [{ startsAt: '2026-09-04T09:00:00.000Z', capacity: 10 }],
  },
];

export function seed(db: Db): void {
  db.exec('DELETE FROM bookings; DELETE FROM sessions; DELETE FROM classes;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('classes','sessions','bookings');");

  const insertClass = db.prepare('INSERT INTO classes (name, description) VALUES (?, ?)');
  const insertSession = db.prepare(
    'INSERT INTO sessions (class_id, starts_at, capacity) VALUES (?, ?, ?)',
  );
  const insertBooking = db.prepare(
    'INSERT INTO bookings (session_id, member_id, created_at) VALUES (?, ?, ?)',
  );

  const sessionIds: number[] = [];
  const tx = db.transaction(() => {
    for (const c of SEED) {
      const classId = Number(insertClass.run(c.name, c.description).lastInsertRowid);
      for (const s of c.sessions) {
        sessionIds.push(Number(insertSession.run(classId, s.startsAt, s.capacity).lastInsertRowid));
      }
    }
    // Seed a booking for the demo member on the first Yoga session.
    insertBooking.run(sessionIds[0], 'm1', '2026-08-20T10:00:00.000Z');
    // Fill the small Spin session (capacity 3) to capacity to demo a full class.
    const spinFull = sessionIds[2];
    insertBooking.run(spinFull, 'other-1', '2026-08-20T10:01:00.000Z');
    insertBooking.run(spinFull, 'other-2', '2026-08-20T10:02:00.000Z');
    insertBooking.run(spinFull, 'other-3', '2026-08-20T10:03:00.000Z');
  });
  tx();
}

/** CLI entry: rebuild the on-disk seeded database. */
function main(): void {
  const dbPath = defaultDbPath();
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    // Start clean to avoid stale rows / schema drift.
    for (const suffix of ['', '-wal', '-shm']) {
      const f = dbPath + suffix;
      if (fs.existsSync(f)) fs.rmSync(f);
    }
  }
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  createSchema(db);
  seed(db);
  db.close();
  // eslint-disable-next-line no-console
  console.log(`Seeded database at ${dbPath}`);
}

// Run when invoked directly (tsx src/seed.ts) — not when imported by tests.
if (process.argv[1] && path.resolve(process.argv[1]).endsWith(path.join('src', 'seed.ts'))) {
  main();
}
