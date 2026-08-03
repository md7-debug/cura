const MAX_QUOTE_LENGTH = 180;
const MAX_PREVIEW_LENGTH = 240;
const PUBLIC_ORIGIN = "https://curareader.vercel.app";

function compactText(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function shortenQuote(value) {
  const quote = compactText(value);
  if (quote.length <= MAX_QUOTE_LENGTH) return quote;
  return `${quote.slice(0, MAX_QUOTE_LENGTH - 1).trimEnd()}…`;
}

export function createPassageShare({
  author,
  locale = "en",
  paragraphIndex = 0,
  quote,
  readingNumber,
  sourceUrl,
  title,
  work,
}) {
  const passage = compactText(quote);
  const attribution = [compactText(author), compactText(work)].filter(Boolean).join(", ");
  const text = `“${passage}”\n\n— ${attribution}\n#CuraReading`;
  const xText = `“${shortenQuote(passage)}”\n\n— ${attribution}\n#CuraReading`;
  const shareUrl = new URL("/api/passage", PUBLIC_ORIGIN);
  shareUrl.searchParams.set("reading", String(readingNumber));
  shareUrl.searchParams.set("paragraph", String(Math.max(0, paragraphIndex)));
  shareUrl.searchParams.set("lang", locale === "fr" ? "fr" : "en");
  shareUrl.searchParams.set("title", compactText(title));
  shareUrl.searchParams.set("author", compactText(author));
  shareUrl.searchParams.set("work", compactText(work));
  shareUrl.searchParams.set("quote", passage.slice(0, MAX_PREVIEW_LENGTH));

  return {
    attribution,
    clipboardText: `${text}\n\nRead in Cura Reader: ${shareUrl}\nSource: ${sourceUrl}`,
    quote: passage,
    sourceUrl,
    text,
    title: compactText(title) || compactText(work) || "Cura Reader",
    url: shareUrl.toString(),
    work: compactText(work),
    xText,
  };
}

export function createXShareUrl(share) {
  const url = new URL("https://x.com/intent/post");
  url.searchParams.set("text", share.xText);
  url.searchParams.set("url", share.url);
  return url.toString();
}
