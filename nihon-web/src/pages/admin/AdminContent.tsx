import { useState } from 'react';
import { setContentEnabled } from '../../api/admin';
import { adminError, button, input, useAdminData } from './adminData';
import { Chip, EmptyState, Notice } from './AdminUi';

type Content = { key: string; title: string; category: string; paths: string[]; source: string; enabled: boolean };

/** Switches activities on or off for learners; progress is kept either way. */
export default function AdminContent() {
  const result = useAdminData<{ items: Content[] }>('/admin/content');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function toggle(item: Content) {
    if (busy) return;
    setBusy(item.key); setError(''); setMessage('');
    try { await setContentEnabled(item.key, !item.enabled); setMessage(`${item.title} is now ${item.enabled ? 'unavailable' : 'available'}. Existing progress is preserved.`); result.reload(); }
    catch (failure) { setError(adminError(failure)); }
    finally { setBusy(''); }
  }
  const all = result.data?.items ?? [];
  const items = all.filter(item => (category === 'All' || category === item.category) && item.title.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(items.map(item => item.category))];
  const off = all.filter(item => !item.enabled).length;
  return <>
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">Switch an activity off and learners see a "temporarily unavailable" page instead; their progress is kept. Lesson prerequisites still apply when it's on.</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-48 flex-1 text-sm font-bold">Search content<input className={input} value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a lesson or activity" /></label>
        <label className="text-sm font-bold">Category<select className={input} value={category} onChange={event => setCategory(event.target.value)}>{['All', ...new Set(all.map(item => item.category))].map(value => <option key={value}>{value}</option>)}</select></label>
        <button className={button} disabled={result.loading || !!busy} onClick={result.reload}>↻ Refresh</button>
      </div>
      {result.data && <p className="mt-3 text-xs text-gray-500">{all.length - off} of {all.length} available{off ? ` · ${off} switched off` : ''}</p>}
    </div>
    {(error || result.error) && <Notice tone="danger">{error || result.error}</Notice>}
    {message && <Notice tone="good">{message}</Notice>}
    {result.loading && !result.data && <p role="status">Loading content…</p>}
    {categories.map(name => <section key={name} aria-label={name} className="mb-6">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{name}</h3>
      <div className="grid gap-3 xl:grid-cols-2">{items.filter(item => item.category === name).map(item => <article key={item.key} className={`flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm ${item.enabled ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-90'}`}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h4 className="font-bold">{item.title}</h4>{item.enabled ? <Chip tone="good" icon="●">Available</Chip> : <Chip icon="○">Unavailable</Chip>}</div>
          <p className="mt-1 text-sm text-gray-500">{item.source}</p>
          <p className="mt-2 font-mono text-xs text-gray-400">{item.paths[0]}</p>
        </div>
        <button className={`${button} shrink-0 ${item.enabled ? '' : 'border-emerald-500 text-emerald-800'}`} disabled={!!busy || result.loading} onClick={() => void toggle(item)}>{busy === item.key ? 'Saving…' : item.enabled ? 'Disable' : 'Enable'}</button>
      </article>)}</div>
    </section>)}
    {!result.loading && !result.error && result.data && !items.length && <EmptyState icon="🔎" title="No content matches your search" />}
  </>;
}
