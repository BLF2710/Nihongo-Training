import { avatarUrl } from "../lib/avatar";

// A learner's uploaded picture, or their initial on a colour picked from their username, so the same person always
// looks the same. Pictures come from our own API (never an outside address, which could track who views them).
const COLOURS = ["bg-emerald-700", "bg-indigo-600", "bg-sky-700", "bg-violet-700", "bg-rose-700", "bg-amber-700"];
const SIZES = { md: { box: "h-11 w-11 text-lg", pixels: 44 }, lg: { box: "h-20 w-20 text-3xl", pixels: 80 } } as const;

type Props = { name: string; username: string; avatar?: string | null; size?: keyof typeof SIZES };

export default function PersonAvatar({ name, username, avatar, size = "md" }: Props) {
  const { box, pixels } = SIZES[size];
  if (avatar) return <img src={avatarUrl(avatar)} alt="" width={pixels} height={pixels} loading="lazy" decoding="async" className={`shrink-0 rounded-full object-cover ${box}`} />;
  const hash = [...username.toLowerCase()].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  return <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full font-black text-white ${box} ${COLOURS[hash % COLOURS.length]}`}>{[...(name.trim() || username)][0]?.toUpperCase()}</span>;
}
