-- The mistake notebook also keeps wrong kana answers (speed quiz, kana review) and wrong kanji practice answers.
DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT con.conname FROM pg_constraint con
     WHERE con.conrelid = 'mistakes'::regclass AND con.contype = 'c' AND pg_get_constraintdef(con.oid) LIKE '%source%'
  LOOP
    EXECUTE format('ALTER TABLE mistakes DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;
ALTER TABLE mistakes ADD CONSTRAINT mistakes_source_check
  CHECK (source IN ('lesson', 'review', 'assessment', 'mock_exam', 'kana', 'kanji'));
