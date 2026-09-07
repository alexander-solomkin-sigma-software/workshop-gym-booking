import type { Db } from '../db.js';
import type { SessionRow } from '../types.js';

/** Data-layer access to the `sessions` table. No business rules here. */

export function getSession(db: Db, id: number): SessionRow | undefined {
  const row = db
    .prepare(
      'SELECT id, class_id AS classId, starts_at AS startsAt, ends_at AS endsAt, capacity, trainer FROM sessions WHERE id = ?',
    )
    .get(id) as SessionRow | undefined;
  return row;
}

export function listSessionsForClass(
  db: Db,
  classId: number,
): Array<SessionRow & { booked: number }> {
  return db
    .prepare(
      `SELECT s.id AS id, s.class_id AS classId, s.starts_at AS startsAt, s.ends_at AS endsAt, s.capacity AS capacity, s.trainer AS trainer,
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
  endsAt: string,
  capacity: number,
  trainer: string | null = null,
): SessionRow {
  const info = db
    .prepare(
      'INSERT INTO sessions (class_id, starts_at, ends_at, capacity, trainer) VALUES (?, ?, ?, ?, ?)',
    )
    .run(classId, startsAt, endsAt, capacity, trainer);
  return getSession(db, Number(info.lastInsertRowid))!;
}

export function updateSessionCapacity(db: Db, id: number, capacity: number): void {
  db.prepare('UPDATE sessions SET capacity = ? WHERE id = ?').run(capacity, id);
}

/**
 * Sessions assigned to a trainer, ordered by start time, enriched with class
 * name. The roster is added by the service layer from `bookings`.
 */
export function listSessionsForTrainer(
  db: Db,
  trainer: string,
): Array<{
  sessionId: number;
  classId: number;
  className: string;
  startsAt: string;
  endsAt: string;
  trainer: string;
}> {
  return db
    .prepare(
      `SELECT s.id AS sessionId, c.id AS classId, c.name AS className,
              s.starts_at AS startsAt, s.ends_at AS endsAt, s.trainer AS trainer
       FROM sessions s
       JOIN classes c ON c.id = s.class_id
       WHERE s.trainer = ?
       ORDER BY s.starts_at`,
    )
    .all(trainer) as Array<{
    sessionId: number;
    classId: number;
    className: string;
    startsAt: string;
    endsAt: string;
    trainer: string;
  }>;
}
