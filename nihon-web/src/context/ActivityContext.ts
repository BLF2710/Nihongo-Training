import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Activity, SavedActivity } from "../lib/activitySession";
export type ActivityControl = { activity: Activity | null; initial: SavedActivity | null; begin: (restart?: boolean) => boolean; patch: (data: Record<string, unknown>) => void; complete: () => void; title: (title: string) => void };
export const ActivityContext = createContext<ActivityControl | null>(null);
export function useActivity() { const context = useContext(ActivityContext); if (!context) throw new Error("Missing activity session provider"); return context; }
export function useActivityTitle(title: string) { const { title: updateTitle } = useActivity(); useEffect(() => { updateTitle(title); }, [title, updateTitle]); }
export function useActivityState<T>(field: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const control = useActivity();
  const [value, setValue] = useState<T>(() => Object.prototype.hasOwnProperty.call(control.initial?.data ?? {}, field) ? control.initial!.data[field] as T : typeof initial === "function" ? (initial as () => T)() : initial);
  const ref = useRef(value);
  const setter: Dispatch<SetStateAction<T>> = useCallback(next => { const value = typeof next === "function" ? (next as (previous: T) => T)(ref.current) : next; ref.current = value; control.patch({ [field]: value }); setValue(value); }, [control, field]);
  return [value, setter];
}
