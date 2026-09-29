# Japanese N5 Units 2–3

## Curriculum reference

Primary reference: the Japan Foundation's [IRODORI Starter (A1)](https://www.irodori.jpf.go.jp/en/starter/pdf.html) and its [English contents / Can-do and grammar outline](https://www.irodori.jpf.go.jp/assets/data/starter/pdf/X_contents_en.pdf).

| App lessons | Reference topics |
| --- | --- |
| Unit 2, Lessons 1–3 | Starter Lesson 4: family, residence, and noun relationships |
| Unit 2, Lessons 4–5 | Starter Lesson 5: preferences and eating/drinking habits |
| Unit 3, Lessons 1–2 | Starter Lesson 6: requests, choices, quantities, and availability |
| Unit 3, Lesson 3 | Starter Lesson 7: home, rooms, and objects |
| Unit 3, Lessons 4–5 | Starter Lessons 7–8: locating places, people, and things |
| Both Lesson 6 reviews | Consolidation of the app's preceding five lessons |

The app's explanations, dialogues, questions, and distractors are original adaptations,
not textbook extracts. No textbook audio, images, or exercises are bundled. IRODORI's
A1 outcomes inform this beginner course; this is not a complete reproduction of
IRODORI or an official JLPT coverage/certification claim.

## Deliberate limits

- Kana-first writing with romaji support in vocabulary and grammar examples.
- Learn すんでいます as a useful phrase, without a general lesson on て-form conjugation.
- Family terms distinguish one's own relatives from respectful terms for others.
- Direct references to people use この／その／あの ひと rather than object demonstratives.
- Limit general item counts to ひとつ, ふたつ, みっつ, よっつ.
- Pair frequency あまり with a negative; explain ちょっと… as a contextual soft refusal.
- Keep existence patterns for objects (あります) separate from people (います).
- Do not add unrelated daily-action verbs, advanced conjugations, or new Kanji/stroke lessons.
- Review lessons retain the normal lesson challenge and XP mechanism. A separate
  15-question assessment is still required to complete each unit.
- No recorded listening/speaking assessment is claimed; existing reference TTS remains optional.

## Content and progression

Frontend content is in `nihon-web/src/data/japaneseN5Units23.ts`, using the existing
`N5Lesson` shape. `japaneseStudyUnits.ts` derives reference cards from the same vocabulary
and grammar. It does not maintain a second set of word meanings.

Server metadata is in `nihon-api/src/data/unit23-lessons.ts`; assessment keys are in
`unit23-assessments.ts` and stay on the server. Catalog/content alignment is tested.
Existing Unit 1 lesson content and assessment questions are unchanged.

Unit 2 remains Level 3 + Unit 1 complete. Unit 3 remains Level 5 + Unit 2 complete.
Some learners may need existing practice XP to meet a level requirement; assessments
do not award XP. No thresholds, reward formulas, or completion semantics were changed.

No database migration is needed: existing lesson IDs and assessment IDs are stored in
the current progress tables. A content review by a Japanese teacher is recommended
before describing the course as professionally reviewed.

## Implementation file list

Added:

- `nihon-web/src/data/japaneseN5Units23.ts`
- `nihon-web/src/data/japaneseStudyUnits.ts`
- `nihon-api/src/data/unit23-lessons.ts`
- `nihon-api/src/data/unit23-assessments.ts`
- `docs/JAPANESE-CURRICULUM.md`

Updated:

- `nihon-web/src/data/japaneseN5Lessons.ts` — extends the existing lesson type/catalog without changing Unit 1 content.
- `nihon-web/src/pages/JapaneseN5LessonPage.tsx` — unit-aware labels, return links, reference links, and per-lesson session reset.
- `nihon-web/src/pages/StudyReferencePage.tsx` — unit selection with existing cards, filters, and flashcards.
- `nihon-web/src/App.tsx` — lazy-load the shared lesson/reference pages.
- `nihon-api/src/data/units.ts` — replace placeholders with real lesson and assessment IDs.
- `nihon-api/src/data/unit-assessments.ts` — register the new server-side assessments.
- `nihon-api/src/services/lesson.service.ts` — register the new lesson metadata, preserving eligibility logic.
- `nihon-api/scripts/verify-unit-assessments.cjs` — expand API/database/browser regression coverage.
- `nihon-api/UNIT-PROGRESSION.md` and `README.md` — reflect the implemented units.
