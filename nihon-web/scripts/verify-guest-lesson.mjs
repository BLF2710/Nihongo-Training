// The guest's first lesson (its steps and listening rounds) and the name a guest gives at its end.
// Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { LESSON_STEPS, matchRounds, nextStep, shuffled } from "../src/lib/guest/firstLesson.ts";
import { cleanLearnerName, guestNameFrom, MAX_NAME_LENGTH } from "../src/lib/guest/guestName.ts";
import { FIRST_LESSON_KANA, FIRST_LESSON_WORD } from "../src/data/guest/firstLesson.ts";
import { CAST_INTRODUCTIONS, GUEST_OPEN_ISLANDS } from "../src/data/guest/guestCast.ts";
import { CAST } from "../src/lib/cast.ts";
import { ISLANDS } from "../src/lib/islandMap.ts";

const sequence = values => { let index = 0; return () => values[index++ % values.length]; };

test("steps run meet, match, read, name and stay on the name step", () => {
  assert.deepEqual(LESSON_STEPS.map(step => nextStep(step)), ["match", "read", "name", "name"]);
});

test("shuffling keeps every item and leaves the original alone", () => {
  const items = ["あ", "い", "う"];
  const result = shuffled(items, sequence([0.1, 0.9, 0.5]));
  assert.deepEqual([...result].sort(), [...items].sort());
  assert.deepEqual(items, ["あ", "い", "う"]);
});

test("there is one listening round per kana, each offering all three kana", () => {
  const rounds = matchRounds(FIRST_LESSON_KANA, sequence([0.7, 0.2, 0.4, 0.9]));
  assert.deepEqual(rounds.map(round => round.answer.kana).sort(), ["あ", "い", "う"]);
  for (const round of rounds) assert.deepEqual(round.choices.map(choice => choice.kana).sort(), ["あ", "い", "う"]);
});

test("the word read at the end is made only of the kana just met", () => {
  const met = new Set(FIRST_LESSON_KANA.map(item => item.kana));
  assert.ok(Array.from(FIRST_LESSON_WORD.text).every(character => met.has(character)));
  assert.ok(FIRST_LESSON_KANA.every(item => item.memoryAid.length > 0), "every kana has a memory aid");
});

test("a name is trimmed, its spaces collapsed and NFC-normalised", () => {
  assert.equal(cleanLearnerName("  Kai   Tanaka "), "Kai Tanaka");
  assert.equal(cleanLearnerName("José"), "José");
});

test("an empty or blank name is no name", () => {
  assert.equal(cleanLearnerName("   "), null);
});

test("a long name is cut by characters, not UTF-16 units", () => {
  assert.equal(Array.from(cleanLearnerName("😀".repeat(MAX_NAME_LENGTH + 5))).length, MAX_NAME_LENGTH);
});

test("the guest's name is read from router state only when it is a string", () => {
  assert.equal(guestNameFrom({ guestName: " Kai " }), "Kai");
  assert.deepEqual([guestNameFrom(null), guestNameFrom({ guestName: 3 }), guestNameFrom("Kai"), guestNameFrom({ guestName: " " })], [null, null, null, null]);
});

test("guests can visit Home and Kana, and every cast introduction is someone living on a real island", () => {
  assert.deepEqual([...GUEST_OPEN_ISLANDS].sort(), ["home", "kana"]);
  for (const introduction of CAST_INTRODUCTIONS) {
    assert.equal(CAST[introduction.character].island, introduction.island, introduction.character);
    assert.ok(ISLANDS.some(island => island.id === introduction.island));
  }
});

test("the opening voyage starts on open water below Games and Kana and lands by Home", async () => {
  const { introVoyage, voyageOffset } = await import("../src/lib/guest/introCamera.ts");
  const { LANDSCAPE_LAYOUT, PORTRAIT_LAYOUT } = await import("../src/lib/islandMap.ts");
  for (const layout of [LANDSCAPE_LAYOUT, PORTRAIT_LAYOUT]) {
    const { from, to } = introVoyage(layout);
    const { games, kana, home } = layout.placements;
    assert.ok(from.y > games.y && from.y > kana.y && from.y < 1 && from.x > games.x && from.x < kana.x, "starts out at sea");
    assert.ok(Math.hypot(to.x - home.x, to.y - home.y) < 0.2, "lands by Home");
    assert.ok(Math.hypot(to.x - from.x, to.y - from.y) > Math.hypot(to.x - home.x, to.y - home.y), "sails in from further out");
  }
  const offset = voyageOffset({ from: { x: 0.6, y: 0.9 }, to: { x: 0.5, y: 0.6 } }, { width: 1000, height: 500 });
  assert.deepEqual([Math.round(offset.x), Math.round(offset.y)], [100, 150], "the start, from the landing, in stage pixels");
});

test("the opening camera centres the boat in the map area", async () => {
  const { introCameraTransform } = await import("../src/lib/guest/introCamera.ts");
  // A 1000×500 area holding an 800×500 stage: the boat at the stage's centre is at (500, 250), so at zoom 2 the
  // stage moves by (500 - 1000, 250 - 500).
  assert.equal(introCameraTransform({ width: 1000, height: 500 }, { width: 800, height: 500 }, { x: 0.5, y: 0.5 }, 2), "translate(-500.0px, -250.0px) scale(2)");
});
