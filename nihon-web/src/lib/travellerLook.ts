// What the learner's traveller looks like: the character walking the island map, the village, the wild paths and the
// battles. Pure (no React, no browser). The ids must match the API's (nihon-api/src/services/traveller.service.ts).

/** A choice for one part of the look: its English name, and the colour it paints (for colour choices). */
type Choice = { label: string };
type ColourChoice = Choice & { colour: string };

export const OUTFITS = {
  indigo: { label: "Indigo", colour: "#2f5d8a" },
  vermilion: { label: "Vermilion", colour: "#c4472f" },
  moss: { label: "Moss green", colour: "#5e7f3a" },
  plum: { label: "Plum", colour: "#7a4a7e" },
  ochre: { label: "Ochre", colour: "#c98f2e" },
  charcoal: { label: "Charcoal", colour: "#3c3f46" },
} as const satisfies Record<string, ColourChoice>;

export const SASHES = {
  red: { label: "Red", colour: "#c94f35" },
  gold: { label: "Gold", colour: "#e0b23f" },
  white: { label: "White", colour: "#f4efe4" },
  teal: { label: "Teal", colour: "#2f8f88" },
} as const satisfies Record<string, ColourChoice>;

export const SKIN_TONES = {
  porcelain: { label: "Porcelain", colour: "#f8e0cc" },
  light: { label: "Light", colour: "#f1d0b0" },
  warm: { label: "Warm", colour: "#dfaf86" },
  tan: { label: "Tan", colour: "#bf8a5e" },
  brown: { label: "Brown", colour: "#94603d" },
  deep: { label: "Deep", colour: "#65402a" },
} as const satisfies Record<string, ColourChoice>;

export const HAIR_COLOURS = {
  black: { label: "Black", colour: "#2a2420" },
  brown: { label: "Brown", colour: "#5b3a24" },
  chestnut: { label: "Chestnut", colour: "#8f4a26" },
  silver: { label: "Silver", colour: "#c9c6c0" },
} as const satisfies Record<string, ColourChoice>;

export const HATS = {
  kasa: { label: "Straw hat (kasa)" },
  hachimaki: { label: "Headband (hachimaki)" },
  none: { label: "No hat" },
} as const satisfies Record<string, Choice>;

export const ACCESSORIES = {
  bundle: { label: "Travel bundle" },
  fan: { label: "Paper fan" },
  lantern: { label: "Lantern" },
  none: { label: "Nothing" },
} as const satisfies Record<string, Choice>;

export type TravellerLook = {
  outfit: keyof typeof OUTFITS; sash: keyof typeof SASHES; skin: keyof typeof SKIN_TONES;
  hair: keyof typeof HAIR_COLOURS; hat: keyof typeof HATS; accessory: keyof typeof ACCESSORIES;
};
export type LookPart = keyof TravellerLook;

/** Every part of the look and its choices, in the order the wardrobe shows them. */
export const LOOK_PARTS = [
  { part: "outfit", name: "Kimono", choices: OUTFITS },
  { part: "skin", name: "Skin", choices: SKIN_TONES },
  { part: "sash", name: "Sash (obi)", choices: SASHES },
  { part: "hair", name: "Hair", choices: HAIR_COLOURS },
  { part: "hat", name: "Hat", choices: HATS },
  { part: "accessory", name: "Carrying", choices: ACCESSORIES },
] as const satisfies readonly { part: LookPart; name: string; choices: Record<string, Choice> }[];

export const DEFAULT_TRAVELLER_LOOK: TravellerLook = { outfit: "indigo", sash: "red", skin: "light", hair: "black", hat: "kasa", accessory: "bundle" };

const isKeyOf = <T extends object>(choices: T, value: unknown): value is keyof T => typeof value === "string" && Object.hasOwn(choices, value);

/** A look read from storage or the API, or null when any part of it is missing or not one of its choices. */
export function parseTravellerLook(value: unknown): TravellerLook | null {
  if (typeof value !== "object" || value === null) return null;
  const partOf = (part: LookPart): unknown => Reflect.get(value, part);
  const [outfit, sash, skin, hair, hat, accessory] = (["outfit", "sash", "skin", "hair", "hat", "accessory"] as const).map(partOf);
  if (!isKeyOf(OUTFITS, outfit) || !isKeyOf(SASHES, sash) || !isKeyOf(SKIN_TONES, skin)) return null;
  if (!isKeyOf(HAIR_COLOURS, hair) || !isKeyOf(HATS, hat) || !isKeyOf(ACCESSORIES, accessory)) return null;
  return { outfit, sash, skin, hair, hat, accessory };
}

/** The look with one part changed. */
export const withPart = <P extends LookPart>(look: TravellerLook, part: P, choice: TravellerLook[P]): TravellerLook => ({ ...look, [part]: choice });

/** The colours the traveller is painted in. */
export function lookColours(look: TravellerLook) {
  return { outfit: OUTFITS[look.outfit].colour, sash: SASHES[look.sash].colour, skin: SKIN_TONES[look.skin].colour, hair: HAIR_COLOURS[look.hair].colour };
}
