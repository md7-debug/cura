import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import {
  defaultPersonalCoverId,
  isPersonalCoverId,
  personalCoverById,
  personalCovers,
} from "../src/content/personalCovers.js";

test("the private archive ships seven distinct personal-edition covers", async () => {
  assert.equal(personalCovers.length, 7);
  assert.equal(new Set(personalCovers.map((cover) => cover.id)).size, personalCovers.length);
  assert.equal(new Set(personalCovers.map((cover) => cover.image)).size, personalCovers.length);
  await Promise.all(personalCovers.map((cover) => (
    access(new URL(`../public/${cover.image}`, import.meta.url))
  )));
});

test("default cover selection is stable and avoids an adjacent duplicate", () => {
  const first = defaultPersonalCoverId(1);
  assert.equal(defaultPersonalCoverId(1), first);
  assert.notEqual(defaultPersonalCoverId(8, first), first);
  assert.equal(isPersonalCoverId(first), true);
  assert.equal(personalCoverById(first).id, first);
  assert.equal(personalCoverById("unknown").id, personalCovers[0].id);
});
