import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MessageThread from "../components/MessageThread";
import { apiErrorMessage } from "../api/errors";
import { askAssistant, fetchAssistant, startAssistantChat } from "../api/communication";
import type { AssistantState } from "../api/communication";
import { useCourseLevel } from "../lib/courseLevel";

const SUGGESTIONS = ["What does 思う mean?", "When do I use は and when が?", "How do I make the て-form?", "Give me three sentences with 〜たいです"];
const button = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50";

/** The study assistant: the course helper today, an AI tutor when the server connects one. */
export default function AssistantPage() {
  const level = useCourseLevel();
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState<AssistantState | null>(null);
  const [error, setError] = useState("");
  const asked = useRef(false);

  const load = useCallback((conversationId?: number, signal?: AbortSignal) => fetchAssistant(conversationId, signal)
    .then(data => { setState(data); setError(""); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load the study assistant.")); }), []);
  useEffect(() => { const controller = new AbortController(); void load(undefined, controller.signal); return () => controller.abort(); }, [load]);

  const conversationId = state?.conversationId ?? null;
  const send = useCallback(async (body: string) => {
    try {
      const result = await askAssistant(body, conversationId, level);
      setState(current => current && {
        ...current, conversationId: result.conversationId, messages: [...current.messages, ...result.messages],
        conversations: current.conversations.some(item => item.id === result.conversationId) ? current.conversations
          : [{ id: result.conversationId, title: body.slice(0, 60), lastMessageAt: new Date().toISOString() }, ...current.conversations],
      });
    } catch (failure) { throw new Error(apiErrorMessage(failure, "The study assistant could not answer. Please try again."), { cause: failure }); }
  }, [conversationId, level]);

  // A question asked from the dashboard arrives as ?q= and is sent once.
  useEffect(() => {
    const question = params.get("q")?.trim();
    if (!state || !question || asked.current) return;
    asked.current = true;
    setParams({}, { replace: true });
    void send(question.slice(0, 1000)).catch(failure => setError(failure.message));
  }, [state, params, setParams, send]);

  const newChat = async () => {
    try { const created = await startAssistantChat(); setState(current => current && { ...current, conversationId: created.conversationId, messages: [] }); }
    catch (failure) { setError(apiErrorMessage(failure, "Could not start a new chat.")); }
  };

  return <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-black">Study assistant</h1><p className="mt-1 text-gray-600">Ask about words, grammar and kanji at your level ({level}).</p></div>
        {state && <span className={`rounded-full px-3 py-1 text-xs font-bold ${state.provider.ai ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-700"}`}>{state.provider.label}</span>}
      </header>
      {error && <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {!state && !error && <p role="status" className="text-gray-500">Loading…</p>}
      {state && <div className="grid min-h-[34rem] flex-1 gap-5 md:grid-cols-[16rem_1fr]">
        <aside className="hidden flex-col gap-3 md:flex">
          <button className={button} onClick={() => void newChat()}>+ New chat</button>
          <section aria-labelledby="earlier-chats" className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <h2 id="earlier-chats" className="border-b border-gray-200 px-3 py-2 text-sm font-bold text-gray-600">Earlier chats</h2>
            {!state.conversations.length && <p className="p-3 text-sm text-gray-500">None yet.</p>}
            <ul>{state.conversations.map(chat => <li key={chat.id}><button onClick={() => void load(chat.id)} aria-current={chat.id === state.conversationId ? "true" : undefined}
              className={`block w-full truncate border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-emerald-600 ${chat.id === state.conversationId ? "bg-emerald-50 font-bold" : ""}`}>{chat.title}</button></li>)}</ul>
          </section>
          <p className="text-xs leading-relaxed text-gray-500">{state.provider.ai ? "Answers are written by an AI and can be wrong. Check important points against your lessons." : "The course helper searches the vocabulary and grammar of your lessons. A full AI tutor can be connected later."}</p>
        </aside>
        <section aria-label="Chat" className="flex min-h-[30rem] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 md:hidden"><span className="text-sm text-gray-500">{state.provider.label}</span><button className={button} onClick={() => void newChat()}>New chat</button></div>
          <MessageThread label="Study assistant chat" messages={state.messages} onSend={send} maxLength={1000} busyLabel="Thinking…" placeholder="Ask a question in English or Japanese…"
            emptyNote={<div><p className="text-3xl" aria-hidden="true">🤖</p><p className="mt-2 font-semibold text-gray-700">What would you like to learn?</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-2">{SUGGESTIONS.map(suggestion => <li key={suggestion}>
                <button onClick={() => void send(suggestion).catch(failure => setError(failure.message))} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-emerald-600">{suggestion}</button>
              </li>)}</ul></div>} />
        </section>
      </div>}
    </main>
  </div>;
}
