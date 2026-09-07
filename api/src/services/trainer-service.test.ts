import { beforeEach, describe, expect, it } from 'vitest';
import { openMemoryDb, type Db } from '../db.js';
import { book } from './booking-service.js';
import { createClass, scheduleSession } from './class-service.js';
import { getTrainerSessions } from './trainer-service.js';

let db: Db;

beforeEach(() => {
  db = openMemoryDb();
});

/** Build a small fixture: two trainers, an unassigned session, and bookings. */
function fixture() {
  const yoga = createClass(db, 'Yoga Flow', '');
  const spin = createClass(db, 'Spin', '');

  // t-morgan: one booked session, one empty session (assigned, no bookings).
  const morning = scheduleSession(
    db,
    yoga.id,
    '2026-09-01T08:00:00.000Z',
    '2026-09-01T09:00:00.000Z',
    12,
    't-morgan',
  );
  const later = scheduleSession(
    db,
    yoga.id,
    '2026-09-03T08:00:00.000Z',
    '2026-09-03T09:00:00.000Z',
    12,
    't-morgan',
  );
  // t-lee: a different trainer's session.
  const lee = scheduleSession(
    db,
    spin.id,
    '2026-09-02T18:00:00.000Z',
    '2026-09-02T19:00:00.000Z',
    10,
    't-lee',
  );
  // A session with no trainer at all.
  const orphan = scheduleSession(
    db,
    spin.id,
    '2026-09-04T18:00:00.000Z',
    '2026-09-04T19:00:00.000Z',
    10,
  );

  book(db, morning.id, 'm1');
  book(db, morning.id, 'zoe');

  return { morning, later, lee, orphan };
}

describe('trainer-service.getTrainerSessions', () => {
  it("returns only the trainer's sessions, ordered by start time", () => {
    const { morning, later } = fixture();
    const rows = getTrainerSessions(db, 't-morgan');
    expect(rows.map((r) => r.sessionId)).toEqual([morning.id, later.id]);
    expect(rows.every((r) => r.trainer === 't-morgan')).toBe(true);
  });

  it('derives the roster (booked member ids) and matching count', () => {
    fixture();
    const rows = getTrainerSessions(db, 't-morgan');
    const booked = rows.find((r) => r.startsAt === '2026-09-01T08:00:00.000Z')!;
    expect(booked.roster).toEqual(['m1', 'zoe']);
    expect(booked.booked).toBe(2);
    expect(booked.className).toBe('Yoga Flow');
  });

  it('lists an assigned-but-unbooked session with an empty roster and count 0', () => {
    fixture();
    const rows = getTrainerSessions(db, 't-morgan');
    const empty = rows.find((r) => r.startsAt === '2026-09-03T08:00:00.000Z')!;
    expect(empty.roster).toEqual([]);
    expect(empty.booked).toBe(0);
  });

  it('never includes sessions belonging to another trainer or with no trainer', () => {
    const { orphan, lee } = fixture();
    const rows = getTrainerSessions(db, 't-morgan');
    const ids = rows.map((r) => r.sessionId);
    expect(ids).not.toContain(orphan.id);
    expect(ids).not.toContain(lee.id);
  });

  it('returns [] for an unknown trainer id', () => {
    fixture();
    expect(getTrainerSessions(db, 'nobody')).toEqual([]);
  });

  it('returns [] for a blank trainer id', () => {
    fixture();
    expect(getTrainerSessions(db, '')).toEqual([]);
    expect(getTrainerSessions(db, '   ')).toEqual([]);
  });

  it('surfaces a session scheduled with an optional trainer', () => {
    const cls = createClass(db, 'HIIT', '');
    scheduleSession(db, cls.id, '2026-09-05T07:00:00.000Z', '2026-09-05T08:00:00.000Z', 8, 't-new');
    const rows = getTrainerSessions(db, 't-new');
    expect(rows).toHaveLength(1);
    expect(rows[0].className).toBe('HIIT');
    expect(rows[0].roster).toEqual([]);
  });
});
