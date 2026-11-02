// Source for the N3 mock exam. Run: node docs/curriculum/n3/sources/mock-exam.cjs
// Writes shared/course/mock-exams.json (other levels in that file are kept).
// A question is [prompt, correct answer, [three wrong answers], explanation]. Only grammar, vocabulary and kanji
// taught up to the end of N3 are used. Furigana shorthand 漢字{かんじ} is expanded as in the lessons; the word in
// 【 】 is the one being asked about and stays bare. The script refuses kanji outside the course and bare kanji
// anywhere else.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../../../..");

const sections = [
  {
    id: "vocabulary", title: "Vocabulary & Kanji", titleJp: "もじ・ごい",
    groups: [
      {
        instruction: "Choose the reading of the word in 【 】.",
        questions: [
          ["この町{まち}は【景色】がきれいです。", "けしき", ["けいしょく", "けいいろ", "けしょく"], "景色 is read けしき: scenery."],
          ["【将来】の夢{ゆめ}は医者{いしゃ}になることです。", "しょうらい", ["しょらい", "じょうらい", "しょうき"], "将来 is read しょうらい: the future."],
          ["会議{かいぎ}の【結論】が出{で}ました。", "けつろん", ["けっろん", "けつりん", "げつろん"], "結論 is read けつろん: conclusion."],
          ["駅{えき}で電車{でんしゃ}を【乗】り換{か}えます。", "の", ["じょう", "のり", "か"], "乗り換える is read のりかえる: to change trains."],
          ["健康{けんこう}のために、毎日{まいにち}【努力】しています。", "どりょく", ["どりき", "のうりょく", "とりょく"], "努力 is read どりょく: effort."],
        ],
      },
      {
        instruction: "Choose the kanji for the word in 【 】.",
        questions: [
          ["パーティーに【さんか】しますか。", "参加", ["三加", "参家", "参会"], "さんか, taking part, is written 参加."],
          ["友達{ともだち}に本{ほん}を【かえし】ました。", "返し", ["帰し", "反し", "変し"], "かえす, to give back, is written 返す."],
          ["窓{まど}を【しめて】ください。", "閉めて", ["開めて", "問めて", "止めて"], "しめる, to close, is written 閉める."],
          ["試験{しけん}の【けっか】は来週{らいしゅう}分{わ}かります。", "結果", ["決果", "結実", "経果"], "けっか, result, is written 結果."],
          ["【しょうらい】、自分{じぶん}の店{みせ}を持{も}ちたいです。", "将来", ["小来", "生来", "将未"], "しょうらい, the future, is written 将来."],
        ],
      },
      {
        instruction: "Choose the best word for (　　).",
        questions: [
          ["電車{でんしゃ}が遅{おく}れたので、会議{かいぎ}に（　　）しました。", "遅刻{ちこく}", ["欠点{けってん}", "予約{よやく}", "確認{かくにん}"], "Arriving late: 遅刻{ちこく}."],
          ["分{わ}からない言葉{ことば}は辞書{じしょ}で（　　）ください。", "調{しら}べて", ["比{くら}べて", "伝{つた}えて", "届{とど}けて"], "Looking up a word: 調{しら}べる."],
          ["このレストランは安{やす}い（　　）、量{りょう}が多{おお}いです。", "わりに", ["くせに", "たびに", "かわりに"], "More than you'd expect for the price: わりに."],
          ["道{みち}が分{わ}からなかったので、（　　）で聞{き}きました。", "交番{こうばん}", ["番組{ばんぐみ}", "交換{こうかん}", "番号{ばんごう}"], "Asking the way at a police box: 交番{こうばん}."],
          ["わたしの説明{せつめい}が悪{わる}くて、（　　）されてしまいました。", "誤解{ごかい}", ["理解{りかい}", "相談{そうだん}", "想像{そうぞう}"], "Misunderstood: 誤解{ごかい}される."],
        ],
      },
      {
        instruction: "Choose the sentence closest in meaning.",
        questions: [
          ["田中{たなか}さんは最近{さいきん}、会社{かいしゃ}を休{やす}みがちです。", "田中{たなか}さんは最近{さいきん}、よく会社{かいしゃ}を休{やす}みます。", ["田中{たなか}さんは最近{さいきん}、一度{いちど}も休{やす}みません。", "田中{たなか}さんは最近{さいきん}、会社{かいしゃ}をやめました。", "田中{たなか}さんは最近{さいきん}、休{やす}みたいと言{い}っています。"], "がちだ: tends to."],
          ["もっと早{はや}く出{で}ればよかった。", "早{はや}く出{で}なかったことを残念{ざんねん}に思{おも}っている。", ["早{はや}く出{で}たのでよかった。", "これから早{はや}く出{で}るつもりだ。", "早{はや}く出{で}る必要{ひつよう}はなかった。"], "ばよかった: regret."],
          ["彼{かれ}が犯人{はんにん}に違{ちが}いない。", "きっと彼{かれ}が犯人{はんにん}だ。", ["たぶん彼{かれ}は犯人{はんにん}ではない。", "彼{かれ}が犯人{はんにん}かどうか分{わ}からない。", "彼{かれ}は犯人{はんにん}を知{し}っている。"], "に違{ちが}いない: must be."],
        ],
      },
    ],
  },
  {
    id: "grammar", title: "Grammar", titleJp: "ぶんぽう",
    groups: [
      {
        instruction: "Choose the best word or form for (　　).",
        questions: [
          ["駅{えき}に着{つ}いた（　　）、雨{あめ}が降{ふ}り出{だ}した。", "とたん", ["うちに", "ばかり", "最中{さいちゅう}"], "The moment: V-た とたん."],
          ["先生{せんせい}の（　　）、試験{しけん}に合格{ごうかく}できました。", "おかげで", ["せいで", "くせに", "わりに"], "A good result thanks to someone: おかげで."],
          ["来月{らいげつ}から大阪{おおさか}で働{はたら}くことに（　　）。", "なりました", ["しました", "させました", "されました"], "An arrangement made for you: ことになる."],
          ["練習{れんしゅう}すれば（　　）ほど、上手{じょうず}になります。", "する", ["した", "して", "すれ"], "The more: V-ば V-る ほど."],
          ["わたしに（　　）、家族{かぞく}は一番{いちばん}大切{たいせつ}です。", "とって", ["ついて", "対{たい}して", "関{かん}して"], "From my point of view: にとって."],
          ["電気{でんき}がついているから、家{いえ}にいるに（　　）。", "違{ちが}いない", ["決{き}めない", "限{かぎ}らない", "すぎない"], "Must be: に違{ちが}いない."],
          ["子{こ}どもの（　　）、大人{おとな}のような話{はな}し方{かた}をする。", "くせに", ["わりに", "おかげで", "たびに"], "A critical \"even though\": くせに."],
          ["雨{あめ}に（　　）、たくさんの人{ひと}が参加{さんか}しました。", "もかかわらず", ["よって", "とって", "比{くら}べて"], "Despite: にもかかわらず."],
          ["この写真{しゃしん}を見{み}る（　　）、国{くに}を思{おも}い出{だ}します。", "たびに", ["ごとに", "うちに", "ところに"], "Every time: たびに."],
          ["辞書{じしょ}を使{つか}わ（　　）、この本{ほん}を読{よ}みました。", "ずに", ["ないに", "なく", "ずで"], "Without doing: V-ずに."],
          ["約束{やくそく}したので、行{い}かない（　　）。", "わけにはいかない", ["わけではない", "わけだ", "わけがない"], "I can't not go: ないわけにはいかない."],
          ["先輩{せんぱい}に一時間{いちじかん}も待{ま}た（　　）。", "された", ["せた", "れた", "させた"], "Made to wait: short causative-passive 待{ま}たされる."],
        ],
      },
      {
        instruction: "Choose the most suitable expression for the situation.",
        questions: [
          ["（部長{ぶちょう}に）この書類{しょるい}を（　　）。", "見{み}ていただけないでしょうか", ["見{み}ろ", "見{み}なさい", "見{み}てもいいよ"], "A very polite request to a superior."],
          ["（店{みせ}の入口{いりぐち}の紙{かみ}）本日{ほんじつ}は休{やす}ま（　　）。", "せていただきます", ["れてください", "なきゃ", "ないこと"], "Humbly announcing: させていただく."],
          ["（論文{ろんぶん}で）日本{にほん}は島国{しまぐに}（　　）。", "である", ["です", "だよ", "でございます"], "Written style: である."],
          ["（友達{ともだち}に）もう九時{くじ}だ。帰{かえ}ら（　　）。", "なきゃ", ["ないこと", "なさい", "せていただきます"], "Casual must: なきゃ."],
        ],
      },
    ],
  },
  {
    id: "reading", title: "Reading", titleJp: "どっかい",
    groups: [
      {
        instruction: "Read the email and answer the questions.",
        passage: "リンさんへ\n先日{せんじつ}はお忙{いそが}しいところ、引{ひ}っ越{こ}しを手伝{てつだ}ってくださって、ありがとうございました。おかげで、思{おも}ったより早{はや}く終{お}わりました。新{あたら}しい部屋{へや}は前{まえ}の部屋{へや}ほど広{ひろ}くないですが、駅{えき}から近{ちか}くて便利{べんり}です。そのかわり、家賃{やちん}は少{すこ}し高{たか}くなりました。来週{らいしゅう}の土曜日{どようび}、お礼{れい}に晩{ばん}ご飯{はん}をごちそうしたいのですが、ご都合{つごう}はいかがでしょうか。お返事{へんじ}をお待{ま}ちしています。\nアナ",
        questions: [
          ["Why is Ana writing to Lin?", "To thank her for helping with the move", ["To ask her to help with a move", "To invite her to live together", "To complain about the new flat"], "引{ひ}っ越{こ}しを手伝{てつだ}ってくださって、ありがとうございました."],
          ["What is true about the new flat?", "It is smaller but close to the station.", ["It is bigger and cheaper.", "It is far from the station.", "It is the same as the old one."], "前{まえ}の部屋{へや}ほど広{ひろ}くないですが、駅{えき}から近{ちか}くて便利{べんり}."],
          ["What does Ana want to do next Saturday?", "Treat Lin to dinner", ["Move again", "Clean the flat", "Visit Lin's flat"], "お礼{れい}に晩{ばん}ご飯{はん}をごちそうしたい."],
        ],
      },
      {
        instruction: "Read the article and answer the questions.",
        passage: "最近{さいきん}、地方{ちほう}の村{むら}に引{ひ}っ越{こ}す若者{わかもの}が増{ふ}えている。都会{とかい}は便利{べんり}な反面{はんめん}、家賃{やちん}が高{たか}く、人{ひと}が多{おお}すぎると感{かん}じる人{ひと}が少{すく}なくないからだと考{かんが}えられている。村{むら}の生活{せいかつ}は不便{ふべん}なことも多{おお}いが、そのかわりに自然{しぜん}の中{なか}でゆっくり暮{く}らすことができる。インターネットを通{つう}じて、村{むら}にいながら都会{とかい}の会社{かいしゃ}の仕事{しごと}をする人{ひと}もいる。一方{いっぽう}で、村{むら}の人口{じんこう}は減{へ}る一方{いっぽう}であり、病院{びょういん}や学校{がっこう}が少{すく}ないという問題{もんだい}もある。",
        questions: [
          ["Why are young people thought to be moving to villages?", "Cities feel expensive and crowded.", ["Villages are more convenient.", "Their companies told them to.", "Villages have better schools."], "家賃{やちん}が高{たか}く、人{ひと}が多{おお}すぎると感{かん}じる."],
          ["How do some people keep working for city companies?", "Through the internet", ["By commuting every day", "By moving back on weekdays", "By opening offices in villages"], "インターネットを通{つう}じて."],
          ["What problem does the article mention?", "Village populations keep falling, and there are few hospitals and schools.", ["Villages are too crowded.", "Rent in villages is rising.", "There is no internet in villages."], "人口{じんこう}は減{へ}る一方{いっぽう}であり、病院{びょういん}や学校{がっこう}が少{すく}ない."],
        ],
      },
    ],
  },
];

// Furigana as in the lessons; a word whose kanji are not in the course is written in kana from its reading.
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "shared/kanji.json"), "utf8"));
const taught = new Set(catalog.kanji.map(kanji => kanji.character));
const SHORTHAND = /([\p{Script=Han}々]+)\{([ぁ-ゖァ-ヺー]+)\}/gu;
const expand = text => text.replace(SHORTHAND, (match, kanji, reading) => [...kanji].every(character => taught.has(character) || character === "々")
  ? `<ruby>${kanji}<rt>${reading}</rt></ruby>` : reading);
// Explanations are shown after the exam and name the word asked about, so they may show it bare.
function checked(text, { mayBeBare = false } = {}) {
  const shown = expand(text);
  const outside = shown.replace(/<ruby>.*?<\/ruby>/g, "").replace(/【[^】]*】/g, "");
  const bare = [...outside].filter(character => /\p{Script=Han}/u.test(character));
  if (bare.length && !mayBeBare) throw new Error(`Kanji without furigana in: ${text}`);
  const untaught = [...shown.replace(/<rt>.*?<\/rt>/g, "")].filter(character => /\p{Script=Han}/u.test(character) && character !== "々" && !taught.has(character));
  if (untaught.length) throw new Error(`Kanji outside the course (${untaught.join("")}) in: ${text}`);
  return shown;
}

let count = 0;
const exam = {
  id: "japanese-n3-mock-exam", level: "N3", title: "N3 Mock Exam", minutes: 60, passPercent: 60, sectionMinPercent: 40,
  sections: sections.map(section => ({
    id: section.id, title: section.title, titleJp: section.titleJp,
    groups: section.groups.map(group => ({
      instruction: group.instruction, ...(group.passage ? { passage: checked(group.passage) } : {}),
      questions: group.questions.map(([prompt, correct, wrong, explanation]) => {
        if (wrong.length !== 3 || new Set([correct, ...wrong]).size !== 4) throw new Error(`Question needs four different options: ${prompt}`);
        const correctIndex = [1, 3, 0, 2, 3, 1, 0, 2, 0, 3, 2, 1][count % 12];
        // Options that ask the learner to pick a kanji spelling are bare on purpose.
        const option = text => checked(text, { mayBeBare: group.instruction.startsWith("Choose the kanji") });
        const options = [...wrong].map(option);
        options.splice(correctIndex, 0, option(correct));
        return { id: `${section.id}-${++count}`, prompt: checked(prompt), options, correctIndex, explanation: checked(explanation, { mayBeBare: true }) };
      }),
    })),
  })),
};

const file = path.join(ROOT, "shared/course/mock-exams.json");
const all = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
all[exam.level] = exam;
fs.writeFileSync(file, `${JSON.stringify(all, null, 2)}\n`);
console.log(`Wrote the ${exam.level} mock exam: ${count} questions in ${exam.sections.length} sections.`);
