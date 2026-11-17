-- Sharp Eyes, Pon's reward in Kana Wilds, is a skill in the game (wild kana show their stroke count from the start),
-- not an achievement: removes the achievement where an earlier build of this branch added it. Does nothing otherwise.
DELETE FROM user_achievements WHERE achievement_id = 'sharp_eyes';
DELETE FROM achievements WHERE id = 'sharp_eyes';
