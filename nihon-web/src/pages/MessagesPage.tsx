import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MessageThread from "../components/MessageThread";
import { apiErrorMessage } from "../api/errors";
import {
  fetchDirectConversation, fetchDirectConversations, reportDirectMessage, sendDirectMessage, setDirectBlock, startDirectConversation,
} from "../api/communication";
import type { DirectConversation, DirectConversationSummary } from "../api/communication";
import { refreshInbox } from "../lib/inbox";
import PersonAvatar from "../components/PersonAvatar";
import { useRealtime } from "../lib/realtime";

const POLL_MS = 10_000;
const shortTime = (iso: string) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
const button = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50";

/** Direct messages between learners: conversation list on the left, the open conversation on the right. */
export default function MessagesPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const openId = conversationId && /^\d+$/.test(conversationId) ? Number(conversationId) : null;
  const [list, setList] = useState<DirectConversationSummary[] | null>(null);
  const [listError, setListError] = useState("");
  const [username, setUsername] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const loadList = useCallback((signal?: AbortSignal) => fetchDirectConversations(signal)
    .then(data => { setList(data); setListError(""); })
    .catch(error => { if (!signal?.aborted) setListError(apiErrorMessage(error, "Could not load your conversations.")); }), []);
  useEffect(() => {
    const controller = new AbortController();
    void loadList(controller.signal);
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void loadList(); }, POLL_MS * 3);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [loadList]);
  // A new message shows at once; polling stays as the fallback when live updates are off.
  useRealtime(event => { if (event.type === "inbox" || event.type === "resync") void loadList(); });

  // Stable, so the open conversation does not reload on every render.
  const refreshList = useCallback(() => { void loadList(); }, [loadList]);

  const start = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim() || starting) return;
    setStarting(true); setStartError("");
    try { const conversation = await startDirectConversation(username.trim().replace(/^@/, "")); setUsername(""); await loadList(); navigate(`/messages/${conversation.id}`); }
    catch (error) { setStartError(apiErrorMessage(error, "Could not start the conversation.")); }
    finally { setStarting(false); }
  };

  return <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
      <header className="mb-4"><h1 className="text-3xl font-black">Messages</h1><p className="mt-1 text-gray-600">Practise with other learners. Only people who know your username can message you.</p></header>
      <div className="grid min-h-[34rem] flex-1 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm md:grid-cols-[20rem_1fr]">
        <section aria-label="Conversations" className={`flex min-h-0 flex-col border-gray-200 md:border-r ${openId ? "hidden md:flex" : "flex"}`}>
          <form onSubmit={start} className="border-b border-gray-200 p-4">
            <label className="block text-sm font-bold text-gray-700">New message to a username
              <div className="mt-2 flex gap-2"><input value={username} onChange={event => setUsername(event.target.value)} placeholder="e.g. yuki_san" autoComplete="off" maxLength={31}
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-emerald-600" />
                <button disabled={starting || !username.trim()} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50">{starting ? "…" : "Start"}</button></div>
            </label>
            {startError && <p role="alert" className="mt-2 text-sm text-red-700">{startError}</p>}
          </form>
          {listError && <p role="alert" className="m-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{listError}</p>}
          {!list && !listError && <p role="status" className="p-4 text-sm text-gray-500">Loading conversations…</p>}
          {list && !list.length && <p className="p-6 text-center text-sm text-gray-500">No conversations yet. Ask a classmate for their username to say hello.</p>}
          <ul className="min-h-0 flex-1 overflow-y-auto">{list?.map(item => <li key={item.id}>
            <Link to={`/messages/${item.id}`} aria-current={item.id === openId ? "page" : undefined}
              className={`flex gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600 ${item.id === openId ? "bg-emerald-50" : ""}`}>
              <PersonAvatar name={item.with.name} username={item.with.username} avatar={item.with.avatar} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2"><span className="truncate font-bold">{item.with.name}</span><span className="shrink-0 text-xs text-gray-400">{shortTime(item.lastMessageAt)}</span></span>
                <span className="block truncate text-sm text-gray-500">{item.lastMessage ? `${item.lastMessage.mine ? "You: " : ""}${item.lastMessage.body}` : `@${item.with.username}`}</span>
              </span>
              {item.unread > 0 && <span className="self-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">{item.unread}<span className="sr-only"> unread</span></span>}
            </Link>
          </li>)}</ul>
        </section>
        <section aria-label="Conversation" className={`min-h-0 flex-col ${openId ? "flex" : "hidden md:flex"}`}>
          {openId ? <Conversation key={openId} id={openId} onChange={refreshList} />
            : <div className="m-auto max-w-sm p-8 text-center text-gray-500"><p className="text-4xl" aria-hidden="true">💬</p><p className="mt-3 font-semibold text-gray-700">Choose a conversation</p><p className="mt-1 text-sm">Or start one with a classmate's username. Be kind, and never share passwords or personal details.</p></div>}
        </section>
      </div>
    </main>
  </div>;
}

function Conversation({ id, onChange }: { id: number; onChange: () => void }) {
  const [conversation, setConversation] = useState<DirectConversation | null>(null);
  const [error, setError] = useState("");
  const [reporting, setReporting] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback((signal?: AbortSignal) => fetchDirectConversation(id, signal)
    .then(data => { setConversation(data); setError(""); refreshInbox(); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load the conversation.")); }), [id]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).then(onChange);
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, POLL_MS);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [load, onChange]);
  useRealtime(event => { if (event.type === "inbox" || event.type === "resync") void load().then(onChange); });

  if (error && !conversation) return <div className="m-auto p-8 text-center"><p role="alert" className="text-red-700">{error}</p><Link to="/messages" className="mt-3 inline-block font-semibold text-emerald-700 underline">Back to messages</Link></div>;
  if (!conversation) return <p role="status" className="m-auto p-8 text-gray-500">Loading conversation…</p>;

  const send = async (body: string) => {
    try { const message = await sendDirectMessage(id, body); setConversation(current => current && { ...current, messages: [...current.messages, message] }); onChange(); }
    catch (failure) { throw new Error(apiErrorMessage(failure, "Could not send the message. Please try again."), { cause: failure }); }
  };
  const toggleBlock = async () => {
    try { const result = await setDirectBlock(id, !conversation.blockedByMe); setNotice(result.blockedByMe ? `You blocked ${conversation.with.name}. They can't send you messages.` : `You unblocked ${conversation.with.name}.`); await load(); }
    catch (failure) { setNotice(apiErrorMessage(failure, "Could not change the block setting.")); }
  };
  const report = async (event: FormEvent) => {
    event.preventDefault();
    if (reporting === null) return;
    try { await reportDirectMessage(id, reporting, reason); setNotice("Thanks. The message was sent to the support team, who will look into it. You can follow up in Help & support."); setReporting(null); setReason(""); refreshInbox(); }
    catch (failure) { setNotice(apiErrorMessage(failure, "Could not send the report. Please try again.")); }
  };

  return <>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3"><Link to="/messages" className="text-sm font-semibold text-emerald-700 md:hidden">← All</Link>
        <div className="min-w-0"><h2 className="truncate text-lg font-black">{conversation.with.name}</h2><p className="text-xs text-gray-500">@{conversation.with.username}</p></div></div>
      <button className={button} onClick={() => void toggleBlock()}>{conversation.blockedByMe ? "Unblock" : "Block"}</button>
    </header>
    {notice && <p role="status" className="border-b border-gray-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900 sm:px-6">{notice}</p>}
    {reporting !== null && <form onSubmit={report} className="border-b border-gray-200 bg-amber-50 px-4 py-3 sm:px-6">
      <label className="block text-sm font-bold text-amber-950">What is wrong with this message? (optional)
        <input value={reason} onChange={event => setReason(event.target.value)} maxLength={500} className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 font-normal" /></label>
      <div className="mt-2 flex gap-2"><button className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-bold text-white">Send report</button><button type="button" className={button} onClick={() => setReporting(null)}>Cancel</button></div>
    </form>}
    <MessageThread label={`Conversation with ${conversation.with.name}`} otherAvatar={conversation.with.avatar} messages={conversation.messages} onSend={send} canReply={conversation.canReply}
      disabledNote={conversation.blockedByMe ? "You have blocked this learner. Unblock them to reply." : "This learner can't receive messages right now."}
      messageActions={message => !message.mine && <button className="text-xs font-semibold text-gray-400 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-emerald-600" onClick={() => setReporting(message.id)}>Report</button>} />
  </>;
}
