# The world: islands, wild paths and bosses

How Kana Wilds becomes part of the island map. The battles themselves are in `KANA-BATTLE.md`.

## 1. The shape of it

- **The island map stays the lobby.** It is still the first screen after signing in. Home and every learning tool
  stay one tap away, so studying never takes a walk.
- **The village square is the hub.** Three roads lead out of it, each onto a wild path: east to the Kana island,
  north to the Practice island, south to the Games island. All three are open from the start, in any order.
- **Wild paths** are the routes from Home to an island. On the map, a path is marked on the bridge it runs along.
  Opening it from the map puts the traveller at the Home end, on foot, in the same walking scene as the village.
- **Tall grass** grows along a path. Each step into a new grass tile can start a wild kana battle. The path itself
  mostly goes around the grass, so you choose how much to grind, but one band of grass crosses the whole way.
- **Each path ends on an island you can walk around** (milestone 4). Its buildings' doors open that island's pages,
  its challenger waits among them, and its bridge leads back onto the path.
- **Each island looks like its art on the map, and so does the path to it:** cherry trees and fallen petals for Kana
  (a temple garden), bamboo for Practice (a gravel courtyard with a pond), an evening festival for Games (stalls,
  lanterns and a goldfish pool; lanterns line the forest path too), autumn maples for Lessons (a temple school with
  the island map's five-storey pagoda at the head of stepping stones from the bridge, two ponds and stone lanterns;
  falling leaves; maples and lanterns along the stone path), a zen garden for Review (raked gravel with rings round
  mossy rocks, a pond, garden pines; pines along the pine path too), high on a snowy mountain for Fuji (the ground is
  snow, with deeper drifts, rocks, stone lanterns and snow falling; the island's edge drops to a sea of clouds lying all
  round, and the summit and far peaks rise out of it behind, under the sky; the ferry rows there from the Practice
  island).
- **Each path runs the way its island lies from Home on the island map** (`heading`, from the landscape layout):
  the meadow path east to Kana, the riverside path west to Practice, the forest path south (down) to Games and the
  stone path north (up) to Lessons and the pine path west to Review. The ferry starts on an island: west from the
  Practice island's west pier to Fuji, so headings are measured from where a path starts (`between[0]`). North–south paths are tall maps walked up or
  down, east–west ones wide. The village's road out to each leaves on that side of the square (two leave westward:
  Practice's from the upper garden, Review's off the main road), each island's bridge back is on the side its path comes from, and a bridge onward
  (the Practice island's west pier) on the side its path heads.
  The walking hint says which way each end lies ("South: the village, north: the Games island"; a path from an island names both, "East: the Practice island, west: Fuji").
- **Each path has its own shape:** the meadow winds round a pond through flower beds under cherry trees; the
  riverside path follows a river's north bank and crosses a stream; the forest path zigzags down switchbacks through
  a dark wood; the stone path climbs zigzag stepping stones and crosses a stream on a little bridge. The pine path
  passes raked gravel and a pond. Each has one band of tall grass right across, so reaching the island means meeting
  the grass.
- **The ferry to Fuji is a boat ride** (`travel: "boat"`; every other path is `"foot"`). Fuji has no bridge on the
  island map, so the traveller rows a boat (drawn under them, turning the way they row) from the Practice island's
  pier across the sea, past rocks standing in the water, to Fuji's pier. Terrains: `sea` (s, open water to row on),
  `waves` (v, rough water) and `pier` (j, planks the boat moors beside). Rough water does what tall grass does: a
  band runs right across, and wild kana leap out of it (`isWildTerrain` in `lib/world/grassEncounters.ts`). The hint
  says "Row" and "Row hard" (Shift). Bridges are drawn with their planks
  across the way they run.
- **The island cast challenge you on their islands** (milestones 3–4). A win is saved and pays XP the first time;
  nothing is locked behind it.
- **Grinding is real study.** Battle answers already go to the server, so time in the grass raises each kana's
  mastery (milestone 2), which makes its word tiles stronger.

## 2. Milestones

1. **The first wild path (done).**
   - Home to the Kana island, along their bridge, marked on the map and listed on the Kana island's panel.
   - A walkable route with tall grass; encounters while walking; the battle opens over the path and returns you to
     the same spot.
   - Walking off either end goes back to the map with that island selected.
   - The Kana Wilds page stays as your collection, with a quick battle for when you don't want to walk.
2. **Kana mastery levels (done):** each kana's level (1–5) from your real answers, shown in the collection, scaling
   tile power. Rules in docs/KANA-BATTLE.md section 8.
3. **The first challenger (done):** Chun, with a challenge of three open kana; the win saved by the API.
4. **Paths lead to islands (done):**
   - The village square's roads end at path gates; every path is open, in any order.
   - Six paths: the meadow path (Home to Kana: vowels, か row), the riverside path (Home to Practice: さ, た rows),
     the forest path (Home to Games: な, は rows), the stone path (Home to Lessons: ま, や, ら, わ rows and ん), the
     pine path (Home to Review: review grass) and the ferry (Practice to Fuji by boat: every open row).
   - The far end of a path is a walkable island (`/islands/:islandId`): buildings for its pages, its challenger
     (Chun on Kana, Tama on Practice, Pon on Games, Sensei on Lessons, Zen on Review, Kurama on Fuji), and a bridge back
     onto the path at the island end (and, on the Practice island, a pier for the ferry to Fuji). The Lessons island's halls open all units (がっこう), vocabulary (ことば), grammar
     (ぶんぽう) and unit assessments (しけん); its pagoda opens the mock exam (もぎしけん). The Review island's halls
     open the daily review (まいにち), the mistake notebook (まちがい) and unit review (ふくしゅう). Fuji's open the
     levels (のぼる), the mock exam (もぎしけん) and statistics (きろく).
   - The path's Home end returns to the village square. The map stays the lobby; its markers open a path at Home.
5. **Next:** more rows on more paths, then katakana as its own region.

## 3. Rules

- **Encounters** (`lib/world/grassEncounters.ts`): stepping onto a new tall-grass tile starts a battle with a chance of
  `ENCOUNTER_CHANCE` (1 in 8). After a battle, the next `SAFE_GRASS_STEPS` (3) grass tiles are safe, so you can walk
  out of the grass.
- **Which kana** (`grass` on each path, `grassRowsOf`): most paths have their own rows (`wildRows`), and some are held back until a challenger is beaten
  (`rewardRows`, docs/KANA-BATTLE.md section 9): the meadow path has the vowels and the か row; the riverside path is
  quiet (no battles) until Chun is beaten, then has the さ and た rows; the forest path has the な and は rows; the
  stone path is quiet until Tama is beaten, then has the ま, や, ら, わ rows and ん; the ferry's rough water holds
  every row open on any path ("every-open-row"); the pine path's is a **review** ("review",
  `pickReviewEncounter`): kana already caught, from every open row, which can't be caught again. The path's sign says who holds rows back. The API refuses catches of
  held-back kana the same way. Kana not yet caught come from the first two open rows still incomplete; once a path's
  rows are all caught, its kana still appear for practice. The quick battle draws from every row open now.
- **Before a starter is chosen,** the path asks you to choose one first (and an island does, before a challenge).
- **Ends of a path:** `/wilds/:routeId?from=<island>` opens the path at that island's end (`arrivalOn`), or at the
  Home end when `from` is missing or isn't one of its ends. Leaving for Home goes to `/village?from=<path>`; leaving
  for an island goes to `/islands/<island>?from=<path>` (`exitHref`), where the traveller appears by that path's
  bridge (`arrivals`, `islandArrivalFrom`). Arriving never puts the traveller within
  reach of an exit.
- **Remembered spots:** the village and each island remember where the traveller stood (for the tab), so coming back
  from a building's page puts them by its door. Coming off a path overrides that: they appear at the end of its road
  (village) or by the bridge (island), and `?from=` is then dropped from the address (`lib/world/useArrival.ts`).
- **Roads out of the village** run through a gap in the trees at the edge of the square, with the path's gate at the
  end. Walking scenes (paths and islands) have no Back button: their ways out are on foot.

## 4. Challengers

- A challenger stands on their island, marked "!" until beaten. Walk up and press E (or tap Fight).
- A challenge is a battle against each kana of the challenger's team in turn (`lib/world/challenges.ts`). A team is
  fixed, or chosen from the learner's own kana as the challenge starts (`teamFor`): Zen's three weakest, Kurama's
  three of all of them, mixed. The kana are
  in the open (not hidden), can't be caught, and your HP carries over between them. Wearing a kana out wins the round.
- Losing, or giving up, costs nothing: the challenger tells you their team, a tip and the kana you mixed up ("You read
  ね as れ twice"), and you can try again at once.
- A win is saved by the API (`POST /kana-wilds/challengers/:id/wins`, migration 034); the first win pays game XP once.
  The collection's `beatenChallengers` marks who is beaten; a rematch is always on offer. The challenge's readings
  count as battle practice.
- Teams and signature defences (`data/world/challengers.ts`, docs/KANA-BATTLE.md section 6): Chun あ, こ, お with
  look-alikes; Tama さ, ち, つ, whose kana shout; Pon ぬ, ね, は with the stroke reveal; Sensei が, だ, ば with word
  attacks; Zen your three weakest kana with recall (type the reading); Kurama three of your kana, brush-written.
- Rewards (docs/KANA-BATTLE.md section 9): Chun and Tama bring rows into a path's grass; Pon teaches the skill Sharp
  Eyes (wild kana show their stroke count from the start); Sensei opens voiced evolution (か → が at level 3); Zen
  opens small-kana evolution (き → きゃ, きゅ, きょ at level 3); Kurama's win is kept for the katakana wilds (not
  built yet).

## 5. Code

- Tall grass is a terrain (`tallgrass`, written `w` in a map) in `lib/errands/townMap.ts`; it doesn't block walking.
- Paths are data in `data/world/routes.ts` (`WildRoute`: its map, the islands at each end, and its exits, each with
  an arrival spot). The page is `/wilds/:routeId` (`pages/WildRoutePage.tsx`).
- Islands on foot are data in `data/world/islandScenes.ts` (`IslandScene`: its own ground, buildings with their
  doors, the challenger, lanterns, the bridge door back, and its `theme`).
- Looks: terrains `sakura` (S), `bamboo` (B), `petals` (p), `goldfish` (g), `pine` (P), `raked` (z), `rock` (k)
  `snow` (n), `sea` (s), `waves` (v), `pier` (j) and `cloud` (c, the sea of clouds below Fuji's edge: blocking, with a
  strip of cliff where the ground drops to it) in `lib/errands/townMap.ts`, drawn in
  `VillageGround`/`VillageScenery`; `VillageScene`'s `theme` (`lib/world/sceneTheme.ts`) tints the sky and ground
  (on the mountain the ground itself is snow) and lets blossom fall on cherry-tree scenes, leaves in the maples and
  snow on the mountain. Fuji's theme is `summit` (the ferry's stays `mountain`).
- **Beyond the map** every scene has two things, so none looks like a square cut out of nothing:
  - Its `surroundings` (`lib/world/sceneTheme.ts`), the ground past every edge: `woods` (the paths and the village
    square: crowns of trees from above, in the look's forest colour), `water` (round every island, `surroundings` on
    `IslandScene`, and the sea the ferry crosses) or `clouds` (the sea of clouds below Fuji).
  - A backdrop past its far (north) edge under the sky (`components/errands/backdrops`): one card per look, drawn from
    shared pieces (hills, far trees, silhouettes). Home (the village square): blue mountains and green hills under
    clouds. Sakura: spring hills with a pagoda, thick with cherry blossom. Bamboo: misty hills behind a bamboo grove.
    Festival: an evening sky with fireworks, dark hills, lanterns strung across. Maple: autumn mountains with a temple
    hall, maples in red and gold. Zen: ink-wash hills fading into mist, a pale sun, pines. The ferry: a low line of
    islands across the sea, Fuji far off to the west. Fuji: the summit and far peaks standing out of the clouds.
    The camera looks steeply down, so only the top of the screen shows past the map: the card stands just past the
    edge and nothing on it is taller than about 3.5 tiles, or only its foot would show. Colours come from the look
    (`--backdrop-far`, `--backdrop-mid`, `--backdrop-near` and the scene's own), each with a dark-mode value. The page is `/islands/:islandId` (`pages/IslandScenePage.tsx`).
- The village's path gates are doors with an `action` ("Go") in `data/village/villageSquare.ts`.
- Walking (held keys, the frame loop, the E key) is shared by the path and the islands through
  `lib/world/useWorldWalk.ts`; the battle overlay through `components/kanaWilds/BattleOverlay.tsx`.
- The battle flow (collection, words, challenges, saving catches, wins and practice) is shared by the path and the
  Kana Wilds page through `lib/kanaWilds/useWildBattles.ts`.
- Challengers are content in `data/world/challengers.ts`; the API's `CHALLENGER_IDS` (`kana-wilds.service.ts`) must
  list the same ids.
