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
});
