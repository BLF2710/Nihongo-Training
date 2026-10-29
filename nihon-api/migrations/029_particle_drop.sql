-- Particle Drop rounds are saved as practice sessions (kind 'particles', scope = course level).
DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT con.conname FROM pg_constraint con
     WHERE con.conrelid = 'practice_sessions'::regclass AND con.contype = 'c' AND pg_get_constraintdef(con.oid) LIKE '%kind%'
  LOOP
    EXECUTE format('ALTER TABLE practice_sessions DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;
ALTER TABLE practice_sessions ADD CONSTRAINT practice_sessions_kind_check
  CHECK (kind IN ('listening', 'speaking', 'reading', 'mock-exam', 'particles'));
