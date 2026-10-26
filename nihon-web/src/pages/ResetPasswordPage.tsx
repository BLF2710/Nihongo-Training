import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout, { PasswordField, authSubmitClass } from "../components/AuthLayout";
import { resetPassword } from "../api/auth";
import { apiErrorMessage } from "../api/errors";
import { clearSession } from "../lib/authStorage";

const MIN_PASSWORD_LENGTH = 8;

/** Chooses a new password from the link sent by email. */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const token = useSearchParams()[0].get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (password !== confirmPassword) { setError("The passwords don't match."); return; }
    setBusy(true); setError("");
    try {
      await resetPassword(token, password, confirmPassword);
      // Every session of the account has ended, including any in this browser.
      clearSession();
      navigate("/login?reset=1", { replace: true });
    } catch (failure) {
      setError(apiErrorMessage(failure, "Your password couldn't be changed. Please try again."));
      setBusy(false);
    }
  };

  if (!token) return <AuthLayout title="Reset your password" subtitle="This page needs the link from your email." footer={<Link className="font-bold text-emerald-700 hover:underline" to="/login">Back to sign in</Link>}>
    <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">The reset link is incomplete. <Link className="underline" to="/forgot-password">Ask for a new link</Link>.</p>
  </AuthLayout>;

  return <AuthLayout title="Choose a new password" subtitle="You'll be signed out everywhere, then you can sign in with the new password."
    footer={<Link className="font-bold text-emerald-700 hover:underline" to="/forgot-password">Ask for a new link</Link>}>
    <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <PasswordField label="New password" autoComplete="new-password" autoFocus required minLength={MIN_PASSWORD_LENGTH} hint={`At least ${MIN_PASSWORD_LENGTH} characters.`} value={password} onChange={event => setPassword(event.target.value)} />
      <PasswordField label="Confirm new password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
      <button className={authSubmitClass} disabled={busy}>{busy ? "Saving…" : "Set new password"}</button>
    </form>
  </AuthLayout>;
}
