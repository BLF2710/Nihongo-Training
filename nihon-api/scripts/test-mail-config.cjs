// Email settings: which mailer is used, what is required, and what is logged. No network.
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig } = require("../src/config/env");
const { describeMailSetup } = require("../src/services/mail/mailer");

const BASE = { JWT_SECRET: "test-secret-that-is-long-enough-for-the-checks-0123456789" };
const SMTP = "smtps://someone%40gmail.com:app-password@smtp.gmail.com:465";

test("without SMTP_URL, development prints emails to the console", () => {
  assert.equal(loadConfig(BASE).mail.provider, "log");
});

test("SMTP_URL with MAIL_FROM sends through SMTP", () => {
  const mail = loadConfig({ ...BASE, SMTP_URL: SMTP, MAIL_FROM: "Lingora <someone@gmail.com>" }).mail;
  assert.deepEqual([mail.provider, mail.from], ["smtp", "Lingora <someone@gmail.com>"]);
});

test("SMTP_URL without MAIL_FROM is refused at start, not at the first email", () => {
  assert.throws(() => loadConfig({ ...BASE, SMTP_URL: SMTP }), /needs MAIL_FROM/);
});

test("production refuses to start without real email", () => {
  assert.throws(() => loadConfig({ ...BASE, NODE_ENV: "production", CORS_ORIGINS: "https://example.com" }), /Production needs real email/);
});

test("the log names the mail server and sender, never the password", () => {
  const text = describeMailSetup(loadConfig({ ...BASE, SMTP_URL: SMTP, MAIL_FROM: "Lingora <someone@gmail.com>" }).mail);
  assert.equal(text, "sent through smtp.gmail.com as Lingora <someone@gmail.com>");
  assert.doesNotMatch(text, /app-password/);
});
