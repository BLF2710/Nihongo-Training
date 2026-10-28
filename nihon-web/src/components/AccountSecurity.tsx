import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleSignInButton from "./GoogleSignInButton";
import { changePassword, connectGoogle, disconnectGoogle, logOutEverywhere } from "../api/auth";
import type { Profile } from "../api/profile";
import { googleClientId } from "../lib/googleIdentity";
import { apiErrorMessage } from "../api/errors";
import { clearSession, saveToken } from "../lib/authStorage";
import { useResendVerification } from "../lib/useResendVerification";
import type { Notice } from "../lib/useResendVerification";

const MIN_PASSWORD_LENGTH = 8;
const button = "rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-emerald-500 disabled:opacity-50";
const input = "mt-1 w-full rounded-lg border border-gray-300 bg-white p-2";

const NoticeLine = ({ notice }: { notice: Notice }) => notice && <p role={notice.tone === "error" ? "alert" : "status"} className={`rounded-lg p-2 text-sm ${notice.tone === "error" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{notice.text}</p>;

type SignInMethods = NonNullable<Profile["sign_in"]>;

/** Connect or disconnect Google. Disconnecting is refused when it's the account's only way to sign in. */
function GoogleConnection({ methods, onChanged }: { methods: SignInMethods; onChanged: () => void }) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; void googleClientId().then(id => { if (active) setClientId(id); }); return () => { active = false; }; }, []);
  if (!methods.google && !clientId) return null;

  const connect = async (credential: string) => {
    setNotice(null);
    try { const { email } = await connectGoogle(credential); setNotice({ text: `Connected ${email}. You can now sign in with Google.`, tone: "ok" }); onChanged(); }
    catch (failure) { setNotice({ text: apiErrorMessage(failure, "Your Google account couldn't be connected."), tone: "error" }); }
  };
  const disconnect = async () => {
    setBusy(true); setNotice(null);
    try { await disconnectGoogle(); setNotice({ text: "Google disconnected. Sign in with your password from now on.", tone: "ok" }); onChanged(); }
    catch (failure) { setNotice({ text: apiErrorMessage(failure, "Your Google account couldn't be disconnected."), tone: "error" }); }
    finally { setBusy(false); }
  };

  return <div className="grid gap-2 border-t border-gray-100 pt-5">
    <h3 className="font-bold">Google</h3>
    {methods.google ? <>
      <p className="text-sm text-gray-700">Connected: <span className="break-all font-semibold">{methods.google.email}</span></p>
      {methods.password
        ? <button type="button" className={`${button} justify-self-start`} disabled={busy} onClick={() => void disconnect()}>{busy ? "Disconnecting…" : "Disconnect Google"}</button>
        : <p className="text-sm text-gray-600">Google is your only way to sign in, so it can't be disconnected. Add a password first.</p>}
    </> : <>
      <p className="text-sm text-gray-600">Connect your Google account to sign in with it. It can use a different address from your Lingora email.</p>
      {clientId && <div className="justify-self-start"><GoogleSignInButton clientId={clientId} context="use" text="continue_with" onCredential={connect} /></div>}
    </>}
    <NoticeLine notice={notice} />
  </div>;
}

/** Email confirmation, sign-in methods, password change and "log out everywhere" in profile settings. */
export default function AccountSecurity({ email, verified, methods = { password: true, google: null }, onChanged = () => undefined }: { email: string; verified: boolean; methods?: SignInMethods; onChanged?: () => void }) {
  const navigate = useNavigate();
  const verification = useResendVerification();
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { setPasswordNotice({ text: "The new passwords don't match.", tone: "error" }); return; }
    setSaving(true); setPasswordNotice(null);
    try {
      const result = await changePassword(passwords.currentPassword, passwords.newPassword, passwords.confirmPassword);
      saveToken(result.token);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordNotice({ text: result.message, tone: "ok" });
    } catch (failure) { setPasswordNotice({ text: apiErrorMessage(failure, "Your password couldn't be changed."), tone: "error" }); }
    finally { setSaving(false); }
  };

  const signOutEverywhere = async () => {
    setLogoutError("");
    try { await logOutEverywhere(); clearSession(); navigate("/login?signedOut=all", { replace: true }); }
    catch (failure) { setLogoutError(apiErrorMessage(failure, "Couldn't sign you out everywhere. Please try again.")); }
  };
  const field = (key: keyof typeof passwords, label: string, autoComplete: string) => <label className="block text-sm font-semibold">{label}
    <input type="password" required minLength={key === "currentPassword" ? undefined : MIN_PASSWORD_LENGTH} autoComplete={autoComplete} className={input} value={passwords[key]} onChange={event => setPasswords({ ...passwords, [key]: event.target.value })} />
  </label>;

  return <section aria-labelledby="security-heading" className="grid gap-5 rounded-2xl border bg-white p-6">
    <h2 id="security-heading" className="text-2xl font-black">Account security</h2>
    <div className="grid gap-2">
      <h3 className="font-bold">Email</h3>
      <p className="text-sm text-gray-700"><span className="break-all">{email}</span> · {verified ? <span className="font-semibold text-emerald-700">✓ Confirmed</span> : <span className="font-semibold text-amber-800">Not confirmed yet</span>}</p>
      {!verified && <div className="flex flex-wrap items-center gap-3"><p className="text-sm text-gray-600">Confirming your email lets you reset your password if you forget it.</p><button type="button" className={button} disabled={verification.busy} onClick={() => void verification.resend()}>{verification.busy ? "Sending…" : "Send confirmation link"}</button></div>}
      <NoticeLine notice={verification.notice} />
    </div>
    <GoogleConnection methods={methods} onChanged={onChanged} />
    {!methods.password ? <div className="grid gap-2 border-t border-gray-100 pt-5">
      <h3 className="font-bold">Password</h3>
      <p className="text-sm text-gray-600">You sign in with Google and have no password yet. To add one, we'll email you a link: use <Link to="/forgot-password" className="font-semibold text-emerald-700 hover:underline">Set a password</Link> with <span className="break-all">{email}</span>.</p>
    </div> : <form onSubmit={savePassword} className="grid gap-3 border-t border-gray-100 pt-5" aria-labelledby="password-heading">
      <h3 id="password-heading" className="font-bold">Change password</h3>
      {field("currentPassword", "Current password", "current-password")}
      {field("newPassword", `New password (at least ${MIN_PASSWORD_LENGTH} characters)`, "new-password")}
      {field("confirmPassword", "Confirm new password", "new-password")}
      <p className="text-sm text-gray-600">You'll stay signed in here and be signed out on your other devices.</p>
      <NoticeLine notice={passwordNotice} />
      <button className="justify-self-start rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50" disabled={saving}>{saving ? "Saving…" : "Change password"}</button>
    </form>}
    <div className="grid gap-2 border-t border-gray-100 pt-5">
      <h3 className="font-bold">Sign out everywhere</h3>
      <p className="text-sm text-gray-600">Lost a device or signed in on a shared computer? This signs you out on every device, including this one.</p>
      {confirmLogout ? <div className="flex flex-wrap items-center gap-3"><span className="text-sm font-semibold">Sign out on every device?</span><button type="button" className={`${button} text-red-700`} onClick={() => void signOutEverywhere()}>Sign out everywhere</button><button type="button" className={button} onClick={() => setConfirmLogout(false)}>Cancel</button></div>
        : <button type="button" className={`${button} justify-self-start`} onClick={() => setConfirmLogout(true)}>Sign out on all devices…</button>}
      {logoutError && <p role="alert" className="text-sm text-red-700">{logoutError}</p>}
    </div>
  </section>;
}
