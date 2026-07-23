import assert from "node:assert/strict";
import test from "node:test";
import { letter32 } from "../src/content/letter32.js";
import { letters } from "../src/content/letters.js";
import { marcusReadings } from "../src/content/marcus.js";
import { emersonReadings } from "../src/content/emerson.js";
import { readings as catalogReadings } from "../src/content/catalog.js";
import { readings, requestedVoices, voices } from "../src/content/readings.js";
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

test("the curated library keeps every published reading bilingual and sourced", () => {
  assert.equal(readings.length, 162);
  assert.deepEqual(voices.map(({ id }) => id), ["seneca", "marcus-aurelius", "epictetus", "emerson"]);
  assert.equal(new Set(readings.map(({ number }) => number)).size, readings.length);
  for (const reading of readings) {
    for (const locale of ["en", "fr"]) {
      assert.ok(reading[locale].title.length > 0);
      assert.ok(reading[locale].text.join(" ").length > 250);
      assert.match(reading.sources[locale], /^https:\/\//);
    }
  }
});

test("the lightweight runtime catalog stays aligned with the source collection", () => {
  assert.deepEqual(
    catalogReadings.map(({ number }) => number),
    readings.map(({ number }) => number),
  );
  for (const reading of catalogReadings) {
    for (const locale of ["en", "fr"]) {
      assert.ok(reading[locale].title.length > 0);
      assert.ok(reading[locale].minutes >= 2);
      assert.equal("text" in reading[locale], false);
    }
  }
});

test("Marcus Aurelius includes all twelve complete books in both languages", () => {
  assert.equal(marcusReadings.length, 12);
  assert.deepEqual(marcusReadings.map(({ code }) => code.en), [
    "BOOK I", "BOOK II", "BOOK III", "BOOK IV", "BOOK V", "BOOK VI",
    "BOOK VII", "BOOK VIII", "BOOK IX", "BOOK X", "BOOK XI", "BOOK XII",
  ]);
  for (const reading of marcusReadings) {
    assert.ok(reading.en.text.join(" ").length > 10_000);
    assert.ok(reading.fr.text.join(" ").length > 10_000);
    assert.doesNotMatch(reading.en.text.join("\n"), /Footnotes|Retrieved from|\^\(/u);
    assert.doesNotMatch(reading.fr.text.join("\n"), /Récupérée de|\^\(/u);
  }
});

test("Emerson includes the bilingual collection and requested public-domain originals", () => {
  assert.equal(emersonReadings.length, 25);
  assert.deepEqual(emersonReadings.slice(0, 13).map(({ en }) => en.title), [
    "Keep independence and sympathy",
    "The work of civilization",
    "Beauty must become life",
    "Speech with force",
    "The education of home",
    "Learning from the ground",
    "Use the day’s tools",
    "Read for transformation",
    "Conversation as a tonic",
    "Courage for the fact",
    "An inward measure of success",
    "The gifts of age",
    "Trust the thought that is yours",
  ]);
  for (const reading of emersonReadings.slice(0, 13)) {
    assert.ok(reading.en.text.join(" ").length > 10_000);
    assert.ok(reading.fr.text.join(" ").length > 10_000);
  }
  assert.match(emersonReadings[0].en.translationNote, /1870 public-domain/u);
  assert.match(emersonReadings[0].fr.translationNote, /Marie Dugard \(1862–1932\), domaine public/u);
  assert.match(emersonReadings[12].work.en, /Self-Reliance/u);
  assert.match(emersonReadings[12].en.translationNote, /1841 public-domain/u);
  assert.match(emersonReadings[12].fr.translationNote, /Émile Montégut \(1825–1895\), domaine public/u);
  assert.doesNotMatch(
    emersonReadings[12].fr.text.join("\n"),
    /PHILOSOPHIE AM[ÉEFL]RICAINE|L'original porte|Tout ce paragraphe rappelle/u,
  );
  assert.deepEqual(emersonReadings.slice(13).map(({ work }) => work.en), [
    "Nature (1836) · Nature",
    "Essays: First Series · History",
    "Essays: First Series · Compensation",
    "Essays: First Series · The Over-Soul",
    "Essays: First Series · Circles",
    "Essays: Second Series · The Poet",
    "Essays: Second Series · Experience",
    "Essays: Second Series · Politics",
    "Essays: Second Series · New England Reformers",
    "Poems · Saadi",
    "Addresses · The American Scholar",
    "The Conduct of Life · Fate",
  ]);
  for (const reading of emersonReadings.slice(13)) {
    assert.ok(reading.en.text.join(" ").length > 800);
    assert.equal(reading.en.text, reading.fr.text);
    assert.match(reading.fr.translationNote, /original anglais/u);
  }
});

test("requested authors remain visibly gated until their editions are cleared", () => {
  assert.deepEqual(
    requestedVoices.map(({ name }) => name),
    [
      "Henry David Thoreau",
      "Meister Eckhart",
      "Saint Augustine",
      "Marsilio Ficino",
      "Simone Weil",
      "Pierre Hadot",
    ],
  );
  assert.equal(requestedVoices.find(({ id }) => id === "pierre-hadot").status, "guide-only");
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
