# Saved Japanese learning sessions

One unfinished activity is retained per authenticated user in this browser:

- Japanese lessons (including practice, matching, and challenge answers)
- Hiragana/Katakana Speed Quiz (selected pool, question, input, feedback, counters)
- Hiragana/Katakana Review (randomized deck, answers, position)
- Kanji practice (issued questions, answers, position)
- Unit assessments (choices, position, result)

`activitySession.ts`, `ActivitySessionBoundary`, and `useActivityState` provide the
shared mechanism. State is written on interaction, not on unload. The storage key
uses the existing JWT's numeric user ID, not a username or the rotating token.
Completed activities stop taking priority in the Japanese dashboard. The last
result remains viewable until a new session replaces it. Selecting new work asks
for confirmation before discarding an unfinished session. Cancel keeps it intact.
Replacing a session does not roll back already recorded answers, XP, or completion.
Another tab holding a replaced session is blocked from overwriting the replacement.

The dashboard's **Your next step** prioritizes the saved activity, with a resume
link and lesson/question position or Speed Quiz counters. Browsing reference pages
does not replace it. Logout retains the save for the same account's next login.

## Persistence boundaries

This is a same-browser resume feature, not cloud/device sync or a new progression
system. Clearing site data, private-browsing cleanup, or browser storage eviction
removes the session snapshot, but not server-side XP, mastery, and completion.
English Arcade is unchanged. Flashcard/reference browsing is not a graded session.
Browser snapshots are never authority for XP, access, or mastery; existing server
checks and grading remain in use. Assessment access is rechecked before rendering
restored questions. Future incompatible content/state changes should bump the
snapshot version or explicitly migrate it.

## Safe answer retries

Migration `006_quiz_answer_receipts.sql` adds authenticated-user/submission UUID
receipts for the existing Kana answer endpoint. A question keeps its UUID until
advancing. Retrying an interrupted answer returns the receipt, without another
counter or XP increment. Reusing the UUID with different input is rejected.
The receipt, answer counters, and existing XP award share a transaction; the XP
service accepts an optional existing transaction without changing its reward rules.
Old clients without a submission UUID remain supported, but do not get retry safety.

Kanji already has user-owned, idempotent question IDs. These are no longer expired
after one hour or pruned on starting another session, so a saved deck remains
usable. Receipts/questions currently remain until account deletion. A future
retention policy must preserve resumable sessions and answer idempotency.

## Verification

- `nihon-web/scripts/verify-saved-sessions.cjs`: browser fixtures for refresh,
  closed-page recovery, both Reviews, lost-response retry, Kanji, lesson steps and
  answers, assessment results, Speed Quiz, dashboard resume, replacement acceptance
  and cancellation, stale tabs, account isolation, and mobile width.
- `nihon-api/scripts/verify-answer-receipts.cjs`: temporary PostgreSQL tables verify
  both Kana scripts, duplicate correct/wrong answers, conflicts, user isolation,
  migration rerun, and unchanged ten-correct-answer XP milestones.
- Existing Kanji and unit-assessment regressions cover retained server progression.

Apply migrations using `npm run migrate` in `nihon-api` before deploying the frontend.
