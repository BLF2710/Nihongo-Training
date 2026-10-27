import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { fetchAuditLog } from '../../api/moderation';
import type { AuditEntry, AuditFilter } from '../../api/moderation';
import { adminError, button, card, input } from './adminData';
import { describeAuditEntry } from './auditText';

const GROUP_LABELS: Record<string, string> = { user: 'Accounts', settings: 'Settings', content: 'Content', question: 'Question bank', support: 'Support', reports: 'Reports', lesson: 'Lessons' };
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
  const loadOlder = async () => {
    if (!entries?.length) return;
    setLoadingMore(true);
    try { const page = await fetchAuditLog({ ...filter, before: entries[entries.length - 1].id }); setEntries([...entries, ...page.entries]); setHasMore(page.hasMore); }
    catch (failure) { setError(adminError(failure)); }
    finally { setLoadingMore(false); }
  };
  const groups = [...new Set(actions.map(action => action.split('.')[0]))];

  return <section className={card} aria-labelledby="audit-heading">
    <h2 id="audit-heading" className="text-xl font-black">Audit log</h2>
    <p className="text-sm text-gray-600">Who changed what in the admin area. Entries can't be edited or removed.</p>
    <form onSubmit={apply} className="mt-4 grid gap-3 sm:grid-cols-4 sm:items-end">
      <label className="text-sm font-semibold">What<select className={input} value={draft.action} onChange={event => setDraft({ ...draft, action: event.target.value })}>
        <option value="">Everything</option>
        {groups.map(group => <optgroup key={group} label={GROUP_LABELS[group] ?? group}><option value={group}>All {(GROUP_LABELS[group] ?? group).toLowerCase()}</option>
          {actions.filter(action => action.startsWith(`${group}.`)).map(action => <option key={action} value={action}>{action.slice(group.length + 1).replaceAll('_', ' ')}</option>)}</optgroup>)}
      </select></label>
      <label className="text-sm font-semibold">Administrator<input className={input} value={draft.actor} onChange={event => setDraft({ ...draft, actor: event.target.value })} placeholder="username" /></label>
      <label className="text-sm font-semibold">Account or item<input className={input} value={draft.target} onChange={event => setDraft({ ...draft, target: event.target.value })} placeholder="username, lesson id, support:12" /></label>
      <button className={button}>Filter</button>
    </form>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {!entries && !error && <p role="status" className="mt-4">Loading…</p>}
    {entries && (entries.length === 0 ? <p className="mt-4 text-gray-600">Nothing matches.</p> : <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="text-xs uppercase text-gray-500"><tr><th className="py-2 pr-3">When</th><th className="py-2 pr-3">Administrator</th><th className="py-2">What</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{entries.map(entry => <tr key={entry.id}>
          <td className="whitespace-nowrap py-2 pr-3 text-gray-600">{when(entry.at)}</td>
          <td className="py-2 pr-3 font-semibold">{entry.actor ? `@${entry.actor}` : 'Deleted account'}</td>
          <td className="py-2">{describeAuditEntry(entry)}</td>
        </tr>)}</tbody>
      </table>
    </div>)}
    {hasMore && <button className={button + ' mt-4'} disabled={loadingMore} onClick={() => void loadOlder()}>{loadingMore ? 'Loading…' : 'Show older'}</button>}
  </section>;
}
