-- 0004_xp: the user's running total of real-life XP, shown on the reward receipt.
-- Existing users start at 0.

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0 CHECK (xp >= 0);

INSERT INTO schema_migrations (version) VALUES ('0004_xp')
ON CONFLICT DO NOTHING;

COMMIT;
