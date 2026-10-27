-- Friends, part two: suggestions, activity feed, challenges, friend streaks, nudges, cheers and "studying now".

-- Opt-in choices. A private profile still shares nothing, whatever share_activity says.
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS suggest_me BOOLEAN NOT NULL DEFAULT FALSE;         -- appear in (and see) friend suggestions
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS share_activity BOOLEAN NOT NULL DEFAULT TRUE;      -- lessons, units and achievements in friends' feed
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_studying_now BOOLEAN NOT NULL DEFAULT FALSE;  -- "studying now" on friends' lists

-- One row per learner per active day (the learner's own calendar day), the same days that count for the streak.
-- Friend streaks are the days in a row two friends were both active.
CREATE TABLE IF NOT EXISTS activity_days (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  PRIMARY KEY (user_id, day)
);

-- Earlier active days, rebuilt from the activity already stored (the same sources migration 012 used).
WITH activity AS (
  SELECT user_id, created_at AS at FROM xp_events WHERE source NOT IN ('achievement', 'streak')
  UNION ALL SELECT user_id, created_at FROM quiz_answer_receipts
  UNION ALL SELECT user_id, answered_at FROM kanji_practice_questions WHERE answered_at IS NOT NULL
  UNION ALL SELECT user_id, updated_at FROM user_assessment_progress
)
INSERT INTO activity_days (user_id, day)
SELECT DISTINCT a.user_id, (a.at AT TIME ZONE COALESCE(p.time_zone, 'UTC'))::date
  FROM activity a LEFT JOIN user_profiles p ON p.user_id = a.user_id
 WHERE a.at > NOW() - INTERVAL '400 days'
ON CONFLICT DO NOTHING;

-- A friend challenge: who earns more XP, or completes more lessons, in a few days. Scores are counted live while it
-- runs and stored when it finishes.
CREATE TABLE IF NOT EXISTS friend_challenges (
  id SERIAL PRIMARY KEY,
  challenger_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opponent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric VARCHAR(20) NOT NULL CHECK (metric IN ('xp', 'lessons')),
  days INTEGER NOT NULL CHECK (days IN (3, 7)),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'active', 'declined', 'cancelled', 'finished')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  challenger_score INTEGER,
  opponent_score INTEGER,
  CHECK (challenger_id <> opponent_id)
);
-- At most one open (pending or running) challenge per pair.
CREATE UNIQUE INDEX IF NOT EXISTS friend_challenges_open_pair ON friend_challenges (LEAST(challenger_id, opponent_id), GREATEST(challenger_id, opponent_id))
  WHERE status IN ('pending', 'active');
CREATE INDEX IF NOT EXISTS idx_friend_challenges_challenger ON friend_challenges (challenger_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_challenges_opponent ON friend_challenges (opponent_id, created_at DESC);

-- New notification kinds.
DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT con.conname FROM pg_constraint con
     WHERE con.conrelid = 'notifications'::regclass AND con.contype = 'c' AND pg_get_constraintdef(con.oid) LIKE '%kind%'
  LOOP
    EXECUTE format('ALTER TABLE notifications DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;
ALTER TABLE notifications ADD CONSTRAINT notifications_kind_check
  CHECK (kind IN ('friend_request', 'friend_accepted', 'support_reply', 'achievement', 'nudge', 'cheer', 'challenge'));
-- Nudges and cheers are limited per sender and recipient.
CREATE INDEX IF NOT EXISTS idx_notifications_sender ON notifications (actor_id, user_id, kind, created_at) WHERE actor_id IS NOT NULL;

-- The activity feed reads recent lessons, passed units and achievements of a few learners at a time.
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_time ON user_achievements (user_id, earned_at);
CREATE INDEX IF NOT EXISTS idx_user_assessment_progress_passed ON user_assessment_progress (user_id, passed_at) WHERE passed_at IS NOT NULL;
