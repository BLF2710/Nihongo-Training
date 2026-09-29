import { randomInt } from "crypto";
import catalog from "../../../shared/kanji.json";
export { catalog };
export type PracticeKind = "meaning" | "reading" | "vocabulary";

export function shuffled<T>(values: readonly T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function makeKanjiQuestion(kanjiId: string, kind: PracticeKind) {
  const kanji = catalog.kanji.find(item => item.id === kanjiId);
  if (!kanji) throw new Error("Unknown Kanji");
  const forms = catalog.vocabularyForms.filter(form => form.kanjiIds.includes(kanji.id));
  const form = shuffled(forms)[0];
  let correct: string;
  let distractors: string[];
  let display: string;
  let prompt: string;
  if (kind === "meaning") {
    correct = kanji.meanings[0];
    distractors = catalog.kanji.filter(item => !item.meanings.some(meaning => kanji.meanings.includes(meaning))).map(item => item.meanings[0]);
    display = kanji.character;
    prompt = "Which meaning belongs to this Kanji?";
  } else if (kind === "reading") {
    if (!form) throw new Error("No course vocabulary for reading practice");
    correct = form.reading;
    distractors = catalog.vocabularyForms.map(item => item.reading).filter(reading => reading !== correct);
    display = form.written;
    prompt = "How is this course word read?";
  } else {
    if (!form) throw new Error("No course vocabulary for recognition practice");
    correct = form.written;
    distractors = catalog.vocabularyForms.filter(item => !item.written.includes(kanji.character)).map(item => item.written);
    display = kanji.character;
    prompt = "Which course word contains this Kanji?";
  }
  const wrong = shuffled([...new Set(distractors)]).slice(0, 3);
  if (wrong.length !== 3) throw new Error("Not enough unambiguous choices");
  const options = shuffled([correct, ...wrong]);
  return { kanjiId, character: kanji.character, kind, display, prompt, options, correctIndex: options.indexOf(correct) };
}
