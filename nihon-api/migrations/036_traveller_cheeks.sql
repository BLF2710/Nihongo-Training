-- The traveller's cheeks (plain or rosy) as a part of their look; looks saved before it have plain cheeks.
ALTER TABLE traveller_looks ADD COLUMN IF NOT EXISTS cheeks VARCHAR(20) NOT NULL DEFAULT 'plain';
