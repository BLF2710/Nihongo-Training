# Use case diagram checklist (DATN.vpp)

Compared on 2026-10-28 with what the Lingora app actually does, updated 2026-10-29 (achievements page, mistake notebook for kana and kanji, Particle Drop, daily review deck) and 2026-11-17 (checked against DATN.vpp; Kana Wilds and the walkable world, traveller wardrobe, Island Errands, guest practice). Tick items off as you update the diagrams in Visual Paradigm.

- **Add**: the app has it, the diagram doesn't.
- **Remove / rename**: the diagram has it, the app doesn't (or calls it something else).

---

## 1. Overall Use Case

Has: Authenticate account, Manage account, Learn Japanese, Learn English, Practice, Track learning progress, View statistics, Select learning language, Manage user, Manage content, Manage system, Manage community.

- [✅] Replace **Manage community** (Admin) with **Friends & communicate** (Learner), see section 12
- [✅] Fix wording: "Manage user" → **Manage users** (matches its diagram's name)
- [ ] Add the secondary actors from section 13 (or only on the detailed diagrams, if the overview gets crowded)
- [ ] Add **Play Kana Wilds** (Learner), detailed in section 15
- [ ] Add **Try practice as a guest** (Guest: a kana quiz at `/guest/practice` without an account; nothing is saved)

## 2. Authenticate account (Learner)

Has: Register account, Log in, Log out, Change password.

- [ ] Add **Forgot password** (reset by an emailed link). **Do this first:** the "Reset password" sequence diagram already exists but no use case is behind it
- [ ] Add **Confirm email address** (link sent after registering or changing email)
- [✅] Add **Sign in with Google** as its own use case that «extend»s **Log in** and **Register account** (optional alternative; the first Google sign-in creates the account). Connect the secondary actor **Google**. Not «include»: logging in doesn't always go through Google. (Alternative some teachers prefer: generalization, "Log in" as parent of "Log in with password" and "Log in with Google".)
- [✅] Add **Sign out on all devices**

## 3. Manage account (Learner)

Has: Change avatar, Change bio, Change language, Change name, View profile.

- [✅] Add **Manage account visibility** (only me / friends / all learners / Preview how other see)
- [✅ ] Add **Set daily goal and learning goal**
- [✅] Add **Choose course level** (N5 / N4)
- [✅] Add **Link / unlink Google account** (Settings → Account & security; connect **Google**)
- [ ] Add **Customize traveller** (`/traveller`, linked from the profile: kimono, skin, sash, hair, hat, what they carry, cheeks; seen on the island map, the village, the wild paths and in battles). Sequence diagram 18

## 4. Learn Japanese (Learner)

Has: Browse lessons, Take a lesson, Learn Hiragana, Learn Katakana, Learn Kanji, View grammar reference, View vocabulary reference.

- [✅] Add **Read passages** (Reading)
- [✅] Add **Practice listening**
- [✅] Add **Practice speaking**
- [✅] Add **Study kanji flashcards** (with «include» or «extend» **Add kanji to flashcards**)
- [ ] Add **Add kanji to daily review** («extend» of **Learn Kanji**: the button on a kanji's page)

## 5. Practice (Learner) — biggest gap

Has: Play Hiragana / Katakana speed quiz, Review Hiragana / Katakana, Practice Kanji, Take unit assessment, Track mastery, Store practice progress.

- [✅] Add **Daily review** (spaced repetition: rate cards Again / Hard / Good / Easy)
  - [ ] «extend» **Review ahead** (cards due within the next day, offered when nothing is due)
  - [✅] «extend» **Hide a card** (left out of reviews, keeps its progress; also possible from the deck). Drawn as "Suspend card"; consider renaming it to **Hide a card**, the word the app uses
  - [ ] Add **Manage review deck** (`/srs/deck`: browse cards, search, hide / show again)
- [✅] Add **Review mistakes** (mistake notebook)
  - [ ] Widen it: kana quizzes and kanji practice now add mistakes too
  - [ ] «extend» **Practise weak characters** (kana and kanji under 85% accuracy, even mastered ones)
- [ ] Add **Play Particle Drop** (fill in the missing particle against the clock; wrong answers go to the mistake notebook). Put it next to the Hiragana / Katakana speed quiz
- [ ] Add **Take level review**
- [ ] Add **Take mock exam** (N5 / N4, results saved). Sequence diagram 19
- [ ] Add **Play Island Errands** (walk the festival village and run errands for the islanders; each finished errand is saved as practice and pays game XP)
- [✅] Add **Take speaking test** (N3 and above; graded)

## 6. Track learning progress (Learner)

Has: Earn EXP, Level up, Maintain learning streak, Unlock achievements.

- [✅] Add **Meet daily goal** (active study time)
- [✅] Fix spelling: "Unlock Achievments" → **Unlock achievements**
- [ ] Add **View achievements** (Achievements page: level, rank ladder, every achievement with its progress, ways to earn XP and today's limits). **Level up** can «include» a level-up notification, or leave that to **View notifications**

## 7. View statistics (Learner)

Has: View Japanese / English statistics, View Hiragana / Katakana accuracy, View Kanji progress, View learning history.

- [✅] Add **View learning overview** (study time per day, lessons per week, assessments, reviews, mistakes, mock exam and speaking results) — or widen "View learning history" to mean this

## 8. Manage users (Admin)

Has: View users list, Search users, View user details, Edit user accounts, Delete user accounts, Reset user password.

- [✅] Add **Suspend / reactivate account**
- [] Add **Unlock all lessons for a learner**
- [✅] Remove **Delete user accounts** (admins can only suspend), or keep it if you plan to build it
- [ ] Moderation (moved here from the old community diagram):
  - [✅] Add **Review reports** with «include» **Dismiss reports**, **Warn learner**, **Suspend learner** (reports about the same learner are handled together; repeated reports are flagged)
  - [✅] Add **Answer support requests** (support inbox: reply, close, reopen)

## 9. Manage content (Admin)

Has: View learning content, Manage lessons, Manage units, Manage vocabulary, Manage grammar, Manage alphabets (Hiragana, Katakana), Manage Kanji, Manage quizzes, Manage games.

- [✅] Add **Turn features on / off** (content availability)
- [✅] Add **Manage review question bank** (add, edit, hide, delete questions)
- [✅] Turn **Manage lessons** into the lesson editor: «include» **Edit draft**, **Preview**, **Publish**, **Restore original**, **Export published edits**
- [✅] Remove or merge **Manage vocabulary** and **Manage grammar** into **Manage lessons** (they are edited inside lessons)
- [✅] Remove **Manage units**, **Manage alphabets**, **Manage Hiragana / Katakana / Kanji**, **Manage quizzes**, **Manage games** (no admin screens exist; that content comes from course files and the importer), or keep any you plan to build

## 10. Manage system (Admin)

Has: View system status, Manage system settings, Manage announcements, Manage users roles, Manage learning settings, View system logs.

- [✅] Add **View learning analytics** (admin analytics dashboard)
- [✅] Rename **View system logs** → **View audit log** (who changed what in the admin area)
- [✅] Remove **Manage learning settings** (nothing matches it), or say what it means
- [✅] Fix wording: "Manage users roles" → **Manage user roles**

## 11. Learn English (Learner)

On the overall diagram only (no detailed diagram). Nothing missing: the English game section exists, and its statistics are in "View statistics".

## 12. Manage community (Admin) → becomes "Friends & communicate (Learner)"

Has: View community posts, Moderate posts, Delete posts, Review reported content, Manage community members, Suspend community members. There are no posts in the app; the community is friends, messages and support.

- [✅] Rename the diagram to **Friends & communicate (Learner)** and change its actor from Admin to **Learner**
- [✅] Remove all six admin use cases (the moderation ones now live in "Manage users", section 8)
- [✅] Friends:
  - [✅] Add **View friends leaderboard**
  - [✅] **Add friend** (by username), **Accept / decline request**, **Cancel request**, **Remove friend**
  - [✅] **View a learner's profile**
  - [✅] **View friend activity** with «extend» **Cheer a friend**
  - [✅] **Nudge a friend**
  - [✅] **Challenge a friend**, **Accept / decline challenge**
  - [✅] **Block a learner**, **Report a learner**
- [✅] Communicate:
  - [✅] **Send direct message** with «extend» **Report a message** and **Block in messages**
  - [✅] **View notifications**
  - [✅] **Ask for help** (Help & support request; reply to the support team)
  - [✅] **Chat with the study assistant**
## 13. Secondary actors (none yet)

Draw these on the right of the use cases that use them.

- [ ] **Google** — Sign in with Google (extends Log in and Register account), Link / unlink Google account
- [–] ~~**Email service**~~ — left out by choice (Forgot password and Confirm email address stay without a secondary actor)
- [ ] **Azure Speech** — Take speaking test (pronunciation and fluency)
- [ ] **Anthropic (Claude)** — Chat with the study assistant, Take speaking test (content grading)

Kana Wilds (section 15) has no secondary actor: everything runs in the browser and the Lingora API.

## 14. Housekeeping

- [✅] Delete the 10 unused actors **Actor**, **Actor2**–**Actor10** (in the model, on no diagram) from the Model Explorer
- [ ] Fix spelling in two sequence diagram names: "Leaner view statistics" → **Learner views statistics**, "Take unit  assesment" → **Take unit assessment**
- [ ] Optional: "Login with Google" / "Register with Google" → **Log in with Google** / **Register with Google** ("log in" is the verb, "login" the noun)

## 15. Play Kana Wilds (Learner) — new diagram

The kana battle-and-catch game in the walkable world (docs/WORLD.md, docs/KANA-BATTLE.md). Ready in PlantUML:
[`usecase/UC-play-kana-wilds.puml`](usecase/UC-play-kana-wilds.puml). Sequence diagrams 16 and 17.

- [ ] Create the diagram **Play Kana Wilds (Learner)** with the actor **Learner**
- [ ] **Choose a starter kana** (once: か, さ or た, plus the five vowels)
- [ ] **Walk the world** (village square, wild paths, islands; each island's buildings open its pages)
- [ ] **Battle a wild kana** «extend» **Walk the world** (stepping onto tall grass or rough water)
  - [ ] «include» **Defend against an attack** (read the kana or word the enemy attacks with)
  - [ ] **Catch a kana** «extend» **Battle a wild kana** (trace its strokes once it is at or below 60% HP)
- [ ] **Quick battle** «include» **Battle a wild kana** (from the Kana Wilds page, without walking)
- [ ] **View kana collection** (each kana's level 1–5 from real answers)
  - [ ] **Evolve a kana** «extend» **View kana collection** (か → が after Sensei, き → きゃ after Zen, at level 3)
- [ ] **Challenge an island challenger** «include» **Defend against an attack** (Chun, Tama, Pon, Sensei, Zen, Kurama)
  - [ ] **Get a tip after a loss** «extend» **Challenge an island challenger**

