import { Router } from 'express';
import type { Db } from '../db.js';
import { getTrainerSessions } from '../services/trainer-service.js';

/**
 * GET /api/trainer/:trainerId/sessions — the sessions assigned to a trainer,
 * each with its roster and count. An unknown/blank trainer id returns `200 []`
 * (not `404`) — "no sessions" is a valid answer.
 */
export function trainerRoutes(db: Db): Router {
  const router = Router();

  router.get('/trainer/:trainerId/sessions', (req, res) => {
    const trainerId = String(req.params.trainerId ?? '');
    res.json(getTrainerSessions(db, trainerId));
  });

  return router;
}
