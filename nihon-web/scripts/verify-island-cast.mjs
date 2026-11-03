// The island cast: one character per island, each island's pages spoken for.
// Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAST, characterOf, introduce } from "../src/lib/cast.ts";
import { GREETINGS, lineOfTheDay } from "../src/lib/castLines.ts";
import { ISLANDS } from "../src/lib/islandMap.ts";

test("no two characters live on the same island", () => {
  const islands = Object.values(CAST).map(character => character.island);
  assert.equal(new Set(islands).size, islands.length);
});

test("every island has someone to speak for it, with the Time island falling back to Kon", () => {
  assert.deepEqual(ISLANDS.map(island => characterOf(island.id).id), ["kon", "hakase", "tama", "pon", "zen", "tsuru", "chun", "kurama", "hato", "sensei", "kon", "momo"]);
});

test("a character is introduced by name and role", () => {
  assert.equal(introduce(CAST.zen), "Zen, the garden monk");
});

test("every island has greetings, and the line of the day changes from one day to the next but not within a day", () => {
  assert.ok(ISLANDS.every(island => GREETINGS[island.id].length > 0));
  const lines = ["first", "second", "third"];
  const morning = new Date(2026, 10, 3, 8), evening = new Date(2026, 10, 3, 22), nextDay = new Date(2026, 10, 4, 8);
  assert.equal(lineOfTheDay(lines, morning), lineOfTheDay(lines, evening));
  assert.notEqual(lineOfTheDay(lines, morning), lineOfTheDay(lines, nextDay));
});
