import { NavLink } from "react-router-dom";

/** `end`: active only on exactly this address (for a section at the parent address of the others). */
export type SectionTab = { to: string; label: string; icon?: string; badge?: number; end?: boolean };

/** A row of tabs that are links, one address per section, so links and Back work. Scrolls sideways on phones. */
export default function SectionTabs({ label, tabs }: { label: string; tabs: SectionTab[] }) {
  return <nav aria-label={label} className="mb-6 overflow-x-auto">
    <ul className="flex gap-2 border-b border-gray-200">{tabs.map(tab => <li key={tab.to} className="shrink-0">
      <NavLink to={tab.to} end={tab.end} className={({ isActive }) => `-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold ${isActive ? "border-emerald-600 text-emerald-800" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
        {tab.icon && <span aria-hidden="true">{tab.icon}</span>}{tab.label}
        {!!tab.badge && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{tab.badge}</span>}
      </NavLink>
    </li>)}</ul>
  </nav>;
}
