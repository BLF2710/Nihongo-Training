import { Link } from "react-router-dom";
import type { CourseUnit } from "../api/units";
import { getMockExam, levelReached } from "../data/mockExams";
import type { CourseLevel } from "../lib/courseLevel";

/** End-of-level tools: the grammar summary, the cumulative review and the mock exam. */
export default function LevelWrapUp({ level, units }: { level: CourseLevel; units: CourseUnit[] }) {
  const course = units.filter(unit => !unit.isPlaceholder);
  if (!course.length) return null;
  const exam = getMockExam(level);
  const lastUnit = course[course.length - 1];
  const tools = [
    { title: "Grammar summary", mark: "文", href: `/grammar/summary?level=${level}`, open: true, description: `Every ${level} sentence pattern on one page, unit by unit.` },
    { title: "Cumulative review", mark: "復", href: `/review?unit=level:${level}`, open: course.some(unit => unit.allowed), description: "A longer mixed review drawn from every unit you have reached." },
    ...(exam ? [{
      title: "Mock exam", mark: "試", href: `/mock-exam?level=${level}`, open: levelReached(course),
      description: levelReached(course) ? `${exam.minutes} minutes, three sections. See how ready you are for the next level.` : `🔒 Opens when you reach Unit ${lastUnit.number}.`,
    }] : []),
  ];
  return <section aria-labelledby="wrap-up-heading" className="mt-10">
    <h2 id="wrap-up-heading" className="text-2xl font-black text-gray-900">{level} wrap-up</h2>
    <p className="mt-2 text-gray-600">Bring the whole level together before you move on.</p>
    <ul className="mt-5 grid gap-4 sm:grid-cols-3">{tools.map(tool => {
      const body = <>
        <span aria-hidden="true" lang="ja" className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-2xl font-bold text-emerald-800">{tool.mark}</span>
        <span className="mt-3 block text-lg font-bold text-gray-900">{tool.title} {tool.open && <span className="text-emerald-600">→</span>}</span>
        <span className="mt-2 block text-sm leading-relaxed text-gray-600">{tool.description}</span>
      </>;
      return <li key={tool.title}>{tool.open
        ? <Link to={tool.href} className="block h-full rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">{body}</Link>
        : <div aria-disabled="true" className="h-full rounded-2xl border border-gray-200 bg-white p-5 opacity-75">{body}</div>}</li>;
    })}</ul>
  </section>;
}
