import bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import { config } from "../config/env";
import { withTransaction } from "../db/transaction";
import {
  countRecentAccountTokens, markAccountTokenUsed, replaceAccountToken, takeValidAccountToken,
} from "../repositories/account-token.repository";
import type { AccountTokenPurpose } from "../repositories/account-token.repository";
import {
  findAccountEmail, findPasswordHash, findUserByEmail, markEmailVerified, revokeSessions, updatePasswordAndRevokeSessions,
} from "../repositories/user.repository";
import { HttpError } from "../utils/http-error";
import { mailerFromConfig } from "./mail/mailer";
import type { Mailer } from "./mail/mailer";
import { closeStreams } from "./realtime.service";
import { issueSessionToken } from "./session-token";

// Password reset, email verification, password change and "log out everywhere" (see README → Accounts and security).

const PASSWORD_HASH_ROUNDS = 12;
export const MIN_PASSWORD_LENGTH = 8;
const RESET_LIFETIME_SECONDS = 60 * 60;
const VERIFICATION_LIFETIME_SECONDS = 48 * 60 * 60;
/** Emails of one kind sent to one account per hour, on top of the per-address request limits. */
const EMAILS_PER_ACCOUNT_PER_HOUR = 3;
const HOUR_SECONDS = 60 * 60;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/** A random secret for a link (32 bytes) and the hash that is stored instead of it. */
export function newLinkSecret(): { secret: string; hash: string } {
  const secret = randomBytes(32).toString("base64url");
  return { secret, hash: hashLinkSecret(secret) };
}
export const hashLinkSecret = (secret: string) => createHash("sha256").update(secret, "utf8").digest("hex");

function checkNewPassword(password: unknown, confirmPassword: unknown): string {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH || password !== confirmPassword) {
    throw new HttpError(400, `New passwords must match and contain at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  return password;
}

function linkSecret(value: unknown): string {
  if (typeof value !== "string" || !TOKEN_PATTERN.test(value)) throw new HttpError(400, "This link is invalid. Ask for a new one.");
  return value;
}

export type AccountSecurityDependencies = { mailer: Mailer; appUrl: string };

export function createAccountSecurityService({ mailer, appUrl }: AccountSecurityDependencies) {
  async function createAndSendLink(userId: number, email: string, username: string, purpose: AccountTokenPurpose) {
    const { secret, hash } = newLinkSecret();
    const lifetimeSeconds = purpose === "password_reset" ? RESET_LIFETIME_SECONDS : VERIFICATION_LIFETIME_SECONDS;
    await withTransaction(client => replaceAccountToken(client, { userId, purpose, tokenHash: hash, email, lifetimeSeconds }));
    const mail = purpose === "password_reset"
      ? { subject: "Reset your Lingora password", text: `Hello @${username},\n\nSomeone asked to reset the password of your Lingora account. To choose a new password, open this link within 1 hour:\n\n${appUrl}/reset-password?token=${secret}\n\nIf this wasn't you, ignore this email. Your password stays the same.` }
      : { subject: "Confirm your email for Lingora", text: `Hello @${username},\n\nPlease confirm that this is your email address by opening this link within 48 hours:\n\n${appUrl}/verify-email?token=${secret}\n\nIf you didn't create a Lingora account, ignore this email.` };
    await mailer.send({ to: email, ...mail });
  }

  /**
   * Sends a reset link when the address belongs to an active account. The answer is the same either way, so the
   * form can't be used to find out which addresses have accounts.
   */
  async function requestPasswordReset(email: unknown) {
    const address = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!address || address.length > 254) throw new HttpError(400, "Enter the email address of your account.");
    const user = await findUserByEmail(address);
    if (user && user.status === "active" && await countRecentAccountTokens(user.id, "password_reset", HOUR_SECONDS) < EMAILS_PER_ACCOUNT_PER_HOUR) {
      try { await createAndSendLink(user.id, user.email, user.username, "password_reset"); }
      catch (error) { console.error("Password reset email could not be sent", error); }
    }
    return { message: "If an account uses that address, we've sent it a link to reset the password. The link works for 1 hour." };
  }

  /** Sets a new password from a reset link. Every session ends, and the address counts as verified. */
  async function resetPassword(token: unknown, password: unknown, confirmPassword: unknown) {
    const secret = linkSecret(token);
    const newPassword = checkNewPassword(password, confirmPassword);
    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS);
    const userId = await withTransaction(async client => {
      const link = await takeValidAccountToken(client, hashLinkSecret(secret), "password_reset");
      if (!link) throw new HttpError(400, "This reset link has expired or was already used. Ask for a new one.");
      await markAccountTokenUsed(client, link.id);
      await updatePasswordAndRevokeSessions(client, link.user_id, passwordHash);
      await markEmailVerified(client, link.user_id, link.email);
      return link.user_id;
    });
    closeStreams(userId);
    return { message: "Your password has been changed. Sign in with your new password." };
  }

  async function sendVerificationEmail(userId: number) {
    const account = await findAccountEmail(userId);
    if (!account || account.status !== "active") throw new HttpError(404, "Account not found.");
    if (account.emailVerifiedAt) return { alreadyVerified: true };
    if (await countRecentAccountTokens(userId, "email_verification", HOUR_SECONDS) >= EMAILS_PER_ACCOUNT_PER_HOUR) {
      throw new HttpError(429, "We've sent several emails in the last hour. Check your inbox and spam folder, or try again later.");
    }
    await createAndSendLink(userId, account.email, account.username, "email_verification");
    return { alreadyVerified: false, sentTo: account.email };
  }

  async function verifyEmail(token: unknown) {
    const secret = linkSecret(token);
    return withTransaction(async client => {
      const link = await takeValidAccountToken(client, hashLinkSecret(secret), "email_verification");
      if (!link) throw new HttpError(400, "This confirmation link has expired or was already used. Sign in to send a new one.");
      await markAccountTokenUsed(client, link.id);
      if (!(await markEmailVerified(client, link.user_id, link.email))) throw new HttpError(400, "This link was for an address your account no longer uses.");
      return { verified: true };
    });
  }

  /** Changes the password after checking the current one. Other sessions end; this device gets a new token. */
  async function changePassword(userId: number, input: Record<string, unknown>) {
    const newPassword = checkNewPassword(input.newPassword, input.confirmPassword);
    const hash = await findPasswordHash(userId);
    if (!hash || typeof input.currentPassword !== "string" || !(await bcrypt.compare(input.currentPassword, hash))) throw new HttpError(401, "Current password is incorrect.");
    const tokenVersion = await withTransaction(async client => updatePasswordAndRevokeSessions(client, userId, await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS)));
    closeStreams(userId);
    return { message: "Password updated. You've been signed out on your other devices.", token: issueSessionToken({ id: userId, tokenVersion }) };
  }

  /** Ends every session of the account, including this one. */
  async function logOutEverywhere(userId: number) {
    await withTransaction(client => revokeSessions(client, userId));
    closeStreams(userId);
    return { message: "You've been signed out on every device." };
  }

  return { requestPasswordReset, resetPassword, sendVerificationEmail, verifyEmail, changePassword, logOutEverywhere, mailer };
}

export type AccountSecurityService = ReturnType<typeof createAccountSecurityService>;

let defaultService: AccountSecurityService | null = null;
/** The service for this process, using the configured mailer and web app address. */
export function accountSecurity(): AccountSecurityService {
  return (defaultService ??= createAccountSecurityService({ mailer: mailerFromConfig(config().mail), appUrl: config().appUrl }));
}
