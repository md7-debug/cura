import assert from "node:assert/strict";
import test from "node:test";
import {
  dictionarySourceUrl,
  findDictionarySection,
  lookupDictionaryWord,
  normalizeDictionaryWord,
  parseStructuredDictionaryResponse,
  plainSectionLabel,
  rankDictionaryDefinitions,
  readDictionaryCache,
  writeDictionaryCache,
} from "../src/lib/dictionary.js";

test("accepts one dictionary word without accepting a phrase", () => {
  assert.equal(normalizeDictionaryWord("  Time, ", "en"), "time");
  assert.equal(normalizeDictionaryWord("l’esprit", "fr"), "l'esprit");
  assert.equal(normalizeDictionaryWord("saving time", "en"), "");
  assert.equal(normalizeDictionaryWord("word/word", "en"), "");
});

test("finds the first part of speech inside the requested language", () => {
  const sections = [
    { hLevel: 2, index: "1", line: "English" },
    { hLevel: 3, index: "2", line: "Etymology" },
    { hLevel: 3, index: "3", line: "Noun" },
    { hLevel: 2, index: "4", line: "French" },
  ];
  assert.deepEqual(findDictionarySection(sections, "en"), {
    index: "3",
    partOfSpeech: "Noun",
  });
});

test("accepts decorated French section labels", () => {
  const sections = [
    { level: "2", index: "1", line: "<span>Français</span>" },
    { level: "3", index: "2", line: "Étymologie" },
    { level: "3", index: "3", line: "Nom commun" },
  ];
  assert.equal(plainSectionLabel(sections[0].line), "Français");
  assert.deepEqual(findDictionarySection(sections, "fr"), {
    index: "3",
    partOfSpeech: "Nom commun",
  });
});

test("recognizes extended dictionary section labels", () => {
  const sections = [
    { hLevel: 2, index: "1", line: "English" },
    { hLevel: 3, index: "2", line: "Etymology" },
    { hLevel: 3, index: "3", line: "Contraction" },
  ];
  assert.deepEqual(findDictionarySection(sections, "en"), {
    index: "3",
    partOfSpeech: "Contraction",
  });
});

test("reads concise definitions from Wiktionary's structured response", () => {
  const result = parseStructuredDictionaryResponse({
    en: [{
      partOfSpeech: "Noun",
      definitions: [
        { definition: "" },
        {
          definition: "A measured <a href=\"/wiki/duration\">duration</a> &amp; interval.<style>.note{color:red}</style><ol><li>A nested example.</li></ol>",
        },
      ],
    }],
  });
  assert.deepEqual(result, {
    definitions: ["A measured duration & interval."],
    partOfSpeech: "Noun",
  });
});

test("uses the structured English endpoint before the parser fallback", async () => {
  const requests = [];
  const result = await lookupDictionaryWord({
    fetchImpl: async (url) => {
      requests.push(url);
      return {
        json: async () => ({
          en: [{
            partOfSpeech: "Noun",
            definitions: [{ definition: "The progression of events." }],
          }],
        }),
        ok: true,
        status: 200,
      };
    },
    locale: "en",
    storage: null,
    word: "time",
  });
  assert.equal(requests.length, 1);
  assert.match(requests[0], /\/api\/rest_v1\/page\/definition\/time$/u);
  assert.deepEqual(result.definitions, ["The progression of events."]);
  assert.equal(result.partOfSpeech, "Noun");
});

test("builds the matching full-entry URL", () => {
  assert.equal(
    dictionarySourceUrl("Cœur", "fr"),
    "https://fr.wiktionary.org/wiki/c%C5%93ur",
  );
});

test("ranks definitions locally using the surrounding source paragraph", () => {
  const definitions = [
    "The inevitable progression into the future.",
    "A quantity of availability in duration.",
    "A person's experience on earth, regarded as a resource to save or spend.",
  ];
  assert.equal(
    rankDictionaryDefinitions(definitions, "Gather and save your time for your own sake.", "time", "en"),
    2,
  );
});

test("keeps a bounded, versioned local cache", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const value = { definitions: ["A definition."], word: "time" };
  writeDictionaryCache(storage, "en:time", value, 1000);
  assert.deepEqual(readDictionaryCache(storage, 1001)["en:time"].value, value);
  assert.deepEqual(readDictionaryCache(storage, 1000 + 1000 * 60 * 60 * 24 * 31), {});
});
