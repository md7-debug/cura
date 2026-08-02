import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Vercel publishes the generated browser client", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

  assert.equal(config.buildCommand, "npm run build");
  assert.equal(config.outputDirectory, "dist/client");
});
