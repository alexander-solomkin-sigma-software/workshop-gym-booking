import type { Db } from '../db.js';
import { ConflictError, NotFoundError, ValidationError } from '../errors.js';
import type { BookingRow, TimetableEntry } from '../types.js';
import * as bookings from '../data/bookings-repo.js';
import { getSession } from '../data/sessions-repo.js';

/**
 * Member booking rules — the single source of truth for capacity, double-booking,
 * and cancellation. Routes and the UI must never re-implement these.
 */

/** The upcoming timetable annotated for a given member. */
export function getTimetable(db: Db, memberId: string): TimetableEntry[] {
  return bookings.timetableForMember(db, memberId);
}

/**
 * Book a place for a member in a session.
 * @throws NotFoundError  session does not exist
 * @throws ConflictError  session is full, or the member already holds a booking
 */
export function book(db: Db, sessionId: number, memberId: string): BookingRow {
  if (!memberId) {
    throw new ValidationError('memberId is required');
  }
  const session = getSession(db, sessionId);
  if (!session) {
    throw new NotFoundError(`session ${sessionId} not found`);
  }
  if (bookings.findBooking(db, sessionId, memberId)) {
    throw new ConflictError('member already booked for this session');
  }
  if (bookings.countBookings(db, sessionId) >= session.capacity) {
    throw new ConflictError('session is full');
  }
  return bookings.insertBooking(db, sessionId, memberId, new Date().toISOString());
}

/**
 * Cancel a member's booking, freeing the place immediately.
 * @throws NotFoundError  no such booking for this member
 */
export function cancel(db: Db, bookingId: number, memberId: string): void {
  const booking = bookings.getBooking(db, bookingId);
  if (!booking || booking.memberId !== memberId) {
    throw new NotFoundError(`booking ${bookingId} not found for member`);
  }
  bookings.deleteBooking(db, bookingId);
}
