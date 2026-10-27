// Builds a migration that adds starter review-bank questions for imported units, taken from their
// lessons' practice questions and vocabulary (the same recipe migration 008 used for Units 1–3).
//   node scripts/course-import/build-review-seed.cjs <migration file name> <unit id>...
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const [name, ...unitIds] = process.argv.slice(2);
if (!name || !unitIds.length) throw new Error("Usage: build-review-seed.cjs <migration file name> <unit id>...");
const lessons = JSON.parse(fs.readFileSync(path.join(ROOT, "shared/course/lessons.json"), "utf8"));

const QUESTIONS_PER_LESSON = 2, MATCH_PAIRS = 5, SCRAMBLES_PER_LESSON = 2;
// The question bank accepts match items of up to 60 characters (nihon-api/src/services/question-types.ts).
const MAX_MATCH_TEXT = 60;
const rows = [];
const add = (unitId, type, content) => rows.push(`  ('${unitId}', '${type}', $json$${JSON.stringify(content)}$json$::jsonb)`);

for (const unitId of unitIds) {
  const unitLessons = lessons.filter(lesson => lesson.unitId === unitId && !lesson.isReview);
  if (!unitLessons.length) throw new Error(`No imported lessons for ${unitId}`);
  for (const lesson of unitLessons) {
    // Questions marked "Review:" belong to earlier lessons, so they are left to those lessons.
    for (const question of lesson.practice.filter(item => !item.prompt.startsWith("Review:")).slice(1, 1 + QUESTIONS_PER_LESSON)) {
      // The bank shows options in their stored order, so the correct one is moved to a varying position.
      const options = question.options.filter(option => option !== question.correct);
      const correctIndex = rows.length % question.options.length;
      options.splice(correctIndex, 0, question.correct);
      add(unitId, "multiple_choice", { prompt: question.prompt, options, correctIndex, explanation: question.explanation });
    }
    // A matching game needs every word and every meaning to be different.
    const pairs = [];
    for (const [left, , right] of lesson.vocabulary) {
      const fits = left.length <= MAX_MATCH_TEXT && right.length <= MAX_MATCH_TEXT;
      if (fits && pairs.length < MATCH_PAIRS && !pairs.some(pair => pair.left === left || pair.right === right)) pairs.push({ left, right });
    }
    add(unitId, "word_match", { prompt: `Match the words from “${lesson.title}” with their meanings.`, pairs });
    const scrambles = lesson.vocabulary.filter(([word]) => !/\s/.test(word) && [...word].length >= 3 && [...word].length <= 8).slice(-SCRAMBLES_PER_LESSON);
    for (const [answer, , hint] of scrambles) add(unitId, "word_scramble", { answer, hint });
  }
}

const sql = `-- Starter review questions for ${unitIds.join(", ")}, taken from their lessons' practice questions
-- and vocabulary. Built by scripts/course-import/build-review-seed.cjs; administrators can edit them afterwards.
INSERT INTO review_questions (unit_id, type, content) VALUES
${rows.join(",\n")};
`;
fs.writeFileSync(path.join(ROOT, "nihon-api/migrations", name), sql);
console.log(`Wrote ${rows.length} questions to nihon-api/migrations/${name}`);
