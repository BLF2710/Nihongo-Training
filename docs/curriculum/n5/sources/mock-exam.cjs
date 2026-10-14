// Source for the N5 mock exam. Run: node docs/curriculum/n5/sources/mock-exam.cjs
// Writes shared/course/mock-exams.json (other levels in that file are kept).
// A question is [prompt, correct answer, [three wrong answers], explanation]. Only grammar, vocabulary
// and kanji taught in N5 Units 1–9 are used; a word in 【 】 is the one being asked about.
const fs = require("node:fs");
const path = require("node:path");

const sections = [
  {
    id: "vocabulary", title: "Vocabulary & Kanji", titleJp: "もじ・ごい",
    groups: [
      {
        instruction: "Choose the reading of the word in 【 】.",
        questions: [
          ["きょうは 【天気】が いいです。", "てんき", ["でんき", "てんぎ", "げんき"], "天気 is read てんき: weather."],
          ["【先生】に ききました。", "せんせい", ["せんせ", "がくせい", "せいせん"], "先生 is read せんせい: teacher."],
          ["この かばんは 【安い】です。", "やすい", ["たかい", "ふるい", "ながい"], "安い is read やすい: cheap."],
          ["【九時】に がっこうに いきます。", "くじ", ["きゅうじ", "ここのじ", "くうじ"], "Nine o'clock is the irregular くじ."],
          ["えきの 【北】に こうえんが あります。", "きた", ["みなみ", "ひがし", "にし"], "北 is read きた: north."],
        ],
      },
      {
        instruction: "Choose the kanji for the word in 【 】.",
        questions: [
          ["【やま】に のぼりたいです。", "山", ["川", "出", "上"], "やま, mountain, is written 山."],
          ["【でんしゃ】で いきます。", "電車", ["電話", "車電", "雨車"], "でんしゃ, train, is written 電車."],
          ["この ほんは 【あたらしい】です。", "新しい", ["古い", "高い", "白い"], "あたらしい, new, is written 新しい."],
          ["【みぎ】に エレベーターが あります。", "右", ["左", "口", "名"], "みぎ, right, is written 右."],
        ],
      },
      {
        instruction: "Choose the best word for (　　).",
        questions: [
          ["まいあさ はを (　　)。", "みがきます", ["あびます", "のぼります", "わたります"], "はを みがきます: to brush one's teeth."],
          ["きっぷを (　　) かいました。", "にまい", ["ふたり", "にほん", "にかい"], "Tickets are flat, so they are counted with まい."],
          ["この みちは くるまが おおいですから、(　　)です。", "あぶない", ["しずか", "ひま", "やすい"], "A road with a lot of cars is dangerous: あぶない."],
          ["しゅうまつ、ホテルに (　　)。", "とまりました", ["のぼりました", "およぎました", "わたりました"], "ホテルに とまります: to stay at a hotel."],
        ],
      },
      {
        instruction: "Choose the sentence closest in meaning.",
        questions: [
          ["この へやは ひろくないです。", "この へやは せまいです。", ["この へやは おおきいです。", "この へやは あたらしいです。", "この へやは きれいです。"], "Not spacious means cramped: せまい."],
          ["きょうは ひまです。", "きょうは いそがしくないです。", ["きょうは いそがしいです。", "きょうは やすみじゃないです。", "きょうは たいへんです。"], "Free means not busy: いそがしくない."],
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
          ["わたしは まいにち でんしゃ (　　) がっこうに いきます。", "で", ["に", "を", "と"], "で marks the means of transport."],
          ["きのう ともだち (　　) えいがを みました。", "と", ["を", "に", "へ"], "と after a person means together with."],
          ["えきで せんせい (　　) あいました。", "に", ["を", "で", "へ"], "The person you meet takes に."],
          ["この かばんは あの かばん (　　) たかいです。", "より", ["ほう", "いちばん", "まで"], "A は B より: A is more… than B."],
          ["きのうは あめ (　　)。", "でした", ["ました", "かったです", "です"], "A noun in the past takes でした."],
          ["この えいがは あまり (　　)。", "おもしろくないです", ["おもしろいです", "おもしろかったです", "おもしろいじゃないです"], "あまり needs a negative, and い-adjectives use くないです."],
          ["すみません、もういちど (　　) ください。", "いって", ["いいて", "いうて", "いいます"], "いいます → いって, then ください."],
          ["いま あねは へやで ほんを (　　)。", "よんでいます", ["よみています", "よんでください", "よんだことです"], "て-form + います shows an action in progress."],
          ["ここで しゃしんを (　　) いいですか。", "とっても", ["とっては", "とるも", "とりても"], "ても いいですか asks permission."],
          ["わたしは まだ ふじさんに (　　) ことが ありません。", "のぼった", ["のぼり", "のぼって", "のぼります"], "Experience uses the た-form before ことが あります."],
          ["あぶないですから、ここで (　　) ください。", "およがないで", ["およぎないで", "およがなくて", "およいでない"], "およぎます → およがない + で ください."],
          ["ねむいです (　　)、コーヒーを のみます。", "から", ["まで", "より", "でも"], "から after a sentence gives the reason."],
        ],
      },
      {
        instruction: "Put the four words in order to complete the sentence. Which word goes in the ★ position?",
        questions: [
          ["ここで ＿＿ ＿＿ ★ ＿＿ いけません。", "すって", ["たばこ", "を", "は"], "ここで たばこ を すって は いけません。"],
          ["バスと でんしゃと ＿＿ ＿＿ ★ ＿＿ か。", "はやい", ["どちら", "が", "です"], "バスと でんしゃと どちら が はやい です か。"],
          ["にほんごを ＿＿ ＿＿ ★ ＿＿。", "が", ["はなす", "こと", "できます"], "にほんごを はなす こと が できます。"],
        ],
      },
    ],
  },
  {
    id: "reading", title: "Reading", titleJp: "どっかい",
    groups: [
      {
        instruction: "Read the message and answer the questions.",
        passage: "アンナさんへ\nあしたの パーティーは ごご ろくじからです。えきの ちかくの レストランで します。わたしは ごじはんに えきの まえで まちます。いっしょに いきましょう。のみものは わたしが かいますから、かわないで ください。\nゆき",
        questions: [
          ["What time will Yuki be waiting?", "5:30 p.m.", ["6:00 p.m.", "5:00 p.m.", "6:30 p.m."], "ごじはんに えきの まえで まちます。"],
          ["What does Yuki ask Anna not to do?", "Buy drinks", ["Come to the station", "Go to the restaurant", "Wait for her"], "のみものは わたしが かいますから、かわないで ください。"],
        ],
      },
      {
        instruction: "Read the diary entry and answer the questions.",
        passage: "きのうは にちようびでした。あさ しちじに おきて、こうえんで はしりました。それから、うちで ひるごはんを つくりました。ごごは ともだちと デパートに いきました。わたしは くろい くつが ほしかったですが、たかかったですから、かいませんでした。ともだちは しろい シャツを にまい かいました。",
        questions: [
          ["What did the writer do first after getting up?", "Ran in the park", ["Made lunch", "Went to a department store", "Bought shoes"], "あさ しちじに おきて、こうえんで はしりました。"],
          ["Why did the writer not buy the shoes?", "They were expensive.", ["There were no black shoes.", "The friend bought them.", "The writer did not want them."], "たかかったですから、かいませんでした。"],
        ],
      },
      {
        instruction: "Read the notice and answer the questions.",
        passage: "にほんごの クラスの がくせいへ\nらいしゅうの げつようびは テストです。テストは ごぜん くじからです。きょうしつは さんがいです。テストの じかんに でんわを つかっては いけません。ペンを わすれないで ください。かようびは やすみです。",
        questions: [
          ["Where is the test?", "On the third floor", ["On the first floor", "On the second floor", "In the library"], "きょうしつは さんがいです。"],
          ["Which statement is true?", "You must not use a phone during the test.", ["The test is on Tuesday.", "The test starts at ten o'clock.", "You do not need a pen."], "テストの じかんに でんわを つかっては いけません。"],
        ],
      },
    ],
  },
];

let count = 0;
const exam = {
  id: "japanese-n5-mock-exam", level: "N5", title: "N5 Mock Exam", minutes: 40, passPercent: 60, sectionMinPercent: 40,
  sections: sections.map(section => ({
    id: section.id, title: section.title, titleJp: section.titleJp,
    groups: section.groups.map(group => ({
      instruction: group.instruction, ...(group.passage ? { passage: group.passage } : {}),
      questions: group.questions.map(([prompt, correct, wrong, explanation]) => {
        if (wrong.length !== 3 || new Set([correct, ...wrong]).size !== 4) throw new Error(`Question needs four different options: ${prompt}`);
        // The correct answer's position follows a fixed irregular pattern, so each position is used about equally.
        const correctIndex = [1, 3, 0, 2, 3, 1, 0, 2, 0, 3, 2, 1][count % 12];
        const options = [...wrong];
        options.splice(correctIndex, 0, correct);
        return { id: `${section.id}-${++count}`, prompt, options, correctIndex, explanation };
      }),
    })),
  })),
};

const file = path.resolve(__dirname, "../../../../shared/course/mock-exams.json");
const all = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
all[exam.level] = exam;
fs.writeFileSync(file, `${JSON.stringify(all, null, 2)}\n`);
console.log(`Wrote the ${exam.level} mock exam: ${count} questions in ${exam.sections.length} sections.`);
