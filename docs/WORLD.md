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
  lanterns and a goldfish pool; lanterns line the forest path too).
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
   - Three paths: the meadow path (Home to Kana: vowels, か row), the riverside path (Home to Practice: さ, た rows)
     and the forest path (Home to Games: な, は rows).
   - The far end of a path is a walkable island (`/islands/:islandId`): buildings for its pages, its challenger
     (Chun on Kana, Tama on Practice, Pon on Games), and a bridge back onto the path at the island end.
   - The path's Home end returns to the village square. The map stays the lobby; its markers open a path at Home.
5. **Next:** more rows on more paths, then katakana as its own region.

## 3. Rules

- **Encounters** (`lib/world/grassEncounters.ts`): stepping onto a new tall-grass tile starts a battle with a chance of
  `ENCOUNTER_CHANCE` (1 in 8). After a battle, the next `SAFE_GRASS_STEPS` (3) grass tiles are safe, so you can walk
  out of the grass.
- **Which kana:** each path has its own rows (`wildRows`): the meadow path the vowels and the か row, the riverside
  path the さ and た rows. Kana not yet caught come from the first two of them still incomplete; once a path's rows
  are all caught, its kana still appear for practice. The quick battle draws from every path's rows.
- **Before a starter is chosen,** the path asks you to choose one first (and an island does, before a challenge).
- **Ends of a path:** `/wilds/:routeId?from=<island>` opens the path at that island's end (`arrivalOn`), or at the
  Home end when `from` is missing or isn't one of its ends. Leaving for Home goes to `/village?from=<path>`; leaving
  for another island goes to `/islands/<island>?from=<path>` (`exitHref`). Arriving never puts the traveller within
  reach of an exit.
- **Remembered spots:** the village and each island remember where the traveller stood (for the tab), so coming back
  from a building's page puts them by its door. Coming off a path overrides that: they appear at the end of its road
  (village) or by the bridge (island), and `?from=` is then dropped from the address (`lib/world/useArrival.ts`).
- **Roads out of the village** run through a gap in the trees at the edge of the square, with the path's gate at the
  end. Walking scenes (paths and islands) have no Back button: their ways out are on foot.

## 4. Challengers

- A challenger stands on their island, marked "!" until beaten. Walk up and press E (or tap Fight).
- A challenge is a battle against each kana of the challenger's team in turn (`lib/world/challenges.ts`). The kana are
  in the open (not hidden), can't be caught, and your HP carries over between them. Wearing a kana out wins the round.
- Losing, or giving up, costs nothing: the challenger tells you their team and you can try again at once.
- A win is saved by the API (`POST /kana-wilds/challengers/:id/wins`, migration 034); the first win pays game XP once.
  The collection's `beatenChallengers` marks who is beaten; a rematch is always on offer. The challenge's readings
  count as battle practice.
- Teams (`data/world/challengers.ts`): Chun あ, こ, お (each with a look-alike); Tama さ, ち, つ; Pon ぬ, ね, は.

## 5. Code

- Tall grass is a terrain (`tallgrass`, written `w` in a map) in `lib/errands/townMap.ts`; it doesn't block walking.
- Paths are data in `data/world/routes.ts` (`WildRoute`: its map, the islands at each end, and its exits, each with
  an arrival spot). The page is `/wilds/:routeId` (`pages/WildRoutePage.tsx`).
- Islands on foot are data in `data/world/islandScenes.ts` (`IslandScene`: its own ground, buildings with their
  doors, the challenger, lanterns, the bridge door back, and its `theme`).
- Looks: terrains `sakura` (S), `bamboo` (B), `petals` (p) and `goldfish` (g) in `lib/errands/townMap.ts`, drawn in
  `VillageGround`/`VillageScenery`; `VillageScene`'s `theme` (`lib/world/sceneTheme.ts`) tints the sky and ground and
  lets blossom fall on cherry-tree scenes. The page is `/islands/:islandId` (`pages/IslandScenePage.tsx`).
- The village's path gates are doors with an `action` ("Go") in `data/village/villageSquare.ts`.
- Walking (held keys, the frame loop, the E key) is shared by the path and the islands through
  `lib/world/useWorldWalk.ts`; the battle overlay through `components/kanaWilds/BattleOverlay.tsx`.
- The battle flow (collection, words, challenges, saving catches, wins and practice) is shared by the path and the
  Kana Wilds page through `lib/kanaWilds/useWildBattles.ts`.
- Challengers are content in `data/world/challengers.ts`; the API's `CHALLENGER_IDS` (`kana-wilds.service.ts`) must
  list the same ids.
