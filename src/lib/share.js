const MAX_QUOTE_LENGTH = 180;

function compactText(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function shortenQuote(value) {
  const quote = compactText(value);
  if (quote.length <= MAX_QUOTE_LENGTH) return quote;
  return `${quote.slice(0, MAX_QUOTE_LENGTH - 1).trimEnd()}…`;
}

export function createPassageShare({ author, quote, sourceUrl, title, work }) {
  const passage = compactText(quote);
  const attribution = [compactText(author), compactText(work)].filter(Boolean).join(", ");
  const text = `“${passage}”\n\n— ${attribution}\n#CuraReading`;
  const xText = `“${shortenQuote(passage)}”\n\n— ${attribution}\n#CuraReading`;

  return {
    clipboardText: `${text}\n${sourceUrl}`,
    text,
    title: compactText(title) || compactText(work) || "Cura",
    url: sourceUrl,
    xText,
  };
}

export function createXShareUrl(share) {
  const url = new URL("https://x.com/intent/post");
  url.searchParams.set("text", share.xText);
  url.searchParams.set("url", share.url);
  return url.toString();
}
