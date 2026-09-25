# NihonWeb

A language-learning website with a Japanese N5 course, Kana learning tools, practice games, and learner progression.

## Implemented

These features exist in the repository; this is not a claim that every edge case has been tested.

- [x] User registration, login, profiles, and learning settings.
- [x] Centralized XP, levels, ranks, and achievement infrastructure.
- [x] Unit 1: six lessons, practice questions, lesson challenges, prerequisites, and saved completion.
- [x] Unit chooser, progress display, and lock reasons.
- [x] Unit 1 assessment: 15 questions, 80% passing score, and saved passes that survive failed retakes.
- [x] Unit 2 and Unit 3 placeholders with level AND previous-unit completion requirements.
- [x] Unit 1 vocabulary and grammar references for Lessons 1–5.
- [x] Vocabulary list and flashcards with lesson filters and shuffle.
- [x] Hiragana and Katakana learning pages with pronunciation, stroke-order viewing, and writing practice.
- [x] Hiragana and Katakana Speed Quizzes and character-performance statistics.
- [x] Kana Review sessions using the existing character-statistics system.
- [x] Dashboard and English game section.

## Prioritized to-do list

### 1. Reliability and release readiness

- [ ] Put existing verification scripts behind documented test commands; replace the backend's placeholder `npm test`.
- [ ] Add CI checks for frontend lint/build, backend type checking, and automated tests.
- [ ] Update navigation tests for the unit chooser and unit-specific return links, including refresh and direct URLs.
- [ ] Add regression tests for duplicate XP requests, concurrent submissions, locked lesson access, assessment scoring, and failed retakes after passing.
- [ ] Verify progress across refresh, logout/login, and multiple devices; keep the backend authoritative.
- [ ] Test failed saves, slow networks, and retries without losing answers or silently marking work complete.
- [ ] Audit account authorization, input validation, authentication rate limiting, and session expiry.
- [ ] Document environment variables with safe examples, local setup, migrations, and database backup/restore procedures.
- [ ] Review credentials previously included in documentation; rotate any real exposed credentials and assess Git history separately.

### 2. Finish the Unit 1 learning experience

- [ ] Review all six lessons and the assessment for natural Japanese, accurate readings/translations, and unambiguous answers.
- [ ] Extend vocabulary and grammar references to Lesson 6 using its actual content.
- [ ] Review assessment feedback so learners understand mistakes and can revisit the relevant lesson.
- [ ] Check that prerequisites and available XP provide a smooth path without progression dead ends.
- [ ] Audit Kana examples and verified stroke-data coverage, including compound Katakana; retain honest unsupported states and attribution.
- [ ] Verify pronunciation support and graceful fallback across browsers and devices.

### 3. Usability and accessibility

- [ ] Test the learning flow on desktop, tablet, and mobile, including long Japanese text.
- [ ] Audit keyboard navigation, focus indicators, screen-reader labels, contrast, and reduced-motion support.
- [ ] Test writing practice with mouse, touch, and stylus, including resizing without misaligned strokes.
- [ ] Add optional Kana row/group selection to the existing Speed Quiz without duplicating data or statistics.
- [ ] Clarify session answer streaks versus daily learning streaks; add personal-best displays using existing records where available.
- [ ] Connect the existing daily-goal setting to meaningful daily activity tracking; avoid rewarding idle time or repeated clicks.
- [ ] Add a persisted light/dark/system theme after core flows are stable.

### 4. Expand the course deliberately

- [ ] Define Unit 2 objectives and prerequisites before replacing its placeholder with reviewed lessons, references, and an assessment.
- [ ] Develop Unit 3 after Unit 2, using the same data-driven architecture.
- [ ] Keep placeholder lessons and assessments non-playable and excluded from completion until real content is ready.
- [ ] Plan introductory N5 Kanji learning with verified readings, examples, and stroke data.
- [ ] Add listening and reading practice tied to taught material, with real audio or clearly identified supported TTS.

### 5. Later enhancements

- [ ] Design vocabulary practice and spaced repetition after defining learning outcomes and persistence rules.
- [ ] Consider additional question types within the existing Review architecture.
- [ ] Evaluate password recovery and email verification against existing authentication and email infrastructure.
- [ ] Document deployment, monitoring, error reporting, and recovery procedures before public release.

## Development guardrails

- Reuse authentication, XP, levels, lesson progression, and quiz systems.
- Keep Kana learning separate from game accuracy/mastery statistics.
- Review answers must continue updating the same character statistics as Speed Quiz.
- Do not award automatic XP or mastery for vocabulary/grammar browsing or flashcards.
- Unit unlocking requires BOTH the required level and previous-unit completion.
- Preserve successful assessments across failed retakes and existing user data across migrations.
- Do not invent stroke paths, audio, or placeholder educational content.
- Community, messaging, social feeds, and notifications are outside the current roadmap.

## Project checks

Run from `nihon-web`:

```sh
npm run lint
npm run build
```

The frontend build includes TypeScript checking.

Run from `nihon-api`:

```sh
npm run typecheck
```

Additional verification scripts live in each project's `scripts` directory. Some need a configured database or browser; check their setup requirements before running them. Backend `npm test` is currently a placeholder.

See [unit progression documentation](nihon-api/UNIT-PROGRESSION.md) for the unit rules.
