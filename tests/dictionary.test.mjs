import assert from "node:assert/strict";
import test from "node:test";
import {
  findDictionarySection,
  normalizeDictionaryWord,
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
