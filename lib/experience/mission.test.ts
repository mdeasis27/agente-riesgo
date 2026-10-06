import assert from "node:assert/strict";
import test from "node:test";
import { runMission } from "./mission";

const run = (reviewThreshold: number) => runMission({ reviewThreshold }, new AbortController().signal, () => {});

test("runs the 12 cases and reveals them three at a time", async () => {
  const r = await run(30);
  assert.equal(r.result.items.length, 12);
  assert.equal(r.trace.length, 4);
  assert.deepEqual(r.trace[0].evidenceIds, ["case-1", "case-2", "case-3"]);
  assert.deepEqual(r.result.counts, { proceed: 7, review: 4, stop: 1 });
});

test("compares against the same cases without the sanctions check", async () => {
  assert.deepEqual((await run(30)).result.comparison, { withCheck: 0, withoutCheck: 1 });
  assert.deepEqual((await run(0)).result.comparison, { withCheck: 0, withoutCheck: 0 });
});

test("rejects a threshold outside 0..100", async () => {
  await assert.rejects(run(120));
});

test("stops when aborted", async () => {
  const c = new AbortController(); c.abort();
  await assert.rejects(runMission({ reviewThreshold: 30 }, c.signal, () => {}));
});
