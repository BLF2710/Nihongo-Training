import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MessageThread from "../components/MessageThread";
import { apiErrorMessage } from "../api/errors";
import { fetchSupportRequest, fetchSupportRequests, replyToSupport, startSupportRequest } from "../api/communication";
import type { SupportConversation, SupportSummary } from "../api/communication";
import { refreshInbox } from "../lib/inbox";

const POLL_MS = 15_000;
const input = "mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-normal text-gray-900 focus-visible:outline-2 focus-visible:outline-emerald-600";
const statusChip = (status: "open" | "closed") => status === "open"
  ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Open</span>
  : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">Closed</span>;

/** Help & support: a learner's requests to the LingoHub team. */
export default function SupportPage() {
  const { requestId } = useParams();
  const openId = requestId && /^\d+$/.test(requestId) ? Number(requestId) : null;
  const navigate = useNavigate();
  const [list, setList] = useState<SupportSummary[] | null>(null);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const loadList = useCallback((signal?: AbortSignal) => fetchSupportRequests(signal)
    .then(data => { setList(data); setError(""); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load your support requests.")); }), []);
  const refreshList = useCallback(() => { void loadList(); }, [loadList]);
  useEffect(() => { const controller = new AbortController(); void loadList(controller.signal); return () => controller.abort(); }, [loadList]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true); setFormError("");
    try { const created = await startSupportRequest(subject, body); setSubject(""); setBody(""); await loadList(); navigate(`/support/${created.id}`); }
    catch (failure) { setFormError(apiErrorMessage(failure, "Could not send your request. Please try again.")); }
    finally { setSending(false); }
  };

  return <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
      <header className="mb-4"><h1 className="text-3xl font-black">Help & support</h1><p className="mt-1 text-gray-600">Ask the LingoHub team about your account, a lesson, or anything that isn't working. Replies appear here.</p></header>
      <div className="grid gap-5 md:grid-cols-[20rem_1fr]">
        <aside className={`space-y-5 ${openId ? "hidden md:block" : ""}`}>
          <section aria-labelledby="your-requests" className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
            <h2 id="your-requests" className="border-b border-gray-200 px-4 py-3 font-bold">Your requests</h2>
            {error && <p role="alert" className="m-4 text-sm text-red-700">{error}</p>}
            {!list && !error && <p role="status" className="p-4 text-sm text-gray-500">Loading…</p>}
            {list && !list.length && <p className="p-4 text-sm text-gray-500">You have no support requests.</p>}
            <ul>{list?.map(item => <li key={item.id}><Link to={`/support/${item.id}`} aria-current={item.id === openId ? "page" : undefined}
              className={`block border-b border-gray-100 px-4 py-3 hover:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600 ${item.id === openId ? "bg-emerald-50" : ""}`}>
              <span className="flex items-center justify-between gap-2"><span className="truncate font-bold">{item.subject}</span>{statusChip(item.status)}</span>
              <span className="mt-1 flex items-center justify-between gap-2 text-sm text-gray-500"><span className="truncate">{item.lastMessage ? `${item.lastMessage.fromSupport ? "Support: " : "You: "}${item.lastMessage.body}` : ""}</span>
                {item.unread > 0 && <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">{item.unread} new</span>}</span>
            </Link></li>)}</ul>
          </section>
        </aside>
        <section className={`${openId ? "" : "order-first md:order-none"}`}>
          {openId ? <div className="flex h-[36rem] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"><Request key={openId} id={openId} onChange={refreshList} /></div>
            : <form onSubmit={submit} aria-labelledby="new-request" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 id="new-request" className="text-xl font-black">New request</h2>
              <p className="mt-1 text-sm text-gray-500">Give a short subject and as much detail as you can, such as the page or lesson. Never include your password.</p>
              <label className="mt-4 block text-sm font-bold text-gray-700">Subject<input required minLength={3} maxLength={120} value={subject} onChange={event => setSubject(event.target.value)} className={input} /></label>
              <label className="mt-4 block text-sm font-bold text-gray-700">Message<textarea required maxLength={2000} rows={6} value={body} onChange={event => setBody(event.target.value)} className={input} /></label>
              {formError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
              <button disabled={sending} className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50">{sending ? "Sending…" : "Send request"}</button>
            </form>}
        </section>
      </div>
    </main>
  </div>;
}

function Request({ id, onChange }: { id: number; onChange: () => void }) {
  const [request, setRequest] = useState<SupportConversation | null>(null);
  const [error, setError] = useState("");
  const load = useCallback((signal?: AbortSignal) => fetchSupportRequest(id, signal)
    .then(data => { setRequest(data); setError(""); refreshInbox(); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load the support request.")); }), [id]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).then(onChange);
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, POLL_MS);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [load, onChange]);
  if (error && !request) return <div className="m-auto p-8 text-center"><p role="alert" className="text-red-700">{error}</p><Link to="/support" className="mt-3 inline-block font-semibold text-emerald-700 underline">Back to Help & support</Link></div>;
  if (!request) return <p role="status" className="m-auto p-8 text-gray-500">Loading…</p>;
  const send = async (body: string) => {
    try { const message = await replyToSupport(id, body); setRequest(current => current && { ...current, status: "open", messages: [...current.messages, message] }); onChange(); }
    catch (failure) { throw new Error(apiErrorMessage(failure, "Could not send the message. Please try again."), { cause: failure }); }
  };
  return <>
    <header className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6">
      <div className="min-w-0"><Link to="/support" className="text-sm font-semibold text-emerald-700">← All requests</Link><h2 className="truncate text-lg font-black">{request.subject}</h2></div>
      {statusChip(request.status)}
    </header>
    {request.status === "closed" && <p className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 sm:px-6">This request is closed. Writing again reopens it.</p>}
    <MessageThread label={`Support request: ${request.subject}`} messages={request.messages} onSend={send} placeholder="Add more detail or reply to the team…" />
  </>;
}
