import assert from "node:assert/strict";
import test from "node:test";
import { clipSelectionRects } from "../src/lib/selection.js";

test("clips browser selection paint to the centered reading measure", () => {
  const markers = clipSelectionRects([
    { left: 0, right: 1892, top: 430, height: 42 },
    { left: 0, right: 973, top: 472, height: 42 },
  ], { left: 628, right: 1248 });

  assert.deepEqual(markers, [
    { left: 628, width: 620, top: 442.6, height: 42 * 0.66 },
    { left: 628, width: 345, top: 484.6, height: 42 * 0.66 },
  ]);
});

test("drops selection rectangles outside the reading measure", () => {
  assert.deepEqual(
    clipSelectionRects([{ left: 20, right: 80, top: 40, height: 20 }], { left: 200, right: 800 }),
    [],
  );
});
