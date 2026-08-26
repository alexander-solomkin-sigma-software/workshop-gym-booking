import type { Db } from '../db.js';
import { ConflictError, NotFoundError, ValidationError } from '../errors.js';
import type { ClassRow, ClassWithSessions, SessionRow } from '../types.js';
import * as classes from '../data/classes-repo.js';
import * as sessions from '../data/sessions-repo.js';
import { countBookings } from '../data/bookings-repo.js';

/** Admin rules for managing classes, sessions, and capacity. */

/** All classes with their scheduled sessions and current booking counts. */
export function listClassesWithSessions(db: Db): ClassWithSessions[] {
  return classes.listClasses(db).map((c) => ({
    ...c,
    sessions: sessions.listSessionsForClass(db, c.id),
  }));
}

/**
 * Create a class.
 * @throws ValidationError  name is missing/blank
 */
export function createClass(db: Db, name: string, description = ''): ClassRow {
  const cleanName = (name ?? '').trim();
  if (!cleanName) {
    throw new ValidationError('class name is required');
  }
  return classes.insertClass(db, cleanName, (description ?? '').trim());
}

/**
 * Edit a class's name/description.
 * @throws NotFoundError    class does not exist
 * @throws ValidationError  name is missing/blank
 */
export function editClass(db: Db, id: number, name: string, description = ''): ClassRow {
  if (!classes.getClass(db, id)) {
    throw new NotFoundError(`class ${id} not found`);
  }
  const cleanName = (name ?? '').trim();
  if (!cleanName) {
    throw new ValidationError('class name is required');
  }
  classes.updateClass(db, id, cleanName, (description ?? '').trim());
  return classes.getClass(db, id)!;
}

/**
 * Schedule a session for a class.
 * @throws NotFoundError    class does not exist
 * @throws ValidationError  capacity is not a positive integer, startsAt/endsAt is blank,
 *                          or endsAt is not strictly after startsAt
 */
export function scheduleSession(
  db: Db,
  classId: number,
  startsAt: string,
  endsAt: string,
  capacity: number,
): SessionRow {
  if (!classes.getClass(db, classId)) {
    throw new NotFoundError(`class ${classId} not found`);
  }
  if (!startsAt) {
    throw new ValidationError('startsAt is required');
  }
  if (!endsAt) {
    throw new ValidationError('endsAt is required');
  }
  if (Date.parse(endsAt) <= Date.parse(startsAt)) {
    throw new ValidationError('endsAt must be after startsAt');
  }
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new ValidationError('capacity must be a positive integer');
  }
  return sessions.insertSession(db, classId, startsAt, endsAt, capacity);
}

/**
 * Change a session's capacity.
 * @throws NotFoundError    session does not exist
 * @throws ValidationError  capacity is not a positive integer
 * @throws ConflictError    capacity would drop below the number already booked
 */
export function setCapacity(db: Db, sessionId: number, capacity: number): SessionRow {
  const session = sessions.getSession(db, sessionId);
  if (!session) {
    throw new NotFoundError(`session ${sessionId} not found`);
  }
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new ValidationError('capacity must be a positive integer');
  }
  const booked = countBookings(db, sessionId);
  if (capacity < booked) {
    throw new ConflictError(`capacity ${capacity} is below current bookings (${booked})`);
  }
  sessions.updateSessionCapacity(db, sessionId, capacity);
  return sessions.getSession(db, sessionId)!;
}
