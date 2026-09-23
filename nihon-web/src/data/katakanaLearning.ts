import { type ExampleWord, type KanaApiCharacter, type KanaLearningCharacter } from './hiraganaLearning';

type LearningRow = { label: string; kana: string; readings: string };
type LearningSection = { key: KanaLearningCharacter['category']; title: string; description: string; rows: LearningRow[] };
// Explicit pedagogical order. Database IDs are only identities, never ordering rules.
export const KATAKANA_SECTIONS: LearningSection[] = [
  { key: 'basic', title: 'Basic Katakana', description: 'The 46 core characters.', rows: [
    r('Vowels', 'ア イ ウ エ オ', 'a i u e o'), r('K', 'カ キ ク ケ コ', 'ka ki ku ke ko'),
    r('S', 'サ シ ス セ ソ', 'sa shi su se so'), r('T', 'タ チ ツ テ ト', 'ta chi tsu te to'),
    r('N', 'ナ ニ ヌ ネ ノ', 'na ni nu ne no'), r('H', 'ハ ヒ フ ヘ ホ', 'ha hi fu he ho'),
    r('M', 'マ ミ ム メ モ', 'ma mi mu me mo'), r('Y', 'ヤ ユ ヨ', 'ya yu yo'),
    r('R', 'ラ リ ル レ ロ', 'ra ri ru re ro'), r('W', 'ワ ヲ', 'wa wo'), r('Final N', 'ン', 'n'),
  ] },
  { key: 'dakuten', title: 'Dakuten', description: 'Two small marks change familiar rows into voiced sounds.', rows: [
    r('G', 'ガ ギ グ ゲ ゴ', 'ga gi gu ge go'), r('Z', 'ザ ジ ズ ゼ ゾ', 'za ji zu ze zo'),
    r('D', 'ダ ヂ ヅ デ ド', 'da ji zu de do'), r('B', 'バ ビ ブ ベ ボ', 'ba bi bu be bo'),
  ] },
  { key: 'handakuten', title: 'Handakuten', description: 'A small circle changes the H row into P sounds.', rows: [r('P', 'パ ピ プ ペ ポ', 'pa pi pu pe po')] },
  { key: 'yoon', title: 'Yōon / Contracted Sounds', description: 'Combine an i-row sound with small ャ, ュ, or ョ. Read each pair as one beat.', rows: [
    r('KY', 'キャ キュ キョ', 'kya kyu kyo'), r('SH', 'シャ シュ ショ', 'sha shu sho'), r('CH', 'チャ チュ チョ', 'cha chu cho'),
    r('NY', 'ニャ ニュ ニョ', 'nya nyu nyo'), r('HY', 'ヒャ ヒュ ヒョ', 'hya hyu hyo'), r('MY', 'ミャ ミュ ミョ', 'mya myu myo'),
    r('RY', 'リャ リュ リョ', 'rya ryu ryo'), r('GY', 'ギャ ギュ ギョ', 'gya gyu gyo'), r('J', 'ジャ ジュ ジョ', 'ja ju jo'),
    r('BY', 'ビャ ビュ ビョ', 'bya byu byo'), r('PY', 'ピャ ピュ ピョ', 'pya pyu pyo'),
  ] },
  { key: 'extended', title: 'Extended Katakana', description: 'Foreign-word spellings: learn common combinations first. The later rows are less frequent and often occur in names or specialized words; spellings vary.', rows: [
    r('W', 'ウィ ウェ ウォ', 'wi we wo'), r('T / D', 'ティ トゥ ディ ドゥ', 'ti tu di du'),
    r('CH / F', 'チェ ファ フィ フェ フォ フュ', 'che fa fi fe fo fyu'), r('J / SH / Y', 'ジェ シェ イェ', 'je she ye'),
    r('V', 'ヴァ ヴィ ヴェ ヴォ ヴュ', 'va vi ve vo vyu'), r('TS', 'ツァ ツィ ツェ ツォ', 'tsa tsi tse tso'),
    r('KW / GW', 'クァ クィ クェ クォ グァ', 'kwa kwi kwe kwo gwa'), r('SI / ZI', 'スィ ズィ', 'si zi'),
    r('TY / DY', 'テュ デュ', 'tyu dyu'), r('Other E sounds', 'ニェ ヒェ ミェ リェ', 'nye hye mye rye'),
  ] },
];
function r(label: string, kana: string, readings: string): LearningRow { return { label, kana, readings }; }

const examples: Record<string, ExampleWord> = {
  キャ: e('キャベツ', 'kyabetsu', 'cabbage'), キュ: e('キューブ', 'kyuubu', 'cube'), キョ: e('キョロキョロ', 'kyorokyoro', 'looking around restlessly'),
  シャ: e('シャツ', 'shatsu', 'shirt'), シュ: e('シューズ', 'shuuzu', 'shoes'), ショ: e('ショップ', 'shoppu', 'shop'),
  チャ: e('チャット', 'chatto', 'chat'), チュ: e('チューリップ', 'chuurippu', 'tulip'), チョ: e('チョコレート', 'chokoreeto', 'chocolate'),
  ニャ: e('ニャー', 'nyaa', 'meow'), ニュ: e('ニュース', 'nyuusu', 'news'), ニョ: e('ニョッキ', 'nyokki', 'gnocchi'),
  ヒャ: e('ヒャク', 'hyaku', 'one hundred', 'Usually written 百 or ひゃく; shown in katakana to illustrate the sound.'), ヒュ: e('ヒューマン', 'hyuuman', 'human (in compound loanwords)'), ヒョ: e('ヒョウ', 'hyou', 'leopard', 'Animal names are often written in katakana.'),
  ミャ: e('ミャンマー', 'Myanmaa', 'Myanmar'), ミュ: e('ミュージック', 'myuujikku', 'music'), ミョ: e('ミョウガ', 'myouga', 'Japanese ginger'),
  リャ: e('リャマ', 'ryama', 'llama'), リュ: e('リュック', 'ryukku', 'backpack'), リョ: e('リョコウ', 'ryokou', 'travel', 'Usually written 旅行 or りょこう; shown in katakana to illustrate the sound.'),
  ギャ: e('ギャラリー', 'gyararii', 'gallery'), ギュ: e('ギュッと', 'gyutto', 'tightly', 'A sound-symbolic expression.'), ギョ: e('ギョーザ', 'gyooza', 'gyoza dumplings'),
  ジャ: e('ジャケット', 'jaketto', 'jacket'), ジュ: e('ジュース', 'juusu', 'juice'), ジョ: e('ジョギング', 'jogingu', 'jogging'),
  ビャ: e('ビャクヤ', 'byakuya', 'midnight sun / white night', 'Usually written 白夜 or びゃくや; this is not a common beginner word.'), ビュ: e('ビュー', 'byuu', 'view'), ビョ: e('ビョウイン', 'byouin', 'hospital', 'Usually written 病院 or びょういん; shown in katakana to illustrate the sound.'),
  ピャ: e('ピャッと', 'pyatto', 'in a quick burst', 'A less common sound-symbolic expression.'), ピュ: e('ピューレ', 'pyuure', 'purée'), ピョ: e('ピョンピョン', 'pyonpyon', 'hopping'),
  ウィ: e('ウィンドウ', 'windou', 'window'), ウェ: e('ウェブ', 'webu', 'web'), ウォ: e('ウォーター', 'wootaa', 'water (loanword)'),
  ティ: e('ティー', 'tii', 'tea (loanword)'), トゥ: e('トゥデイ', 'tudei', 'today (English loanword, often in names)'), ディ: e('ディスク', 'disuku', 'disc'),
  チェ: e('チェス', 'chesu', 'chess'), ファ: e('ファイル', 'fairu', 'file'), フィ: e('フィルム', 'firumu', 'film'), フェ: e('カフェ', 'kafe', 'café'), フォ: e('フォーク', 'fooku', 'fork'), フュ: e('フュージョン', 'fyuujon', 'fusion'),
  ジェ: e('ジェット', 'jetto', 'jet'), シェ: e('シェフ', 'shefu', 'chef'), イェ: e('イェス', 'yesu', 'yes (English transcription)', 'イエス is also used. Everyday Japanese yes is はい.'),
  ヴァ: e('ヴァイオリン', 'vaiorin', 'violin', 'Also commonly spelled バイオリン.'), ヴィ: e('ヴィオラ', 'viora', 'viola'), ヴェ: e('ヴェール', 'veeru', 'veil'), ヴォ: e('ヴォーカル', 'vookaru', 'vocals', 'Also commonly spelled ボーカル.'), ヴュ: e('レヴュー', 'revyuu', 'revue', 'レビュー is also used.'),
  ツァ: e('モーツァルト', 'Mootsaruto', 'Mozart'), ツィ: e('ツィーター', 'tsiitaa', 'tweeter (high-frequency speaker)'), ツェ: e('ツェッペリン', 'Tsepperin', 'Zeppelin'), ツォ: e('カンツォーネ', 'kantsoone', 'Italian song'),
  クァ: e('クァルテット', 'kwarutetto', 'quartet', 'カルテット is more common.'), クィ: e('クィンテット', 'kwintetto', 'quintet', 'クインテット is also used.'), クェ: e('クェスチョンマーク', 'kwesuchon maaku', 'question mark', 'An uncommon spelling; クエスチョンマーク is more usual.'), クォ: e('クォーツ', 'kwootsu', 'quartz'), グァ: e('グァバ', 'gwaba', 'guava', 'グアバ is also used.'),
  デュ: e('デュエット', 'dyuetto', 'duet'), リェ: e('アトリェ', 'atorye', 'artist’s studio', 'An uncommon spelling; アトリエ is usual.'),
  ア: e('アイス', 'aisu', 'ice cream'), イ: e('インク', 'inku', 'ink'), ウ: e('ウール', 'uuru', 'wool'), エ: e('エアコン', 'eakon', 'air conditioner'), オ: e('オレンジ', 'orenji', 'orange'),
  カ: e('カメラ', 'kamera', 'camera'), キ: e('キウイ', 'kiui', 'kiwi'), ク: e('クラス', 'kurasu', 'class'), ケ: e('ケーキ', 'keeki', 'cake'), コ: e('コーヒー', 'koohii', 'coffee'),
  サ: e('サラダ', 'sarada', 'salad'), シ: e('シャツ', 'shatsu', 'shirt'), ス: e('スープ', 'suupu', 'soup'), セ: e('セーター', 'seetaa', 'sweater'), ソ: e('ソファ', 'sofa', 'sofa'),
  タ: e('タクシー', 'takushii', 'taxi'), チ: e('チーズ', 'chiizu', 'cheese'), ツ: e('ツアー', 'tsuaa', 'tour'), テ: e('テレビ', 'terebi', 'television'), ト: e('トマト', 'tomato', 'tomato'),
  ナ: e('ナイフ', 'naifu', 'knife'), ニ: e('ニュース', 'nyuusu', 'news'), ヌ: e('カヌー', 'kanuu', 'canoe'), ネ: e('ネクタイ', 'nekutai', 'necktie'), ノ: e('ノート', 'nooto', 'notebook'),
  ハ: e('ハム', 'hamu', 'ham'), ヒ: e('ヒーロー', 'hiiroo', 'hero'), フ: e('フォーク', 'fooku', 'fork'), ヘ: e('ヘルメット', 'herumetto', 'helmet'), ホ: e('ホテル', 'hoteru', 'hotel'),
  マ: e('マスク', 'masuku', 'mask'), ミ: e('ミルク', 'miruku', 'milk'), ム: e('ゲーム', 'geemu', 'game'), メ: e('メニュー', 'menyuu', 'menu'), モ: e('モデル', 'moderu', 'model'),
  ヤ: e('タイヤ', 'taiya', 'tire'), ユ: e('ユニフォーム', 'yunifoomu', 'uniform'), ヨ: e('ヨーグルト', 'yooguruto', 'yogurt'),
  ラ: e('ラジオ', 'rajio', 'radio'), リ: e('リボン', 'ribon', 'ribbon'), ル: e('ルール', 'ruuru', 'rule'), レ: e('レモン', 'remon', 'lemon'), ロ: e('ロボット', 'robotto', 'robot'),
  ワ: e('ワイン', 'wain', 'wine'), ヲ: e('ホンヲ ヨミマス', 'hon o yomimasu', 'read a book', 'ヲ is rare today. This sentence is written entirely in katakana for illustration; normally use 本を読みます. The particle is pronounced o.'), ン: e('パン', 'pan', 'bread'),
  ガ: e('ガラス', 'garasu', 'glass (material)'), ギ: e('ギター', 'gitaa', 'guitar'), グ: e('グラス', 'gurasu', 'drinking glass'), ゲ: e('ゲーム', 'geemu', 'game'), ゴ: e('ゴム', 'gomu', 'rubber'),
  ザ: e('ピザ', 'piza', 'pizza'), ジ: e('ジュース', 'juusu', 'juice'), ズ: e('ズボン', 'zubon', 'trousers'), ゼ: e('ゼロ', 'zero', 'zero'), ゾ: e('ゾーン', 'zoon', 'zone'),
  ダ: e('ダンス', 'dansu', 'dance'), ヂ: e('ハナヂ', 'hanaji', 'nosebleed', 'ヂ is rare. This is the katakana rendering of はなぢ, usually written in hiragana or kanji.'), ヅ: e('ツヅク', 'tsuzuku', 'to continue', 'ヅ is rare. This is the katakana rendering of つづく, usually written in hiragana or kanji.'), デ: e('デザート', 'dezaato', 'dessert'), ド: e('ドア', 'doa', 'door'),
  バ: e('バス', 'basu', 'bus'), ビ: e('ビール', 'biiru', 'beer'), ブ: e('ブラシ', 'burashi', 'brush'), ベ: e('ベッド', 'beddo', 'bed'), ボ: e('ボール', 'booru', 'ball'),
  パ: e('パン', 'pan', 'bread'), ピ: e('ピアノ', 'piano', 'piano'), プ: e('プリン', 'purin', 'custard pudding'), ペ: e('ペン', 'pen', 'pen'), ポ: e('ポスト', 'posuto', 'mailbox'),
};

export function buildKatakanaCatalog(existing: KanaApiCharacter[]): KanaLearningCharacter[] {
  const byCharacter = new Map(existing.map(item => [item.kana, item]));
  let order = 0;
  return KATAKANA_SECTIONS.flatMap(section => section.rows.flatMap(row => {
    const readings = row.readings.split(' ');
    return row.kana.split(' ').map((kana, index) => {
      const position = ++order;
      // Preserve existing detail URLs; negative Unicode-based IDs are stable and
      // cannot collide with the positive database IDs. No quiz records are added.
      const localId = -[...kana].reduce((value, char) => value * 256 + char.codePointAt(0)! - 0x3000, 0);
      return { id: byCharacter.get(kana)?.id ?? localId, kana, romaji: readings[index], category: section.key, row: row.label, order: position,
        exampleWord: examples[kana] ?? e('', '', 'No common beginner example is provided for this less frequent transcription.'), audioText: kana };
    });
  }));
}
function e(japanese: string, romaji: string, meaning: string, note?: string): ExampleWord { return { japanese, romaji, meaning, note }; }
