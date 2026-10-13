// Expands compact lesson definitions into the full lesson and assessment JSON files that
// scripts/import-course.mjs reads. It only arranges what the author wrote; kanji readings and stroke
// counts are copied from shared/course/kanji-facts.json (dictionary data), never typed by hand.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const facts = JSON.parse(fs.readFileSync(path.join(ROOT, "shared/course/kanji-facts.json"), "utf8"));

// A question is written as [prompt, correct answer, [wrong answers], explanation].
// The correct answer is placed at a position that varies from question to question.
function question([prompt, correct, wrong, explanation], index, shift) {
  const options = [...wrong];
  options.splice((index + shift) % (wrong.length + 1), 0, correct);
  return { prompt, options, correct, explanation };
}

function kanjiEntry([char, meaning, words, mnemonic]) {
  const fact = facts[char];
  if (!fact) throw new Error(`No dictionary facts for ${char}. Run scripts/fetch-kanji-assets.mjs first.`);
  return {
    char, onyomi: fact.onyomi, kunyomi: fact.kunyomi, meaning_en: meaning, stroke_count: fact.strokeCount,
    example_words: words.map(([word, reading, en]) => ({ word, reading, en })), mnemonic,
  };
}

/** Builds one lesson in the generation schema from its compact definition. */
function lesson(level, unitNumber, number, def) {
  const unitId = `japanese-${level.toLowerCase()}-unit-${unitNumber}`;
  const reading = def.reading
    ? { genre: def.reading.genre, text_jp: def.reading.text, en_translation: def.reading.en, questions: def.reading.questions.map((item, index) => question(item, index, 1)) }
    : { genre: "", text_jp: "", en_translation: "", questions: [] };
  return {
    id: `${unitId}-${def.slug}`, slug: `${level.toLowerCase()}-unit-${unitNumber}-${def.slug}`,
    unit: `Japanese ${level} Unit ${unitNumber}`, unit_number: unitNumber, lesson_number: number, is_review: Boolean(def.review),
    title: def.title, title_jp: def.titleJp, objectives: def.objectives,
    vocabulary: def.vocabulary,
    kanji_form: (def.forms ?? []).map(([word, wordReading]) => ({ word_japanese: word, word_reading: wordReading })),
    concept: { title: def.concept[0], text: def.concept[1], examples: def.concept[2] },
    grammar: (def.grammar ?? []).map(point => ({
      title: point.title, pattern: point.pattern, explanation: point.explanation,
      examples: point.examples.map(([japanese, romaji, meaning]) => ({ japanese, romaji, meaning })), notes: point.notes ?? [],
    })),
    examples: def.examples, dialogue: def.dialogue,
    introduced_kanji: (def.kanji ?? []).map(kanjiEntry), reading,
    practice: def.practice.map((item, index) => question(item, index, number)),
    challenge: def.challenge.map((item, index) => question(item, index, number + 2)),
    recycled_from: def.recycled ?? [], skill_notes: def.skillNotes ?? "", review_flags: def.flags ?? [],
  };
}

/** Builds a unit assessment. Each question is [id, prompt, correct, [three wrong answers], explanation]. */
function assessment(level, unitNumber, questions) {
  // A fixed, irregular spread of correct positions: each of the four positions is used three or four times.
  const positions = [1, 3, 0, 2, 3, 1, 0, 2, 1, 3, 2, 0, 3, 1, 2];
  return {
    id: `japanese-${level.toLowerCase()}-unit-${unitNumber}-assessment`, passPercent: 80,
    questions: questions.map(([id, prompt, correct, wrong, explanation], index) => {
      const options = [...wrong];
      options.splice(positions[index], 0, correct);
      return { id, prompt, options, correctIndex: positions[index], explanation };
    }),
  };
}

/** Writes a unit's six lessons and its assessment to docs/curriculum/<level>/unit-<n>/. */
function writeUnit(level, unitNumber, lessons, assessmentQuestions) {
  const folder = path.join(ROOT, "docs/curriculum", level.toLowerCase(), `unit-${unitNumber}`);
  fs.mkdirSync(folder, { recursive: true });
  const save = (name, data) => fs.writeFileSync(path.join(folder, name), `${JSON.stringify(data, null, 2)}\n`);
  lessons.forEach((def, index) => save(`${String(index + 1).padStart(2, "0")}-${def.slug}.json`, lesson(level, unitNumber, index + 1, def)));
  save("07-assessment.json", assessment(level, unitNumber, assessmentQuestions));
  console.log(`Wrote ${lessons.length} lessons and the assessment to ${path.relative(ROOT, folder)}`);
}

module.exports = { writeUnit };
