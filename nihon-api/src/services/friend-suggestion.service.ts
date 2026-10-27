import { listSuggestionRows } from "../repositories/friend-suggestion.repository";
import { findSocialSettings } from "../repositories/social-settings.repository";
import { requireLearner } from "./friend.service";

const MAX_SUGGESTIONS = 8;

/**
 * Learners you might know: friends of your friends, or learners on your course level. Only for learners who
 * opted in, and only showing others who opted in too; there is no way to browse or search everyone.
 */
export async function getFriendSuggestions(userId: number) {
  await requireLearner(userId);
  if (!(await findSocialSettings(userId)).suggestMe) return { enabled: false, suggestions: [] };
  const rows = await listSuggestionRows(userId, MAX_SUGGESTIONS);
  return {
    enabled: true,
    suggestions: rows.map(row => ({
      username: row.username, displayName: row.display_name, mutualFriends: Number(row.mutual_friends),
      sameLevel: row.same_level ? row.course_level : null,
    })),
  };
}
