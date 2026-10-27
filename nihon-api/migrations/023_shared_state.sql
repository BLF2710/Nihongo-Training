-- State shared by several API processes (SHARED_STATE=postgres): rate-limit windows and Google sign-in nonces.
-- Live updates use LISTEN/NOTIFY and need no table.

-- One fixed window per rule and key (e.g. "login-address:203.0.113.5"); expired rows are swept from time to time.
CREATE TABLE IF NOT EXISTS rate_limit_windows (
  id VARCHAR(400) PRIMARY KEY,
  count INTEGER NOT NULL CHECK (count >= 1),
  reset_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_windows_reset ON rate_limit_windows (reset_at);

-- One-time numbers handed to "Sign in with Google"; a nonce is deleted when it is used.
CREATE TABLE IF NOT EXISTS sign_in_nonces (
  nonce VARCHAR(64) PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sign_in_nonces_expiry ON sign_in_nonces (expires_at);
