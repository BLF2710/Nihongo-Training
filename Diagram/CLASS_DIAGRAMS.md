# Class diagrams to draw

10 diagrams in [`class/`](class/): 5 entity diagrams (the data, split by area) and 5 design diagrams (how the code is
built, with its design patterns). Each file lists its sources and patterns at the top. Preview them with the PlantUML
extension in VS Code, then redraw in Visual Paradigm. Tick them off as you draw.

## Conventions
- Entity diagrams: foreign keys are drawn as associations with multiplicities, not repeated as attributes.
  Types are domain types (String, Integer, Boolean, DateTime, JSON); `[0..1]` means the value may be empty.
- `User` appears in every entity diagram as the hub, with its full attributes only in E1.
- «content» classes are course files shipped with the code (units, lessons, assessments, speaking tasks, mock exams,
  the switchable features); «rule» classes are fixed tables in code. Neither is a database table.
- The API is written as TypeScript modules of functions rather than classes. In the design diagrams a «module» class is
  one file and its operations are the functions it exports; «interface» classes are real TypeScript interfaces.

## Entity class diagrams
1. [ ] **E1 Account and administration:** [`E1-account-and-administration.puml`](class/E1-account-and-administration.puml): User, Profile, Avatar, LinkedIdentity (Google), AccountToken, AuditLogEntry, SystemSettings, ContentAvailability
2. [ ] **E2 Course and progress:** [`E2-course-and-progress.puml`](class/E2-course-and-progress.puml): Unit, Lesson, UnitAssessment, SpeakingTask, MockExam (content); LessonProgress, AssessmentProgress, SpeakingAttempt, MockExamResult, LessonEdit, ReviewQuestion
3. [ ] **E3 Kana, kanji and review:** [`E3-kana-kanji-and-review.puml`](class/E3-kana-kanji-and-review.puml): Hiragana, Katakana, Kanji and their progress, KanjiPracticeQuestion, KanjiFlashcard, SrsCard, SrsReview, Mistake, PracticeSession, StudyTime
4. [ ] **E4 Gamification:** [`E4-gamification.puml`](class/E4-gamification.puml): Gamification (XP, streaks), XpEvent, ActivityDay, Achievement, UserAchievement, GameScore, XpRule, AchievementRule
5. [ ] **E5 Community:** [`E5-community.puml`](class/E5-community.puml): Friendship, FriendChallenge, Block, Conversation, ConversationMember, Message, Notification, LearnerReport

Not drawn (technical): `rate_limit_windows`, `sign_in_nonces` (shown as stores in D4), `quiz_answer_receipts`.

## Design class diagrams
6. [ ] **D1 Layered architecture (friends):** [`D1-layered-architecture.puml`](class/D1-layered-architecture.puml): routes → middleware chain → controller (action() decorator) → service → repository → database, with the unit of work
7. [ ] **D2 Outside services:** [`D2-outside-services.puml`](class/D2-outside-services.puml): Mailer, GoogleTokenVerifier, AvatarProcessor and AssistantProvider, each an Adapter/Strategy with its implementations and the factory that picks one
8. [ ] **D3 Speaking test:** [`D3-speaking-test.puml`](class/D3-speaking-test.puml): dependency injection of the Azure pronunciation assessor and the Claude content grader; the service as a Facade
9. [ ] **D4 Shared state and live updates:** [`D4-shared-state-and-live-updates.puml`](class/D4-shared-state-and-live-updates.puml): memory or PostgreSQL stores (rate limits, nonces, RealtimeBus) built together; publish–subscribe to open tabs
10. [ ] **D5 Learning rules:** [`D5-learning-rules.puml`](class/D5-learning-rules.puml): question types as a Strategy registry, the spaced-repetition scheduler, XP and achievement rules, rewardActivity() as a Facade

If you only have room for some of the design diagrams: D1 and D2 matter most (they show the architecture and the
patterns), then D5.
