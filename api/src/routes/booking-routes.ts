import { Router } from 'express';
import type { Db } from '../db.js';
import { ValidationError } from '../errors.js';
import { book, cancel } from '../services/booking-service.js';

/** Member booking endpoints: create and cancel a booking. */
export function bookingRoutes(db: Db): Router {
  const router = Router();

  // POST /api/bookings  { sessionId, memberId }
  router.post('/bookings', (req, res, next) => {
    try {
      const { sessionId, memberId } = req.body ?? {};
      if (!Number.isInteger(sessionId) || !memberId) {
        throw new ValidationError('sessionId (integer) and memberId are required');
      }
      const booking = book(db, sessionId, String(memberId));
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/bookings/:id?memberId=
  router.delete('/bookings/:id', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const memberId = String(req.query.memberId ?? '');
      if (!Number.isInteger(id) || !memberId) {
        throw new ValidationError('a numeric booking id and memberId are required');
      }
      cancel(db, id, memberId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
