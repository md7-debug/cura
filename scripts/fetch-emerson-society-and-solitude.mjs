import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "src/content/publicEmersonEssays.generated.js");
const cachePath = resolve(projectRoot, ".cache/emerson");
mkdirSync(cachePath, { recursive: true });

const essays = [
  { en: "Society and Solitude", fr: "Société et Solitude", slug: "Soci%C3%A9t%C3%A9_et_Solitude" },
  { en: "Civilization", fr: "La Civilisation", slug: "La_Civilisation" },
  { en: "Art", fr: "L’Art", slug: "L%E2%80%99Art" },
  { en: "Eloquence", fr: "L’Éloquence", slug: "L%E2%80%99%C3%89loquence" },
  { en: "Domestic Life", fr: "La Vie domestique", slug: "La_Vie_domestique" },
  { en: "Farming", fr: "De la Chose rustique", slug: "De_la_chose_rustique" },
  { en: "Works and Days", fr: "Les Travaux et les Jours", slug: "Les_Travaux_et_les_Jours" },
  { en: "Books", fr: "Les Livres", slug: "Les_Livres" },
  { en: "Clubs", fr: "Les Clubs", slug: "Les_Clubs" },
  { en: "Courage", fr: "Le Courage", slug: "Le_Courage" },
  { en: "Success", fr: "Le Succès", slug: "Le_Succ%C3%A8s" },
  { en: "Old Age", fr: "La Vieillesse", slug: "La_Vieillesse" },
];

async function download(url, cacheKey) {
  const cachedPath = resolve(cachePath, `${cacheKey}.txt`);
  if (existsSync(cachedPath)) return readFileSync(cachedPath, "utf8");
  const response = await fetch(url, { headers: { "User-Agent": "Cura/1.0 (open-source reading edition)" } });
  if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);
  const value = await response.text();
  writeFileSync(cachedPath, value);
  return value;
}

function pandoc(value, from, to = "plain") {
  return execFileSync("pandoc", ["-f", from, "-t", to, "--wrap=none"], {
    encoding: "utf8",
    input: value,
    maxBuffer: 16 * 1024 * 1024,
  });
}

function clean(value) {
  return value
    .replace(/[\u200B\u00AD]/g, "")
    .replace(/\^\([^)]*\)/g, "")
    .replace(/\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function blocks(value) {
  return value
    .split(/\n\s*\n/)
    .map(clean)
    .filter((block) => block && !/^\d+$/.test(block) && !/^-{8,}$/.test(block));
}

function englishSections(html) {
  const markdown = pandoc(html, "html", "gfm");
  return essays.map((essay, index) => {
    const heading = `## ${essay.en.toUpperCase()}.`;
    const nextHeading = index < essays.length - 1
      ? `## ${essays[index + 1].en.toUpperCase()}.`
      : "## FOOTNOTES:";
    const start = markdown.indexOf(heading);
    const end = markdown.indexOf(nextHeading, start + heading.length);
    if (start < 0 || end < 0) throw new Error(`English boundaries missing for ${essay.en}`);
    const plain = pandoc(markdown.slice(start + heading.length, end), "gfm");
    const text = blocks(plain).filter((block) => block.toUpperCase() !== `${essay.en.toUpperCase()}.`);
    if (text.join(" ").length < 1000) throw new Error(`English text too short for ${essay.en}`);
    return text;
  });
}

function frenchSection(plain, title) {
  const normalized = plain.replace(/\r/g, "");
  const heading = title.toLocaleUpperCase("fr-FR");
  const lines = normalized.split("\n");
  const headingIndex = lines.findLastIndex((line) => clean(line).toLocaleUpperCase("fr-FR") === heading);
  if (headingIndex < 0) throw new Error(`French heading missing for ${title}`);
  const afterHeading = lines.slice(headingIndex + 1).join("\n");
  const footnotes = afterHeading.search(/\n1\.\s+↑/);
  const retrieved = afterHeading.indexOf("\nRécupérée de ");
  const candidates = [footnotes, retrieved].filter((index) => index >= 0);
  if (candidates.length === 0) throw new Error(`French ending missing for ${title}`);
  const text = blocks(afterHeading.slice(0, Math.min(...candidates)))
    .filter((block) => block !== "[]" && !/^\s*--/.test(block));
  if (text.join(" ").length < 1000) throw new Error(`French text too short for ${title}`);
  return text;
}

const englishUrl = "https://www.gutenberg.org/cache/epub/69258/pg69258-images.html";
const englishHtml = await download(englishUrl, "society-and-solitude-en");
const english = englishSections(englishHtml);

const records = [];
for (const [index, essay] of essays.entries()) {
  const frenchUrl = `https://fr.wikisource.org/wiki/Soci%C3%A9t%C3%A9_et_Solitude/${essay.slug}`;
  const frenchHtml = await download(`${frenchUrl}?printable=yes`, `fr-${index + 1}`);
  const french = frenchSection(pandoc(frenchHtml, "html"), essay.fr);
  records.push({
    essay: index + 1,
    sources: { en: englishUrl, fr: frenchUrl },
    titles: { en: essay.en, fr: essay.fr },
    en: { text: english[index] },
    fr: { text: french },
  });
  console.log(`Fetched ${essay.en}`);
}

const banner = `// Generated from public-domain Project Gutenberg and Wikisource editions.\n// Run: node scripts/fetch-emerson-society-and-solitude.mjs\n\n`;
writeFileSync(outputPath, `${banner}export const publicEmersonEssays = ${JSON.stringify(records, null, 2)};\n`);
console.log(`Wrote ${records.length} essays to ${outputPath}`);
