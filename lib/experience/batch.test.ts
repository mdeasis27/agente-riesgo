import assert from "node:assert/strict";
import test from "node:test";
import { CASES, runBatch } from "./batch";

test("12 fictional cases; at threshold 30 more than half go straight through", () => {
  assert.equal(CASES.length, 12);
  assert.deepEqual(runBatch(30).counts, { proceed: 7, review: 4, stop: 1 });
  assert.deepEqual(runBatch(25).counts, { proceed: 6, review: 5, stop: 1 });
});

test("the sanctioned case is stopped with screening and goes through without it", () => {
  assert.equal(runBatch(30).counts.stop, 1);
  const off = runBatch(30, { screening: false });
  assert.equal(off.counts.stop, 0);
  assert.equal(off.counts.proceed, 8);
});

test("sweep: both bet answers are reachable on the slider, and the default says yes", () => {
  const answers = new Set<boolean>();
  for (let t = 0; t <= 100; t += 5) answers.add(runBatch(t).counts.proceed > CASES.length / 2);
  assert.deepEqual([...answers].sort(), [false, true]);
});
