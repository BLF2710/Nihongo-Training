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

export function mailerFromConfig(mail: ServerConfig["mail"]): Mailer {
  if (mail.provider === "smtp" && mail.smtpUrl) return new SmtpMailer(mail.smtpUrl, mail.from);
  if (mail.provider === "memory") return new MemoryMailer();
  return new ConsoleMailer();
}
