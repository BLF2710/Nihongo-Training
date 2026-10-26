-- Revocable sessions, email verification and password reset.

-- Every sign-in token carries the account's token version. Raising it ("log out everywhere", a password change or
-- reset) makes every older token invalid at once. Tokens issued before this migration count as version 0.
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0 CHECK (token_version >= 0);

-- Set when the learner opens the link sent to their address. Existing accounts start unverified.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Single-use links sent by email. Only a SHA-256 hash of the secret is stored, never the secret itself.
CREATE TABLE IF NOT EXISTS account_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose VARCHAR(30) NOT NULL CHECK (purpose IN ('password_reset', 'email_verification')),
  token_hash CHAR(64) NOT NULL UNIQUE,
  -- The address the link was sent to; a verification link only counts for the address it was sent to.
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_account_tokens_user ON account_tokens (user_id, purpose, created_at DESC);
