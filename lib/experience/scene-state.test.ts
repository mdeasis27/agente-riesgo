import assert from "node:assert/strict";
import test from "node:test";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { runBatch } from "./batch";
import { revealedCases, riesgoCells } from "./scene-state";

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
