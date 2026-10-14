import { Link, useLocation } from "react-router-dom";
import type { CourseLevel } from "../lib/courseLevel";

/** The level a page is showing, with a link to the level picker that comes back to this page. */
export default function LevelSwitch({ level }: { level: CourseLevel }) {
  const { pathname } = useLocation();
  return <span className="inline-flex flex-wrap items-center gap-2">
    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">🇯🇵 Japanese • {level}</span>
    <Link to={`/levels?next=${encodeURIComponent(pathname)}`} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-600">Change level</Link>
  </span>;
}
