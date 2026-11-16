import * as travellerLookRepository from "../repositories/traveller-look.repository";
import type { StoredTravellerLook } from "../repositories/traveller-look.repository";
import { HttpError } from "../utils/http-error";

// The choices for each part of the traveller's look. They must match the web app's (nihon-web/src/lib/travellerLook.ts),
// which draws them; the first of each is the default.
export const TRAVELLER_CHOICES = {
  outfit: ["indigo", "vermilion", "moss", "plum", "ochre", "charcoal"],
  sash: ["red", "gold", "white", "teal"],
  skin: ["porcelain", "light", "warm", "tan", "brown", "deep"],
  hair: ["black", "brown", "chestnut", "silver"],
  hat: ["kasa", "hachimaki", "none"],
  accessory: ["bundle", "fan", "lantern", "none"],
} as const satisfies Record<keyof StoredTravellerLook, readonly string[]>;

export const DEFAULT_TRAVELLER_LOOK: StoredTravellerLook = {
  outfit: TRAVELLER_CHOICES.outfit[0], sash: TRAVELLER_CHOICES.sash[0], skin: TRAVELLER_CHOICES.skin[1],
  hair: TRAVELLER_CHOICES.hair[0], hat: TRAVELLER_CHOICES.hat[0], accessory: TRAVELLER_CHOICES.accessory[0],
};

const isChoice = (part: keyof StoredTravellerLook, value: unknown): value is string =>
  typeof value === "string" && (TRAVELLER_CHOICES[part] as readonly string[]).includes(value);

/** A whole look from a request body, every part one of its choices; anything else is refused. */
function parseLook(body: unknown): StoredTravellerLook {
  if (typeof body !== "object" || body === null) throw new HttpError(400, "Send the traveller's look.");
  const choiceOf = (part: keyof StoredTravellerLook) => {
    const value: unknown = Reflect.get(body, part);
    if (!isChoice(part, value)) throw new HttpError(400, `Choose one of the ${part} options.`);
    return value;
  };
  return { outfit: choiceOf("outfit"), sash: choiceOf("sash"), skin: choiceOf("skin"), hair: choiceOf("hair"), hat: choiceOf("hat"), accessory: choiceOf("accessory") };
}

export async function getTravellerLook(userId: number): Promise<StoredTravellerLook> {
  return (await travellerLookRepository.findTravellerLook(userId)) ?? DEFAULT_TRAVELLER_LOOK;
}

export async function saveTravellerLook(userId: number, body: unknown): Promise<StoredTravellerLook> {
  const look = parseLook(body);
  await travellerLookRepository.saveTravellerLook(userId, look);
  return look;
}
