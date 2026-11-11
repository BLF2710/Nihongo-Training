import api from "./axios";
import type { XpReward } from "../lib/xpRewards";
import type { Starter } from "../lib/kanaWilds/gojuon";

/** The learner's Kana Wilds collection: hiragana catalog ids in the order they joined, and the starter chosen. */
export type KanaCollection = { starter: Starter | null; kanaIds: number[] };
/** The XP reward is shown by the API client's interceptor, like every other reward. */
export type CatchResult = KanaCollection & { isNew: boolean; reward: XpReward | null };

export async function fetchKanaCollection(signal?: AbortSignal) {
  return (await api.get<KanaCollection>("/kana-wilds/collection", { signal })).data;
}

export async function chooseStarterKana(starter: Starter) {
  return (await api.post<KanaCollection>("/kana-wilds/starter", { starter })).data;
}

export async function saveCaughtKana(kanaId: number) {
  return (await api.post<CatchResult>("/kana-wilds/catches", { kanaId })).data;
}
