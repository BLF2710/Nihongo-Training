// まつりむら, the Games island's village (N5): three errands that each need a few everyday phrases.
// Content only; the rules live in lib/errands. Wrong replies lead to a villager's reaction and a hint, then back to the question.
import type { Line, Reply, Speaker, Step, StepId } from "../../lib/errands/conversation.ts";
import { parseTownMap } from "../../lib/errands/townMap.ts";
import type { Village } from "../../lib/errands/village.ts";

const line = (speaker: Speaker, japanese: string, english: string): Line => ({ speaker, japanese, english });
const say = (speaker: Speaker, japanese: string, english: string, next: StepId | null, extra: Pick<Extract<Step, { kind: "say" }>, "hint" | "effects"> = {}): Step =>
  ({ kind: "say", line: line(speaker, japanese, english), next, ...extra });
const right = (japanese: string, english: string, next: StepId): Reply => ({ japanese, english, isCorrect: true, next });
const wrong = (japanese: string, english: string, next: StepId): Reply => ({ japanese, english, isCorrect: false, next });

const PON_BREAD = "pon-bread", HATO_LETTER = "hato-letter", ZEN_TEA = "zen-tea";
const festivalStarted = [{ kind: "finished", quest: ZEN_TEA }] as const;
const COUNTING_HINT = "ひとつ = one, ふたつ = two, みっつ = three (things).";

export const MATSURI_VILLAGE: Village = {
  id: "matsuri", name: "Festival Village", japaneseName: "まつりむら", level: "N5",
  map: parseTownMap([
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TT,,,,,T,T,,,,,,TfTT......==.....TTT",
    "T,~~~~,,,,,,,,,,,f........==......TT",
    "T,~~~~,,,,,,,,,,,f........==.......T",
    "T,,,,,,*,,,,,,,,,f........==.......T",
    "T,,*,,,,,,,,,,,,,f........==.......T",
    "T,,,*,,,,,*,,,*,,f==========.......T",
    "TT,,,,,,,,,,,,,T,f........==...*...T",
    "T~~~~~~~bb~~~~~~~f..*.....==......TT",
    "T~~~~~~~bb~~~~~~~f.....*..==......TT",
    "TT....*.==......TfT.......==.......T",
    "T.......==.......fT.......==.......T",
    "T.......==.......f........======...T",
    "T.......==.....*.f....*...==.......T",
    "T.......==.......f........==....*..T",
    "T==================================T",
    "T==================================T",
    "T..*....==....*..f..========.......T",
    "T.......==.......f........==.......T",
    "T.......==.......f........==.......T",
    "T.......==.......f........==.......T",
    "T.*..*..==..*..T.f........==..*...TT",
    "TT......==...*..TfTT....*.==.*...TTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  ]),
  start: { x: 9, y: 20.5 },
  buildings: [
    { id: "bakery", x: 2, y: 11, width: 5, height: 3, sign: "パン", label: "Tama's bakery", roof: "wood" },
    { id: "stall", x: 11, y: 11, width: 4, height: 2, sign: "まつり", label: "Pon's festival stall", roof: "vermilion" },
    { id: "house-west", x: 2, y: 18, width: 4, height: 3, sign: "いえ", label: "A house", roof: "indigo" },
    { id: "house-east", x: 11, y: 18, width: 4, height: 3, sign: "いえ", label: "A house", roof: "moss" },
    { id: "teahouse", x: 11, y: 2, width: 5, height: 3, sign: "茶", label: "Sensei's tea house", roof: "moss" },
    { id: "school", x: 20, y: 2, width: 6, height: 3, sign: "学校", label: "The school", roof: "indigo" },
    { id: "shrine", x: 29, y: 9, width: 4, height: 3, sign: "神社", label: "The shrine", roof: "vermilion" },
    { id: "post-office", x: 20, y: 18, width: 5, height: 3, sign: "〒", label: "The post office", roof: "vermilion" },
  ],
  gates: [
    { id: "east-gate", label: "The east gate", x: 17, y: 15, width: 1, height: 2, opensWhen: [{ kind: "finished", quest: PON_BREAD }] },
    { id: "garden-gate", label: "The garden gate", x: 8, y: 8, width: 2, height: 1, opensWhen: [{ kind: "finished", quest: HATO_LETTER }] },
  ],
  lanterns: {
    tiles: [2, 6, 11, 15, 20, 24, 29, 32].flatMap(x => [{ x, y: 14 }, { x, y: 17 }]),
    litWhen: festivalStarted,
  },
  items: {
    bread: { id: "bread", japanese: "パン ×2", english: "Two pieces of bread", icon: "🍞" },
    ticket: { id: "ticket", japanese: "きっぷ", english: "A festival ticket", icon: "🎫" },
    letter: { id: "letter", japanese: "<ruby>手紙<rt>てがみ</rt></ruby>", english: "Hato's letter", icon: "✉️" },
    key: { id: "key", japanese: "かぎ", english: "The garden key", icon: "🗝️" },
    tea: { id: "tea", japanese: "おちゃ", english: "A cup of tea", icon: "🍵" },
  },
  quests: [
    { id: PON_BREAD, title: "Pon's festival snack", giver: "pon", startsWhen: [], objectives: [
      { text: "Talk to Pon at the festival stall (まつり).", doneWhen: [{ kind: "flag", flag: "pon-asked" }] },
      { text: "Buy two pieces of bread at Tama's bakery (パン).", doneWhen: [{ kind: "flag", flag: "bread-bought" }] },
      { text: "Bring the bread to Pon.", doneWhen: [{ kind: "finished", quest: PON_BREAD }] },
    ] },
    { id: HATO_LETTER, title: "A letter for Hakase", giver: "hato", startsWhen: [{ kind: "finished", quest: PON_BREAD }], objectives: [
      { text: "Go through the east gate and find Hato by the post office (〒).", doneWhen: [{ kind: "flag", flag: "hato-asked" }] },
      { text: "Ask Kon at the shrine (神社) where the school is.", doneWhen: [{ kind: "flag", flag: "knows-school" }] },
      { text: "Give the letter to Hakase at the school (学校).", doneWhen: [{ kind: "finished", quest: HATO_LETTER }] },
    ] },
    { id: ZEN_TEA, title: "Tea for the garden", giver: "zen", startsWhen: [{ kind: "finished", quest: HATO_LETTER }], objectives: [
      { text: "Cross the bridge north of the plaza and talk to Zen in the garden.", doneWhen: [{ kind: "flag", flag: "zen-asked" }] },
      { text: "Order a tea at Sensei's tea house (茶).", doneWhen: [{ kind: "flag", flag: "tea-bought" }] },
      { text: "Bring the tea to Zen.", doneWhen: [{ kind: "finished", quest: ZEN_TEA }] },
    ] },
  ],
  villagers: [
    {
      id: "pon", tile: { x: 13, y: 13 },
      talks: [
        { when: festivalStarted, start: "festival" },
        { when: [{ kind: "finished", quest: PON_BREAD }], start: "after" },
        { when: [{ kind: "item", item: "bread" }], start: "thanks", isErrand: true },
        { when: [{ kind: "flag", flag: "pon-asked" }], start: "waiting" },
        { when: [], start: "hello", isErrand: true },
      ],
      steps: {
        hello: say("pon", "こんにちは！ぼくは ポンです。", "Hello! I'm Pon.", "hungry"),
        hungry: say("pon", "おなかが すきました…。", "I'm hungry…", "ask"),
        ask: say("pon", "パンを ふたつ かって きて ください！", "Please go and buy two pieces of bread!", null,
          { hint: "ふたつ means two (things). Tama's bakery is the building with the パン sign.", effects: [{ kind: "set", flag: "pon-asked" }] }),
        waiting: say("pon", "パンを ふたつ ですよ。タマさんの パンやです。", "Two pieces of bread, remember. At Tama's bakery.", null, { hint: "The bakery has the パン sign, west of the plaza." }),
        thanks: say("pon", "あっ、パン！", "Oh, bread!", "hand-over"),
        "hand-over": { kind: "choose", quest: PON_BREAD, task: "Hand Pon the bread.", replies: [
          right("どうぞ。", "Here you go.", "thanks-ticket"),
          wrong("いただきます。", "(What you say before eating.)", "wrong-itadakimasu"),
          wrong("おやすみなさい。", "Good night.", "wrong-oyasumi"),
        ] },
        "wrong-itadakimasu": say("pon", "えっ？ たべるのは ぼくです！", "Huh? I'm the one eating!", "hand-over",
          { hint: "いただきます is said before you eat. To hand something over, say どうぞ." }),
        "wrong-oyasumi": say("pon", "まだ ひるですよ！", "It's still daytime!", "hand-over",
          { hint: "おやすみなさい means good night. To hand something over, say どうぞ." }),
        "thanks-ticket": say("pon", "ありがとう！これ、おまつりの きっぷです。", "Thanks! Here's a festival ticket.", "gate-open",
          { effects: [{ kind: "take", item: "bread" }, { kind: "give", item: "ticket" }] }),
        "gate-open": say("pon", "ひがしの もんが あきました！ハトさんに あって ください。", "The east gate is open! Go and see Hato.", null,
          { effects: [{ kind: "finish", quest: PON_BREAD }] }),
        after: say("pon", "ハトさんは ゆうびんきょくの そばに います。", "Hato is by the post office.", null),
        festival: say("pon", "おまつりです！たのしいですね！", "It's the festival! Isn't it fun!", null),
      },
    },
    {
      id: "tama", tile: { x: 4, y: 14 },
      talks: [
        { when: [{ kind: "item", item: "bread" }], start: "enjoy" },
        { when: [{ kind: "flag", flag: "pon-asked" }, { kind: "no-flag", flag: "bread-bought" }], start: "welcome", isErrand: true },
        { when: [], start: "hello" },
      ],
      steps: {
        hello: say("tama", "いらっしゃいませ！タマの パンやです。にゃ。", "Welcome! This is Tama's bakery. Meow.", null),
        welcome: say("tama", "いらっしゃいませ！", "Welcome!", "order"),
        order: { kind: "choose", quest: PON_BREAD, task: "Ask for bread.", replies: [
          right("パンを ください。", "Bread, please.", "how-many"),
          wrong("パンが ください。", "Bread (as the subject) please.", "wrong-ga"),
          wrong("パンに ください。", "On the bread, please.", "wrong-ni"),
        ] },
        "wrong-ga": say("tama", "パンが…？ パンが どう しましたか？", "The bread…? What about the bread?", "order",
          { hint: "を marks the thing you want: 〜を ください. が marks who or what does something." }),
        "wrong-ni": say("tama", "パンに…？ はい、パンに「ください」と かきました。", "On the bread…? OK, I wrote “please” on the bread.", "order",
          { hint: "に means to, at or on. For the thing you want, use を: パンを ください." }),
        "how-many": say("tama", "はい。いくつですか。", "Sure. How many?", "count"),
        count: { kind: "choose", quest: PON_BREAD, task: "Pon asked for two.", replies: [
          wrong("ひとつ です。", "One.", "wrong-one"),
          right("ふたつ です。", "Two.", "sold"),
          wrong("みっつ です。", "Three.", "wrong-three"),
        ] },
        "wrong-one": say("tama", "ひとつ ですね。…あれ？ ポンさんは ふたつと いいましたよ。", "One, then. …Hm? Pon said two.", "count", { hint: COUNTING_HINT }),
        "wrong-three": say("tama", "みっつ？ ポンさんは そんなに たべませんよ！", "Three? Pon doesn't eat that much!", "count", { hint: COUNTING_HINT }),
        sold: say("tama", "ふたつ ですね。はい、どうぞ。", "Two, then. Here you go.", "thank-you",
          { effects: [{ kind: "give", item: "bread" }, { kind: "set", flag: "bread-bought" }] }),
        "thank-you": say("traveller", "ありがとう ございます。", "Thank you very much.", null),
        enjoy: say("tama", "ポンさんが まって いますよ。", "Pon is waiting for you.", null),
      },
    },
    {
      id: "hato", tile: { x: 25, y: 19 },
      talks: [
        { when: festivalStarted, start: "festival" },
        { when: [{ kind: "finished", quest: HATO_LETTER }], start: "after" },
        { when: [{ kind: "flag", flag: "hato-asked" }], start: "reminder" },
        { when: [{ kind: "finished", quest: PON_BREAD }], start: "hello", isErrand: true },
        { when: [], start: "busy" },
      ],
      steps: {
        hello: say("hato", "こんにちは。ハトです。ゆうびんやさんです。", "Hello. I'm Hato, the mail carrier.", "letter"),
        letter: say("hato", "この <ruby>手紙<rt>てがみ</rt></ruby>を はかせに とどけて ください。", "Please deliver this letter to Hakase.", "school",
          { effects: [{ kind: "give", item: "letter" }, { kind: "set", flag: "hato-asked" }] }),
        school: say("hato", "はかせは がっこうに います。", "Hakase is at the school.", null,
          { hint: "Don't know where the school (がっこう) is? Ask Kon at the shrine (神社)." }),
        reminder: say("hato", "<ruby>手紙<rt>てがみ</rt></ruby>を はかせに おねがいします。", "The letter for Hakase, please.", null,
          { hint: "Ask Kon at the shrine where the school is: 〜は どこですか." }),
        after: say("hato", "ありがとう ございました！", "Thank you so much!", null),
        busy: say("hato", "まつりの じゅんびで いそがしいです。", "I'm busy getting ready for the festival.", null),
        festival: say("hato", "まつりの <ruby>手紙<rt>てがみ</rt></ruby>を たくさん とどけます！", "I'm delivering lots of festival letters!", null),
      },
    },
    {
      id: "kon", tile: { x: 30, y: 12 },
      talks: [
        { when: festivalStarted, start: "festival" },
        { when: [{ kind: "flag", flag: "hato-asked" }, { kind: "no-flag", flag: "knows-school" }], start: "hello", isErrand: true },
        { when: [], start: "visit" },
      ],
      steps: {
        hello: say("kon", "こんにちは。キツネの コンです。", "Hello. I'm Kon the fox.", "where"),
        where: { kind: "choose", quest: HATO_LETTER, task: "Ask where the school is.", replies: [
          wrong("がっこうを どこですか。", "The school (as an object) where is it?", "wrong-o"),
          wrong("がっこうで どこですか。", "At the school, where is it?", "wrong-de"),
          right("がっこうは どこですか。", "Where is the school?", "north"),
        ] },
        "wrong-o": say("kon", "がっこうを…？ がっこうを どう しますか？", "The school…? What will you do to the school?", "where",
          { hint: "To ask where something is, mark it with は: 〜は どこですか." }),
        "wrong-de": say("kon", "がっこうで？ ここは じんじゃですよ。", "At school? This is a shrine.", "where",
          { hint: "で marks where something happens. To ask where something is, use は: がっこうは どこですか." }),
        north: say("kon", "がっこうは きたに あります。", "The school is to the north.", "sign"),
        sign: say("kon", "「<ruby>学校<rt>がっこう</rt></ruby>」と かいて あります。", "Its sign says 学校.", null,
          { hint: "学校 is how がっこう (school) is written in kanji.", effects: [{ kind: "set", flag: "knows-school" }] }),
        visit: say("kon", "おまいりですか？ どうぞ。", "Here to visit the shrine? Go ahead.", null),
        festival: say("kon", "ちょうちんが きれいですね。", "The lanterns are beautiful, aren't they?", null),
      },
    },
    {
      id: "hakase", tile: { x: 22, y: 5 },
      talks: [
        { when: festivalStarted, start: "festival" },
        { when: [{ kind: "item", item: "letter" }], start: "hello", isErrand: true },
        { when: [{ kind: "finished", quest: HATO_LETTER }], start: "after" },
        { when: [], start: "welcome" },
      ],
      steps: {
        hello: say("hakase", "おや、なんですか。", "Oh, what's this?", "whose"),
        whose: { kind: "choose", quest: HATO_LETTER, task: "Tell Hakase it's Hato's letter.", replies: [
          wrong("ハトさんは <ruby>手紙<rt>てがみ</rt></ruby>です。", "Hato is a letter.", "wrong-wa"),
          right("ハトさんの <ruby>手紙<rt>てがみ</rt></ruby>です。", "It's Hato's letter.", "thanks"),
          wrong("ハトさんを <ruby>手紙<rt>てがみ</rt></ruby>です。", "Hato (as an object) is a letter.", "wrong-o"),
        ] },
        "wrong-wa": say("hakase", "ハトさんは てがみ…？ ほほう、ハトさんは とりですよ。", "Hato is a letter…? Ho ho, Hato is a bird.", "whose",
          { hint: "の joins two nouns: ハトさんの てがみ = Hato's letter. は would say Hato IS a letter." }),
        "wrong-o": say("hakase", "ハトさんを…？ ちょっと へんですね。", "Hato (as an object)…? That sounds a little odd.", "whose",
          { hint: "を marks the object of a verb. For “Hato's letter”, use の." }),
        thanks: say("hakase", "ありがとう。これは おれいです。", "Thank you. This is to say thanks.", "key",
          { effects: [{ kind: "take", item: "letter" }, { kind: "give", item: "key" }] }),
        key: say("hakase", "にわの かぎです。ゼンさんが まって いますよ。", "It's the garden key. Zen is waiting for you.", null,
          { hint: "The garden is across the bridge, north of the plaza.", effects: [{ kind: "finish", quest: HATO_LETTER }] }),
        after: say("hakase", "にわは はしの むこうです。", "The garden is across the bridge.", null),
        welcome: say("hakase", "<ruby>学校<rt>がっこう</rt></ruby>へ ようこそ。べんきょうは たのしいですよ。", "Welcome to the school. Studying is fun.", null),
        festival: say("hakase", "まつりの ひは べんきょうも やすみです。", "On festival day even studying takes a break.", null),
      },
    },
    {
      id: "zen", tile: { x: 6, y: 4 },
      talks: [
        { when: festivalStarted, start: "festival" },
        { when: [{ kind: "item", item: "tea" }], start: "tea", isErrand: true },
        { when: [{ kind: "flag", flag: "zen-asked" }], start: "reminder" },
        { when: [{ kind: "finished", quest: HATO_LETTER }], start: "hello", isErrand: true },
        { when: [], start: "quiet" },
      ],
      steps: {
        hello: say("zen", "にわへ ようこそ。ゼンです。", "Welcome to the garden. I'm Zen.", "ask"),
        ask: say("zen", "おちゃを ひとつ かって きて ください。", "Please go and buy me one tea.", null,
          { hint: "Sensei's tea house is the building with the 茶 (tea) sign.", effects: [{ kind: "set", flag: "zen-asked" }] }),
        reminder: say("zen", "せんせいの ちゃやで おちゃを おねがいします。", "A tea from Sensei's tea house, please.", null, { hint: "The tea house has the 茶 sign." }),
        tea: say("zen", "ああ、おちゃ。ありがとう ございます。", "Ah, tea. Thank you very much.", "reply"),
        reply: { kind: "choose", quest: ZEN_TEA, task: "Reply to Zen's thanks.", replies: [
          wrong("いってきます。", "I'm off. (Said when leaving home.)", "wrong-ittekimasu"),
          wrong("はじめまして。", "Nice to meet you. (Said when you first meet.)", "wrong-hajimemashite"),
          right("どういたしまして。", "You're welcome.", "ready"),
        ] },
        "wrong-ittekimasu": say("zen", "どこへ いきますか？", "Where are you going?", "reply", { hint: "いってきます is said when leaving home. To answer thanks, say どういたしまして." }),
        "wrong-hajimemashite": say("zen", "もう あいましたよ。", "We've already met.", "reply", { hint: "はじめまして is for a first meeting. To answer thanks, say どういたしまして." }),
        ready: say("zen", "これで まつりの じゅんびが できました。", "With this, the festival is ready.", "lanterns", { effects: [{ kind: "take", item: "tea" }] }),
        lanterns: say("zen", "ちょうちんを つけましょう！", "Let's light the lanterns!", null, { effects: [{ kind: "finish", quest: ZEN_TEA }] }),
        quiet: say("zen", "しずかな にわです。", "It's a quiet garden.", null),
        festival: say("zen", "まつりが はじまりました。", "The festival has begun.", null),
      },
    },
    {
      id: "sensei", tile: { x: 13, y: 5 },
      talks: [
        { when: [{ kind: "item", item: "tea" }], start: "for-zen" },
        { when: [{ kind: "flag", flag: "zen-asked" }, { kind: "no-flag", flag: "tea-bought" }], start: "welcome", isErrand: true },
        { when: [], start: "hello" },
      ],
      steps: {
        welcome: say("sensei", "いらっしゃい。なにに しますか。", "Welcome. What would you like?", "order"),
        order: { kind: "build", quest: ZEN_TEA, task: "Order one tea, please.", answer: ["おちゃ", "を", "ひとつ", "おねがいします"], spare: ["が", "ふたつ"], next: "served", wrongNext: "again" },
        again: say("sensei", "すみません、もう いちど おねがいします。", "Sorry, once more, please.", "order",
          { hint: "What you want + を + how many + おねがいします: おちゃを ひとつ おねがいします." }),
        served: say("sensei", "はい、おちゃ ひとつ。どうぞ。", "One tea. Here you are.", null,
          { effects: [{ kind: "give", item: "tea" }, { kind: "set", flag: "tea-bought" }] }),
        "for-zen": say("sensei", "ゼンさんに どうぞ。", "Take it to Zen.", null),
        hello: say("sensei", "おちゃは いかがですか。", "Would you like some tea?", null),
      },
    },
  ],
};
