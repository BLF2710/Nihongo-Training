import type { AppNotification } from "../api/notifications";

/** What a notification says and where it leads. */
export function describeNotification(item: AppNotification): { icon: string; text: string; href: string } {
  const who = item.actor ? `${item.actor.displayName} (@${item.actor.username})` : "A learner";
  switch (item.kind) {
    case "friend_request": return { icon: "👋", text: `${who} sent you a friend request.`, href: "/friends" };
    case "friend_accepted": return { icon: "🤝", text: `${who} accepted your friend request.`, href: item.actor ? `/u/${encodeURIComponent(item.actor.username)}` : "/friends" };
    case "support_reply": return { icon: "🛟", text: `Support replied to “${item.data.subject || "your request"}”.`, href: item.data.conversationId ? `/support/${item.data.conversationId}` : "/support" };
    case "achievement": return { icon: "🏆", text: `You earned an achievement: ${item.data.title || "a new achievement"}.`, href: "/profile" };
    default: return { icon: "🔔", text: "Something new happened.", href: "/" };
  }
}

/** "just now", "5 min ago", "3 h ago", "2 days ago", then the date. */
export function timeAgo(iso: string, now = Date.now()) {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
