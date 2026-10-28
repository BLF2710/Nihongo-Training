import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Building blocks shared by the admin pages, so they look like one product.

export type Tone = 'good' | 'warning' | 'danger' | 'info' | 'neutral';
const TONES: Record<Tone, string> = {
  good: 'bg-emerald-50 text-emerald-800 ring-emerald-200', warning: 'bg-amber-50 text-amber-900 ring-amber-200', danger: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-indigo-50 text-indigo-800 ring-indigo-200', neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
};

/** A small coloured label; the text always says what the colour means. */
export function Chip({ tone = 'neutral', icon, children }: { tone?: Tone; icon?: string; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${TONES[tone]}`}>{icon && <span aria-hidden="true">{icon}</span>}{children}</span>;
}

/** A headline number with an icon badge; links somewhere when `to` is given. */
export function StatTile({ icon, label, value, detail, to, tone = 'neutral' }: { icon: string; label: string; value: ReactNode; detail?: string; to?: string; tone?: Tone }) {
  const body = <>
    <span aria-hidden="true" className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${tone === 'neutral' ? 'bg-emerald-50' : TONES[tone]}`}>{icon}</span>
    <span className="min-w-0"><span className="block text-sm font-medium text-gray-500">{label}</span>
      <span className="mt-0.5 block text-3xl font-extrabold tracking-tight text-gray-900">{value}</span>
      {detail && <span className="mt-0.5 block text-xs text-gray-500">{detail}</span>}</span>
  </>;
  const className = 'flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm';
  return to ? <Link to={to} className={`${className} transition hover:border-emerald-400 hover:shadow-md`}>{body}</Link> : <div className={className}>{body}</div>;
}

/** An account's initial on a colour picked from the username (the same account always looks the same). */
export function NameBadge({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const colours = ['bg-emerald-700', 'bg-indigo-600', 'bg-sky-700', 'bg-violet-700', 'bg-rose-700', 'bg-amber-700'];
  const hash = [...name.toLowerCase()].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  return <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full font-black text-white ${size === 'sm' ? 'h-5 w-5 text-[10px]' : 'h-9 w-9 text-sm'} ${colours[hash % colours.length]}`}>{[...name][0]?.toUpperCase()}</span>;
}

export function EmptyState({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
    <p aria-hidden="true" className="text-4xl">{icon}</p><p className="mt-2 font-bold text-gray-900">{title}</p>
    {children && <div className="mt-1 text-sm text-gray-600">{children}</div>}
  </div>;
}

/** A status line under a form or list: success in green, problems in red. */
export function Notice({ tone, children }: { tone: 'good' | 'danger'; children: ReactNode }) {
  return <p role={tone === 'danger' ? 'alert' : 'status'} className={`mb-4 rounded-xl p-4 text-sm ${tone === 'danger' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{children}</p>;
}
