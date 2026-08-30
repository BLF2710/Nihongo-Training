CREATE TABLE IF NOT EXISTS xp_events (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  source VARCHAR(40) NOT NULL,
  reference_id VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, source, reference_id)
);
CREATE INDEX IF NOT EXISTS xp_events_user_created_idx ON xp_events (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed')),
  challenge_score INTEGER CHECK (challenge_score BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS lesson_progress_user_completed_idx ON lesson_progress (user_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(80) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0 CHECK (xp_reward >= 0)
);
INSERT INTO achievements (id, title, description, xp_reward) VALUES
  ('first_steps', 'First Steps', 'Complete your first lesson.', 25),
  ('week_warrior', 'Week Warrior', 'Maintain a 7-day streak.', 75),
  ('vocabulary_starter', 'Vocabulary Starter', 'Learn 100 vocabulary items.', 100),
  ('japanese_beginner', 'Japanese Beginner', 'Complete Japanese N5 Unit 1.', 50),
  ('perfect_score', 'Perfect Score', 'Get 100% on a lesson challenge.', 50)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, xp_reward=EXCLUDED.xp_reward;

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(80) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress INTEGER,
  PRIMARY KEY (user_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS user_achievements_user_earned_idx ON user_achievements (user_id, earned_at DESC);
