import assert from "node:assert/strict";
import test from "node:test";

import {
  collectionById,
  libraryCollections,
  readingsForCollection,
  readingsForWork,
} from "../src/content/libraryCollections.js";
import { readings } from "../src/content/readings.js";

test("library collections cover every reading exactly once", () => {
  const memberships = readings.map((reading) => (
    libraryCollections.filter((collection) => collection.matches(reading)).map((collection) => collection.id)
  ));

  assert.equal(memberships.every((collectionIds) => collectionIds.length === 1), true);
});

test("library collections preserve the intended work groups", () => {
  const counts = Object.fromEntries(libraryCollections.map((collection) => [
    collection.id,
    readingsForCollection(collection.id, readings).length,
  ]));

  assert.deepEqual(counts, {
    "seneca-letters": 124,
    "marcus-meditations": 12,
    "epictetus-enchiridion": 1,
    "emerson-society-solitude": 12,
    "emerson-self-reliance": 13,
  });
});

test("the default shelf work opens On Saving Time and exposes every Seneca letter", () => {
  const defaultCollection = collectionById("seneca-letters");
  const workReadings = readingsForWork(
    defaultCollection.authorId,
    defaultCollection.title.en,
    readings,
  );

  assert.equal(workReadings.length, 124);
  assert.equal(workReadings[0].en.title, "On Saving Time");
  assert.equal(workReadings[0].fr.title, "Sur l’emploi du temps");
});
