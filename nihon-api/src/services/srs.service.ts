import { withTransaction } from "../db/transaction";
import { isSrsGrade, previewIntervals, scheduleReview } from "../learning/srsScheduler";
import { listCompletedLessonIds } from "../repositories/lesson-progress.repository";
import * as srsRepository from "../repositories/srs.repository";
import type { SrsCard, SrsItemType } from "../repositories/srs.repository";
import { recordActivity } from "../repositories/streak.repository";
import { HttpError } from "../utils/http-error";
import { catalog } from "./kanji.service";

/** New cards introduced per day, so reviews never pile up faster than a learner can keep up. */
export const MAX_NEW_PER_DAY = 20;
const MAX_DUE_IN_QUEUE = 200;
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
  const [counts, allowance] = await Promise.all([srsRepository.getCardCounts(userId), newCardAllowance(userId)]);
  const newToday = Math.min(counts.newCards, allowance);
  return { ...counts, newToday, dueTotal: counts.dueNow + newToday };
}

const presentCard = (card: SrsCard, now: Date) => ({
  itemType: card.itemType, itemId: card.itemId, isNew: card.isNew, repetitions: card.repetitions, lapses: card.lapses,
  intervals: previewIntervals(card, now),
});

/** Today's session: due reviews first, then new cards up to the daily limit. */
export async function getQueue(userId: number, now = new Date()) {
  const allowance = await newCardAllowance(userId);
  const [due, fresh] = await Promise.all([srsRepository.listDueCards(userId, MAX_DUE_IN_QUEUE), srsRepository.listNewCards(userId, allowance)]);
  return { cards: [...due, ...fresh].map(card => presentCard(card, now)), newLimit: MAX_NEW_PER_DAY };
}

// A card that is being learned (never remembered yet, or just forgotten) can be repeated in the same session.
const isReviewable = (card: SrsCard, now: Date) => card.repetitions === 0 || card.dueAt.getTime() <= now.getTime();

/** Grades one card, schedules its next review and counts today toward the streak. */
export async function reviewCard(userId: number, input: { itemType?: unknown; itemId?: unknown; grade?: unknown }) {
  const reference = toItemReference(input);
  const { grade } = input;
  if (!isSrsGrade(grade)) throw new HttpError(400, "Grade the card as again, hard, good or easy.");
  return withTransaction(async client => {
    const card = await srsRepository.findCardForUpdate(client, userId, reference.itemType, reference.itemId);
    if (!card) throw new HttpError(404, "This card isn't in your review deck.");
    const now = new Date();
    if (!isReviewable(card, now)) throw new HttpError(409, "This card isn't due yet.");
    const next = scheduleReview(card, grade, now);
    await srsRepository.saveReview(client, { userId, card, grade, next });
    const streak = await recordActivity(client, userId);
    // The waits for the card's next review, for a card the learner sees again in the same session.
    const intervals = previewIntervals(next, now);
    return { itemType: card.itemType, itemId: card.itemId, dueAt: next.dueAt, intervalDays: next.intervalDays, intervals, currentStreak: streak?.currentStreak ?? 0 };
  });
}
