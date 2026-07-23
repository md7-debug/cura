import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "src/content/publicMarcusBooks.generated.js");
const cachePath = resolve(projectRoot, ".cache/marcus-meditations");
mkdirSync(cachePath, { recursive: true });

const romanBooks = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

async function downloadPlainText(url, cacheKey) {
  const cachedPath = resolve(cachePath, `${cacheKey}.txt`);
  if (existsSync(cachedPath)) return readFileSync(cachedPath, "utf8");

  const response = await fetch(`${url}?printable=yes`, {
    headers: { "User-Agent": "Cura/1.0 (open-source reading edition)" },
  });
  if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);

  const html = await response.text();
  const plain = execFileSync("pandoc", ["-f", "html", "-t", "plain", "--wrap=none"], {
    encoding: "utf8",
    input: html,
    maxBuffer: 12 * 1024 * 1024,
  });
  writeFileSync(cachedPath, plain);
  return plain;
}

function cleanText(value) {
  return value
    .replace(/[\u200B\u00AD]/g, "")
    .replace(/\^\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .replace(/^FROM\b/, "From")
    .replace(/^BEGIN\b/, "Begin")
    .replace(/^WE\b/, "We")
    .replace(/^THAT\b/, "That")
    .replace(/^IN\b/, "In")
    .replace(/^THE\b/, "The")
    .replace(/^WHAT\b/, "What")
    .replace(/^THIS\b/, "This")
    .replace(/^HE\b/, "He")
    .replace(/^WILT\b/, "Wilt")
    .replace(/^THESE\b/, "These")
    .replace(/^([A-Z]{2,})\b/, (word) => word[0] + word.slice(1).toLowerCase())
    .trim();
}

function paragraphBlocks(value) {
  return value
    .split(/\n\s*\n/)
    .map(cleanText)
    .filter(Boolean);
}

function extractEnglish(plain, roman) {
  const normalized = plain.replace(/\r/g, "");
  const heading = `\n${roman}.\n`;
  const start = normalized.indexOf(heading);
  if (start < 0) throw new Error(`English heading missing for Book ${roman}`);
  const afterHeading = normalized.slice(start + heading.length);
  const end = afterHeading.indexOf("\nFootnotes\n");
  if (end < 0) throw new Error(`English footnotes boundary missing for Book ${roman}`);

  const blocks = paragraphBlocks(afterHeading.slice(0, end));
  const sections = [];
  for (const block of blocks) {
    const numbered = block.match(/^(\d+)\.\s*([\s\S]*)$/);
    if (numbered) {
      sections.push({ number: Number(numbered[1]), text: numbered[2] });
    } else if (sections.length === 0) {
      sections.push({ number: 1, text: block });
    } else {
      sections.at(-1).text += ` ${block}`;
    }
  }
  return sections.map(({ number, text }) => `${number}. ${cleanText(text)}`);
}

function extractFrench(plain, roman) {
  const normalized = plain.replace(/\r/g, "");
  const bookHeading = roman === "I" ? "LIVRE PREMIER" : `LIVRE ${roman}`;
  const start = normalized.indexOf(`\n${bookHeading}\n`);
  if (start < 0) throw new Error(`French heading missing for Book ${roman}`);
  const afterHeading = normalized.slice(start + bookHeading.length + 2);
  const footnotes = afterHeading.search(/\n1\.\s+↑/);
  if (footnotes < 0) throw new Error(`French footnotes boundary missing for Book ${roman}`);

  const blocks = paragraphBlocks(afterHeading.slice(0, footnotes));
  const sections = [];
  for (const block of blocks) {
    if (/^[IVXLCDM]+$/.test(block)) {
      sections.push({ number: block, text: "" });
    } else if (sections.length > 0 && !/^-{8,}$/.test(block)) {
      sections.at(-1).text += `${sections.at(-1).text ? " " : ""}${block}`;
    }
  }
  return sections
    .filter(({ text }) => text)
    .map(({ number, text }) => `${number}. ${cleanText(text)}`);
}

const books = [];
for (const roman of romanBooks) {
  const englishUrl = `https://en.wikisource.org/wiki/The_Thoughts_of_the_Emperor_Marcus_Aurelius_Antoninus/Book_${roman}`;
  const frenchUrl = `https://fr.wikisource.org/wiki/Pens%C3%A9es_pour_moi-m%C3%AAme/Livre_${roman}`;
  const [englishPlain, frenchPlain] = await Promise.all([
    downloadPlainText(englishUrl, `en-${roman}`),
    downloadPlainText(frenchUrl, `fr-${roman}`),
  ]);
  books.push({
    book: romanBooks.indexOf(roman) + 1,
    roman,
    sources: { en: englishUrl, fr: frenchUrl },
    en: { text: extractEnglish(englishPlain, roman) },
    fr: { text: extractFrench(frenchPlain, roman) },
  });
  console.log(`Fetched Book ${roman}`);
}

const banner = `// Generated from public-domain Wikisource editions.\n// Run: node scripts/fetch-marcus-meditations.mjs\n\n`;
writeFileSync(outputPath, `${banner}export const publicMarcusBooks = ${JSON.stringify(books, null, 2)};\n`);
console.log(`Wrote ${books.length} books to ${outputPath}`);
