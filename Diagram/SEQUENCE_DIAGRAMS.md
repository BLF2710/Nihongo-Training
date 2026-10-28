# Sequence diagrams to draw

12 diagrams for the most important flows of Lingora, in order of importance. Each one lists the use case it belongs
to, the participants (left to right), and the main messages taken from the actual code. Tick them off as you draw.

**Participants used throughout** (merge Controller + Service into one box if a diagram gets too wide):

`Actor (Learner / Guest / Admin)` → `Web app` → `API controller` → `Service` → `Repository` → `Database` → external systems (`Google`, `Email service`, `Azure Speech`, `AI service`)

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
| **Observer** (publish/subscribe) | `services/realtime.service.ts` `publish()` → `RealtimeBus` (PostgreSQL `LISTEN/NOTIFY`) → open event streams → web `lib/realtime.ts` `useRealtime` | A change for a learner reaches every open tab, whichever API process holds it | **9** Add friend, **10** Message, **11** Report |
| **Repository** | `repositories/*.repository.ts` | All SQL lives here; services never write queries | Every diagram (the *Repository* lifeline) |
| **Unit of work** | `db/transaction.ts` `withTransaction()` | Several writes succeed or fail together (BEGIN / COMMIT / ROLLBACK) | **1** Register, **11** Resolve reports, **12** Publish lesson |
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
**Participants:** Guest, Web app, Auth controller, Auth service, User repository, Database, Email service

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
**Participants:** Guest, Web app, Auth controller, Auth service, User repository, Database, Google

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
**Participants:** Guest, Web app, Auth controller, Account security service, Token repository, Database, Email service

1. Guest enters their email → `POST /api/auth/password/forgot`
2. `opt` the address belongs to an active account (and fewer than the hourly limit): create reset token (Database) → Email service sends the link
3. Always the same answer ("If an account uses that address…") so nobody can test which emails exist
4. Guest opens the link → enters a new password → `POST /api/auth/password/reset`
5. Token checked (valid, not used, not expired) → hash and save the password → **every session ends** (token version +1) → address counts as confirmed
6. Web app sends them to sign in

## 4. [ ] Take a lesson
**Use case:** Take a lesson (Learn Japanese) · **Actor:** Learner
**Participants:** Learner, Web app, Lesson controller, Lesson service, Lesson-completion service, XP service, Database

1. Learner opens a lesson → Web app loads the lesson's content (its unit's file, plus any published admin edit)
2. `GET /api/lessons/:lessonId/access` → previous lesson done and unit unlocked? → `alt` locked → "Lesson locked"
3. Learner goes through the steps (vocabulary, concept, conversation, practice, challenge) in the browser
4. Finish → `POST /api/lessons/:lessonId/complete` with the challenge score
5. Save the score → award lesson XP (once per lesson) → `opt` perfect score → extra XP
6. Streak day recorded → `opt` achievement earned → notification
7. Web app shows XP / level-up / achievement; wrong challenge answers go to the mistake notebook

## 5. [ ] Take unit assessment
**Use case:** Take unit assessment (Practice) · **Actor:** Learner
**Participants:** Learner, Web app, Unit controller, Assessment service, Assessment repository, Database

1. `GET /api/units/:unitId/assessment` → unit unlocked and all six lessons done? → `alt` no → 403
2. Return the 15 questions **without the answers**
3. Learner answers → `POST /api/units/:unitId/assessment` with the answers
4. Grade on the server → accuracy, passed (80%)
5. Save the attempt (best score kept; a pass is never lost to a later fail)
6. Wrong answers → mistake notebook; streak day recorded
7. `alt` passed → next unit unlocks; `alt` failed → shows what to review

## 6. [ ] Daily review (spaced repetition)
**Use case:** Daily review (Practice) · **Actor:** Learner
**Participants:** Learner, Web app, SRS controller, SRS service, SRS scheduler, Database

1. `GET /api/srs/queue` → cards due now + up to 20 new cards today (Database)
2. Learner reveals the answer and grades it: Again / Hard / Good / Easy
3. `POST /api/srs/reviews` (card, grade)
4. SRS scheduler (SM-2) calculates the next interval and due date
5. Save the card and the review → streak day recorded
6. Repeat until the queue is empty → "Done for today"

## 7. [ ] Take speaking test
**Use case:** Take speaking test (Practice) · **Actor:** Learner · **Secondary:** Azure Speech, AI service
**Participants:** Learner, Web app, Speaking controller, Speaking test service, Azure Speech, AI service, Database

1. Learner (N3+) picks a task → records their answer in the browser
2. `POST /api/speaking-tests/tasks/:taskId/attempts` with the recording
3. Level reached? Daily limit not used up? → `alt` no → 403 / 429
4. **Azure Speech**: transcript + pronunciation / fluency scores (`opt` only when configured)
5. **AI service**: content grade of the transcript against the task (`opt` only when configured)
6. Combine into a score and band → save the attempt (transcript and scores only, **never the recording**)
7. Web app shows the result and feedback

## 8. [ ] Chat with the study assistant
**Use case:** Chat with the study assistant (Communicate) · **Actor:** Learner · **Secondary:** AI service
**Participants:** Learner, Web app, Communication controller, Assistant service, AI service, Database

1. Learner types a question → `POST /api/assistant/messages`
2. Hourly limit checked → load the conversation's recent messages (Database)
3. AI service answers (with the learner's name and level; `alt` not configured → basic built-in answers)
4. Save the question and the answer in one transaction (new conversation if none yet)
5. Web app shows the answer

## 9. [ ] Add friend (request → accept)
**Use case:** Add friend (Communicate) · **Actors:** Learner A, Learner B
**Participants:** Learner A, Web app A, Friend controller, Friend service, Database, Live updates, Web app B, Learner B

1. A enters B's username → `POST /api/friends/requests`
2. B exists, not blocked, accepts requests? Limits OK? → save pending request + notification for B
3. Live updates → B's web app shows the request at once (bell count)
4. B accepts → `PUT /api/friends/requests/:id` → status accepted + notification for A
5. Live updates → A sees "You and B are now friends"
6. `alt` B declines → request removed from A's list (A isn't told)

## 10. [ ] Send a message to a learner
**Use case:** View conversations, «extend» Message a learner (Communicate) · **Actors:** Learner A, Learner B
**Participants:** Learner A, Web app A, Communication controller, Direct-message service, Database, Live updates, Learner B

1. A opens a conversation with B → `POST /api/messages/conversations` (one per pair; reused if it exists)
2. A sends → `POST /api/messages/conversations/:id/messages`
3. Rate limit → blocked either way? → `alt` blocked → 403
4. Save the message → Live updates → B's inbox shows it (unread count)
5. `opt` B reports the message → support request for the admins (see 11)

## 11. [ ] Report a learner → admin resolves
**Use case:** Report learner (Communicate) + Review reports (Manage users) · **Actors:** Learner, Admin
**Participants:** Learner, Web app, Friend controller, Moderation service, Database, Admin, Admin web app, Email/Live updates

1. Learner reports B from B's profile → `POST /api/people/:username/report` (reason required, 10 a day)
2. `alt` an open report by the same learner exists → added to that support request; `else` new support request + report
3. Admin opens Reports → `GET /api/admin/reports` → reports grouped per learner (flagged when 3+ learners report)
4. Admin chooses → `POST /api/admin/reports/:userId/resolve`
   - `alt` dismiss · `alt` warn (the warning goes to B as a support message) · `alt` suspend (B's account suspended)
5. Every reporter gets a reply and their request closes → audit log entry

## 12. [ ] Edit and publish a lesson (admin)
**Use case:** Edit lessons (Manage content) · **Actor:** Admin
**Participants:** Admin, Admin web app, Moderation controller, Lesson-edit service, Database, Learner's web app

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
