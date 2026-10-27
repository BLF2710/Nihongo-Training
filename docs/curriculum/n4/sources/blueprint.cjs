// Source for the N4 blueprint. Run: node docs/curriculum/n4/sources/blueprint.cjs
// Writes docs/curriculum/blueprint-n4.json. Lesson ids are fixed once issued: change titles freely, never ids.
// A lesson is [slug, title, title_jp, [grammar], [kanji]]; the sixth lesson of each unit is its review.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../../../..");
const FIRST_SEQUENCE = 10; // N5 Units 1–9 hold sequences 1–9.

const units = [
  ["Thoughts & Explanations", "かんがえと せつめい", "Say what you think, pass on what others said, describe things with whole clauses, and explain reasons and likelihood.",
    ["I can say what I think and ask for opinions.", "I can report what someone said.", "I can describe people and things with a clause.", "I can explain a situation and ask what happened.", "I can say what will probably or might happen."], [
    ["i-think", "I Think…", "〜と おもいます", ["plain form + と思います", "〜と思いますか (asking opinions)", "dictionary-form verbs in vocabulary lists"], ["思", "考", "意"]],
    ["they-said", "They Said…", "〜と いっていました", ["plain form + と言いました / と言っていました", "quoting a question: 〜か (どうか) 知っていますか"], ["答", "知", "明"]],
    ["the-book-i-bought", "The Book I Bought", "きのう かった ほん", ["noun-modifying clauses (plain form + N)", "clause が in a noun-modifying clause"], ["物", "屋", "家"]],
    ["what-happened", "What Happened?", "どうしたんですか", ["〜んです / 〜んですか (explaining, asking for an explanation)", "〜んですが、〜 (opening a request)"], ["病", "院", "医", "者"]],
    ["probably", "Probably & Maybe", "〜でしょう・〜かもしれません", ["plain form + でしょう / だろう", "plain form + かもしれません"], ["朝", "昼", "夜", "風"]],
    ["review", "Unit 1 Review", "ユニット1の ふくしゅう", [], []],
  ]],
  ["Giving & Receiving", "あげる・くれる・もらう", "Give and receive things and favours, ask people to do things for you, and give advice.",
    ["I can say who gave what to whom.", "I can talk about favours done for me and by me.", "I can ask someone politely to do something for me.", "I can give and take advice."], [
    ["give-and-get", "Giving & Getting", "あげる・もらう", ["N に N を あげる", "N に / から N を もらう"], ["兄", "弟", "姉", "妹"]],
    ["they-gave-me", "They Gave Me…", "くれる", ["N が (わたしに) N を くれる", "choosing between あげる and くれる"], ["送", "紙", "持"]],
    ["doing-favours", "Doing Favours", "〜て あげる・〜て もらう", ["V-て あげる", "V-て もらう"], ["教", "習", "貸", "借"]],
    ["would-you-mind", "Would You Mind…?", "〜て くれませんか", ["V-て くれる", "V-て くれませんか / V-て もらえませんか"], ["写", "真", "待"]],
    ["you-should", "You Should…", "〜ほうが いいです", ["V-た ほうが いい", "V-ない ほうが いい"], ["体", "早", "心"]],
    ["review", "Unit 2 Review", "ユニット2の ふくしゅう", [], []],
  ]],
  ["Abilities & Changes", "できることと かわること", "Say what you can do with the potential form, describe changes in ability and habit, list reasons, and say how things look.",
    ["I can say what I can and cannot do.", "I can describe how my abilities or habits have changed.", "I can give several reasons at once.", "I can say how something looks or seems."], [
    ["i-can-drive", "I Can Drive", "うんてんできる", ["potential form: group 2 and irregular verbs", "N が + potential verb"], ["運", "転", "動"]],
    ["i-can-sing", "I Can Sing It", "うたえる", ["potential form: group 1 verbs", "potential in the negative and past"], ["歌", "音", "楽"]],
    ["now-i-can", "Now I Can…", "〜ように なりました", ["V-る ように なる", "V-なく なる"], ["始", "終", "去"]],
    ["and-also", "And Besides…", "〜し、〜し", ["plain form + し、〜し (listing reasons)", "それに"], ["広", "近", "住"]],
    ["looks-tasty", "It Looks Tasty", "おいしそうです", ["adjective stem + そうです (looks)", "V-stem + そうです (about to)"], ["味", "色", "赤", "青"]],
    ["review", "Unit 3 Review", "ユニット3の ふくしゅう", [], []],
  ]],
  ["If & When", "〜たら・〜ば・〜と・〜なら", "Talk about conditions and their results with たら, ば, と and なら, and say \"even if\".",
    ["I can say what I will do if or when something happens.", "I can state general conditions and their results.", "I can give directions with と.", "I can give advice about a topic someone raises."], [
    ["if-it-rains", "If It Rains", "あめが ふったら", ["V-たら / adjective-たら / N-だったら", "たら for when (after)"], ["春", "夏", "秋", "冬"]],
    ["if-you-study", "If You Study", "べんきょうすれば", ["conditional ば form", "〜ば よかった (regret)"], ["試", "験", "勉", "強"]],
    ["turn-right", "Turn Right and…", "まがると", ["plain form + と (natural result)", "directions with と"], ["歩", "走", "止"]],
    ["if-its-kyoto", "If It's Kyoto…", "きょうとなら", ["N なら (as for, if it's)", "plain form + なら (advice)"], ["京", "都", "旅"]],
    ["even-if", "Even If…", "〜ても", ["V-ても / adjective-くても / N でも", "いくら〜ても"], ["開", "切", "起"]],
    ["review", "Unit 4 Review", "ユニット4の ふくしゅう", [], []],
  ]],
  ["Intentions & Plans", "よていと けいかく", "Say what you intend and plan to do, why, and in what order.",
    ["I can suggest plans in casual speech.", "I can say what I am thinking of doing.", "I can say what I intend and do not intend to do.", "I can give the purpose of an action.", "I can put plans in order with before and after."], [
    ["lets-go", "Let's Go!", "いこう", ["volitional form (casual let's)", "〜(よ)うか (shall I / shall we)"], ["映", "画", "洋", "服"]],
    ["thinking-of", "I'm Thinking of…", "〜(よ)うと おもって います", ["volitional + と思っています", "volitional + と思います"], ["世", "界", "海"]],
    ["i-intend-to", "I Intend To…", "〜つもりです", ["V-る / V-ない つもりです", "N の よていです"], ["仕", "事", "働"]],
    ["in-order-to", "In Order To…", "〜ために", ["V-る / N の ために (purpose)", "V-る のに (used for)"], ["銀", "員", "用"]],
    ["before-and-after", "Before & After", "〜まえに・〜あとで", ["V-る まえに", "V-た あとで"], ["夕", "方", "曜"]],
    ["review", "Unit 5 Review", "ユニット5の ふくしゅう", [], []],
  ]],
  ["Trying, Finishing & Preparing", "ためす・おわる・じゅんびする", "Try things out, say something got done (or went wrong), prepare in advance, and describe states and changes.",
    ["I can say I will try something.", "I can say something is completely done, or happened by mistake.", "I can say what I will do in advance.", "I can describe the state of things around me.", "I can describe changes."], [
    ["try-it", "Try It On", "〜て みる", ["V-て みる"], ["着", "肉", "茶", "飯"]],
    ["oh-no", "Oh No, I Did It", "〜て しまう", ["V-て しまう (completion, regret)", "〜ちゃう (casual)"], ["悪", "死", "不"]],
    ["getting-ready", "Getting Ready", "〜て おく", ["V-て おく", "〜とく (casual)"], ["料", "理", "計"]],
    ["the-door-is-open", "The Door Is Open", "〜て ある・〜て いる", ["transitive / intransitive pairs", "V-て ある vs V-て いる"], ["室", "堂", "館", "図"]],
    ["becoming", "It Became…", "〜く なる・〜に する", ["adjective + なる", "N / adjective + に する (decide, make)"], ["重", "正", "同"]],
    ["review", "Unit 6 Review", "ユニット6の ふくしゅう", [], []],
  ]],
  ["Hearsay & Appearances", "きいた ことと 見た かんじ", "Pass on what you heard, and say what seems to be true from what you see or know.",
    ["I can pass on information I heard or read.", "I can say what seems to be the case.", "I can compare something to something else.", "I can say what should be true."], [
    ["i-heard", "I Heard That…", "〜そうです", ["plain form + そうです (hearsay)", "〜によると"], ["特", "別", "発"]],
    ["apparently", "Apparently…", "〜らしい", ["plain form + らしい", "N らしい (typical of)"], ["自", "主", "有"]],
    ["it-seems", "It Seems…", "〜ようです", ["plain form + ようです", "N の ような / N の ように"], ["黒", "鳥", "犬"]],
    ["like-a", "Just Like…", "〜みたい", ["plain form + みたい (casual)", "N みたいな N"], ["漢", "字", "英"]],
    ["should-be", "It Should Be…", "〜はずです", ["plain form + はずです", "〜はずが ない"], ["以", "度", "集"]],
    ["review", "Unit 7 Review", "ユニット7の ふくしゅう", [], []],
  ]],
  ["Passive & Causative", "うけみと しえき", "Say what was done to someone, what someone made or let someone do, and ask to be allowed to do something.",
    ["I can say what was done, and by whom.", "I can complain about something done to me.", "I can say who made or let someone do something.", "I can ask to be allowed to do something.", "I can say what I want someone to do."], [
    ["was-made", "It Was Made In…", "つくられる", ["passive form", "N に よって (by, for creations)"], ["使", "作", "建"]],
    ["i-got-scolded", "I Got Scolded", "しかられた", ["passive of inconvenience", "N に V-られる"], ["売", "代", "町"]],
    ["made-to-do", "Made to Do It", "させる", ["causative form", "N を / N に V-させる (make, let)"], ["親", "注", "族"]],
    ["let-me", "Please Let Me…", "〜させて ください", ["V-させて ください", "V-させて もらえませんか"], ["帰", "問", "題", "質"]],
    ["i-want-you-to", "I Want You To…", "〜て ほしい", ["V-て ほしい", "V-る ように 言う / たのむ"], ["研", "究", "工", "場"]],
    ["review", "Unit 8 Review", "ユニット8の ふくしゅう", [], []],
  ]],
  ["Polite Japanese", "ていねいな にほんご", "Understand and use basic honorific and humble Japanese, and a set of useful patterns for doing two things at once, too much, and with ease.",
    ["I can understand basic honorific speech from staff and teachers.", "I can talk humbly about myself to a senior.", "I can say I do two things at once, or do too much.", "I can say something is easy or hard to do.", "I can say something happened despite expectations."], [
    ["honorific", "Honorific Speech", "そんけいご", ["お V-に なる, special honorific verbs", "いらっしゃる・めしあがる・ごらんに なる"], ["公", "園", "市"]],
    ["humble", "Humble Speech", "けんじょうご", ["お V-する, special humble verbs", "まいる・いただく・もうす"], ["文", "品", "業"]],
    ["while-doing", "While & Too Much", "〜ながら・〜すぎる", ["V-stem + ながら", "V-stem / adjective stem + すぎる"], ["頭", "顔", "声"]],
    ["easy-to-use", "Easy to Use", "〜やすい・〜にくい", ["V-stem + やすい / にくい"], ["地", "鉄", "通"]],
    ["even-though", "Even Though…", "〜のに", ["plain form + のに", "〜のに (for, used for) contrasted"], ["無", "回", "台"]],
    ["review", "Unit 9 Review", "ユニット9の ふくしゅう", [], []],
  ]],
];

// N5 kanji, so N4 never re-introduces one.
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "shared/kanji.json"), "utf8"));
const n5 = new Set(catalog.kanji.filter(kanji => {
  const introduced = catalog.lessonIntroductions.find(item => item.introducedKanji.includes(kanji.id));
  return !introduced || introduced.lessonId.startsWith("japanese-n5-");
}).map(kanji => kanji.character));
const seen = new Map();

const blueprintUnits = units.map(([title, titleJp, description, canDo, lessons], index) => {
  const number = index + 1;
  const unitId = `japanese-n4-unit-${number}`;
  return {
    unit_id: unitId, level: "N4", unit_number: number, sequence: FIRST_SEQUENCE + index, title, title_jp: titleJp, description,
    can_do: canDo, required_xp_level: null, target_vocab: 55,
    lessons: lessons.map(([slug, lessonTitle, lessonTitleJp, grammar, kanji], lessonIndex) => {
      for (const character of kanji) {
        if (n5.has(character)) throw new Error(`${character} is already taught in N5`);
        if (seen.has(character)) throw new Error(`${character} is scheduled twice: ${seen.get(character)} and ${unitId}-${slug}`);
        seen.set(character, `${unitId}-${slug}`);
      }
      return { lesson_id: `${unitId}-${slug}`, lesson_number: lessonIndex + 1, is_review: lessonIndex === 5, title: lessonTitle, title_jp: lessonTitleJp, grammar, target_vocab: lessonIndex === 5 ? 0 : 11, kanji };
    }),
  };
});

const blueprint = {
  blueprint_version: 1, stage: "0", part: "N4 (part 2 of 6)", status: "complete: Units 1–9 generated and imported; mock exam and review bank built", level: "N4",
  defaults: {
    unit_shape: "5 content lessons + 1 review lesson + 1 assessment (15 questions, pass at 12/15), as in N5 from Unit 4",
    script: "Every kanji is written with furigana (<ruby>). Kanji already taught are used in kanji; words whose kanji are not yet taught stay in kana. Sentences are written without word spaces.",
    romaji: "Vocabulary keeps romaji in Units 1–3; grammar examples and dialogues no longer carry romaji.",
    verbs: "Vocabulary lists verbs in the dictionary form from N4 on, since plain forms are now taught.",
    required_xp_level: "Left null, as in N5: the owner is redesigning XP.",
  },
  units: blueprintUnits,
  kanji_index: {
    new_in_n4: seen.size, course_total_at_end: n5.size + seen.size,
    target_note: "Approximately 300 kanji by the end of N4 in common study lists; this course reaches about 250 and lists its own choice. JLPT publishes no official kanji list.",
  },
  deviations_and_assumptions: [
    "N4 Unit 1 follows N5 Unit 9 in the unlock chain (sequence 10).",
    "Some kanji often placed in N4 lists (会, 社, 駅, 魚, 買, 飲 …) were already taught in N5 and are not repeated.",
    "Potential, passive and causative forms each get their own unit; causative-passive is left to N3.",
  ],
};

fs.writeFileSync(path.join(ROOT, "docs/curriculum/blueprint-n4.json"), `${JSON.stringify(blueprint, null, 2)}\n`);
console.log(`Wrote the N4 blueprint: ${blueprintUnits.length} units, ${seen.size} new kanji (course total ${n5.size + seen.size}).`);
