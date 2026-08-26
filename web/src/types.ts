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
}

export interface ClassWithSessions {
  id: number;
  name: string;
  description: string;
  sessions: SessionRow[];
}
