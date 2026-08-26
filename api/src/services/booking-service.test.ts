import { beforeEach, describe, expect, it } from 'vitest';
import { openMemoryDb, type Db } from '../db.js';
import { AppError } from '../errors.js';
import { book, cancel, getTimetable } from './booking-service.js';
import { createClass, scheduleSession } from './class-service.js';

let db: Db;
let sessionId: number;

beforeEach(() => {
  db = openMemoryDb();
  const cls = createClass(db, 'Yoga', 'Morning flow');
  sessionId = scheduleSession(
    db,
    cls.id,
    '2026-09-01T08:00:00.000Z',
    '2026-09-01T09:00:00.000Z',
    2,
  ).id;
});

function statusOf(fn: () => unknown): number | undefined {
  try {
    fn();
  } catch (err) {
    return err instanceof AppError ? err.status : -1;
  }
  return undefined;
}

describe('booking-service', () => {
  it('books a place and reflects it on the timetable', () => {
    book(db, sessionId, 'm1');
    const entry = getTimetable(db, 'm1').find((e) => e.sessionId === sessionId)!;
    expect(entry.booked).toBe(1);
    expect(entry.spotsLeft).toBe(1);
    expect(entry.myBookingId).not.toBeNull();
  });

  it('rejects a second booking by the same member (409)', () => {
    book(db, sessionId, 'm1');
    expect(statusOf(() => book(db, sessionId, 'm1'))).toBe(409);
  });

  it('rejects booking when the session is full (409)', () => {
    book(db, sessionId, 'm1');
    book(db, sessionId, 'm2'); // capacity is 2 — now full
    expect(statusOf(() => book(db, sessionId, 'm3'))).toBe(409);
  });

  it('rejects booking a non-existent session (404)', () => {
    expect(statusOf(() => book(db, 9999, 'm1'))).toBe(404);
  });

  it('cancelling frees the place again', () => {
    const b1 = book(db, sessionId, 'm1');
    book(db, sessionId, 'm2'); // full
    expect(statusOf(() => book(db, sessionId, 'm3'))).toBe(409);

    cancel(db, b1.id, 'm1');
    const entry = getTimetable(db, 'm3').find((e) => e.sessionId === sessionId)!;
    expect(entry.spotsLeft).toBe(1);
    // The freed place can now be booked.
    expect(() => book(db, sessionId, 'm3')).not.toThrow();
  });

  it("rejects cancelling another member's booking (404)", () => {
    const b1 = book(db, sessionId, 'm1');
    expect(statusOf(() => cancel(db, b1.id, 'someone-else'))).toBe(404);
  });
});
