import { useCallback, useState } from "react";
import Navbar from "../../components/Navbar";
import { EnglishPlaceWalk } from "../../components/englishTown/EnglishPlaceWalk";
import { TownsfolkPanel } from "../../components/englishTown/TownsfolkPanel";
import { DailyErrandsBoard } from "../../components/village/DailyErrandsBoard";
import { ENGLISH_COURTYARD } from "../../data/world/englishCourtyard";
import { ENGLISH_MARKET_SQUARE } from "../../data/world/englishMarketSquare";
import type { ModelIsland } from "../../data/world/modelIsland";
import { englishTownErrands, townsfolkNews } from "../../lib/englishTown/townNews";
import { TOWNSFOLK } from "../../lib/englishTown/townsfolk";
import type { TownsfolkId } from "../../lib/englishTown/townsfolk";
import { useEnglishTownData } from "../../lib/englishTown/useEnglishTownData";

// The English isle's places with townsfolk (/english/castle, /english/market-square): walk about, talk to the
// townsfolk for the day's news from the learner's English study, and in the market square see the day's errands,
// whose banners turn gold as they get done.

export type EnglishTownPlaceId = "castle" | "market-square";
/** Each place, and whether its errands board stands there (the market square's, as the village square's does). */
const PLACES: Readonly<Record<EnglishTownPlaceId, { place: ModelIsland; hasErrandsBoard: boolean }>> = {
  castle: { place: ENGLISH_COURTYARD, hasErrandsBoard: false },
  "market-square": { place: ENGLISH_MARKET_SQUARE, hasErrandsBoard: true },
};

export default function EnglishTownPage({ placeId }: { placeId: EnglishTownPlaceId }) {
  const { place, hasErrandsBoard } = PLACES[placeId];
  const { data, isLoading } = useEnglishTownData();
  const errands = englishTownErrands(data);
  const [talkingTo, setTalkingTo] = useState<TownsfolkId | null>(null);
  const close = useCallback(() => setTalkingTo(null), [setTalkingTo]);
  const markedIds = place.townsfolk.filter(({ id }) => townsfolkNews(id, data, errands).hasNews).map(({ id }) => id);
  const done = errands.filter(errand => errand.isDone).length;
  const banners = place.scene.lanterns?.length ?? 0;
  const litLanterns = errands.length ? Math.floor(banners * done / errands.length) : 0;
  const board = hasErrandsBoard ? <DailyErrandsBoard errands={errands.map(errand => ({ ...errand, giverName: TOWNSFOLK[errand.giver].name }))}
    status={isLoading ? "loading" : data.today === null ? "unavailable" : "ready"} allDoneText="All done: the banners are gold! 🏅" /> : null;

  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="relative min-h-0 flex-1">
      <h1 className="sr-only">{place.name} ({place.localName})</h1>
      <EnglishPlaceWalk place={place} sceneKey={`english:${placeId}`} rememberKey={`english:${placeId}:place`} talkingTo={talkingTo} onTalk={setTalkingTo}
        markedIds={markedIds} litLanterns={litLanterns} corner={board}>
        {talkingTo && <TownsfolkPanel townsperson={talkingTo} news={townsfolkNews(talkingTo, data, errands)} onClose={close} />}
      </EnglishPlaceWalk>
    </main>
  </div>;
}
