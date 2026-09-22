#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cachePath = resolve(projectRoot, ".cache/seneca-dialogues");
const outputPath = resolve(projectRoot, "src/content/publicSenecaDialogues.generated.js");
mkdirSync(cachePath, { recursive: true });

const englishDialoguesUrl = "https://www.gutenberg.org/cache/epub/64576/pg64576-images.html";
const englishBenefitsUrl = "https://www.gutenberg.org/cache/epub/3794/pg3794-images.html";

const frenchPages = {
  shortness: "De la brièveté de la vie/Traduction Baillard",
  peace: "De la Tranquillité de l’âme (trad. Baillard)",
  happy: "De la Vie heureuse (trad. Baillard)",
  providence: "De la Providence (trad. Baillard)",
  anger1: "De la colère (trad. Baillard, 1860)/Livre premier",
  anger2: "De la colère (trad. Baillard, 1860)/Livre deuxième",
  anger3: "De la colère (trad. Baillard, 1860)/Livre troisième",
  benefits1: "Des bienfaits/1",
  benefits2: "Des bienfaits/2",
  benefits3: "Des bienfaits/3",
  benefits4: "Des bienfaits/4",
  benefits5: "Des bienfaits/5",
  benefits6: "Des bienfaits/6",
  benefits7: "Des bienfaits/7",
};

const dialogueMarkers = {
  first: "THE FIRST BOOK OF THE DIALOGUES",
  second: "THE SECOND BOOK OF THE DIALOGUES",
  third: "THE THIRD BOOK OF THE DIALOGUES",
  fourth: "THE FOURTH BOOK OF THE DIALOGUES",
  fifth: "THE FIFTH BOOK OF THE DIALOGUES",
  sixth: "THE SIXTH BOOK OF THE DIALOGUES",
  seventh: "THE SEVENTH BOOK OF THE DIALOGUES",
  eighth: "THE EIGHTH BOOK OF THE DIALOGUES",
  ninth: "THE NINTH BOOK OF THE DIALOGUES",
  tenth: "THE TENTH BOOK OF THE DIALOGUES",
  eleventh: "THE ELEVENTH BOOK OF THE DIALOGUES",
};

async function download(url, cacheKey) {
  const destination = resolve(cachePath, cacheKey);
  if (existsSync(destination)) return readFileSync(destination, "utf8");

  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Cura/1.0 (open-source reading edition)" },
      });
      if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);
      const value = await response.text();
      writeFileSync(destination, value);
      return value;
    } catch (error) {
      lastError = error;
      if (attempt < 5) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1_000));
      }
    }
  }
  throw lastError;
}

function pandoc(html) {
  const withoutPageNumbers = html
    .replace(/<span[^>]*class="[^"]*pagenum[^"]*"[^>]*>[\s\S]*?<\/span>/giu, "")
    .replace(/<span[^>]*id="p\d+"[^>]*>[\s\S]*?<\/span>/giu, "");
  return execFileSync("pandoc", ["-f", "html", "-t", "plain", "--wrap=none"], {
    encoding: "utf8",
    input: withoutPageNumbers,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function cleanBlock(value) {
  return value
    .replace(/[\u200B\u00AD]/gu, "")
    .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/gu, "")
    .replace(/\^\(\[[^\]]+\]\)/gu, "")
    .replace(/\^\(([^)]+)\)/gu, "$1")
    .replace(/\[Footnote:[\s\S]*?\]/giu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function blocks(value) {
  return value
    .replace(/\r/gu, "")
    .split(/\n\s*\n/gu)
    .map(cleanBlock)
    .filter(Boolean);
}

function section(sourceBlocks, startMarker, endMarker) {
  const start = sourceBlocks.findIndex((block) => block.startsWith(startMarker));
  const end = sourceBlocks.findIndex((block, index) => index > start && block.startsWith(endMarker));
  if (start < 0 || end < 0) throw new Error(`Missing English boundary: ${startMarker}`);

  const body = sourceBlocks.slice(start + 1, end);
  const notes = body.findIndex((block) => /^\[\d+\]/u.test(block));
  const text = (notes >= 0 ? body.slice(0, notes) : body)
    .filter((block) => !/^[-—–]+$/u.test(block));
  if (text.join(" ").length < 1_000) throw new Error(`English section too short: ${startMarker}`);
  return text;
}

function benefitsSection(sourceBlocks, book, nextBook) {
  const startMarker = `BOOK ${book}.`;
  const start = sourceBlocks.findIndex((block) => block === startMarker);
  const end = nextBook
    ? sourceBlocks.findIndex((block, index) => index > start && block === `BOOK ${nextBook}.`)
    : sourceBlocks.findIndex((block, index) => index > start && /END OF (?:THE )?PROJECT GUTENBERG/iu.test(block));
  if (start < 0 || end < 0) throw new Error(`Missing On Benefits boundary: ${startMarker}`);
  const text = sourceBlocks.slice(start + 1, end).filter((block) => !/^[-—–]+$/u.test(block));
  if (text.join(" ").length < 4_000) throw new Error(`On Benefits book ${book} is too short`);
  return text;
}

async function wiksourceText(page, cacheKey) {
  const query = new URLSearchParams({
    action: "parse",
    format: "json",
    page,
    prop: "text",
  });
  const payload = JSON.parse(await download(
    `https://fr.wikisource.org/w/api.php?${query}`,
    `${cacheKey}.json`,
  ));
  const sourceBlocks = blocks(pandoc(payload.parse.text["*"]));
  const start = sourceBlocks.findIndex((block) => /^I\.\s/u.test(block));
  if (start < 0) throw new Error(`French body start missing: ${page}`);
  const endCandidates = [
    sourceBlocks.findIndex((block, index) => (
      index > start && /^(?:\d+\.\s*↑|NOTES?|Notes?|Footnotes|Récupérée de|Catégories)/u.test(block)
    )),
    sourceBlocks.findIndex((block, index) => (
      index > start && /^LIVRE\s+[IVX]+\.$/u.test(block)
    )),
  ].filter((index) => index >= 0);
  const end = endCandidates.length > 0 ? Math.min(...endCandidates) : sourceBlocks.length;
  const text = sourceBlocks.slice(start, end)
    .filter((block) => (
      !/^[-—–]+$/u.test(block) && !/^\+-{5}/u.test(block) && !/^FIN (?:DU|DES)/u.test(block)
    ));
  if (text.join(" ").length < 1_000) throw new Error(`French section too short: ${page}`);
  return text;
}

function frenchUrl(page) {
  return `https://fr.wikisource.org/wiki/${page.replaceAll(" ", "_")}`;
}

const dialogueHtml = await download(englishDialoguesUrl, "minor-dialogues.html");
const benefitsHtml = await download(englishBenefitsUrl, "benefits.html");
const dialogueBlocks = blocks(pandoc(dialogueHtml));
const benefitBlocks = blocks(pandoc(benefitsHtml));

const records = [
  {
    number: 401,
    slug: "shortness-life",
    work: { en: "On the Shortness of Life", fr: "De la brièveté de la vie" },
    code: { en: "DIALOGUE · X", fr: "DIALOGUE · X" },
    sources: { en: englishDialoguesUrl, fr: frenchUrl(frenchPages.shortness) },
    titles: { en: "On the Shortness of Life", fr: "De la brièveté de la vie" },
    en: { text: section(dialogueBlocks, dialogueMarkers.tenth, dialogueMarkers.eleventh) },
    fr: { text: await wiksourceText(frenchPages.shortness, "shortness-fr") },
  },
  {
    number: 402,
    slug: "peace-mind",
    work: { en: "Of Peace of Mind", fr: "De la tranquillité de l’âme" },
    code: { en: "DIALOGUE · IX", fr: "DIALOGUE · IX" },
    sources: { en: englishDialoguesUrl, fr: frenchUrl(frenchPages.peace) },
    titles: { en: "Of Peace of Mind", fr: "De la tranquillité de l’âme" },
    en: { text: section(dialogueBlocks, dialogueMarkers.ninth, dialogueMarkers.tenth) },
    fr: { text: await wiksourceText(frenchPages.peace, "peace-fr") },
  },
  {
    number: 403,
    slug: "happy-life",
    work: { en: "Of a Happy Life", fr: "De la vie heureuse" },
    code: { en: "DIALOGUE · VII", fr: "DIALOGUE · VII" },
    sources: { en: englishDialoguesUrl, fr: frenchUrl(frenchPages.happy) },
    titles: { en: "Of a Happy Life", fr: "De la vie heureuse" },
    en: { text: section(dialogueBlocks, dialogueMarkers.seventh, dialogueMarkers.eighth) },
    fr: { text: await wiksourceText(frenchPages.happy, "happy-fr") },
  },
  {
    number: 404,
    slug: "providence",
    work: { en: "Of Providence", fr: "De la Providence" },
    code: { en: "DIALOGUE · I", fr: "DIALOGUE · I" },
    sources: { en: englishDialoguesUrl, fr: frenchUrl(frenchPages.providence) },
    titles: { en: "Of Providence", fr: "De la Providence" },
    en: { text: section(dialogueBlocks, dialogueMarkers.first, dialogueMarkers.second) },
    fr: { text: await wiksourceText(frenchPages.providence, "providence-fr") },
  },
];

for (const [index, [start, end]] of [
  [dialogueMarkers.third, dialogueMarkers.fourth],
  [dialogueMarkers.fourth, dialogueMarkers.fifth],
  [dialogueMarkers.fifth, dialogueMarkers.sixth],
].entries()) {
  const book = index + 1;
  const page = frenchPages[`anger${book}`];
  records.push({
    number: 405 + index,
    slug: `anger-${book}`,
    work: { en: "Of Anger", fr: "De la colère" },
    code: { en: `BOOK ${book}`, fr: `LIVRE ${book}` },
    sources: { en: englishDialoguesUrl, fr: frenchUrl(page) },
    titles: { en: `Book ${book}`, fr: `Livre ${book}` },
    en: { text: section(dialogueBlocks, start, end) },
    fr: { text: await wiksourceText(page, `anger-${book}-fr`) },
  });
}

const romanBooks = ["I", "II", "III", "IV", "V", "VI", "VII"];
for (const [index, roman] of romanBooks.entries()) {
  const book = index + 1;
  const page = frenchPages[`benefits${book}`];
  records.push({
    number: 408 + index,
    slug: `benefits-${book}`,
    work: { en: "On Benefits", fr: "Des bienfaits" },
    code: { en: `BOOK ${book}`, fr: `LIVRE ${book}` },
    sources: { en: englishBenefitsUrl, fr: frenchUrl(page) },
    titles: { en: `Book ${book}`, fr: `Livre ${book}` },
    en: { text: benefitsSection(benefitBlocks, roman, romanBooks[index + 1]) },
    fr: { text: await wiksourceText(page, `benefits-${book}-fr`) },
  });
}

const banner = "// Generated from the exact public-domain editions recorded in ATTRIBUTIONS.md.\n// Run: node scripts/fetch-seneca-dialogues.mjs\n\n";
writeFileSync(
  outputPath,
  `${banner}export const publicSenecaDialogues = ${JSON.stringify(records, null, 2)};\n`,
);
console.log(`Wrote ${records.length} Seneca readings to ${outputPath}`);
