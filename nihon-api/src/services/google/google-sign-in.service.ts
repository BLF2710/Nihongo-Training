import { config } from "../../config/env";
import { withTransaction } from "../../db/transaction";
import {
  createProviderAccount, findAccountByEmail, findAccountByIdentity, findIdentityOfUser, linkIdentity, touchIdentity, unlinkIdentity, usernameTaken,
} from "../../repositories/identity.repository";
import type { LinkedAccount } from "../../repositories/identity.repository";
import { isRegistrationClosed } from "../../repositories/site.repository";
import { findPasswordHash, recordLogin } from "../../repositories/user.repository";
import { HttpError } from "../../utils/http-error";
import { issueSessionToken } from "../session-token";
import { GoogleLibraryVerifier } from "./google-token-verifier";
import type { GoogleIdentity, GoogleTokenVerifier } from "./google-token-verifier";
import { consumeNonce, issueNonce } from "./sign-in-nonce";

// "Sign in with Google" (README → Accounts and security). The rules that keep it safe:
// - Google's ID token is verified (signature, this app as audience, issuer, expiry) and must carry a one-time
//   nonce from this server, so a captured token can't be replayed.
// - Accounts are matched by Google's permanent account id, never by email address.
// - An existing account with the same email is linked automatically only when Google confirmed the address and
//   the account's own address was confirmed too, and never for administrators; otherwise the learner signs in with
//   their password and connects Google from settings.

const MAX_CREDENTIAL_LENGTH = 4096;
const JWT_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const USERNAME_MAX = 30;
const USERNAME_ATTEMPTS = 20;

export type GoogleSignInResult = { token: string; user: { id: number; username: string; email: string; role: string }; created: boolean };

const NOT_CONFIGURED = new HttpError(404, "Sign in with Google isn't set up on this site.");
const NOT_VERIFIED = new HttpError(401, "Google sign-in couldn't be verified. Please try again.");

/** A unique username from the Google address, e.g. "kai.tanaka@gmail.com" → "kai_tanaka" (then "kai_tanaka2", …). */
export async function availableUsername(email: string, isTaken: (name: string) => Promise<boolean>, random = Math.random): Promise<string> {
  let base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, USERNAME_MAX - 4);
  if (base.length < 3) base = `learner_${base}`.replace(/_+$/, "");
  if (!(await isTaken(base))) return base;
  for (let attempt = 0; attempt < USERNAME_ATTEMPTS; attempt++) {
    const candidate = `${base}${Math.floor(random() * 9000) + 1000}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  throw new HttpError(503, "A username couldn't be chosen. Please try again.");
}

export function createGoogleSignInService(verifier: GoogleTokenVerifier | null) {
  function requireVerifier(): GoogleTokenVerifier {
    if (!verifier) throw NOT_CONFIGURED;
    return verifier;
  }

  /** Verifies the token and its nonce; returns the Google identity. */
  async function identityFrom(credential: unknown): Promise<GoogleIdentity> {
    const check = requireVerifier();
    if (typeof credential !== "string" || credential.length > MAX_CREDENTIAL_LENGTH || !JWT_SHAPE.test(credential)) throw NOT_VERIFIED;
    let identity: GoogleIdentity;
    try { identity = await check.verify(credential); }
    catch { throw NOT_VERIFIED; }
    if (!(await consumeNonce(identity.nonce))) throw new HttpError(401, "This Google sign-in has expired. Please try again.");
    if (!identity.emailVerified) throw new HttpError(403, "Your Google account's email address isn't verified by Google. Verify it with Google, or sign in with a password.");
    return identity;
  }

  async function startSession(account: LinkedAccount, created: boolean): Promise<GoogleSignInResult> {
    if (account.status !== "active") throw new HttpError(403, "This account is inactive");
    await recordLogin(account.userId);
    return { token: issueSessionToken({ id: account.userId, tokenVersion: account.tokenVersion }), user: { id: account.userId, username: account.username, email: account.email, role: account.role }, created };
  }

  async function nonce() {
    requireVerifier();
    return { nonce: await issueNonce() };
  }

  /** Signs in (or up) with a Google ID token. */
  async function signIn(credential: unknown): Promise<GoogleSignInResult> {
    const identity = await identityFrom(credential);
    const linked = await findAccountByIdentity("google", identity.subject);
    if (linked) {
      await touchIdentity("google", identity.subject, identity.email);
      return startSession(linked, false);
    }
    const sameEmail = await findAccountByEmail(identity.email);
    if (sameEmail) {
      if (sameEmail.role !== "learner" || !sameEmail.emailVerified) {
        throw new HttpError(409, "An account already uses this email address. Sign in with your password, then connect Google in Profile → Settings → Account security.", { code: "link_required" });
      }
      if (sameEmail.status !== "active") throw new HttpError(403, "This account is inactive");
      await withTransaction(client => linkIdentity(client, { userId: sameEmail.userId, provider: "google", subject: identity.subject, email: identity.email }));
      return startSession(sameEmail, false);
    }
    if (await isRegistrationClosed()) throw new HttpError(403, "New account registration is currently closed.");
    const username = await availableUsername(identity.email, usernameTaken);
    const displayName = (identity.name ?? username).slice(0, 80);
    const userId = await withTransaction(async client => {
      const id = await createProviderAccount(client, { username, email: identity.email, displayName });
      await linkIdentity(client, { userId: id, provider: "google", subject: identity.subject, email: identity.email });
      return id;
    });
    return startSession({ userId, role: "learner", status: "active", tokenVersion: 0, username, email: identity.email }, true);
  }

  /** Connects a Google account to the signed-in account (any email address). */
  async function link(userId: number, credential: unknown) {
    const identity = await identityFrom(credential);
    const owner = await findAccountByIdentity("google", identity.subject);
    if (owner && owner.userId !== userId) throw new HttpError(409, "That Google account is already connected to another LingoHub account.");
    if (owner) return { email: identity.email };
    if (await findIdentityOfUser(userId, "google")) throw new HttpError(409, "A Google account is already connected. Disconnect it first.");
    await withTransaction(client => linkIdentity(client, { userId, provider: "google", subject: identity.subject, email: identity.email }));
    return { email: identity.email };
  }

  /** Disconnects Google; refused when it's the account's only way to sign in. */
  async function unlink(userId: number) {
    if (!(await findPasswordHash(userId))) throw new HttpError(400, "Set a password first (Sign in → Forgot password), so you can still sign in without Google.");
    if (!(await unlinkIdentity(userId, "google"))) throw new HttpError(404, "No Google account is connected.");
    return { disconnected: true };
  }

  return { nonce, signIn, link, unlink, configured: verifier !== null };
}

export type GoogleSignInService = ReturnType<typeof createGoogleSignInService>;

let defaultService: GoogleSignInService | null = null;
/** The service for this process: Google when GOOGLE_CLIENT_ID is set, otherwise switched off. */
export function googleSignIn(): GoogleSignInService {
  const clientId = config().googleClientId;
  return (defaultService ??= createGoogleSignInService(clientId ? new GoogleLibraryVerifier(clientId) : null));
}
