import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const primary = `rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white hover:bg-emerald-700 ${focus}`;
const secondary = `rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-800 hover:bg-gray-100 ${focus}`;

/** What someone says, in the language spoken there (`lang`), and its translation into the learner's own. */
export type SpokenLine = { text: string; lang: string };
export type TalkPanelProps = {
  /** Who is talking, as the panel names them ("Talking with …"), and how they're introduced over their line. */
  name: string; introduction: string; portrait: ReactNode;
  line: SpokenLine; translation: SpokenLine;
  links: readonly { label: string; href: string }[]; onClose: () => void;
};

/** Someone in a scene talking to the traveller, over the bottom of the scene, with the way to their part of the site.
 *  E or Escape says goodbye. */
export function TalkPanel({ name, introduction, portrait, line, translation, links, onClose }: TalkPanelProps) {
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => first.current?.focus(), [name]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.code === "Escape" || (event.code === "KeyE" && !event.repeat)) { event.preventDefault(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <section role="dialog" aria-label={`Talking with ${name}`} className="notice-sheet absolute inset-x-2 bottom-2 z-[1000] mx-auto max-w-2xl p-4 pt-5 sm:inset-x-4 sm:bottom-4 sm:p-5 sm:pt-6">
    <div className="flex items-start gap-3">
      {portrait}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">{introduction}</p>
        <p className="mt-1 text-xl font-bold leading-relaxed text-gray-900 sm:text-2xl" lang={line.lang}>{line.text}</p>
        <p className="text-sm text-gray-600" lang={translation.lang}>{translation.text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((link, index) => <Link key={link.href} ref={index === 0 ? first : undefined} to={link.href} className={index === 0 ? primary : secondary}>{link.label}{index === 0 ? " →" : ""}</Link>)}
          <button type="button" className={secondary} onClick={onClose}>Bye</button>
        </div>
      </div>
    </div>
  </section>;
}
