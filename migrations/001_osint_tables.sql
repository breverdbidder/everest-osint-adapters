-- OSINT-002: Create OSINT intelligence tables
-- Run via: supabase db push OR paste into SQL Editor
-- Project: mocerqjnksmhcjzxrewo

-- Source registry
CREATE TABLE IF NOT EXISTS osint_sources (
  id            SERIAL PRIMARY KEY,
  adapter_id    TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  tier          INT NOT NULL,
  refresh_freq  TEXT NOT NULL,
  counties      INT DEFAULT 67,
  last_fetch    TIMESTAMPTZ,
  next_fetch    TIMESTAMPTZ,
  status        TEXT DEFAULT 'active',
  error_count   INT DEFAULT 0,
  config        JSONB DEFAULT '{}'
);

-- Core event table
CREATE TABLE IF NOT EXISTS osint_events (
  id            BIGSERIAL PRIMARY KEY,
  source_id     INT REFERENCES osint_sources(id),
  event_type    TEXT NOT NULL,
  county        TEXT NOT NULL,
  pin           TEXT,
  data          JSONB NOT NULL,
  confidence    INT DEFAULT 50,
  raw_data      JSONB,
  fetched_at    TIMESTAMPTZ DEFAULT NOW(),
  event_date    DATE,
  dedup_hash    TEXT UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Correlation rules
CREATE TABLE IF NOT EXISTS osint_correlations (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  rule_yaml     TEXT NOT NULL,
  event_types   TEXT[] NOT NULL,
  output_type   TEXT NOT NULL,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Time Machine snapshots
CREATE TABLE IF NOT EXISTS osint_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  county        TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  metrics       JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(county, snapshot_date)
);

-- Property intelligence scores
CREATE TABLE IF NOT EXISTS osint_scores (
  id            BIGSERIAL PRIMARY KEY,
  pin           TEXT NOT NULL,
  county        TEXT NOT NULL,
  score_type    TEXT NOT NULL,
  score         INT NOT NULL,
  factors       JSONB NOT NULL,
  computed_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pin, score_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_osint_events_county ON osint_events(county);
CREATE INDEX IF NOT EXISTS idx_osint_events_type ON osint_events(event_type);
CREATE INDEX IF NOT EXISTS idx_osint_events_pin ON osint_events(pin);
CREATE INDEX IF NOT EXISTS idx_osint_events_date ON osint_events(event_date);
CREATE INDEX IF NOT EXISTS idx_osint_events_dedup ON osint_events(dedup_hash);
CREATE INDEX IF NOT EXISTS idx_osint_events_source ON osint_events(source_id);
CREATE INDEX IF NOT EXISTS idx_osint_snapshots_county ON osint_snapshots(county, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_osint_scores_pin ON osint_scores(pin);
CREATE INDEX IF NOT EXISTS idx_osint_scores_type ON osint_scores(score_type);
