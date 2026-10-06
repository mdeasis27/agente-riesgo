import assert from "node:assert/strict";
import test from "node:test";
import { STORY } from "./story";
import { lintStory, storyStrings as strings } from "@/design-system/demo/copy-lint";

const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).filter(([k]) => k !== "before" && k !== "after").flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];

test("same shape in English and Spanish", () => assert.deepEqual(keys(STORY.es), keys(STORY.en)));

test("no empty strings except the owner-supplied why note", () => {
  for (const locale of ["en", "es"] as const) {
    const { why, ...rest } = STORY[locale];
    assert.notEqual(why.title.trim(), "");
    for (const s of strings(rest)) assert.notEqual(s.trim(), "", `${locale}: empty string`);
  }
});

test("avoids AI-sounding patterns and brand names", () => {
  for (const locale of ["en", "es"] as const) assert.deepEqual(lintStory(STORY[locale]), [], locale);
});

test("the bet names the threshold", () => {
  assert.match(STORY.es.tryIt.question(30), /umbral de revisión en 30/);
  assert.match(STORY.en.tryIt.question(25), /threshold at 25/);
});

test("the comparison sentence is true when the check matters and when it doesn't", () => {
  assert.match(STORY.es.compare.sentence(0, 1), /habría pasado directo/);
  assert.match(STORY.es.compare.sentence(0, 0), /no cambió el resultado/);
  assert.match(STORY.en.compare.sentence(1, 1), /1 with the check, 1 without/);
});

test("straight-through count agrees in number", () => {
  assert.equal(STORY.es.scene.throughOf(1), "Pasó directo 1 de 12");
  assert.equal(STORY.es.scene.throughOf(7), "Pasaron directo 7 de 12");
});

test("the airport summary uses the real counts and agrees in number", () => {
  assert.equal(STORY.en.scene.summary(12, 7, 4, 1), "Airport security: 12 credit cases cross the scanner one by one. 7 reach the gate, 4 get their bag opened by a person and 1 is on the list and does not board.");
  assert.equal(STORY.es.scene.summary(12, 11, 1, 0), "Control de aeropuerto: 12 casos de crédito cruzan el escáner uno por uno. 11 llegan a la puerta, a 1 le abren la maleta y 0 aparecen en la lista y no abordan.");
});
