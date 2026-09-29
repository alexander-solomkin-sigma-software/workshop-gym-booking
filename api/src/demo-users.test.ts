import { beforeEach, describe, expect, it } from 'vitest';
import { openMemoryDb, type Db } from './db.js';
import { seed } from './seed.js';
import { getTrainerSessions } from './services/trainer-service.js';
// The web app's hardcoded "Acting as" users. It is a plain TS module with no
// imports, so Vitest can load it directly; the api build (`tsc`, which excludes
// tests) never sees it.
import { USERS } from '../../web/src/users.js';

/**
 * Drift guard: the demo users the web app offers (`web/src/users.ts`) and the
 * seed (`seed.ts`) are two hand-maintained lists that must agree. If a trainer
 * or member id changes on one side only, this goes red instead of the demo
 * silently showing an empty page.
 */
let db: Db;

beforeEach(() => {
  db = openMemoryDb();
  seed(db);
});

function bookingsFor(memberId: string): number {
  const row = db
    .prepare('SELECT COUNT(*) AS n FROM bookings WHERE member_id = ?')
    .get(memberId) as { n: number };
  return row.n;
}

describe('demo users match the seed', () => {
  const trainers = USERS.filter((u) => u.role === 'trainer');
  const members = USERS.filter((u) => u.role === 'member');

  it('offers the expected demo ids', () => {
    expect(trainers.map((u) => u.id)).toEqual(['t-morgan', 't-lee']);
    expect(members.map((u) => u.id)).toEqual(['m1', 'm2']);
  });

  it.each(trainers.map((u) => u.id))('trainer %s has seeded sessions', (trainerId) => {
    expect(getTrainerSessions(db, trainerId).length).toBeGreaterThan(0);
  });

  it('member m1 is pre-booked and m2 starts with no bookings', () => {
    expect(bookingsFor('m1')).toBeGreaterThan(0);
    expect(bookingsFor('m2')).toBe(0);
  });
});
