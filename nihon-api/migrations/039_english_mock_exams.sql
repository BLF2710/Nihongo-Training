-- English learners take mock exams too: results may be for the English levels (A2–C1) as well as N5–N1.
DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT con.conname FROM pg_constraint con
     WHERE con.conrelid = 'mock_exam_results'::regclass AND con.contype = 'c' AND pg_get_constraintdef(con.oid) LIKE '%course_level%'
  LOOP
    EXECUTE format('ALTER TABLE mock_exam_results DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;
ALTER TABLE mock_exam_results ADD CONSTRAINT mock_exam_results_course_level_check
  CHECK (course_level IN ('N5', 'N4', 'N3', 'N2', 'N1', 'A2', 'B1', 'B2', 'C1'));
