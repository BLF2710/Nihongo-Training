-- Notification centre: a stored history of things that happened to a learner, with read state.
-- The actor's name is looked up when listing, so renamed or deleted accounts show correctly.
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(30) NOT NULL CHECK (kind IN ('friend_request', 'friend_accepted', 'support_reply', 'achievement')),
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id) WHERE read_at IS NULL;

-- The friends leaderboard counts XP and lessons from the last 7 days.
CREATE INDEX IF NOT EXISTS idx_xp_events_user_time ON xp_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_time ON lesson_progress (user_id, completed_at);
