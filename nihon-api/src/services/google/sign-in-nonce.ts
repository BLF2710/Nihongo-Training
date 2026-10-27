import { randomBytes } from "node:crypto";
import { sharedState } from "../../shared-state";

// One-time numbers for "Sign in with Google". The page asks for one, Google puts it inside the ID token, and the
// server accepts each one once within ten minutes, so a captured token can't be replayed. They live in the shared
// state, so a nonce issued by one API process can be used on another (SHARED_STATE=postgres).

const NONCE_LIFETIME_MS = 10 * 60 * 1000;

export async function issueNonce(): Promise<string> {
  const nonce = randomBytes(24).toString("base64url");
  await sharedState().nonces.save(nonce, NONCE_LIFETIME_MS);
  return nonce;
}

/** True once for a nonce this API issued and that hasn't expired; it can't be used again. */
export async function consumeNonce(nonce: string | null): Promise<boolean> {
  if (!nonce) return false;
  return sharedState().nonces.use(nonce);
}
