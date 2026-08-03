#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) continue;
    const key = argument.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    values[key] = value;
    index += 1;
  }
  return values;
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function publicFile(repo, publicPath) {
  return path.join(repo, "public", publicPath.replace(/^\/+/, ""));
}

function usage() {
  return [
    "Usage:",
    "  node audit-cura-work.mjs --repo /path/to/cura --author-id ID --work-en \"Work title\"",
  ].join("\n");
}

let argumentsByName;
try {
  argumentsByName = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(`FAIL arguments: ${error.message}`);
  console.error(usage());
  process.exit(2);
}

const repo = path.resolve(argumentsByName.repo ?? process.cwd());
const authorId = argumentsByName["author-id"];
const workEn = argumentsByName["work-en"];

if (!authorId || !workEn) {
  console.error("FAIL arguments: --author-id and --work-en are required.");
  console.error(usage());
  process.exit(2);
}

const failures = [];
const warnings = [];
const passes = [];

function check(condition, label, detail = "") {
  if (condition) {
    passes.push(label);
  } else {
    failures.push(detail ? `${label}: ${detail}` : label);
  }
}

function warn(condition, label) {
  if (!condition) warnings.push(label);
}

async function importRepoModule(relativePath) {
  const absolutePath = path.join(repo, relativePath);
  check(existsSync(absolutePath), `module exists: ${relativePath}`);
  if (!existsSync(absolutePath)) return null;
  const url = pathToFileURL(absolutePath);
  url.searchParams.set("audit", String(Date.now()));
  return import(url.href);
}

const readingsModule = await importRepoModule("src/content/readings.js");
const collectionsModule = await importRepoModule("src/content/libraryCollections.js");
const queueModule = await importRepoModule("src/content/publicDomainQueue.js");

if (!readingsModule || !collectionsModule || !queueModule) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join("\n"));
  process.exit(1);
}

const { readings } = readingsModule;
const { libraryCollections } = collectionsModule;
const { requestedVoices } = queueModule;
const selected = readings.filter((reading) => (
  reading.authorId === authorId && reading.work?.en === workEn
));

check(selected.length > 0, "exact work exists", `${authorId} / ${workEn}`);

const allNumbers = readings.map((reading) => reading.number);
check(
  allNumbers.every((number) => Number.isInteger(number) && number > 0),
  "all reading IDs are positive integers",
);
check(new Set(allNumbers).size === allNumbers.length, "all reading IDs are globally unique");

const matchingCollections = libraryCollections.filter((collection) => (
  collection.authorId === authorId && selected.some(collection.matches)
));
check(
  matchingCollections.length === 1,
  "exact work maps to one collection",
  `found ${matchingCollections.length}`,
);

for (const reading of selected) {
  const prefix = `reading ${reading.number}`;
  const owners = libraryCollections.filter((collection) => collection.matches(reading));
  check(owners.length === 1, `${prefix} has exactly one collection`, `found ${owners.length}`);
  check(reading.authorId === authorId, `${prefix} authorId matches`);
  check(hasText(reading.author), `${prefix} has an author name`);
  check(hasText(reading.work?.en) && hasText(reading.work?.fr), `${prefix} has bilingual work titles`);
  check(hasText(reading.sources?.en) && /^https:\/\//u.test(reading.sources.en), `${prefix} has an HTTPS English source`);
  check(hasText(reading.sources?.fr) && /^https:\/\//u.test(reading.sources.fr), `${prefix} has an HTTPS French source`);

  for (const locale of ["en", "fr"]) {
    const content = reading[locale];
    const localePrefix = `${prefix} ${locale}`;
    check(Boolean(content), `${localePrefix} content exists`);
    if (!content) continue;
    check(hasText(content.title), `${localePrefix} has a title`);
    check(hasText(content.preview), `${localePrefix} has a preview`);
    check(hasText(content.translationNote), `${localePrefix} has an edition or translation note`);
    check(Array.isArray(content.text) && content.text.length > 0, `${localePrefix} has paragraphs`);
    check(
      Array.isArray(content.text) && content.text.every(hasText),
      `${localePrefix} has no empty paragraphs`,
    );
    warn(
      Array.isArray(content.text) && content.text.join(" ").trim().length >= 250,
      `${localePrefix} is shorter than 250 characters; verify that it is an explicitly labelled excerpt`,
    );

    for (const note of content.notes ?? []) {
      check(hasText(note.id), `${localePrefix} note has an ID`);
      check(hasText(note.phrase), `${localePrefix} note has a phrase`);
      check(
        content.text.join(" ").includes(note.phrase),
        `${localePrefix} note phrase occurs in its text`,
        note.phrase,
      );
    }
  }
}

for (const collection of matchingCollections) {
  check(hasText(collection.id), "collection has an ID");
  check(hasText(collection.title?.en) && hasText(collection.title?.fr), "collection has bilingual titles");
  check(
    hasText(collection.description?.en) && hasText(collection.description?.fr),
    "collection has bilingual descriptions",
  );
  check(hasText(collection.cover), "collection has a cover path");
  if (hasText(collection.cover)) {
    check(existsSync(publicFile(repo, collection.cover)), "collection cover exists", collection.cover);
  }
  check(
    selected.every(collection.matches),
    "collection contains every reading in the exact work",
  );
}

check(
  !requestedVoices.some((candidate) => candidate.id === authorId),
  "published author is absent from the review queue",
  `${authorId} remains queued`,
);

const attributionPath = path.join(repo, "ATTRIBUTIONS.md");
check(existsSync(attributionPath), "ATTRIBUTIONS.md exists");
if (existsSync(attributionPath) && selected.length > 0) {
  const attribution = readFileSync(attributionPath, "utf8").toLocaleLowerCase("en");
  const authorName = selected[0].author.toLocaleLowerCase("en");
  check(attribution.includes(authorName), "ATTRIBUTIONS.md names the author", selected[0].author);
  check(
    attribution.includes(workEn.toLocaleLowerCase("en")),
    "ATTRIBUTIONS.md names the exact English work",
    workEn,
  );
}

for (const label of warnings) console.log(`WARN ${label}`);
for (const label of failures) console.error(`FAIL ${label}`);

console.log(`\n${passes.length} passed, ${warnings.length} warning(s), ${failures.length} failed.`);
process.exit(failures.length > 0 ? 1 : 0);
