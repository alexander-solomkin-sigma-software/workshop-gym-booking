import type { Db } from '../db.js';
import type { BookingRow, TimetableEntry } from '../types.js';

/** Data-layer access to the `bookings` table plus the timetable read model. */

export function countBookings(db: Db, sessionId: number): number {
  const row = db
    .prepare('SELECT COUNT(*) AS n FROM bookings WHERE session_id = ?')
    .get(sessionId) as { n: number };
  return row.n;
}

/** Member ids booked on a session, ordered by booking time (the roster). */
export function listRoster(db: Db, sessionId: number): string[] {
  const rows = db
    .prepare(
      'SELECT member_id AS memberId FROM bookings WHERE session_id = ? ORDER BY created_at, id',
    )
    .all(sessionId) as Array<{ memberId: string }>;
  return rows.map((r) => r.memberId);
}

export function findBooking(
  db: Db,
  sessionId: number,
  memberId: string,
): BookingRow | undefined {
  return db
    .prepare(
      'SELECT id, session_id AS sessionId, member_id AS memberId, created_at AS createdAt FROM bookings WHERE session_id = ? AND member_id = ?',
    )
    .get(sessionId, memberId) as BookingRow | undefined;
}

export function getBooking(db: Db, id: number): BookingRow | undefined {
  return db
    .prepare(
      'SELECT id, session_id AS sessionId, member_id AS memberId, created_at AS createdAt FROM bookings WHERE id = ?',
    )
    .get(id) as BookingRow | undefined;
}

export function insertBooking(
  db: Db,
  sessionId: number,
  memberId: string,
  createdAt: string,
): BookingRow {
  const info = db
    .prepare('INSERT INTO bookings (session_id, member_id, created_at) VALUES (?, ?, ?)')
    .run(sessionId, memberId, createdAt);
  return getBooking(db, Number(info.lastInsertRowid))!;
}

export function deleteBooking(db: Db, id: number): void {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
}

/** Timetable read model: every session with class info, booking counts, and the member's own booking. */
export function timetableForMember(db: Db, memberId: string): TimetableEntry[] {
  const rows = db
    .prepare(
      `SELECT s.id AS sessionId, c.id AS classId, c.name AS className, c.description AS description,
              s.starts_at AS startsAt, s.ends_at AS endsAt, s.capacity AS capacity,
              (SELECT COUNT(*) FROM bookings b WHERE b.session_id = s.id) AS booked,
              (SELECT b2.id FROM bookings b2 WHERE b2.session_id = s.id AND b2.member_id = ?) AS myBookingId
       FROM sessions s
       JOIN classes c ON c.id = s.class_id
       ORDER BY s.starts_at`,
    )
    .all(memberId) as Array<{
    sessionId: number;
    classId: number;
    className: string;
    description: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    booked: number;
    myBookingId: number | null;
  }>;

  return rows.map((r) => ({
    ...r,
    spotsLeft: r.capacity - r.booked,
    isFull: r.booked >= r.capacity,
    myBookingId: r.myBookingId ?? null,
  }));
}
