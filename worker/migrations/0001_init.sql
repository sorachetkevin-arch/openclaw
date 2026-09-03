-- Pest control CRM — initial schema.
-- Mirrors the Job interface in frontend/types.ts.
-- insect_types is a JSON array of InsectType strings; D1 (SQLite) has no array type.

CREATE TABLE IF NOT EXISTS jobs (
  id                  TEXT PRIMARY KEY,
  created_at          TEXT NOT NULL,
  customer_name       TEXT NOT NULL,
  customer_phone      TEXT NOT NULL,
  customer_line_id    TEXT,
  address             TEXT NOT NULL,
  insect_types        TEXT NOT NULL DEFAULT '[]',
  property_type       TEXT NOT NULL,
  area_m2             REAL NOT NULL,
  problem_description TEXT NOT NULL DEFAULT '',
  status              TEXT NOT NULL,
  estimated_price     REAL NOT NULL DEFAULT 0,
  final_price         REAL,
  scheduled_date      TEXT,
  completed_date      TEXT,
  technician          TEXT,
  notes               TEXT,
  source              TEXT NOT NULL,
  warranty_months     INTEGER,
  follow_up_date      TEXT,
  updated_at          TEXT NOT NULL,

  CHECK (status IN ('new','quoted','confirmed','scheduled','completed','cancelled')),
  CHECK (property_type IN ('house','townhouse','condo','office','restaurant','factory')),
  CHECK (source IN ('line','facebook','phone','walk-in','referral')),
  CHECK (area_m2 > 0),
  CHECK (estimated_price >= 0),
  CHECK (final_price IS NULL OR final_price >= 0),
  CHECK (json_valid(insect_types))
);

-- The job list is the hot path: newest first, filtered by status.
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status     ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_follow_up  ON jobs (follow_up_date)
  WHERE follow_up_date IS NOT NULL;
