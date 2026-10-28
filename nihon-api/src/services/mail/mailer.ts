import nodemailer from "nodemailer";
import type { ServerConfig } from "../../config/env";

// Email sending behind our own interface: SMTP for real mail, the console in development, memory in tests.

export type OutgoingMail = { to: string; subject: string; text: string };

export interface Mailer {
  send(mail: OutgoingMail): Promise<void>;
}

export class SmtpMailer implements Mailer {
  private readonly transport: ReturnType<typeof nodemailer.createTransport>;
  constructor(smtpUrl: string, private readonly from: string) {
    this.transport = nodemailer.createTransport(smtpUrl);
  }
  async send(mail: OutgoingMail) {
    await this.transport.sendMail({ from: this.from, to: mail.to, subject: mail.subject, text: mail.text });
  }
}

/** Development only: prints the email (with its link) to the server console instead of sending it. */
export class ConsoleMailer implements Mailer {
  async send(mail: OutgoingMail) {
    console.log(`\n--- Email (not sent: no SMTP_URL configured) ---\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n--- end of email ---\n`);
  }
}

/** Tests: keeps every email in `sent`. */
export class MemoryMailer implements Mailer {
  readonly sent: OutgoingMail[] = [];
  async send(mail: OutgoingMail) {
    this.sent.push(mail);
  }
}

/** Where mail goes, for logs: the SMTP server's host only (the address holds the password). */
export function describeMailSetup(mail: ServerConfig["mail"]): string {
  if (mail.provider !== "smtp" || !mail.smtpUrl) return "printed to this console (SMTP_URL is not set)";
  try { return `sent through ${new URL(mail.smtpUrl).hostname} as ${mail.from}`; }
  catch { return "sent through SMTP (the SMTP_URL could not be read)"; }
}

/** Signs in to the SMTP server without sending anything; resolves to a problem description, or null when it works. */
export async function checkMailConnection(mail: ServerConfig["mail"]): Promise<string | null> {
  if (mail.provider !== "smtp" || !mail.smtpUrl) return null;
  try { await nodemailer.createTransport(mail.smtpUrl).verify(); return null; }
  catch (error) { return error instanceof Error ? error.message : "unknown error"; }
}

export function mailerFromConfig(mail: ServerConfig["mail"]): Mailer {
  if (mail.provider === "smtp" && mail.smtpUrl) return new SmtpMailer(mail.smtpUrl, mail.from);
  if (mail.provider === "memory") return new MemoryMailer();
  return new ConsoleMailer();
}
