import { useState } from "react";
import { GuideNote } from "../cast/GuideNote";
import { STARTERS, VOWEL_IDS, kanaById } from "../../lib/kanaWilds/gojuon";
import type { Starter } from "../../lib/kanaWilds/gojuon";
import { playableWords } from "../../lib/kanaWilds/words";
import type { BattleWord } from "../../lib/kanaWilds/words";
import { focusRing, sheet } from "./styles";

const VOWEL_CHARACTERS = VOWEL_IDS.flatMap(id => kanaById(id)?.kana ?? []);

/** The first visit: the five vowels are given, and the learner picks one consonant to start with. */
export function StarterChoice({ words, onChoose }: { words: readonly BattleWord[]; onChoose: (starter: Starter) => Promise<void> }) {
  const [isSaving, setIsSaving] = useState(false);
  const choose = async (starter: Starter) => {
    setIsSaving(true);
    try { await onChoose(starter); } finally { setIsSaving(false); }
  };
  return <section className={sheet} aria-labelledby="starter-heading">
    <GuideNote character="chun" mood="happy"><p>Chirp! Wild kana live in the tall grass. You get the five vowels, <span lang="ja">{VOWEL_CHARACTERS.join(" ")}</span>, and one more kana to start. Which one?</p></GuideNote>
    <h2 id="starter-heading" className="mt-4 text-xl font-black">Choose your starter kana</h2>
    <p className="mt-1 text-sm text-gray-600">You attack by spelling course words with the kana you own. Each starter opens different words; you can catch the others later.</p>
    <div className="mt-4 grid grid-cols-3 gap-3">
      {STARTERS.map(({ key, kanaId }) => {
        const kana = kanaById(kanaId);
        if (!kana) return null;
        const opened = playableWords(words, new Set([...VOWEL_CHARACTERS, kana.kana]));
        return <button key={key} type="button" disabled={isSaving} onClick={() => void choose(key)}
          className={`rounded-2xl border-2 border-gray-200 bg-white p-3 text-center hover:border-emerald-400 disabled:opacity-60 ${focusRing}`}
          aria-label={`${kana.kana} (${kana.romaji}): ${opened.length} words`}>
          <span lang="ja" className="block text-5xl font-black">{kana.kana}</span>
          <span className="mt-1 block font-bold">{kana.romaji}</span>
          <span className="mt-1 block text-xs text-gray-600">{opened.length} words</span>
          <span lang="ja" className="mt-1 block truncate text-xs text-gray-500">{opened.slice(0, 3).map(word => word.japanese).join("・")}</span>
        </button>;
      })}
    </div>
  </section>;
}
