import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleSignInButton from "./GoogleSignInButton";
import { signInWithGoogle } from "../api/auth";
import { apiErrorMessage } from "../api/errors";
import { saveSession } from "../lib/authStorage";
import { googleClientId } from "../lib/googleIdentity";

/** "or Continue with Google" under the sign-in and registration forms; hidden when the site has no Google client id. */
export default function GoogleSignInSection({ next, context }: { next: string | null; context: "signin" | "signup" }) {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; void googleClientId().then(id => { if (active) setClientId(id); }); return () => { active = false; }; }, []);
  if (!clientId) return null;

  const signIn = async (credential: string) => {
    setBusy(true); setError("");
    try {
      const { token, user } = await signInWithGoogle(credential);
      const role = user?.role || "learner";
      saveSession({ token, userName: user?.username ?? "", userEmail: user?.email ?? "", userRole: role, userHandle: user?.username });
      navigate(role === "admin" ? "/admin" : next ?? "/");
    } catch (failure) {
      setError(apiErrorMessage(failure, "Google sign-in failed. Please try again."));
    } finally { setBusy(false); }
  };

  return <div className="mt-6">
    <div className="flex items-center gap-3 text-sm text-gray-500" aria-hidden="true"><span className="h-px flex-1 bg-gray-200" />or<span className="h-px flex-1 bg-gray-200" /></div>
    <div className="mt-4" aria-busy={busy}><GoogleSignInButton clientId={clientId} context={context} text="continue_with" onCredential={signIn} /></div>
    {busy && <p role="status" className="mt-2 text-center text-sm text-gray-600">Signing you in…</p>}
    {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    <p className="mt-3 text-center text-xs text-gray-500">Google shares your name and email address with Lingora. We never see your Google password.</p>
  </div>;
}
