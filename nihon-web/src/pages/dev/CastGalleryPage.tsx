import { GuideNote, Portrait } from "../../components/cast/GuideNote";
import { FujiTrail } from "../../components/exam/FujiTrail";
import { CAST } from "../../lib/cast";
import { trailStations } from "../../lib/fujiTrail";
import type { Mood } from "../../lib/cast";

const MOODS: readonly Mood[] = ["happy", "calm", "worried"];
// How much of the exam's time has gone, for the sky samples.
const EXAM_TIMES = [0.05, 0.35, 0.7, 0.92];
const CLIMBS = [0, 0.45, 1] as const;
const stationsAt = (climbed: number) => trailStations([15, 15, 6].map((total, index) => ({ title: `Section ${index + 1}`, total, isComplete: climbed >= [15, 30, 36][index] / 36 })));

/** Development only (/dev/cast): every character in every mood, one speaking, and the mock exam's Fuji climb at the foot,
 *  partway and at the summit, for checking the drawings. */
export default function CastGalleryPage() {
  return <main className="mx-auto max-w-5xl p-6 text-gray-900">
    <h1 className="text-2xl font-black">Island cast</h1>
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.values(CAST).map(character => <li key={character.id} className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="font-bold">{character.name} <span className="font-normal text-gray-500">· {character.island}</span></p>
      <div className="mt-3 flex gap-3">{MOODS.map(mood => <Portrait key={mood} character={character.id} mood={mood} />)}</div>
    </li>)}</ul>
    <GuideNote character="zen" className="mt-8 max-w-xl"><p>The garden is raked. Nothing to review right now.</p></GuideNote>
    <h2 className="mt-10 text-xl font-black">Fuji climb</h2>
    <div className="mt-4 space-y-4">{CLIMBS.map(climbed => <FujiTrail key={climbed} stations={stationsAt(climbed)} climbed={climbed} label={`Climbed ${climbed * 100}%`} className="aspect-[35/9] rounded-2xl border border-gray-200" />)}</div>
    <h2 className="mt-10 text-xl font-black">Exam clock: dawn to night</h2>
    <div className="mt-4 space-y-4">{EXAM_TIMES.map(elapsed => <FujiTrail key={elapsed} stations={stationsAt(elapsed)} climbed={elapsed} elapsed={elapsed} label={`${elapsed * 100}% of the time gone`} className="h-36 rounded-2xl border border-gray-200" />)}</div>
  </main>;
}
