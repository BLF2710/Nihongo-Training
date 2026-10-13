-- Lets an administrator open every unit and lesson for one account, regardless of prerequisites.
ALTER TABLE users ADD COLUMN IF NOT EXISTS all_lessons_unlocked BOOLEAN NOT NULL DEFAULT FALSE;
