import api from "./axios";

export type SrsGrade = "again" | "hard" | "good" | "easy";
export type SrsItemType = "vocabulary" | "kanji";
export type SrsItem = { itemType: SrsItemType; itemId: string };
/** A card due today; `intervals` is the wait (ms) until it returns for each grade. */
export type SrsQueueCard = SrsItem & { isNew: boolean; repetitions: number; lapses: number; intervals: Record<SrsGrade, number> };
export type SrsSummary = {
  total: number; newCards: number; dueNow: number; dueToday: number; learned: number; mature: number; reviewedToday: number;
  /** New cards still allowed today, and reviews plus new cards ready now. */
  newToday: number; dueTotal: number;
};

/** The server accepts at most this many cards per request. */
const ENROLMENT_BATCH = 500;

export async function fetchSrsSummary(signal?: AbortSignal) {
  return (await api.get<SrsSummary>("/srs/summary", { signal })).data;
}

export async function fetchSrsQueue(signal?: AbortSignal) {
  return (await api.get<{ cards: SrsQueueCard[]; newLimit: number }>("/srs/queue", { signal })).data;
}

/** Adds cards to the learner's deck; cards already there keep their schedule. */
export async function enrollSrsItems(items: SrsItem[]) {
  let added = 0;
  for (let start = 0; start < items.length; start += ENROLMENT_BATCH) {
    added += (await api.post<{ added: number }>("/srs/cards", { items: items.slice(start, start + ENROLMENT_BATCH) })).data.added;
  }
  return added;
}

export async function reviewSrsCard(item: SrsItem, grade: SrsGrade) {
  return (await api.post<{ dueAt: string; intervalDays: number; intervals: Record<SrsGrade, number> }>("/srs/reviews", { itemType: item.itemType, itemId: item.itemId, grade })).data;
}
