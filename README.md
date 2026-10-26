# NihonWeb

A language-learning website with a Japanese N5 course, Kana learning tools, practice games, and learner progression.

## Implemented

These features exist in the repository; this is not a claim that every edge case has been tested.

- [x] User registration, login, profiles, and learning settings.
- [x] Centralized XP, levels, ranks, and achievement infrastructure.
- [x] Unit 1: six lessons, practice questions, lesson challenges, prerequisites, and saved completion.
- [x] Unit chooser, progress display, and lock reasons.
- [x] Unit 1 assessment: 15 questions, 80% passing score, and saved passes that survive failed retakes.
- [x] Units 2 and 3: six lessons each, vocabulary/grammar references, and unit assessments with level AND previous-unit completion requirements.
- [x] Unit 1 vocabulary and grammar references for Lessons 1–5.
- [x] Vocabulary list and flashcards with lesson filters and shuffle.
- [x] Hiragana and Katakana learning pages with pronunciation, stroke-order viewing, and writing practice.
- [x] Hiragana and Katakana Speed Quizzes and character-performance statistics.
- [x] Kana Review sessions using the existing character-statistics system.
- [x] Course-linked Kanji reference, search/filters, per-user progress, shared flashcards, KanjiVG stroke animation, and meaning/reading/vocabulary practice (10 verified characters).
- [x] Dashboard and English game section.
- [x] Messages between learners (by exact username, with block and report), Help & support requests with an admin support inbox, and a study assistant chat (migration `011_communication.sql`).

### Study assistant configuration

The study assistant answers through a provider chosen by environment variables in `nihon-api/.env`:

| Variable | Effect |
| --- | --- |
| `ANTHROPIC_API_KEY` | When set, the assistant uses Claude. Without it, the offline course helper answers by searching lesson vocabulary and grammar. |
| `ASSISTANT_PROVIDER` | `claude` or `course` to force a provider. |
| `ASSISTANT_MODEL` | Claude model id; defaults to `claude-opus-5-5`. |

Each learner can send 40 assistant messages per hour. Administrators can switch Messages and the study assistant off under Manage content; Help & support always stays open.

### Speaking test configuration (N3 and above)

The speaking test grades free answers and read-aloud as described in [GRADING.md](GRADING.md). Both services are optional; the test says what it can grade without them.

| Variable | Effect |
| --- | --- |
| `AZURE_SPEECH_KEY` | Azure Speech resource key. With the endpoint below, recordings are sent to Azure for pronunciation, fluency and (read-aloud) completeness scores. Without them, the browser's speech recognition provides the transcript and delivery isn't scored. |
| `AZURE_SPEECH_ENDPOINT` | The resource's short-audio recognition URL, e.g. `https://<resource>.cognitiveservices.azure.com/stt/speech/recognition/conversation/cognitiveservices/v1`. |
| `SPEAKING_GRADER` | `claude` or `off`. By default the AI grades content whenever the assistant would use Claude (`ANTHROPIC_API_KEY` set). Without it, only read-aloud tasks can be graded. |
| `SPEAKING_GRADER_MODEL` | Claude model id for grading; defaults to `claude-opus-5-5`. |

Each learner can have 30 answers graded per day. Recordings are never stored.

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
- [x] Daily learning streaks: graded learning work counts, in the learner's time zone (migration `012_learning_streaks.sql`).
- [x] Finished listening, speaking, reading and mock-exam sessions count toward the streak (`POST /api/activity/practice`, migration `013_practice_sessions.sql`).
- [x] Admin overview learning analytics: active learners, daily actives, unit funnels and pass rates, drop-off points, practice volume (`GET /api/admin/analytics`).
- [x] Light-theme contrast meets WCAG AA (overrides at the end of `src/index.css`).
- [ ] Connect the existing daily-goal setting to meaningful daily activity tracking; avoid rewarding idle time or repeated clicks.
- [x] Add a persisted light/dark/system theme (`src/lib/theme.ts`; colours from `scripts/build-dark-palette.mjs`).

### 4. Expand the course deliberately

- [ ] Have a Japanese teacher review the adapted Unit 2/3 curriculum, examples, and assessment distractors.
- [ ] Gather learner feedback on the difficulty and pacing of Units 2–3 before planning further units.
- [ ] Keep placeholder lessons and assessments non-playable and excluded from completion until real content is ready.
- [ ] Expand Kanji only with reviewed course vocabulary and verified stroke assets; preserve source attribution.
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
npm run test:grading
```

Additional verification scripts live in each project's `scripts` directory. Some need a configured database or browser; check their setup requirements before running them. Backend `npm test` is currently a placeholder.

See [unit progression documentation](nihon-api/UNIT-PROGRESSION.md) for the unit rules.
