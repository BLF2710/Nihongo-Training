# Sequence diagrams to draw

12 diagrams for the most important flows of Lingora, in order of importance. Each one lists the use case it belongs
to, the participants (left to right), and the main messages taken from the actual code. Tick them off as you draw.

**PlantUML versions:** every diagram below has a ready file in [`sequence/`](sequence/) (`01-register-account.puml` …
`12-edit-and-publish-lesson.puml`). Each file lists its design patterns at the top and marks them in the diagram
(`«Unit of work»`, `«Observer»`, `«Adapter»` …). Preview them with the PlantUML extension in VS Code, then redraw in
Visual Paradigm.

**Lifelines use BCE stereotypes** (Visual Paradigm: Lifeline → Boundary / Control / Entity):

| Stereotype | Used for |
|---|---|
| **Actor** | People: Learner, Guest, Admin |
| **Boundary** | Screens (Web app, Admin web app) and outside services (Email service, Google, Azure Speech, AI service) |
| **Control** | Use-case logic: middleware chain, controllers, services, the SRS scheduler, live updates, and the adapter interfaces in front of outside services (`«interface» Mailer`, `GoogleTokenVerifier`, `PronunciationAssessor`, `SpeakingContentGrader`, `AssistantProvider`) |
| **Entity** | Stored data: Repository (and the rate-limit / nonce store) |
| **Database** | Database (its own symbol) |

Usual order, left to right: `Actor` → `Web app` → controller → services → `Repository` → `Database` → outside services.
Merge a controller and its service into one control box if a diagram gets too wide.

**Tips**
- Use `alt` for either/or (e.g. password vs Google, passed vs failed) and `opt` for optional steps (the «extend» cases).
- Errors can be one `alt` branch at the end ("invalid → 400 message shown"), not a separate diagram.
- Every API call goes through *authenticate* (checks the sign-in token) first; draw it once as a note, not on every arrow.

---

## Design patterns in the project, and where to show them

Draw the pattern's participants as their own lifelines (e.g. `«interface» Mailer` → `SmtpMailer`), so the pattern is
visible in the diagram. Files are in `nihon-api/src` unless noted.

| Pattern | Where in the code | What it does | Show it in diagram |
|---|---|---|---|
| **Strategy** + **Adapter** | `services/assistant-providers.ts` (`AssistantProvider`: `claudeProvider`, `courseHelperProvider`; `activeProvider()` picks one) | The assistant answers with Claude when configured, otherwise with the built-in helper; same call either way | **8** Chat with the assistant |
| **Adapter** + **Dependency injection** | `services/speaking/` (`PronunciationAssessor` → `AzurePronunciationAssessor`; `SpeakingContentGrader` → `ClaudeContentGrader`; injected by `createSpeakingTestService`) | Azure and Claude are wrapped behind our own interfaces; the test service doesn't know which company answers | **7** Take speaking test |
| **Strategy** + **Factory** + **DI** | `services/mail/mailer.ts` (`Mailer`: `SmtpMailer`, `ConsoleMailer`, `MemoryMailer`; `mailerFromConfig()`), injected into `createAccountSecurityService` | Real email in production, printed to the console in development, kept in memory in tests | **1** Register, **3** Reset password |
| **Adapter** + **DI** | `services/google/` (`GoogleTokenVerifier` → `GoogleLibraryVerifier`, injected into `createGoogleSignInService`) | Google's library behind our interface (tests use a fake) | **2** Log in (Google branch) |
| **Abstract factory** / **Strategy** | `shared-state/index.ts` (`sharedState()` builds `RateLimitStore`, `NonceStore`, `RealtimeBus` — Memory or Postgres versions, chosen by `SHARED_STATE`) | One API process keeps them in memory; several processes share them through PostgreSQL | **2** Log in (rate limit, nonce) |
| **Observer** (publish/subscribe) | `services/realtime.service.ts` `publish()` → `RealtimeBus` (PostgreSQL `LISTEN/NOTIFY`) → open event streams → web `lib/realtime.ts` `useRealtime` | A change for a learner reaches every open tab, whichever API process holds it | **4** Take a lesson and **6** Daily review (achievement / level-up notifications), **9** Add friend, **10** Message, **11** Report |
| **Repository** | `repositories/*.repository.ts` | All SQL lives here; services never write queries | Every diagram (the *Repository* lifeline) |
| **Unit of work** | `db/transaction.ts` `withTransaction()` | Several writes succeed or fail together (BEGIN / COMMIT / ROLLBACK) | **1** Register, **3** Reset password, **6** Grade a review card, **7** Save a speaking attempt, **11** Resolve reports, **12** Publish lesson (also each XP award in **4**, **5**) |
| **Chain of responsibility** | Express middleware: security headers → CORS → `authenticate` → `rateLimit` → `requireAdmin` / content availability → controller | Each step may stop the request (401, 429, 403) or pass it on | **2** Log in (draw the chain once) |
| **Decorator** | `utils/action.ts` `action()` wraps every controller | Adds the same error handling to all controllers (typed errors → status + message, others → logged 500) | Note on any diagram |
| **Strategy** (image) | `services/images/avatar-processor.ts` (`AvatarProcessor` → `sharpAvatarProcessor`) | Image re-encoding behind an interface | Optional extra: *Upload profile picture* |
| **Observer** (web) | `nihon-web/src/lib/userAvatar.ts`, `lib/userHandle.ts` (`useSyncExternalStore` stores) | Header and pages update together when the picture or username changes | Optional extra: *Upload profile picture* |

**Best five for showing patterns** (if you only draw a few): **2** Log in (chain of responsibility, adapter, shared
state), **7** Speaking test (adapter + DI), **8** Assistant (strategy), **9** Add friend (observer), **3** Reset
password (strategy mailer + unit of work).

---

## 1. [ ] Register account (+ confirm email)
**Use case:** Register account (Authenticate account) · **Actor:** Guest
**Participants:** Guest *(actor)*, Web app *(boundary)*, Middleware chain *(control)*, Auth controller *(control)*, Auth service *(control)*, Account security service *(control)*, «interface» Mailer *(control)*, Repository *(entity)*, Database *(database)*, Email service *(boundary)*
**File:** [`01-register-account.puml`](sequence/01-register-account.puml)

1. Guest fills in username, email, password → Web app → `POST /api/auth/register`
2. Rate limit checked (10 registrations per hour per network)
3. Auth service: registration open? → validate input → find existing email / username (Database)
4. `alt` already used → 400 "Email/Username already exists"
5. Hash the password (bcrypt) → create account + profile in one transaction (Database)
6. Send confirmation email: create link token (Database) → Email service sends the link
7. Return session token → Web app stores it and opens the dashboard
8. *Later:* Guest opens the link → `POST /api/auth/email/verify` → token checked and used once → address marked confirmed

## 2. [ ] Log in (password or Google)
**Use case:** Log in, «extend» Log in with Google · **Actor:** Guest
**Participants:** Guest *(actor)*, Web app *(boundary)*, Middleware chain *(control)*, «interface» RateLimitStore / NonceStore *(entity)*, Auth controller *(control)*, Auth service *(control)*, «interface» GoogleTokenVerifier *(control)*, Repository *(entity)*, Database *(database)*, Google *(boundary)*
**File:** [`02-log-in.puml`](sequence/02-log-in.puml)

`alt` **password**
1. Guest enters username/email + password → `POST /api/auth/login`
2. Rate limit (per account and per network)
3. Find user (Database) → `alt` not found / wrong password → 401; `alt` suspended → 403
4. Compare password (bcrypt) → record last login → create session token (with the account's token version)
5. Web app stores the token → admin goes to /admin, learner to the dashboard

`alt` **Google**
1. Web app → `GET /api/auth/google/nonce` (one-time value)
2. Guest chooses an account in Google's window → Google returns an ID token
3. `POST /api/auth/google` → verify the token with Google's keys and the nonce (used once)
4. `alt` linked account → sign in; `alt` new email → registration open? → create account (no password)
5. Return session token (as above)

## 3. [ ] Forgot / reset password
**Use case:** Forgot password · **Actors:** Guest (or Admin, who can send the same link from Users & roles)
**Participants:** Guest *(actor)*, Web app *(boundary)*, Auth controller *(control)*, Account security service *(control)*, «interface» Mailer *(control)*, Repository *(entity)*, Database *(database)*, Email service *(boundary)*
**File:** [`03-reset-password.puml`](sequence/03-reset-password.puml)

1. Guest enters their email → `POST /api/auth/password/forgot`
2. `opt` the address belongs to an active account (and fewer than the hourly limit): create reset token (Database) → Email service sends the link
3. Always the same answer ("If an account uses that address…") so nobody can test which emails exist
4. Guest opens the link → enters a new password → `POST /api/auth/password/reset`
5. Token checked (valid, not used, not expired) → hash and save the password → **every session ends** (token version +1) → address counts as confirmed
6. Web app sends them to sign in

## 4. [ ] Take a lesson
**Use case:** Take a lesson (Learn Japanese) · **Actor:** Learner
**Participants:** Learner *(actor)*, Web app *(boundary)*, Lesson controller *(control)*, Lesson-completion service *(control)*, XP service *(control)*, Gamification service *(control)*, Repository *(entity)*, Database *(database)*, Notification (realtime) *(control)*
**File:** [`04-take-a-lesson.puml`](sequence/04-take-a-lesson.puml)

1. Learner opens a lesson → Web app loads the lesson's content (its unit's file, plus any published admin edit)
2. `GET /api/lessons/:lessonId/access` → previous lesson done and unit unlocked? → `alt` locked → "Lesson locked"
3. Learner goes through the steps (vocabulary, concept, conversation, practice, challenge) in the browser
4. Finish → `POST /api/lessons/:lessonId/complete` with the challenge score
5. Save the score → **Unit of work** `awardXP()`: lesson XP (50, once per lesson) + streak day → `opt` perfect score → 25 more XP
6. Gamification service checks achievements → each new one pays its XP and sends a notification → `opt` new level → level-up notification
7. Notifications are **published** to the learner's open tabs (Observer: the bell updates)
8. Web app shows the "+XP" pop-up, level up / achievement; wrong challenge answers go to the mistake notebook

## 5. [ ] Take unit assessment
**Use case:** Take unit assessment (Practice) · **Actor:** Learner
**Participants:** Learner *(actor)*, Web app *(boundary)*, Unit controller *(control)*, Assessment service *(control)*, Gamification service *(control)*, Repository *(entity)*, Database *(database)*
**File:** [`05-take-unit-assessment.puml`](sequence/05-take-unit-assessment.puml)

1. `GET /api/units/:unitId/assessment` → unit unlocked and all six lessons done? → `alt` no → 403
2. Return the 15 questions **without the answers**
3. Learner answers → `POST /api/units/:unitId/assessment` with the answers
4. Grade on the server → accuracy, passed (80%)
5. Save the attempt (best score kept; a pass is never lost to a later fail)
6. Wrong answers → mistake notebook; streak day recorded
7. `opt` passed → reward: 100 XP once per unit (**Unit of work** `awardXP()`) → achievements checked (e.g. Japanese Beginner)
8. `alt` passed → next unit unlocks, "+XP"; `alt` failed → shows what to review

## 6. [ ] Daily review (spaced repetition)
**Use case:** Daily review (Practice) · **Actor:** Learner
**Participants:** Learner *(actor)*, Web app *(boundary)*, SRS controller *(control)*, SRS service *(control)*, SRS scheduler (SM-2) *(control)*, Gamification service *(control)*, Repository *(entity)*, Database *(database)*, Notification (realtime) *(control)*
**File:** [`06-daily-review.puml`](sequence/06-daily-review.puml)

1. Learner opens Daily review → Web app `GET /api/units` → finished lessons
2. `opt` the finished lessons changed since last time: `POST /api/srs/cards` (their words and kanji) → Repository adds only cards not in the deck yet
3. `GET /api/srs/queue` → Repository: due cards (earliest first) + up to **5 new cards** today; hidden cards left out
4. Loop for each card:
   1. Learner reveals the answer and grades it: Again / Hard / Good / Easy
   2. `POST /api/srs/reviews` (card, grade)
   3. **Unit of work** (one transaction): lock the card → SRS scheduler (SM-2, pure function) calculates the next interval, ease and due date → save card + review → record the streak day → commit
   4. Gamification service: pay **2 XP** (daily limit 60) → check achievements (e.g. Review Rookie) → `opt` level up: notification saved and **published** to the learner's open tabs (bell updates)
   5. Response → Web app shows the "+XP" pop-up; `alt` graded Again: the card is added again at the end of the session
5. `opt` Learner hides the card instead of grading it: `PATCH /api/srs/cards/:type/:id` → card left out of reviews, kept in the deck
6. Queue empty → "All done for today"; `opt` cards due within 24 h: Learner chooses **Review ahead** → `GET /api/srs/queue?ahead=1` → same loop, reviews sent with `ahead: true`

Patterns to show: **Repository**, **Unit of work** (step 4.3), **Observer** (step 4.4, level-up notification), the scheduler as a pure domain function (no database or clock inside it). Too wide? Split it: (a) session and grading, (b) the reward chain (XP → achievements → notification).

## 7. [ ] Take speaking test
**Use case:** Take speaking test (Practice) · **Actor:** Learner · **Secondary:** Azure Speech, AI service
**Participants:** Learner *(actor)*, Web app *(boundary)*, Speaking controller *(control)*, Speaking test service *(control)*, «interface» PronunciationAssessor *(control)*, «interface» SpeakingContentGrader *(control)*, Repository *(entity)*, Database *(database)*, Azure Speech *(boundary)*, AI service (Claude) *(boundary)*
**File:** [`07-take-speaking-test.puml`](sequence/07-take-speaking-test.puml)

1. Learner (N3+) picks a task → records their answer in the browser
2. `POST /api/speaking-tests/tasks/:taskId/attempts` with the recording
3. Level reached? Daily limit not used up? → `alt` no → 403 / 429
4. **Azure Speech**: transcript + pronunciation / fluency scores (`opt` only when configured)
5. **AI service**: content grade of the transcript against the task (`opt` only when configured)
6. Combine into a score and band → **Unit of work**: save the attempt (transcript and scores only, **never the recording**) + streak day
7. Reward: speaking test XP → Web app shows the result, feedback and "+XP"

## 8. [ ] Chat with the study assistant
**Use case:** Chat with the study assistant (Communicate) · **Actor:** Learner · **Secondary:** AI service
**Participants:** Learner *(actor)*, Web app *(boundary)*, Communication controller *(control)*, Assistant service *(control)*, «interface» AssistantProvider *(control)*, Repository *(entity)*, Database *(database)*, AI service (Claude) *(boundary)*
**File:** [`08-chat-with-assistant.puml`](sequence/08-chat-with-assistant.puml)

1. Learner types a question → `POST /api/assistant/messages`
2. Hourly limit checked → load the conversation's recent messages (Database)
3. AI service answers (with the learner's name and level; `alt` not configured → basic built-in answers)
4. Save the question and the answer in one transaction (new conversation if none yet)
5. Web app shows the answer

## 9. [ ] Add friend (request → accept)
**Use case:** Add friend (Communicate) · **Actors:** Learner A, Learner B
**Participants:** Learner A *(actor)*, Web app A *(boundary)*, Friend controller *(control)*, Friend service *(control)*, Repository *(entity)*, Database *(database)*, Live updates (RealtimeBus) *(control)*, Web app B *(boundary)*, Learner B *(actor)*
**File:** [`09-add-friend.puml`](sequence/09-add-friend.puml)

1. A enters B's username → `POST /api/friends/requests`
2. B exists, not blocked, accepts requests? Limits OK? → save pending request + notification for B
3. Live updates → B's web app shows the request at once (bell count)
4. B accepts → `PUT /api/friends/requests/:id` → status accepted + notification for A
5. Live updates → A sees "You and B are now friends" → friend achievements checked for both (Study Buddy)
6. `alt` B declines → request removed from A's list (A isn't told)

## 10. [ ] Send a message to a learner
**Use case:** View conversations, «extend» Message a learner (Communicate) · **Actors:** Learner A, Learner B
**Participants:** Learner A *(actor)*, Web app A *(boundary)*, Communication controller *(control)*, Direct-message service *(control)*, Repository *(entity)*, Database *(database)*, Live updates (RealtimeBus) *(control)*, Web app B *(boundary)*, Learner B *(actor)*
**File:** [`10-send-message.puml`](sequence/10-send-message.puml)

1. A opens a conversation with B → `POST /api/messages/conversations` (one per pair; reused if it exists)
2. A sends → `POST /api/messages/conversations/:id/messages`
3. Rate limit → blocked either way? → `alt` blocked → 403
4. Save the message → Live updates → B's inbox shows it (unread count)
5. `opt` B reports the message → support request for the admins (see 11)

## 11. [ ] Report a learner → admin resolves
**Use case:** Report learner (Communicate) + Review reports (Manage users) · **Actors:** Learner, Admin
**Participants:** Learner *(actor)*, Web app *(boundary)*, Friend controller *(control)*, Moderation service *(control)*, Repository *(entity)*, Database *(database)*, Live updates (RealtimeBus) *(control)*, Admin web app *(boundary)*, Admin *(actor)*
**File:** [`11-report-and-resolve.puml`](sequence/11-report-and-resolve.puml)

1. Learner reports B from B's profile → `POST /api/people/:username/report` (reason required, 10 a day)
2. `alt` an open report by the same learner exists → added to that support request; `else` new support request + report
3. Admin opens Reports → `GET /api/admin/reports` → reports grouped per learner (flagged when 3+ learners report)
4. Admin chooses → `POST /api/admin/reports/:userId/resolve`
   - `alt` dismiss · `alt` warn (the warning goes to B as a support message) · `alt` suspend (B's account suspended)
5. Every reporter gets a reply and their request closes → audit log entry

## 12. [ ] Edit and publish a lesson (admin)
**Use case:** Edit lessons (Manage content) · **Actor:** Admin
**Participants:** Admin *(actor)*, Admin web app *(boundary)*, Moderation controller *(control)*, Lesson-edit service *(control)*, Repository *(entity)*, Database *(database)*, Learner's web app *(boundary)*, Learner *(actor)*
**File:** [`12-edit-and-publish-lesson.puml`](sequence/12-edit-and-publish-lesson.puml)

1. Admin opens Content → Lesson editor → a lesson → loads the course version + any draft/published edit
2. Edits → `PUT /api/admin/lessons/:lessonId/draft` → validated → `alt` problems → every problem listed
3. Publish → `POST /api/admin/lessons/:lessonId/publish` → draft becomes the published version → audit log entry
4. A learner opens the site → `GET /api/site/lesson-edits` → published edits applied to every page
5. `opt` Restore original → `DELETE /api/admin/lessons/:lessonId/published`

---

### Optional extras
- [ ] Admin manages a user (edit role / suspend, audit log)
- [ ] Admin turns a feature off (Content → Availability) and a learner sees "temporarily unavailable"
- [ ] Learner views statistics (overview loaded once, tabs)
