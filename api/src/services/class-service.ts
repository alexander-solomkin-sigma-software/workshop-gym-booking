import type { Db } from '../db.js';
import { ConflictError, NotFoundError, ValidationError } from '../errors.js';
import type { ClassRow, ClassWithSessions, SessionRow } from '../types.js';
import * as classes from '../data/classes-repo.js';
import * as sessions from '../data/sessions-repo.js';
import { countBookings } from '../data/bookings-repo.js';

/** Admin rules for managing classes, sessions, and capacity. */

/**
 * Session-scheduling bounds — named, configurable constants (not magic numbers),
 * kept together so a venue can tune them. See the design doc's constants table.
 *
 * Timezone simplification: the rules are validated **as-is on the received
 * timestamps** — calendar day, time-of-day, and elapsed minutes are read
 * straight from the ISO strings, with no timezone resolution. This keeps the
 * behaviour simple and deterministic to test.
 */
export const OPEN_TIME = '06:00'; // earliest a session may start/finish
export const CLOSE_TIME = '22:00'; // latest a session may start/finish
export const MIN_DURATION_MIN = 30; // minimum session length, minutes (inclusive)
export const MAX_DURATION_MIN = 180; // maximum session length, minutes (inclusive, = 3 h)

/** Minutes-since-midnight for an `HH:mm` string (e.g. `06:00` → 360). */
function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

const OPEN_MIN = timeToMinutes(OPEN_TIME);
const CLOSE_MIN = timeToMinutes(CLOSE_TIME);

/** Parsed calendar day and time-of-day read as-is from an ISO 8601 string. */
interface Instant {
  date: string; // YYYY-MM-DD
  minutes: number; // minutes since midnight
}

/** Read the date and time-of-day textually from an ISO timestamp, as-is. */
function parseInstant(iso: string): Instant {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!match) {
    throw new ValidationError(`invalid timestamp: ${iso}`);
  }
  return { date: match[1], minutes: Number(match[2]) * 60 + Number(match[3]) };
}

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
 *                          endsAt is not strictly after startsAt, the two are not on the
 *                          same calendar day, either falls outside working hours
 *                          (OPEN_TIME–CLOSE_TIME), or the duration is out of range
 *                          (MIN_DURATION_MIN–MAX_DURATION_MIN)
 */
export function scheduleSession(
  db: Db,
  classId: number,
  startsAt: string,
  endsAt: string,
  capacity: number,
  trainer?: string | null,
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
  const start = parseInstant(startsAt);
  const end = parseInstant(endsAt);
  // Same calendar day — no multi-day / date-range sessions.
  if (start.date !== end.date) {
    throw new ValidationError('a session must start and finish on the same day');
  }
  // Finish strictly after start.
  if (end.minutes <= start.minutes) {
    throw new ValidationError('endsAt must be after startsAt');
  }
  // Working hours — both start and finish within OPEN_TIME–CLOSE_TIME.
  if (
    start.minutes < OPEN_MIN ||
    start.minutes > CLOSE_MIN ||
    end.minutes < OPEN_MIN ||
    end.minutes > CLOSE_MIN
  ) {
    throw new ValidationError(`sessions must be within working hours ${OPEN_TIME}–${CLOSE_TIME}`);
  }
  // Duration between MIN_DURATION_MIN and MAX_DURATION_MIN, inclusive.
  const durationMin = end.minutes - start.minutes;
  if (durationMin < MIN_DURATION_MIN || durationMin > MAX_DURATION_MIN) {
    throw new ValidationError(
      `session length must be between ${MIN_DURATION_MIN} and ${MAX_DURATION_MIN} minutes`,
    );
  }
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new ValidationError('capacity must be a positive integer');
  }
  // Optional trainer id — metadata only, not a scheduling constraint. A blank
  // or omitted value stores NULL (no trainer assigned).
  const cleanTrainer = (trainer ?? '').trim() || null;
  return sessions.insertSession(db, classId, startsAt, endsAt, capacity, cleanTrainer);
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
