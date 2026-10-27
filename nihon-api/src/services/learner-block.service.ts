import { withTransaction } from "../db/transaction";
import { createConversation, insertMessage, setBlocked } from "../repositories/conversation.repository";
import { cancelOpenChallenges } from "../repositories/friend-challenge.repository";
import { deletePair, findLearnerByUsername } from "../repositories/friendship.repository";
import { listBlockedLearners } from "../repositories/learner-block.repository";
import { HttpError } from "../utils/http-error";
import { USERNAME_PATTERN } from "../utils/validation";
import { findOther, requireLearner } from "./friend.service";
import { publish } from "./realtime.service";

const MAX_REPORT_LENGTH = 500;

/**
 * Blocks or unblocks another learner. Blocking also ends any friendship, friend request and open challenge
 * between the two; neither can then find, message or friend the other.
 */
export async function setLearnerBlock(userId: number, otherId: number, blocked: boolean) {
  await setBlocked(userId, otherId, blocked);
  if (!blocked) return;
  const removed = await withTransaction(async client => {
    await cancelOpenChallenges(client, userId, otherId);
    return deletePair(client, userId, otherId);
  });
  if (removed) for (const id of [userId, otherId]) publish(id, { type: "friends", reason: "updated" });
}

export async function blockLearner(userId: number, username: unknown) {
  await requireLearner(userId);
  const other = await findOther(userId, username);
  if (other.id === userId) throw new HttpError(400, "You can't block yourself.");
  await setLearnerBlock(userId, other.id, true);
  return { blocked: true };
}

/** Unblocks a learner from your blocked list (they can't be looked up any other way while blocked). */
export async function unblockLearner(userId: number, username: unknown) {
  await requireLearner(userId);
  if (typeof username !== "string" || !USERNAME_PATTERN.test(username)) throw new HttpError(400, "Enter a username.");
  const other = await findLearnerByUsername(username);
  const isBlocked = other && (await listBlockedLearners(userId)).some(row => row.username === other.username);
  if (!other || !isBlocked) throw new HttpError(404, "That learner isn't on your blocked list.");
  await setLearnerBlock(userId, other.id, false);
  return { blocked: false };
}

export async function listBlocked(userId: number) {
  await requireLearner(userId);
  const rows = await listBlockedLearners(userId);
  return { blocked: rows.map(row => ({ username: row.username, displayName: row.display_name, blockedAt: row.blocked_at })) };
}

/** Sends a report about a learner's profile to the support team as a new support request. */
export async function reportLearner(userId: number, username: unknown, reason: unknown) {
  await requireLearner(userId);
  const other = await findOther(userId, username);
  if (other.id === userId) throw new HttpError(400, "You can't report yourself.");
  const note = typeof reason === "string" ? reason.trim() : "";
  if (!note) throw new HttpError(400, "Say what is wrong so the support team can look into it.");
  if (note.length > MAX_REPORT_LENGTH) throw new HttpError(400, `Keep the report under ${MAX_REPORT_LENGTH} characters.`);
  const body = `Reported learner @${other.username} (profile /u/${other.username}).\n\nReason: ${note}`;
  const supportConversationId = await withTransaction(async client => {
    const id = await createConversation(client, { kind: "support", subject: `Report: learner @${other.username}`, createdBy: userId, memberIds: [userId] });
    await insertMessage(client, { conversationId: id, senderId: userId, senderRole: "learner", body });
    return id;
  });
  return { supportConversationId };
}
