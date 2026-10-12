import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { AuthField, PasswordField, authSubmitClass } from "../components/AuthLayout";
import { register } from "../api/auth";
import { apiErrorMessage } from "../api/errors";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      await register({ username, displayName, email, password, confirmPassword });
      navigate("/login", { state: { registered: true } });
    } catch (failure: unknown) {
      setError(apiErrorMessage(failure, "Registration failed. Check your connection and try again."));
      setLoading(false);
    }
  };

  return <AuthLayout title="Create your account" subtitle="Free, and it takes less than a minute."
    footer={<>Already have an account? <Link className="font-bold text-emerald-700 hover:underline" to="/login">Sign in</Link></>}>
    <form onSubmit={handleRegister} className="space-y-5">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField label="Username" autoComplete="username" autoFocus required pattern="[A-Za-z0-9_]{3,30}" title="3–30 letters, numbers, or underscores" hint="3–30 letters, numbers, or _" value={username} onChange={event => setUsername(event.target.value)} />
        <AuthField label="Display name" autoComplete="name" maxLength={80} hint="Optional — shown on your profile" value={displayName} onChange={event => setDisplayName(event.target.value)} />
      </div>
      <AuthField label="Email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
      <PasswordField label="Password" autoComplete="new-password" required minLength={8} hint="At least 8 characters" value={password} onChange={event => setPassword(event.target.value)} />
      <PasswordField label="Confirm password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
      <button className={authSubmitClass} disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
    </form>
  </AuthLayout>;
}
