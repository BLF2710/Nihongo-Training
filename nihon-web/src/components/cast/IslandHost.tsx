import { characterOf, introduce } from "../../lib/cast";
import { GREETINGS, lineOfTheDay } from "../../lib/castLines";
import type { IslandId } from "../../lib/islandMap";
import { Portrait } from "./GuideNote";
import "./cast.css";

/** The island's character greeting the learner in the strip at the top of the island's pages, with the line of the day. */
export function IslandHost({ island }: { island: IslandId }) {
  const character = characterOf(island);
  return <div className="flex min-w-0 items-center gap-2">
    <span className="cast-host"><Portrait character={character.id} mood="happy" size="strip" /></span>
    <p className="cast-bubble cast-bubble-tight relative min-w-0 rounded-xl px-3 py-1 text-xs leading-snug text-gray-800 max-sm:hidden">
      <span className="block font-bold text-gray-500">{introduce(character)}</span>
      <span className="line-clamp-2">{lineOfTheDay(GREETINGS[island], new Date())}</span>
    </p>
  </div>;
}
