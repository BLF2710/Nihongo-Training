// Validation and reshaping for generated course content. Pure functions: no file or network access.

export const LESSON_ID = /^japanese-n[1-5]-unit-\d+-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KANJI_CHAR = /^\p{Script=Han}$/u;
const HAS_KANJI = /\p{Script=Han}/u;
export const kanjiIn = text => [...text].filter(character => KANJI_CHAR.test(character));

// Furigana is written as <ruby>漢字<rt>かんじ</rt></ruby> inside text fields.
const RUBY = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;
/** The text as it is read aloud: every ruby block replaced by its reading. */
export const toReading = text => text.replace(RUBY, "$2");
const withoutRuby = text => text.replace(RUBY, "");
const LEVELS_WITH_FULL_FURIGANA = new Set(["N4"]);

// Japanese shown to learners: vocabulary, grammar and sentence examples, dialogue lines and the reading passage.
function japaneseTexts(lesson) {
  return [
    ...(lesson.vocabulary ?? []).map(item => item?.[0]),
    ...(lesson.grammar ?? []).flatMap(point => (point?.examples ?? []).map(example => example?.japanese)),
    ...(lesson.examples ?? []).map(item => item?.[0]),
    ...(lesson.dialogue ?? []).flatMap(item => [item?.[1], item?.[3]]),
    lesson.reading?.text_jp,
  ].filter(text => typeof text === "string");
}

const isText = value => typeof value === "string" && value.trim().length > 0;
const isStringArray = (value, length) => Array.isArray(value) && value.every(item => typeof item === "string") && (length === undefined || value.length === length);

/** What kind of course file this is, judged by its contents. */
export function kindOf(data) {
  if (Array.isArray(data?.units)) return "blueprint";
  if (Array.isArray(data?.questions) && "passPercent" in data) return "assessment";
  if (Array.isArray(data?.vocabulary)) return "lesson";
  return "unknown";
}

// ---- Blueprint

export function readBlueprint(blueprint) {
  const errors = [];
  const units = [];
  for (const unit of blueprint.units) {
    const label = unit.unit_id ?? "(unit without unit_id)";
    if (!/^japanese-n[1-5]-unit-\d+$/.test(unit.unit_id ?? "")) { errors.push(`${label}: unit_id must look like japanese-n5-unit-4`); continue; }
    if (!isText(unit.title) || !isText(unit.description)) errors.push(`${label}: title and description are required`);
    if (!Number.isInteger(unit.unit_number) || !Number.isInteger(unit.sequence)) errors.push(`${label}: unit_number and sequence must be whole numbers`);
    const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
    if (lessons.length !== 6) errors.push(`${label}: expected 6 lessons (5 content + 1 review), found ${lessons.length}`);
    lessons.forEach((lesson, index) => {
      if (!LESSON_ID.test(lesson.lesson_id ?? "") || !lesson.lesson_id.startsWith(`${unit.unit_id}-`)) errors.push(`${label}: lesson ${index + 1} has an invalid lesson_id`);
      if (lesson.lesson_number !== index + 1) errors.push(`${label}: ${lesson.lesson_id} should have lesson_number ${index + 1}`);
      if (Boolean(lesson.is_review) !== (index === 5)) errors.push(`${label}: only the sixth lesson is the review lesson`);
    });
    units.push({
      id: unit.unit_id, level: unit.level, number: unit.unit_number, sequence: unit.sequence,
      title: unit.title, titleJp: unit.title_jp ?? "", description: unit.description,
      lessonIds: lessons.map(lesson => lesson.lesson_id), assessmentId: `${unit.unit_id}-assessment`,
    });
  }
  if (new Set(units.map(unit => unit.sequence)).size !== units.length) errors.push("Two units share the same sequence number");
  return { units, errors };
}

// ---- Lessons

function checkQuestions(questions, label, [min, max], errors) {
  if (!Array.isArray(questions)) { errors.push(`${label}: must be a list`); return; }
  if (questions.length < min || questions.length > max) errors.push(`${label}: expected ${min}–${max} questions, found ${questions.length}`);
  questions.forEach((question, index) => {
    const at = `${label} ${index + 1}`;
    if (!isText(question?.prompt) || !isText(question?.explanation)) errors.push(`${at}: prompt and explanation are required`);
    if (!isStringArray(question?.options) || question.options.length < 2) { errors.push(`${at}: needs at least two options`); return; }
    if (new Set(question.options).size !== question.options.length) errors.push(`${at}: options must all be different`);
    if (question.options.filter(option => option === question.correct).length !== 1) errors.push(`${at}: "correct" must exactly equal one option`);
  });
}

/**
 * Checks one generated lesson against the course rules.
 * `context` supplies what the importer already knows: the unit, earlier lessons of that unit, and kanji taught elsewhere.
 */
export function validateLesson(lesson, context) {
  const errors = [], warnings = [];
  const { unit, earlierLessons = [], kanjiTaughtElsewhere = new Set() } = context;
  if (!LESSON_ID.test(lesson.id ?? "")) return { errors: ["id must look like japanese-n5-unit-4-telling-time"], warnings };
  if (!unit) return { errors: [`${lesson.id}: its unit is not registered. Import the blueprint first.`], warnings };
  const position = unit.lessonIds.indexOf(lesson.id);
  if (position < 0) return { errors: [`${lesson.id}: not listed in the blueprint for ${unit.id}. Lesson ids are fixed once issued.`], warnings };
  const isReview = position === 5;

  if (lesson.slug !== lesson.id.replace(/^japanese-/, "")) errors.push(`slug must be "${lesson.id.replace(/^japanese-/, "")}"`);
  if (lesson.lesson_number !== position + 1) errors.push(`lesson_number must be ${position + 1}`);
  if (lesson.unit_number !== unit.number) errors.push(`unit_number must be ${unit.number}`);
  if (Boolean(lesson.is_review) !== isReview) errors.push(`is_review must be ${isReview}`);
  if (!isText(lesson.title)) errors.push("title is required");
  if (!isStringArray(lesson.objectives) || !lesson.objectives.length) errors.push("objectives needs at least one entry");

  const vocabulary = Array.isArray(lesson.vocabulary) ? lesson.vocabulary : [];
  if (!vocabulary.every(item => isStringArray(item, 3) && isText(item[0]) && isText(item[2]))) errors.push("every vocabulary item must be [japanese, romaji, english]");
  if (new Set(vocabulary.map(item => item[0])).size !== vocabulary.length) errors.push("vocabulary lists the same word twice");
  const grammar = Array.isArray(lesson.grammar) ? lesson.grammar : [];
  const introducedKanji = Array.isArray(lesson.introduced_kanji) ? lesson.introduced_kanji : [];

  if (isReview) {
    const known = new Set(earlierLessons.flatMap(earlier => earlier.vocabulary.map(item => item[0])));
    const unknown = vocabulary.map(item => item[0]).filter(word => !known.has(word));
    if (unknown.length) errors.push(`a review lesson cannot introduce vocabulary: ${unknown.join(", ")}`);
    if (grammar.length) errors.push("a review lesson cannot introduce grammar points");
    if (introducedKanji.length) errors.push("a review lesson cannot introduce kanji");
  } else {
    if (vocabulary.length < 8 || vocabulary.length > 14) errors.push(`expected 8–14 vocabulary items, found ${vocabulary.length}`);
    if (grammar.length < 1 || grammar.length > 3) errors.push(`expected 1–3 grammar points, found ${grammar.length}`);
  }
  grammar.forEach((point, index) => {
    const at = `grammar ${index + 1}`;
    if (!isText(point?.title) || !isText(point?.pattern) || !isText(point?.explanation)) errors.push(`${at}: title, pattern and explanation are required`);
    const examples = Array.isArray(point?.examples) ? point.examples : [];
    if (examples.length < 4) errors.push(`${at}: needs at least 4 examples, found ${examples.length}`);
    if (!examples.every(example => isText(example?.japanese) && isText(example?.meaning) && typeof (example.romaji ?? "") === "string")) errors.push(`${at}: every example needs japanese and meaning`);
    if (point?.notes !== undefined && !isStringArray(point.notes)) errors.push(`${at}: notes must be a list of text`);
  });

  if (!isText(lesson.concept?.title) || !isText(lesson.concept?.text) || !isStringArray(lesson.concept?.examples)) errors.push("concept needs a title, text and a list of examples");
  if (!Array.isArray(lesson.examples) || !lesson.examples.length || !lesson.examples.every(item => isStringArray(item, 2) && item.every(isText))) errors.push("examples must be [japanese, english] pairs");
  const dialogue = Array.isArray(lesson.dialogue) ? lesson.dialogue : [];
  if (dialogue.length < 3) errors.push(`expected at least 3 dialogue exchanges, found ${dialogue.length}`);
  if (!dialogue.every(item => isStringArray(item, 4) && item.every(isText))) errors.push("every dialogue exchange must be [speakerA, lineA, speakerB, lineB]");
  checkQuestions(lesson.practice, "practice", [6, 8], errors);
  checkQuestions(lesson.challenge, "challenge", [4, 5], errors);

  if (introducedKanji.length > 5) warnings.push(`introduces ${introducedKanji.length} kanji; the course pace is at most 5 per lesson`);
  for (const kanji of introducedKanji) {
    if (!KANJI_CHAR.test(kanji?.char ?? "")) { errors.push(`introduced_kanji: "${kanji?.char}" is not a single kanji`); continue; }
    if (kanjiTaughtElsewhere.has(kanji.char)) errors.push(`${kanji.char} is already introduced by another lesson`);
    const words = (Array.isArray(kanji.example_words) ? kanji.example_words : []).filter(word => isText(word?.word) && word.word.includes(kanji.char) && isText(word.reading));
    if (words.length < 2) errors.push(`${kanji.char} needs at least 2 example words that contain it`);
  }
  if (new Set(introducedKanji.map(kanji => kanji.char)).size !== introducedKanji.length) errors.push("introduced_kanji lists the same kanji twice");
  for (const form of Array.isArray(lesson.kanji_form) ? lesson.kanji_form : []) {
    if (!isText(form?.word_japanese) || !HAS_KANJI.test(form.word_japanese) || !isText(form?.word_reading) || HAS_KANJI.test(form.word_reading)) errors.push(`kanji_form: "${form?.word_japanese}" needs a kanji spelling and a kana reading`);
  }

  const reading = readingOf(lesson);
  if (reading) {
    if (!isText(reading.genre) || !isText(reading.translation)) errors.push("reading needs a genre and an English translation");
    checkQuestions(reading.questions, "reading question", [1, 8], errors);
  }
  const texts = japaneseTexts(lesson);
  const malformed = texts.filter(text => /<\/?(ruby|rt)\b/.test(withoutRuby(text)));
  if (malformed.length) errors.push(`furigana markup must be <ruby>漢字<rt>かんじ</rt></ruby>: ${malformed[0]}`);
  if (texts.some(text => [...text.matchAll(RUBY)].some(match => !match[1] || !match[2] || HAS_KANJI.test(match[2])))) errors.push("a furigana reading must be kana and neither part may be empty");
  if (LEVELS_WITH_FULL_FURIGANA.has(unit.level)) {
    const bare = [...new Set(texts.flatMap(text => kanjiIn(withoutRuby(text))))];
    if (bare.length) errors.push(`${unit.level} lessons need furigana on every kanji; missing on: ${bare.join(" ")}`);
  }
  for (const flag of Array.isArray(lesson.review_flags) ? lesson.review_flags : []) warnings.push(`flagged for checking — ${flag}`);
  return { errors, warnings };
}

// An empty reading block is how a lesson says it has no passage.
function readingOf(lesson) {
  const reading = lesson.reading;
  if (!reading || !isText(reading.text_jp)) return null;
  return { genre: reading.genre, text: reading.text_jp, translation: reading.en_translation, questions: reading.questions };
}

/** The lesson as the site stores it. Authoring notes and kanji facts are left out: kanji go to the kanji catalog. */
export function toStoredLesson(lesson, unit) {
  const reading = readingOf(lesson);
  return {
    id: lesson.id, slug: lesson.slug, unitId: unit.id, level: unit.level, unitNumber: unit.number, lessonNumber: lesson.lesson_number,
    isReview: Boolean(lesson.is_review), title: lesson.title, titleJp: lesson.title_jp ?? "", objectives: lesson.objectives,
    vocabulary: lesson.vocabulary, concept: lesson.concept, grammar: lesson.grammar ?? [], examples: lesson.examples,
    dialogue: lesson.dialogue, practice: lesson.practice, challenge: lesson.challenge, ...(reading ? { reading } : {}),
  };
}

// ---- Assessments

export function validateAssessment(assessment, unit) {
  const errors = [], warnings = [];
  if (!unit) return { errors: [`${assessment.id}: no registered unit has this assessment id. Import the blueprint first.`], warnings };
  if (assessment.passPercent !== 80) errors.push("passPercent must be 80");
  const questions = Array.isArray(assessment.questions) ? assessment.questions : [];
  if (questions.length !== 15) errors.push(`expected exactly 15 questions, found ${questions.length}`);
  if (new Set(questions.map(question => question?.id)).size !== questions.length) errors.push("question ids must be unique");
  const positions = [0, 0, 0, 0];
  questions.forEach((question, index) => {
    const at = `question ${index + 1}`;
    if (!KEBAB.test(question?.id ?? "")) errors.push(`${at}: id must be kebab-case`);
    if (!isText(question?.prompt) || !isText(question?.explanation)) errors.push(`${at}: prompt and explanation are required`);
    if (!isStringArray(question?.options, 4) || new Set(question.options).size !== 4) errors.push(`${at}: needs exactly 4 different options`);
    if (!Number.isInteger(question?.correctIndex) || question.correctIndex < 0 || question.correctIndex > 3) errors.push(`${at}: correctIndex must be 0–3`);
    else positions[question.correctIndex]++;
  });
  if (questions.length === 15 && positions.some(count => count < 2 || count > 6)) errors.push(`correct answers must be spread across all four positions (now ${positions.join(" / ")})`);
  for (let index = 3; index < questions.length; index++) {
    if ([1, 2, 3].every(back => questions[index - back]?.correctIndex === questions[index]?.correctIndex)) { warnings.push("four correct answers in a row share the same position"); break; }
  }
  return { errors, warnings };
}

// ---- Publishing

/**
 * A unit goes live only when all six lessons and its assessment are present and every earlier
 * imported unit is live too, so learners never meet a gap in the unit chain.
 */
export function publishableUnitIds(units, lessonIds, assessmentIds) {
  const published = [];
  for (const unit of [...units].sort((a, b) => a.sequence - b.sequence)) {
    const complete = unit.lessonIds.every(id => lessonIds.has(id)) && assessmentIds.has(unit.assessmentId);
    if (!complete) break;
    published.push(unit.id);
  }
  return published;
}
