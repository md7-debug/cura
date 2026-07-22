export const STORAGE_KEYS = {
  activeLetter: "cura.active-letter.v1",
  annotations: "cura.annotations.32.v1",
  highlights: "cura.highlights.32.v1",
  locale: "cura.locale",
  reader: "cura.reader.v1",
  readingPosition: "cura.reading-position.32.v1",
  reply: "cura.reply.32.v1",
  theme: "cura.theme",
  timerMinutes: "cura.timer-minutes.v1",
};

function letterKey(kind, letter) {
  return `cura.${kind}.${letter}.v1`;
}

const DEFAULT_READER_PREFERENCES = {
  size: "regular",
  spacing: "comfortable",
};

export function loadLocale(storage = globalThis.localStorage) {
  try {
    const locale = storage?.getItem(STORAGE_KEYS.locale);
    return locale === "fr" ? "fr" : "en";
  } catch {
    return "en";
  }
}

export function saveLocale(locale, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEYS.locale, locale);
  } catch {
    // The app remains usable when private browsing blocks storage.
  }
}

export function loadReply(letter = 32, storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(letterKey("reply", letter)) ?? "null");
    if (saved?.version === 1 && saved.letter === letter && typeof saved.text === "string") {
      const savedAt = typeof saved.savedAt === "string" && Number.isFinite(Date.parse(saved.savedAt))
        ? saved.savedAt
        : "";
      return { text: saved.text, savedAt };
    }
  } catch {
    // Ignore malformed or unavailable browser storage.
  }
  return { text: "", savedAt: "" };
}

export function saveReply(letter, text, savedAt, storage = globalThis.localStorage) {
  try {
    storage?.setItem(
      letterKey("reply", letter),
      JSON.stringify({ version: 1, letter, text, savedAt }),
    );
  } catch {
    // The current writing session remains available in memory.
  }
}

export function clearReply(letter, storage = globalThis.localStorage) {
  try {
    storage?.removeItem(letterKey("reply", letter));
  } catch {
    // Nothing else to clear.
  }
}

export function loadReplies(letterNumbers, storage = globalThis.localStorage) {
  return Object.fromEntries(
    letterNumbers
      .map((letter) => [letter, loadReply(letter, storage)])
      .filter(([, reply]) => reply.text),
  );
}

export function loadActiveLetter(storage = globalThis.localStorage) {
  try {
    const value = Number(storage?.getItem(STORAGE_KEYS.activeLetter));
    return Number.isInteger(value) && value >= 1 && value <= 1000 ? value : 1;
  } catch {
    return 1;
  }
}

export function saveActiveLetter(letter, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEYS.activeLetter, String(letter));
  } catch {
    // The active letter remains selected for the current session.
  }
}

export function loadTheme(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(STORAGE_KEYS.theme) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function saveTheme(theme, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEYS.theme, theme);
  } catch {
    // The selected theme still applies for the current session.
  }
}

export function loadTimerMinutes(storage = globalThis.localStorage) {
  try {
    const value = Number(storage?.getItem(STORAGE_KEYS.timerMinutes));
    return [10, 15, 20, 30].includes(value) ? value : 10;
  } catch {
    return 10;
  }
}

export function saveTimerMinutes(minutes, storage = globalThis.localStorage) {
  try {
    if ([10, 15, 20, 30].includes(minutes)) {
      storage?.setItem(STORAGE_KEYS.timerMinutes, String(minutes));
    }
  } catch {
    // The chosen duration still applies for the current session.
  }
}

export function loadReaderPreferences(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEYS.reader) ?? "null");
    const size = ["small", "regular", "large"].includes(saved?.size)
      ? saved.size
      : DEFAULT_READER_PREFERENCES.size;
    const spacing = ["comfortable", "open"].includes(saved?.spacing)
      ? saved.spacing
      : DEFAULT_READER_PREFERENCES.spacing;
    return { size, spacing };
  } catch {
    return { ...DEFAULT_READER_PREFERENCES };
  }
}

export function saveReaderPreferences(preferences, storage = globalThis.localStorage) {
  try {
    storage?.setItem(
      STORAGE_KEYS.reader,
      JSON.stringify({ version: 1, ...preferences }),
    );
  } catch {
    // The selected reading preferences still apply for the current session.
  }
}

export function loadReadingPosition(letter = 32, storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(letterKey("reading-position", letter)) ?? "null");
    if (saved?.version === 1 && saved.letter === letter && Number.isInteger(saved.paragraph)) {
      return Math.max(0, saved.paragraph);
    }
  } catch {
    // Ignore malformed or unavailable browser storage.
  }
  return 0;
}

export function saveReadingPosition(letter, paragraph, storage = globalThis.localStorage) {
  try {
    storage?.setItem(
      letterKey("reading-position", letter),
      JSON.stringify({ version: 1, letter, paragraph: Math.max(0, paragraph) }),
    );
  } catch {
    // The reading session remains usable without persistence.
  }
}

export function loadAnnotations(letter = 32, storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(letterKey("annotations", letter)) ?? "null");
    if (saved?.version !== 1 || saved.letter !== letter || !saved.entries) return {};

    return Object.fromEntries(
      Object.entries(saved.entries).flatMap(([scope, entry]) => {
        if (!entry || typeof entry !== "object") return [];
        const text = typeof entry.text === "string" ? entry.text : "";
        const strokes = Array.isArray(entry.strokes)
          ? entry.strokes.filter((stroke) => (
              Array.isArray(stroke)
              && stroke.length > 0
              && stroke.every((point) => (
                Number.isFinite(point?.x)
                && Number.isFinite(point?.y)
                && point.x >= 0
                && point.x <= 1
                && point.y >= 0
                && point.y <= 1
              ))
            ))
          : [];
        return [[scope, { text, strokes }]];
      }),
    );
  } catch {
    return {};
  }
}

export function saveAnnotations(letter, entries, storage = globalThis.localStorage) {
  try {
    storage?.setItem(
      letterKey("annotations", letter),
      JSON.stringify({ version: 1, letter, entries }),
    );
  } catch {
    // Annotations remain available for the current session.
  }
}

export function loadHighlights(letter = 32, storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(letterKey("highlights", letter)) ?? "null");
    if (saved?.version !== 1 || saved.letter !== letter || !Array.isArray(saved.items)) return [];

    return saved.items.filter((highlight) => (
      typeof highlight?.id === "string"
      && typeof highlight.locale === "string"
      && /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(highlight.locale)
      && Number.isInteger(highlight.paragraphIndex)
      && highlight.paragraphIndex >= 0
      && Number.isInteger(highlight.start)
      && Number.isInteger(highlight.end)
      && highlight.start >= 0
      && highlight.end > highlight.start
      && typeof highlight.quote === "string"
      && highlight.quote.length > 0
    ));
  } catch {
    return [];
  }
}

export function saveHighlights(letter, items, storage = globalThis.localStorage) {
  try {
    storage?.setItem(
      letterKey("highlights", letter),
      JSON.stringify({ version: 1, letter, items }),
    );
  } catch {
    // Highlights remain available for the current session.
  }
}
