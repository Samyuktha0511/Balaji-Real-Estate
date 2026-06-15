-- ============================================================
-- Balaji Real Estate – D1 (SQLite) Schema
-- Compatible with Cloudflare D1 / SQLite 3.x
-- Run via: npm run db:migrate  (local)
--      or: npm run db:migrate:remote  (production)
-- ============================================================

CREATE TABLE IF NOT EXISTS listing (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT,
  address     TEXT,
  price       TEXT,           -- stored as TEXT to avoid float precision loss
  area        TEXT,
  description TEXT,
  phone       TEXT,
  email       TEXT,
  latitude    REAL,
  longitude   REAL,
  status      TEXT NOT NULL DEFAULT 'available',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listing_photos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id  INTEGER NOT NULL REFERENCES listing(id) ON DELETE CASCADE,
  photo       TEXT NOT NULL         -- R2 object key (UUID + ext)
);

CREATE TABLE IF NOT EXISTS listing_docs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id  INTEGER NOT NULL REFERENCES listing(id) ON DELETE CASCADE,
  doc         TEXT NOT NULL         -- R2 object key (UUID + ext)
);

-- Enable foreign key enforcement (SQLite default is OFF)
PRAGMA foreign_keys = ON;
