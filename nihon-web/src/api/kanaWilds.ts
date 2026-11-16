import api from "./axios";
import type { XpReward } from "../lib/xpRewards";
import type { Starter } from "../lib/kanaWilds/gojuon";
import type { KanaAnswers } from "../lib/kanaWilds/mastery";

/** The learner's Kana Wilds collection: hiragana catalog ids in the order they joined, the starter chosen, the
 *  answers given so far for each collected kana (its mastery level comes from them), and the challengers beaten. */
export type KanaCollection = { starter: Starter | null; kanaIds: number[]; answers: KanaAnswers[]; beatenChallengers: string[] };
/** A catch or a challenger win: the collection after it, whether it was new, and its XP (shown by the API client's
 *  interceptor, like every other reward). */
export type CollectionChange = KanaCollection & { isNew: boolean; reward: XpReward | null };

export async function fetchKanaCollection(signal?: AbortSignal) {
  return (await api.get<KanaCollection>("/kana-wilds/collection", { signal })).data;
}

export async function chooseStarterKana(starter: Starter) {
  return (await api.post<KanaCollection>("/kana-wilds/starter", { starter })).data;
}

export async function saveCaughtKana(kanaId: number) {
  return (await api.post<CollectionChange>("/kana-wilds/catches", { kanaId })).data;
}

export async function saveChallengerWin(challengerId: string) {
  return (await api.post<CollectionChange>(`/kana-wilds/challengers/${encodeURIComponent(challengerId)}/wins`)).data;
}
