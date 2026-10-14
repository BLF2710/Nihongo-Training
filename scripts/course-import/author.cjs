// Expands compact lesson definitions into the full lesson and assessment JSON files that
// scripts/import-course.mjs reads. It only arranges what the author wrote; kanji readings and stroke
// counts are copied from shared/course/kanji-facts.json (dictionary data), never typed by hand.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const facts = JSON.parse(fs.readFileSync(path.join(ROOT, "shared/course/kanji-facts.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "shared/kanji.json"), "utf8"));

// Furigana shorthand: 漢字{かんじ} becomes <ruby>漢字<rt>かんじ</rt></ruby>. It applies to a run of kanji
// directly before the braces, so 思{おも}う puts the reading over 思 only.
const SHORTHAND = /([\p{Script=Han}々]+)\{([ぁ-ゖァ-ヺー]+)\}/gu;
// 漢字{-} keeps the kanji bare on purpose, for example in a question that asks for its reading.
// An invisible word joiner after it tells the furigana check that this is intended.
const BARE = "⁠";
const furigana = text => text.replace(/([\p{Script=Han}々]+)\{-\}/gu, `$1${BARE}`).replace(SHORTHAND, "<ruby>$1<rt>$2</rt></ruby>");
const deepFurigana = value => typeof value === "string" ? furigana(value)
  : Array.isArray(value) ? value.map(deepFurigana)
  : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepFurigana(item)])) : value;
const RUBY = /<ruby>(.*?)<rt>.*?<\/rt><\/ruby>/g;
const kanjiOf = text => [...text.replace(RUBY, "$1")].filter(character => /\p{Script=Han}/u.test(character));

/**
 * Kanji a lesson may use: every N5 kanji, plus the kanji its level's blueprint schedules up to and including
 * this lesson. Kanji the dictionary gives in kanji-entry example words are not checked.
 */
function taughtKanji(level, lessonId) {
  const taught = new Set(catalog.kanji.filter(kanji => {
    const introduced = catalog.lessonIntroductions.find(item => item.introducedKanji.includes(kanji.id));
    return !introduced || introduced.lessonId.startsWith("japanese-n5-");
  }).map(kanji => kanji.character));
  if (level === "N5") return taught;
  const blueprint = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/curriculum/blueprint-${level.toLowerCase()}.json`), "utf8"));
  for (const lesson of blueprint.units.flatMap(unit => unit.lessons)) {
    lesson.kanji.forEach(character => taught.add(character));
    if (lesson.lesson_id === lessonId) return taught;
  }
  throw new Error(`${lessonId} is not in the ${level} blueprint`);
}

/** Leftover shorthand, kanji without furigana (from N4 on) and kanji not yet taught. */
function checkScript(level, id, data) {
  // Kanji entries need plain kanji, and authoring notes are never shown to learners.
  const { introduced_kanji: _kanji, kanji_form: _forms, review_flags: _flags, recycled_from: _recycled, skill_notes: _notes, ...shown } = data;
  const texts = JSON.stringify(shown);
  const problems = [];
  const leftover = texts.match(/.{0,4}\{[ぁ-ゖァ-ヺー]+\}/gu);
  if (leftover) problems.push(`unconverted furigana shorthand: ${leftover.slice(0, 3).join(" ")}`);
  const restarted = texts.match(/[^"]{0,12}[^\x00-\x7f]…\s*[ぁ-ヺ\p{Script=Han}「][^"]{0,12}/gu);
  if (restarted) problems.push(`a sentence restarts after an ellipsis (unfinished draft?): ${restarted.slice(0, 3).join(" | ")}`);
  if (level !== "N5") {
    const bare = [...new Set([...texts.replace(RUBY, "").replace(/[\p{Script=Han}々]+⁠/gu, "")].filter(character => /\p{Script=Han}/u.test(character)))];
    if (bare.length) problems.push(`kanji without furigana: ${bare.join(" ")}`);
  }
  const taught = taughtKanji(level, id);
  const untaught = [...new Set(kanjiOf(texts))].filter(character => !taught.has(character));
  if (untaught.length) problems.push(`kanji not taught yet: ${untaught.join(" ")}`);
  if (problems.length) throw new Error(`${id}: ${problems.join("; ")}`);
}

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

/** The lesson with its furigana shorthand expanded, checked for untaught kanji. */
function finishedLesson(level, unitNumber, number, def) {
  const built = lesson(level, unitNumber, number, def);
  const { introduced_kanji: kanji, kanji_form: forms, ...rest } = built;
  const done = { ...deepFurigana(rest), introduced_kanji: kanji, kanji_form: forms };
  checkScript(level, built.id, done);
  return Object.fromEntries(Object.keys(built).map(key => [key, done[key]]));
}

/** Builds a unit assessment. Each question is [id, prompt, correct, [three wrong answers], explanation]. */
function assessment(level, unitNumber, questions) {
  // A fixed, irregular spread of correct positions: each of the four positions is used three or four times.
  const positions = [1, 3, 0, 2, 3, 1, 0, 2, 1, 3, 2, 0, 3, 1, 2];
  const built = {
    id: `japanese-${level.toLowerCase()}-unit-${unitNumber}-assessment`, passPercent: 80,
    questions: questions.map(([id, prompt, correct, wrong, explanation], index) => {
      const options = [...wrong];
      options.splice(positions[index], 0, correct);
      return { id, prompt, options, correctIndex: positions[index], explanation };
    }),
  };
  const done = deepFurigana(built);
  // The assessment comes after the review lesson, so it may use every kanji of the unit.
  checkScript(level, `japanese-${level.toLowerCase()}-unit-${unitNumber}-review`, done);
  return done;
}

/** Writes a unit's six lessons and its assessment to docs/curriculum/<level>/unit-<n>/. */
function writeUnit(level, unitNumber, lessons, assessmentQuestions) {
  const folder = path.join(ROOT, "docs/curriculum", level.toLowerCase(), `unit-${unitNumber}`);
  fs.mkdirSync(folder, { recursive: true });
  const save = (name, data) => fs.writeFileSync(path.join(folder, name), `${JSON.stringify(data, null, 2)}\n`);
  lessons.forEach((def, index) => save(`${String(index + 1).padStart(2, "0")}-${def.slug}.json`, finishedLesson(level, unitNumber, index + 1, def)));
  save("07-assessment.json", assessment(level, unitNumber, assessmentQuestions));
  console.log(`Wrote ${lessons.length} lessons and the assessment to ${path.relative(ROOT, folder)}`);
}

module.exports = { writeUnit };
