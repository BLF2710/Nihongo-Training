import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TravellerFigure } from "../components/traveller/TravellerFigure";
import { LOOK_PARTS } from "../lib/travellerLook";
import type { LookPart, TravellerLook } from "../lib/travellerLook";
import { useWardrobe } from "../lib/useWardrobe";
import type { WardrobeStatus } from "../lib/useWardrobe";
import "../components/islandMap/IslandMap.css";

const STATUS_TEXT: Record<WardrobeStatus, string> = {
  idle: "", saving: "Saving…", saved: "Saved. Your traveller wears it everywhere now.", failed: "Could not save your traveller. Please try again.",
};

const BACK_TO_PROFILE = { to: "/profile" };

type LookPartGroup = (typeof LOOK_PARTS)[number];
/** On a phone, a few colours fit in half the width; longer rows take the whole of it. */
const HALF_WIDTH_CHOICES = 4;

/** One part of the look as a row of choices: colour swatches, or named chips. Native radio buttons, so arrow keys work. */
function PartPicker({ group, look, onChoose }: { group: LookPartGroup; look: TravellerLook; onChoose: (part: LookPart, choice: string) => void }) {
  const choices = Object.entries(group.choices);
  const isNarrow = choices.length <= HALF_WIDTH_CHOICES && choices.every(([, choice]) => "colour" in choice);
  return <fieldset className={`min-w-0 ${isNarrow ? "" : "max-sm:col-span-2"}`}>
    <legend className="text-sm font-black text-gray-800">{group.name}</legend>
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {choices.map(([id, choice]) => {
        const isColour = "colour" in choice;
        return <label key={id} className="cursor-pointer">
          <input type="radio" name={group.part} value={id} checked={look[group.part] === id} onChange={() => onChoose(group.part, id)} className="peer sr-only" />
          {isColour
            ? <span title={choice.label} className="block size-8 rounded-full border-2 border-white shadow ring-2 ring-gray-200 peer-checked:ring-emerald-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-700" style={{ backgroundColor: choice.colour }}>
              <span className="sr-only">{choice.label}</span></span>
            : <span className="block rounded-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-700 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-800 peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-700">{choice.label}</span>}
        </label>;
      })}
    </div>
  </fieldset>;
}

/** The wardrobe: dress the traveller who walks the islands, see it at once, and save it. */
export default function WardrobePage() {
  const { look, isChanged, status, choose, resetToDefault, save } = useWardrobe();
  const [isWalking, setIsWalking] = useState(false);
  // Every choice offered comes from LOOK_PARTS, so it is one of that part's ids.
  const onChoose = (part: LookPart, choice: string) => choose(part, choice as TravellerLook[typeof part]);
  return <div className="flex min-h-dvh flex-col bg-gray-50 text-gray-900"><Navbar back={BACK_TO_PROFILE} />
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-4 px-4 py-4 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start md:py-6">
      <section aria-labelledby="wardrobe-heading" className="island-map flex items-center gap-4 rounded-3xl border border-amber-100 bg-linear-to-b from-sky-100 to-emerald-100 p-3 sm:p-4 md:sticky md:top-4 md:flex-col">
        <div className="h-28 shrink-0 sm:h-44 md:order-2 md:my-3 md:h-72" role="img" aria-label="Your traveller as you've dressed them"><TravellerFigure look={look} isWalking={isWalking} /></div>
        <div className="min-w-0 md:order-1 md:self-start">
          <h1 id="wardrobe-heading" className="text-2xl font-black">Your traveller</h1>
          <p className="text-sm text-gray-600 max-sm:hidden">Who walks the islands, the village and the wild paths with you.</p>
          <button type="button" onClick={() => setIsWalking(!isWalking)} aria-pressed={isWalking} className="mt-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700 focus-visible:outline-2 focus-visible:outline-emerald-700">
            {isWalking ? "Stop walking" : "Walk"}
          </button>
        </div>
      </section>
      <section aria-label="Choose your traveller's look" className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">{LOOK_PARTS.map(group => <PartPicker key={group.part} group={group} look={look} onChoose={onChoose} />)}</div>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
          <button type="button" onClick={() => void save()} disabled={!isChanged || status === "saving"} className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white disabled:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Save</button>
          <button type="button" onClick={resetToDefault} className="text-sm font-bold text-gray-600 hover:underline">Back to the first look</button>
          <Link to="/village" className="ml-auto text-sm font-bold max-sm:hidden text-emerald-700 hover:underline">Walk the village →</Link>
          <p role="status" className={`w-full text-sm ${status === "failed" ? "text-red-700" : "text-gray-600"}`}>{STATUS_TEXT[status]}</p>
        </div>
      </section>
    </main>
  </div>;
}
