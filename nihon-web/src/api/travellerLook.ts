import api from "./axios";
import { parseTravellerLook } from "../lib/travellerLook";
import type { TravellerLook } from "../lib/travellerLook";

/** Thrown when the API answers with something that isn't a traveller look. */
export class InvalidTravellerLookError extends Error {
  constructor() { super("The server sent a traveller look this app can't draw."); this.name = "InvalidTravellerLookError"; }
}

const lookFrom = (data: unknown): TravellerLook => {
  const look = parseTravellerLook(data);
  if (!look) throw new InvalidTravellerLookError();
  return look;
};

export async function fetchTravellerLook(signal?: AbortSignal): Promise<TravellerLook> {
  return lookFrom((await api.get<unknown>("/traveller/look", { signal })).data);
}

export async function saveTravellerLookToServer(look: TravellerLook): Promise<TravellerLook> {
  return lookFrom((await api.put<unknown>("/traveller/look", look)).data);
}
