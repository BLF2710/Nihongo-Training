import { TalkPanel } from "../village/TalkPanel";
import { introduceTownsperson, TOWNSFOLK } from "../../lib/englishTown/townsfolk";
import type { TownsfolkId } from "../../lib/englishTown/townsfolk";
import type { TownNews } from "../../lib/englishTown/townNews";

/** Each townsperson's emblem, in place of a drawn portrait (the Japanese cast's are drawn; the adventurers aren't). */
const EMBLEMS: Readonly<Record<TownsfolkId, string>> = { knight: "🛡️", mage: "🔮", ranger: "🎵", barbarian: "🧺", rogue_hooded: "✉️" };

type TownsfolkPanelProps = { townsperson: TownsfolkId; news: TownNews; onClose: () => void };

/** A townsperson's news for today, in English with its Vietnamese, with the way to their part of the site. */
export function TownsfolkPanel({ townsperson, news, onClose }: TownsfolkPanelProps) {
  const person = TOWNSFOLK[townsperson];
  const emblem = <span aria-hidden="true" className={`flex size-14 shrink-0 items-center justify-center rounded-full text-3xl ${news.hasNews ? "bg-amber-100" : "bg-emerald-50"}`}>{EMBLEMS[townsperson]}</span>;
  return <TalkPanel name={person.name} introduction={introduceTownsperson(person)} portrait={emblem}
    line={{ text: news.english, lang: "en-GB" }} translation={{ text: news.vietnamese, lang: "vi" }} links={news.links} onClose={onClose} />;
}
