import { useState } from "react";
import type { DialogueLine } from "../../../../shared/course/english/schema.ts";
import { dialoguePageOfLine, dialoguePagesOf } from "../../lib/dialoguePages";
import { SpeakButton } from "./SpeakButton";

/** A short conversation, line by line, each with its Vietnamese. On a wide screen each line is one row, English beside
 *  Vietnamese; on a phone the two speakers sit on opposite sides and the lines come a page at a time. */
export function DialogueStep({ lines }: { lines: readonly DialogueLine[] }) {
  const [shownPage, setShownPage] = useState(0);
  const firstSpeaker = lines[0]?.speaker;
  const pages = dialoguePagesOf(lines.length);
  const isOnShownPage = (index: number) => dialoguePageOfLine(index) === shownPage;
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-black sm:text-2xl">A short conversation <span lang="vi" className="text-base font-semibold text-gray-500">· Hội thoại</span></h2>
      {pages.length > 1 && <div className="flex gap-1 md:hidden">{pages.map(page => <button key={page.index} type="button" aria-pressed={page.index === shownPage} onClick={() => setShownPage(page.index)}
        className={`rounded-lg px-3 py-1 text-xs font-bold ${page.index === shownPage ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>{page.label}</button>)}</div>}
    </div>
    <ol className="mt-2 space-y-1.5 sm:mt-3">{lines.map((line, index) => {
      const isFirstSpeaker = line.speaker === firstSpeaker;
      return <li key={index} className={`${isOnShownPage(index) ? "flex" : "hidden md:flex"} items-center gap-2 rounded-xl p-2 text-sm sm:gap-3 md:px-3 md:py-1 md:text-base ${isFirstSpeaker ? "mr-8 bg-indigo-50 md:mr-0" : "ml-8 bg-emerald-50 md:ml-0"}`}>
        <div className="flex-1 md:grid md:grid-cols-2 md:gap-4">
          <p><span className="font-black">{line.speaker}: </span><span lang="en-GB" className="font-semibold">{line.english}</span></p>
          <p lang="vi" className="text-sm text-gray-600 md:self-center">{line.vietnamese}</p>
        </div>
        <SpeakButton text={line.english} label={`Hear ${line.speaker}`} />
      </li>;
    })}</ol>
  </div>;
}
