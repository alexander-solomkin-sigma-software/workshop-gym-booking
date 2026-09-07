import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from './app.js';
import { openMemoryDb } from './db.js';
import { seed } from './seed.js';

let app: Express;

beforeEach(() => {
  const db = openMemoryDb();
  seed(db);
  app = createApp(db);
});

describe('API (HTTP surface)', () => {
  it('GET /api/timetable returns seeded sessions', async () => {
    const res = await request(app).get('/api/timetable').query({ memberId: 'm1' });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    // The demo member is pre-booked on the first Yoga session.
    expect(res.body.some((e: { myBookingId: number | null }) => e.myBookingId !== null)).toBe(true);
  });

  it('POST then DELETE /api/bookings books and cancels a place', async () => {
    const timetable = await request(app).get('/api/timetable').query({ memberId: 'zoe' });
    const free = timetable.body.find(
      (e: { isFull: boolean; myBookingId: number | null }) => !e.isFull && e.myBookingId === null,
    );

    const booked = await request(app)
      .post('/api/bookings')
      .send({ sessionId: free.sessionId, memberId: 'zoe' });
    expect(booked.status).toBe(201);

    const cancelled = await request(app)
      .delete(`/api/bookings/${booked.body.id}`)
      .query({ memberId: 'zoe' });
    expect(cancelled.status).toBe(204);
  });

  it('returns 409 when booking a full session', async () => {
    // Seed fills the small Spin session (capacity 3) to capacity.
    const timetable = await request(app).get('/api/timetable').query({ memberId: 'newcomer' });
    const full = timetable.body.find((e: { isFull: boolean }) => e.isFull);
    expect(full).toBeDefined();

    const res = await request(app)
      .post('/api/bookings')
      .send({ sessionId: full.sessionId, memberId: 'newcomer' });
    expect(res.status).toBe(409);
  });

  it('admin can create a class (201) and rejects a blank name (400)', async () => {
    const ok = await request(app)
      .post('/api/admin/classes')
      .send({ name: 'Boxing', description: 'Pads and bags' });
    expect(ok.status).toBe(201);

    const bad = await request(app).post('/api/admin/classes').send({ name: '' });
    expect(bad.status).toBe(400);
  });

  it('GET /api/timetable includes each session endsAt', async () => {
    const res = await request(app).get('/api/timetable').query({ memberId: 'm1' });
    expect(res.status).toBe(200);
    expect(res.body.every((e: { endsAt?: string }) => typeof e.endsAt === 'string')).toBe(true);
  });

  it('admin can schedule a session with a finish time (201) and it reaches the timetable', async () => {
    const created = await request(app)
      .post('/api/admin/classes')
      .send({ name: 'Barre', description: '' });
    const classId = created.body.id;

    const ok = await request(app).post('/api/admin/sessions').send({
      classId,
      startsAt: '2026-09-10T10:00:00.000Z',
      endsAt: '2026-09-10T11:00:00.000Z',
      capacity: 10,
    });
    expect(ok.status).toBe(201);
    expect(ok.body.endsAt).toBe('2026-09-10T11:00:00.000Z');

    const timetable = await request(app).get('/api/timetable').query({ memberId: 'zoe' });
    const entry = timetable.body.find(
      (e: { sessionId: number }) => e.sessionId === ok.body.id,
    );
    expect(entry.startsAt).toBe('2026-09-10T10:00:00.000Z');
    expect(entry.endsAt).toBe('2026-09-10T11:00:00.000Z');
  });

  it('GET /api/trainer/:id/sessions returns a seeded trainer\'s sessions with rosters', async () => {
    const res = await request(app).get('/api/trainer/t-morgan/sessions');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    // Every returned session belongs to the trainer.
    expect(res.body.every((e: { trainer: string }) => e.trainer === 't-morgan')).toBe(true);
    // The 08:00 Yoga session is pre-booked by m1 → non-empty roster with a matching count.
    const booked = res.body.find((e: { startsAt: string }) =>
      e.startsAt.startsWith('2026-09-01T08:00'),
    );
    expect(booked.className).toBe('Yoga Flow');
    expect(booked.roster).toContain('m1');
    expect(booked.booked).toBe(booked.roster.length);
    // The assigned session with no bookings appears with an empty roster.
    const empty = res.body.find((e: { startsAt: string }) =>
      e.startsAt.startsWith('2026-09-03T08:00'),
    );
    expect(empty.roster).toEqual([]);
    expect(empty.booked).toBe(0);
  });

  it('GET /api/trainer/:id/sessions returns 200 [] for an unknown trainer (not 404)', async () => {
    const res = await request(app).get('/api/trainer/ghost/sessions');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('accepts an optional trainer when scheduling and surfaces it in the trainer view', async () => {
    const created = await request(app).post('/api/admin/classes').send({ name: 'Barre' });
    const classId = created.body.id;

    const ok = await request(app).post('/api/admin/sessions').send({
      classId,
      startsAt: '2026-09-12T10:00:00.000Z',
      endsAt: '2026-09-12T11:00:00.000Z',
      capacity: 10,
      trainer: 't-jordan',
    });
    expect(ok.status).toBe(201);
    expect(ok.body.trainer).toBe('t-jordan');

    const view = await request(app).get('/api/trainer/t-jordan/sessions');
    expect(view.status).toBe(200);
    expect(view.body).toHaveLength(1);
    expect(view.body[0].sessionId).toBe(ok.body.id);
    expect(view.body[0].roster).toEqual([]);
  });

  it('rejects scheduling when the finish is not after the start (400)', async () => {
    const created = await request(app)
      .post('/api/admin/classes')
      .send({ name: 'Barre', description: '' });
    const classId = created.body.id;

    const notAfter = await request(app).post('/api/admin/sessions').send({
      classId,
      startsAt: '2026-09-10T10:00:00.000Z',
      endsAt: '2026-09-10T09:30:00.000Z',
      capacity: 10,
    });
    expect(notAfter.status).toBe(400);

    const missing = await request(app).post('/api/admin/sessions').send({
      classId,
      startsAt: '2026-09-10T10:00:00.000Z',
      capacity: 10,
    });
    expect(missing.status).toBe(400);

    // Nothing was scheduled for the new class.
    const classes = await request(app).get('/api/admin/classes');
    const barre = classes.body.find((c: { id: number }) => c.id === classId);
    expect(barre.sessions).toHaveLength(0);
  });
});
