# English course and world (plan)

For Vietnamese speakers improving their English (not starting from scratch). The site stays in English; only the
course content is bilingual. The English side works like the Japanese one, but explains English in Vietnamese where
the Japanese side explains Japanese in English.

## Decisions (agreed 2026-11-19)

- Levels: CEFR, starting with an A2 refresher, then B1, B2, C1 (in place of N5 to N1).
- British English: spelling, IPA and the voice (`en-GB`).
- Vocabulary: the word, its IPA, its part of speech, a Vietnamese meaning, a short English definition and an example.
- Grammar: explained in English, with a "Tiếng Việt" switch showing the Vietnamese explanation. English by default.
- Lesson titles: English, with a Vietnamese subtitle (where Japanese lessons have a Japanese one).
- No site translation system: menus, buttons and hints stay English.
- The English side has its own island in the world: medieval Britain (castles, flat land, fields, stone walls).
- Later, a katakana island between the Japanese and English sides (loanwords), once both sides are done.

## What exists today

- Course data (`shared/course/units.json`, `lessons.json`) and the lesson page are Japanese-shaped: vocabulary is
  `[japanese, romaji, english]`, titles have `titleJp`, the lesson route is `/lessons/japanese/:slug`, the API's unit
  chain starts after `japanese-n5-unit-3`, and levels (`lib/courseLevel.ts`) are N5–N1.
- The English side is only the Arcade (`/arcade`, `/games/english`) and a plain home page; `/dashboard` sends English
  learners away; the island map is the Japanese home page.

## Phases

1. **Course engine knows the language.** The course's language is read from the id (`english-a2-unit-1-…`, like
   `japanese-n5-…`). Levels per language (A2–C1 for English). English lesson and vocabulary shapes (above), validated
   at the import boundary. The lesson page shows IPA where it shows romaji, the Vietnamese meaning and English
   definition in the vocabulary step, and the grammar language switch. `/lessons/english/:slug`. The API serves each
   language's units in their own chain. British voice for listening and speaking.
2. **Authoring tools for English.** `author.cjs` and `rules.mjs` with English rules: IPA and both meanings required,
   British spellings checked against a list of common US forms, no kanji or furigana checks.
3. **A2 blueprint, then Unit 1** for review before the rest (as with N5). Topics for improving learners: collocations,
   phrasal verbs, word families, mistakes common for Vietnamese speakers (articles, tenses, plural and past endings,
   final consonants), register.
4. **The English world.** When the course language is English, home is the English island map: a medieval British
   island (a castle on a hill, a market town, fields with hedgerows and stone walls, a river with a stone bridge, an
   abbey) whose places open the same tools as the Japanese islands (lessons, practice, review, games, statistics).
   Island scenes on foot (castle courtyard, market square) reuse the 2.5D scene with new looks and backdrops.
5. **The rest of the study tools for English:** dashboard, SRS deck, mistake notebook, review bank, mock exams,
   statistics.

Each phase is usable when it lands; phases 1–3 come first because the world needs content to lead to.

## Built so far

- **Phase 1:** the course engine.
  - The content format is `shared/course/english/schema.ts`.
  - Levels come from ids: `englishLevelOfId` and `studyLevelOfId` in `lib/courseLevel.ts`, and `courseLevelOf` in the
    API's `learning/courseLevel.ts`.
  - The English level is saved on its own (`course_level_english`); the level picker and the Lessons page follow the
    course language.
  - The API serves English units as their own chain (`data/imported-course.ts`): A2 Unit 1 waits on nothing.
  - The lesson page is `/lessons/english/:slug` (`pages/EnglishLessonPage.tsx`, steps in `components/englishLesson/`).
    - Each step fits one screen at 1366×768 and 390×844.
    - Vocabulary: a word list beside the chosen word in full.
    - Grammar: one point per tab; on a phone, Rule and Examples one at a time.
    - Conversation: one row per line, English beside Vietnamese; on a phone, four lines at a time.
    - Practice and challenge: one question at a time.
    - British voice (`services/englishSpeech.ts`).
    - The "Tiếng Việt" switch is remembered in the browser (`lib/explanationLanguage.ts`).
- **Phase 2:** the authoring tools, in `scripts/english-course/`.
  - Sources are typed by `source.ts`. `validate.ts` holds the rules:
    - IPA between slashes and a known part of speech;
    - Vietnamese that differs from the English;
    - text in NFC form;
    - British spelling (`britishSpelling.ts`);
    - 5 content lessons and 1 review per unit, titles as in the blueprint;
    - every word taught once, and reviews that only revisit taught words;
    - 15 assessment questions.
  - `build.ts` makes the ids and the data. It also shuffles each question's options (`optionOrder.ts`), so authors
    can write the correct answer first. The shuffle is seeded by the question's place in the course, so every import
    gives the same order and the assessment's answer indexes stay valid.
- **Phase 3:** A2 is written and live: six units of five lessons and a review each, plus a 15-question unit test
  each. Unit 1 was reviewed first; Units 2–6 follow its style.
  B1 ("Get Confident") is also written and live in the same shape (`docs/curriculum/english/b1/`):
  1. Experiences & Achievements, 2. Work & Study, 3. Travel & Culture, 4. Possibilities & Wishes,
  5. News & Media, 6. Society & the Environment.
  B2 ("Speak Naturally") is written and live too (`docs/curriculum/english/b2/`): 1. People & Relationships,
  2. Work & Careers, 3. Technology & Science, 4. Health & Lifestyle, 5. Stories & Experiences, 6. Ideas & Opinions.
  C1 ("Master the Details") is written and live as well (`docs/curriculum/english/c1/`):
  1. Language & Communication, 2. Work & the Economy, 3. Science & Ethics, 4. Culture & the Arts,
  5. Society & Change, 6. Mastering Style. The whole course (A2–C1) is now 24 units and 144 lessons.
  The A2 units are:
  1. People & Everyday Life
  2. Past Experiences
  3. Places & Directions
  4. Food & Shopping
  5. Plans & the Future
  6. Health & Advice
- **Phase 4:** the English Isle on foot is the English learner's home page (`/`, which `pages/HomePage.tsx`
  sends to `pages/EnglishIslandPage.tsx`; also at `/english/island`; data in `data/world/englishIsland.ts`). Its doors
  open the level picker (castle), English statistics (watchtower), lessons (church school) and the arcade (tavern),
  everything the old English home page linked to, and the Phase 5 tools: vocabulary (the market), grammar (the abbey,
  a green church), flashcards (the windmill's fields), review (the blacksmith) and the mock exam (the archery range).
  - **Look:** real 3D with three.js, not the 2.5D CSS engine. A camera looks down at the 2.5D scenes' angle (40°
    above the ground) and follows the traveller, at the same tile size as `VillageScene`. The land is raised tiles
    over a water plane, and the models stand in sunlight with real shadows
    (`components/world3d/`: `islandRenderer.ts` draws, `ground.ts` builds the land, `models.ts` loads models and
    animates people, and `IslandScene3D.tsx` is the React side, with the door prompt). The placement and camera
    maths are pure, in `lib/world/islandModels.ts`. Each model in `data/world/englishIsland.ts` is `place`d on the
    ground it covers (its footprint at one common scale, `TILES_PER_MODEL_UNIT` in `data/world/islandModelArt.ts`,
    with a `scale` for exceptions such as the castle). That ground becomes the layout's `obstacles`, so walking
    (`useWorldWalk`) is unchanged. Dark mode dims the sun and sky. If the browser can't draw WebGL, or the models
    fail to load, the page lists the doors as links instead.
  - **People:** the traveller is the KayKit Rogue, and other adventurers stand around the island as villagers, each
    blocking their tile. They share one set of animation clips (idle, walk, run, in `animations.glb`), played on
    each person's skeleton with three.js's `AnimationMixer`, and turn smoothly to face where they're going.
  - **Models:** all CC0 by Kay Lousberg (kaylousberg.com), free versions; no credit is required.
    - [KayKit Medieval Hexagon Pack](https://kaylousberg.itch.io/kaykit-medieval-hexagon): buildings, walls,
      fences, props, pointed trees.
    - [KayKit Forest Nature Pack](https://kaylousberg.itch.io/kaykit-forest): round trees, bushes, grass.
    - [KayKit Character Pack: Adventurers](https://kaylousberg.itch.io/kaykit-adventurers) and
      [KayKit Character Animations](https://kaylousberg.itch.io/kaykit-character-animations): the people.
  - **Committed:** the prepared models in `nihon-web/public/world/models/` (glTF with their textures, about
    4.4 MB), with their measured sizes in `data/world/modelSizes.json`.
  - **Adding models:** unpack each pack's zip into `.asset-sources/<pack>/extracted/` (git-ignored). For example,
    the medieval pack goes in `.asset-sources/kaykit-medieval-hexagon/extracted/`. List the model in
    `scripts/world-models/catalogue.ts`, then run at the repository root (it uses `three`, a root dev dependency, in
    headless Chrome to measure the models and gather the animation clips):
    `BROWSER_EXECUTABLE="C:/Program Files/Google/Chrome/Application/chrome.exe" node --experimental-strip-types scripts/world-models/prepare-models.ts`
  - Tests: `scripts/verify-english-island.mjs` checks the placement, turning and camera maths, and on the island:
    - no two models or people stand on the same ground, and no model stands in water or on a bridge;
    - every door can be walked to;
    - every model and person has been prepared.

- **Phase 5:** the study tools, each for the level chosen on `/levels` and, where it helps, one unit of it
  (`?unit=`). They reuse the lessons' own content (`lib/englishStudy.ts`); review lessons are left out, so each word
  and grammar point appears once, under the lesson that teaches it.
  - `/english/vocabulary`: every word, searchable in English or Vietnamese (tone marks optional), beside the chosen
    word in full. `/english/grammar`: every grammar point beside its explanation. On a phone the list and the chosen
    item take turns.
  - `/english/flashcards`: spaced repetition over the words of completed lessons. The cards share `srs_cards` with
    Japanese (ids `<lesson id>:<word>`); the SRS endpoints take `?course=english|japanese`, and each course has its
    own daily allowance of new cards.
  - `/english/review`: rounds of ten questions drawn from the practice and challenge questions of completed lessons
    and the meanings of their words; with All units it is the level's cumulative review. Wrong answers go to the
    mistake notebook.
  - `/english/grammar/summary`: every grammar point of the level, one unit per tab; printing prints the whole level.
  - `/english/listening` and `/english/speaking` (`lib/englishSkillRounds.ts`): words, example sentences and
    conversation exchanges of completed lessons, heard and said in British English. Speech is compared word by word
    after writing out contractions and small numbers and making American spellings British
    (`lib/englishSpeechMatch.ts`); 80% of the words, in order, counts as said. A finished round counts toward the
    streak (practice scope `english-<level>` or the unit id).
  - `/english/mock-exam`: a timed end-of-level exam (vocabulary, grammar, reading), open once the level's units are
    open. Sources are `docs/curriculum/english/<level>/mock-exam.ts`, built into `shared/course/english/mock-exams.json`
    by the importer; the server grades it again and saves the result. **Migration `039_english_mock_exams.sql`** lets
    `mock_exam_results` hold A2–C1 results: run `npm run migrate` in `nihon-api` before deploying.
  - English statistics (`/statistics/english`) show lessons and units done per level, flashcards and best mock exam
    scores.
  - `/dashboard` for English learners (`pages/english/EnglishDashboard.tsx`, `lib/englishDashboard.ts`): the study
    desk for learners who would rather study than walk the island. It shows the next lesson or unit test of the
    chosen level, today's plan (next step, flashcards when due, a review of the unit in progress, and listening or
    speaking on alternate days), progress figures and every study tool. On a phone, Today, Progress and Study tools
    are tabs. The great hall in the castle courtyard opens the level picker with `?next=/dashboard`, so choosing a
    level lands here.
  - `/mistakes` for English learners is the English mistake notebook: only mistakes from English lessons, reviews,
    unit tests and A2–C1 mock exams (`GET /mistakes?course=english`; the course is read from the mistake's key, see
    `ENGLISH_MISTAKE_KEY` in `mistake.repository.ts`), in the English study frame, with no weak-characters tab.
    Japanese learners see only Japanese mistakes; without `course` the API lists both.
  - Island doors: the bell tower (`tower_B`, standing in for a bell tower, since the packs have none) opens
    listening and speaking, which link to each other.
- **Scenes on foot** (`pages/english/EnglishTownPage.tsx`, walked with `components/englishTown/EnglishPlaceWalk`, as the
  island is):
  - `/english/castle`, the castle courtyard (`data/world/englishCourtyard.ts`), through the castle door: the great
    hall (choose your level, then the dashboard), the barracks (unit tests), the tower (statistics) and the training
    yard (mock exam), with Sir Edmund, the castle knight.
  - `/english/market-square` (`data/world/englishMarketSquare.ts`), at the east end of the island's shore lane: the
    tavern (games), the market stalls (vocabulary), the scribe's tent (grammar) and the stage (speaking), with Bran,
    Kit, Morwen and Wren.
  - The townsfolk (`lib/englishTown`) are the island's adventurers. Walk up and press E to hear their news from your
    English study, in English with Vietnamese: the next step (the knight), flashcards (Bran), listening and speaking
    (Wren), the daily goal and streak (Morwen), and messages and mistakes (Kit). A "!" marks news. They also give the
    day's errands, listed on the market square's board, and its eight banners turn from blue to gold as they get done,
    as the village square's lanterns light.
- **Admin lesson editing:** the lesson editor has a Japanese / English switch. English lessons are edited with
  English fields (each word's IPA, part of speech, Vietnamese, definition and example; examples and conversation in
  both languages; questions; grammar as JSON) and checked on the server by the English rules
  (`nihon-api/src/content/englishLessonContent.ts`). Published English edits reach the site with the Japanese ones
  (`/site/lesson-edits` → `englishLessons`) and are applied when the English course loads. An export lists them, but
  English edits are copied into `docs/curriculum/english` by hand, then re-imported.

## Writing a unit

1. Copy the lesson keys and titles for the unit from `docs/curriculum/english/<level>/blueprint.ts`.
2. Write `docs/curriculum/english/<level>/unit-<n>.ts`, exporting `unit: UnitSource` (see `a2/unit-1.ts`).
3. Run `npm run course:import-english` at the repository root. It rebuilds the whole English course from its sources
   and writes nothing unless every unit passes:
   - `shared/course/english/units.json` and `lessons.json`;
   - `nihon-api/src/data/imported-english-assessments.json` (answer keys stay on the server).
4. Run the tests: `npm test` in `nihon-web` (`scripts/verify-english-course.mjs`) and in `nihon-api`
   (`scripts/test-english-course.cjs`).

## Not yet for English

- Nothing from the plan's phases. Later ideas: listening and speaking in English statistics, and a server-side English
  review bank.
