import { useState } from "react";

/**
 * Invite friends with a link or QR code that opens "Add @username". The link only carries the (unique, not secret)
 * username; the friend still sends the request themselves, under the usual rules.
 */
export default function InviteCard({ username }: { username: string }) {
  const link = `${window.location.origin}/add/${encodeURIComponent(username)}`;
  const [notice, setNotice] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const say = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(current => current === text ? "" : current), 2500); };

  const copy = () => void navigator.clipboard?.writeText(link).then(() => say("Invite link copied.")).catch(() => say("Copy the link above by hand."));
  const share = () => void navigator.share?.({ title: "Add me on Lingora", text: `Add me as a friend on Lingora (@${username})`, url: link }).catch(() => { /* closed by the learner */ });
  const toggleQr = async () => {
    if (showQr) { setShowQr(false); return; }
    setShowQr(true);
    if (qr) return;
    try {
      // Loaded only when asked for, so the Friends page stays small.
      const { toDataURL } = await import("qrcode");
      setQr(await toDataURL(link, { width: 240, margin: 2, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } }));
    } catch { say("Could not make the QR code. Share the link instead."); setShowQr(false); }
  };

  return <section aria-labelledby="invite-heading" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
    <h2 id="invite-heading" className="font-bold">Invite friends</h2>
    <p className="text-sm text-gray-600">Send this link or show the QR code. It opens your profile with an Add friend button.</p>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <input readOnly value={link} aria-label="Your invite link" onFocus={event => event.target.select()} className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">Copy link</button>
        {typeof navigator.share === "function" && <button type="button" onClick={share} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:border-emerald-500">Share…</button>}
        <button type="button" onClick={() => void toggleQr()} aria-expanded={showQr} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:border-emerald-500">{showQr ? "Hide QR code" : "Show QR code"}</button>
      </div>
    </div>
    <p role="status" className="mt-2 min-h-5 text-sm text-emerald-700">{notice}</p>
    {showQr && <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row sm:items-end">
      {qr ? <img src={qr} width={240} height={240} alt={`QR code that opens the invite link for @${username}`} className="rounded-xl border border-gray-200 bg-white" /> : <p role="status" className="text-sm text-gray-600">Making the QR code…</p>}
      {qr && <a href={qr} download={`lingora-invite-${username}.png`} className="text-sm font-bold text-emerald-700 hover:underline">Download QR code</a>}
    </div>}
  </section>;
}
