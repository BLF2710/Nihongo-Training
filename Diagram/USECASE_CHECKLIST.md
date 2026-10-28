# Use case diagram checklist (DATN.vpp)

Compared on 2026-10-28 with what the Lingora app actually does. Tick items off as you update the diagrams in Visual Paradigm.

- **Add**: the app has it, the diagram doesn't.
- **Remove / rename**: the diagram has it, the app doesn't (or calls it something else).

---

## 1. Overall Use Case

Has: Authenticate account, Manage account, Learn Japanese, Learn English, Practice, Track learning progress, View statistics, Select learning language, Manage user, Manage content, Manage system, Manage community.

- [✅] Replace **Manage community** (Admin) with **Friends & communicate** (Learner), see section 12
- [✅] Fix wording: "Manage user" → **Manage users** (matches its diagram's name)
- [ ] Add the secondary actors from section 13 (or only on the detailed diagrams, if the overview gets crowded)

## 2. Authenticate account (Learner)

Has: Register account, Log in, Log out, Change password.

- [ ] Add **Forgot password** (reset by an emailed link)
- [ ] Add **Confirm email address** (link sent after registering or changing email)
- [ ] Add **Sign in with Google** as its own use case that «extend»s **Log in** and **Register account** (optional alternative; the first Google sign-in creates the account). Connect the secondary actor **Google**. Not «include»: logging in doesn't always go through Google. (Alternative some teachers prefer: generalization, "Log in" as parent of "Log in with password" and "Log in with Google".)
- [ ] Add **Sign out on all devices**
- [ ] Add **Deactivate account**
- [ ] Guest: add **Play guest kana quiz** (no account needed)
- [ ] Guest: add **View privacy policy**

## 3. Manage account (Learner)

Has: Change avatar, Change bio, Change language, Change name, View profile.

- [ ] Add **Remove avatar** (or extend "Change avatar")
- [ ] Add **Set progress visibility** (only me / friends / all learners)
- [ ] Add **Allow or refuse friend requests**
- [ ] Add **Choose sharing options** (activity sharing, "studying now", friend suggestions)
- [ ] Add **Set daily goal and learning goal**
- [ ] Add **Manage blocked learners** (view list, unblock)
- [ ] Add **Choose course level** (N5 / N4)
- [ ] Add **View public profile** (how others see you)
- [ ] Add **Link / unlink Google account** (Settings → Account & security; connect **Google**)

## 4. Learn Japanese (Learner)

Has: Browse lessons, Take a lesson, Learn Hiragana, Learn Katakana, Learn Kanji, View grammar reference, View vocabulary reference.

- [ ] Add **Read passages** (Reading)
- [ ] Add **Practice listening**
- [ ] Add **Practice speaking**
- [ ] Add **Study kanji flashcards** (with «include» or «extend» **Add kanji to flashcards**)
- [ ] Add **Practice kana writing** (stroke order)
- [ ] Add **View a lesson's kanji**

## 5. Practice (Learner) — biggest gap

Has: Play Hiragana / Katakana speed quiz, Review Hiragana / Katakana, Practice Kanji, Take unit assessment, Track mastery, Store practice progress.

- [ ] Add **Daily review** (spaced repetition: rate cards Again / Hard / Good / Easy)
- [ ] Add **Review mistakes** (mistake notebook)
- [ ] Add **Take unit review** (question bank, not the assessment)
- [ ] Add **Take level review**
- [ ] Add **Take mock exam** (N5 / N4, results saved)
- [ ] Add **Take speaking test** (N3 and above; graded)

## 6. Track learning progress (Learner)

Has: Earn EXP, Level up, Maintain learning streak, Unlock achievements.

- [ ] Add **Meet daily goal** (active study time)
- [ ] Add **View friends leaderboard**
- [ ] Add **Keep a friend streak** (days in a row both studied)
- [ ] Fix spelling: "Unlock Achievments" → **Unlock achievements**

## 7. View statistics (Learner)

Has: View Japanese / English statistics, View Hiragana / Katakana accuracy, View Kanji progress, View learning history.

- [ ] Add **View learning overview** (study time per day, lessons per week, assessments, reviews, mistakes, mock exam and speaking results) — or widen "View learning history" to mean this

## 8. Manage users (Admin)

Has: View users list, Search users, View user details, Edit user accounts, Delete user accounts, Reset user password.

- [ ] Add **Suspend / reactivate account**
- [ ] Add **Unlock all lessons for a learner**
- [ ] Remove **Delete user accounts** (admins can only suspend), or keep it if you plan to build it
- [ ] Remove **Reset user password** (learners reset their own by email), or keep it if you plan to build it
- [ ] Moderation (moved here from the old community diagram):
  - [ ] Add **Review reports** with «include» **Dismiss reports**, **Warn learner**, **Suspend learner** (reports about the same learner are handled together; repeated reports are flagged)
  - [ ] Add **Answer support requests** (support inbox: reply, close, reopen)

## 9. Manage content (Admin)

Has: View learning content, Manage lessons, Manage units, Manage vocabulary, Manage grammar, Manage alphabets (Hiragana, Katakana), Manage Kanji, Manage quizzes, Manage games.

- [ ] Add **Turn features on / off** (content availability)
- [ ] Add **Manage review question bank** (add, edit, hide, delete questions)
- [ ] Turn **Manage lessons** into the lesson editor: «include» **Edit draft**, **Preview**, **Publish**, **Restore original**, **Export published edits**
- [ ] Remove or merge **Manage vocabulary** and **Manage grammar** into **Manage lessons** (they are edited inside lessons)
- [ ] Remove **Manage units**, **Manage alphabets**, **Manage Hiragana / Katakana / Kanji**, **Manage quizzes**, **Manage games** (no admin screens exist; that content comes from course files and the importer), or keep any you plan to build

## 10. Manage system (Admin)

Has: View system status, Manage system settings, Manage announcements, Manage users roles, Manage learning settings, View system logs.

- [ ] Add **View learning analytics** (admin analytics dashboard)
- [ ] Rename **View system logs** → **View audit log** (who changed what in the admin area)
- [ ] Remove **Manage learning settings** (nothing matches it), or say what it means
- [ ] Fix wording: "Manage users roles" → **Manage user roles**

## 11. Learn English (Learner)

On the overall diagram only (no detailed diagram). Nothing missing: the English game section exists, and its statistics are in "View statistics".

## 12. Manage community (Admin) → becomes "Friends & communicate (Learner)"

Has: View community posts, Moderate posts, Delete posts, Review reported content, Manage community members, Suspend community members. There are no posts in the app; the community is friends, messages and support.

- [ ] Rename the diagram to **Friends & communicate (Learner)** and change its actor from Admin to **Learner**
- [ ] Remove all six admin use cases (the moderation ones now live in "Manage users", section 8)
- [ ] Friends:
  - [ ] **Add friend** (by username), **Accept / decline request**, **Cancel request**, **Remove friend**
  - [ ] **Invite a friend** (link or QR code)
  - [ ] **View a learner's profile**
  - [ ] **See friend suggestions** (opt-in)
  - [ ] **View friend activity** with «extend» **Cheer a friend**
  - [ ] **Nudge a friend**
  - [ ] **Challenge a friend**, **Accept / decline challenge**
  - [ ] **Block a learner**, **Report a learner**
- [ ] Communicate:
  - [ ] **Send direct message** with «extend» **Report a message** and **Block in messages**
  - [ ] **View notifications**
  - [ ] **Ask for help** (Help & support request; reply to the support team)
  - [ ] **Chat with the study assistant**

## 13. Secondary actors (none yet)

Draw these on the right of the use cases that use them.

- [ ] **Google** — Sign in with Google (extends Log in and Register account), Link / unlink Google account
- [ ] **Email service** — Forgot password, Confirm email address
- [ ] **Azure Speech** — Take speaking test (pronunciation and fluency)
- [ ] **Anthropic (Claude)** — Chat with the study assistant, Take speaking test (content grading)

## 14. Housekeeping

- [ ] Delete the 10 unused actors **Actor**, **Actor2**–**Actor10** (in the model, on no diagram) from the Model Explorer
