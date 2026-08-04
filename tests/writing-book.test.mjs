import test from "node:test";
import assert from "node:assert/strict";
import {
  clampSpreadIndex,
  paginateMeasuredParagraphEntries,
  paginateParagraphEntries,
  paginateParagraphs,
  pairedSpreadCount,
  plainReplyParagraphs,
  spreadIndexForParagraph,
} from "../src/lib/writingBook.js";
import { readings } from "../src/content/readings.js";

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

test("measured pagination never drops words at a physical page boundary", () => {
  const paragraphs = [
    "You may desire to know how I, who preach to you so freely, am practising. I confess frankly: my expense account balances, as you would expect from one who is free-handed but careful. I cannot boast that I waste nothing, but I can at least tell you what I am wasting, and the cause and manner of the loss.",
    "Every word must reach the next physical page when the current page runs out of lines.",
  ];
  const pages = paginateMeasuredParagraphEntries(paragraphs, {
    lineHeight: 10,
    maxWidth: 32,
    measureText: (text) => text.length,
    pageHeight: 50,
    paragraphGap: 5,
  });

  const rendered = pages.flat().map((entry) => entry.text).join(" ").replace(/\s+/g, " ");
  assert.ok(pages.length > 1);
  assert.equal(rendered, paragraphs.join(" "));
  assert.match(rendered, /what I am wasting, and the cause and manner/);
});

test("every published English and French reading survives measured Book pagination", () => {
  const layouts = [
    { lineHeight: 64, maxWidth: 620, pageHeight: 580, paragraphGap: 22 },
    { lineHeight: 55, maxWidth: 836, pageHeight: 870, paragraphGap: 30 },
  ];

  readings.forEach((reading) => {
    ["en", "fr"].forEach((locale) => {
      const source = reading[locale].text.join(" ").replace(/\s+/g, " ").trim();
      layouts.forEach((layout) => {
        const pages = paginateMeasuredParagraphEntries(reading[locale].text, {
          ...layout,
          measureText: (text) => text.length * 24,
        });
        const paginated = pages.flat().map((entry) => entry.text).join(" ").replace(/\s+/g, " ").trim();
        assert.equal(paginated, source, `${locale} reading ${reading.number} lost text`);
      });
    });
  });
});
