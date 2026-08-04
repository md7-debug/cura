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

function measuredWidth(measureText, text) {
  const measurement = measureText(text);
  const width = typeof measurement === "number" ? measurement : measurement?.width;
  return Number.isFinite(width) ? width : 0;
}

function wrapMeasuredLines(text, maxWidth, measureText) {
  const words = text.split(" ").filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measuredWidth(measureText, candidate) > maxWidth) {
      lines.push(current);
      current = word;
      return;
    }
    current = candidate;
  });

  if (current) lines.push(current);
  return lines;
}

export function paginateMeasuredParagraphEntries(paragraphs, {
  lineHeight,
  maxWidth,
  measureText,
  pageHeight,
  paragraphGap = 0,
}) {
  if (typeof measureText !== "function") throw new TypeError("measureText must be a function");

  const resolvedLineHeight = Math.max(1, Number(lineHeight) || 1);
  const resolvedMaxWidth = Math.max(1, Number(maxWidth) || 1);
  const resolvedPageHeight = Math.max(resolvedLineHeight, Number(pageHeight) || resolvedLineHeight);
  const resolvedParagraphGap = Math.max(0, Number(paragraphGap) || 0);
  const normalized = paragraphs
    .map((paragraph, paragraphIndex) => ({ paragraphIndex, text: normalizeParagraph(paragraph) }))
    .filter((entry) => entry.text);

  if (!normalized.length) return [[]];

  const pages = [];
  let currentPage = [];
  let usedHeight = 0;

  function finishPage() {
    if (currentPage.length) pages.push(currentPage);
    currentPage = [];
    usedHeight = 0;
  }

  normalized.forEach((entry) => {
    const lines = wrapMeasuredLines(entry.text, resolvedMaxWidth, measureText);
    let firstLine = true;

    lines.forEach((line) => {
      const gap = firstLine && currentPage.length ? resolvedParagraphGap : 0;
      if (currentPage.length && usedHeight + gap + resolvedLineHeight > resolvedPageHeight) {
        finishPage();
      }

      if (firstLine && currentPage.length) usedHeight += resolvedParagraphGap;
      const lastEntry = currentPage[currentPage.length - 1];
      if (lastEntry?.paragraphIndex === entry.paragraphIndex) {
        lastEntry.text += ` ${line}`;
      } else {
        currentPage.push({ paragraphIndex: entry.paragraphIndex, text: line });
      }
      usedHeight += resolvedLineHeight;
      firstLine = false;
    });
  });

  finishPage();
  return pages.length ? pages : [[]];
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
