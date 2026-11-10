# Kana Wilds: design doc

Working title. A creature-collecting battle game on the Kana island: wild kana are the enemies, you catch them, and
the kana you own are the letters you attack with. Status: draft for review, nothing built yet.

## 1. Why this game

- **It teaches the real skill.** You attack by reading whole words, not single kana, and you defend by recognising
  kana among look-alikes.
- **Collecting means learning.** Every kana you catch opens up new words to attack with, so the collection is your
  reading vocabulary.
- **It uses what the site already has:**
  - course vocabulary (`shared/course/lessons.json`);
  - per-kana right and wrong answers (`user_progress`, `user_katakana_progress`);
  - KanjiVG stroke data for tracing;
  - the mistake notebook;
  - XP rules;
  - friends and live updates.

**Originality.** The game is in the monster-collecting genre but owes nothing to any existing series:
- Use our own names (creatures are *moji*, 文字).
- Use our own art in the island style, and our own cast as challengers.
- Use our own type system (the vowel circle).
- No borrowed terms, sounds or looks.

**Not in version 1:** live player-vs-player, trading, katakana (it comes in milestone 4), and spending money.

## 2. The loop

1. You walk the Kana island. In the tall grass, a **wild kana** appears.
2. You **battle** it: you attack by playing words spelled from your own kana, and you block its attacks by reading it.
3. When it's weak, you **catch** it by tracing its strokes.
4. It joins your **collection**, new words open up, and you go looking for the next one.
5. **Challengers** from the island cast test what you've caught. Beating them unlocks new areas and evolved forms.

## 3. Your team: letter tiles

- **A new player starts with the five vowels: あ い う え お.**
- Each kana you own is a **tile**. Tiles can be reused within a word, so いい needs only one い.
- A **word you can play** is any hiragana-only word in the course vocabulary whose kana are all tiles you own.
  The counts below are from the current `lessons.json`, which has 511 hiragana-only words (N5 305, N4 194, N3 39):

  | Tiles owned | Words you can play |
  |---|---|
  | vowels only | 5: いい (good), おおい (many), あおい (blue), うえ (above), え (picture) |
  | + か row | 11: adds き (tree), えき (station), かお (face), あかい (red), おおきい (big), こうこう (high school) |
  | + さ row | 25 |

- **Open question:** should playable words be every word in the course, or only words from lessons you've completed?
  The second ties the game to the course but leaves new learners with fewer words. **Proposal:** every N5 word is
  playable; a word from a lesson you've completed gets a small power bonus ("you studied this").

## 4. The vowel circle

Every kana belongs to a vowel column. The circle is **a → i → u → e → o → a**: each vowel beats the next one.

| Matchup | Multiplier | Shown as |
|---|---|---|
| Strong: your vowel beats theirs (a vs i) | ×1.5 | ▲ "Strong", plus a sound |
| Neutral | ×1 | none |
| Weak: their vowel beats yours (i vs a) | ×0.5 | ▼ "Weak" |

**Which vowel a word has: its last kana.**
- かお ends in お, so it counts as o.
- ん has no vowel, so it's always neutral.
- ー takes the vowel before it.
- Small-kana combos take the small kana's vowel, so きゃ counts as a.

**A stance, so that defence matters too.** The vowel of the word you just played is your **stance** until your next
turn, and the enemy's attack uses the same circle against it. So each word choice is a trade-off: かお (o) hits a ね
(e) hard, but leaves you in o, which an あ-column enemy beats. This makes you think about the gojūon table every turn.

## 5. Attacking: playing a word

1. Your attack panel shows **ideas you can play**, sorted by strength against this enemy. A ▲/▼ badge with a text label
   marks the matchup, so it never relies on colour alone.
2. You pick a word, then **read it**:
   - On easy settings you pick its romaji from four choices.
   - On harder settings you type it.
   - A wrong reading makes the attack fizzle.
3. **Bonus:** you can also pick its English meaning. If you get it right, the hit is a critical (×1.25).
4. **Damage = word power × vowel multiplier × critical**, where **word power = the sum, over the word's kana, of
   (`TILE_BASE_POWER` + that kana's level)**. Longer words and better-known kana hit harder.
5. **Word fatigue:** playing the same word again in one battle halves its power each time. This pushes players to use
   their whole vocabulary instead of spamming one word.

Every reading counts as a real answer. It updates that kana's right and wrong counts, and missed words go to the
mistake notebook (`source = kana`).

## 6. Defending: reading the enemy

When the enemy attacks, you block by reading its kana. A full block takes no damage; a miss takes the full hit,
adjusted by the stance.

Reading among four choices is fine for easy battles but too easy for hard ones. Making harder battles harder doesn't
need a countdown. It can come from what you have to read and how:

| Level | Defence | What it trains |
|---|---|---|
| 1 | Pick the romaji from 4 random choices | recognition |
| 2 | Pick the romaji from 4 **look-alikes** (ね, れ, わ, ぬ; さ, ち; は, ほ) | telling similar kana apart |
| 3 | The enemy **shouts**: you hear the kana and pick what you heard (with a caption option) | listening |
| 4 | **Stroke reveal** (below) | early recognition, stroke order |
| 5 | **Word attack**: the enemy casts a whole word made from its kana, and you read the word | reading in context |
| 6 | **Recall**: type the romaji instead of choosing | recall, not recognition |
| 7 | **Brush style**: the attack uses a handwritten or brush font instead of the usual type | reading real-world writing |

**Stroke reveal** is the answer to "harder without a timer". The enemy's kana is drawn stroke by stroke from the
KanjiVG data. You can answer at any moment, and the earlier you answer correctly, the better the block:
- before half the strokes: **perfect block**, and you reflect a little damage back;
- before the last stroke: **good block**, taking a quarter of the damage;
- after the kana is complete: **graze**, taking half;
- a wrong answer: the **full hit**.

Speed is rewarded rather than demanded, nobody fails because a clock ran out, and the reveal itself teaches stroke
order. With reduced motion turned on, the strokes appear in steps instead of animating.

Wild kana use levels 1–2. Each challenger has a signature defence from level 3 up (section 9).

## 7. Catching

- **When:** "Catch" becomes available once the wild kana is below `CATCH_HP_THRESHOLD` (30% of its HP).
- **How:** you trace the kana's strokes in order. Tracing is checked against the KanjiVG strokes for **order**,
  **direction** and **rough shape**.
- **How forgiving the check is** depends on the kana's remaining HP: the weaker it is, the looser the tolerance. A
  perfect trace always catches it.
- **If you fail:** the kana attacks. After `MAX_CATCH_TRIES` (3) failures it runs away. It isn't gone: it will appear
  again.
- **On a phone or tablet** you trace with a finger or stylus. On a keyboard-only setup there's an alternative: pick
  the strokes in the right order from a set of stroke cards.
- **What you can meet:** wild encounters favour kana you haven't caught, and kana you often get wrong (your weak
  kana from the statistics). Kana you already own still appear sometimes, for practice, but can't be caught twice.

## 8. Kana levels come from real mastery

A kana's level isn't earned by grinding battles. **It is your actual mastery of that kana**, computed from the right
and wrong answers the site already stores, across quizzes, reviews and battles:

| Level | Rule (tunable constants) |
|---|---|
| 1 | caught |
| 2 | 5+ answers, 60%+ right |
| 3 | 15+ answers, 75%+ right |
| 4 | 30+ answers, 85%+ right |
| 5 | 50+ answers, 92%+ right |

So studying kana anywhere on the site makes your team stronger, and getting a kana wrong in a battle really costs it.

## 9. Challengers: the island cast

Each challenger owns a few kana and tests one real difficulty. Beating one opens the next area of the island and
sometimes an **evolution**.

| Order | Challenger | Their kana | Signature defence | Beating them gives |
|---|---|---|---|---|
| 1 | Chun (Kana island) | vowels, か row | look-alikes (level 2) | the さ and た rows appear in the wild |
| 2 | Tama (Practice) | な, は rows | the enemy shouts (level 3) | the ま, や, ら, わ rows |
| 3 | Pon (Games) | ぬ, め, ね, れ, わ, る, ろ | stroke reveal (level 4) | the title "Sharp eyes" |
| 4 | Sensei (Teahouse) | voiced forms | word attacks (level 5) | **evolution**: dakuten (か → が, は → ば → ぱ) |
| 5 | Zen (Review) | your weakest kana | recall (level 6) | **evolution**: small kana (き + ゃ → きゃ) |
| 6 | Kurama (Fuji) | everything | brush style (level 7) + mixed | the katakana wilds (milestone 4) |

**Evolution adds new tiles** (が, ば, きゃ…), which open new words such as えいが (film), しごと (work) and きょう (today). The base
tile stays in your collection.

Losing a challenger battle costs nothing. You can try again at once, and the challenger offers a hint about what
beat you ("You read ね as れ twice").

## 10. Battles with friends (later)

**Ghost battles** come first:
- Your team and your recorded answers become a "ghost" that friends can fight while you're offline. This uses the
  existing friend challenges and needs no matchmaking.
- Both sides attack with their own words.
- Both read the same defence questions, drawn only from kana **both** players own, so collecting kana you can't read
  gives no advantage.
- Matches are by number of kana caught, not by XP.

**Live duels** come only if people ask for them. They can use the live-update system already in place.

Friends only, blocked learners excluded, and preset reactions only (よろしく, いいね, すごい!) rather than chat.

## 11. Rewards and fairness

- **XP** goes through the existing `game` XP source and its daily cap, so the game can't be farmed. First catches
  and first challenger wins pay a one-off bonus, keyed by kana or challenger so each pays once.
- **Achievements:** first catch, a full row, a full vowel column, every challenger beaten, the whole hiragana table.
- **No losses:** a defeat never removes a kana or XP.
- **Server-side checks:**
  - readings and meanings are graded on the server, and the correct answer is never sent first, the same way kanji
    practice questions work;
  - catches and challenger wins are saved through the API.

  Tracing is graded in the browser, which a determined player could fake. That's acceptable: a catch only unlocks
  practice words, nothing is traded or ranked on it, and the XP is capped.

## 12. Screens

All screens fit 1366×768 and 390×844 without scrolling.

1. **Kana island map:** grass areas, opened by beating challengers. Each challenger's spot is marked.
2. **Battle screen:**
   - the enemy and its vowel at the top;
   - your HP and your stance;
   - the word suggestions as large buttons, with the reading step in the same panel;
   - the defence question appears in place of the attack panel on the enemy's turn.
3. **Catch overlay:** a large tracing area with the stroke count and a "show me the first stroke" hint.
4. **Collection:** the gojūon table with caught kana filled in. Each kana shows its level, the words it opens, and
   your accuracy on it.

**Accessibility:**
- everything works by keyboard, including the stroke-card alternative to tracing;
- kana have screen-reader labels with their reading;
- the vowel matchup always shows an icon and a text label, never colour alone;
- shouted attacks have captions;
- reduced motion turns off the stroke animation and the shaking;
- user-facing text follows the site's string conventions, never hardcoded in components.

## 13. Data

| What | Where |
|---|---|
| Collection | new table `moji_collection (user_id, script, kana_id, form, caught_at)`, PK (user_id, script, kana_id, form); `form` is base, dakuten, handakuten or small combo |
| Challenger wins | new table `challenger_wins (user_id, challenger_id, first_won_at, best_turns)` |
| Battles for statistics | `practice_sessions` with a new kind `battle` (scope = wild or the challenger's id; answered / correct) |
| Kana levels | computed from `user_progress` / `user_katakana_progress`: nothing new stored |
| Word list | built from `lessons.json` (hiragana-only vocabulary) at build time, like the other course data |
| Challengers, areas, encounter tables | course-style data files, not hardcoded in components |

Game rules (the vowel circle, damage, the catch check, level thresholds) are **pure functions** in their own module,
unit-tested without a browser or database, like `srsScheduler.ts`.

## 14. Milestones

1. **First battle:**
   - wild battles in one area with the vowels and the か row;
   - word attacks with the romaji choice;
   - defence levels 1–2;
   - catching by tracing;
   - the collection page;
   - saving catches.
2. **Depth:**
   - the stance and the full vowel circle;
   - kana levels from mastery;
   - word fatigue;
   - the meaning critical;
   - answers feeding the statistics and the mistake notebook.
3. **Challengers:** the six challengers with defence levels 3–7, the stroke reveal, evolutions, and the achievements.
4. **Katakana:** katakana wilds. Katakana-only vocabulary is the open content question.
5. **Friends:** ghost battles, then live duels only if wanted.

Milestone 1 is a complete small game on its own. Each later milestone is playable when it lands.

## 15. Open questions

1. Every N5 word playable, or only words from completed lessons? -> every N5 words (every japanese words if you can)
2. Can guests play the first area without saving, like the guest speed quizzes, as a way into signing up? -> no
3. Is the vowel-only start fun enough, or should a new player choose one starter consonant (か, さ or た) to begin
   with 8–11 words instead of 5? -> good idea, allow them to have the base vowel and 1 starter consonant
4. Art: one creature design per kana (46 base forms plus 25 voiced forms, before small-kana combos) is a lot of art. Option: the kana itself is the
   creature, with a face and a shape per vowel column, so each column shares one body style. -> the kana character being the enemy is fine for now, no need for faces and stuff
5. Should challengers come back as harder rematches once beaten? -> yes
