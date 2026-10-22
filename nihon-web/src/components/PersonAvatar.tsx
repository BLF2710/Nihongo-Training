// A learner's initial on a colour picked from their username, so the same person always looks the same.
// Uploaded pictures are not shown to other learners (an outside image address could track who views it).
const COLOURS = ["bg-emerald-700", "bg-indigo-600", "bg-sky-700", "bg-violet-700", "bg-rose-700", "bg-amber-700"];

export default function PersonAvatar({ name, username, size = "md" }: { name: string; username: string; size?: "md" | "lg" }) {
  const hash = [...username.toLowerCase()].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const dimensions = size === "lg" ? "h-20 w-20 text-3xl" : "h-11 w-11 text-lg";
  return <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full font-black text-white ${dimensions} ${COLOURS[hash % COLOURS.length]}`}>{[...(name.trim() || username)][0]?.toUpperCase()}</span>;
}
