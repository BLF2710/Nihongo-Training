import { useEffect, useMemo, useRef, useState } from "react";
import { Portrait } from "../cast/GuideNote";
import RubyText from "../RubyText";
import { TravellerArt } from "../islandMap/Traveller";
import { CAST } from "../../lib/cast";
import { shuffle } from "../../lib/random";
import type { Reply, Speaker, Step } from "../../lib/errands/conversation";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const primary = `rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 ${focus}`;
const secondary = `rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50 ${focus}`;
const tileButton = `rounded-lg border-2 border-gray-300 bg-white px-3 py-1.5 text-lg font-bold text-gray-900 hover:border-emerald-500 ${focus}`;

const speakerName = (speaker: Speaker) => speaker === "traveller" ? "You" : CAST[speaker].name;

function SpeakerPicture({ speaker }: { speaker: Speaker }) {
  if (speaker !== "traveller") return <Portrait character={speaker} mood="happy" size="medium" />;
  return <span className="island-map block size-16 shrink-0 rounded-full bg-amber-50 p-1"><TravellerArt /></span>;
}

/** The English for a line or reply: shown when the learner keeps translations on, otherwise one tap away. */
function English({ text, isShown }: { text: string; isShown: boolean }) {
  const [isRevealed, setIsRevealed] = useState(false);
  if (isShown || isRevealed) return <p className="text-sm text-gray-600">{text}</p>;
  return <button type="button" className={`text-sm font-semibold text-emerald-700 hover:underline ${focus}`} onClick={() => setIsRevealed(true)}>Show English</button>;
}

/** Number keys 1–9 pick the matching button. */
function useNumberKeys(count: number, onPick: (index: number) => void) {
  const pick = useRef(onPick);
  useEffect(() => { pick.current = onPick; });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < count && !event.repeat) { event.preventDefault(); pick.current(index); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);
}

function Replies({ step, showsEnglish, onReply }: { step: Extract<Step, { kind: "choose" }>; showsEnglish: boolean; onReply: (reply: Reply) => void }) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => first.current?.focus(), [step]);
  useNumberKeys(step.replies.length, index => onReply(step.replies[index]));
  return <ol className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Replies">
    {step.replies.map((reply, index) => <li key={reply.japanese}>
      <button ref={index === 0 ? first : undefined} type="button" onClick={() => onReply(reply)} className={`${tileButton} w-full text-left`}>
        <span className="mr-2 text-xs font-bold text-gray-400" aria-hidden="true">{index + 1}</span><span lang="ja"><RubyText text={reply.japanese} /></span>
        {showsEnglish && <span className="mt-0.5 block text-xs font-normal text-gray-500">{reply.english}</span>}
      </button>
    </li>)}
  </ol>;
}

function SentenceBuilder({ step, onBuild }: { step: Extract<Step, { kind: "build" }>; onBuild: (tiles: string[]) => void }) {
  // The tiles are shuffled once per question, so they don't jump around while the learner builds.
  const tiles = useMemo(() => shuffle([...step.answer, ...step.spare].map((text, index) => ({ text, index }))), [step]);
  const [placed, setPlaced] = useState<number[]>([]);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => first.current?.focus(), [step]);
  const remaining = tiles.filter(tile => !placed.includes(tile.index));
  const place = (index: number) => setPlaced(current => [...current, index]);
  useNumberKeys(remaining.length, index => place(remaining[index].index));
  const sentence = placed.map(index => tiles.find(tile => tile.index === index)?.text ?? "");
  return <div className="mt-3">
    <p className="min-h-12 rounded-xl border-2 border-dashed border-gray-300 bg-white/70 px-3 py-2 text-xl font-bold text-gray-900" aria-live="polite" aria-label="Your sentence">
      {sentence.length ? sentence.join(" ") : <span className="text-base font-normal text-gray-400">Pick the words in order.</span>}
    </p>
    <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Words">
      {remaining.map((tile, position) => <button ref={position === 0 ? first : undefined} key={tile.index} type="button" className={tileButton} onClick={() => place(tile.index)}>
        <span className="mr-1.5 text-xs font-bold text-gray-400" aria-hidden="true">{position + 1}</span>{tile.text}
      </button>)}
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" className={primary} disabled={placed.length === 0} onClick={() => { onBuild(sentence); setPlaced([]); }}>Say it</button>
      <button type="button" className={secondary} disabled={placed.length === 0} onClick={() => setPlaced(current => current.slice(0, -1))}>Undo</button>
      <button type="button" className={secondary} disabled={placed.length === 0} onClick={() => setPlaced([])}>Clear</button>
    </div>
  </div>;
}

function LineView({ step, showsEnglish, onNext }: { step: Extract<Step, { kind: "say" }>; showsEnglish: boolean; onNext: () => void }) {
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => next.current?.focus(), [step]);
  return <>
    <p className="mt-1 text-xl font-bold leading-relaxed text-gray-900 sm:text-2xl" lang="ja"><RubyText text={step.line.japanese} /></p>
    <English key={step.line.japanese} text={step.line.english} isShown={showsEnglish} />
    {step.hint && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"><span className="font-bold">Hint: </span>{step.hint}</p>}
    <div className="mt-3 flex justify-end">
      <button ref={next} type="button" className={primary} onClick={onNext}>{step.next ? "Next ▸" : "Done"}</button>
    </div>
  </>;
}

type DialoguePanelProps = {
  speaker: Speaker; step: Step; showsEnglish: boolean; onShowsEnglishChange: (isShown: boolean) => void;
  onNext: () => void; onReply: (reply: Reply) => void; onBuild: (tiles: string[]) => void; onLeave: () => void;
};

/** A conversation with a villager, over the bottom of the village: what they say, or what the learner answers. */
export function DialoguePanel({ speaker, step, showsEnglish, onShowsEnglishChange, onNext, onReply, onBuild, onLeave }: DialoguePanelProps) {
  const isQuestion = step.kind !== "say";
  return <section role="dialog" aria-label={`Talking with ${speakerName(speaker)}`} className="notice-sheet absolute inset-x-2 bottom-2 z-[1000] mx-auto max-w-3xl p-4 pt-5 sm:inset-x-4 sm:bottom-4 sm:p-5 sm:pt-6">
    <div className="flex items-start gap-3">
      <SpeakerPicture speaker={isQuestion ? "traveller" : speaker} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">{isQuestion ? "Your turn" : speakerName(speaker)}</p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
              <input type="checkbox" checked={showsEnglish} onChange={event => onShowsEnglishChange(event.target.checked)} /> English
            </label>
            {isQuestion && <button type="button" className={`text-xs font-semibold text-gray-500 hover:underline ${focus}`} onClick={onLeave}>Leave</button>}
          </div>
        </div>
        {step.kind === "say" && <LineView step={step} showsEnglish={showsEnglish} onNext={onNext} />}
        {step.kind !== "say" && <p className="mt-1 font-bold text-gray-900">{step.task}</p>}
        {step.kind === "choose" && <Replies step={step} showsEnglish={showsEnglish} onReply={onReply} />}
        {step.kind === "build" && <SentenceBuilder key={JSON.stringify(step.answer)} step={step} onBuild={onBuild} />}
      </div>
    </div>
  </section>;
}
