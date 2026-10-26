import type { CourseLevel } from "../grading/jfGrading";
import type { SpeakingTaskKind } from "../grading/speakingCriteria";

// Speaking test tasks for N3 and above (GRADING.md section 2). Prompts and Can-do statements are our own wording,
// aligned with JF Standard levels; they are not official JF Can-do text. Japanese uses the course shorthand
// 漢字{かな} for furigana, turned into ruby markup (for display) and plain text (for speech services) below.

type TaskSource = {
  id: string; level: CourseLevel; kind: SpeakingTaskKind; title: string; canDo: string;
  /** What to do, in English. */
  instructions: string;
  /** The question or situation in Japanese (production), or what the other speaker says (interaction). */
  prompt?: string;
  speaker?: string;
  /** The passage to read (read-aloud). */
  passage?: string;
  minSeconds: number;
};

export const MAX_ANSWER_SECONDS = 30;

const TASKS: TaskSource[] = [
  // ---- N3 (B1)
  {
    id: "n3-read-park", level: "N3", kind: "read_aloud", title: "Read aloud: the park in my town", minSeconds: 5,
    canDo: "Can read aloud a short, familiar text clearly enough to be understood.",
    instructions: "Read the passage aloud at a natural pace.",
    passage: "私{わたし}の町{まち}には大{おお}きな公園{こうえん}があります。春{はる}になると、桜{さくら}を見{み}にたくさんの人{ひと}が集{あつ}まります。週末{しゅうまつ}は家族{かぞく}と散歩{さんぽ}したり、お弁当{べんとう}を食{た}べたりして、のんびり過{す}ごします。",
  },
  {
    id: "n3-my-town", level: "N3", kind: "production", title: "Introduce your town", minSeconds: 15,
    canDo: "Can describe their town or neighbourhood in simple connected sentences and give a reason for a recommendation.",
    instructions: "Describe your town: what kind of place it is, one place you recommend, and why.",
    prompt: "あなたの町{まち}を紹介{しょうかい}してください。どんな所{ところ}か、おすすめの場所{ばしょ}はどこか、理由{りゆう}も話{はな}してください。",
  },
  {
    id: "n3-trip", level: "N3", kind: "production", title: "A trip you enjoyed", minSeconds: 15,
    canDo: "Can tell a simple story about a past experience, in order, and say how they felt about it.",
    instructions: "Talk about the most enjoyable trip you have taken: when and where you went, what you did, and why it was fun.",
    prompt: "今{いま}までで一番{いちばん}楽{たの}しかった旅行{りょこう}について話{はな}してください。いつ、どこへ行{い}って、何{なに}をしたか、どうして楽{たの}しかったかを話{はな}してください。",
  },
  {
    id: "n3-decline", level: "N3", kind: "interaction", title: "Turn down an invitation", minSeconds: 8,
    canDo: "Can politely turn down an invitation from a friend, give a reason and suggest another time.",
    instructions: "Your friend invites you to a film. You can't go on Saturday: say no politely, give a reason, and suggest another day.",
    speaker: "Friend", prompt: "来週{らいしゅう}の土曜日{どようび}、一緒{いっしょ}に映画{えいが}を見{み}に行{い}かない？",
  },
  // ---- N2 (B2)
  {
    id: "n2-read-remote", level: "N2", kind: "read_aloud", title: "Read aloud: working from home", minSeconds: 6,
    canDo: "Can read aloud a short text on a general topic with clear, natural pronunciation.",
    instructions: "Read the passage aloud at a natural pace.",
    passage: "最近{さいきん}、在宅勤務{ざいたくきんむ}をする人{ひと}が増{ふ}えています。通勤{つうきん}の時間{じかん}がなくなって便利{べんり}になった一方{いっぽう}で、仕事{しごと}と生活{せいかつ}の区別{くべつ}がつきにくくなったという声{こえ}も少{すく}なくありません。",
  },
  {
    id: "n2-online-classes", level: "N2", kind: "production", title: "Online or classroom lessons?", minSeconds: 20,
    canDo: "Can give a clear opinion on a familiar issue, supported by reasons and an example.",
    instructions: "Which do you prefer, online lessons or classroom lessons? Give your opinion with reasons and an example.",
    prompt: "オンライン授業{じゅぎょう}と教室{きょうしつ}での授業{じゅぎょう}、どちらがいいと思{おも}いますか。理由{りゆう}と例{れい}を挙{あ}げて、意見{いけん}を述{の}べてください。",
  },
  {
    id: "n2-deadline", level: "N2", kind: "interaction", title: "Ask for more time at work", minSeconds: 10,
    canDo: "Can explain a problem to a colleague politely, apologise and propose a solution.",
    instructions: "A colleague asks for meeting documents today. You can't finish them today: apologise, explain why, and say when you can send them.",
    speaker: "Colleague", prompt: "明日{あした}の会議{かいぎ}の資料{しりょう}、今日中{きょうじゅう}に送{おく}ってもらえますか。",
  },
  // ---- N1 (C1)
  {
    id: "n1-ageing-society", level: "N1", kind: "production", title: "An ageing society", minSeconds: 20,
    canDo: "Can present a structured view on a complex social issue, weighing more than one side.",
    instructions: "Give your view on how an ageing, shrinking population affects society, considering more than one side.",
    prompt: "少子高齢化{しょうしこうれいか}が社会{しゃかい}に与{あた}える影響{えいきょう}について、あなたの考{かんが}えを述{の}べてください。",
  },
  {
    id: "n1-budget", level: "N1", kind: "interaction", title: "Discuss a project budget", minSeconds: 12,
    canDo: "Can respond to a colleague's concern in a discussion, state their own position and propose an alternative.",
    instructions: "A colleague thinks the project's budget is too small. Respond with your own view and propose a way forward.",
    speaker: "Colleague", prompt: "この企画{きかく}、予算{よさん}が足{た}りないと思{おも}うんだけど、どう思{おも}う？",
  },
];

const FURIGANA = /([一-龯々〆ヶ]+)\{([ぁ-ゖー]+)\}/g;
/** Ruby markup for display. */
export const toRuby = (text: string) => text.replace(FURIGANA, "<ruby>$1<rt>$2</rt></ruby>");
/** Plain Japanese for speech services and the AI. */
export const toPlain = (text: string) => text.replace(FURIGANA, "$1");

export type SpeakingTask = Omit<TaskSource, "prompt" | "passage"> & {
  prompt?: { ruby: string; plain: string }; passage?: { ruby: string; plain: string }; maxSeconds: number;
};

const text = (value?: string) => value === undefined ? undefined : { ruby: toRuby(value), plain: toPlain(value) };

export const SPEAKING_TASKS: readonly SpeakingTask[] = TASKS.map(task => ({ ...task, prompt: text(task.prompt), passage: text(task.passage), maxSeconds: MAX_ANSWER_SECONDS }));

export const findSpeakingTask = (id: string) => SPEAKING_TASKS.find(task => task.id === id);
