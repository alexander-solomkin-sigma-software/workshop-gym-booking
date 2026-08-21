import Database from 'better-sqlite3';
import path from 'node:path';

export type Db = Database.Database;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS classes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sessions (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id  INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  starts_at TEXT NOT NULL,
  capacity  INTEGER NOT NULL CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS bookings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id  TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (session_id, member_id)
);
`;

/** Apply the schema to a connection (idempotent). */
export function createSchema(db: Db): void {
  db.exec(SCHEMA);
}

/** Open (or create) a SQLite database at the given path and ensure the schema. */
export function openDb(dbPath: string): Db {
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  createSchema(db);
  return db;
}

/** Open a fresh in-memory database — used by tests for isolation. */
export function openMemoryDb(): Db {
  return openDb(':memory:');
}

/** Default on-disk location for the seeded app database. */
export function defaultDbPath(): string {
  return process.env.GYM_DB_PATH ?? path.join(process.cwd(), 'data', 'gym.sqlite');
}
