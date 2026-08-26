import { beforeEach, describe, expect, it } from 'vitest';
import { openMemoryDb, type Db } from '../db.js';
import { AppError } from '../errors.js';
import { book } from './booking-service.js';
import {
  createClass,
  editClass,
  listClassesWithSessions,
  scheduleSession,
  setCapacity,
} from './class-service.js';

let db: Db;

beforeEach(() => {
  db = openMemoryDb();
});

function statusOf(fn: () => unknown): number | undefined {
  try {
    fn();
  } catch (err) {
    return err instanceof AppError ? err.status : -1;
  }
  return undefined;
}

describe('class-service (admin)', () => {
  it('creates and lists a class with its sessions', () => {
    const cls = createClass(db, 'Spin', 'Indoor cycling');
    scheduleSession(db, cls.id, '2026-09-01T18:00:00.000Z', '2026-09-01T19:00:00.000Z', 10);

    const list = listClassesWithSessions(db);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Spin');
    expect(list[0].sessions).toHaveLength(1);
    expect(list[0].sessions[0].capacity).toBe(10);
  });

  it('schedules a session with a valid finish time and returns start–finish', () => {
    const cls = createClass(db, 'Spin', '');
    const session = scheduleSession(
      db,
      cls.id,
      '2026-09-10T10:00:00.000Z',
      '2026-09-10T11:00:00.000Z',
      10,
    );
    expect(session.startsAt).toBe('2026-09-10T10:00:00.000Z');
    expect(session.endsAt).toBe('2026-09-10T11:00:00.000Z');

    // Persisted and returned through the admin read model.
    const list = listClassesWithSessions(db);
    expect(list[0].sessions[0].endsAt).toBe('2026-09-10T11:00:00.000Z');
  });

  it('rejects a finish time not after the start (400)', () => {
    const cls = createClass(db, 'Spin', '');
    // Equal to start.
    expect(
      statusOf(() =>
        scheduleSession(db, cls.id, '2026-09-10T10:00:00.000Z', '2026-09-10T10:00:00.000Z', 10),
      ),
    ).toBe(400);
    // Before start.
    expect(
      statusOf(() =>
        scheduleSession(db, cls.id, '2026-09-10T10:00:00.000Z', '2026-09-10T09:30:00.000Z', 10),
      ),
    ).toBe(400);
    // Missing finish.
    expect(
      statusOf(() => scheduleSession(db, cls.id, '2026-09-10T10:00:00.000Z', '', 10)),
    ).toBe(400);
    // Nothing saved.
    expect(listClassesWithSessions(db)[0].sessions).toHaveLength(0);
  });

  it('rejects a class with a blank name (400)', () => {
    expect(statusOf(() => createClass(db, '   '))).toBe(400);
  });

  it('edits a class name/description', () => {
    const cls = createClass(db, 'Spin', 'old');
    const updated = editClass(db, cls.id, 'Spin Pro', 'new');
    expect(updated.name).toBe('Spin Pro');
    expect(updated.description).toBe('new');
  });

  it('rejects a non-positive capacity when scheduling (400)', () => {
    const cls = createClass(db, 'Spin', '');
    expect(
      statusOf(() =>
        scheduleSession(db, cls.id, '2026-09-01T18:00:00.000Z', '2026-09-01T19:00:00.000Z', 0),
      ),
    ).toBe(400);
  });

  it('increases capacity successfully', () => {
    const cls = createClass(db, 'Spin', '');
    const session = scheduleSession(
      db,
      cls.id,
      '2026-09-01T18:00:00.000Z',
      '2026-09-01T19:00:00.000Z',
      2,
    );
    const updated = setCapacity(db, session.id, 5);
    expect(updated.capacity).toBe(5);
  });

  it('refuses to drop capacity below current bookings (409)', () => {
    const cls = createClass(db, 'Spin', '');
    const session = scheduleSession(
      db,
      cls.id,
      '2026-09-01T18:00:00.000Z',
      '2026-09-01T19:00:00.000Z',
      3,
    );
    book(db, session.id, 'm1');
    book(db, session.id, 'm2');
    expect(statusOf(() => setCapacity(db, session.id, 1))).toBe(409);
    // Dropping to exactly the booked count is allowed.
    expect(() => setCapacity(db, session.id, 2)).not.toThrow();
  });
});
