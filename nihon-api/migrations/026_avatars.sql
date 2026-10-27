-- Profile pictures, uploaded by learners and kept by the API itself. Only one small re-encoded image per learner is
-- stored (128×128 WebP, a few KB); the original upload is never kept. A new picture replaces the old one, and the
-- picture goes with the account.
CREATE TABLE IF NOT EXISTS user_avatars (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Random, and new for every upload: the picture's address, so it can be cached forever and can't be guessed.
  image_key CHAR(32) NOT NULL UNIQUE,
  image BYTEA NOT NULL CHECK (octet_length(image) <= 65536),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_profiles.avatar held a link to an image elsewhere. It could not be set from the site and is no longer read;
-- profiles show the uploaded picture instead.
COMMENT ON COLUMN user_profiles.avatar IS 'Unused since migration 026 (pictures are in user_avatars).';
