import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "src/content/publicLetters.generated.js");
const cachePath = resolve(projectRoot, ".cache/wikisource");
mkdirSync(cachePath, { recursive: true });

function toRoman(number) {
  const numerals = [
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = number;
  let result = "";
  numerals.forEach(([value, numeral]) => {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  });
  return result;
}

async function downloadPlainText(url, cacheKey) {
  const cachedPath = resolve(cachePath, `${cacheKey}.txt`);
  if (existsSync(cachedPath)) return readFileSync(cachedPath, "utf8");
  let response;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    response = await fetch(`${url}?printable=yes`, {
      headers: { "User-Agent": "Cura-Seneca/1.0 (open-source reading edition)" },
    });
    if (response.ok) break;
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : attempt * 2000;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, delay));
  }
  if (!response?.ok) throw new Error(`Could not download ${url}: ${response?.status}`);
  const html = await response.text();
  const plain = execFileSync("pandoc", ["-f", "html", "-t", "plain", "--wrap=none"], {
    encoding: "utf8",
    input: html,
    maxBuffer: 12 * 1024 * 1024,
  });
  writeFileSync(cachedPath, plain);
  return plain;
}

function cleanParagraph(value) {
  return value
    .replace(/[\u200B\u00AD]/g, "")
    .replace(/\^\(\d+\.\)\s*/g, "")
    .replace(/\^\(\[?\d+\]?\)/g, "")
    .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  const minor = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "nor", "of", "on", "or", "the", "to", "via"]);
  return value
    .replace(/\^\(\[?\d+\]?\)/g, "")
    .replace(/\bTlme\b/g, "Time")
    .replace(/\.$/, "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index, words) => {
      if (index > 0 && index < words.length - 1 && minor.has(word)) return word;
      return word.replace(/^[a-z]/, (letter) => letter.toUpperCase());
    })
    .join(" ");
}

function bodyBlocks(lines, startIndex) {
  const body = lines.slice(startIndex);
  const endIndex = body.findIndex((line) => (
    /^-{20,}$/.test(line.trim())
    || /^LETTRE [IVXLCDM]+\.$/i.test(line.trim())
    || /^Récupérée de /i.test(line.trim())
    || /^Catégories\s*:/i.test(line.trim().replace(/\u202f/g, " "))
  ));
  const main = endIndex >= 0 ? body.slice(0, endIndex) : body;
  return main
    .join("\n")
    .split(/\n\s*\n/)
    .map(cleanParagraph)
    .filter((paragraph) => (
      paragraph
      && paragraph !== "[]"
      && paragraph !== " "
      && !/^Greetings from Seneca to his friend Lucilius\.?$/i.test(paragraph)
    ));
}

function extractEnglish(plain, number) {
  const lines = plain.replace(/\r/g, "").split("\n");
  const marker = `${toRoman(number)}.`;
  let headingIndex = lines.findIndex((line) => line.trim().startsWith(`${marker} `));
  if (headingIndex < 0) {
    const bodyIndex = lines.findIndex((line) => /^\^\(1\.\)/.test(line.trim()));
    for (let index = bodyIndex - 1; index >= 0; index -= 1) {
      const candidate = lines[index].trim();
      if (candidate && candidate !== "​") {
        headingIndex = index;
        break;
      }
    }
  }
  if (headingIndex < 0) throw new Error(`English heading missing for Letter ${number}`);
  const rawHeading = lines[headingIndex].trim();
  const heading = rawHeading.startsWith(`${marker} `)
    ? rawHeading.slice(marker.length).trim()
    : rawHeading.replace(/\^\(\[?\d+\]?\)/g, "").trim();
  return {
    title: titleCase(heading),
    text: bodyBlocks(lines, headingIndex + 1),
  };
}

function extractFrench(plain, number) {
  const lines = plain.replace(/\r/g, "").split("\n");
  const marker = `LETTRE ${toRoman(number)}.`;
  const headingIndex = lines.findIndex((line) => line.trim().toUpperCase() === marker);
  if (headingIndex < 0) throw new Error(`French heading missing for Letter ${number}`);
  const titleIndex = lines.findIndex((line, index) => index > headingIndex && line.trim());
  if (titleIndex < 0) throw new Error(`French title missing for Letter ${number}`);
  return {
    title: lines[titleIndex].trim().replace(/\.$/, ""),
    text: bodyBlocks(lines, titleIndex + 1),
  };
}

const letters = [];
for (let start = 1; start <= 124; start += 3) {
  const numbers = Array.from({ length: Math.min(3, 125 - start) }, (_, index) => start + index);
  const batch = await Promise.all(numbers.map(async (number) => {
    const englishUrl = `https://en.wikisource.org/wiki/Moral_letters_to_Lucilius/Letter_${number}`;
    const frenchUrl = `https://fr.wikisource.org/wiki/Lettres_%C3%A0_Lucilius/Lettre_${number}`;
    const [englishPlain, frenchPlain] = await Promise.all([
      downloadPlainText(englishUrl, `en-${number}`),
      downloadPlainText(frenchUrl, `fr-${number}`),
    ]);
    return {
      number,
      sources: { en: englishUrl, fr: frenchUrl },
      en: extractEnglish(englishPlain, number),
      fr: extractFrench(frenchPlain, number),
    };
  }));
  letters.push(...batch);
  console.log(`Fetched letters ${numbers[0]} to ${numbers.at(-1)}`);
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 350));
}

const banner = `// Generated from public-domain Wikisource editions.\n// Run: node scripts/fetch-wikisource-letters.mjs\n\n`;
writeFileSync(outputPath, `${banner}export const publicLetters = ${JSON.stringify(letters, null, 2)};\n`);
console.log(`Wrote ${letters.length} letters to ${outputPath}`);
