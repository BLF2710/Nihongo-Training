import { Portrait } from "../cast/GuideNote";
import { CAST, introduce } from "../../lib/cast";
import type { CharacterId } from "../../lib/cast";
import type { VillagerNews } from "../../lib/village/villageNews";
import { TalkPanel } from "./TalkPanel";

type VillagerNewsPanelProps = { villager: CharacterId; news: VillagerNews; onClose: () => void };

/** A villager's news for today, over the bottom of the square, with the way to their part of the site. */
export function VillagerNewsPanel({ villager, news, onClose }: VillagerNewsPanelProps) {
  const character = CAST[villager];
  return <TalkPanel name={character.name} introduction={introduce(character)} portrait={<Portrait character={villager} mood={news.hasNews ? "happy" : "calm"} />}
    line={{ text: news.japanese, lang: "ja" }} translation={{ text: news.english, lang: "en" }} links={news.links} onClose={onClose} />;
}
