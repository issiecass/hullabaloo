-- 0002_checkins: "I'll go outside" taps from the /interrupt page. Backs /stats.
-- user_id is nullable because the Shortcut opens /interrupt in Safari, where nobody may be logged in.

BEGIN;

CREATE TABLE IF NOT EXISTS checkins (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    bigint REFERENCES users (id) ON DELETE SET NULL,
  app        text NOT NULL DEFAULT 'instagram',
  action     text NOT NULL DEFAULT 'went_outside',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checkins_created_at_idx ON checkins (created_at);
CREATE INDEX IF NOT EXISTS checkins_user_id_idx ON checkins (user_id);

INSERT INTO schema_migrations (version) VALUES ('0002_checkins')
ON CONFLICT DO NOTHING;

COMMIT;