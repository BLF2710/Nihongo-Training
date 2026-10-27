import { useEffect, useSyncExternalStore } from "react";
import { fetchProfile } from "../api/profile";
import { getStoredUserAvatar, hasSession, isAdmin, storeUserAvatar } from "./authStorage";

// The signed-in learner's own picture, for the header. Stored with the session; looked up once when it isn't
// known yet (after signing in), and updated wherever the profile is loaded or the picture changes.
const listeners = new Set<() => void>();
let lookup: Promise<void> | null = null;

/** Records the learner's picture (null: none) and updates every component showing it. */
export function saveUserAvatar(avatar: string | null) {
  storeUserAvatar(avatar);
  listeners.forEach(listener => listener());
}

function learn() {
  if (lookup || getStoredUserAvatar() !== null || !hasSession() || isAdmin()) return;
  lookup = fetchProfile()
    .then(profile => saveUserAvatar(typeof profile?.avatar === "string" ? profile.avatar : null))
    .catch(() => { /* tried again on the next page */ })
    .finally(() => { lookup = null; });
}

/** The picture's address, or null when there is none (or it isn't known yet). */
export function useUserAvatar(): string | null {
  const stored = useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, getStoredUserAvatar, () => null);
  useEffect(() => { if (stored === null) learn(); }, [stored]);
  return stored || null;
}
