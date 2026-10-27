# NihonWeb

A language-learning website with a Japanese N5–N4 course, Kana learning tools, practice games, and learner progression.

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
- [x] Learning records (migration `020_learning_records.sql`):
  - **Daily review** (`/srs`): spaced repetition (SM-2 style: Again / Hard / Good / Easy) for the words and kanji of completed lessons, at most 20 new cards a day, with a "due today" tile on the dashboard. The scheduler is pure (`nihon-api/src/learning/srsScheduler.ts`).
  - **Mistake notebook** (`/mistakes`): wrong answers from lesson challenges, unit reviews, assessments and mock exams; cleared after two right answers in a row. An assessment's right answers stay hidden (and can't be practised) until the learner passes it.
  - **Mock exams** are graded and saved on the server, with history; they count as practice and toward the streak.
  - **Daily goal**: active study time on learning pages (visible page, input in the last 90 s), reported about once a minute; the server never credits more than the time that really passed. Shown against the goal in Settings.
  - **Statistics overview**: study time, lessons per week, assessments, kanji mastery, reviews, mistakes, mock exams, practice and speaking results.
- [x] Unit reviews use only the question bank, never the unit assessment's questions.
- [x] N4 complete: 9 units (54 lessons, 147 new kanji, 250 in the course), unit assessments, an N4 mock exam and a review question bank (migration `021_n4_review_bank.sql`). Sources live in `docs/curriculum/n4/sources/`; listening, speaking and reading practice come from the lessons.

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

### Accounts and security configuration

Copy `nihon-api/.env.example` to `nihon-api/.env` (and, for a deployed web app, `nihon-web/.env.example` to `nihon-web/.env`). `.env` files are never committed.

| Variable | Effect |
| --- | --- |
| `PORT` | API port (default 5000). |
| `CORS_ORIGINS` | Comma-separated web app address(es) allowed to call the API from a browser. Required in production; local Vite addresses in development. |
| `APP_URL` | The web app's address, used in links sent by email (default `http://localhost:5173`). |
| `TRUST_PROXY` | Number of proxies in front of the API, so rate limits see the real client address (default 0). |
| `JWT_SECRET` | Signs sign-in tokens; a long random value. Changing it signs everyone out. |
| `SMTP_URL`, `MAIL_FROM` | Email for password reset and confirmation, e.g. `smtps://user:password@smtp.example.com:465`. Without `SMTP_URL`, emails are printed to the API console (development only); production refuses to start without it. |
| `VITE_API_URL` (web) | The API's address for a deployed build, e.g. `https://api.example.com/api`. |
| `GOOGLE_CLIENT_ID` | Turns on "Continue with Google" (sign-in, registration and Settings). The web app reads it from the public site settings, so it's set only here. |

What's in place:

- **Sessions are revocable.** Every token carries the account's token version. Changing or resetting the password, or *Sign out on all devices* (Profile → Settings → Account security), raises it, so every older token stops working and live connections close. A browser holding a revoked token is signed out with an explanation.
- **Password reset and email confirmation** use single-use links (1 hour and 48 hours) stored only as SHA-256 hashes. The reset form answers the same way whether or not an address has an account. A reset also confirms the address. Unconfirmed accounts can use the site; a dashboard banner offers to resend the link.
- **Rate limits:** sign-in 10 tries per account and 50 per address every 15 minutes; registration 10 per hour per address; reset requests and link use limited per address, and at most 3 emails an hour per account. Limits are kept in the API process (several processes would need a shared store such as Redis).
- **CORS** only allows the configured web app address(es). **Security headers** on API responses: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, a deny-all `Content-Security-Policy`, `Permissions-Policy`, and HSTS in production.
- **Sign in with Google** checks Google's ID token with Google's library (signature, this app as audience, issuer, expiry, at most 1 hour) and requires a one-time nonce from the API inside it, so a captured token can't be replayed. Accounts are matched by Google's permanent account id, never by email. An existing account with the same email is linked automatically only when Google confirmed the address and the account's own email is confirmed, and never for administrators; otherwise the learner signs in with the password and connects Google in Settings. Google can only be disconnected while the account also has a password; Google-only accounts add one through *Forgot password*.
- **Setting up Google sign-in:** in Google Cloud Console, configure the OAuth consent screen (app name, support email; a privacy policy URL before going public), then *Credentials → Create credentials → OAuth client ID → Web application*. Under *Authorized JavaScript origins* add the web app's addresses (for local development both `http://localhost` and `http://localhost:5173`). No redirect URI is needed (the button uses a popup). Put the client id in `GOOGLE_CLIENT_ID` and restart the API.
- **The web app's own headers** come from whatever hosts the built files. Set at least `Content-Security-Policy` (the theme script in `index.html` is inline, so allow it by hash), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` allowing `microphone=(self)`, and HSTS. For Google sign-in the policy must allow `https://accounts.google.com/gsi/client` (script), `https://accounts.google.com/gsi/` (frame and connect) and `https://accounts.google.com/gsi/style` (style), and a `Cross-Origin-Opener-Policy` header, if any, must be `same-origin-allow-popups`.

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
npm run test:auth
npm run test:learning
```

Additional verification scripts live in each project's `scripts` directory. Some need a configured database or browser; check their setup requirements before running them. Backend `npm test` is currently a placeholder.

See [unit progression documentation](nihon-api/UNIT-PROGRESSION.md) for the unit rules.
