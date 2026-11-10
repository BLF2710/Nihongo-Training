import { createApp } from "./app";
import { config } from "./config/env";
import { checkMailConnection, describeMailSetup } from "./services/mail/mailer";

const PORT = config().port;

createApp().listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Says at start whether email works, instead of at the first password reset.
const mail = config().mail;
console.log(`Email: ${describeMailSetup(mail)}`);
void checkMailConnection(mail).then(problem => {
  if (problem) console.warn(`Email: the mail server refused the connection or sign-in (${problem}). Check SMTP_URL; password reset and confirmation emails will fail.`);
  else if (mail.provider === "smtp") console.log("Email: mail server sign-in works.");
});
