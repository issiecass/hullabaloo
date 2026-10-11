-- 0005_actual_minutes: how long an activity really took, as the user reported it.
-- "minutes" stays as the listed time; XP is earned from actual_minutes (1 minute = 1 XP).

BEGIN;

ALTER TABLE completed_activities
  ADD COLUMN IF NOT EXISTS actual_minutes integer CHECK (actual_minutes > 0);

INSERT INTO schema_migrations (version) VALUES ('0005_actual_minutes')
ON CONFLICT DO NOTHING;

COMMIT;