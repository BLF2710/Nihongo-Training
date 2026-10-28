import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MessageThread from '../../components/MessageThread';
import { fetchStaffSupport, fetchSupportInbox, replyAsSupport, setSupportStatus } from '../../api/communication';
import type { StaffSupportConversation, StaffSupportSummary } from '../../api/communication';
import { adminError, button, card } from './adminData';
import ReportPanel from './ReportPanel';

type Filter = 'open' | 'closed' | 'all';
const FILTERS: [Filter, string][] = [['open', 'Open'], ['closed', 'Closed'], ['all', 'All']];

/** The shared support inbox: learner requests and reported messages, answered as "Lingora support". */
export default function AdminSupport() {
  const [params, setParams] = useSearchParams();
  const openId = /^\d+$/.test(params.get('id') ?? '') ? Number(params.get('id')) : null;
  const filter = (FILTERS.find(([key]) => key === params.get('status'))?.[0] ?? 'open') as Filter;
  const [list, setList] = useState<{ unreadOpen: number; conversations: StaffSupportSummary[] } | null>(null);
  const [error, setError] = useState('');
  const loadList = useCallback((signal?: AbortSignal) => fetchSupportInbox(filter, signal)
    .then(data => { setList(data); setError(''); })
    .catch(failure => { if (!signal?.aborted) setError(adminError(failure)); }), [filter]);
  const refreshList = useCallback(() => { void loadList(); }, [loadList]);
  useEffect(() => {
    const controller = new AbortController();
    void loadList(controller.signal);
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void loadList(); }, 30_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [loadList]);
  const go = (next: { id?: number | null; status?: Filter }) => {
    const status = next.status ?? filter; const id = next.id === undefined ? openId : next.id;
    setParams({ ...(status !== 'open' ? { status } : {}), ...(id ? { id: String(id) } : {}) });
  };

  return <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
    <section aria-label="Support requests" className={`${card} p-0! overflow-hidden ${openId ? 'hidden lg:block' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-600">{list ? `${list.unreadOpen} open with new messages` : 'Loading…'}</p>
        <div role="group" aria-label="Filter requests" className="flex gap-1">{FILTERS.map(([key, label]) =>
          <button key={key} aria-pressed={filter === key} onClick={() => go({ status: key, id: null })} className={`rounded-lg px-3 py-1 text-xs font-bold ${filter === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>)}</div>
      </div>
      {error && <p role="alert" className="m-4 text-sm text-red-700">{error}</p>}
      {list && !list.conversations.length && <p className="p-6 text-center text-sm text-gray-500">No {filter === 'all' ? '' : filter} requests.</p>}
      <ul className="max-h-[36rem] overflow-y-auto">{list?.conversations.map(item => <li key={item.id}>
        <button onClick={() => go({ id: item.id })} aria-current={item.id === openId ? 'true' : undefined}
          className={`block w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600 ${item.id === openId ? 'bg-emerald-50' : ''}`}>
          <span className="flex items-center justify-between gap-2"><span className={`truncate ${item.unread ? 'font-black' : 'font-semibold'}`}>{item.subject}</span>
            {item.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600"><span className="sr-only">New message</span></span>}</span>
          <span className="mt-0.5 block truncate text-xs text-gray-500">{item.learner ? `${item.learner.name} (@${item.learner.username})` : 'Deleted account'} · {item.status}</span>
          <span className="mt-1 block truncate text-sm text-gray-600">{item.lastMessage ? `${item.lastMessage.fromSupport ? 'Support: ' : ''}${item.lastMessage.body}` : ''}</span>
        </button>
      </li>)}</ul>
    </section>
    <section aria-label="Support request" className={`${card} p-0! flex h-[40rem] flex-col overflow-hidden ${openId ? '' : 'hidden lg:flex'}`}>
      {openId ? <StaffRequest key={openId} id={openId} onChange={refreshList} onBack={() => go({ id: null })} />
        : <p className="m-auto p-8 text-center text-gray-500">Choose a request to read and reply. Reported messages arrive here as requests named “Report: …”.</p>}
    </section>
  </div>;
}

function StaffRequest({ id, onChange, onBack }: { id: number; onChange: () => void; onBack: () => void }) {
  const [request, setRequest] = useState<StaffSupportConversation | null>(null);
  const [error, setError] = useState('');
  const load = useCallback((signal?: AbortSignal) => fetchStaffSupport(id, signal)
    .then(data => { setRequest(data); setError(''); })
    .catch(failure => { if (!signal?.aborted) setError(adminError(failure)); }), [id]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).then(onChange);
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 15_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [load, onChange]);
  if (error && !request) return <p role="alert" className="m-auto p-8 text-red-700">{error}</p>;
  if (!request) return <p role="status" className="m-auto p-8 text-gray-500">Loading…</p>;
  const send = async (body: string) => {
    try { const message = await replyAsSupport(id, body); setRequest(current => current && { ...current, messages: [...current.messages, message] }); onChange(); }
    catch (failure) { throw new Error(adminError(failure), { cause: failure }); }
  };
  const toggle = async () => {
    try { const result = await setSupportStatus(id, request.status === 'open' ? 'closed' : 'open'); setRequest(current => current && { ...current, status: result.status as 'open' | 'closed' }); onChange(); }
    catch (failure) { setError(adminError(failure)); }
  };
  return <>
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
      <div className="min-w-0"><button onClick={onBack} className="text-sm font-semibold text-emerald-700 lg:hidden">← All requests</button>
        <h2 className="truncate text-lg font-black">{request.subject}</h2>
        <p className="text-sm text-gray-500">{request.learner ? <>From {request.learner.name} (@{request.learner.username}){request.learner.status !== 'active' && ` · ${request.learner.status}`} · <Link className="font-semibold text-emerald-700 hover:underline" to={`/admin/users?search=${encodeURIComponent(request.learner.username)}`}>Account</Link></> : 'From a deleted account'} · {request.status}</p></div>
      <button className={button} onClick={() => void toggle()}>{request.status === 'open' ? 'Close request' : 'Reopen'}</button>
    </header>
    {error && <p role="alert" className="border-b border-gray-200 bg-red-50 px-5 py-2 text-sm text-red-700">{error}</p>}
    {request.reports && <div className="border-b border-gray-200 p-4"><ReportPanel summary={request.reports} onResolved={() => { void load(); onChange(); }} /></div>}
    <MessageThread label={`Support request ${request.subject}`} messages={request.messages} onSend={send} placeholder="Reply as Lingora support…" />
  </>;
}
