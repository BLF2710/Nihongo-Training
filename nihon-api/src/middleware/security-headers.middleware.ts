import type { NextFunction, Request, Response } from "express";

const HSTS_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

/**
 * Standard security headers for API responses. The API only returns JSON (and the event stream), so nothing it
 * sends may be framed, sniffed as another type, or load other resources.
 */
export function securityHeaders(options: { isProduction: boolean }) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    // Only over HTTPS: browsers then refuse plain HTTP to this host for the given time.
    if (options.isProduction || req.secure) res.setHeader("Strict-Transport-Security", `max-age=${HSTS_MAX_AGE_SECONDS}; includeSubDomains`);
    next();
  };
}
