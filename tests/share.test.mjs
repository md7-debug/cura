import assert from "node:assert/strict";
import test from "node:test";
import { createPassageShare, createXShareUrl } from "../src/lib/share.js";

test("creates a compact passage share without private notes", () => {
  const share = createPassageShare({
    author: "Seneca",
    quote: "  A calm   selected passage. ",
    sourceUrl: "https://example.com/source",
    title: "On true friendship",
    work: "Moral Letters to Lucilius",
  });

  assert.equal(
    share.text,
    "“A calm selected passage.”\n\n— Seneca, Moral Letters to Lucilius\n#CuraReading",
  );
  assert.equal(share.title, "On true friendship");
  assert.equal(share.clipboardText.endsWith("https://example.com/source"), true);
});

test("keeps the complete passage for native sharing and shortens only the X post", () => {
  const share = createPassageShare({
    author: "Epictetus",
    quote: "word ".repeat(80),
    sourceUrl: "https://example.com/enchiridion",
    title: "What is in our power",
    work: "Enchiridion",
  });
  const url = new URL(createXShareUrl(share));

  assert.equal(share.text.includes("…”"), false);
  assert.equal(share.xText.includes("…”"), true);
  assert.equal(url.origin, "https://x.com");
  assert.equal(url.pathname, "/intent/post");
  assert.equal(url.searchParams.get("text"), share.xText);
  assert.equal(url.searchParams.get("url"), share.url);
});
