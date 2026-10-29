import catalog from "../../../shared/kanji.json";
import { shuffled } from "../utils/random";
export { catalog, shuffled };
export type PracticeKind = "meaning" | "reading" | "vocabulary";

type Kanji = typeof catalog.kanji[number];
type VocabularyForm = typeof catalog.vocabularyForms[number];
type QuestionParts = { correct: string; distractors: string[]; display: string; prompt: string };

// One builder per question kind; `form` is a random course word written with the Kanji, when one exists.
const QUESTION_BUILDERS: Record<PracticeKind, (kanji: Kanji, form: VocabularyForm | undefined) => QuestionParts> = {
  meaning: kanji => ({
    correct: kanji.meanings[0],
    distractors: catalog.kanji.filter(item => !item.meanings.some(meaning => kanji.meanings.includes(meaning))).map(item => item.meanings[0]),
    display: kanji.character,
    prompt: "Which meaning belongs to this Kanji?",
  }),
  reading: (_kanji, form) => {
    if (!form) throw new Error("No course vocabulary for reading practice");
    return {
      correct: form.reading,
      distractors: catalog.vocabularyForms.map(item => item.reading).filter(reading => reading !== form.reading),
      display: form.written,
      prompt: "How is this course word read?",
    };
  },
  vocabulary: (kanji, form) => {
    if (!form) throw new Error("No course vocabulary for recognition practice");
    return {
      correct: form.written,
      distractors: catalog.vocabularyForms.filter(item => !item.written.includes(kanji.character)).map(item => item.written),
      display: kanji.character,
      prompt: "Which course word contains this Kanji?",
    };
  },
};

const KANJI_QUESTION_LABELS: Record<PracticeKind, string> = {
  meaning: "Kanji · Which meaning belongs to this Kanji?",
  reading: "Kanji · How is this course word read?",
  vocabulary: "Kanji · Which course word contains this Kanji?",
};

/**
 * What a saved practice question showed, rebuilt from its Kanji, kind and right answer (the question row keeps only
 * the choices): the instruction and the character or word on screen.
 */
export function describeKanjiQuestion(kanjiId: string, kind: PracticeKind, correctAnswer: string) {
  const kanji = catalog.kanji.find(item => item.id === kanjiId);
  if (!kanji) throw new Error("Unknown Kanji");
  const word = kind === "reading" ? catalog.vocabularyForms.find(form => form.kanjiIds.includes(kanjiId) && form.reading === correctAnswer) : undefined;
  return { label: KANJI_QUESTION_LABELS[kind], display: word?.written ?? kanji.character };
}

/** Reading and vocabulary questions need a course word written with the Kanji; newly introduced Kanji may not have one yet. */
export const hasCourseWords = (kanjiId: string) => catalog.vocabularyForms.some(form => form.kanjiIds.includes(kanjiId));

export function makeKanjiQuestion(kanjiId: string, kind: PracticeKind) {
  const kanji = catalog.kanji.find(item => item.id === kanjiId);
  if (!kanji) throw new Error("Unknown Kanji");
  const forms = catalog.vocabularyForms.filter(form => form.kanjiIds.includes(kanji.id));
  const { correct, distractors, display, prompt } = QUESTION_BUILDERS[kind](kanji, shuffled(forms)[0]);
  const wrong = shuffled([...new Set(distractors)]).slice(0, 3);
  if (wrong.length !== 3) throw new Error("Not enough unambiguous choices");
  const options = shuffled([correct, ...wrong]);
  return { kanjiId, character: kanji.character, kind, display, prompt, options, correctIndex: options.indexOf(correct) };
}
