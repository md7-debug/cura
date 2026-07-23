import { readingCatalog } from "./readingCatalog.generated.js";

export const readings = readingCatalog;

export const voices = [
  { id: "seneca", name: "Seneca", reading: 1, works: 124 },
  { id: "marcus-aurelius", name: "Marcus Aurelius", reading: 201, works: 12 },
  { id: "epictetus", name: "Epictetus", reading: 202, works: 1 },
  {
    id: "emerson",
    name: "Ralph Waldo Emerson",
    reading: 301,
    works: readingCatalog.filter((reading) => reading.authorId === "emerson").length,
  },
];

export const requestedVoices = [
  { id: "thoreau", name: "Henry David Thoreau", status: "edition-review" },
  { id: "meister-eckhart", name: "Meister Eckhart", status: "edition-review" },
  { id: "saint-augustine", name: "Saint Augustine", status: "edition-review" },
  { id: "marsilio-ficino", name: "Marsilio Ficino", status: "edition-review" },
  { id: "simone-weil", name: "Simone Weil", status: "translation-review" },
  { id: "pierre-hadot", name: "Pierre Hadot", status: "guide-only" },
];

export function getReading(number) {
  return readings.find((reading) => reading.number === Number(number)) ?? readings[0];
}

export function readingCode(reading, locale) {
  return reading.code?.[locale] ?? null;
}
