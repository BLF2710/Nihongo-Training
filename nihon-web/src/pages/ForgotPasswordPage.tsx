import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthLayout, { AuthField, authSubmitClass } from "../components/AuthLayout";
import { requestPasswordReset } from "../api/auth";
import { apiErrorMessage } from "../api/errors";

/** Asks for a reset link by email. The answer never says whether the address has an account. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try { setSent((await requestPasswordReset(email.trim())).message); }
    catch (failure) { setError(apiErrorMessage(failure, "Your request couldn't be sent. Check your connection and try again.")); }
    finally { setBusy(false); }
  };

  return <AuthLayout title="Reset your password" subtitle="Enter the email address of your account and we'll send you a link to choose a new password."
    footer={<>Remembered it? <Link className="font-bold text-emerald-700 hover:underline" to="/login">Sign in</Link></>}>
    {sent ? <div role="status" className="space-y-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
      <p className="font-semibold">{sent}</p>
      <p>Check your inbox and spam folder. Didn't get it? Wait a few minutes, then <button type="button" className="font-bold underline" onClick={() => setSent("")}>try again</button>.</p>
    </div> : <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <AuthField label="Email address" type="email" autoComplete="email" autoFocus required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
      <button className={authSubmitClass} disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
    </form>}
  </AuthLayout>;
}
