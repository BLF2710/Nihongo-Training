# Kanji learning

## Scope and data

The initial collection is 日、本、人、水、父、母、学、生、先、食. It connects to the existing
course words 日本、本、人、水、父、母、学生、先生、食べ物. The original kana-first lesson
content and vocabulary meanings remain the source of truth.

`shared/kanji.json` is used by frontend and backend:

- `kanji`: stable Unicode-based ID, character, meanings, onyomi, kunyomi, nullable verified
  JLPT level, verified stroke count, and source URL.
- `vocabularyForms`: verified written/reading annotations pointing to existing vocabulary
  IDs and the subset of their Kanji supported by this collection. No copied meanings or
  independent vocabulary progress are stored. 物 in 食べ物 is intentionally not taught yet.
- `lessonIntroductions`: explicit lesson ID → introduced Kanji IDs. Mere text occurrence
  or vocabulary association does not imply introduction, completion, or mastery.

Introductions appear on the welcome step of Unit 2 Family, Living, and Preferences,
and Unit 3 People Locations. Unit 1 vocabulary is linked for reinforcement; its lessons
are not retroactively labelled as introducing these Kanji.

Meanings/readings/counts come from KANJIDIC2 via kanjiapi.dev. Word spellings/readings
were checked in its JMdict word records. Source details, licence, transformations,
and the monthly update procedure are in [shared/README.md](../shared/README.md).

## UI and routes

- `/learn/kanji`: counts, search (Japanese/English/readings), and status filters.
- `/learn/kanji/:kanjiId`: reference, existing vocabulary cards, explicit introducing
  lessons, saved statistics, and practice link.
- `/learn/kanji/practice?kanji=<id>`: optional single-character focus.
- Existing Vocabulary cards show additional written forms and character links.
- Existing lessons retain their unit/prerequisite gates. Kanji is browseable reference.
- Lesson introduction Kanji buttons open a modal reusing `KanjiStudyCard`, without
  Mixed practice. Escape, Close, or the backdrop dismisses it and restores focus;
  the lesson remains mounted. Stroke-order flipping is available inside the modal.
- Kana Review and Kanji practice share the same answer-choice component; Kana behavior
  is unchanged.

## Persistence and grading

Apply `npm run migrate` in `nihon-api`. Migration `004_kanji_progress.sql` adds:

- `kanji_catalog`: stable identities for foreign keys (reference content stays in the JSON).
- `user_kanji_progress`: correct/wrong counters and timestamps, keyed by user + Kanji.
- `kanji_practice_questions`: user-owned issued questions, answer keys, and submitted
  answers for server-side grading and idempotency.

All Kanji endpoints use the existing required JWT authentication:

- `GET /api/kanji/progress`
- `POST /api/kanji/practice` with `{ size: 3 | 5 | 10, kanjiId?: string }`
- `POST /api/kanji/answer` with `{ questionId, answerIndex }`

User IDs, claimed correctness, and client scores are not accepted as authority.
Answer submission locks the user-owned question row and updates totals atomically.
Retrying the same answer returns its saved result without another increment; changing
an already-submitted answer is rejected. Issued questions remain valid for saved
sessions across browser closures. The legacy expiry column is no longer enforced,
and question records are not pruned on a new session (which would break resuming).
They are removed with account deletion. Durable progress remains independent.

Attempts and accuracy are derived from correct/wrong totals. The shared helper preserves
the exact existing Kana behavior: Untested = zero attempts; Mastered = at least three
correct answers and at least 80% displayed, whole-percent-rounded accuracy; otherwise
Learning. Wrong answers can move a Mastered character back to Learning.

One practice engine serves meaning, whole-course-word reading, and contains-character
recognition. Each question credits only its named target Kanji, including compound words.
All-class sessions use distinct characters up to the current collection size; focused
sessions intentionally repeat one character across question types.

No XP, lesson progress, assessment state, or Kana statistics are written. Kanji remains
a supporting study activity, not a new unit completion requirement.

## Extending

1. Verify new records and add them to the shared catalog with source/attribution.
2. Add a migration seeding new stable IDs in `kanji_catalog`.
3. Annotate existing vocabulary IDs with verified forms, or set a vocabulary entry's
   optional `kanjiFormId` to an existing form.
4. Explicitly list introducing lesson IDs; don't infer them from Japanese text.
5. Run data integrity and practice tests. A future form must have enough distinct,
   unambiguous alternatives for each enabled question type.

## Limits and tests

The ten Kanji now bundle verified KanjiVG SVGs at the same pinned revision as Kana.
`KanaStrokeOrder` accepts an optional path map; Kana keeps its unchanged default.
The same SVG renderer, ordered-path animation, Replay/Previous/Next/Reset controls,
unsupported-character fallback and CC BY-SA 3.0 attribution serve both collections.
Run `node scripts/import-kana-strokes.mjs --kanji` in nihon-web to reproduce the import.
Each SVG is checked for its exact character, sequential stroke IDs, and dictionary count.
There is no Kanji handwriting canvas. No official modern JLPT labels are
claimed. Some dictionary readings are uncommon; practice uses only verified course words.
Unfinished sessions/summary state are local to the page; saved answers persist after refresh.
Mastery is this app's simple practice threshold, not a certification of writing ability.

### Flashcard audit and reuse

The actual Kana learning page has Listen/How to Draw/Write It and navigation, but no
flip-card mode or flashcard progress. Its data comes from `/quiz/characters`, enriched
by `hiraganaLearning.ts` / `katakanaLearning.ts`. Kana game answers, not learning-page
browsing, drive the existing statistics and shared mastery calculation.

The existing flip-card implementation was `VocabularyFlashcard.tsx`. Its card and
deck components now accept presentation data (`StudyCard`), retaining keyboard flips,
front reset, session shuffle, bounded navigation and existing Japanese speech service.
Vocabulary adapts its existing records; Kanji adapts `shared/kanji.json` and joins the
existing course vocabulary meanings. No separate word list or flashcard engine exists.
Kanji now uses one unified study card with meaning, both reading groups, linked course
vocabulary (up to four, with expandable extras), and shared stroke animation on the
back of the card. The Stroke order button flips the card; Back to study card returns
to its front. Hidden faces are inert, and reduced-motion preferences are respected.
It reuses the same deck/shuffle/navigation through an optional card renderer; Vocabulary
keeps its flip-card UI. Where fewer than two linked words exist, no words are fabricated.
The internal character→meaning, course word→reading, and meaning→written vocabulary
adapters remain available. Server practice still mixes its existing three question types.
Card sessions are in-memory, study-only, and do not self-grade or award mastery/XP.
Existing server-graded Kanji practice remains the only writer of Kanji statistics.

Extension files: `components/KanaStrokeOrder.tsx`, `VocabularyFlashcard.tsx`,
`KanjiFlashcards.tsx`, `data/kanjiStudyCards.ts`, `data/kanjiStrokes.json`,
`pages/KanjiPage.tsx`, `scripts/import-kana-strokes.mjs`, ten `public/kanjivg/*.svg`
assets and their `ATTRIBUTION.md`. The overview back link now goes to Dashboard.

Run `node scripts/verify-kanji.cjs` from `nihon-api` for real database/API tests using
temporary tables rolled back afterward. Add `--browser` with the frontend on port 5181
and the existing Playwright runtime available to check UI, persistence, and navigation.
The browser test stubs only lesson eligibility for its navigation check; the existing
`verify-unit-assessments.cjs` suite exercises actual course gates separately.

## Files for this feature

Added:

- `shared/kanji.json`, `shared/README.md` — catalog, relationships, provenance and licence.
- `nihon-api/migrations/004_kanji_progress.sql` — additive persistence.
- `nihon-api/src/services/kanji.service.ts`, `character-progress.ts` — questions and shared mastery arithmetic.
- `nihon-api/src/routes/kanji.routes.ts` — authenticated progress and practice endpoints.
- `nihon-api/scripts/verify-kanji.cjs`, `check-kanji-sources.cjs` — tests and source verification.
- `nihon-web/src/data/kanji.ts`, `src/api/kanji.ts` — content and API adapters.
- `nihon-web/src/components/KanjiReferences.tsx`, `QuizChoices.tsx` — reusable integration/choice UI.
- `nihon-web/src/pages/KanjiPage.tsx`, `KanjiPracticePage.tsx` — reference and practice.
- `docs/KANJI.md` — implementation notes.

Updated:

- API `src/server.ts`, `src/controllers/statistics.controller.ts`, and `tsconfig.json`.
- Web `src/App.tsx`, `src/components/Navbar.tsx`, `StudyReferenceCards.tsx`,
  `src/data/japaneseUnit1Reference.ts`, `src/pages/JapaneseN5LessonPage.tsx`,
  `ReviewPage.tsx`, `StudyReferencePage.tsx`, and `tsconfig.app.json`.
- Existing verification loaders in `nihon-api/scripts/verify-unit-assessments.cjs`
  and `nihon-web/scripts/verify-unit1-reference.mjs` now understand shared JSON.
- Root `README.md` records the implemented feature.

Existing Unit 1–3 lesson text/questions, assessment keys, XP calculations, and Kana
data are not edited by this feature.
