// The island cast who challenge the player on their islands (docs/WORLD.md section 4). Content only; the rules
// live in lib/world/challenges. The API keeps the ids it accepts (kana-wilds.service.ts) in step with these.
import { teamOf } from "../../lib/world/challenges.ts";
import type { Challenger, ChallengerId } from "../../lib/world/challenges.ts";

// Each team comes from the rows in the grass of the path to that island, and each kana has a look-alike to trip on.

/** Chun, on the Kana island: あ, こ, お (look-alikes お, に, あ). */
const CHUN: Challenger = { id: "chun", character: "chun", team: teamOf("あこお") };
/** Tama, on the Practice island: さ, ち, つ (look-alikes ち and き, さ, し). */
const TAMA: Challenger = { id: "tama", character: "tama", team: teamOf("さちつ") };
/** Pon, on the Games island: ぬ, ね, は (look-alikes め, れ and わ, ほ and け). */
const PON: Challenger = { id: "pon", character: "pon", team: teamOf("ぬねは") };

export const CHALLENGERS: Readonly<Record<ChallengerId, Challenger>> = { chun: CHUN, tama: TAMA, pon: PON };
