import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "src/content/publicEmersonSelfReliance.generated.js");
const cachePath = resolve(projectRoot, ".cache/emerson-self-reliance");
const tessdataPath = resolve(cachePath, "tessdata");
mkdirSync(tessdataPath, { recursive: true });

const englishUrl = "https://www.gutenberg.org/cache/epub/2944/pg2944-images.html";
const frenchSourceUrl = "https://gallica.bnf.fr/ark:/12148/bpt6k272222p";
const frenchPageRange = Array.from({ length: 38 }, (_, index) => 55 + index);

async function download(url, destination) {
  if (existsSync(destination)) return readFileSync(destination);
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": "Cura/1.0 (open-source reading edition)" } });
      if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);
      const value = Buffer.from(await response.arrayBuffer());
      writeFileSync(destination, value);
      return value;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 750));
    }
  }
  throw lastError;
}

function pandoc(value, from, to = "plain") {
  return execFileSync("pandoc", ["-f", from, "-t", to, "--wrap=none"], {
    encoding: "utf8",
    input: value,
    maxBuffer: 16 * 1024 * 1024,
  });
}

function blocks(value) {
  return value
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function englishText(html) {
  const markdown = pandoc(html, "html", "gfm");
  const heading = "## SELF-RELIANCE";
  const start = markdown.lastIndexOf(heading);
  const end = markdown.indexOf("## COMPENSATION", start + heading.length);
  if (start < 0 || end < 0) throw new Error("English Self-Reliance boundaries missing");
  const text = blocks(pandoc(markdown.slice(start + heading.length, end), "gfm"))
    .filter((block) => block.toUpperCase() !== "SELF-RELIANCE");
  if (text.join(" ").length < 10_000) throw new Error("English Self-Reliance text is too short");
  return text;
}

function cleanFrenchPage(value) {
  return value
    .replace(/\r/g, "")
    .replace(/^\s*\d+\s+PHILOSOPH.*AM[ÉE]RIC.*$/gimu, "")
    .replace(/^\s*(?:CONFIANCE|COYFIANCE).*SO[IL].*\d+\s*$/gimu, "")
    .replace(/^\s*\d+\s*$/gmu, "")
    .replace(/([A-Za-zÀ-ÖØ-öø-ÿ])-[ \t]*\n([a-zà-öø-ÿ])/gu, "$1$2")
    .replace(/([A-Za-zÀ-ÖØ-öø-ÿ])-[ \t]*\n([A-ZÀ-ÖØ-Þ])/gu, "$1-$2")
    .replace(/(?<!\n)\n(?!\n)/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function correctFrenchOcr(value) {
  const corrections = [
    [/\b1l\b/gu, "Il"],
    [/\b1ls\b/gu, "Ils"],
    [/\bI\]\b/gu, "Il"],
    [/\bJa\b/gu, "la"],
    [/\bct\b/gu, "et"],
    [/\bCest\b/gu, "C’est"],
    [/\bIlne\b/gu, "Il ne"],
    [/\bIlomettra\b/gu, "Il omettra"],
    [/\bancicnne\b/gu, "ancienne"],
    [/\banriens\b/gu, "anciens"],
    [/\bcelte\b/gu, "cette"],
    [/\bJe lisaïs\b/gu, "Je lisais"],
    [/\bvecu\b/gu, "vécu"],
    [/\bFLETCIIER\b/gu, "FLETCHER"],
    [/\bfau-Con\b/gu, "faucon"],
    [/\bel ses\b/gu, "et ses"],
    [/\bfortque\b/gu, "fort que"],
    [/\bloujours\b/gu, "toujours"],
    [/\baprès loi\b/gu, "après toi"],
    [/\bdom ne\b/gu, "domine"],
    [/\blurmère\b/gu, "lumière"],
    [/\bmfluenre\b/gu, "influence"],
    [/\bfatahte\b/gu, "fatalité"],
    [/\bn’aruve\b/gu, "n’arrive"],
    [/\bren pour elle\b/gu, "rien pour elle"],
    [/\bon trop tard\b/gu, "ou trop tard"],
  ];
  return corrections.reduce((corrected, [pattern, replacement]) => (
    corrected.replace(pattern, replacement)
  ), value);
}

function isFrenchEditorialNote(block) {
  return /^(?:[1!#?*t‘]\s|Tout ce paragraphe rappelle|L'original porte|Le texte porte|Ces idées pourront paraître|Belle pensée et bien digne|Charmantes lignes|Voilà le côté faible|Dollar, monnaie)/iu.test(block);
}

function assembleFrenchBlocks(value) {
  const assembled = [];
  for (const originalBlock of blocks(value)) {
    const block = originalBlock.replace(/^CONFIANCE.*?SO[IL]\.\s+\S{1,3}\)\s*/iu, "");
    if (/^(?:\d+\s+PHILOSOPH|CONFIANCE.*SOI.*[\d)])/iu.test(block)) continue;
    if (isFrenchEditorialNote(block)) continue;
    if (block.length <= 12) {
      if (/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’.,;:!? -]*[.!?]$/u.test(block) && assembled.length > 0) {
        assembled[assembled.length - 1] += ` ${block}`;
      }
      continue;
    }
    if (assembled.length > 0 && !/[.!?…;:][”’"']?$/u.test(assembled.at(-1))) {
      assembled[assembled.length - 1] += ` ${block}`;
      continue;
    }
    assembled.push(block);
  }
  return assembled;
}

async function frenchText() {
  const trainedDataPath = resolve(tessdataPath, "fra.traineddata");
  await download(
    "https://github.com/tesseract-ocr/tessdata_fast/raw/main/fra.traineddata",
    trainedDataPath,
  );

  const pages = [];
  for (const page of frenchPageRange) {
    const imagePath = resolve(cachePath, `gallica-f${page}.jpg`);
    const ocrPath = resolve(cachePath, `gallica-f${page}.txt`);
    await download(
      `https://gallica.bnf.fr/iiif/ark:/12148/bpt6k272222p/f${page}/full/2000,/0/native.jpg`,
      imagePath,
    );
    const ocr = existsSync(ocrPath)
      ? readFileSync(ocrPath, "utf8")
      : execFileSync(
          "tesseract",
          [imagePath, "stdout", "-l", "fra", "--psm", "3"],
          {
            encoding: "utf8",
            env: { ...process.env, TESSDATA_PREFIX: tessdataPath },
            maxBuffer: 4 * 1024 * 1024,
          },
        );
    if (!existsSync(ocrPath)) writeFileSync(ocrPath, ocr);
    pages.push(cleanFrenchPage(ocr));
    console.log(`Read French page ${page - 54} of 38`);
  }

  pages[0] = pages[0].replace(/^.*?CONFIANCE EN SO[L1]\.\s*/su, "");
  const text = assembleFrenchBlocks(correctFrenchOcr(pages.join("\n\n")));
  if (text.join(" ").length < 10_000) throw new Error("French Self-Reliance text is too short");
  return text;
}

const englishHtmlPath = resolve(cachePath, "self-reliance-en.html");
const englishHtml = (await download(englishUrl, englishHtmlPath)).toString("utf8");
const record = {
  essay: 13,
  collection: { en: "Essays: First Series", fr: "Essais de philosophie américaine" },
  code: { en: "ESSAY II", fr: "ESSAI I" },
  sources: { en: englishUrl, fr: frenchSourceUrl },
  titles: { en: "Self-Reliance", fr: "Confiance en soi" },
  en: { text: englishText(englishHtml) },
  fr: { text: await frenchText() },
};

const banner = `// Generated from public-domain Project Gutenberg and Gallica editions.\n// Run: node scripts/fetch-emerson-self-reliance.mjs\n\n`;
writeFileSync(outputPath, `${banner}export const publicEmersonSelfReliance = ${JSON.stringify(record, null, 2)};\n`);
console.log(`Wrote Self-Reliance to ${outputPath}`);
