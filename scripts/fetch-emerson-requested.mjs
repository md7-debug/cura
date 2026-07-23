#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cachePath = resolve(projectRoot, ".cache/emerson-requested");
const outputPath = resolve(projectRoot, "src/content/publicEmersonRequested.generated.js");
mkdirSync(cachePath, { recursive: true });

const editions = {
  first: "https://www.gutenberg.org/cache/epub/2944/pg2944-images.html",
  second: "https://www.gutenberg.org/cache/epub/2945/pg2945-images.html",
  nature: "https://www.gutenberg.org/cache/epub/29433/pg29433-images.html",
  selected: "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html",
  conduct: "https://www.gutenberg.org/cache/epub/39827/pg39827-images.html",
  poems: "https://www.gutenberg.org/files/12843/12843-h/12843-h.htm",
};

async function download(name, url) {
  const destination = resolve(cachePath, `${name}.html`);
  if (existsSync(destination)) return readFileSync(destination, "utf8");
  const response = await fetch(url, {
    headers: { "User-Agent": "Cura/1.0 (open-source reading edition)" },
  });
  if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);
  const html = await response.text();
  writeFileSync(destination, html);
  return html;
}

function markdown(html) {
  return execFileSync("pandoc", ["-f", "html", "-t", "gfm", "--wrap=none"], {
    encoding: "utf8",
    input: html,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function section(value, startMarker, endMarker, useLastStart = false) {
  const start = useLastStart ? value.lastIndexOf(startMarker) : value.indexOf(startMarker);
  const end = value.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`Missing section boundary: ${startMarker}`);
  return value.slice(start + startMarker.length, end);
}

function paragraphs(value) {
  return value
    .replace(/<div[\s\S]*?<\/div>/giu, "")
    .replace(/<span[^>]*><\/span>/giu, "")
    .replace(/<a[^>]*>(.*?)<\/a>/giu, "$1")
    .replace(/<[^>]+>/gu, "")
    .replace(/\[\^?\d+\]/gu, "")
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => block
      .replace(/^#{1,6}\s+/u, "")
      .replace(/^>\s?/gmu, "")
      .replace(/```/gu, "")
      .replace(/\\$/gmu, " ")
      .replace(/\*\*/gu, "")
      .replace(/(?<!\*)\*(?!\*)/gu, "")
      .replace(/\s+/gu, " ")
      .trim())
    .filter((block) => (
      block.length > 1
      && !/^\*+$/u.test(block)
      && !/^\[?\d+\]?$/u.test(block)
      && !/^(?:CONTENTS|ESSAYS?,? (?:FIRST|SECOND) SERIES|THE FULL PROJECT GUTENBERG)/iu.test(block)
    ));
}

const source = {};
for (const [name, url] of Object.entries(editions)) {
  source[name] = markdown(await download(name, url));
}

const firstSections = [
  ["history", "History", "Histoire", "## HISTORY", "## SELF-RELIANCE", "ESSAY I"],
  ["compensation", "Compensation", "Compensation", "## COMPENSATION", "## SPIRITUAL LAWS", "ESSAY III"],
  ["over-soul", "The Over-Soul", "L’Âme suprême", "## THE OVER-SOUL", "## CIRCLES", "ESSAY IX"],
  ["circles", "Circles", "Cercles", "## CIRCLES", "## INTELLECT", "ESSAY X"],
].map(([slug, title, frenchTitle, start, end, code]) => ({
  slug,
  code,
  collection: "Essays: First Series",
  frenchCollection: "Essais : première série",
  title,
  frenchTitle,
  source: editions.first,
  text: paragraphs(section(source.first, start, end)),
}));

const secondSections = [
  ["poet", "The Poet", "Le Poète", "## I. THE POET.", "## II. EXPERIENCE.", "ESSAY I"],
  ["experience", "Experience", "Expérience", "## II. EXPERIENCE.", "## III. CHARACTER.", "ESSAY II"],
  ["politics", "Politics", "Politique", "## VII. POLITICS.", "## VIII. NONIMALIST AND REALIST.", "ESSAY VII"],
  ["new-england-reformers", "New England Reformers", "Les Réformateurs de la Nouvelle-Angleterre", "## NEW ENGLAND REFORMERS.", "## THE FULL PROJECT GUTENBERG", "ESSAY IX"],
].map(([slug, title, frenchTitle, start, end, code]) => ({
  slug,
  code,
  collection: "Essays: Second Series",
  frenchCollection: "Essais : seconde série",
  title,
  frenchTitle,
  source: editions.second,
  text: paragraphs(section(source.second, start, end)),
}));

const americanScholarStart = source.selected.indexOf("## <span id=\"THE_AMERICAN_SCHOLAR\"");
const americanScholarEnd = source.selected.indexOf("## <span id=\"COMPENSATION\"", americanScholarStart);
if (americanScholarStart < 0 || americanScholarEnd < 0) throw new Error("American Scholar boundaries missing");

const fateStart = source.conduct.lastIndexOf("\nFATE.\n");
const fateEnd = source.conduct.indexOf("\nII\\.\n", fateStart);
if (fateStart < 0 || fateEnd < 0) throw new Error("Fate boundaries missing");

const requested = [
  {
    slug: "nature-1836",
    code: "BOOK · 1836",
    collection: "Nature (1836)",
    frenchCollection: "Nature (1836)",
    title: "Nature",
    frenchTitle: "Nature",
    source: editions.nature,
    text: paragraphs(section(source.nature, "INTRODUCTION.", "## THE FULL PROJECT GUTENBERG")),
  },
  ...firstSections,
  ...secondSections,
  {
    slug: "saadi",
    code: "POEM · 1864",
    collection: "Poems",
    frenchCollection: "Poèmes",
    title: "Saadi",
    frenchTitle: "Saadi",
    source: editions.poems,
    text: paragraphs(section(source.poems, "## SAADI", "## HOLIDAYS")),
  },
  {
    slug: "american-scholar",
    code: "ADDRESS · 1837",
    collection: "Addresses",
    frenchCollection: "Discours",
    title: "The American Scholar",
    frenchTitle: "Le Savant américain",
    source: editions.selected,
    text: paragraphs(source.selected.slice(americanScholarStart, americanScholarEnd)),
  },
  {
    slug: "fate",
    code: "ESSAY I",
    collection: "The Conduct of Life",
    frenchCollection: "La Conduite de la vie",
    title: "Fate",
    frenchTitle: "Le Destin",
    source: editions.conduct,
    text: paragraphs(source.conduct.slice(fateStart + "\nFATE.\n".length, fateEnd)),
  },
];

for (const reading of requested) {
  if (reading.text.join(" ").length < 800) throw new Error(`${reading.title} text is too short`);
}

const banner = "// Generated from public-domain Project Gutenberg and Wikisource editions.\n// Run: node scripts/fetch-emerson-requested.mjs\n\n";
writeFileSync(
  outputPath,
  `${banner}export const publicEmersonRequested = ${JSON.stringify(requested, null, 2)};\n`,
);
console.log(`Wrote ${requested.length} requested Emerson works to ${outputPath}`);
