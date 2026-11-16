import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Vector } from "../errands/movement";
import { ARRIVED_FROM } from "./routes";

/**
 * Where the traveller appears when they come off a wild path (the page's `?from=<path id>`), or null when they didn't
 * (back from a building's page, say, where the remembered spot applies). The parameter is then dropped from the
 * address, so reloading or coming back later doesn't put them at the arrival again.
 */
export function useArrival(spotFor: (routeId: string) => Vector | null): Vector | null {
  const [search, setSearch] = useSearchParams();
  const from = search.get(ARRIVED_FROM);
  const [arrival] = useState(() => (from ? spotFor(from) : null));
  useEffect(() => {
    if (!from) return;
    const rest = new URLSearchParams(search);
    rest.delete(ARRIVED_FROM);
    setSearch(rest, { replace: true });
  }, [from, search, setSearch]);
  return arrival;
}
