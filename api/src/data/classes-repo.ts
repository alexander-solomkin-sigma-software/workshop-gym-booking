import type { Db } from '../db.js';
import type { ClassRow } from '../types.js';

/** Data-layer access to the `classes` table. No business rules here. */

export function listClasses(db: Db): ClassRow[] {
  return db.prepare('SELECT id, name, description FROM classes ORDER BY name').all() as ClassRow[];
}

export function getClass(db: Db, id: number): ClassRow | undefined {
  return db.prepare('SELECT id, name, description FROM classes WHERE id = ?').get(id) as
    | ClassRow
    | undefined;
}

export function insertClass(db: Db, name: string, description: string): ClassRow {
  const info = db
    .prepare('INSERT INTO classes (name, description) VALUES (?, ?)')
    .run(name, description);
  return getClass(db, Number(info.lastInsertRowid))!;
}

export function updateClass(db: Db, id: number, name: string, description: string): void {
  db.prepare('UPDATE classes SET name = ?, description = ? WHERE id = ?').run(name, description, id);
}
