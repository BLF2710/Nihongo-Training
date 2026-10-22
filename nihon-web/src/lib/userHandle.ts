import { useEffect, useSyncExternalStore } from "react";
import { fetchProfile } from "../api/profile";
import { getUserHandle, hasSession, isAdmin, saveUserHandle } from "./authStorage";

// The signed-in learner's exact username (unique, what friends type to add them). Sessions from before it was
// stored look it up once; every component using the hook then updates together.
const listeners = new Set<() => void>();
let lookup: Promise<void> | null = null;

function learn() {
  if (lookup || getUserHandle() || !hasSession() || isAdmin()) return;
  lookup = fetchProfile()
    .then(profile => { if (typeof profile?.username === "string" && profile.username) { saveUserHandle(profile.username); listeners.forEach(listener => listener()); } })
    .catch(() => { /* tried again on the next page */ })
    .finally(() => { lookup = null; });
}

export function useUserHandle(): string | null {
  const handle = useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, getUserHandle, () => null);
  useEffect(() => { if (!handle) learn(); }, [handle]);
  return handle;
}
