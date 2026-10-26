import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { AuthField, PasswordField, authSubmitClass } from "../components/AuthLayout";
import { login as signIn } from "../api/auth";
import { apiErrorMessage } from "../api/errors";
import { saveSession } from "../lib/authStorage";
import { safeReturnPath } from "../lib/returnTo";

export default function LoginPage() {
  const navigate = useNavigate();
  // Set by the registration page after an account has just been created.
  const location = useLocation();
  const justRegistered = (location.state as { registered?: boolean } | null)?.registered === true;
  // Where to go after signing in (learners only); see lib/returnTo.ts.
  const next = safeReturnPath(new URLSearchParams(location.search).get("next"));
  const inviter = next?.match(/^\/add\/([A-Za-z0-9_]{3,30})$/)?.[1];
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError("");
    try {
      const { token, user } = await signIn(login, password);
      const userRole = user?.role || "learner";
      saveSession({ token, userName: user?.username || login, userEmail: user?.email || "", userRole, userHandle: user?.username });
      navigate(userRole === "admin" ? "/admin" : next ?? "/");
    } catch (failure: unknown) {
      setError(apiErrorMessage(failure, "Sign-in failed. Check your connection and try again."));
      setLoading(false);
    }
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to pick up where you left off."
    footer={<>New here? <Link className="font-bold text-emerald-700 hover:underline" to={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}>Create an account</Link></>}>
    <form onSubmit={handleLogin} className="space-y-5">
      {inviter && <p role="status" className="rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-900">@{inviter} invited you to be friends. Sign in or create an account to add them.</p>}
      {justRegistered && !error && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Your account is ready. Sign in to start learning.</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <AuthField label="Email or username" autoComplete="username" autoFocus required value={login} onChange={event => setLogin(event.target.value)} />
      <PasswordField label="Password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
      <button className={authSubmitClass} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    </form>
  </AuthLayout>;
}
