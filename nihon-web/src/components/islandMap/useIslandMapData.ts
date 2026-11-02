import { useEffect, useState } from "react";
import { fetchFriends } from "../../api/friends";
import type { FriendLists } from "../../api/friends";
import { fetchProfile } from "../../api/profile";
import type { Profile } from "../../api/profile";
import { fetchSrsSummary } from "../../api/srs";
import type { SrsSummary } from "../../api/srs";
import { fetchUnits } from "../../api/units";
import type { CourseUnit } from "../../api/units";

/** A request's result: still loading, loaded, or failed. Each request fails on its own, so one error never hides the map. */
export type Loaded<T> = { status: "loading" } | { status: "ready"; value: T } | { status: "failed" };

function useLoaded<T>(load: (signal: AbortSignal) => Promise<T>): Loaded<T> {
  const [result, setResult] = useState<Loaded<T>>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const value = await load(controller.signal);
        setResult({ status: "ready", value });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Island map data could not be loaded", error);
        setResult({ status: "failed" });
      }
    };
    void run();
    return () => controller.abort();
  }, [load]);
  return result;
}

export function useIslandMapData() {
  const units = useLoaded<CourseUnit[]>(fetchUnits);
  const profile = useLoaded<Profile>(fetchProfile);
  const srs = useLoaded<SrsSummary>(fetchSrsSummary);
  const friends = useLoaded<FriendLists>(fetchFriends);
  return { units, profile, srs, friends };
}
