-- Daily learning streaks. A day counts when the learner does graded learning work: completing a lesson,
-- answering a kana or kanji practice question, submitting an assessment, answering a review question,
-- or finishing a game. Days follow the learner's own time zone (sent by their browser).
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS time_zone VARCHAR(64) NOT NULL DEFAULT 'UTC';

-- Streaks were never recorded before this migration. Rebuild them from the activity already stored,
-- counting days in UTC because no time zones were known yet.
WITH activity AS (
  SELECT user_id, created_at AS at FROM xp_events WHERE source NOT IN ('achievement', 'streak')
  UNION ALL SELECT user_id, created_at FROM quiz_answer_receipts
  UNION ALL SELECT user_id, answered_at FROM kanji_practice_questions WHERE answered_at IS NOT NULL
  UNION ALL SELECT user_id, updated_at FROM user_assessment_progress
), days AS (
  SELECT user_id, (at AT TIME ZONE 'UTC')::date AS day, MAX(at) AS last_at FROM activity GROUP BY user_id, (at AT TIME ZONE 'UTC')::date
), runs AS (
  -- Consecutive days share the same (day - row number): the classic gaps-and-islands grouping.
  SELECT user_id, day, last_at, day - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY day))::int AS run FROM days
), islands AS (
  SELECT user_id, run, COUNT(*)::int AS length, MAX(day) AS last_day, MAX(last_at) AS last_at FROM runs GROUP BY user_id, run
), summary AS (
  SELECT user_id, MAX(length) AS longest, (ARRAY_AGG(length ORDER BY last_day DESC))[1] AS latest, MAX(last_at) AS last_at
    FROM islands GROUP BY user_id
)
UPDATE user_gamification g
   SET current_streak = s.latest,
       longest_streak = GREATEST(g.longest_streak, s.longest),
       last_activity_at = s.last_at,
       updated_at = NOW()
  FROM summary s
 WHERE g.user_id = s.user_id;
