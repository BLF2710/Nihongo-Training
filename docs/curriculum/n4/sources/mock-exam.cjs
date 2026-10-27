// Source for the N4 mock exam. Run: node docs/curriculum/n4/sources/mock-exam.cjs
// Writes shared/course/mock-exams.json (other levels in that file are kept).
// A question is [prompt, correct answer, [three wrong answers], explanation]. Only grammar, vocabulary and kanji
// taught up to the end of N4 are used. Furigana shorthand 漢字{かんじ} is expanded as in the lessons; the word in
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
          ["【試験】は来週{らいしゅう}の月曜日{げつようび}です。", "しけん", ["しげん", "ためけん", "しけい"], "試験 is read しけん: exam."],
          ["この【建物】はとても古{ふる}いです。", "たてもの", ["けんぶつ", "たちもの", "けんもの"], "建物 is read たてもの: building."],
          ["駅{えき}の近{ちか}くに【住】んでいます。", "す", ["じゅう", "い", "ちか"], "住む is read すむ: to live."],
          ["【家族】は四人{よにん}です。", "かぞく", ["いえぞく", "かそく", "けぞく"], "家族 is read かぞく: family."],
          ["先生{せんせい}に【質問】しました。", "しつもん", ["しちもん", "しつぶん", "じつもん"], "質問 is read しつもん: question."],
        ],
      },
      {
        instruction: "Choose the kanji for the word in 【 】.",
        questions: [
          ["【えいが】を見{み}に行{い}きませんか。", "映画", ["英画", "映会", "映話"], "えいが, film, is written 映画."],
          ["毎朝{まいあさ}【はしって】います。", "走って", ["歩って", "起って", "通って"], "はしる, to run, is written 走る."],
          ["【としょかん】で本{ほん}を借{か}りました。", "図書館", ["図書間", "地書館", "図画館"], "としょかん, library, is written 図書館."],
          ["この問題{もんだい}は【むり】です。", "無理", ["無料", "不理", "無代"], "むり, impossible, is written 無理."],
        ],
      },
      {
        instruction: "Choose the best word for (　　).",
        questions: [
          ["ねつがあるので、会社{かいしゃ}を（　　）しました。", "早退{そうたい}", ["出発{しゅっぱつ}", "発表{はっぴょう}", "注文{ちゅうもん}"], "Leaving work early: 早退{そうたい}."],
          ["にもつが（　　）ので、持{も}ってもらえませんか。", "重{おも}い", ["かるい", "正{ただ}しい", "同{おな}じ"], "A heavy bag: 重{おも}い."],
          ["電車{でんしゃ}にかさを（　　）しまいました。", "わすれて", ["おぼえて", "あつめて", "しらべて"], "Leaving something behind: わすれる."],
          ["次{つぎ}の駅{えき}で電車{でんしゃ}を（　　）ください。", "乗{の}りかえて", ["通{かよ}って", "走{はし}って", "止{と}まって"], "To change trains: 乗{の}りかえる."],
        ],
      },
      {
        instruction: "Choose the sentence closest in meaning.",
        questions: [
          ["この本{ほん}は読{よ}みにくいです。", "この本{ほん}はかんたんに読{よ}めません。", ["この本{ほん}はすぐ読{よ}めます。", "この本{ほん}は読{よ}みたくないです。", "この本{ほん}はもう読{よ}みました。"], "読{よ}みにくい: hard to read."],
          ["リーさんは留守{るす}です。", "リーさんは家{いえ}にいません。", ["リーさんはねています。", "リーさんはいそがしいです。", "リーさんは家{いえ}にいます。"], "留守{るす}: not at home."],
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
          ["天気予報{てんきよほう}によると、明日{あした}は雨{あめ}がふる（　　）です。", "そう", ["よう", "はず", "みたい"], "Hearsay: plain form + そうです."],
          ["このケーキはおいし（　　）ですね。食{た}べてもいいですか。", "そう", ["らしい", "はず", "よう"], "Looks: adjective stem + そう."],
          ["毎日{まいにち}れんしゅうす（　　）、上手{じょうず}になりますよ。", "れば", ["ると", "ても", "るなら"], "A condition and its result: すれば."],
          ["駅{えき}につい（　　）、電話{でんわ}してください。", "たら", ["と", "ば", "ても"], "A request can follow たら."],
          ["日本語{にほんご}が話{はな}せる（　　）なりました。", "ように", ["ために", "そうに", "ことに"], "A new ability: ようになる."],
          ["ねる（　　）、はをみがきます。", "まえに", ["あとで", "ながら", "のに"], "まえに takes the dictionary form."],
          ["わたしは先生{せんせい}（　　）しかられました。", "に", ["を", "が", "で"], "The person who did it takes に."],
          ["母{はは}は弟{おとうと}（　　）やさいを食{た}べさせました。", "に", ["を", "が", "で"], "Causative with an object: に."],
          ["雨{あめ}がふっ（　　）、出{で}かけます。", "ても", ["たら", "ば", "と"], "Even if: ても."],
          ["たくさん勉強{べんきょう}した（　　）、試験{しけん}におちました。", "のに", ["ので", "ために", "から"], "Even though: のに."],
          ["すみません、一{ひと}つ質問{しつもん}（　　）ください。", "させて", ["して", "されて", "させられて"], "Let me: させてください."],
        ],
      },
      {
        instruction: "Choose the most suitable polite expression.",
        questions: [
          ["（店員{てんいん}がお客{きゃく}さんに）少々{しょうしょう}（　　）ください。", "お待{ま}ち", ["待{ま}って", "お待{ま}ちし", "待{ま}たせて"], "Staff use お V-stem ください."],
          ["（先生{せんせい}に）明日{あした}、研究室{けんきゅうしつ}に（　　）もよろしいですか。", "うかがって", ["いらっしゃって", "めしあがって", "なさって"], "Humble visit: うかがう."],
          ["（自分{じぶん}のことを）はじめまして。リーと（　　）。", "もうします", ["おっしゃいます", "いらっしゃいます", "なさいます"], "Humble 言{い}う: もうす."],
          ["社長{しゃちょう}はもうお帰{かえ}りに（　　）。", "なりました", ["しました", "いたしました", "まいりました"], "Honorific: お V-stem になる."],
        ],
      },
    ],
  },
  {
    id: "reading", title: "Reading", titleJp: "どっかい",
    groups: [
      {
        instruction: "Read the message and answer the questions.",
        passage: "アナさんへ\n来週{らいしゅう}の土曜日{どようび}、みんなで公園{こうえん}でバーベキューをしようと思{おも}っています。肉{にく}とやさいはわたしがじゅんびしておきます。飲{の}み物{もの}を持{も}ってきてもらえませんか。天気予報{てんきよほう}によると、土曜日{どようび}ははれるそうです。もし雨{あめ}がふったら、わたしの家{いえ}でやりましょう。\nけん",
        questions: [
          ["What does Ken ask Anna to bring?", "Drinks", ["Meat", "Vegetables", "A tent"], "飲{の}み物{もの}を持{も}ってきてもらえませんか。"],
          ["What will happen if it rains?", "They will have it at Ken's house.", ["They will cancel it.", "They will go another day.", "They will go to a restaurant."], "もし雨{あめ}がふったら、わたしの家{いえ}でやりましょう。"],
          ["What does the forecast say?", "It will be sunny on Saturday.", ["It will rain on Saturday.", "It will be cold on Saturday.", "There will be a typhoon."], "土曜日{どようび}ははれるそうです。"],
        ],
      },
      {
        instruction: "Read the notice and answer the questions.",
        passage: "市{し}の図書館{としょかん}からのお知{し}らせ\n来月{らいげつ}から、図書館{としょかん}は月曜日{げつようび}が休{やす}みになります。本{ほん}は一回{いっかい}に十冊{じゅっさつ}まで、二週間{にしゅうかん}借{か}りることができます。地下{ちか}の部屋{へや}は勉強{べんきょう}に使{つか}うことができますが、中{なか}で物{もの}を食{た}べてはいけません。インターネットは無料{むりょう}で使{つか}えます。",
        questions: [
          ["When will the library be closed from next month?", "On Mondays", ["On Sundays", "On weekends", "Every day in the evening"], "月曜日{げつようび}が休{やす}みになります。"],
          ["How many books can you borrow at once?", "Up to ten", ["Up to two", "Up to twelve", "As many as you like"], "一回{いっかい}に十冊{じゅっさつ}まで."],
          ["Which is NOT allowed in the basement room?", "Eating", ["Studying", "Using the internet", "Reading"], "中{なか}で物{もの}を食{た}べてはいけません。"],
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
  id: "japanese-n4-mock-exam", level: "N4", title: "N4 Mock Exam", minutes: 50, passPercent: 60, sectionMinPercent: 40,
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
