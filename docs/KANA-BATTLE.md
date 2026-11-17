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
   that kana's tile power for its level** (`TILE_POWER_BY_LEVEL`, section 8). Longer words and better-known kana hit
   harder.
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

Wild kana use levels 1–2. Each challenger has a signature defence (section 9). In the game today
(`lib/kanaWilds/defenceStyles.ts`, one strategy per style, with the panels in `DefencePanel.tsx`):
- **Reading** (wild kana): the attack draws quickly; read right before it is drawn for a perfect block, after for a
  block. Wrong choices lean on look-alikes.
- **Look-alikes** (Chun): every attack is the kana itself or one of its look-alikes, never a word, and every wrong
  choice is a kana learners mix up (its own look-alikes first).
- **Shout** (Tama): the attack is a single kana, spoken instead of shown. Pick the kana you heard among kana that
  sound like it (the same vowel first). Right on the first hearing is a perfect block; after **Hear it again**, a
  block. **Caption** shows the sound in romaji, and is on from the start where the browser can't speak.
- **Stroke reveal** (Pon): drawn slowly (900 ms a stroke), judged as above: perfect before half the strokes, a
  quarter of the hit before the last ("glanced"), half once drawn ("grazed"), the full hit when wrong.
- **Word attack** (Sensei): every attack is a whole course word holding the kana (with voiced kana, such as えいが),
  drawn like a reading attack; read the word right to block.
- **Recall** (Zen): every attack is the kana itself, drawn slowly (1200 ms a stroke). There are no choices: type the
  reading in romaji and press Block. It is compared trimmed, in lower case and composed (NFC, `typedReading`), and
  graded by the server like any kana answer (which accepts the usual spellings, si for し). Typed before it is drawn
  is a perfect block, after a block.
- **Brush style** (Kurama): kana and words, as wild kana attack, but inked with a brush: thick, ragged strokes
  (an SVG turbulence filter) leaning like handwriting (`InkLook` "brush" in `StrokeKana.tsx`). Choices are
  look-alikes; read right before it is drawn for a perfect block, after for a block.

Braced (after a redraw), every style offers two choices that are easy to tell apart (recall too: the two choices
replace the typing).

## 7. Catching

- **When:** "Catch" becomes available once the wild kana is at or below `CATCH_HP_SHARE` (60% of its HP). A good trace
  catches it at the **catch chance**: `MIN_CATCH_CHANCE` (40%) as catching opens, rising to 100% at 0 HP. The button
  shows the chance ("Catch it! (65%)"), so catching early is a gamble the player chooses.
- **How:** you trace the kana's strokes in order. Tracing is checked against the KanjiVG strokes for **order**,
  **direction** and **rough shape**. The whole trace is first centred and scaled to the kana (0.6×–1.6×), so where
  and how big you draw doesn't count; the strokes' places relative to each other still do.
- **How forgiving the check is** depends on the kana's remaining HP: the weaker it is, the looser the tolerance. A
  perfect trace always catches it.
- **If you fail** (a missed trace, or a good trace that loses the roll and breaks out): the kana attacks. After `MAX_CATCH_TRIES` (3) failures it runs away. It isn't gone: it will appear
  again.
- **On a phone or tablet** you trace with a finger or stylus. On a keyboard-only setup there's an alternative: pick
  which kana it is from four look-alikes and row-mates.
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

Each level gives the kana's tiles more power (`TILE_POWER_BY_LEVEL` in `lib/kanaWilds/mastery.ts`):

| Level | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Tile power | 3 | 3.5 | 4 | 4.5 | 5 |

- The counts are the hiragana progress the site already keeps (`correct_count`, `wrong_count`); the collection API
  returns them for each collected kana (`answers`), and the browser turns them into levels.
- A battle uses the levels it began with. The kana read in defence are graded by the kana quiz API, so they count;
  the collection is fetched again after each battle, and the next battle uses the new levels.
- The collection shows each caught kana's level as a small number, its cell a deeper green as the level rises.

## 9. Challengers: the island cast

Each challenger owns a few kana and tests one real difficulty, and waits on their own island at the end of a wild
path (docs/WORLD.md). Every path is open from the start; a win is saved, pays XP once, and later may give an
**evolution**.

| Order | Challenger | Their kana | Signature defence | Beating them gives |
|---|---|---|---|---|
| 1 | Chun (Kana island) | vowels, か row | look-alikes (level 2) | the さ and た rows appear in the wild |
| 2 | Tama (Practice) | な, は rows | the enemy shouts (level 3) | the ま, や, ら, わ rows |
| 3 | Pon (Games) | ぬ, め, ね, れ, わ, る, ろ | stroke reveal (level 4) | the skill **Sharp Eyes** |
| 4 | Sensei (Lessons) | voiced forms | word attacks (level 5) | **evolution**: dakuten (か → が, は → ば → ぱ) |
| 5 | Zen (Review) | your weakest kana | recall (level 6) | **evolution**: small kana (き + ゃ → きゃ) |
| 6 | Kurama (Fuji) | everything | brush style (level 7) + mixed | the katakana wilds (milestone 4) |

The whole cast is in the game (docs/WORLD.md section 4), each on their island with their
signature defence (section 6): Chun (Kana) with あ, こ, お and look-alikes; Tama (Practice) with さ, ち, つ and the
shout; Pon (Games) with ぬ, ね, は and the stroke reveal; Sensei (Lessons) with が, だ, ば and word attacks; Zen
(Review) with recall; Kurama (Fuji) with the brush. Zen's and Kurama's teams are not fixed: as the challenge starts
Zen's is the learner's own three weakest tile kana, the lowest levels, ties at random, so the challenge is a review;
Kurama's is three of all the learner's tiles, mixed, evolved ones included (`teamFor` in `lib/world/challenges.ts`).

**Rewards** (each named on the result screen once the win is saved):
- **Chun** brings the さ and た rows into the riverside path's grass, which is quiet until then.
- **Tama** brings the ま, や, ら, わ rows and ん into the stone path's grass (to the Lessons island), which is quiet
  until then. The forest path keeps the な and は rows from the start.
- **Pon** teaches the skill **Sharp Eyes**: a hidden wild kana shows its stroke count from the start of the battle,
  instead of once its HP is low (`useEnemyReveal` in `components/kanaWilds/enemyReveal.ts`). It is a skill in the
  game, not an achievement: migration 038 removes the achievement an earlier build added.
- **Sensei** opens **voiced evolution** (below).
- **Zen** opens **small-kana evolution** (below).
- **Kurama** is the last of the cast: the win is kept for the **katakana wilds** (milestone 4), so a learner who has
  beaten Kurama goes in first when they open. Nothing opens yet.

The rows are held back in both places: the web app's paths (`rewardRows` in `data/world/routes.ts`) and the API's
catches (`HELD_KANA` in `kana-wilds.service.ts`, refused with 409). A starter kana from a held row (さ or た) is still
the learner's from the start.

**Hints after a loss.** Every wrong read of a kana attack is kept with the battle (`{ kana, mistakenFor, way }`, where
`way` is "read" or "heard") and carried through the challenge's rounds. After a loss (or giving up) the challenger
names the team, a tip for their defence, and up to three mix-ups, the most frequent first: "You read ね as れ
twice.", "You heard つ as す once." (`lib/kanaWilds/mistakes.ts`). A win shows none. Words read wrong already go to
the mistake notebook, so the hints are about single kana.

**Evolution adds new tiles** (が, ば, きゃ…), which open new words such as えいが (film), しごと (work) and きょう (today). The base
tile stays in your collection.

Both kinds of evolution are in the game (`lib/kanaWilds/evolution.ts`), each opened by its challenger:
- **Voiced** (Sensei): a kana of the か, さ, た and は rows **evolves** when it reaches **level 3**
  (`EVOLVE_AT_LEVEL`): か → が, し → じ, と → ど, は → ば. An evolved ば goes on to ぱ when ば itself reaches level 3.
- **Small kana** (Zen): き, し, ち, に, ひ, み and り, at level 3, each become their three small-kana combinations
  (き → きゃ, きゅ, きょ), and so do the voiced ぎ, じ, び and ぴ once they have evolved and reached level 3 themselves
  (き → ぎ → ぎゃ). The combinations are the catalog's ids 72–104 (`YOON_HIRAGANA`).
- Nothing is caught again, and the base kana stays.
- an evolved kana is a tile with its own level, from its own answers: the collection API returns the answers for
  every collected kana and for every form it evolves into (`evolvedFromId` and `rootKanaId`, catalog ids 47–104).
- a small-kana combination is **one tile**: words are split into tiles, not characters (`tilesOf`: きゃく is
  きゃ + く), for spelling, power, the word's vowel (おちゃ ends in a) and word attacks. A small っ is not a tile, so
  words with one stay out.
- evolved tiles open course words with voiced and small kana (`EVERY_TILE_WORD`, `isTileKana`).
- the collection shows the evolved tiles, and the next evolutions to come with their current level ("か → が at
  level 3 (now 2)", "し → しゃ しゅ しょ…"). Before Sensei it names Sensei instead, and until Zen is beaten it
  says small kana come from beating Zen.
- **The evolution moment**: when a kana evolves (its level reaches 3 after a battle, or anywhere on the site), the
  next battle result, or the Kana Wilds page, says so: "か evolved into が (ga)!", in a status message until it is
  dismissed. Each evolution is announced once: those told are kept in this browser, per learner
  (`useEvolutionMoments`). The first time a browser sees a learner, the evolutions they already have are counted as
  told, so a new device or a returning player isn't shown a banner for each old one.

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

**Beta status (built):** milestone 1, plus from milestone 2 the stance, the full vowel circle, word fatigue and the meaning critical.
- Routes and code:
  - the page is `/games/kana-wilds`, listed on the Kana island;
  - the rules are in `nihon-web/src/lib/kanaWilds/`;
  - the collection API is `/api/kana-wilds` (migration 033, `moji_collection`).
- Wild kana come from the first two rows not yet complete, so the table fills in row by row.
- Grading:
  - attack readings are graded in the browser;
  - the battle is saved as a `battle` practice session (game XP, daily cap);
  - defence readings go through `/quiz/answer`, so they count toward kana progress and the mistake notebook.
- Catching:
  - by tracing, graded against KanjiVG strokes, with a looser tolerance the weaker the kana;
  - for keyboard and screen-reader players, "Which kana is it?" replaces tracing: the kana among its look-alikes and
    row-mates, worked out from the same clues (the stroke count and the attacks, which screen readers announce).
- Words are dealt as a hand of 8 each attack turn (`lib/kanaWilds/hand.ts`), not the strongest 8. The hand always has:
  - 2 words strong against the enemy;
  - 1 word from the latest 2 catches;
  - 1 word read wrong before (remembered in this browser);
  - 1 short word;
  - the rest at random, avoiding words already played this battle.
- **Redraw:** swap the hand for a new one. You lose the attack, but you brace for the enemy's next attack:
  - the block offers 2 choices and no look-alikes;
  - a missed block does half damage.
- **The hidden wild kana** (`reveal.ts`, `enemyAttacks.ts`): the wild kana starts as a blank card ("Wild ？") and shows
  its strokes, in stroke order, as it loses HP: `floor(strokes × HP lost / max HP)`, all of them at 0 HP or when the
  battle ends. Wearing it down is how you learn what you are about to catch.
  - At 80% HP (`STROKE_COUNT_HP_SHARE`) the card tells how many strokes it has ("3 strokes"), before any stroke
    shows. This is the first clue, and the only shape clue a one-stroke kana gets before 0 HP.
  - It attacks with its **moveset** (its look-alikes and the rest of its row, never itself) or with a course **word
    containing it** (up to 4 kana). Words are the clue: the first row uses them 20% of the time, each later row 5%
    more, up to 70%.
  - Each attack is drawn stroke by stroke. Reading it right blocks; reading it before it is fully drawn is a **perfect
    block** and hits back for `COUNTER_DAMAGE` (2).
  - Kana attacks are graded by `/quiz/answer` (progress and mistake notebook for the attacking kana). Word attacks are
    graded in the browser and go on the missed-words list when read wrong.
  - Catching early means tracing from memory: the guide draws only the strokes shown so far, and the hint shows the
    next hidden stroke.
  - A kana of one stroke (く し そ つ て の ひ へ る ろ ん) shows no stroke until 0 HP; its stroke count and its
    attacks are its clues.
  - The HP box shows its vowel and weakness, which the stance needs. With the row known from the area, this narrows
    it to two or three kana, and that is meant as a hint.
- Not yet built:
  - defence levels beyond a plain reading choice;
  - kana levels from mastery;
  - the challengers;
  - katakana;
  - friend battles.

## 15. Open questions

1. Every N5 word playable, or only words from completed lessons? -> every N5 words (every japanese words if you can)
2. Can guests play the first area without saving, like the guest speed quizzes, as a way into signing up? -> no
3. Is the vowel-only start fun enough, or should a new player choose one starter consonant (か, さ or た) to begin
   with 8–11 words instead of 5? -> good idea, allow them to have the base vowel and 1 starter consonant
4. Art: one creature design per kana (46 base forms plus 25 voiced forms, before small-kana combos) is a lot of art. Option: the kana itself is the
   creature, with a face and a shape per vowel column, so each column shares one body style. -> the kana character being the enemy is fine for now, no need for faces and stuff
5. Should challengers come back as harder rematches once beaten? -> yes
