-- Conversations between learners, with the support team, and with the study assistant.
-- One table holds all three kinds so inboxes, unread counts and moderation work the same way.
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('direct', 'support', 'assistant')),
  subject VARCHAR(120) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  -- A direct conversation exists once per pair of learners: "smaller id:larger id".
  direct_key VARCHAR(40) UNIQUE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  -- The last message the support team has read in a support conversation (one shared inbox for all administrators).
  staff_read_message_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'direct') = (direct_key IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_conversations_support ON conversations(status, last_message_at DESC) WHERE kind = 'support';

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Read state is kept as the last message id read, so it never depends on clock precision.
  last_read_message_id INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  -- Null for the study assistant, or when the sender's account was deleted.
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('learner', 'admin', 'assistant')),
  body VARCHAR(4000) NOT NULL CHECK (LENGTH(TRIM(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_time ON messages(sender_id, created_at);

-- A learner who blocks another receives no further direct messages from them.
CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
