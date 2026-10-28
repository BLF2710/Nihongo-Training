import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import type { ChatMessage } from "../api/communication";
import { avatarUrl } from "../lib/avatar";

const MAX = 2000;
const time = (iso: string) => {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
const initial = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

/**
 * A conversation: messages, newest at the bottom, and a composer. Used for learner messages,
 * Help & support, the study assistant and the administrators' support inbox.
 */
export default function MessageThread({ messages, onSend, canReply = true, disabledNote, placeholder = "Write a message…", maxLength = MAX, busyLabel, emptyNote, messageActions, label, otherAvatar }: {
  messages: ChatMessage[];
  onSend: (body: string) => Promise<void>;
  canReply?: boolean;
  disabledNote?: ReactNode;
  placeholder?: string;
  maxLength?: number;
  /** Shown as a pending reply while a send is in progress (the study assistant thinking). */
  busyLabel?: string;
  emptyNote?: ReactNode;
  messageActions?: (message: ChatMessage) => ReactNode;
  label: string;
  /** The other learner's picture, in a conversation between two learners. */
  otherAvatar?: string | null;
}) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [messages.length, sending]);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true); setError("");
    try { await onSend(body); setDraft(""); }
    catch (failure) { setError(failure instanceof Error && failure.message ? failure.message : "Could not send the message. Please try again."); }
    finally { setSending(false); }
  };
  // Enter sends; Shift+Enter starts a new line.
  const onKey = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void submit(); } };

  return <div className="flex min-h-0 flex-1 flex-col">
    <ol aria-label={label} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
      {!messages.length && <li className="py-10 text-center text-sm text-gray-500">{emptyNote ?? "No messages yet. Say hello!"}</li>}
      {messages.map(message => <li key={message.id} className={`flex items-end gap-2 ${message.mine ? "justify-end" : "justify-start"}`}>
        {!message.mine && message.senderRole === "learner" && otherAvatar ? <img src={avatarUrl(otherAvatar)} alt="" width={32} height={32} loading="lazy" className="h-8 w-8 shrink-0 rounded-full object-cover" /> : !message.mine && <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${message.senderRole === "assistant" ? "bg-indigo-100 text-indigo-700" : message.senderRole === "admin" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{message.senderRole === "assistant" ? "AI" : initial(message.sender)}</span>}
        <div className={`group max-w-[85%] sm:max-w-[75%] ${message.mine ? "items-end" : "items-start"} flex flex-col`}>
          <p className="mb-1 text-xs font-semibold text-gray-500">{message.mine ? "You" : message.sender} · <time dateTime={message.sentAt}>{time(message.sentAt)}</time></p>
          <p className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 leading-relaxed wrap-anywhere ${message.mine ? "rounded-br-md bg-emerald-600 text-white" : message.senderRole === "assistant" ? "rounded-bl-md border border-indigo-100 bg-indigo-50 text-gray-900" : "rounded-bl-md border border-gray-200 bg-white text-gray-900"}`}>{message.body}</p>
          {messageActions && <div className="mt-1">{messageActions(message)}</div>}
        </div>
      </li>)}
      {sending && busyLabel && <li role="status" className="flex items-center gap-2 text-sm text-gray-500"><span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">AI</span>{busyLabel}</li>}
      <div ref={end} />
    </ol>
    {canReply ? <form onSubmit={submit} className="border-t border-gray-200 bg-white p-3 sm:p-4">
      {error && <p role="alert" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1"><span className="sr-only">Message</span>
          <textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={onKey} rows={2} maxLength={maxLength} placeholder={placeholder}
            className="block max-h-40 min-h-12 w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-emerald-600" />
        </label>
        <button type="submit" disabled={sending || !draft.trim()} className="rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">{sending ? "Sending…" : "Send"}</button>
      </div>
      <p className="mt-1 text-right text-xs text-gray-400">Enter to send · Shift+Enter for a new line · {draft.length}/{maxLength}</p>
    </form> : <p className="border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">{disabledNote}</p>}
  </div>;
}
