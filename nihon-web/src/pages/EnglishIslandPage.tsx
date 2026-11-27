import Navbar from "../components/Navbar";
import { EnglishPlaceWalk } from "../components/englishTown/EnglishPlaceWalk";
import { ENGLISH_ISLAND as island } from "../data/world/englishIsland";

/** The English learner's home, the English island on foot: walk up to a building to open its page, into the castle's
 *  courtyard, or along the shore lane to the market square. */
export default function EnglishIslandPage() {
  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="relative min-h-0 flex-1">
      <h1 className="sr-only">{island.name} ({island.localName})</h1>
      <EnglishPlaceWalk place={island} sceneKey="island:english" rememberKey="island:english:place" />
    </main>
  </div>;
}
