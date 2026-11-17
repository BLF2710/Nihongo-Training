import { withTransaction } from "../db/transaction";
import { listKanaWithProgress } from "../repositories/kana.repository";
import * as collectionRepository from "../repositories/moji-collection.repository";
import * as challengerRepository from "../repositories/wild-challenger.repository";
import type { CollectedKana } from "../repositories/moji-collection.repository";
import { HttpError } from "../utils/http-error";
import { rewardActivity } from "./gamification.service";

// Kana Wilds (docs/KANA-BATTLE.md). Battles are graded in the browser and reported as practice sessions; this
// service keeps the collection: the starter set, and each wild kana caught.

/** Hiragana ids of the five vowels and of the 46 basic kana (the catalog's ids, migration 000). */
export const VOWEL_IDS: readonly number[] = [1, 2, 3, 4, 5];
const FIRST_BASIC_ID = 1;
const LAST_BASIC_ID = 46;
/** The starter consonants a new player chooses from: か, さ, た. */
export const STARTER_KANA_IDS = { ka: 6, sa: 11, ta: 16 } as const;
export type Starter = keyof typeof STARTER_KANA_IDS;

/** The island cast who challenge the learner on their islands (docs/WORLD.md); the web app holds their teams. */
export const CHALLENGER_IDS: readonly string[] = ["chun", "tama", "pon", "sensei"];

/**
 * Kana held back from the wilds until the learner beats a challenger (docs/KANA-BATTLE.md section 9): Chun brings the
 * さ and た rows, Tama the ま, や, ら, わ rows and ん. The web app's paths hold the same rows back from their grass
 * (nihon-web/src/data/world/routes.ts). Ids are the catalog's, in table order.
 */
export const HELD_KANA = [
  { firstId: 11, lastId: 20, until: "chun", rows: "さ and た" },
  { firstId: 31, lastId: 46, until: "tama", rows: "ま, や, ら, わ and ん" },
] as const;
const CHALLENGER_NAMES: Readonly<Record<(typeof HELD_KANA)[number]["until"], string>> = { chun: "Chun", tama: "Tama" };

const heldBackBy = (kanaId: number) => HELD_KANA.find(held => kanaId >= held.firstId && kanaId <= held.lastId);

const STARTERS = Object.keys(STARTER_KANA_IDS) as Starter[];
const isStarter = (value: unknown): value is Starter => STARTERS.some(starter => starter === value);
const isChallengerId = (value: unknown): value is string => CHALLENGER_IDS.some(id => id === value);
const isBasicKanaId = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= FIRST_BASIC_ID && value <= LAST_BASIC_ID;

function starterOf(collection: readonly CollectedKana[]): Starter | null {
  const starterIds = new Set(collection.filter(item => item.origin === "starter").map(item => item.kanaId));
  return STARTERS.find(starter => starterIds.has(STARTER_KANA_IDS[starter])) ?? null;
}

/**
 * The basic kana a voiced kana evolves from (docs/KANA-BATTLE.md section 9), by catalog id: が–ど (47–61) from
 * か–と, ば–ぼ (62–66) from は–ほ, ぱ–ぽ (67–71) from は–ほ too (by way of ば). Null for any other id.
 */
export function evolvedFromId(kanaId: number): number | null {
  if (kanaId >= 47 && kanaId <= 61) return kanaId - 41;
  if (kanaId >= 62 && kanaId <= 66) return kanaId - 36;
  if (kanaId >= 67 && kanaId <= 71) return kanaId - 41;
  return null;
}

/**
 * The right and wrong answers the learner has given for each collected kana, and for the voiced forms they can evolve
 * into, anywhere on the site: the web game turns them into mastery levels (docs/KANA-BATTLE.md section 8) and decides
 * which have evolved.
 */
async function answersFor(userId: number, collection: readonly CollectedKana[]) {
  const collectedIds = new Set(collection.map(item => item.kanaId));
  const isTracked = (id: number) => {
    const base = evolvedFromId(id);
    return collectedIds.has(id) || (base !== null && collectedIds.has(base));
  };
  const progress = await listKanaWithProgress("hiragana", userId);
  return progress.filter(row => isTracked(row.id)).map(row => ({ kanaId: row.id, correct: row.correctCount, wrong: row.wrongCount }));
}

async function toResponse(userId: number, collection: readonly CollectedKana[]) {
  return {
    starter: starterOf(collection),
    kanaIds: collection.map(item => item.kanaId),
    answers: await answersFor(userId, collection),
    beatenChallengers: await challengerRepository.listChallengerWins(userId),
  };
}

export async function getCollection(userId: number) {
  return toResponse(userId, await collectionRepository.listCollection(userId));
}

/** Starts a collection: the vowels and the chosen consonant. A collection can only be started once. */
export async function chooseStarter(userId: number, starter: unknown) {
  if (!isStarter(starter)) throw new HttpError(400, "Choose か (ka), さ (sa) or た (ta).");
  const collection = await withTransaction(async client => {
    await collectionRepository.lockCollection(client, userId);
    if ((await collectionRepository.listCollection(userId, client)).length) throw new HttpError(409, "You already chose your starter kana.");
    await collectionRepository.addStarterKana(client, userId, [...VOWEL_IDS, STARTER_KANA_IDS[starter]]);
    return collectionRepository.listCollection(userId, client);
  });
  return toResponse(userId, collection);
}

/** Adds a wild kana the learner caught. The first catch of each kana pays game XP once (capped daily like other games). */
export async function catchKana(userId: number, kanaId: unknown) {
  if (!isBasicKanaId(kanaId)) throw new HttpError(400, "Only the 46 basic hiragana live in the wilds.");
  const before = await collectionRepository.listCollection(userId);
  if (!before.length) throw new HttpError(409, "Choose your starter kana first.");
  const held = heldBackBy(kanaId);
  if (held && !(await challengerRepository.listChallengerWins(userId)).includes(held.until)) {
    throw new HttpError(409, `The ${held.rows} rows come to the wilds once you beat ${CHALLENGER_NAMES[held.until]}.`);
  }
  const isNew = await collectionRepository.addCaughtKana(userId, kanaId);
  const reward = isNew ? await rewardActivity(userId, "game", `kana-wilds-catch:${kanaId}`) : null;
  return { ...(await getCollection(userId)), isNew, reward };
}

/** Records a challenge won (graded in the browser, like battles). The first win against each challenger pays game XP
 *  once; it is what opens the next wild path. */
export async function recordChallengerWin(userId: number, challengerId: unknown) {
  if (!isChallengerId(challengerId)) throw new HttpError(404, "There is no such challenger.");
  if (!(await collectionRepository.listCollection(userId)).length) throw new HttpError(409, "Choose your starter kana first.");
  const isNew = await challengerRepository.addChallengerWin(userId, challengerId);
  const reward = isNew ? await rewardActivity(userId, "game", `kana-wilds-challenger:${challengerId}`) : null;
  return { ...(await getCollection(userId)), isNew, reward };
}
