import { Router } from 'express';
import type { Db } from '../db.js';
import { ValidationError } from '../errors.js';
import {
  createClass,
  editClass,
  listClassesWithSessions,
  scheduleSession,
  setCapacity,
} from '../services/class-service.js';

/** Admin endpoints: manage classes, schedule sessions, set capacity. */
export function adminRoutes(db: Db): Router {
  const router = Router();

  // GET /api/admin/classes
  router.get('/admin/classes', (_req, res) => {
    res.json(listClassesWithSessions(db));
  });

  // POST /api/admin/classes  { name, description }
  router.post('/admin/classes', (req, res, next) => {
    try {
      const { name, description } = req.body ?? {};
      res.status(201).json(createClass(db, name, description));
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/admin/classes/:id  { name, description }
  router.put('/admin/classes/:id', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) throw new ValidationError('numeric class id required');
      const { name, description } = req.body ?? {};
      res.json(editClass(db, id, name, description));
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/sessions  { classId, startsAt, capacity }
  router.post('/admin/sessions', (req, res, next) => {
    try {
      const { classId, startsAt, capacity } = req.body ?? {};
      if (!Number.isInteger(classId)) throw new ValidationError('classId (integer) required');
      res.status(201).json(scheduleSession(db, classId, String(startsAt ?? ''), Number(capacity)));
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/admin/sessions/:id/capacity  { capacity }
  router.put('/admin/sessions/:id/capacity', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) throw new ValidationError('numeric session id required');
      const { capacity } = req.body ?? {};
      res.json(setCapacity(db, id, Number(capacity)));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
