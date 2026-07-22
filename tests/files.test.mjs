import assert from "node:assert/strict";
import test from "node:test";
import { availableFilename } from "../src/lib/files.js";

test("vault exports never overwrite an existing note", async () => {
  const existing = new Set(["Cura.md", "Cura (2).md"]);
  assert.equal(await availableFilename("Cura.md", async (name) => existing.has(name)), "Cura (3).md");
});

test("an unused vault filename remains unchanged", async () => {
  assert.equal(await availableFilename("Letter I.md", async () => false), "Letter I.md");
});
