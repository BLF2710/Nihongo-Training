// Database backup files: names, which ones are kept, and checking a restore. No database or file system.
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");
const { backupFileName, backupsOf, backupsToPrune, compareRowCounts, manifestNameFor } = require("../src/backup/backupFiles");

const at = iso => new Date(iso);

test("names a backup by database and UTC time, so names sort by age", () => {
  assert.equal(backupFileName("nihon_db", at("2026-10-28T03:04:05Z")), "lingora-nihon_db-20261028-030405.dump");
  assert.equal(manifestNameFor("lingora-nihon_db-20261028-030405.dump"), "lingora-nihon_db-20261028-030405.json");
});

test("lists only this database's backups, newest first", () => {
  const files = ["lingora-nihon_db-20261027-010000.dump", "notes.txt", "lingora-other-20261029-010000.dump", "lingora-nihon_db-20261028-010000.dump", "lingora-nihon_db-20261028-010000.json"];
  assert.deepEqual(backupsOf("nihon_db", files), ["lingora-nihon_db-20261028-010000.dump", "lingora-nihon_db-20261027-010000.dump"]);
});

test("keeps the newest backups and prunes the rest", () => {
  const files = [1, 2, 3, 4, 5].map(day => backupFileName("nihon_db", at(`2026-10-0${day}T00:00:00Z`)));
  assert.deepEqual(backupsToPrune("nihon_db", files, 3), [files[1], files[0]]);
  assert.deepEqual(backupsToPrune("nihon_db", files, 14), []);
});

test("never prunes every backup", () => {
  assert.throws(() => backupsToPrune("nihon_db", [], 0), RangeError);
});

test("a restore matches when every table has the recorded row count", () => {
  assert.deepEqual(compareRowCounts({ users: 6, lessons: 0 }, { lessons: 0, users: 6 }), []);
});

test("reports tables whose counts differ or that are missing", () => {
  assert.deepEqual(compareRowCounts({ users: 6, mistakes: 3 }, { users: 5, extra: 1 }), [
    "extra: backup had no table, restore has 1", "mistakes: backup had 3, restore has no table", "users: backup had 6, restore has 5",
  ]);
});
