-- Baseline: the tables that existed before migrations were introduced, so a new database can be built from
-- the migrations alone. Every statement is safe on an existing database (it changes nothing there): later
-- migrations add the newer columns, constraints and tables.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hiraganas (
  id SERIAL PRIMARY KEY,
  kana VARCHAR(10) NOT NULL,
  romaji VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS katakanas (
  id SERIAL PRIMARY KEY,
  kana VARCHAR(10) NOT NULL,
  romaji VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  hiragana_id INTEGER REFERENCES hiraganas(id),
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  UNIQUE (user_id, hiragana_id)
);

CREATE TABLE IF NOT EXISTS user_katakana_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  katakana_id INTEGER REFERENCES katakanas(id) ON DELETE CASCADE,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  UNIQUE (user_id, katakana_id)
);

-- Also created at server start by services/games.seed.ts (kept there; both are idempotent).
CREATE TABLE IF NOT EXISTS user_game_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  game_type VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5, 2) NOT NULL DEFAULT 0,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'all',
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMP NOT NULL DEFAULT NOW(),
  session_id VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON user_game_scores (user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_type ON user_game_scores (game_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_scores_user_session ON user_game_scores (user_id, session_id) WHERE session_id IS NOT NULL;

-- The hiragana quiz catalog, with the ids progress rows refer to.
INSERT INTO hiraganas (id, kana, romaji) VALUES
  (1, 'あ', 'a'),
  (2, 'い', 'i'),
  (3, 'う', 'u'),
  (4, 'え', 'e'),
  (5, 'お', 'o'),
  (6, 'か', 'ka'),
  (7, 'き', 'ki'),
  (8, 'く', 'ku'),
  (9, 'け', 'ke'),
  (10, 'こ', 'ko'),
  (11, 'さ', 'sa'),
  (12, 'し', 'shi'),
  (13, 'す', 'su'),
  (14, 'せ', 'se'),
  (15, 'そ', 'so'),
  (16, 'た', 'ta'),
  (17, 'ち', 'chi'),
  (18, 'つ', 'tsu'),
  (19, 'て', 'te'),
  (20, 'と', 'to'),
  (21, 'な', 'na'),
  (22, 'に', 'ni'),
  (23, 'ぬ', 'nu'),
  (24, 'ね', 'ne'),
  (25, 'の', 'no'),
  (26, 'は', 'ha'),
  (27, 'ひ', 'hi'),
  (28, 'ふ', 'fu'),
  (29, 'へ', 'he'),
  (30, 'ほ', 'ho'),
  (31, 'ま', 'ma'),
  (32, 'み', 'mi'),
  (33, 'む', 'mu'),
  (34, 'め', 'me'),
  (35, 'も', 'mo'),
  (36, 'や', 'ya'),
  (37, 'ゆ', 'yu'),
  (38, 'よ', 'yo'),
  (39, 'ら', 'ra'),
  (40, 'り', 'ri'),
  (41, 'る', 'ru'),
  (42, 'れ', 're'),
  (43, 'ろ', 'ro'),
  (44, 'わ', 'wa'),
  (45, 'を', 'wo'),
  (46, 'ん', 'n'),
  (47, 'が', 'ga'),
  (48, 'ぎ', 'gi'),
  (49, 'ぐ', 'gu'),
  (50, 'げ', 'ge'),
  (51, 'ご', 'go'),
  (52, 'ざ', 'za'),
  (53, 'じ', 'ji'),
  (54, 'ず', 'zu'),
  (55, 'ぜ', 'ze'),
  (56, 'ぞ', 'zo'),
  (57, 'だ', 'da'),
  (58, 'ぢ', 'ji'),
  (59, 'づ', 'zu'),
  (60, 'で', 'de'),
  (61, 'ど', 'do'),
  (62, 'ば', 'ba'),
  (63, 'び', 'bi'),
  (64, 'ぶ', 'bu'),
  (65, 'べ', 'be'),
  (66, 'ぼ', 'bo'),
  (67, 'ぱ', 'pa'),
  (68, 'ぴ', 'pi'),
  (69, 'ぷ', 'pu'),
  (70, 'ぺ', 'pe'),
  (71, 'ぽ', 'po'),
  (72, 'きゃ', 'kya'),
  (73, 'きゅ', 'kyu'),
  (74, 'きょ', 'kyo'),
  (75, 'しゃ', 'sha'),
  (76, 'しゅ', 'shu'),
  (77, 'しょ', 'sho'),
  (78, 'ちゃ', 'cha'),
  (79, 'ちゅ', 'chu'),
  (80, 'ちょ', 'cho'),
  (81, 'にゃ', 'nya'),
  (82, 'にゅ', 'nyu'),
  (83, 'にょ', 'nyo'),
  (84, 'ひゃ', 'hya'),
  (85, 'ひゅ', 'hyu'),
  (86, 'ひょ', 'hyo'),
  (87, 'みゃ', 'mya'),
  (88, 'みゅ', 'myu'),
  (89, 'みょ', 'myo'),
  (90, 'りゃ', 'rya'),
  (91, 'りゅ', 'ryu'),
  (92, 'りょ', 'ryo'),
  (93, 'ぎゃ', 'gya'),
  (94, 'ぎゅ', 'gyu'),
  (95, 'ぎょ', 'gyo'),
  (96, 'じゃ', 'ja'),
  (97, 'じゅ', 'ju'),
  (98, 'じょ', 'jo'),
  (99, 'びゃ', 'bya'),
  (100, 'びゅ', 'byu'),
  (101, 'びょ', 'byo'),
  (102, 'ぴゃ', 'pya'),
  (103, 'ぴゅ', 'pyu'),
  (104, 'ぴょ', 'pyo')
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('hiraganas', 'id'), GREATEST((SELECT MAX(id) FROM hiraganas), 1));
