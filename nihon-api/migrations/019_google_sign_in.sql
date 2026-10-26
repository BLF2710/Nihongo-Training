-- Sign in with Google. An account is linked to a Google account by Google's permanent account id ("sub"),
-- never by email address (addresses can change hands). Accounts created through Google may have no password.
CREATE TABLE IF NOT EXISTS user_identities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('google')),
  provider_subject VARCHAR(255) NOT NULL,
  -- The Google address when the account was linked or last used, shown in settings.
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_subject),
  UNIQUE (user_id, provider)
);
