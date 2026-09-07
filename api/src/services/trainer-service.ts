import type { Db } from '../db.js';
import type { TrainerSessionEntry } from '../types.js';
import { listSessionsForTrainer } from '../data/sessions-repo.js';
import { listRoster } from '../data/bookings-repo.js';

/**
 * Trainer read rule: the sessions assigned to `trainerId`, ordered by start
 * time, each enriched with its class name and a roster derived from current
 * bookings. An unknown or blank trainer id yields an empty list (never an
 * error) — "no sessions" is a valid answer (UC-03 A1/A2). Read-only.
 */
export function getTrainerSessions(db: Db, trainerId: string): TrainerSessionEntry[] {
  const id = (trainerId ?? '').trim();
  if (!id) return [];
  return listSessionsForTrainer(db, id).map((s) => {
    const roster = listRoster(db, s.sessionId);
    return { ...s, roster, booked: roster.length };
  });
}
