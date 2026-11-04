import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { GuideNote, Portrait } from "../components/cast/GuideNote";
import { SessionStart } from "../components/cast/SessionStart";
import { DialoguePanel } from "../components/errands/DialoguePanel";
import { ErrandsHud } from "../components/errands/ErrandsHud";
import { TouchControls } from "../components/errands/TouchControls";
import { VillageScene } from "../components/errands/VillageScene";
import { IslandBoard } from "../components/theme/IslandBoard";
import { recordPractice } from "../api/activity";
import { MATSURI_VILLAGE } from "../data/errands/matsuriVillage";
import { getUserHandle } from "../lib/authStorage";
import { CAST } from "../lib/cast";
import { currentObjective, questScore } from "../lib/errands/errandsState";
import type { QuestScore } from "../lib/errands/errandsState";
import { localErrandsSave } from "../lib/errands/errandsSave";
import { RUN_SPEED, WALK_SPEED, heldDirection } from "../lib/errands/movement";
import { useErrands } from "../lib/errands/useErrands";
import { useFrameLoop, useHeldDirections } from "../lib/errands/useWalkControls";

const village = MATSURI_VILLAGE;
const TALK_KEYS: ReadonlySet<string> = new Set(["KeyE", "Enter", "Space"]);
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const primary = `rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 ${focus}`;
const secondary = `rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100 ${focus}`;

const englishKey = "island-errands-english";
function readShowsEnglish() {
  try { return localStorage.getItem(englishKey) !== "off"; } catch { return true; }
}
function saveShowsEnglish(isShown: boolean) {
  try { localStorage.setItem(englishKey, isShown ? "on" : "off"); } catch { /* only a preference */ }
}

const reportErrand = ({ answered, correct }: QuestScore) => recordPractice("errands", village.level, answered, correct);

export default function IslandErrandsPage() {
  const store = useMemo(() => localErrandsSave(`island-errands:${village.id}:${getUserHandle() ?? ""}`), []);
  const errands = useErrands({ village, store, onErrandFinished: reportErrand });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showsEnglish, setShowsEnglish] = useState(readShowsEnglish);
  const isTalking = errands.conversation !== null;
  const canWalk = isPlaying && !isTalking && !errands.isFinaleShown;
  const { held, isHolding, isRunning, press, release, setIsRunning } = useHeldDirections(canWalk);
  useFrameLoop(isHolding, seconds => errands.walkBy(heldDirection(held.current), seconds, isRunning ? RUN_SPEED : WALK_SPEED));

  const { conversation, nearby, next, talkTo } = errands;
  const talk = useCallback(() => { if (nearby) talkTo(nearby.id); }, [nearby, talkTo]);
  useEffect(() => {
    if (!isPlaying || errands.isFinaleShown) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || !TALK_KEYS.has(event.code)) return;
      // In a conversation, Enter and Space press the focused button themselves; E moves a line on.
      if (conversation) { if (event.code === "KeyE" && conversation.step.kind === "say") { event.preventDefault(); next(); } return; }
      if (nearby) { event.preventDefault(); talk(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying, errands.isFinaleShown, conversation, nearby, next, talk]);

  const changeShowsEnglish = (isShown: boolean) => { setShowsEnglish(isShown); saveShowsEnglish(isShown); };

  if (!isPlaying) return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar island="games" />
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <IslandBoard island="games">
        <SessionStart character="pon" heading={`Island Errands: ${village.name}`} startLabel={errands.hasSave ? "Continue →" : "Enter the village →"} onStart={() => setIsPlaying(true)} className="notice-sheet p-6 sm:p-8"
          options={<StartOptions hasSave={errands.hasSave} onStartOver={() => { errands.startOver(); setIsPlaying(true); }} />}>
          The festival is tomorrow and nothing is ready! Walk around <span lang="ja">{village.japaneseName}</span>, talk to everyone in Japanese and run their errands. Say it right and things happen; say it wrong and… you'll see.
        </SessionStart>
      </IslandBoard>
    </main>
  </div>;

  const current = currentObjective(errands.state, village.quests);
  const items = errands.state.inventory.map(id => village.items[id]).filter(item => item !== undefined);
  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="relative min-h-0 flex-1" aria-label={`Island Errands: ${village.name}`}>
      <VillageScene village={village} position={errands.state.position} facing={errands.state.facing} isWalking={isHolding} isRunning={isRunning}
        openGateIds={errands.openGateIds} litLanterns={errands.litLanterns} markedVillagerIds={errands.errandVillagerIds}
        nearbyId={nearby?.id ?? null} onTalk={talkTo}>
        <ErrandsHud current={current} items={items} finishedCount={errands.state.finished.length} questCount={village.quests.length} />
        <p className="sr-only" aria-live="polite">{nearby ? `${CAST[nearby.id].name} is nearby. Press E to talk.` : ""}</p>
        {!isTalking && <p className="pointer-events-none absolute bottom-3 left-1/2 z-[800] -translate-x-1/2 village-hint rounded-full px-3 py-1 text-xs font-semibold pointer-coarse:hidden">
          Walk: WASD or arrow keys · Run: hold Shift · Talk: E
        </p>}
        {!isTalking && !errands.isFinaleShown && <TouchControls onPress={press} onRelease={release} onTalk={talk} canTalk={nearby !== null} isRunning={isRunning} onRunningChange={setIsRunning} />}
        {conversation && <DialoguePanel speaker={conversation.step.kind === "say" ? conversation.step.line.speaker : conversation.villager.id} step={conversation.step}
          showsEnglish={showsEnglish} onShowsEnglishChange={changeShowsEnglish}
          onNext={errands.next} onReply={errands.reply} onBuild={errands.build} onLeave={errands.leave} />}
        {errands.isFinaleShown && <Finale onKeepExploring={errands.closeFinale} onPlayAgain={() => { errands.startOver(); errands.closeFinale(); }}
          score={village.quests.map(quest => questScore(errands.state, quest.id)).reduce((total, score) => ({ answered: total.answered + score.answered, correct: total.correct + score.correct }), { answered: 0, correct: 0 })} />}
      </VillageScene>
    </main>
  </div>;
}

function StartOptions({ hasSave, onStartOver }: { hasSave: boolean; onStartOver: () => void }) {
  return <div className="space-y-3 text-sm text-gray-700">
    <ul className="list-inside list-disc space-y-1">
      <li><span className="font-semibold">Walk</span> with WASD or the arrow keys (or the pad on a touch screen). Hold Shift (or tap Run) to run.</li>
      <li><span className="font-semibold">Talk</span> with E when you're next to someone. A <span className="font-bold">!</span> means they have something for you.</li>
      <li>Answer by picking a reply (keys 1–3) or building the sentence from word tiles.</li>
    </ul>
    {hasSave && <button type="button" className={secondary} onClick={onStartOver}>Start over</button>}
  </div>;
}

function Finale({ score, onKeepExploring, onPlayAgain }: { score: QuestScore; onKeepExploring: () => void; onPlayAgain: () => void }) {
  return <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/30 p-4">
    <section role="dialog" aria-labelledby="errands-finale-heading" className="notice-sheet w-full max-w-md p-6 pt-8 text-center">
      <div className="mx-auto w-fit"><Portrait character="pon" mood="happy" /></div>
      <p className="mt-3 text-2xl font-black" lang="ja">まつりが はじまりました！</p>
      <h2 id="errands-finale-heading" className="font-bold text-gray-700">The festival has begun!</h2>
      <GuideNote character="pon" mood="happy" className="mt-4 text-left">
        You answered {score.correct} of {score.answered} questions right the first time. The lanterns are lit, so go and see what everyone says now.
      </GuideNote>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" autoFocus className={primary} onClick={onKeepExploring}>Keep exploring</button>
        <button type="button" className={secondary} onClick={onPlayAgain}>Play again</button>
        <Link to="/map" className={secondary}>Island map</Link>
      </div>
    </section>
  </div>;
}
