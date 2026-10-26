import { useState } from "react";
import { useResendVerification } from "../lib/useResendVerification";

const DISMISS_KEY = "email-verification-banner:dismissed";
const readDismissed = () => { try { return sessionStorage.getItem(DISMISS_KEY) === "yes"; } catch { return false; } };

/** A reminder to confirm the email address; can be hidden for the rest of this browser session. */
export default function EmailVerificationBanner({ email }: { email: string }) {
  const [hidden, setHidden] = useState(readDismissed);
  const { busy, notice, resend } = useResendVerification();
  if (hidden) return null;
  const hide = () => { try { sessionStorage.setItem(DISMISS_KEY, "yes"); } catch { /* shown again next time */ } setHidden(true); };
  return <section aria-label="Confirm your email" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
    <p><b>Confirm your email</b> so you can reset your password if you ever forget it. We sent a link to <span className="break-all font-semibold">{email}</span>.</p>
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <button type="button" disabled={busy} onClick={() => void resend()} className="rounded-lg bg-white px-3 py-1.5 font-bold text-amber-950 ring-1 ring-amber-300 hover:bg-amber-100 disabled:opacity-50">{busy ? "Sending…" : "Send a new link"}</button>
      <button type="button" onClick={hide} className="font-semibold underline">Remind me later</button>
    </div>
    {notice && <p role={notice.tone === "error" ? "alert" : "status"} className="mt-2 font-semibold">{notice.text}</p>}
  </section>;
}
