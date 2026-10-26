import { fetchSite } from "../api/site";

// Google Identity Services ("Sign in with Google"), loaded only on the pages that show the button.

export type GoogleCredentialResponse = { credential?: string };
type GoogleAccountsId = {
  initialize(options: { client_id: string; callback: (response: GoogleCredentialResponse) => void; nonce: string; ux_mode: "popup"; auto_select: boolean; context: "signin" | "signup" | "use"; itp_support: boolean }): void;
  renderButton(parent: HTMLElement, options: { type: "standard"; theme: "outline" | "filled_blue"; size: "large"; text: "continue_with" | "signin_with" | "signup_with"; shape: "rectangular" | "pill"; width?: number; logo_alignment: "left" | "center" }): void;
  cancel(): void;
};
declare global { interface Window { google?: { accounts: { id: GoogleAccountsId } } } }

const SCRIPT_URL = "https://accounts.google.com/gsi/client";
let script: Promise<GoogleAccountsId> | null = null;
let clientId: Promise<string | null> | null = null;

/** The public client id from the site settings, or null when Google sign-in isn't set up. */
export function googleClientId(): Promise<string | null> {
  clientId ??= fetchSite().then(site => site.googleClientId ?? null).catch(() => { clientId = null; return null; });
  return clientId;
}

export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  script ??= new Promise<GoogleAccountsId>((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(window.google.accounts.id); return; }
    const element = document.createElement("script");
    element.src = SCRIPT_URL; element.async = true; element.defer = true;
    element.onload = () => window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error("Google sign-in didn't load."));
    element.onerror = () => { script = null; reject(new Error("Google sign-in couldn't be loaded. Check your connection or content blockers.")); };
    document.head.appendChild(element);
  });
  return script;
}
