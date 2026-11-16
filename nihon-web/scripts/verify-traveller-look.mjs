// The traveller's look (lib/travellerLook.ts): reading a saved look, changing a part, and the wardrobe's choices.
// Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_TRAVELLER_LOOK, LOOK_PARTS, lookColours, parseTravellerLook, withPart } from "../src/lib/travellerLook.ts";

const CHOSEN = { outfit: "plum", sash: "teal", skin: "deep", hair: "silver", hat: "hachimaki", accessory: "lantern", cheeks: "rosy" };

test("a saved look with every part one of its choices is read as it is", () => {
  assert.deepEqual(parseTravellerLook(CHOSEN), CHOSEN);
});

test("a look with an unknown choice, a missing part or the wrong shape is not read", () => {
  for (const bad of [{ ...CHOSEN, outfit: "rainbow" }, { ...CHOSEN, hat: undefined }, { ...CHOSEN, skin: 3 }, null, "plum", []]) {
    assert.equal(parseTravellerLook(bad), null, JSON.stringify(bad));
  }
});

test("a choice named like an object's built-in property is not a choice", () => {
  assert.equal(parseTravellerLook({ ...CHOSEN, outfit: "toString" }), null);
});

test("changing one part keeps the rest, and leaves the look it came from as it was", () => {
  const before = { ...DEFAULT_TRAVELLER_LOOK };
  assert.deepEqual(withPart(DEFAULT_TRAVELLER_LOOK, "hat", "none"), { ...before, hat: "none" });
  assert.deepEqual(DEFAULT_TRAVELLER_LOOK, before);
});

test("the default look is a look", () => {
  assert.deepEqual(parseTravellerLook(DEFAULT_TRAVELLER_LOOK), DEFAULT_TRAVELLER_LOOK);
});

test("the wardrobe offers every part of the look once", () => {
  assert.deepEqual(LOOK_PARTS.map(({ part }) => part).sort(), Object.keys(DEFAULT_TRAVELLER_LOOK).sort());
});

test("each colour choice paints a colour", () => {
  assert.deepEqual(Object.values(lookColours(CHOSEN)).every(colour => /^#[0-9a-f]{6}$/.test(colour)), true);
});
