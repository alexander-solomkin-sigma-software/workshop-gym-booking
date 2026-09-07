import express, { type ErrorRequestHandler, type Express } from 'express';
import cors from 'cors';
import type { Db } from './db.js';
import { AppError } from './errors.js';
import { timetableRoutes } from './routes/timetable-routes.js';
import { bookingRoutes } from './routes/booking-routes.js';
import { adminRoutes } from './routes/admin-routes.js';
import { trainerRoutes } from './routes/trainer-routes.js';

/** Translate domain errors into HTTP responses; hide unexpected errors as 500. */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'internal error' });
};

/** Build the Express app around a database connection (injected for testability). */
export function createApp(db: Db): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', timetableRoutes(db));
  app.use('/api', bookingRoutes(db));
  app.use('/api', adminRoutes(db));
  app.use('/api', trainerRoutes(db));

  app.use(errorHandler);
  return app;
}
