-- Moderation (an administrator audit log and structured learner reports) and lesson editing in the admin area.

-- Who did what in the admin area, and when. Rows are only ever added.
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(40) NOT NULL,
  target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  -- What was changed (e.g. a lesson id or support request id), shown in the log.
  target_ref VARCHAR(160),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_time ON admin_audit_log (id DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log (action, id DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log (target_user_id, id DESC);

-- A learner's report about another learner (their profile or a message). The support request it opened is where
-- the conversation with the reporter happens; open reports about the same learner are handled together.
CREATE TABLE IF NOT EXISTS learner_reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('profile', 'message')),
  reason VARCHAR(500) NOT NULL DEFAULT '',
  support_conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolution VARCHAR(20) CHECK (resolution IN ('dismissed', 'warned', 'suspended')),
  CHECK (reporter_id <> reported_id)
);
CREATE INDEX IF NOT EXISTS idx_learner_reports_open ON learner_reports (reported_id, created_at) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learner_reports_reporter ON learner_reports (reporter_id, created_at);

-- Reports sent before this migration were support requests only; link those that can be recognised by subject.
INSERT INTO learner_reports (reporter_id, reported_id, kind, reason, support_conversation_id, created_at, resolved_at)
SELECT c.created_by, u.id, CASE WHEN c.subject LIKE 'Report: learner @%' THEN 'profile' ELSE 'message' END, '', c.id, c.created_at,
       CASE WHEN c.status = 'closed' THEN c.last_message_at END
  FROM conversations c
  JOIN users u ON LOWER(u.username) = LOWER(SUBSTRING(c.subject FROM '@([A-Za-z0-9_]+)$'))
 WHERE c.kind = 'support' AND (c.subject LIKE 'Report: learner @%' OR c.subject LIKE 'Report: message from @%')
   AND c.created_by IS NOT NULL AND c.created_by <> u.id
   AND NOT EXISTS (SELECT 1 FROM learner_reports r WHERE r.support_conversation_id = c.id);

-- Lesson edits made in the admin area. The draft is what the editor is working on; the published version is what
-- learners see in place of the built-in lesson content. Removing the published version restores the built-in one.
CREATE TABLE IF NOT EXISTS lesson_edits (
  lesson_id VARCHAR(120) PRIMARY KEY,
  draft JSONB,
  draft_updated_at TIMESTAMPTZ,
  draft_updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published JSONB,
  published_at TIMESTAMPTZ,
  published_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  -- Raised on every publish or revert, so clients can tell their copy is out of date.
  revision INTEGER NOT NULL DEFAULT 0
);
