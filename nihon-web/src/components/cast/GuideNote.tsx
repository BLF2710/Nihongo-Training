import type { ReactNode } from "react";
import { CAST, introduce } from "../../lib/cast";
import type { CharacterId, Mood } from "../../lib/cast";
import { CharacterArt } from "./CharacterArt";
import "./cast.css";

const PORTRAIT_SIZE = { small: "size-10", strip: "size-10 sm:size-14", medium: "size-16" } as const;

/** A character's portrait in a round frame, for beside what they say (decorative: their name is in the text). */
export function Portrait({ character, mood = "calm", size = "medium" }: { character: CharacterId; mood?: Mood; size?: keyof typeof PORTRAIT_SIZE }) {
  return <span aria-hidden="true" className={`cast-portrait block shrink-0 overflow-hidden rounded-full ${PORTRAIT_SIZE[size]}`}>
    <CharacterArt character={character} mood={mood} />
  </span>;
}

/** An island character reacting to an answer beside its feedback: pleased when it is right, concerned when not. */
export function Reaction({ character, isCorrect, children }: { character: CharacterId; isCorrect: boolean; children: ReactNode }) {
  return <div className="flex items-center gap-3">
    <Portrait character={character} mood={isCorrect ? "happy" : "worried"} size="small" />
    {children}
  </div>;
}

type GuideNoteProps = { character: CharacterId; mood?: Mood; children: ReactNode; className?: string };

/** An island character saying something in a speech bubble: empty states, endings and nudges on the study pages. */
export function GuideNote({ character, mood = "calm", children, className = "" }: GuideNoteProps) {
  return <div className={`flex items-start gap-3 ${className}`}>
    <Portrait character={character} mood={mood} />
    <div className="cast-bubble relative min-w-0 flex-1 rounded-2xl px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{introduce(CAST[character])}</p>
      <div className="mt-1 text-gray-800">{children}</div>
    </div>
  </div>;
}
