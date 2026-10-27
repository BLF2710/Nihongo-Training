// "Sign in with Google": token verification with a real key pair standing in for Google's, the one-time nonce,
// and username choice. No network or database.
//   npm run test:auth
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");

const { GoogleLibraryVerifier } = require("../src/services/google/google-token-verifier");
const { issueNonce, consumeNonce } = require("../src/services/google/sign-in-nonce");
const { sharedState, useSharedState } = require("../src/shared-state");
const { MemoryNonceStore } = require("../src/shared-state/nonce-store");
const { availableUsername } = require("../src/services/google/google-sign-in.service");

const CLIENT_ID = "123456789-test.apps.googleusercontent.com";
const google = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const stranger = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const KID = "test-key-1";
const keys = { [KID]: google.publicKey.export({ type: "spki", format: "pem" }) };
const now = () => Math.floor(Date.now() / 1000);
const token = (claims = {}, { key = google.privateKey, kid = KID, algorithm = "RS256" } = {}) => jwt.sign({
  iss: "https://accounts.google.com", aud: CLIENT_ID, sub: "10769150350006150715113082367", email: "Kai.Tanaka@gmail.com", email_verified: true,
  name: "Kai Tanaka", nonce: "n-1", iat: now(), exp: now() + 3600, ...claims,
}, key, { algorithm, keyid: kid });
const verifier = new GoogleLibraryVerifier(CLIENT_ID);
const verify = idToken => verifier.verifyWithKeys(idToken, keys);

test("a valid token gives the Google account id, lower-cased email, verified flag, name and nonce", async () => {
  assert.deepEqual(await verify(token()), { subject: "10769150350006150715113082367", email: "kai.tanaka@gmail.com", emailVerified: true, name: "Kai Tanaka", nonce: "n-1" });
});

test("both Google issuer spellings are accepted; any other issuer is refused", async () => {
  assert.ok(await verify(token({ iss: "accounts.google.com" })));
  await assert.rejects(verify(token({ iss: "https://evil.example" })), /issuer/i);
  await assert.rejects(verify(token({ iss: "googleapis.com" })), /issuer/i);
});

test("a token issued for another app is refused", async () => {
  await assert.rejects(verify(token({ aud: "999-other.apps.googleusercontent.com" })), /recipient|audience/i);
});

test("expired tokens and tokens claiming an over-long lifetime are refused", async () => {
  await assert.rejects(verify(token({ iat: now() - 7200, exp: now() - 3600 })), /late|expired/i);
  await assert.rejects(verify(token({ exp: now() + 48 * 3600 })), /expiration|lifetime|too far/i);
});

test("a token signed with another key, or not signed at all, is refused", async () => {
  await assert.rejects(verify(token({}, { key: stranger.privateKey })), /signature|verify/i);
  const unsigned = token().split(".").slice(0, 2).join(".") + ".";
  await assert.rejects(verify(unsigned));
  const [header, payload] = token().split(".");
  const none = Buffer.from(JSON.stringify({ alg: "none", kid: KID })).toString("base64url") + "." + payload + ".";
  await assert.rejects(verify(none));
  const tampered = [header, Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, "base64url")), sub: "someone-else" })).toString("base64url"), token().split(".")[2]].join(".");
  await assert.rejects(verify(tampered), /signature|verify/i);
});

test("a token without an account id or email is refused", async () => {
  await assert.rejects(verify(token({ sub: undefined })), /account id/);
  await assert.rejects(verify(token({ email: undefined })), /email/);
});

test("an unverified Google email is reported as such", async () => {
  assert.equal((await verify(token({ email_verified: false }))).emailVerified, false);
});

test("the verifier refuses to exist without a client id", () => {
  assert.throws(() => new GoogleLibraryVerifier(""), /client id/);
});

// ---- One-time nonce
test("a nonce works once, only if this server issued it, and only for ten minutes", async () => {
  // A clock the test controls, behind the same in-memory store the API uses for a single process.
  let now = Date.now();
  useSharedState({ ...sharedState(), nonces: new MemoryNonceStore(() => now) });
  const nonce = await issueNonce();
  assert.equal(await consumeNonce(nonce), true);
  assert.equal(await consumeNonce(nonce), false, "not twice");
  assert.equal(await consumeNonce("made-up"), false);
  assert.equal(await consumeNonce(null), false);
  const old = await issueNonce();
  now += 11 * 60 * 1000;
  assert.equal(await consumeNonce(old), false, "expired");
  assert.notEqual(await issueNonce(), await issueNonce());
});

// ---- Usernames for new accounts
test("usernames come from the address, cleaned, with a number when taken", async () => {
  assert.equal(await availableUsername("kai.tanaka@gmail.com", async () => false), "kai_tanaka");
  assert.equal(await availableUsername("ab@x.com", async () => false), "learner_ab");
  const taken = new Set(["kai_tanaka"]);
  assert.match(await availableUsername("kai.tanaka@gmail.com", async name => taken.has(name)), /^kai_tanaka\d{4}$/);
  assert.match(await availableUsername("ほげ@example.com", async () => false), /^learner/);
  assert.ok((await availableUsername(`${"a".repeat(80)}@x.com`, async () => false)).length <= 30);
});
