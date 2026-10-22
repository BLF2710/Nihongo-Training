-- Public profiles and friends.
-- Profile visibility gains a "friends" level: private (only you), friends (your friends), public (any signed-in learner).
DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT con.conname FROM pg_constraint con
     WHERE con.conrelid = 'user_profiles'::regclass AND con.contype = 'c' AND pg_get_constraintdef(con.oid) LIKE '%profile_visibility%'
  LOOP
    EXECUTE format('ALTER TABLE user_profiles DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_profile_visibility_check CHECK (profile_visibility IN ('private', 'friends', 'public'));

-- Whether other learners can send this learner a friend request.
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS friend_requests VARCHAR(20) NOT NULL DEFAULT 'everyone'
  CHECK (friend_requests IN ('everyone', 'nobody'));

-- One row per pair of learners: a pending request, a friendship, or a declined request (kept for a short
-- cool-down so the same request cannot be sent again at once).
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  CHECK (requester_id <> addressee_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_unique ON friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships (addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships (requester_id, status, created_at);
