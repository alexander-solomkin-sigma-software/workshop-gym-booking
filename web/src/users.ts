export type Role = 'member' | 'trainer' | 'admin';

/** The pages the app can show; which ones you get depends on your role. */
export type View = 'timetable' | 'admin' | 'trainer';

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
}

/**
 * Hardcoded demo users — a stand-in for sign-in, not authentication (ADR-0003).
 * Picking one in the sidebar sets the id the API is called with.
 *
 * The trainer ids must match the `trainer` values in `api/src/seed.ts`,
 * otherwise a trainer here sees no sessions.
 */
export const USERS: DemoUser[] = [
  { id: 'm1', name: 'Mia Chen', role: 'member' }, // has a seeded booking
  { id: 'm2', name: 'Zoe Park', role: 'member' }, // no bookings — free to book
  { id: 't-morgan', name: 'Morgan Diaz', role: 'trainer' }, // two Yoga sessions
  { id: 't-lee', name: 'Lee Novak', role: 'trainer' }, // one full Spin session
  { id: 'a1', name: 'Alex Rivera', role: 'admin' },
];

/** The trainers you can act as — also the choices when assigning a session. */
export const TRAINERS = USERS.filter((u) => u.role === 'trainer');

/** Display name for a stored id; unknown ids (older data) show as themselves. */
export function displayName(id: string): string {
  return USERS.find((u) => u.id === id)?.name ?? id;
}

/**
 * Which pages each role may open. Presentation only: the API enforces no
 * authorization, so this hides pages rather than protecting them (ADR-0003).
 */
export const VIEWS_BY_ROLE: Record<Role, View[]> = {
  member: ['timetable'],
  trainer: ['timetable', 'trainer'],
  admin: ['timetable', 'admin', 'trainer'],
};

export const VIEW_LABELS: Record<View, string> = {
  timetable: 'Timetable',
  admin: 'Admin',
  trainer: 'Trainer',
};
