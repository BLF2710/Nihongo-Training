// In-memory shared state (one API process): rate-limit windows, nonces and the realtime bus, plus the bus message
// parser shared with the PostgreSQL bus. No network or database (the PostgreSQL versions are tested in tests/api).
//   npm test
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");

const { MemoryRateLimitStore } = require("../src/shared-state/rate-limit-store");
const { MemoryNonceStore } = require("../src/shared-state/nonce-store");
const { MemoryRealtimeBus, parseBusMessage } = require("../src/shared-state/realtime-bus");

const clock = () => { const time = { now: 1_000_000 }; return { time, now: () => time.now }; };

test("a rate-limit window counts uses and starts again once it has ended", async () => {
  const { time, now } = clock();
  const store = new MemoryRateLimitStore(now);
  assert.deepEqual(await store.hit("login:a", 1000), { count: 1, resetAt: 1_001_000 });
  assert.equal((await store.hit("login:a", 1000)).count, 2);
  assert.equal((await store.hit("login:b", 1000)).count, 1, "keys are counted separately");
  time.now += 1000;
  assert.deepEqual(await store.hit("login:a", 1000), { count: 1, resetAt: 1_002_000 });
});

test("resetting forgets every window", async () => {
  const store = new MemoryRateLimitStore();
  await store.hit("x", 1000); await store.hit("x", 1000);
  await store.reset();
  assert.equal((await store.hit("x", 1000)).count, 1);
});

test("a nonce can be used once and only before it expires", async () => {
  const { time, now } = clock();
  const store = new MemoryNonceStore(now);
  await store.save("n1", 1000); await store.save("n2", 1000);
  assert.equal(await store.use("n1"), true);
  assert.equal(await store.use("n1"), false, "not twice");
  assert.equal(await store.use("unknown"), false);
  time.now += 1000;
  assert.equal(await store.use("n2"), false, "expired");
});

test("the in-memory bus hands every message to every handler", async () => {
  const bus = new MemoryRealtimeBus();
  const seen = [];
  bus.onMessage(message => seen.push(["a", message])); bus.onMessage(message => seen.push(["b", message]));
  await bus.send({ kind: "event", userId: 3, event: { type: "inbox" } });
  assert.deepEqual(seen, [["a", { kind: "event", userId: 3, event: { type: "inbox" } }], ["b", { kind: "event", userId: 3, event: { type: "inbox" } }]]);
});

test("bus messages from the wire are checked before use", () => {
  assert.deepEqual(parseBusMessage('{"kind":"event","userId":7,"event":{"type":"notifications"}}'), { kind: "event", userId: 7, event: { type: "notifications" } });
  assert.deepEqual(parseBusMessage('{"kind":"close","userId":7}'), { kind: "close", userId: 7 });
  for (const bad of ["", "not json", "null", "[]", '{"kind":"event","userId":"7","event":{}}', '{"kind":"event","userId":7}', '{"kind":"drop","userId":7}', '{"kind":"close","userId":1.5}']) {
    assert.equal(parseBusMessage(bad), null, bad);
  }
});
