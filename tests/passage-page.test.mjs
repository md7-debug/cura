import assert from "node:assert/strict";
import test from "node:test";
import { passagePage } from "../api/passage.js";

test("creates an X card that returns readers to the shared Cura paragraph", () => {
  const params = new URLSearchParams({
    author: "Seneca",
    lang: "en",
    paragraph: "2",
    quote: "Time is our own.",
    reading: "7",
    title: "On Saving Time",
    work: "Moral Letters to Lucilius",
  });
  const html = passagePage(params);

  assert.match(html, /twitter:card" content="summary_large_image/);
  assert.match(html, /On Saving Time — Seneca/);
  assert.match(html, /Time is our own/);
  assert.match(html, /reading=7&amp;focus=reading&amp;paragraph=2/);
});

test("escapes shared text before placing it in metadata", () => {
  const html = passagePage(new URLSearchParams({ quote: '\"><script>alert(1)</script>' }));
  assert.equal(html.includes("<script>alert(1)</script>"), false);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
