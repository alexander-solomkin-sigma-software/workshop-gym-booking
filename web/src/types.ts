/** DTO shapes returned by the API (mirrors api/src/types.ts). */

export interface TimetableEntry {
  sessionId: number;
  classId: number;
  className: string;
  description: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  booked: number;
  spotsLeft: number;
  isFull: boolean;
  myBookingId: number | null;
}

export interface SessionRow {
  id: number;
  classId: number;
  startsAt: string;
  endsAt: string;
  capacity: number;
  booked: number;
  /** Assigned trainer id, or null when the session is unassigned. */
  trainer: string | null;
}

export interface ClassWithSessions {
  id: number;
  name: string;
  description: string;
  sessions: SessionRow[];
}

/** A trainer-view entry: an assigned session with its derived roster. */
export interface TrainerSessionEntry {
  sessionId: number;
  classId: number;
  className: string;
  startsAt: string;
  endsAt: string;
  trainer: string;
  roster: string[];
  booked: number;
}
