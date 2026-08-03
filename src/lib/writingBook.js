const DEFAULT_PAGE_CHARACTER_LIMIT = 1050;

function normalizeParagraph(paragraph) {
  return String(paragraph ?? "").replace(/\s+/g, " ").trim();
}

function splitLongParagraph(paragraph, limit) {
  if (paragraph.length <= limit) return [paragraph];
  const words = paragraph.split(" ");
  const parts = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= limit || !current) {
      current = candidate;
      return;
    }
    parts.push(current);
    current = word;
  });

  if (current) parts.push(current);
  return parts;
}

export function plainReplyParagraphs(markdown) {
  const text = String(markdown ?? "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`]/g, "")
    .trim();

  return text
    .split(/\n\s*\n/)
    .map(normalizeParagraph)
    .filter(Boolean);
}

export function paginateParagraphs(paragraphs, characterLimit = DEFAULT_PAGE_CHARACTER_LIMIT) {
  return paginateParagraphEntries(paragraphs, characterLimit)
    .map((page) => page.map((entry) => entry.text));
}

export function paginateParagraphEntries(paragraphs, characterLimit = DEFAULT_PAGE_CHARACTER_LIMIT) {
  const limit = Math.max(320, Number(characterLimit) || DEFAULT_PAGE_CHARACTER_LIMIT);
  const normalized = paragraphs
    .map((paragraph, paragraphIndex) => ({ paragraphIndex, text: normalizeParagraph(paragraph) }))
    .filter((entry) => entry.text)
    .flatMap((entry) => splitLongParagraph(entry.text, Math.floor(limit * 0.86))
      .map((text) => ({ paragraphIndex: entry.paragraphIndex, text })));

  if (!normalized.length) return [[]];

  const pages = [];
  let current = [];
  let currentLength = 0;

  normalized.forEach((entry) => {
    const separatorLength = current.length ? 2 : 0;
    if (current.length && currentLength + separatorLength + entry.text.length > limit) {
      pages.push(current);
      current = [];
      currentLength = 0;
    }
    current.push(entry);
    currentLength += (current.length > 1 ? 2 : 0) + entry.text.length;
  });

  if (current.length) pages.push(current);
  return pages;
}

export function spreadIndexForParagraph(pages, paragraphIndex, pagesPerSpread = 2) {
  const pageIndex = pages.findIndex((page) => (
    page.some((entry) => entry.paragraphIndex === paragraphIndex)
  ));
  return Math.max(0, Math.floor(Math.max(0, pageIndex) / Math.max(1, pagesPerSpread)));
}

export function pairedSpreadCount(sourcePages, replyPages) {
  return Math.max(1, sourcePages.length, replyPages.length);
}

export function clampSpreadIndex(index, count) {
  return Math.min(Math.max(0, Number(index) || 0), Math.max(0, count - 1));
}
