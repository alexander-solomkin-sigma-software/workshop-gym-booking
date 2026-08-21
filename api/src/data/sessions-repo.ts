import type { Db } from '../db.js';
import type { SessionRow } from '../types.js';

/** Data-layer access to the `sessions` table. No business rules here. */

export function getSession(db: Db, id: number): SessionRow | undefined {
  const row = db
    .prepare('SELECT id, class_id AS classId, starts_at AS startsAt, capacity FROM sessions WHERE id = ?')
    .get(id) as SessionRow | undefined;
  return row;
}

export function listSessionsForClass(
  db: Db,
  classId: number,
): Array<SessionRow & { booked: number }> {
  return db
    .prepare(
      `SELECT s.id AS id, s.class_id AS classId, s.starts_at AS startsAt, s.capacity AS capacity,
              (SELECT COUNT(*) FROM bookings b WHERE b.session_id = s.id) AS booked
       FROM sessions s
       WHERE s.class_id = ?
       ORDER BY s.starts_at`,
    )
    .all(classId) as Array<SessionRow & { booked: number }>;
}

export function insertSession(
  db: Db,
  classId: number,
  startsAt: string,
  capacity: number,
): SessionRow {
  const info = db
    .prepare('INSERT INTO sessions (class_id, starts_at, capacity) VALUES (?, ?, ?)')
    .run(classId, startsAt, capacity);
  return getSession(db, Number(info.lastInsertRowid))!;
}

export function updateSessionCapacity(db: Db, id: number, capacity: number): void {
  db.prepare('UPDATE sessions SET capacity = ? WHERE id = ?').run(capacity, id);
}
