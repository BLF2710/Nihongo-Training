import { OAuth2Client } from "google-auth-library";

// Checks Google ID tokens ("Sign in with Google") behind our own interface, so tests can swap in a fake.

export type GoogleIdentity = { subject: string; email: string; emailVerified: boolean; name: string | null; nonce: string | null };

export interface GoogleTokenVerifier {
  /** Throws when the token isn't a valid, current Google ID token issued for this app. */
  verify(idToken: string): Promise<GoogleIdentity>;
}

/** Google's sign-in issuers; the library would also accept another Google domain unless told otherwise. */
export const GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];
/** Google ID tokens live for an hour; anything claiming longer is refused. */
const MAX_TOKEN_LIFETIME_SECONDS = 60 * 60;

export class GoogleIdTokenVerificationError extends Error {
  constructor(message: string) { super(message); this.name = "GoogleIdTokenVerificationError"; }
}

function toIdentity(payload: Record<string, unknown> | undefined): GoogleIdentity {
  if (!payload || typeof payload.sub !== "string" || !payload.sub) throw new GoogleIdTokenVerificationError("The Google token has no account id.");
  if (typeof payload.email !== "string" || !payload.email) throw new GoogleIdTokenVerificationError("The Google token has no email address.");
  return {
    subject: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : null,
    nonce: typeof payload.nonce === "string" ? payload.nonce : null,
  };
}

/**
 * Uses Google's official library: the signature is checked against Google's current public keys, and the
 * audience (this app's client id), issuer and expiry are enforced.
 */
export class GoogleLibraryVerifier implements GoogleTokenVerifier {
  private readonly client: OAuth2Client;
  constructor(private readonly clientId: string, client?: OAuth2Client) {
    if (!clientId) throw new Error("A Google client id is required.");
    this.client = client ?? new OAuth2Client({ clientId, issuers: GOOGLE_ISSUERS });
  }

  async verify(idToken: string): Promise<GoogleIdentity> {
    try {
      const ticket = await this.client.verifyIdToken({ idToken, audience: this.clientId, maxExpiry: MAX_TOKEN_LIFETIME_SECONDS });
      return toIdentity(ticket.getPayload() as Record<string, unknown> | undefined);
    } catch (error) {
      if (error instanceof GoogleIdTokenVerificationError) throw error;
      throw new GoogleIdTokenVerificationError(error instanceof Error ? error.message : "Invalid Google token.");
    }
  }

  /** The same checks against given public keys instead of Google's (used by tests with their own key). */
  async verifyWithKeys(idToken: string, keys: Parameters<OAuth2Client["verifySignedJwtWithCertsAsync"]>[1]): Promise<GoogleIdentity> {
    try {
      const ticket = await this.client.verifySignedJwtWithCertsAsync(idToken, keys, this.clientId, GOOGLE_ISSUERS, MAX_TOKEN_LIFETIME_SECONDS);
      return toIdentity(ticket.getPayload() as Record<string, unknown> | undefined);
    } catch (error) {
      if (error instanceof GoogleIdTokenVerificationError) throw error;
      throw new GoogleIdTokenVerificationError(error instanceof Error ? error.message : "Invalid Google token.");
    }
  }
}
