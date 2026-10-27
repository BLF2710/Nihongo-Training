// Checks a review-bank seed migration with the API's own question parser, so every seeded question is one an
// administrator could also have saved (and can edit later).
//   cd nihon-api && node ../scripts/course-import/check-review-seed.cjs migrations/021_n4_review_bank.sql
const path = require("node:path");
const API = path.resolve(__dirname, "../../nihon-api");
require(require.resolve("ts-node", { paths: [API] })).register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const fs = require("node:fs");
const { QUESTION_TYPES } = require(path.join(API, "src/services/question-types"));

const sql = fs.readFileSync(process.argv[2], "utf8");
const rows = [...sql.matchAll(/\('([^']+)', '([a-z_]+)', \$json\$(.*?)\$json\$::jsonb\)/g)];
const counts = {}, problems = [];
for (const [, unitId, type, json] of rows) {
  counts[unitId] = (counts[unitId] ?? 0) + 1;
  const content = JSON.parse(json);
  const parsed = QUESTION_TYPES[type].parse(content);
  if (!parsed) problems.push(`${unitId} ${type}: rejected by the parser: ${json.slice(0, 140)}`);
  if (type === "word_scramble" && /<ruby>/.test(content.answer)) problems.push(`${unitId}: scramble answer contains markup: ${content.answer}`);
  if (type === "multiple_choice" && content.options[content.correctIndex] === undefined) problems.push(`${unitId}: correctIndex out of range`);
}
console.log(`${rows.length} questions`, counts);
console.log(problems.length ? problems.join("\n") : "PASS: every seeded question passes the API's validation.");
process.exitCode = problems.length ? 1 : 0;
