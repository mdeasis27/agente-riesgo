import { strict as assert } from "node:assert";
import test from "node:test";
import { simulatePolicy } from "./policy";
import { isRiskScenario, riskScenarios } from "./story";

test("risk story presets lead to contrasting policy outcomes", () => {
  assert.equal(simulatePolicy(riskScenarios.clear).decision, "proceed");
  assert.equal(simulatePolicy(riskScenarios.blocked).decision, "stop");
});

test("risk story notices manual changes that leave a preset", () => {
  assert.equal(isRiskScenario(riskScenarios.clear, "clear"), true);
  assert.equal(isRiskScenario({ ...riskScenarios.clear, sanctions: true }, "clear"), false);
});
