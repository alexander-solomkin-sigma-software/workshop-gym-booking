/** Shared row/DTO shapes for the API. */

export interface ClassRow {
  id: number;
  name: string;
  description: string;
}

export interface SessionRow {
  id: number;
  classId: number;
  startsAt: string;
  endsAt: string;
  capacity: number;
}

export interface BookingRow {
  id: number;
  sessionId: number;
  memberId: string;
  createdAt: string;
}

/** A timetable entry: a session enriched with its class and booking counts. */
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
  /** The current member's booking id for this session, or null. */
  myBookingId: number | null;
}

/** A class with its scheduled sessions, for the admin view. */
export interface ClassWithSessions extends ClassRow {
  sessions: Array<SessionRow & { booked: number }>;
}
