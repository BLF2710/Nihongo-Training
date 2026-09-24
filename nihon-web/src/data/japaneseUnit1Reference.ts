import { N5_LESSONS } from "./japaneseN5Lessons";
import type { N5Lesson } from "./japaneseN5Lessons";

export type VocabularyItem = {
  id: string;
  unitId: string;
  lessonId: string;
  japanese: string;
  romaji: string;
  meaning: string;
  audioText?: string;
  note?: string;
};

export type GrammarPoint = {
  id: string;
  unitId: string;
  lessonId: string;
  title: string;
  pattern: string;
  explanation: string;
  examples: { japanese: string; romaji: string; meaning: string }[];
  notes?: string[];
};

export type StudyLesson = {
  id: string;
  number: number;
  title: string;
  href: string;
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
};

export type StudyUnit = {
  id: string;
  number: number;
  title: string;
  course: string;
  lessons: StudyLesson[];
};

const unitId = "japanese-n5-unit-1";
type Word = Pick<VocabularyItem, "japanese" | "romaji" | "meaning" | "note" | "audioText">;
type GrammarContent = Omit<GrammarPoint, "unitId" | "lessonId">;

function studyLesson(id: string, number: number, title: string, slug: string, words: Word[], grammar: GrammarContent[] = []): StudyLesson {
  return {
    id, number, title, href: `/lessons/japanese/${slug}`,
    vocabulary: words.map(word => ({ ...word, id: `${id}:${word.japanese}`, unitId, lessonId: id })),
    grammar: grammar.map(point => ({ ...point, unitId, lessonId: id })),
  };
}

// Lesson 1 keeps its expressions inside its page. This reference matches those
// eight expressions; the lesson page and its progression remain untouched.
const greetings: Word[] = [
  { japanese: "おはよう", romaji: "Ohayou", meaning: "Good morning", note: "Casual. Use with friends or people you know well." },
  { japanese: "おはようございます", romaji: "Ohayou gozaimasu", meaning: "Good morning", note: "Polite. Suitable for teachers and people you do not know well." },
  { japanese: "こんにちは", romaji: "Konnichiwa", meaning: "Hello / Good afternoon", note: "A standard daytime greeting. The final は is pronounced wa." },
  { japanese: "こんばんは", romaji: "Konbanwa", meaning: "Good evening", note: "A standard evening greeting. The final は is pronounced wa." },
  { japanese: "ありがとう", romaji: "Arigatou", meaning: "Thank you", note: "Casual." },
  { japanese: "ありがとうございます", romaji: "Arigatou gozaimasu", meaning: "Thank you", note: "Polite." },
  { japanese: "すみません", romaji: "Sumimasen", meaning: "Excuse me / Sorry", note: "Polite. Use to get someone's attention or apologize." },
  { japanese: "またね", romaji: "Mata ne", meaning: "See you", note: "Casual. Use when parting from a friend." },
];

// Explicit scope prevents future lessons (including Lesson 6) from appearing here.
const lessonReferences: { slug: string; number: number; extraWords?: Word[]; grammar: GrammarContent[] }[] = [
  {
    slug: "n5-unit-1-introductions", number: 2,
    grammar: [
      {
        id: "unit-1-topic-desu", title: "Introduce yourself with は and です",
        pattern: "A は B です。",
        explanation: "Start with who or what you are talking about, add は, then say their name or what they are. です politely finishes this kind of statement.",
        examples: [{ japanese: "わたしは たなかです。", romaji: "Watashi wa Tanaka desu.", meaning: "I am Tanaka." }],
        notes: ["The topic particle は is written ha but pronounced wa.", "In these introductions, put your name before です."],
      },
      {
        id: "unit-1-ask-name", title: "Ask someone's name",
        pattern: "なまえは なんですか。",
        explanation: "なまえ means name and なん means what. This is the name question used in Lesson 2's introduction dialogue.",
        examples: [{ japanese: "なまえは なんですか。", romaji: "Namae wa nan desu ka.", meaning: "What is your name?" }],
        notes: ["The final か marks a question. Lesson 4 practices this with other questions."],
      },
    ],
  },
  {
    slug: "n5-unit-1-origin", number: 3,
    extraWords: [{ japanese: "〜じん", romaji: "-jin", meaning: "Person of a nationality", audioText: "じん", note: "Add to a country name, as in ベトナムじん (Vietnamese person)." }],
    grammar: [
      {
        id: "unit-1-origin-kara", title: "Say where you come from",
        pattern: "Place + から きました。",
        explanation: "から means from. Put it after a country or place, then add きました to say where you came from.",
        examples: [
          { japanese: "ベトナムから きました。", romaji: "Betonamu kara kimashita.", meaning: "I came from Vietnam." },
          { japanese: "どこから きましたか。", romaji: "Doko kara kimashita ka.", meaning: "Where are you from?" },
        ],
        notes: ["どこ means where. In an introduction, this question asks about your origin."],
      },
      {
        id: "unit-1-nationality", title: "Say your nationality",
        pattern: "わたしは Country + じんです。",
        explanation: "Add じん to a country name to describe someone's nationality. Use the same は … です pattern as your self-introduction.",
        examples: [
          { japanese: "わたしは ベトナムじんです。", romaji: "Watashi wa Betonamu-jin desu.", meaning: "I am Vietnamese." },
          { japanese: "わたしは にほんじんです。", romaji: "Watashi wa Nihon-jin desu.", meaning: "I am Japanese." },
        ],
        notes: ["Coming from a place and having its nationality are different ideas; choose the pattern that matches what you mean."],
      },
    ],
  },
  {
    slug: "n5-unit-1-questions", number: 4,
    extraWords: [{ japanese: "ほん", romaji: "hon", meaning: "Book", note: "Used in this lesson's question-and-answer examples." }],
    grammar: [
      {
        id: "unit-1-desu-ka", title: "Turn a statement into a polite question",
        pattern: "A は B ですか。",
        explanation: "Add か after です to ask a polite question. Use はい for yes and いいえ for no.",
        examples: [
          { japanese: "これは ほんです。", romaji: "Kore wa hon desu.", meaning: "This is a book." },
          { japanese: "これは ほんですか。", romaji: "Kore wa hon desu ka.", meaning: "Is this a book?" },
          { japanese: "はい、ほんです。", romaji: "Hai, hon desu.", meaning: "Yes, it is a book." },
        ],
      },
      {
        id: "unit-1-kore-sore", title: "Point to this or that",
        pattern: "これ / それ は Noun です。",
        explanation: "これ means this, near the speaker. それ means that, usually near the listener. These words can stand on their own when the object is understood.",
        examples: [
          { japanese: "これは ほんです。", romaji: "Kore wa hon desu.", meaning: "This is a book." },
          { japanese: "それは ほんです。", romaji: "Sore wa hon desu.", meaning: "That is a book." },
        ],
      },
      {
        id: "unit-1-question-words", title: "Ask what or who",
        pattern: "これは なんですか。 / だれですか。",
        explanation: "Use なん to ask what something is and だれ to ask who someone is. You already met どこ (where) in Lesson 3.",
        examples: [
          { japanese: "これは なんですか。", romaji: "Kore wa nan desu ka.", meaning: "What is this?" },
          { japanese: "だれですか。", romaji: "Dare desu ka.", meaning: "Who is it?" },
        ],
        notes: ["The word for what also has the reading なに (nani). Use なん before ですか in this lesson's pattern."],
      },
    ],
  },
  {
    slug: "n5-unit-1-numbers-age", number: 5,
    grammar: [
      {
        id: "unit-1-age", title: "Ask and say your age",
        pattern: "なんさいですか。 / わたしは Number + さいです。",
        explanation: "なんさい asks how old someone is. さい means years old. Answer with your age and finish politely with です.",
        examples: [
          { japanese: "なんさいですか。", romaji: "Nansai desu ka.", meaning: "How old are you?" },
          { japanese: "わたしは 20さいです。", romaji: "Watashi wa hatachi desu.", meaning: "I am twenty years old." },
          { japanese: "わたしは 8さいです。", romaji: "Watashi wa hassai desu.", meaning: "I am eight years old." },
          { japanese: "10さいです。", romaji: "Jussai desu.", meaning: "I am ten years old." },
        ],
        notes: ["Some age readings change: 8さい is hassai, 10さい is jussai (also jissai), and 20さい has the special reading hatachi.", "Use age questions with care; someone you have just met may prefer not to share their age."],
      },
    ],
  },
];

const vocabularyNotes: Record<string, string> = {
  "よろしくおねがいします": "A polite phrase used after an introduction, expressing that you look forward to getting along.",
  "よん": "The lesson uses yon. Four can also be read shi in other contexts.",
  "なな": "The lesson uses nana. Seven can also be read shichi in other contexts.",
  "きゅう": "The lesson uses kyuu. Nine can also be read ku in other contexts.",
};

function findLesson(slug: string): N5Lesson {
  const lesson = N5_LESSONS.find(item => item.slug === slug);
  if (!lesson) throw new Error(`Missing source lesson for study reference: ${slug}`);
  return lesson;
}

export const JAPANESE_UNIT_1_REFERENCE: StudyUnit = {
  id: unitId, number: 1, title: "Greetings & Introductions", course: "Japanese • N5 Beginner",
  lessons: [
    studyLesson("japanese-n5-unit-1-hello", 1, "How to Say Hello", "n5-unit-1-hello", greetings),
    ...lessonReferences.map(reference => {
      const lesson = findLesson(reference.slug);
      const words = lesson.vocabulary.map(([japanese, romaji, meaning]) => ({ japanese, romaji, meaning, note: vocabularyNotes[japanese] }));
      return studyLesson(lesson.id, reference.number, lesson.title, lesson.slug, [...words, ...(reference.extraWords ?? [])], reference.grammar);
    }),
  ],
};
