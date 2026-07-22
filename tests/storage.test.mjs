import assert from "node:assert/strict";
import test from "node:test";
import {
  STORAGE_KEYS,
  clearReply,
  loadActiveLetter,
  loadAnnotations,
  loadHighlights,
  loadLocale,
  loadReaderPreferences,
  loadReadingPosition,
  loadReply,
  loadReplies,
  loadTheme,
  loadTimerMinutes,
  saveLocale,
  saveActiveLetter,
  saveAnnotations,
  saveHighlights,
  saveReaderPreferences,
  saveReadingPosition,
  saveReply,
  saveTheme,
  saveTimerMinutes,
} from "../src/lib/storage.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test("locale defaults to English and accepts French", () => {
  const storage = memoryStorage();
  assert.equal(loadLocale(storage), "en");
  saveLocale("fr", storage);
  assert.equal(loadLocale(storage), "fr");
});

test("a reply round-trips through versioned local storage", () => {
  const storage = memoryStorage();
  saveReply(32, "Cher Sénèque…", "2026-07-22T12:00:00.000Z", storage);
  assert.deepEqual(loadReply(32, storage), {
    text: "Cher Sénèque…",
    savedAt: "2026-07-22T12:00:00.000Z",
  });
  clearReply(32, storage);
  assert.deepEqual(loadReply(32, storage), { text: "", savedAt: "" });
});

test("replies remain isolated by letter and the active letter persists", () => {
  const storage = memoryStorage();
  saveReply(1, "Keep the hour.", "2026-07-22T12:00:00.000Z", storage);
  saveReply(2, "Read it twice.", "2026-07-23T12:00:00.000Z", storage);
  assert.deepEqual(Object.keys(loadReplies([1, 2, 3], storage)), ["1", "2"]);
  assert.equal(loadReply(1, storage).text, "Keep the hour.");
  assert.equal(loadReply(2, storage).text, "Read it twice.");
  saveActiveLetter(2, storage);
  assert.equal(loadActiveLetter(storage), 2);
});

test("malformed stored data fails closed", () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEYS.reply, "not-json");
  assert.deepEqual(loadReply(32, storage), { text: "", savedAt: "" });
});

test("an invalid saved date cannot break the letter archive", () => {
  const storage = memoryStorage();
  storage.setItem(
    STORAGE_KEYS.reply,
    JSON.stringify({ version: 1, letter: 32, text: "Still readable", savedAt: "not-a-date" }),
  );
  assert.deepEqual(loadReply(32, storage), { text: "Still readable", savedAt: "" });
});

test("theme persists and rejects unknown values", () => {
  const storage = memoryStorage();
  assert.equal(loadTheme(storage), "light");
  saveTheme("dark", storage);
  assert.equal(loadTheme(storage), "dark");
  storage.setItem(STORAGE_KEYS.theme, "sepia");
  assert.equal(loadTheme(storage), "light");
});

test("the optional reading timer remembers a supported duration", () => {
  const storage = memoryStorage();
  assert.equal(loadTimerMinutes(storage), 10);
  saveTimerMinutes(15, storage);
  assert.equal(loadTimerMinutes(storage), 15);
  storage.setItem(STORAGE_KEYS.timerMinutes, "90");
  assert.equal(loadTimerMinutes(storage), 10);
});

test("reader preferences persist and reject unknown values", () => {
  const storage = memoryStorage();
  assert.deepEqual(loadReaderPreferences(storage), {
    size: "regular",
    spacing: "comfortable",
  });
  saveReaderPreferences({ size: "large", spacing: "open" }, storage);
  assert.deepEqual(loadReaderPreferences(storage), { size: "large", spacing: "open" });
  storage.setItem(STORAGE_KEYS.reader, JSON.stringify({ size: "giant", spacing: "tight" }));
  assert.deepEqual(loadReaderPreferences(storage), {
    size: "regular",
    spacing: "comfortable",
  });
});

test("reading position persists as a non-negative paragraph index", () => {
  const storage = memoryStorage();
  assert.equal(loadReadingPosition(32, storage), 0);
  saveReadingPosition(32, 3, storage);
  assert.equal(loadReadingPosition(32, storage), 3);
  saveReadingPosition(32, -4, storage);
  assert.equal(loadReadingPosition(32, storage), 0);
});

test("typed and handwritten annotations round-trip by scope", () => {
  const storage = memoryStorage();
  const entries = {
    letter: { text: "Keep this close.", strokes: [[{ x: 0.1, y: 0.2 }, { x: 0.4, y: 0.6 }]] },
    "complete-life": { text: "Completion is direction.", strokes: [] },
  };
  saveAnnotations(32, entries, storage);
  assert.deepEqual(loadAnnotations(32, storage), entries);
});

test("malformed annotation strokes are discarded", () => {
  const storage = memoryStorage();
  storage.setItem(
    STORAGE_KEYS.annotations,
    JSON.stringify({
      version: 1,
      letter: 32,
      entries: { letter: { text: "Still here", strokes: [[{ x: 4, y: -1 }], "bad"] } },
    }),
  );
  assert.deepEqual(loadAnnotations(32, storage), {
    letter: { text: "Still here", strokes: [] },
  });
});

test("personal highlights round-trip with paragraph offsets", () => {
  const storage = memoryStorage();
  const highlights = [{
    id: "quiet-line",
    locale: "en",
    paragraphIndex: 3,
    start: 12,
    end: 34,
    quote: "calm and peaceful",
  }];
  saveHighlights(32, highlights, storage);
  assert.deepEqual(loadHighlights(32, storage), highlights);
});

test("malformed personal highlights are discarded", () => {
  const storage = memoryStorage();
  storage.setItem(
    STORAGE_KEYS.highlights,
    JSON.stringify({
      version: 1,
      letter: 32,
      items: [
        { id: "good", locale: "en", paragraphIndex: 0, start: 2, end: 8, quote: "ask you" },
        { id: "bad", locale: "fr", paragraphIndex: -1, start: 9, end: 3, quote: "" },
      ],
    }),
  );
  assert.deepEqual(loadHighlights(32, storage), [
    { id: "good", locale: "en", paragraphIndex: 0, start: 2, end: 8, quote: "ask you" },
  ]);
});
