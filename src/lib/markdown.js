function normalizeLineEndings(value) {
  return String(value ?? "").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

function isBlockStart(line) {
  return (
    /^#{1,3}\s+/.test(line)
    || /^>\s?/.test(line)
    || /^[-*+]\s+/.test(line)
    || /^\d+[.)]\s+/.test(line)
    || /^```/.test(line)
    || /^ {0,3}(?:---|___|\*\*\*)\s*$/.test(line)
  );
}

export function parseInlineMarkdown(value) {
  const source = String(value ?? "");
  const tokens = [];
  const pattern = /(\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*([^*]+)\*|_([^_]+)_)/g;
  let cursor = 0;
  let match;

  while ((match = pattern.exec(source))) {
    if (match.index > cursor) tokens.push({ type: "text", value: source.slice(cursor, match.index) });
    if (match[2] || match[3]) tokens.push({ type: "strong", value: match[2] ?? match[3] });
    else if (match[4]) tokens.push({ type: "code", value: match[4] });
    else if (match[5] && match[6]) tokens.push({ type: "link", value: match[5], href: match[6] });
    else tokens.push({ type: "emphasis", value: match[7] ?? match[8] });
    cursor = pattern.lastIndex;
  }

  if (cursor < source.length) tokens.push({ type: "text", value: source.slice(cursor) });
  return tokens.length ? tokens : [{ type: "text", value: source }];
}

export function parseMarkdown(value) {
  const lines = normalizeLineEndings(value).split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, content: heading[2] });
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", language, content: code.join("\n") });
      continue;
    }

    if (/^ {0,3}(?:---|___|\*\*\*)\s*$/.test(line)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", content: quote.join(" ") });
      continue;
    }

    const unordered = /^[-*+]\s+/.test(line);
    const ordered = /^\d+[.)]\s+/.test(line);
    if (unordered || ordered) {
      const pattern = ordered ? /^\d+[.)]\s+/ : /^[-*+]\s+/;
      const items = [];
      while (index < lines.length && pattern.test(lines[index])) {
        items.push(lines[index].replace(pattern, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", content: paragraph.join(" ") });
  }

  return blocks;
}

export function createMarkdownExport({ label, letter, title, locale, savedAt, text }) {
  const metadata = [
    "---",
    `cura: letter-${letter}`,
    `letter: ${letter}`,
    `language: ${locale}`,
    savedAt ? `saved: ${savedAt}` : null,
    "---",
  ].filter(Boolean);

  return `${metadata.join("\n")}\n\n# ${label}: ${title}\n\n${normalizeLineEndings(text).trim()}\n`;
}

export function createObsidianExport({
  annotations = {},
  author = "Seneca",
  authorTag = "seneca",
  highlights = [],
  label,
  letter,
  locale,
  original,
  reply,
  savedAt,
  sourceUrl,
  sourceName = "Wikisource",
  title,
}) {
  const date = savedAt && Number.isFinite(Date.parse(savedAt))
    ? new Date(savedAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const highlightedPassages = highlights.map((highlight) => {
    const note = annotations[`highlight:${highlight.id}`]?.text?.trim();
    return [`> ${highlight.quote}`, note || null].filter(Boolean).join("\n\n");
  });
  const generalNotes = Object.entries(annotations)
    .filter(([scope, entry]) => !scope.startsWith("highlight:") && entry?.text?.trim())
    .map(([, entry]) => entry.text.trim());
  const sections = [
    "---",
    `cura: letter-${letter}`,
    `letter: ${letter}`,
    `language: ${locale}`,
    `date: ${date}`,
    "tags:",
    "  - cura",
    `  - ${authorTag}`,
    "  - stoicism",
    `source: ${JSON.stringify(sourceUrl)}`,
    "---",
    "",
    `# ${label}: ${title}`,
    "",
    `*Source: [${sourceName}](${sourceUrl})*`,
    "",
    `## ${author}`,
    "",
    original.map((paragraph) => normalizeLineEndings(paragraph).trim()).join("\n\n"),
    "",
    "## My return",
    "",
    normalizeLineEndings(reply).trim(),
    highlightedPassages.length ? "" : null,
    highlightedPassages.length ? "## Highlights" : null,
    highlightedPassages.length ? "" : null,
    highlightedPassages.length ? highlightedPassages.join("\n\n") : null,
    generalNotes.length ? "" : null,
    generalNotes.length ? "## Notes" : null,
    generalNotes.length ? "" : null,
    generalNotes.length ? generalNotes.join("\n\n") : null,
  ].filter((line) => line !== null);

  return `${sections.join("\n").trim()}\n`;
}

export function createObsidianTemplate(locale = "en") {
  const french = locale === "fr";
  return `---
tags:
  - cura
  - reading-practice
date: {{date}}
reading:
author:
language: ${locale}
source:
---

# ${french ? "Cura | Lecture du jour" : "Cura | Today’s reading"}

## ${french ? "Texte source" : "Source text"}

${french ? "Collez ou exportez le texte source depuis Cura." : "Paste or export the source text from Cura."}

## ${french ? "Mon retour" : "My return"}

${french ? "Écrivez quelques lignes à vous-même." : "Write a few lines to yourself."}

## ${french ? "Surlignages" : "Highlights"}

## ${french ? "Notes" : "Notes"}
`;
}

export function createObsidianIndex(locale = "en") {
  const french = locale === "fr";
  return `# ${french ? "Cura | Mes retours" : "Cura | My returns"}

${french
    ? "Toutes les notes Cura conservées dans ce coffre, de la plus récente à la plus ancienne."
    : "Every Cura note kept in this vault, from the newest to the oldest."}

\`\`\`query
tag:#cura
\`\`\`
`;
}

export function readMarkdownImport(value, knownTitles = []) {
  let source = normalizeLineEndings(value).trim();
  let isCuraFile = false;

  if (source.startsWith("---\n")) {
    const end = source.indexOf("\n---\n", 4);
    if (end >= 0) {
      const metadata = source.slice(4, end).split("\n");
      isCuraFile = metadata.some((line) => /^cura: letter-\d+$/.test(line.trim()));
      if (isCuraFile) source = source.slice(end + 5).trim();
    }
  }

  const [firstLine, ...remainingLines] = source.split("\n");
  const normalizedTitle = firstLine?.replace(/^#\s+/, "").trim();
  if (
    firstLine?.startsWith("# ")
    && (isCuraFile || knownTitles.includes(normalizedTitle))
  ) {
    return remainingLines.join("\n").trim();
  }

  return source;
}

export function markdownToPlainText(value) {
  return parseMarkdown(value)
    .map((block) => {
      if (block.type === "rule") return "";
      if (block.type === "list") return block.items.map((item) => `- ${stripInlineMarkdown(item)}`).join("\n");
      return stripInlineMarkdown(block.content ?? "");
    })
    .filter(Boolean)
    .join("\n\n");
}

function stripInlineMarkdown(value) {
  return parseInlineMarkdown(value).map((token) => token.value).join("");
}
