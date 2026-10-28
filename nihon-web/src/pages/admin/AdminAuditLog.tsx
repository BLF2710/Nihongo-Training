import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { fetchAuditLog } from '../../api/moderation';
import type { AuditEntry, AuditFilter } from '../../api/moderation';
import { adminError, button, card, input, primaryButton } from './adminData';
import { Chip, EmptyState, NameBadge, Notice } from './AdminUi';
import { describeAuditEntry } from './auditText';

const GROUPS: Record<string, { label: string; icon: string }> = {
  user: { label: 'Accounts', icon: '👥' }, settings: { label: 'Settings', icon: '⚙️' }, content: { label: 'Content', icon: '🔌' },
  question: { label: 'Question bank', icon: '❓' }, support: { label: 'Support', icon: '🛟' }, reports: { label: 'Reports', icon: '🚩' }, lesson: { label: 'Lessons', icon: '✏️' },
};
const groupOf = (action: string) => GROUPS[action.split('.')[0]] ?? { label: action.split('.')[0], icon: '•' };
const dayOf = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

/** Entries grouped by the day they happened, keeping their order. */
function byDay(entries: AuditEntry[]): [string, AuditEntry[]][] {
  const days = new Map<string, AuditEntry[]>();
  for (const entry of entries) days.set(dayOf(entry.at), [...(days.get(dayOf(entry.at)) ?? []), entry]);
  return [...days];
}

/** Every administrator action, newest first, with filters by kind, administrator and account or item. */
export default function AdminAuditLog() {
  const [filter, setFilter] = useState<AuditFilter>({});
  const [draft, setDraft] = useState({ action: '', actor: '', target: '' });
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback((signal?: AbortSignal) => fetchAuditLog(filter, signal)
    .then(page => { setEntries(page.entries); setHasMore(page.hasMore); setActions(page.actions); setError(''); })
    .catch(failure => { if (!signal?.aborted) setError(adminError(failure)); }), [filter]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);

  const apply = (event: FormEvent) => {
    event.preventDefault();
    setEntries(null);
    setFilter({ ...(draft.action ? { action: draft.action } : {}), ...(draft.actor.trim() ? { actor: draft.actor.trim() } : {}), ...(draft.target.trim() ? { target: draft.target.trim() } : {}) });
  };
  const clear = () => { setDraft({ action: '', actor: '', target: '' }); setEntries(null); setFilter({}); };
  const loadOlder = async () => {
    if (!entries?.length) return;
    setLoadingMore(true);
    try { const page = await fetchAuditLog({ ...filter, before: entries[entries.length - 1].id }); setEntries([...entries, ...page.entries]); setHasMore(page.hasMore); }
    catch (failure) { setError(adminError(failure)); }
    finally { setLoadingMore(false); }
  };
  const groups = [...new Set(actions.map(action => action.split('.')[0]))];
  const isFiltered = Object.keys(filter).length > 0;

  return <>
    <form onSubmit={apply} className={`${card} mb-6`} aria-label="Filter the audit log">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-semibold">What<select className={input} value={draft.action} onChange={event => setDraft({ ...draft, action: event.target.value })}>
          <option value="">Everything</option>
          {groups.map(group => <optgroup key={group} label={groupOf(group).label}><option value={group}>All {groupOf(group).label.toLowerCase()}</option>
            {actions.filter(action => action.startsWith(`${group}.`)).map(action => <option key={action} value={action}>{action.slice(group.length + 1).replaceAll('_', ' ')}</option>)}</optgroup>)}
        </select></label>
        <label className="text-sm font-semibold">Administrator<input className={input} value={draft.actor} onChange={event => setDraft({ ...draft, actor: event.target.value })} placeholder="username" /></label>
        <label className="text-sm font-semibold">Account or item<input className={input} value={draft.target} onChange={event => setDraft({ ...draft, target: event.target.value })} placeholder="username, lesson id, support:12" /></label>
        <div className="flex gap-2"><button className={primaryButton}>Filter</button>{isFiltered && <button type="button" className={button} onClick={clear}>Clear</button>}</div>
      </div>
      <p className="mt-3 text-xs text-gray-500">Entries can't be edited or removed. Email addresses are never copied into the log.</p>
    </form>
    {error && <Notice tone="danger">{error}</Notice>}
    {!entries && !error && <p role="status">Loading…</p>}
    {entries && entries.length === 0 && <EmptyState icon="📜" title={isFiltered ? 'Nothing matches these filters' : 'Nothing recorded yet'}>{isFiltered ? 'Try a wider filter, or clear it.' : 'Changes made in the admin area will appear here.'}</EmptyState>}
    {entries && byDay(entries).map(([day, items]) => <section key={day} aria-label={day} className="mb-6">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{day}</h2>
      <ol className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">{items.map(entry => { const group = groupOf(entry.action); return <li key={entry.id} className="flex gap-4 border-t border-gray-100 px-5 py-3 first:border-t-0">
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg">{group.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-gray-900">{describeAuditEntry(entry)}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">{entry.actor ? <><NameBadge name={entry.actor} size="sm" />@{entry.actor}</> : 'Deleted account'}</span>
            <span aria-hidden="true">·</span><time dateTime={entry.at}>{timeOf(entry.at)}</time>
            <Chip>{group.label}</Chip>
          </p>
        </div>
      </li>; })}</ol>
    </section>)}
    {hasMore && <button className={button} disabled={loadingMore} onClick={() => void loadOlder()}>{loadingMore ? 'Loading…' : 'Show older'}</button>}
  </>;
}
