import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type ConversationKind = "direct" | "support" | "assistant";
export type SenderRole = "learner" | "admin" | "assistant";
export type ConversationRow = {
  id: number; kind: ConversationKind; subject: string; status: "open" | "closed"; created_by: number | null;
  created_at: Date; last_message_at: Date; staff_read_message_id: number | null;
};
export type MessageRow = { id: number; conversation_id: number; sender_id: number | null; sender_role: SenderRole; body: string; created_at: Date; sender_name: string | null };
export type PersonRow = { id: number; username: string; display_name: string; role: string; status: string };

const MESSAGE_COLUMNS = `m.id, m.conversation_id, m.sender_id, m.sender_role, m.body, m.created_at,
  COALESCE(p.display_name, u.username) AS sender_name`;

// ---- People

/** An account found by its exact username (case-insensitive), with the name other learners see. */
export async function findPersonByUsername(username: string): Promise<PersonRow | undefined> {
  const result = await pool.query(
    `SELECT u.id, u.username, COALESCE(p.display_name, u.username) AS display_name, u.role, u.status
       FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE LOWER(u.username) = LOWER($1)`, [username]);
  return result.rows[0];
}

export async function findPersonById(id: number): Promise<PersonRow | undefined> {
  const result = await pool.query(
    `SELECT u.id, u.username, COALESCE(p.display_name, u.username) AS display_name, u.role, u.status
       FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = $1`, [id]);
  return result.rows[0];
}

// ---- Conversations

export async function createConversation(db: Queryable, conversation: { kind: ConversationKind; subject?: string; directKey?: string; createdBy: number; memberIds: number[] }): Promise<number> {
  const result = await db.query(
    "INSERT INTO conversations (kind, subject, direct_key, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
    [conversation.kind, conversation.subject ?? "", conversation.directKey ?? null, conversation.createdBy]);
  const id: number = result.rows[0].id;
  for (const userId of conversation.memberIds) {
    await db.query("INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)", [id, userId]);
  }
  return id;
}

export async function findDirectConversationId(directKey: string): Promise<number | undefined> {
  const result = await pool.query("SELECT id FROM conversations WHERE direct_key = $1", [directKey]);
  return result.rows[0]?.id;
}

/** The conversation, only when `userId` is one of its members and it is of the given kind. */
export async function findMemberConversation(conversationId: number, userId: number, kind: ConversationKind): Promise<ConversationRow | undefined> {
  const result = await pool.query(
    `SELECT c.* FROM conversations c JOIN conversation_members cm ON cm.conversation_id = c.id
      WHERE c.id = $1 AND cm.user_id = $2 AND c.kind = $3`, [conversationId, userId, kind]);
  return result.rows[0];
}

export async function findConversation(conversationId: number, kind: ConversationKind): Promise<ConversationRow | undefined> {
  const result = await pool.query("SELECT * FROM conversations WHERE id = $1 AND kind = $2", [conversationId, kind]);
  return result.rows[0];
}

/** A member's conversations of one kind, newest first, with the last message and the member's unread count. */
export async function listMemberConversations(userId: number, kind: ConversationKind) {
  const result = await pool.query(
    `SELECT c.id, c.kind, c.subject, c.status, c.created_at, c.last_message_at,
            last.body AS last_body, last.sender_role AS last_sender_role, last.sender_id AS last_sender_id,
            (SELECT COUNT(*)::int FROM messages m WHERE m.conversation_id = c.id AND (m.sender_id IS DISTINCT FROM $1)
               AND m.id > cm.last_read_message_id) AS unread,
            other.id AS other_id, other.username AS other_username, COALESCE(op.display_name, other.username) AS other_name
       FROM conversations c
       JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
       LEFT JOIN LATERAL (SELECT body, sender_role, sender_id FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) last ON TRUE
       LEFT JOIN conversation_members om ON om.conversation_id = c.id AND om.user_id <> $1 AND c.kind = 'direct'
       LEFT JOIN users other ON other.id = om.user_id
       LEFT JOIN user_profiles op ON op.user_id = other.id
      WHERE c.kind = $2
      ORDER BY c.last_message_at DESC, c.id DESC
      LIMIT 100`, [userId, kind]);
  return result.rows;
}

export async function listMembers(conversationId: number): Promise<PersonRow[]> {
  const result = await pool.query(
    `SELECT u.id, u.username, COALESCE(p.display_name, u.username) AS display_name, u.role, u.status
       FROM conversation_members cm JOIN users u ON u.id = cm.user_id LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE cm.conversation_id = $1 ORDER BY u.id`, [conversationId]);
  return result.rows;
}

export async function markRead(conversationId: number, userId: number) {
  await pool.query(
    `UPDATE conversation_members SET last_read_message_id = (SELECT COALESCE(MAX(id), 0) FROM messages WHERE conversation_id = $1)
      WHERE conversation_id = $1 AND user_id = $2`, [conversationId, userId]);
}

export async function setSubject(db: Queryable, conversationId: number, subject: string) {
  await db.query("UPDATE conversations SET subject = $2 WHERE id = $1", [conversationId, subject]);
}

export async function latestConversationId(userId: number, kind: ConversationKind): Promise<number | undefined> {
  const result = await pool.query(
    `SELECT c.id FROM conversations c JOIN conversation_members cm ON cm.conversation_id = c.id
      WHERE cm.user_id = $1 AND c.kind = $2 ORDER BY c.last_message_at DESC, c.id DESC LIMIT 1`, [userId, kind]);
  return result.rows[0]?.id;
}

// ---- Messages

/** The most recent messages of a conversation, oldest first. */
export async function listMessages(conversationId: number, limit = 200): Promise<MessageRow[]> {
  const result = await pool.query(
    `SELECT * FROM (SELECT ${MESSAGE_COLUMNS} FROM messages m LEFT JOIN users u ON u.id = m.sender_id
       LEFT JOIN user_profiles p ON p.user_id = u.id WHERE m.conversation_id = $1 ORDER BY m.id DESC LIMIT $2) recent
     ORDER BY id`, [conversationId, limit]);
  return result.rows;
}

export async function findMessage(conversationId: number, messageId: number): Promise<MessageRow | undefined> {
  const result = await pool.query(
    `SELECT ${MESSAGE_COLUMNS} FROM messages m LEFT JOIN users u ON u.id = m.sender_id LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE m.conversation_id = $1 AND m.id = $2`, [conversationId, messageId]);
  return result.rows[0];
}

export async function insertMessage(db: Queryable, message: { conversationId: number; senderId: number | null; senderRole: SenderRole; body: string }): Promise<number> {
  const result = await db.query(
    "INSERT INTO messages (conversation_id, sender_id, sender_role, body) VALUES ($1, $2, $3, $4) RETURNING id",
    [message.conversationId, message.senderId, message.senderRole, message.body]);
  await db.query("UPDATE conversations SET last_message_at = NOW() WHERE id = $1", [message.conversationId]);
  if (message.senderId !== null) {
    // Sending a message means the sender has read everything before it.
    await db.query("UPDATE conversation_members SET last_read_message_id = $3 WHERE conversation_id = $1 AND user_id = $2", [message.conversationId, message.senderId, result.rows[0].id]);
  }
  return result.rows[0].id;
}

/** Messages one account has sent recently in conversations of one kind (for rate limits). */
export async function countRecentMessages(userId: number, kind: ConversationKind, seconds: number): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM messages m JOIN conversations c ON c.id = m.conversation_id
      WHERE m.sender_id = $1 AND c.kind = $2 AND m.created_at > NOW() - make_interval(secs => $3)`, [userId, kind, seconds]);
  return result.rows[0].count;
}

/** Conversations with unread messages, per kind, for one learner. */
export async function countUnreadConversations(userId: number): Promise<Record<ConversationKind, number>> {
  const result = await pool.query(
    `SELECT c.kind, COUNT(DISTINCT c.id)::int AS count
       FROM conversations c JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
       JOIN messages m ON m.conversation_id = c.id AND m.sender_id IS DISTINCT FROM $1 AND m.id > cm.last_read_message_id
      WHERE c.kind IN ('direct', 'support') GROUP BY c.kind`, [userId]);
  const counts: Record<ConversationKind, number> = { direct: 0, support: 0, assistant: 0 };
  for (const row of result.rows) counts[row.kind as ConversationKind] = row.count;
  return counts;
}

// ---- Blocking

export async function setBlocked(blockerId: number, blockedId: number, blocked: boolean) {
  if (blocked) await pool.query("INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [blockerId, blockedId]);
  else await pool.query("DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2", [blockerId, blockedId]);
}

/** Whether `a` has blocked `b`, and whether `b` has blocked `a`. */
export async function blockState(a: number, b: number): Promise<{ blockedByMe: boolean; blockedMe: boolean }> {
  const result = await pool.query(
    "SELECT blocker_id FROM user_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)", [a, b]);
  const blockers: number[] = result.rows.map(row => row.blocker_id);
  return { blockedByMe: blockers.includes(a), blockedMe: blockers.includes(b) };
}

// ---- Support inbox (all administrators share it)

export async function listSupportConversations(status: "open" | "closed" | "all") {
  const result = await pool.query(
    `SELECT c.id, c.subject, c.status, c.created_at, c.last_message_at,
            u.id AS learner_id, u.username AS learner_username, COALESCE(p.display_name, u.username) AS learner_name,
            last.body AS last_body, last.sender_role AS last_sender_role,
            EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id AND m.sender_role = 'learner'
                     AND m.id > COALESCE(c.staff_read_message_id, 0)) AS unread
       FROM conversations c
       LEFT JOIN users u ON u.id = c.created_by LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN LATERAL (SELECT body, sender_role FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) last ON TRUE
      WHERE c.kind = 'support' AND ($1 = 'all' OR c.status = $1)
      ORDER BY c.last_message_at DESC, c.id DESC LIMIT 200`, [status]);
  return result.rows;
}

export async function markStaffRead(conversationId: number) {
  await pool.query(
    `UPDATE conversations SET staff_read_message_id = (SELECT COALESCE(MAX(id), 0) FROM messages WHERE conversation_id = $1)
      WHERE id = $1 AND kind = 'support'`, [conversationId]);
}

export async function setConversationStatus(conversationId: number, status: "open" | "closed") {
  await pool.query("UPDATE conversations SET status = $2 WHERE id = $1", [conversationId, status]);
}

export async function countUnreadSupportForStaff(): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM conversations c WHERE c.kind = 'support' AND c.status = 'open'
       AND EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id AND m.sender_role = 'learner'
                    AND m.id > COALESCE(c.staff_read_message_id, 0))`);
  return result.rows[0].count;
}

/** Opens or closes a conversation inside a transaction. */
export async function setConversationStatusIn(db: Queryable, conversationId: number, status: "open" | "closed") {
  await db.query("UPDATE conversations SET status = $2 WHERE id = $1", [conversationId, status]);
}
