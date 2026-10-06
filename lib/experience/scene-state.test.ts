import assert from "node:assert/strict";
import test from "node:test";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { runBatch } from "./batch";
import { revealedCases, riesgoCells, riesgoPlacements } from "./scene-state";

test("final tape counts match the batch", () => {
  const b = runBatch(30);
  assert.deepEqual(tapeCounts(riesgoCells(b.items, 12)), { served: 7, rerouted: 4, lost: 1, pending: 0 });
  assert.ok(riesgoCells(b.items, 3).slice(3).every(c => c === "pending"));
});

test("reveals three cases per step, all when complete or under reduced motion", () => {
  assert.equal(revealedCases({ visible: 1, total: 4, complete: false }, 12, false), 3);
  assert.equal(revealedCases({ visible: 4, total: 4, complete: true }, 12, false), 12);
  assert.equal(revealedCases({ visible: 1, total: 4, complete: false }, 12, true), 12);
});

test("places revealed cases at their destination in arrival order and keeps the rest in line", () => {
  const b = runBatch(30);
  const mid = riesgoPlacements(b.items, 3);
  assert.deepEqual(mid.slice(0, 3), [{ at: "proceed", slot: 0 }, { at: "proceed", slot: 1 }, { at: "proceed", slot: 2 }]);
  assert.deepEqual(mid.slice(3).map(p => p.at), Array(9).fill("queue"));
  assert.deepEqual(mid.slice(3).map(p => p.slot), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const end = riesgoPlacements(b.items, 12);
  assert.deepEqual(end.map(p => p.at), b.items.map(i => i.decision));
  assert.deepEqual(end.slice(7).map(p => p.slot), [0, 1, 2, 3, 0]);
});
