import test from "node:test";
import assert from "node:assert/strict";
import {
  clampSpreadIndex,
  paginateParagraphEntries,
  paginateParagraphs,
  pairedSpreadCount,
  plainReplyParagraphs,
  spreadIndexForParagraph,
} from "../src/lib/writingBook.js";

test("plainReplyParagraphs removes common Markdown chrome without losing prose", () => {
  assert.deepEqual(
    plainReplyParagraphs("# Letter I\n\nDear Max, **keep** your time.\n\n- Return to [the text](https://example.com)."),
    ["Letter I", "Dear Max, keep your time.", "Return to the text."],
  );
});

test("paginateParagraphs keeps every paragraph and creates readable pages", () => {
  const paragraphs = [
    "One ".repeat(95).trim(),
    "Two ".repeat(95).trim(),
    "Three ".repeat(95).trim(),
  ];
  const pages = paginateParagraphs(paragraphs, 420);
  assert.ok(pages.length >= 3);
  assert.equal(pages.flat().join(" ").replace(/\s+/g, " "), paragraphs.join(" "));
});

test("paired spread helpers keep source and reply navigation in bounds", () => {
  assert.equal(pairedSpreadCount([["source"]], [["reply"], ["reply 2"]]), 2);
  assert.equal(clampSpreadIndex(-4, 2), 0);
  assert.equal(clampSpreadIndex(9, 2), 1);
});

test("indexed pagination preserves paragraph identity across physical spreads", () => {
  const paragraphs = [
    "First ".repeat(80).trim(),
    "Second ".repeat(80).trim(),
    "Third ".repeat(80).trim(),
  ];
  const pages = paginateParagraphEntries(paragraphs, 360);
  assert.deepEqual([...new Set(pages.flat().map((entry) => entry.paragraphIndex))], [0, 1, 2]);
  const thirdPage = pages.findIndex((page) => page.some((entry) => entry.paragraphIndex === 2));
  assert.equal(spreadIndexForParagraph(pages, 2), Math.floor(thirdPage / 2));
  assert.equal(spreadIndexForParagraph(pages, 2, 1), thirdPage);
});
