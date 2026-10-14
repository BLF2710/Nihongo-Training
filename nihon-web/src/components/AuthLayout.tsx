import { useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

const highlights = [
  { mark: "あ", title: "Start with the sounds", text: "Hiragana and Katakana with stroke order, audio, and speed quizzes." },
  { mark: "文", title: "Follow a real course", text: "N5 and N4 lessons with vocabulary, grammar, dialogues, and unit assessments." },
  { mark: "話", title: "Use what you learn", text: "Listening, speaking, and mixed reviews for every unit you reach." },
];

/** The shared frame of the sign-in and registration pages: brand panel beside the form on wide screens, form only on small ones. */
export default function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return <div className="min-h-screen bg-gray-50 text-gray-900 lg:grid lg:grid-cols-[1.05fr_1fr]">
    <aside aria-label="About LingoHub" className="relative hidden overflow-hidden bg-emerald-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <span aria-hidden="true" lang="ja" className="pointer-events-none absolute -right-10 -top-16 select-none text-[22rem] font-black leading-none text-white/5">語</span>
      <Link to="/" className="relative flex items-center gap-2.5 text-2xl font-black tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-emerald-500 text-lg shadow-sm">🌐</span>
        <span>Lingo<span className="text-emerald-300">Hub</span></span>
      </Link>
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">🇯🇵 Japanese · N5 and N4</p>
        <h2 className="mt-3 max-w-md text-4xl font-black leading-tight">A little learning, a little practice, every day.</h2>
        <ul className="mt-8 max-w-md space-y-5">{highlights.map(item => <li key={item.title} className="flex gap-4">
          <span aria-hidden="true" lang="ja" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold">{item.mark}</span>
          <span><span className="block font-bold">{item.title}</span><span className="mt-0.5 block text-sm leading-relaxed text-emerald-100">{item.text}</span></span>
        </li>)}</ul>
      </div>
      <p className="relative text-sm text-emerald-200">Not ready to sign up? <Link to="/guest/practice?type=hiragana" className="font-bold text-white underline focus-visible:outline-2 focus-visible:outline-white">Try a Kana speed quiz as a guest →</Link></p>
    </aside>

    <main className="flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:min-h-0">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold text-gray-600 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-600">← Back to home</Link>
        <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-600 to-emerald-500 text-base text-white">🌐</span>
          <span>Lingo<span className="text-emerald-600">Hub</span></span>
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-2 text-gray-600">{subtitle}</p>
        <div className="mt-7 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
        <p className="mt-6 text-center text-sm text-gray-600">{footer}</p>
      </div>
    </main>
  </div>;
}

const inputClass = "mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-2 focus:outline-emerald-500/30";
type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & { label: string; hint?: string };

export function AuthField({ label, hint, ...input }: FieldProps) {
  const hintId = useId();
  return <label className="block text-sm font-bold text-gray-700">{label}
    <input {...input} aria-describedby={hint ? hintId : undefined} className={inputClass} />
    {hint && <span id={hintId} className="mt-1 block text-xs font-normal text-gray-500">{hint}</span>}
  </label>;
}

/** A password input with a show/hide switch. */
export function PasswordField({ label, hint, ...input }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const hintId = useId();
  // The switch sits beside the input, outside the label, so the field is announced simply as its label.
  return <div>
    <label htmlFor={inputId} className="block text-sm font-bold text-gray-700">{label}</label>
    <div className="relative mt-1.5">
      <input {...input} id={inputId} type={visible ? "text" : "password"} aria-describedby={hint ? hintId : undefined} className={`${inputClass} mt-0 pr-16`} />
      <button type="button" aria-pressed={visible} aria-label={`Show ${label.toLowerCase()}`} onClick={() => setVisible(value => !value)} className="absolute inset-y-0 right-2 my-auto h-8 rounded-lg px-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600">{visible ? "Hide" : "Show"}</button>
    </div>
    {hint && <p id={hintId} className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>;
}

export const authSubmitClass = "w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60";
