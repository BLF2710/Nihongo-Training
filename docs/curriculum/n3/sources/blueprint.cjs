// Source for the N3 blueprint. Run: node docs/curriculum/n3/sources/blueprint.cjs
// Writes docs/curriculum/blueprint-n3.json. Lesson ids are fixed once issued: change titles freely, never ids.
// A lesson is [slug, title, title_jp, [grammar], [kanji]]; the sixth lesson of each unit is its review.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../../../..");
const FIRST_SEQUENCE = 19; // N5 holds sequences 1–9, N4 10–18.

const units = [
  ["Timing", "タイミング", "Say exactly when something happens: about to, just done, while there is still time, in the middle of, and ever since.",
    ["I can say I am about to do, am doing, or have just done something.", "I can say something happened the moment something else did.", "I can say I will do something while I still can.", "I can say something happened in the middle of something else.", "I can talk about what has been true ever since a change."], [
    ["about-to", "Just About To…", "〜ところです", ["V-る / V-て いる / V-た ところだ", "〜ところに / 〜ところへ (just as)"], ["最", "初", "次", "点", "直", "戻"]],
    ["the-moment", "The Moment I Arrived", "〜たばかり・〜たとたん", ["V-た ばかりだ (just did)", "V-た とたん(に) (the moment)"], ["到", "乗", "降", "落", "飛", "港"]],
    ["while-you-can", "While You Still Can", "〜うちに", ["〜うちに (while, before it changes)", "V-ない うちに (before)"], ["若", "暗", "冷", "温", "晴", "雪"]],
    ["in-the-middle", "In the Middle of a Meeting", "〜さいちゅうに", ["N の / V-て いる さいちゅうに", "〜あいだ vs 〜あいだに"], ["席", "議", "授", "予", "約", "定"]],
    ["ever-since", "Ever Since…", "〜て いらい", ["V-て 以来 / N 以来", "V-て からでないと (not until)"], ["結", "婚", "卒", "退", "引", "越"]],
    ["review", "Unit 1 Review", "ユニット1の ふくしゅう", [], []],
  ]],
  ["Reasons & Results", "げんいんと けっか", "Explain why something happened, who or what to thank or blame, and what follows from it.",
    ["I can say what helped or what was to blame.", "I can give the cause of an event in a formal way.", "I can draw a conclusion from what I know.", "I can say something is not always or not entirely true.", "I can say I cannot do something because of my situation."], [
    ["thanks-to", "Thanks To You", "〜おかげで・〜せいで", ["N の / plain form + おかげで", "N の / plain form + せいで"], ["助", "遅", "故", "失", "敗", "成"]],
    ["because-of", "Because of the Typhoon", "〜ために・〜に よって", ["N の / plain form + ため(に) (cause)", "N に よって (cause, depending on)"], ["原", "因", "害", "交", "波", "島"]],
    ["thats-why", "So That's Why", "〜わけだ", ["plain form + わけだ (so that is why)", "〜と いう わけだ"], ["由", "解", "説", "当", "然", "確"]],
    ["not-always", "Not Always", "〜わけでは ない", ["〜わけでは ない (not necessarily)", "〜とは かぎらない"], ["必", "要", "全", "部", "限", "常"]],
    ["i-cant-just", "I Can't Just…", "〜わけには いかない", ["V-る / V-ない わけには いかない", "〜わけが ない"], ["断", "束", "任", "責", "守", "頼"]],
    ["review", "Unit 2 Review", "ユニット2の ふくしゅう", [], []],
  ]],
  ["Decisions & Rules", "きめた ことと きまり", "Say what you decided and what was decided for you, the habits you keep, what people ought to do, and what you were made to do.",
    ["I can say what I have decided to do.", "I can explain rules and arrangements.", "I can say what I try to do as a habit.", "I can say what people should and should not do.", "I can say what I was made to do against my will."], [
    ["i-decided", "I've Decided", "〜ことに する", ["V-る / V-ない ことに する", "〜ことに して いる (my rule)"], ["決", "選", "留", "続", "辞", "変"]],
    ["its-been-decided", "It's Been Decided", "〜ことに なる", ["〜ことに なった (it was arranged)", "〜ことに なって いる (the rule is)"], ["規", "則", "法", "禁", "務", "式"]],
    ["i-make-sure", "I Make Sure To…", "〜ように する", ["V-る / V-ない ように する・して いる", "〜ように (so that)"], ["健", "康", "薬", "歯", "寝", "忘"]],
    ["you-ought-to", "You Ought To…", "〜べきだ", ["V-る べきだ / べきでは ない", "〜べきだった (regret, criticism)"], ["礼", "他", "迷", "惑", "優", "老"]],
    ["made-to-do", "I Was Made To…", "〜させられる", ["causative-passive form", "short causative-passive (〜される)"], ["輩", "練", "片", "付", "掃", "除"]],
    ["review", "Unit 3 Review", "ユニット3の ふくしゅう", [], []],
  ]],
  ["Comparisons & Degree", "くらべると どのくらい", "Compare things precisely, say how much something changes with something else, and say \"not only\" and \"even\".",
    ["I can say the more one thing happens, the more another does.", "I can say something is not as … as something else.", "I can say what something is rather than what it seems.", "I can compare two things or groups.", "I can say \"not only … but also\" and \"even\"."], [
    ["the-more", "The More, the Better", "〜ば 〜ほど", ["V-ば V-る ほど / adjective-ければ 〜ほど", "〜ほど (to the extent that)"], ["増", "減", "数", "量", "値", "段"]],
    ["not-as", "Not As Cold As…", "〜ほど 〜ない", ["N ほど 〜ない", "〜くらい / 〜ぐらい (degree)"], ["寒", "暑", "熱", "涼", "頃", "昨"]],
    ["rather-than", "Rather Than…", "〜と いうより", ["〜と いうより (rather)", "〜より むしろ"], ["普", "趣", "静", "実", "際", "便"]],
    ["compared-to", "Compared With…", "〜に くらべて", ["N に 比べて", "N に 対して (in contrast to, toward)"], ["比", "対", "平", "均", "差", "両"]],
    ["not-only", "Not Only…", "〜だけで なく", ["〜だけで なく / 〜ばかりで なく", "N さえ / 〜さえ 〜ば", "V-て ばかり いる"], ["遊", "泳", "戦", "負", "勝", "球"]],
    ["review", "Unit 4 Review", "ユニット4の ふくしゅう", [], []],
  ]],
  ["Topics & Viewpoints", "わだいと たちば", "Name the topic you are talking about, say what something means to someone, speak in a role, and explain words.",
    ["I can say what a talk or article is about.", "I can say what something means to me.", "I can speak as a member of a group or in a role.", "I can raise a topic someone reminded me of.", "I can explain what a word or name means."], [
    ["about", "About This Topic", "〜に ついて・〜に かんして", ["N に ついて", "N に 関して / に 関する N"], ["関", "係", "情", "報", "調", "告"]],
    ["to-me", "What It Means to Me", "〜に とって", ["N に とって", "〜に とって の N"], ["夢", "将", "幸", "福", "命", "愛"]],
    ["as-a", "As a Leader", "〜として", ["N として", "N としては / N としても"], ["表", "職", "経", "営", "指", "導"]],
    ["speaking-of", "Speaking of Summer…", "〜と いえば", ["N と いえば / と いうと", "〜って (casual topic and quote)"], ["祭", "季", "節", "景", "観", "光"]],
    ["called", "A Word Called…", "〜と いう", ["N と いう N", "〜と いうのは 〜ことだ (definitions)"], ["呼", "葉", "記", "号", "示", "単"]],
    ["review", "Unit 5 Review", "ユニット5の ふくしゅう", [], []],
  ]],
  ["Guesses & Impressions", "すいりょうと いんしょう", "Say how sure you are, describe a slight tendency or feeling, compare something to what it resembles, and warn of risks.",
    ["I can say something must be true.", "I can say something is a little like something, or I feel slightly unwell.", "I can describe something as if it were something else.", "I can say something tends to happen or might go wrong.", "I can put forward a careful opinion."], [
    ["must-be", "It Must Be Him", "〜に ちがいない", ["plain form + に 違いない", "〜に 決まって いる"], ["違", "犯", "罪", "警", "察", "盗"]],
    ["a-bit-like", "A Bit Like a Cold", "〜っぽい・〜ぎみ", ["N / V-stem + っぽい", "N / V-stem + 気味"], ["邪", "疲", "痛", "腹", "眠", "怒"]],
    ["as-if", "As If in a Dream", "まるで 〜ようだ", ["まるで 〜ようだ / みたいだ", "〜ように 見える"], ["絵", "似", "美", "星", "雲", "例"]],
    ["tends-to", "It Tends To…", "〜がち・〜おそれが ある", ["N / V-stem + がちだ", "〜おそれが ある"], ["危", "険", "恐", "誤", "欠", "曇"]],
    ["i-wonder-if", "Isn't It That…?", "〜のでは ないだろうか", ["〜のでは ないだろうか / ないか", "〜だろうか (I wonder)"], ["疑", "想", "像", "未", "可", "能"]],
    ["review", "Unit 6 Review", "ユニット6の ふくしゅう", [], []],
  ]],
  ["Commands & Wishes", "めいれいと ねがい", "Understand commands and written instructions, wish things were different, make polite requests, and say what you have to do in casual speech.",
    ["I can understand commands on signs and in sport, games and stories.", "I can follow written instructions on forms.", "I can say what I wish were true.", "I can ask a superior for a favour very politely.", "I can talk about what I must and must not do in casual speech."], [
    ["commands", "Stop! Run!", "めいれいけい", ["command form", "V-る な (don't)"], ["令", "押", "投", "逃", "急", "打"]],
    ["instructions", "Fill In the Form", "〜なさい・〜こと", ["V-stem + なさい", "V-る / V-ない こと (written rules)"], ["類", "申", "印", "配", "届", "払"]],
    ["i-wish", "I Wish…", "〜と いいな・〜ば いいのに", ["〜と いい / 〜たら いい な (hope)", "〜ば いいのに / 〜たら よかったのに"], ["願", "望", "絶", "彼", "君", "皆"]],
    ["could-you-possibly", "Could You Possibly…?", "〜て いただけないでしょうか", ["V-て もらいたい / いただきたい", "V-て いただけないでしょうか"], ["頂", "案", "伝", "達", "協", "力"]],
    ["gotta-go", "Gotta Go!", "〜なきゃ・〜ちゃ だめ", ["〜なくちゃ / 〜なきゃ (must, casual)", "〜ちゃ だめ / 〜て いい (casual permission)"], ["宿", "洗", "捨", "窓", "閉", "皿"]],
    ["review", "Unit 7 Review", "ユニット7の ふくしゅう", [], []],
  ]],
  ["Contrast & Concession", "たいひと ぎゃくせつ", "Complain about people who should know better, weigh things against expectations, trade one thing for another, and say something happened in spite of everything.",
    ["I can criticise someone who behaves against what is expected.", "I can say something is more or less than expected.", "I can say I do one thing instead of another.", "I can weigh good points against bad ones.", "I can say something happened despite a difficulty."], [
    ["even-though-he", "And He Calls Himself…", "〜くせに", ["N の / plain form + くせに", "〜くせして (casual)"], ["性", "格", "弱", "太", "細", "返"]],
    ["for-its-price", "Cheap for Its Size", "〜わりに", ["N の / plain form + わりに(は)", "〜にしては"], ["歳", "割", "給", "商", "低", "費"]],
    ["instead", "Instead of Me", "〜かわりに", ["N の / V-る かわりに (instead of)", "〜かわりに (in exchange for)"], ["換", "担", "番", "夫", "妻", "婦"]],
    ["on-the-other-hand", "On the Other Hand", "〜いっぽうで・〜はんめん", ["〜一方(で)", "〜反面"], ["反", "面", "利", "舎", "農", "村"]],
    ["despite", "Despite the Rain", "〜にも かかわらず", ["N / plain form + にも かかわらず", "V-ても V-ても (no matter how much)"], ["努", "果", "加", "参", "賞", "残"]],
    ["review", "Unit 8 Review", "ユニット8の ふくしゅう", [], []],
  ]],
  ["Formal Japanese", "かたい 日本語", "Read written and news-style Japanese, talk about regular intervals and whole periods, and make polite requests at work and in shops.",
    ["I can read the written である style.", "I can say how often something happens or repeats.", "I can say something lasts through a whole period or place.", "I can follow and use polite service Japanese.", "I can understand how the news reports opinions and causes."], [
    ["written-style", "The Written Style", "である たい", ["である style", "V-ず(に) (without)"], ["論", "的", "現", "存", "在", "共"]],
    ["every-time", "Every Time…", "〜たびに・〜ごとに", ["V-る / N の たびに", "〜ごとに / 〜おきに"], ["晩", "期", "局", "放", "組", "停"]],
    ["throughout", "All Year Round", "〜じゅう・〜を とおして", ["N 中 (じゅう: throughout)", "N を 通して / 通じて"], ["歴", "史", "王", "民", "城", "寺"]],
    ["service-japanese", "At Your Service", "〜させて いただく", ["V-させて いただく", "お / ご 〜ください"], ["容", "様", "客", "受", "求", "認"]],
    ["in-the-news", "In the News", "〜と される・〜ことから", ["〜と される / 〜と 考えられる", "〜ことから (because, from the fact that)"], ["政", "治", "済", "首", "府", "相"]],
    ["review", "Unit 9 Review", "ユニット9の ふくしゅう", [], []],
  ]],
];

// Kanji from N5 and N4, so N3 never re-introduces one.
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "shared/kanji.json"), "utf8"));
const n4Blueprint = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/curriculum/blueprint-n4.json"), "utf8"));
const earlier = new Set([
  ...catalog.kanji.map(kanji => kanji.character),
  ...n4Blueprint.units.flatMap(unit => unit.lessons.flatMap(lesson => lesson.kanji)),
]);
const seen = new Map();

const blueprintUnits = units.map(([title, titleJp, description, canDo, lessons], index) => {
  const number = index + 1;
  const unitId = `japanese-n3-unit-${number}`;
  return {
    unit_id: unitId, level: "N3", unit_number: number, sequence: FIRST_SEQUENCE + index, title, title_jp: titleJp, description,
    can_do: canDo, required_xp_level: null, target_vocab: 60,
    lessons: lessons.map(([slug, lessonTitle, lessonTitleJp, grammar, kanji], lessonIndex) => {
      for (const character of kanji) {
        if (earlier.has(character)) throw new Error(`${character} is already taught in N5 or N4`);
        if (seen.has(character)) throw new Error(`${character} is scheduled twice: ${seen.get(character)} and ${unitId}-${slug}`);
        seen.set(character, `${unitId}-${slug}`);
      }
      return { lesson_id: `${unitId}-${slug}`, lesson_number: lessonIndex + 1, is_review: lessonIndex === 5, title: lessonTitle, title_jp: lessonTitleJp, grammar, target_vocab: lessonIndex === 5 ? 0 : 12, kanji };
    }),
  };
});

const blueprint = {
  blueprint_version: 1, stage: "0", part: "N3 (part 3 of 6)", status: "blueprint only: no lessons generated yet", level: "N3",
  defaults: {
    unit_shape: "5 content lessons + 1 review lesson + 1 assessment (15 questions, pass at 12/15), as in N4",
    script: "Every kanji is written with furigana (<ruby>). Kanji already taught are used in kanji; words whose kanji are not yet taught stay in kana. Sentences are written without word spaces.",
    romaji: "No romaji: vocabulary, grammar examples and dialogues are written in Japanese with furigana only.",
    verbs: "Vocabulary lists verbs in the dictionary form, as in N4.",
    required_xp_level: "Left null, as in N5 and N4: units unlock by completing the previous unit.",
  },
  units: blueprintUnits,
  kanji_index: {
    new_in_n3: seen.size, course_total_at_end: earlier.size + seen.size,
    target_note: "Common study lists put about 650 kanji at the end of N3; this course reaches about 520 with six new kanji per content lesson and lists its own choice. JLPT publishes no official kanji list.",
  },
  deviations_and_assumptions: [
    "N3 Unit 1 follows N4 Unit 9 in the unlock chain (sequence 19).",
    "The causative-passive, left out of N4, is taught in Unit 3.",
    "Grammar N4 already covers (〜そうです, 〜らしい, 〜ようです, 〜はずです, 〜によると, 〜て ほしい) is reused, not taught again.",
    "Romaji is dropped entirely at N3; furigana stays on every kanji.",
  ],
};

fs.writeFileSync(path.join(ROOT, "docs/curriculum/blueprint-n3.json"), `${JSON.stringify(blueprint, null, 2)}\n`);
console.log(`Wrote the N3 blueprint: ${blueprintUnits.length} units, ${seen.size} new kanji (course total ${earlier.size + seen.size}).`);
