export type KanaApiCharacter = { id: number; kana: string; romaji: string };
export type ExampleWord = { japanese: string; romaji: string; meaning: string; note?: string };
export type KanaLearningCharacter = KanaApiCharacter & {
  category: "basic" | "dakuten" | "handakuten" | "yoon" | "extended";
  row: string;
  order: number;
  exampleWord: ExampleWord;
  audioText?: string;
  strokeData?: readonly string[];
};

export type KanaRow = { label: string; startId: number; endId: number };
export type KanaSection = { key: KanaLearningCharacter["category"]; title: string; description: string; rows: KanaRow[] };

export const HIRAGANA_SECTIONS: KanaSection[] = [
  { key: "basic", title: "Basic Hiragana", description: "Start with the 46 core sounds used throughout Japanese.", rows: [
    { label: "Vowels", startId: 1, endId: 5 }, { label: "K", startId: 6, endId: 10 }, { label: "S", startId: 11, endId: 15 },
    { label: "T", startId: 16, endId: 20 }, { label: "N", startId: 21, endId: 25 }, { label: "H", startId: 26, endId: 30 },
    { label: "M", startId: 31, endId: 35 }, { label: "Y", startId: 36, endId: 38 }, { label: "R", startId: 39, endId: 43 },
    { label: "W", startId: 44, endId: 45 }, { label: "N", startId: 46, endId: 46 }
  ] },
  { key: "dakuten", title: "Dakuten", description: "Two small marks change familiar rows into voiced sounds.", rows: [
    { label: "G", startId: 47, endId: 51 }, { label: "Z", startId: 52, endId: 56 }, { label: "D", startId: 57, endId: 61 }, { label: "B", startId: 62, endId: 66 }
  ] },
  { key: "handakuten", title: "Handakuten", description: "A small circle changes the H row into P sounds.", rows: [{ label: "P", startId: 67, endId: 71 }] },
  { key: "yoon", title: "Yōon / Contracted Sounds", description: "Combine an i-row sound with a small ゃ, ゅ, or ょ.", rows: [
    { label: "KY", startId: 72, endId: 74 }, { label: "SH", startId: 75, endId: 77 }, { label: "CH", startId: 78, endId: 80 },
    { label: "NY", startId: 81, endId: 83 }, { label: "HY", startId: 84, endId: 86 }, { label: "MY", startId: 87, endId: 89 },
    { label: "RY", startId: 90, endId: 92 }, { label: "GY", startId: 93, endId: 95 }, { label: "J", startId: 96, endId: 98 },
    { label: "BY", startId: 99, endId: 101 }, { label: "PY", startId: 102, endId: 104 }
  ] }
];

const examples: Record<string, ExampleWord> = {
  あ: e("あさ", "asa", "morning"), い: e("いぬ", "inu", "dog"), う: e("うみ", "umi", "sea"), え: e("えき", "eki", "station"), お: e("おちゃ", "ocha", "tea"),
  か: e("かさ", "kasa", "umbrella"), き: e("き", "ki", "tree"), く: e("くち", "kuchi", "mouth"), け: e("けさ", "kesa", "this morning"), こ: e("こえ", "koe", "voice"),
  さ: e("さかな", "sakana", "fish"), し: e("しお", "shio", "salt"), す: e("すし", "sushi", "sushi"), せ: e("せかい", "sekai", "world"), そ: e("そら", "sora", "sky"),
  た: e("たまご", "tamago", "egg"), ち: e("ちず", "chizu", "map"), つ: e("つき", "tsuki", "moon"), て: e("て", "te", "hand"), と: e("とけい", "tokei", "clock"),
  な: e("なつ", "natsu", "summer"), に: e("にく", "niku", "meat"), ぬ: e("ぬの", "nuno", "cloth"), ね: e("ねこ", "neko", "cat"), の: e("のり", "nori", "seaweed"),
  は: e("はな", "hana", "flower"), ひ: e("ひと", "hito", "person"), ふ: e("ふね", "fune", "boat"), へ: e("へや", "heya", "room"), ほ: e("ほし", "hoshi", "star"),
  ま: e("まど", "mado", "window"), み: e("みず", "mizu", "water"), む: e("むし", "mushi", "insect"), め: e("め", "me", "eye"), も: e("もり", "mori", "forest"),
  や: e("やま", "yama", "mountain"), ゆ: e("ゆき", "yuki", "snow"), よ: e("よる", "yoru", "night"),
  ら: e("らいねん", "rainen", "next year"), り: e("りんご", "ringo", "apple"), る: e("るす", "rusu", "absence / not at home"), れ: e("れい", "rei", "zero"), ろ: e("ろく", "roku", "six"),
  わ: e("わたし", "watashi", "I / me"), を: e("ごはんを たべます", "gohan o tabemasu", "eat a meal", "を marks the object and is pronounced ‘o’."), ん: e("ほん", "hon", "book"),
  が: e("がっこう", "gakkou", "school"), ぎ: e("ぎんこう", "ginkou", "bank"), ぐ: e("ぐあい", "guai", "condition"), げ: e("げんき", "genki", "well / healthy"), ご: e("ごはん", "gohan", "cooked rice / meal"),
  ざ: e("ざっし", "zasshi", "magazine"), じ: e("じかん", "jikan", "time"), ず: e("みず", "mizu", "water"), ぜ: e("ぜんぶ", "zenbu", "all"), ぞ: e("ぞう", "zou", "elephant"),
  だ: e("だいがく", "daigaku", "university"), ぢ: e("はなぢ", "hanaji", "nosebleed", "ぢ is uncommon in modern Japanese."), づ: e("つづく", "tsuzuku", "to continue", "づ is uncommon in modern Japanese."), で: e("でんわ", "denwa", "telephone"), ど: e("どうぶつ", "doubutsu", "animal"),
  ば: e("ばしょ", "basho", "place"), び: e("びょういん", "byouin", "hospital"), ぶ: e("ぶた", "buta", "pig"), べ: e("べんとう", "bentou", "boxed lunch"), ぼ: e("ぼうし", "boushi", "hat"),
  ぱ: e("ぱちぱち", "pachipachi", "clapping / crackling"), ぴ: e("ぴかぴか", "pikapika", "sparkling"), ぷ: e("ぷかぷか", "pukapuka", "floating lightly"), ぺ: e("ぺこぺこ", "pekopeko", "very hungry / bowing repeatedly"), ぽ: e("ぽかぽか", "pokapoka", "pleasantly warm"),
  きゃ: e("きゃく", "kyaku", "guest"), きゅ: e("きゅう", "kyuu", "nine"), きょ: e("きょう", "kyou", "today"),
  しゃ: e("しゃしん", "shashin", "photograph"), しゅ: e("しゅくだい", "shukudai", "homework"), しょ: e("しょくどう", "shokudou", "cafeteria"),
  ちゃ: e("おちゃ", "ocha", "tea"), ちゅ: e("ちゅうごく", "Chuugoku", "China"), ちょ: e("ちょっと", "chotto", "a little"),
  にゃ: e("にゃん", "nyan", "meow"), にゅ: e("ぎゅうにゅう", "gyuunyuu", "milk"), にょ: e("にょろにょろ", "nyoronyoro", "slithering", "A sound-symbolic expression."),
  ひゃ: e("ひゃく", "hyaku", "one hundred"), ひゅ: e("ひゅうひゅう", "hyuuhyuu", "whistling wind", "A sound-symbolic expression."), ひょ: e("ひょう", "hyou", "hail"),
  みゃ: e("みゃく", "myaku", "pulse"), みゅ: e("ミュージアム", "myuujiamu", "museum", "This sound is most often seen in katakana loanwords."), みょ: e("みょうじ", "myouji", "family name"),
  りゃ: e("りゃく", "ryaku", "abbreviation"), りゅ: e("りゅう", "ryuu", "dragon"), りょ: e("りょこう", "ryokou", "travel"),
  ぎゃ: e("ぎゃく", "gyaku", "reverse / opposite"), ぎゅ: e("ぎゅうにく", "gyuuniku", "beef"), ぎょ: e("ぎょかい", "gyokai", "fish and shellfish"),
  じゃ: e("じゃま", "jama", "obstacle / in the way"), じゅ: e("じゅう", "juu", "ten"), じょ: e("じょせい", "josei", "woman"),
  びゃ: e("びゃくや", "byakuya", "white night"), びゅ: e("びゅうびゅう", "byuubyuu", "howling wind", "A sound-symbolic expression."), びょ: e("びょうき", "byouki", "illness"),
  ぴゃ: e("ぴゃっと", "pyatto", "in a quick burst", "A sound-symbolic expression."), ぴゅ: e("ぴゅうっと", "pyuutto", "with a whizz", "A sound-symbolic expression."), ぴょ: e("ぴょんぴょん", "pyonpyon", "hopping", "A sound-symbolic expression.")
};

export function enrichHiragana(character: KanaApiCharacter): KanaLearningCharacter {
  const section = HIRAGANA_SECTIONS.find((item) => item.rows.some((row) => character.id >= row.startId && character.id <= row.endId));
  const row = section?.rows.find((item) => character.id >= item.startId && character.id <= item.endId);
  return { ...character, category: section?.key ?? "basic", row: row?.label ?? "", order: character.id, exampleWord: examples[character.kana] ?? e(character.kana, character.romaji, "Example coming soon"), audioText: character.kana };
}

function e(japanese: string, romaji: string, meaning: string, note?: string): ExampleWord { return { japanese, romaji, meaning, note }; }
