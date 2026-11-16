-- Kana Wilds challenger rewards (docs/KANA-BATTLE.md section 9). Beating Chun and Tama brings more rows into the
-- wilds (checked by the API, no data); beating Pon earns the title "Sharp Eyes", an achievement (its rule is in
-- src/gamification/achievementRules.ts).
INSERT INTO achievements (id, title, description, xp_reward, category, icon, sort_order) VALUES
  ('sharp_eyes', 'Sharp Eyes', 'Beat Pon on the Games island in Kana Wilds.', 75, 'games', '👀', 90)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, xp_reward = EXCLUDED.xp_reward,
  category = EXCLUDED.category, icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order;
