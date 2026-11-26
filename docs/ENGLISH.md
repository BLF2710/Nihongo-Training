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
- **Phase 4, started:** the English Isle on foot is the English learner's home page (`/`, which `pages/HomePage.tsx`
  sends to `pages/EnglishIslandPage.tsx`; also at `/english/island`; data in `data/world/englishIsland.ts`). Its doors
  open the level picker (castle), English statistics (watchtower), lessons (church school) and the arcade (tavern),
  everything the old English home page linked to. Still to come: the rest of the island's places (market town,
  fields, abbey) and the Phase 5 tools they'll open.
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

These are Phase 5:
- vocabulary and grammar reference pages;
- the SRS deck;
- the review bank;
- mock exams;
- the dashboard and statistics.

Lesson editing in the admin area also accepts only the Japanese lesson format so far.
