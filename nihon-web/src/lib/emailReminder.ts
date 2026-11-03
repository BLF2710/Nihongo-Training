import { useState } from "react";

const DISMISS_KEY = "email-verification-banner:dismissed";
const readDismissed = () => { try { return sessionStorage.getItem(DISMISS_KEY) === "yes"; } catch { return false; } };

/** Whether the confirm-your-email reminder was put off for this browser session; shared by the banner and the map's pigeon. */
export function useEmailReminder() {
  const [isDismissed, setIsDismissed] = useState(readDismissed);
  const dismiss = () => { try { sessionStorage.setItem(DISMISS_KEY, "yes"); } catch { /* shown again next time */ } setIsDismissed(true); };
  return { isDismissed, dismiss };
}
