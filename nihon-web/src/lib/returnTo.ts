/**
 * An address inside this site to go to after signing in (for example an invite link), or null.
 * Only plain paths are accepted: no other sites, no "//", no backslashes, nothing in the admin or sign-in pages.
 */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value || value.length > 200) return null;
  if (!/^\/(?![/\\])[A-Za-z0-9\-._~/?=&%]*$/.test(value)) return null;
  if (/^\/(login|register|admin)(\/|\?|$)/.test(value)) return null;
  return value;
}

/** "/login?next=…" for the current address, so signing in brings the learner back. */
export function loginPathFor(path: string) {
  const next = safeReturnPath(path);
  return next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login";
}
