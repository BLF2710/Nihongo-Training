-- The learner's traveller (the character walking the island map, the village, the wild paths and the battles): what
-- they wear and look like. One row per learner; a learner with no row has the default look. The allowed ids are
-- checked by the API (traveller.service.ts), so adding a choice needs no migration.
CREATE TABLE IF NOT EXISTS traveller_looks (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  outfit VARCHAR(20) NOT NULL,
  sash VARCHAR(20) NOT NULL,
  skin VARCHAR(20) NOT NULL,
  hair VARCHAR(20) NOT NULL,
  hat VARCHAR(20) NOT NULL,
  accessory VARCHAR(20) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
