import assert from "node:assert/strict";
import test from "node:test";
import { letter32 } from "../src/content/letter32.js";
import { letters } from "../src/content/letters.js";
import { copy } from "../src/i18n/copy.js";

test("English and French interface copy expose the same keys", () => {
  assert.deepEqual(Object.keys(copy.en).sort(), Object.keys(copy.fr).sort());
  assert.deepEqual(Object.keys(copy.en.nav).sort(), Object.keys(copy.fr.nav).sort());
});

test("the complete bilingual collection contains 124 readable letters", () => {
  assert.equal(letters.length, 124);
  assert.deepEqual(letters.map(({ number }) => number), Array.from({ length: 124 }, (_, index) => index + 1));
  for (const letter of letters) {
    for (const locale of ["en", "fr"]) {
      assert.ok(letter[locale].title.length > 0, `${locale} title missing for ${letter.number}`);
      assert.ok(letter[locale].text.join(" ").length > 250, `${locale} text too short for ${letter.number}`);
      assert.match(letter.sources[locale], /^https:\/\//);
      assert.doesNotMatch(letter[locale].text.join("\n"), /Récupérée de|Catégories\s*:/u);
    }
  }
});

test("every margin note points to text present in its translation", () => {
  for (const locale of ["en", "fr"]) {
    const fullText = letter32[locale].text.join(" ");
    for (const note of letter32[locale].notes) {
      assert.ok(fullText.includes(note.phrase), `${locale} is missing: ${note.phrase}`);
      assert.ok(note.latin.length > 0);
      assert.ok(note.definition.length > 0);
    }
  }
});

test("margin note identifiers stay aligned across languages", () => {
  assert.deepEqual(
    letter32.en.notes.map(({ id }) => id),
    letter32.fr.notes.map(({ id }) => id),
  );
});
