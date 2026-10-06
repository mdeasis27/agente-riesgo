import assert from "node:assert/strict";
import test from "node:test";
import { runMission } from "./mission";

const input = { verification: "confirmed" as const, sanctions: false, evidenceCoverage: 40, reviewThreshold: 20 };

test("only the threshold changes a partial-evidence case from review to proceed", async () => {
  const run = await runMission(input, new AbortController().signal, () => {});
  assert.equal(run.result.decision, "review");
  assert.equal(run.result.comparison.cautious.decision, "review");
  assert.equal(run.result.comparison.permissive.decision, "proceed");
  assert.deepEqual(run.result.comparison.cautious.evidence, run.result.comparison.permissive.evidence);
  assert.deepEqual(run.input, input);
});

test("neither threshold bypasses a blocking screening signal", async () => {
  const run = await runMission({ ...input, sanctions: true }, new AbortController().signal, () => {});
  assert.equal(run.result.comparison.cautious.decision, "stop");
  assert.equal(run.result.comparison.permissive.decision, "stop");
});

test("cancellation during the selected trace prevents a comparison", async () => {
  const controller = new AbortController();
  await assert.rejects(() => runMission(input, controller.signal, () => controller.abort()), { name: "AbortError" });
});

test("cancelling at screening emits no policy decision afterward", async () => {
  const controller = new AbortController();
  const emitted: string[] = [];
  await assert.rejects(() => runMission(input, controller.signal, event => {
    emitted.push(event.id);
    if (event.id === "screening") controller.abort();
  }), { name: "AbortError" });
  assert.deepEqual(emitted, ["verification", "screening"]);
});
