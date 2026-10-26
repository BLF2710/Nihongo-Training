-- Who sees the site announcement: everyone (also guests and the sign-in pages) or signed-in accounts only.
-- Existing announcements keep their current behaviour (everyone).
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS announcement_audience VARCHAR(20) NOT NULL DEFAULT 'everyone'
  CHECK (announcement_audience IN ('everyone', 'learners'));
