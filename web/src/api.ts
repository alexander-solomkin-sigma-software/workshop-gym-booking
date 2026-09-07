import type { ClassWithSessions, TimetableEntry, TrainerSessionEntry } from './types.js';

/**
 * Thin API client. All business rules live server-side; this module only
 * shuttles requests and surfaces error messages to the UI.
 */

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function getTimetable(memberId: string): Promise<TimetableEntry[]> {
  return fetch(`/api/timetable?memberId=${encodeURIComponent(memberId)}`).then(json<TimetableEntry[]>);
}

export function getTrainerSessions(trainerId: string): Promise<TrainerSessionEntry[]> {
  return fetch(`/api/trainer/${encodeURIComponent(trainerId)}/sessions`).then(
    json<TrainerSessionEntry[]>,
  );
}

export function book(sessionId: number, memberId: string): Promise<unknown> {
  return fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, memberId }),
  }).then(json);
}

export async function cancel(bookingId: number, memberId: string): Promise<void> {
  const res = await fetch(`/api/bookings/${bookingId}?memberId=${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `request failed (${res.status})`);
  }
}

export function getClasses(): Promise<ClassWithSessions[]> {
  return fetch('/api/admin/classes').then(json<ClassWithSessions[]>);
}

export function createClass(name: string, description: string): Promise<unknown> {
  return fetch('/api/admin/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  }).then(json);
}

export function scheduleSession(
  classId: number,
  startsAt: string,
  endsAt: string,
  capacity: number,
  trainer?: string,
): Promise<unknown> {
  return fetch('/api/admin/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId, startsAt, endsAt, capacity, trainer: trainer ?? null }),
  }).then(json);
}

export function setCapacity(sessionId: number, capacity: number): Promise<unknown> {
  return fetch(`/api/admin/sessions/${sessionId}/capacity`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity }),
  }).then(json);
}
