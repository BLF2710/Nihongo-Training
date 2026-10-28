import process from "node:process";
import dotenv from "dotenv";
import { config } from "../config/env";
import { checkMailConnection, describeMailSetup, mailerFromConfig } from "../services/mail/mailer";

dotenv.config({ quiet: true });

// Sends one email with the current settings, to check them:  npm run mail:test -- you@example.com
async function sendTestEmail(to: string | undefined) {
  if (!to || !/^[^@\s]+@[^@\s]+$/.test(to)) throw new Error("Give the address to send to: npm run mail:test -- you@example.com");
  const mail = config().mail;
  console.log(`Email is ${describeMailSetup(mail)}.`);
  const problem = await checkMailConnection(mail);
  if (problem) throw new Error(`The mail server refused the connection or sign-in: ${problem}`);
  await mailerFromConfig(mail).send({
    to, subject: "Lingora test email",
    text: "This is a test email from your Lingora API. If you can read it, password reset and email confirmation emails will arrive too.",
  });
  if (mail.provider === "smtp") console.log(`Sent to ${to}. Check the inbox (and the spam folder).`);
  else console.log("Printed above, not sent. Set SMTP_URL and MAIL_FROM in nihon-api/.env to send real email.");
}

sendTestEmail(process.argv[2]).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
