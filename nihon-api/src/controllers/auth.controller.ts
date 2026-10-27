import { accountSecurity } from "../services/account-security.service";
import * as authService from "../services/auth.service";
import { googleSignIn } from "../services/google/google-sign-in.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const register = action(async (req, res) => {
  await authService.register(req.body);
  return res.status(201).json({ message: "Register success" });
}, { label: "register", message: "Server error" });

export const login = action(async (req, res) => {
  return res.json(await authService.login(req.body));
}, { label: "login", message: "Server error" });

export const requestPasswordReset = action(async (req, res) => res.status(202).json(await accountSecurity().requestPasswordReset(req.body?.email)),
  { label: "requestPasswordReset", message: "Your request couldn't be sent. Please try again." });

export const resetPassword = action(async (req, res) => res.json(await accountSecurity().resetPassword(req.body?.token, req.body?.password, req.body?.confirmPassword)),
  { label: "resetPassword", message: "Your password couldn't be changed. Please try again." });

export const verifyEmail = action(async (req, res) => res.json(await accountSecurity().verifyEmail(req.body?.token)),
  { label: "verifyEmail", message: "Your email couldn't be confirmed. Please try again." });

export const resendVerification = action(async (req, res) => res.json(await accountSecurity().sendVerificationEmail(getUserId(req))),
  { label: "resendVerification", message: "The email couldn't be sent. Please try again." });

export const logOutEverywhere = action(async (req, res) => res.json(await accountSecurity().logOutEverywhere(getUserId(req))),
  { label: "logOutEverywhere", message: "Couldn't sign you out everywhere. Please try again." });

export const googleNonce = action(async (_req, res) => {
  res.set("Cache-Control", "no-store");
  return res.json(await googleSignIn().nonce());
}, { label: "googleNonce", message: "Google sign-in is unavailable right now." });

export const googleSignInHandler = action(async (req, res) => res.json(await googleSignIn().signIn(req.body?.credential)),
  { label: "googleSignIn", message: "Google sign-in failed. Please try again." });

export const googleLink = action(async (req, res) => res.json(await googleSignIn().link(getUserId(req), req.body?.credential)),
  { label: "googleLink", message: "Your Google account couldn't be connected. Please try again." });

export const googleUnlink = action(async (req, res) => res.json(await googleSignIn().unlink(getUserId(req))),
  { label: "googleUnlink", message: "Your Google account couldn't be disconnected. Please try again." });
