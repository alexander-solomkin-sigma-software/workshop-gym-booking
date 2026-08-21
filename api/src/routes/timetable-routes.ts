import { Router } from 'express';
import type { Db } from '../db.js';
import { getTimetable } from '../services/booking-service.js';

/** GET /api/timetable?memberId= — the annotated upcoming timetable. */
export function timetableRoutes(db: Db): Router {
  const router = Router();

  router.get('/timetable', (req, res) => {
    const memberId = String(req.query.memberId ?? '');
    res.json(getTimetable(db, memberId));
  });

  return router;
}
