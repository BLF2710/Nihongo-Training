import { withTransaction } from "../db/transaction";
import { isSrsGrade, MATURE_INTERVAL_DAYS, previewIntervals, scheduleReview } from "../learning/srsScheduler";
import { listCompletedLessonIds } from "../repositories/lesson-progress.repository";
import * as srsRepository from "../repositories/srs.repository";
import type { SrsCard, SrsItemType } from "../repositories/srs.repository";
import { recordActivity } from "../repositories/streak.repository";
import { HttpError } from "../utils/http-error";
import { rewardActivity } from "./gamification.service";
import { catalog } from "./kanji.service";

/**
 * New cards introduced per day. Kept small so a session stays short and pleasant, and reviews never pile up faster
 * than a learner can keep up; reviews of studied cards are never capped (skipping them would mean forgetting).
 */
export const MAX_NEW_PER_DAY = 5;
const MAX_DUE_IN_QUEUE = 200;
/** "Review ahead" offers studied cards due within this many hours, at most MAX_AHEAD_IN_QUEUE at a time. */
export const REVIEW_AHEAD_HOURS = 24;
const MAX_AHEAD_IN_QUEUE = 50;
const MAX_DECK_LISTED = 5000;
const MAX_ITEMS_PER_ENROLMENT = 500;
const MAX_WORD_LENGTH = 60;
const KANJI_IDS = new Set(catalog.kanji.map(kanji => kanji.id));

type ItemReference = { itemType: SrsItemType; itemId: string };

const isItemType = (value: unknown): value is SrsItemType => value === "vocabulary" || value === "kanji";

function toItemReference(value: unknown): ItemReference {
  if (typeof value !== "object" || value === null) throw new HttpError(400, "Each card needs an item type and id.");
  const { itemType, itemId } = value as Record<string, unknown>;
  if (!isItemType(itemType) || typeof itemId !== "string" || !itemId) throw new HttpError(400, "Each card needs an item type (vocabulary or kanji) and id.");
  return { itemType, itemId };
}

/** Words are `<lesson id>:<word>`, from a lesson the learner completed; Kanji come from the catalog. */
function isEnrollable(item: ItemReference, completedLessons: Set<string>): boolean {
  if (item.itemType === "kanji") return KANJI_IDS.has(item.itemId);
  const separator = item.itemId.indexOf(":");
  const word = item.itemId.slice(separator + 1);
  return separator > 0 && completedLessons.has(item.itemId.slice(0, separator)) && word.length > 0 && word.length <= MAX_WORD_LENGTH;
}

/** Adds words from completed lessons and Kanji to the learner's review deck; items already there are kept as they are. */
export async function enrollItems(userId: number, items: unknown) {
  if (!Array.isArray(items) || items.length > MAX_ITEMS_PER_ENROLMENT) throw new HttpError(400, `Send a list of at most ${MAX_ITEMS_PER_ENROLMENT} cards.`);
  const references = items.map(toItemReference);
  const completedLessons = new Set(await listCompletedLessonIds(userId));
  const accepted = references.filter(item => isEnrollable(item, completedLessons));
  const added = await srsRepository.insertCards(userId, accepted);
  return { added, ignored: references.length - accepted.length };
}

async function newCardAllowance(userId: number) {
  return Math.max(0, MAX_NEW_PER_DAY - await srsRepository.countNewReviewedToday(userId));
}

export async function getSummary(userId: number) {
  const [counts, allowance] = await Promise.all([srsRepository.getCardCounts(userId, REVIEW_AHEAD_HOURS), newCardAllowance(userId)]);
  const newToday = Math.min(counts.newCards, allowance);
  return { ...counts, newToday, dueTotal: counts.dueNow + newToday };
}

const presentCard = (card: SrsCard, now: Date) => ({
  itemType: card.itemType, itemId: card.itemId, isNew: card.isNew, repetitions: card.repetitions, lapses: card.lapses,
  intervals: previewIntervals(card, now),
});

/** Today's session: due reviews first, then new cards up to the daily limit. Reviewing ahead: cards due soon. */
export async function getQueue(userId: number, options: { ahead?: boolean } = {}, now = new Date()) {
  if (options.ahead) {
    const soon = await srsRepository.listCardsDueSoon(userId, REVIEW_AHEAD_HOURS, MAX_AHEAD_IN_QUEUE);
    return { cards: soon.map(card => presentCard(card, now)), newLimit: MAX_NEW_PER_DAY };
  }
  const allowance = await newCardAllowance(userId);
  const [due, fresh] = await Promise.all([srsRepository.listDueCards(userId, MAX_DUE_IN_QUEUE), srsRepository.listNewCards(userId, allowance)]);
  return { cards: [...due, ...fresh].map(card => presentCard(card, now)), newLimit: MAX_NEW_PER_DAY };
}

const HOUR_MS = 60 * 60 * 1000;
// A card that is being learned (never remembered yet, or just forgotten) can be repeated in the same session;
// reviewing ahead also allows a card due within REVIEW_AHEAD_HOURS.
function isReviewable(card: SrsCard, now: Date, ahead: boolean) {
  const latest = now.getTime() + (ahead ? REVIEW_AHEAD_HOURS * HOUR_MS : 0);
  return card.repetitions === 0 || card.dueAt.getTime() <= latest;
}

/** Grades one card, schedules its next review, counts today toward the streak and pays review XP. */
export async function reviewCard(userId: number, input: { itemType?: unknown; itemId?: unknown; grade?: unknown; ahead?: unknown }) {
  const reference = toItemReference(input);
  const { grade } = input;
  if (!isSrsGrade(grade)) throw new HttpError(400, "Grade the card as again, hard, good or easy.");
  const { reviewId, ...reviewed } = await withTransaction(async client => {
    const card = await srsRepository.findCardForUpdate(client, userId, reference.itemType, reference.itemId);
    if (!card) throw new HttpError(404, "This card isn't in your review deck.");
    const now = new Date();
    if (card.isSuspended) throw new HttpError(409, "This card is suspended. Restore it from your deck to review it.");
    if (!isReviewable(card, now, input.ahead === true)) throw new HttpError(409, "This card isn't due yet.");
    const next = scheduleReview(card, grade, now);
    const reviewId = await srsRepository.saveReview(client, { userId, card, grade, next });
    const streak = await recordActivity(client, userId);
    // The waits for the card's next review, for a card the learner sees again in the same session.
    const intervals = previewIntervals(next, now);
    return { reviewId, itemType: card.itemType, itemId: card.itemId, dueAt: next.dueAt, intervalDays: next.intervalDays, intervals, currentStreak: streak?.currentStreak ?? 0 };
  });
  return { ...reviewed, reward: await rewardActivity(userId, "review", `review:${reviewId}`) };
}

export type DeckStatus = "new" | "learning" | "mature" | "suspended";
const deckStatus = (card: SrsCard): DeckStatus =>
  card.isSuspended ? "suspended" : card.isNew ? "new" : card.intervalDays >= MATURE_INTERVAL_DAYS ? "mature" : "learning";

/** Every card in the learner's deck with its status and next review, for browsing and suspending. */
export async function getDeck(userId: number) {
  const cards = await srsRepository.listDeck(userId, MAX_DECK_LISTED);
  return {
    cards: cards.map(card => ({
      itemType: card.itemType, itemId: card.itemId, status: deckStatus(card), dueAt: card.isNew ? null : card.dueAt,
      intervalDays: card.intervalDays, repetitions: card.repetitions, lapses: card.lapses,
    })),
  };
}

/** Suspends a card (left out of reviews, kept in the deck) or restores it. */
export async function setCardSuspended(userId: number, itemType: unknown, itemId: unknown, suspended: unknown) {
  const reference = toItemReference({ itemType, itemId });
  if (typeof suspended !== "boolean") throw new HttpError(400, "Say whether the card is suspended.");
  if (!(await srsRepository.setSuspended(userId, reference.itemType, reference.itemId, suspended))) throw new HttpError(404, "This card isn't in your review deck.");
  return { ...reference, suspended };
}
