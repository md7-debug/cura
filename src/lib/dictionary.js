const CACHE_KEY = "cura.dictionary.v1";
const CACHE_LIMIT = 60;
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 30;

const EDITIONS = {
  en: {
    host: "en.wiktionary.org",
    language: "english",
    licenseUrl: "https://en.wiktionary.org/wiki/Wiktionary:Copyrights",
    partsOfSpeech: [
      "noun",
      "proper noun",
      "verb",
      "adjective",
      "adverb",
      "pronoun",
      "preposition",
      "conjunction",
      "interjection",
      "determiner",
      "article",
      "numeral",
      "participle",
      "particle",
      "phrase",
      "proverb",
      "contraction",
      "abbreviation",
      "initialism",
      "symbol",
      "letter",
      "prefix",
      "suffix",
      "combining form",
    ],
  },
  fr: {
    host: "fr.wiktionary.org",
    language: "français",
    licenseUrl: "https://fr.wiktionary.org/wiki/Wiktionnaire:R%C3%A9utilisation_du_contenu_du_Wiktionnaire",
    partsOfSpeech: [
      "nom commun",
      "nom propre",
      "verbe",
      "adjectif",
      "adverbe",
      "pronom",
      "préposition",
      "conjonction",
      "interjection",
      "déterminant",
      "article",
      "numéral",
      "participe",
      "locution",
      "proverbe",
      "contraction",
      "abréviation",
      "sigle",
      "symbole",
      "lettre",
      "préfixe",
      "suffixe",
    ],
  },
};

const STOP_WORDS = new Set([
  "and", "are", "but", "for", "from", "has", "have", "into", "not", "that", "the", "their",
  "this", "was", "were", "which", "with", "you", "your",
  "aux", "avec", "cette", "dans", "des", "est", "les", "leur", "mais", "pas", "pour", "que",
  "qui", "ses", "son", "sur", "une", "vous",
]);

export class DictionaryLookupError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
    this.name = "DictionaryLookupError";
  }
}

export function normalizeDictionaryWord(value, locale = "en") {
  const trimmed = String(value ?? "")
    .normalize("NFC")
    .replace(/[‘’]/gu, "'")
    .trim()
    .replace(/^[^\p{L}\p{M}]+|[^\p{L}\p{M}]+$/gu, "");

  if (!trimmed || trimmed.length > 64 || /\s/u.test(trimmed)) return "";
  if (!/^[\p{L}\p{M}]+(?:['-][\p{L}\p{M}]+)*$/u.test(trimmed)) return "";
  return trimmed.toLocaleLowerCase(locale);
}

export function plainSectionLabel(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/gu, " ")
    .replace(/&nbsp;|&#160;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/\s+/gu, " ")
    .trim();
}

export function findDictionarySection(sections, locale = "en") {
  const edition = EDITIONS[locale] ?? EDITIONS.en;
  const normalizedSections = (sections ?? []).map((section) => ({
    ...section,
    headingLevel: Number(section.hLevel ?? section.level),
    plainLabel: plainSectionLabel(section.line),
  }));
  const languageIndex = normalizedSections.findIndex((section) => (
    section.headingLevel === 2
    && section.plainLabel.toLocaleLowerCase(locale) === edition.language
  ));
  if (languageIndex < 0) return null;

  const languageEnd = normalizedSections.findIndex((section, index) => (
    index > languageIndex && section.headingLevel === 2
  ));
  const candidates = normalizedSections.slice(
    languageIndex + 1,
    languageEnd < 0 ? undefined : languageEnd,
  );
  const match = candidates.find((section) => {
    const label = section.plainLabel.toLocaleLowerCase(locale);
    return edition.partsOfSpeech.some((part) => label === part || label.startsWith(`${part} `));
  });
  if (!match) return null;
  return { index: String(match.index), partOfSpeech: match.plainLabel };
}

function dictionaryTokens(value, locale) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase(locale)
    .match(/\p{L}{3,}/gu)
    ?.filter((token) => !STOP_WORDS.has(token)) ?? [];
}

export function rankDictionaryDefinitions(definitions, context, word, locale = "en") {
  const contextTokens = new Set(dictionaryTokens(context, locale));
  contextTokens.delete(normalizeDictionaryWord(word, locale));
  let bestIndex = 0;
  let bestScore = -1;

  definitions.forEach((definition, index) => {
    const tokens = dictionaryTokens(definition, locale);
    const overlap = tokens.reduce((score, token) => score + (contextTokens.has(token) ? 1 : 0), 0);
    const score = overlap * 10 - index;
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  });
  return bestIndex;
}

export function readDictionaryCache(storage, now = Date.now()) {
  if (!storage) return {};
  try {
    const parsed = JSON.parse(storage.getItem(CACHE_KEY) ?? "{}");
    return Object.fromEntries(Object.entries(parsed).filter(([, entry]) => (
      entry?.savedAt && now - entry.savedAt < CACHE_MAX_AGE && entry?.value?.definitions?.length
    )));
  } catch {
    return {};
  }
}

export function writeDictionaryCache(storage, key, value, now = Date.now()) {
  if (!storage) return;
  try {
    const cache = readDictionaryCache(storage, now);
    const entries = Object.entries({ ...cache, [key]: { savedAt: now, value } })
      .sort(([, a], [, b]) => b.savedAt - a.savedAt)
      .slice(0, CACHE_LIMIT);
    storage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // A blocked or full localStorage must not break reading.
  }
}

function cleanDefinitionText(value) {
  return String(value ?? "")
    .replace(/\[[^\]]{1,12}\]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function cleanDefinitionHtml(value) {
  const withoutNestedContent = String(value ?? "").replace(
    /<(?:ol|ul|dl|table|style|script|sup)\b[^>]*>[\s\S]*?<\/(?:ol|ul|dl|table|style|script|sup)\s*>/giu,
    " ",
  );
  if (typeof DOMParser !== "function") {
    return cleanDefinitionText(plainSectionLabel(withoutNestedContent));
  }
  const document = new DOMParser().parseFromString(`<body>${withoutNestedContent}</body>`, "text/html");
  document.body.querySelectorAll([
    "ol",
    "ul",
    "dl",
    "table",
    "style",
    "script",
    "sup",
    ".usage-label-sense",
  ].join(",")).forEach((node) => node.remove());
  return cleanDefinitionText(document.body.textContent);
}

export function parseStructuredDictionaryResponse(payload, locale = "en") {
  const entries = Array.isArray(payload?.[locale]) ? payload[locale] : [];
  let partOfSpeech = "";
  const definitions = [];

  for (const entry of entries) {
    for (const item of entry?.definitions ?? []) {
      const definition = cleanDefinitionHtml(item?.definition);
      if (definition.length < 4 || definitions.includes(definition)) continue;
      partOfSpeech ||= plainSectionLabel(entry.partOfSpeech);
      definitions.push(definition);
      if (definitions.length === 16) break;
    }
    if (definitions.length === 16) break;
  }

  return { definitions, partOfSpeech };
}

function parseDictionaryHtml(html) {
  if (typeof DOMParser !== "function") throw new DictionaryLookupError("unavailable");
  const document = new DOMParser().parseFromString(html, "text/html");
  const root = document.querySelector(".mw-parser-output") ?? document.body;
  const pronunciation = root.querySelector(".IPA, .API")?.textContent?.trim() ?? "";
  const list = [...root.querySelectorAll("ol")].find((candidate) => (
    candidate.closest("li") === null
  ));
  if (!list) return { definitions: [], pronunciation };

  const definitions = [...list.children].flatMap((item) => {
    if (item.tagName !== "LI") return [];
    const clone = item.cloneNode(true);
    clone.querySelectorAll([
      "ol",
      "ul",
      "dl",
      "sup",
      "table",
      "style",
      "script",
      ".usage-label-sense",
      ".qualifier-content",
      ".citation-whole",
      ".h-usage-example",
      ".h-quotation",
      ".nyms",
    ].join(",")).forEach((node) => node.remove());
    const definition = cleanDefinitionText(clone.textContent);
    return definition.length >= 4 ? [definition] : [];
  });

  return {
    definitions: [...new Set(definitions)].slice(0, 16),
    pronunciation: pronunciation.length <= 80 ? pronunciation : "",
  };
}

async function fetchJson(url, fetchImpl, signal) {
  if (typeof fetchImpl !== "function") throw new DictionaryLookupError("unavailable");
  let response;
  try {
    response = await fetchImpl(url, {
      headers: { "Api-User-Agent": "CuraReader/1.0 (https://curareader.vercel.app/)" },
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new DictionaryLookupError(globalThis.navigator?.onLine === false ? "offline" : "unavailable");
  }
  if (!response.ok) {
    if (response.status === 404) throw new DictionaryLookupError("not-found");
    throw new DictionaryLookupError("unavailable");
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new DictionaryLookupError("unavailable");
  }
  if (payload?.error) {
    const code = String(payload.error.code ?? "");
    if (["missingtitle", "nosuchsection", "pagecannotexist"].includes(code)) {
      throw new DictionaryLookupError("not-found");
    }
    throw new DictionaryLookupError("unavailable");
  }
  return payload;
}

export function dictionarySourceUrl(word, locale = "en") {
  const normalizedWord = normalizeDictionaryWord(word, locale);
  if (!normalizedWord) return "";
  const edition = EDITIONS[locale] ?? EDITIONS.en;
  return `https://${edition.host}/wiki/${encodeURIComponent(normalizedWord)}`;
}

async function lookupStructuredDictionaryWord({ edition, fetchImpl, locale, normalizedWord, signal }) {
  const payload = await fetchJson(
    `https://${edition.host}/api/rest_v1/page/definition/${encodeURIComponent(normalizedWord)}`,
    fetchImpl,
    signal,
  );
  const parsed = parseStructuredDictionaryResponse(payload, locale);
  if (!parsed.definitions.length) throw new DictionaryLookupError("not-found");
  return parsed;
}

async function lookupParsedDictionaryWord({ edition, fetchImpl, locale, normalizedWord, signal }) {
  const base = `https://${edition.host}/w/api.php`;
  const shared = `action=parse&page=${encodeURIComponent(normalizedWord)}&format=json&formatversion=2&origin=*&redirects=1`;
  const table = await fetchJson(`${base}?${shared}&prop=tocdata`, fetchImpl, signal);
  const sections = table?.parse?.tocdata?.sections ?? table?.parse?.sections;
  const section = findDictionarySection(sections, locale);
  if (!section) throw new DictionaryLookupError("not-found");

  const body = await fetchJson(
    `${base}?${shared}&prop=text&section=${encodeURIComponent(section.index)}&disableeditsection=1&disabletoc=1`,
    fetchImpl,
    signal,
  );
  const html = typeof body?.parse?.text === "string"
    ? body.parse.text
    : body?.parse?.text?.["*"] ?? "";
  const parsed = parseDictionaryHtml(html);
  if (!parsed.definitions.length) throw new DictionaryLookupError("not-found");
  return { ...parsed, partOfSpeech: section.partOfSpeech };
}

export async function lookupDictionaryWord({
  fetchImpl = globalThis.fetch,
  locale = "en",
  signal,
  storage = globalThis.localStorage,
  word,
}) {
  const normalizedWord = normalizeDictionaryWord(word, locale);
  if (!normalizedWord) throw new DictionaryLookupError("not-found");
  const edition = EDITIONS[locale] ?? EDITIONS.en;
  const cacheKey = `${locale}:${normalizedWord}`;
  const cached = readDictionaryCache(storage)[cacheKey]?.value;
  if (cached) return { ...cached, cached: true, licenseUrl: cached.licenseUrl ?? edition.licenseUrl };

  let parsed;
  if (locale === "en") {
    try {
      parsed = await lookupStructuredDictionaryWord({
        edition,
        fetchImpl,
        locale,
        normalizedWord,
        signal,
      });
    } catch (error) {
      if (error?.name === "AbortError" || error?.code === "offline") throw error;
    }
  }
  parsed ??= await lookupParsedDictionaryWord({
    edition,
    fetchImpl,
    locale,
    normalizedWord,
    signal,
  });

  const value = {
    definitions: parsed.definitions,
    licenseUrl: edition.licenseUrl,
    locale,
    partOfSpeech: parsed.partOfSpeech,
    pronunciation: parsed.pronunciation ?? "",
    sourceUrl: dictionarySourceUrl(normalizedWord, locale),
    word: normalizedWord,
  };
  writeDictionaryCache(storage, cacheKey, value);
  return { ...value, cached: false };
}
