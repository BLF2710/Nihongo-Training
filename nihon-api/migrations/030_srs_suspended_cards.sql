-- A suspended card stays in the deck (so syncing a lesson never adds it back) but is left out of reviews and counts.
ALTER TABLE srs_cards ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
