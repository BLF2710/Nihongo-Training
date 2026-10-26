import { useState } from "react";
import { resendVerificationEmail } from "../api/auth";
import { apiErrorMessage } from "../api/errors";

export type Notice = { text: string; tone: "ok" | "error" } | null;

/** Sends a new confirmation link; shared by the settings section and the dashboard banner. */
export function useResendVerification() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const resend = async () => {
    setBusy(true); setNotice(null);
    try {
      const result = await resendVerificationEmail();
      setNotice(result.alreadyVerified ? { text: "Your email is already confirmed.", tone: "ok" } : { text: `We've sent a confirmation link to ${result.sentTo}. It works for 48 hours.`, tone: "ok" });
    } catch (failure) { setNotice({ text: apiErrorMessage(failure, "The email couldn't be sent. Please try again."), tone: "error" }); }
    finally { setBusy(false); }
  };
  return { busy, notice, resend };
}

