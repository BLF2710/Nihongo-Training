-- Gamification overhaul: achievements in categories with an icon and an order, more achievements, level-up notifications.
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'lessons';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS icon VARCHAR(16) NOT NULL DEFAULT '🏅';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS sort_order SMALLINT NOT NULL DEFAULT 0;

-- The rule (which fact, and the goal) for each achievement lives in src/gamification/achievementRules.ts.
INSERT INTO achievements (id, title, description, xp_reward, category, icon, sort_order) VALUES
  ('first_steps', 'First Steps', 'Complete your first lesson.', 25, 'lessons', '👣', 10),
  ('lessons_10', 'Steady Learner', 'Complete 10 lessons.', 50, 'lessons', '📘', 11),
  ('lessons_50', 'Lesson Marathon', 'Complete 50 lessons.', 150, 'lessons', '📚', 12),
  ('perfect_score', 'Perfect Score', 'Get 100% on a lesson challenge.', 50, 'lessons', '💯', 13),
  ('perfect_10', 'Flawless', 'Get 100% on 10 lesson challenges.', 100, 'lessons', '✨', 14),
  ('japanese_beginner', 'Japanese Beginner', 'Pass your first unit assessment.', 50, 'units', '🎓', 20),
  ('units_5', 'Unit Climber', 'Pass 5 unit assessments.', 100, 'units', '🧗', 21),
  ('units_10', 'Course Conqueror', 'Pass 10 unit assessments.', 250, 'units', '🏔️', 22),
  ('vocabulary_starter', 'Vocabulary Starter', 'Learn 100 words in daily review.', 100, 'review', '🔤', 30),
  ('reviews_100', 'Review Rookie', 'Review 100 cards.', 50, 'review', '🃏', 31),
  ('reviews_1000', 'Memory Keeper', 'Review 1,000 cards.', 200, 'review', '🧠', 32),
  ('mature_50', 'Long-Term Memory', 'Have 50 cards you remember for 3 weeks or more.', 150, 'review', '🌳', 33),
  ('mistakes_10', 'Learning from Mistakes', 'Clear 10 mistakes from your notebook.', 50, 'review', '🩹', 34),
  ('mistakes_100', 'Error Eraser', 'Clear 100 mistakes from your notebook.', 150, 'review', '🧽', 35),
  ('kanji_10', 'Kanji Apprentice', 'Master 10 kanji.', 50, 'kanji', '🖌️', 40),
  ('kanji_50', 'Kanji Adept', 'Master 50 kanji.', 150, 'kanji', '🏯', 41),
  ('kanji_150', 'Kanji Scholar', 'Master 150 kanji.', 300, 'kanji', '📜', 42),
  ('streak_3', 'On a Roll', 'Study 3 days in a row.', 25, 'streaks', '🔥', 50),
  ('week_warrior', 'Week Warrior', 'Study 7 days in a row.', 75, 'streaks', '⚔️', 51),
  ('streak_30', 'Monthly Devotion', 'Study 30 days in a row.', 200, 'streaks', '📅', 52),
  ('streak_100', 'Unstoppable', 'Study 100 days in a row.', 500, 'streaks', '🚀', 53),
  ('goal_7', 'Goal Getter', 'Meet your daily goal on 7 days.', 75, 'streaks', '🎯', 54),
  ('practice_10', 'Well Practised', 'Finish 10 listening, speaking or reading sessions.', 50, 'tests', '🎧', 60),
  ('mock_pass', 'Exam Ready', 'Pass a mock exam.', 150, 'tests', '📝', 61),
  ('speaking_pass', 'Clear Speaker', 'Meet the goal of a speaking test.', 75, 'tests', '🗣️', 62),
  ('friends_1', 'Study Buddy', 'Make your first friend.', 25, 'friends', '🤝', 70),
  ('friends_5', 'Study Circle', 'Have 5 friends.', 75, 'friends', '👥', 71),
  ('level_5', 'Rising Star', 'Reach level 5.', 50, 'levels', '⭐', 80),
  ('level_10', 'Seasoned Learner', 'Reach level 10.', 150, 'levels', '🌟', 81),
  ('level_20', 'Lingora Legend', 'Reach level 20.', 400, 'levels', '👑', 82)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, xp_reward = EXCLUDED.xp_reward,
  category = EXCLUDED.category, icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order;

-- Daily XP caps add up a learner's XP per source and day.
CREATE INDEX IF NOT EXISTS idx_xp_events_user_source_time ON xp_events (user_id, source, created_at);

-- New notification kind.
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
  CHECK (kind IN ('friend_request', 'friend_accepted', 'support_reply', 'achievement', 'nudge', 'cheer', 'challenge', 'level_up'));
