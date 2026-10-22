import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRealtime } from "../lib/realtime";

type Toast = { id: number; text: string; href: string; action: string };
const SHOW_MS = 8_000;
let nextId = 1;

/** Short live notices for friend requests and accepted requests, shown on whatever page the learner is on. */
export default function LiveNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useRealtime(event => {
    if (event.type !== "friends" || !event.person || event.reason === "updated") return;
    const { displayName, username } = event.person;
    const toast = event.reason === "request"
      ? { text: `${displayName} (@${username}) sent you a friend request.`, href: "/friends", action: "View requests" }
      : { text: `${displayName} (@${username}) accepted your friend request.`, href: `/u/${encodeURIComponent(username)}`, action: "View profile" };
    setToasts(current => [...current.slice(-2), { id: nextId++, ...toast }]);
  });
  useEffect(() => {
    if (!toasts.length) return;
    const timer = window.setTimeout(() => setToasts(current => current.slice(1)), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [toasts]);
  const close = (id: number) => setToasts(current => current.filter(toast => toast.id !== id));
  return <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96">
    {toasts.map(toast => <div key={toast.id} className="pointer-events-auto w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-xl">
      <p className="text-gray-900"><span aria-hidden="true">👋 </span>{toast.text}</p>
      <div className="mt-2 flex items-center gap-4"><Link to={toast.href} onClick={() => close(toast.id)} className="font-bold text-emerald-700 hover:underline">{toast.action} →</Link><button type="button" onClick={() => close(toast.id)} className="ml-auto text-gray-500 hover:text-gray-800">Dismiss<span className="sr-only"> notification</span></button></div>
    </div>)}
  </div>;
}
