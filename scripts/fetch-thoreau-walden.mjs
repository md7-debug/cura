#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cachePath = resolve(projectRoot, ".cache/thoreau-walden");
const outputPath = resolve(projectRoot, "src/content/publicWalden.generated.js");
mkdirSync(cachePath, { recursive: true });

const chapters = [
  ["Economy", "Économie", "Economy", "1"],
  ["Where I Lived, and What I Lived for", "Où je vécus, et ce pourquoi je vécus", "Where I Lived, and What I Lived for", "2"],
  ["Reading", "Lecture", "Reading", "3"],
  ["Sounds", "Bruits", "Sounds", "4"],
  ["Solitude", "Solitude", "Solitude", "5"],
  ["Visitors", "Visiteurs", "Visitors", "6"],
  ["The Bean-Field", "Le champ de haricots", "The Bean-Field", "7"],
  ["The Village", "Le village", "The Village", "8"],
  ["The Ponds", "Les étangs", "The Ponds", "9"],
  ["Baker Farm", "La ferme Baker", "Baker Farm", "10"],
  ["Higher Laws", "Considérations plus hautes", "Higher Laws", "11"],
  ["Brute Neighbors", "Voisins inférieurs", "Brute Neighbors", "12"],
  ["House-Warming", "Pendaison de crémaillère", "House-Warming", "13"],
  ["Former Inhabitants; and Winter Visitors", "Premiers habitants et visiteurs d’hiver", "Former Inhabitants; and Winter Visitors", "14"],
  ["Winter Animals", "Animaux d’hiver", "Winter Animals", "15"],
  ["The Pond in Winter", "L’étang en hiver", "The Pond in Winter", "16"],
  ["Spring", "Le printemps", "Spring", "17"],
  ["Conclusion", "Conclusion", "Conclusion", "18"],
];

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
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 3_000));
      return value;
    } catch (error) {
      lastError = error;
      if (attempt < 5) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 5_000));
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

function clean(value) {
  return value
    .replace(/[\u200B\u00AD]/gu, "")
    .replace(/\^\(\[[^\]]+\]\)/gu, "")
    .replace(/\^\(([^)]+)\)/gu, "$1")
    .replace(/\s+/gu, " ")
    .trim();
}

function blocks(value) {
  return value
    .replace(/\r/gu, "")
    .split(/\n\s*\n/gu)
    .map(clean)
    .filter(Boolean);
}

function comparable(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[^A-Za-z0-9]+/gu, "")
    .toLocaleLowerCase("en-US");
}

function extractBody(html, title, page) {
  const sourceBlocks = blocks(pandoc(html));
  const target = comparable(title);
  let heading = -1;
  for (const [index, block] of sourceBlocks.entries()) {
    if (comparable(block) === target) heading = index;
  }
  if (heading < 0) throw new Error(`Heading missing for ${page}: ${title}`);
  const end = sourceBlocks.findIndex((block, index) => (
    index > heading && /^(?:\d+\.\s*↑|NOTES?|Notes?|Footnotes|Récupérée de|Catégories)/u.test(block)
  ));
  const text = sourceBlocks.slice(heading + 1, end >= 0 ? end : undefined)
    .filter((block) => !/^[-—–]+$/u.test(block) && !/^\+-{5}/u.test(block));
  if (text.join(" ").length < 1_000) throw new Error(`Walden chapter too short: ${page}`);
  return text;
}

async function wikisourcePage(site, page, cacheKey, title) {
  const query = new URLSearchParams({
    action: "parse",
    format: "json",
    page,
    prop: "text",
  });
  const payload = JSON.parse(await download(`${site}/w/api.php?${query}`, `${cacheKey}.json`));
  return extractBody(payload.parse.text["*"], title, page);
}

function pageUrl(site, page) {
  return `${site}/wiki/${page.replaceAll(" ", "_")}`;
}

const records = [];
for (const [index, [enTitle, frTitle, enPageTitle, frPageNumber]] of chapters.entries()) {
  const enPage = `Walden (1854) Thoreau/${enPageTitle}`;
  const frPage = `Walden ou la vie dans les bois/Fabulet/${frPageNumber}`;
  records.push({
    number: 501 + index,
    chapter: index + 1,
    code: { en: `CHAPTER ${index + 1}`, fr: `CHAPITRE ${index + 1}` },
    sources: {
      en: pageUrl("https://en.wikisource.org", enPage),
      fr: pageUrl("https://fr.wikisource.org", frPage),
    },
    titles: { en: enTitle, fr: frTitle },
    en: {
      text: await wikisourcePage(
        "https://en.wikisource.org",
        enPage,
        `en-${index + 1}`,
        enTitle,
      ),
    },
    fr: {
      text: await wikisourcePage(
        "https://fr.wikisource.org",
        frPage,
        `fr-${index + 1}`,
        frTitle,
      ),
    },
  });
  console.log(`Fetched Walden chapter ${index + 1}: ${enTitle}`);
}

const banner = "// Generated from the exact public-domain editions recorded in ATTRIBUTIONS.md.\n// Run: node scripts/fetch-thoreau-walden.mjs\n\n";
writeFileSync(
  outputPath,
  `${banner}export const publicWalden = ${JSON.stringify(records, null, 2)};\n`,
);
console.log(`Wrote ${records.length} Walden readings to ${outputPath}`);
