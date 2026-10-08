import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { withTransaction } from "../db/transaction";
import { isRegistrationClosed } from "../repositories/site.repository";
import { createAccount, findUserByEmail, findUserByLogin, findUserByUsername, recordLogin } from "../repositories/user.repository";
import { HttpError } from "../utils/http-error";
import { EMAIL_PATTERN, USERNAME_PATTERN } from "../utils/validation";

const PASSWORD_HASH_ROUNDS = 10;
const TOKEN_LIFETIME = "7d";

export async function register(input: Record<string, unknown>) {
  if (await isRegistrationClosed()) throw new HttpError(403, "New account registration is currently closed.");
  const { username, displayName, email, password, confirmPassword } = input;
  const cleanUsername = typeof username === "string" ? username.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanDisplayName = typeof displayName === "string" ? displayName.trim() : "";
  if (!USERNAME_PATTERN.test(cleanUsername) || !EMAIL_PATTERN.test(cleanEmail) || typeof password !== "string" || password.length < 8 || password !== confirmPassword) {
    throw new HttpError(400, "Use a 3–30 character username, valid email, and matching password of at least 8 characters.");
  }

  const [existingEmail, existingUsername] = await Promise.all([findUserByEmail(cleanEmail), findUserByUsername(cleanUsername)]);
  if (existingEmail || existingUsername) {
    throw new HttpError(400, existingEmail ? "Email already exists" : "Username already exists");
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
  await withTransaction(client => createAccount(client, {
    username: cleanUsername, email: cleanEmail, passwordHash, displayName: cleanDisplayName || cleanUsername,
  }));
}

export async function login(input: Record<string, unknown>) {
  const { login, password } = input;
  if (typeof login !== "string" || typeof password !== "string" || !login.trim() || !password) {
    throw new HttpError(400, "Login and password are required");
  }

  const user = await findUserByLogin(login);
  if (!user) throw new HttpError(401, "Invalid email or password");
  if (user.status && user.status !== "active") throw new HttpError(403, "This account is inactive");
  if (!(await bcrypt.compare(password, user.password))) throw new HttpError(401, "Invalid email or password");

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: TOKEN_LIFETIME });
  await recordLogin(user.id);
  return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
}
