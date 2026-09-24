// Common romaji variations/aliases for Hepburn, Kunrei-shiki, and Nihon-shiki
const ROMAJI_ALIASES: Record<string, string[]> = {
  shi: ["si", "shi"],
  si: ["si", "shi"],
  chi: ["ti", "chi"],
  ti: ["ti", "chi"],
  tsu: ["tu", "tsu"],
  tu: ["tu", "tsu"],
  fu: ["hu", "fu"],
  hu: ["hu", "fu"],
  ji: ["zi", "ji"],
  zi: ["zi", "ji"],
  sha: ["sya", "sha"],
  shu: ["syu", "shu"],
  sho: ["syo", "sho"],
  cha: ["tya", "cha"],
  chu: ["tyu", "chu"],
  cho: ["tyo", "cho"],
  ja: ["zya", "ja", "jya"],
  ju: ["zyu", "ju", "jyu"],
  jo: ["zyo", "jo", "jyo"]
};

export function isRomajiMatch(expected: string, given: string): boolean {
  const normExpected = expected.trim().toLowerCase();
  const normGiven = given.trim().toLowerCase();

  if (normExpected === normGiven) return true;

  const valid = ROMAJI_ALIASES[normExpected];
  if (valid && valid.includes(normGiven)) {
    return true;
  }

  return false;
}
