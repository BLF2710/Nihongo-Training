import { pool } from "../config/db";

export const KATAKANA_DATA = [
  // Base Katakana (Gojūon)
  // A line
  { kana: 'ア', romaji: 'a' },
  { kana: 'イ', romaji: 'i' },
  { kana: 'ウ', romaji: 'u' },
  { kana: 'エ', romaji: 'e' },
  { kana: 'オ', romaji: 'o' },

  // Ka line
  { kana: 'カ', romaji: 'ka' },
  { kana: 'キ', romaji: 'ki' },
  { kana: 'ク', romaji: 'ku' },
  { kana: 'ケ', romaji: 'ke' },
  { kana: 'コ', romaji: 'ko' },

  // Sa line
  { kana: 'サ', romaji: 'sa' },
  { kana: 'シ', romaji: 'shi' },
  { kana: 'ス', romaji: 'su' },
  { kana: 'セ', romaji: 'se' },
  { kana: 'ソ', romaji: 'so' },

  // Ta line
  { kana: 'タ', romaji: 'ta' },
  { kana: 'チ', romaji: 'chi' },
  { kana: 'ツ', romaji: 'tsu' },
  { kana: 'テ', romaji: 'te' },
  { kana: 'ト', romaji: 'to' },

  // Na line
  { kana: 'ナ', romaji: 'na' },
  { kana: 'ニ', romaji: 'ni' },
  { kana: 'ヌ', romaji: 'nu' },
  { kana: 'ネ', romaji: 'ne' },
  { kana: 'ノ', romaji: 'no' },

  // Ha line
  { kana: 'ハ', romaji: 'ha' },
  { kana: 'ヒ', romaji: 'hi' },
  { kana: 'フ', romaji: 'fu' },
  { kana: 'ヘ', romaji: 'he' },
  { kana: 'ホ', romaji: 'ho' },

  // Ma line
  { kana: 'マ', romaji: 'ma' },
  { kana: 'ミ', romaji: 'mi' },
  { kana: 'ム', romaji: 'mu' },
  { kana: 'メ', romaji: 'me' },
  { kana: 'モ', romaji: 'mo' },

  // Ya line
  { kana: 'ヤ', romaji: 'ya' },
  { kana: 'ユ', romaji: 'yu' },
  { kana: 'ヨ', romaji: 'yo' },

  // Ra line
  { kana: 'ラ', romaji: 'ra' },
  { kana: 'リ', romaji: 'ri' },
  { kana: 'ル', romaji: 'ru' },
  { kana: 'レ', romaji: 're' },
  { kana: 'ロ', romaji: 'ro' },

  // Wa line & N
  { kana: 'ワ', romaji: 'wa' },
  { kana: 'ヲ', romaji: 'wo' },
  { kana: 'ン', romaji: 'n' },

  // Dakuten (Voiced)
  // Ga line
  { kana: 'ガ', romaji: 'ga' },
  { kana: 'ギ', romaji: 'gi' },
  { kana: 'グ', romaji: 'gu' },
  { kana: 'ゲ', romaji: 'ge' },
  { kana: 'ゴ', romaji: 'go' },

  // Za line
  { kana: 'ザ', romaji: 'za' },
  { kana: 'ジ', romaji: 'ji' },
  { kana: 'ズ', romaji: 'zu' },
  { kana: 'ゼ', romaji: 'ze' },
  { kana: 'ゾ', romaji: 'zo' },

  // Da line
  { kana: 'ダ', romaji: 'da' },
  { kana: 'ヂ', romaji: 'ji' },
  { kana: 'ヅ', romaji: 'zu' },
  { kana: 'デ', romaji: 'de' },
  { kana: 'ド', romaji: 'do' },

  // Ba line
  { kana: 'バ', romaji: 'ba' },
  { kana: 'ビ', romaji: 'bi' },
  { kana: 'ブ', romaji: 'bu' },
  { kana: 'ベ', romaji: 'be' },
  { kana: 'ボ', romaji: 'bo' },

  // Handakuten (Semi-voiced)
  // Pa line
  { kana: 'パ', romaji: 'pa' },
  { kana: 'ピ', romaji: 'pi' },
  { kana: 'プ', romaji: 'pu' },
  { kana: 'ペ', romaji: 'pe' },
  { kana: 'ポ', romaji: 'po' }
];

export async function setupKatakana() {
  console.log("Setting up katakanas and user_katakana_progress tables...");

  // 1. Create katakanas table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS katakanas (
      id SERIAL PRIMARY KEY,
      kana VARCHAR(10) NOT NULL,
      romaji VARCHAR(10) NOT NULL
    );
  `);

  // 2. Create user_katakana_progress table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_katakana_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      katakana_id INTEGER REFERENCES katakanas(id) ON DELETE CASCADE,
      correct_count INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 0,
      UNIQUE(user_id, katakana_id)
    );
  `);

  // 3. Seed Katakana characters if empty
  const countRes = await pool.query(`SELECT COUNT(*) FROM katakanas`);
  const count = parseInt(countRes.rows[0].count, 10);

  if (count === 0) {
    console.log("Seeding Katakana characters...");
    for (const item of KATAKANA_DATA) {
      await pool.query(
        `INSERT INTO katakanas (kana, romaji) VALUES ($1, $2)`,
        [item.kana, item.romaji]
      );
    }
    console.log(`Successfully seeded ${KATAKANA_DATA.length} Katakana characters!`);
  } else {
    console.log(`Katakanas table already contains ${count} characters.`);
  }
}

if (require.main === module) {
  setupKatakana()
    .then(() => {
      console.log("Katakana setup complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Katakana setup failed:", err);
      process.exit(1);
    });
}
