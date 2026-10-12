import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { AuthField, PasswordField, authSubmitClass } from "../components/AuthLayout";
import { login as signIn } from "../api/auth";
import { apiErrorMessage } from "../api/errors";
import { saveSession } from "../lib/authStorage";

export default function LoginPage() {
  const navigate = useNavigate();
  // Set by the registration page after an account has just been created.
  const justRegistered = (useLocation().state as { registered?: boolean } | null)?.registered === true;
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
      saveSession({ token, userName: user?.username || login, userEmail: user?.email || "", userRole });
      navigate(userRole === "admin" ? "/admin" : "/");
    } catch (failure: unknown) {
      setError(apiErrorMessage(failure, "Sign-in failed. Check your connection and try again."));
      setLoading(false);
    }
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to pick up where you left off."
    footer={<>New here? <Link className="font-bold text-emerald-700 hover:underline" to="/register">Create an account</Link></>}>
    <form onSubmit={handleLogin} className="space-y-5">
      {justRegistered && !error && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Your account is ready. Sign in to start learning.</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <AuthField label="Email or username" autoComplete="username" autoFocus required value={login} onChange={event => setLogin(event.target.value)} />
      <PasswordField label="Password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
      <button className={authSubmitClass} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    </form>
  </AuthLayout>;
}
