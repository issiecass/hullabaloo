-- 0003_shortcut_key: the secret the iOS Shortcut sends to /should-interrupt and /snooze instead of a login token.
-- The default fills in a different key for every existing user and for each new sign-up.

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS shortcut_key uuid NOT NULL UNIQUE DEFAULT gen_random_uuid();

INSERT INTO schema_migrations (version) VALUES ('0003_shortcut_key')
ON CONFLICT DO NOTHING;

COMMIT;
