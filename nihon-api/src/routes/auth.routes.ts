import { Router } from "express";
import {
  login, logOutEverywhere, register, requestPasswordReset, resendVerification, resetPassword, verifyEmail,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { bodyField, clientAddress, rateLimit } from "../middleware/rate-limit.middleware";
import type { RateLimitRule } from "../middleware/rate-limit.middleware";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const TRY_LATER = "Too many attempts. Please wait a while and try again.";

// Guessing passwords is slowed per account and per address; mass sign-ups and email floods per address.
const LOGIN_PER_ACCOUNT: RateLimitRule = { name: "login-account", windowMs: 15 * MINUTE, max: 10, key: req => { const login = bodyField("login")(req); return login && `${clientAddress(req)}|${login}`; }, message: "Too many sign-in attempts for this account. Please wait 15 minutes and try again." };
const LOGIN_PER_ADDRESS: RateLimitRule = { name: "login-address", windowMs: 15 * MINUTE, max: 50, key: clientAddress, message: TRY_LATER };
const REGISTER_PER_ADDRESS: RateLimitRule = { name: "register", windowMs: HOUR, max: 10, key: clientAddress, message: "Too many accounts were created from your network. Please try again later." };
const RESET_REQUEST_PER_ADDRESS: RateLimitRule = { name: "reset-request", windowMs: HOUR, max: 10, key: clientAddress, message: TRY_LATER };
const LINK_USE_PER_ADDRESS: RateLimitRule = { name: "link-use", windowMs: 15 * MINUTE, max: 20, key: clientAddress, message: TRY_LATER };
const RESEND_PER_ADDRESS: RateLimitRule = { name: "resend", windowMs: HOUR, max: 10, key: clientAddress, message: TRY_LATER };

const router = Router();
router.post("/register", rateLimit(REGISTER_PER_ADDRESS), register);
router.post("/login", rateLimit(LOGIN_PER_ACCOUNT, LOGIN_PER_ADDRESS), login);
router.post("/password/forgot", rateLimit(RESET_REQUEST_PER_ADDRESS), requestPasswordReset);
router.post("/password/reset", rateLimit(LINK_USE_PER_ADDRESS), resetPassword);
router.post("/email/verify", rateLimit(LINK_USE_PER_ADDRESS), verifyEmail);
router.post("/email/resend", authenticate, rateLimit(RESEND_PER_ADDRESS), resendVerification);
router.post("/logout-all", authenticate, logOutEverywhere);
export default router;
