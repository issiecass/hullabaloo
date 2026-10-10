-- 0001_init: starting schema, matching what the frontend saves in storage.ts.
-- Run with: psql -U postgres -d touchgrass -f database/migrations/0001_init.sql
-- Never edit this file once it has been run on a shared database; add 0002_... instead.

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- One row per account. Mirrors the frontend Profile type.
CREATE TABLE IF NOT EXISTS users (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name                text NOT NULL,
  email               text NOT NULL,
  -- Only ever a hash (e.g. bcrypt), never the password. Null until a backend handles sign-up.
  password_hash       text,
  spice_level         smallint NOT NULL DEFAULT 2 CHECK (spice_level BETWEEN 1 AND 4),
  interests           text[] NOT NULL DEFAULT '{}',
  filters             text[] NOT NULL DEFAULT '{free,nearby,hour}'
                        CHECK (filters <@ ARRAY['free', 'nearby', 'hour']),
  -- Onboarding answers: { meaningTo, freeHour[], people, avoid }. Kept as jsonb while the questions are still changing.
  answers             jsonb NOT NULL DEFAULT '{}',
  -- Set by "Snooze 30 min" and "Stop chirping today"; chirps are off while now() is before this.
  chirps_paused_until timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (lower(email));

-- Mirrors the frontend Todo type. "Overdue" is worked out from due_date rather than stored.
CREATE TABLE IF NOT EXISTS todos (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    bigint NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  text       text NOT NULL CHECK (length(trim(text)) > 0),
  note       text,
  due_date   date,
  done       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos (user_id);

-- Activities the user started from the ideas screen; backs the "dopamine receipt".
-- Ideas are generated fresh by the AI each time, so the activity is copied in rather than referenced.
CREATE TABLE IF NOT EXISTS completed_activities (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      bigint NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  tag          text NOT NULL CHECK (tag IN ('QUICK WIN', 'NOVELTY', 'SOCIAL')),
  title        text NOT NULL,
  minutes      integer NOT NULL CHECK (minutes > 0),
  step         text NOT NULL,
  free         boolean NOT NULL,
  nearby       boolean NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS completed_activities_user_id_idx ON completed_activities (user_id);

INSERT INTO schema_migrations (version) VALUES ('0001_init')
ON CONFLICT DO NOTHING;

COMMIT;
