import api from "./axios";

export type SrsGrade = "again" | "hard" | "good" | "easy";
export type SrsItemType = "vocabulary" | "kanji";
export type SrsItem = { itemType: SrsItemType; itemId: string };
/** A card due today; `intervals` is the wait (ms) until it returns for each grade. */
export type SrsQueueCard = SrsItem & { isNew: boolean; repetitions: number; lapses: number; intervals: Record<SrsGrade, number> };
export type SrsSummary = {
  total: number; newCards: number; dueNow: number; dueToday: number; learned: number; mature: number; reviewedToday: number;
  /** Studied cards due within the next day that can be reviewed ahead, and cards left out of reviews. */
  dueSoon: number; suspended: number;
  /** New cards still allowed today, and reviews plus new cards ready now. */
  newToday: number; dueTotal: number;
};

/** The server accepts at most this many cards per request. */
const ENROLMENT_BATCH = 500;

export async function fetchSrsSummary(signal?: AbortSignal) {
  return (await api.get<SrsSummary>("/srs/summary", { signal })).data;
}

/** Today's cards, or with `ahead` the studied cards due within the next day. */
export async function fetchSrsQueue(signal?: AbortSignal, options: { ahead?: boolean } = {}) {
  return (await api.get<{ cards: SrsQueueCard[]; newLimit: number }>("/srs/queue", { signal, params: options.ahead ? { ahead: 1 } : {} })).data;
}

export type DeckStatus = "new" | "learning" | "mature" | "suspended";
export type DeckCardState = SrsItem & { status: DeckStatus; dueAt: string | null; intervalDays: number; repetitions: number; lapses: number };

export async function fetchSrsDeck(signal?: AbortSignal) {
  return (await api.get<{ cards: DeckCardState[] }>("/srs/cards", { signal })).data.cards;
}

/** Leaves a card out of reviews (it stays in the deck) or brings it back. */
export async function setCardSuspended(item: SrsItem, suspended: boolean) {
  await api.patch(`/srs/cards/${item.itemType}/${encodeURIComponent(item.itemId)}`, { suspended });
}

/** Adds cards to the learner's deck; cards already there keep their schedule. */
export async function enrollSrsItems(items: SrsItem[]) {
  let added = 0;
  for (let start = 0; start < items.length; start += ENROLMENT_BATCH) {
    added += (await api.post<{ added: number }>("/srs/cards", { items: items.slice(start, start + ENROLMENT_BATCH) })).data.added;
  }
  return added;
}

export async function reviewSrsCard(item: SrsItem, grade: SrsGrade, options: { ahead?: boolean } = {}) {
  const body = { itemType: item.itemType, itemId: item.itemId, grade, ...(options.ahead ? { ahead: true } : {}) };
  return (await api.post<{ dueAt: string; intervalDays: number; intervals: Record<SrsGrade, number> }>("/srs/reviews", body)).data;
}
