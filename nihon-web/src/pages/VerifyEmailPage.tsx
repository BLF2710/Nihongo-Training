import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { verifyEmail } from "../api/auth";
import { apiErrorMessage } from "../api/errors";
import { hasSession } from "../lib/authStorage";

type State = { name: "checking" } | { name: "verified" } | { name: "failed"; message: string };

/** Opens from the confirmation link sent by email; works whether or not the learner is signed in. */
export default function VerifyEmailPage() {
  const token = useSearchParams()[0].get("token") ?? "";
  const [state, setState] = useState<State>(token ? { name: "checking" } : { name: "failed", message: "The confirmation link is incomplete." });
  const started = useRef(false);
  useEffect(() => {
    // A link can be used once, so it is sent once even if the page renders twice.
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token)
      .then(() => setState({ name: "verified" }))
      .catch(failure => setState({ name: "failed", message: apiErrorMessage(failure, "Your email couldn't be confirmed. Please try again.") }));
  }, [token]);

  const next = hasSession() ? <Link className="font-bold text-emerald-700 hover:underline" to="/">Go to your dashboard</Link> : <Link className="font-bold text-emerald-700 hover:underline" to="/login">Sign in</Link>;
  return <AuthLayout title="Confirm your email" subtitle="This keeps your account recoverable if you forget your password." footer={next}>
    {state.name === "checking" && <p role="status">Confirming your email…</p>}
    {state.name === "verified" && <p role="status" className="rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-900">✓ Your email is confirmed. Thank you!</p>}
    {state.name === "failed" && <div role="alert" className="space-y-2 rounded-xl bg-red-50 p-4 text-sm text-red-800"><p className="font-semibold">{state.message}</p><p>Signed in? You can send a new link from Profile → Settings → Account security.</p></div>}
  </AuthLayout>;
}
