import { useEffect, useRef, useState } from "react";
import { fetchGoogleNonce } from "../api/auth";
import { loadGoogleIdentity } from "../lib/googleIdentity";

const BUTTON_WIDTH = 320;

/**
 * Google's own "Sign in with Google" button. Before each attempt it gets a fresh one-time nonce from the API, which
 * Google puts inside the token; the API accepts that token once. `onCredential` sends the token to the API.
 */
export default function GoogleSignInButton({ clientId, context, text, onCredential }: {
  clientId: string;
  context: "signin" | "signup" | "use";
  text: "continue_with" | "signin_with" | "signup_with";
  onCredential: (credential: string) => Promise<void>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  // Each finished attempt spends the nonce; counting attempts sets the button up again with a new one.
  const [attempt, setAttempt] = useState(0);
  const handler = useRef(onCredential);
  useEffect(() => { handler.current = onCredential; });

  useEffect(() => {
    let active = true;
    Promise.all([loadGoogleIdentity(), fetchGoogleNonce()]).then(([google, nonce]) => {
      if (!active || !container.current) return;
      google.initialize({
        client_id: clientId, nonce, ux_mode: "popup", auto_select: false, context, itp_support: true,
        callback: response => {
          if (!response.credential) return;
          void handler.current(response.credential).finally(() => setAttempt(value => value + 1));
        },
      });
      container.current.replaceChildren();
      google.renderButton(container.current, { type: "standard", theme: "outline", size: "large", text, shape: "rectangular", width: BUTTON_WIDTH, logo_alignment: "left" });
      setError("");
    }).catch(failure => {
      if (active) setError(failure instanceof Error && failure.message.startsWith("Google") ? failure.message : "Google sign-in is unavailable right now.");
    });
    return () => { active = false; };
  }, [clientId, context, text, attempt]);

  return <div>
    <div ref={container} className="flex min-h-11 justify-center" />
    {error && <p role="alert" className="mt-2 text-center text-sm text-red-700">{error}</p>}
  </div>;
}
