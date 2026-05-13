-- CRM Lead Copilot — D1 schema (SQLite dialect)

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT,
  role          TEXT    NOT NULL DEFAULT 'USER' CHECK (role IN ('SUPER_ADMIN','ADMIN','USER')),
  status        TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  phone         TEXT,
  dept          TEXT,
  line_user_id  TEXT,
  line_linked   INTEGER NOT NULL DEFAULT 0,
  color         TEXT,
  joined_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT    NOT NULL,
  phone           TEXT,
  email           TEXT,
  company         TEXT,
  source          TEXT,
  campaign        TEXT,
  medium          TEXT,
  status          TEXT    NOT NULL DEFAULT 'NEW'
                  CHECK (status IN ('NEW','CONTACTED','QUALIFIED','PROPOSAL_SENT','FOLLOW_UP','WON','LOST')),
  score           INTEGER NOT NULL DEFAULT 0,
  budget          INTEGER,
  interest        TEXT,
  assignee_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  line_id         TEXT,
  notes           TEXT,
  tags            TEXT, -- JSON array
  last_contact    TEXT,
  next_follow_up  TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  utm_term        TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_status   ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assignee ON leads(assignee_id);
CREATE INDEX IF NOT EXISTS idx_leads_score    ON leads(score);

CREATE TABLE IF NOT EXISTS campaigns (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  source          TEXT,
  budget          INTEGER DEFAULT 0,
  spent           INTEGER DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  start_date      TEXT,
  end_date        TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lead_activities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id     INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  note        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activities_lead ON lead_activities(lead_id);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
