import { useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../api/errors";
import { enrollSrsItems } from "../api/srs";
import type { Kanji } from "../data/kanji";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
type Outcome = "added" | "already" | null;

/** Adds one kanji to the learner's daily review (spaced repetition); a card already there keeps its schedule. */
export default function KanjiReviewButton({ kanji }: { kanji: Kanji }) {
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const add = async () => {
    setIsSaving(true); setError("");
    try { setOutcome(await enrollSrsItems([{ itemType: "kanji", itemId: kanji.id }]) ? "added" : "already"); }
    catch (failure) { setError(apiErrorMessage(failure, "The kanji could not be added to your daily review.")); }
    finally { setIsSaving(false); }
  };
  return <div className="ml-3 mt-5 inline-flex flex-wrap items-center gap-3 align-top">
    {outcome
      ? <><span role="status" className="rounded-xl bg-emerald-50 px-4 py-3 font-bold text-emerald-800">{outcome === "added" ? "Added to your daily review ✓" : "Already in your daily review ✓"}</span>
        <Link to="/srs/deck" className={`font-semibold text-emerald-700 hover:underline ${focus}`}>Your deck →</Link></>
      : <button type="button" disabled={isSaving} onClick={() => void add()} className={`rounded-xl border px-5 py-3 font-bold disabled:opacity-50 ${focus}`}>{isSaving ? "Adding…" : "Add to daily review"}</button>}
    {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}
  </div>;
}
