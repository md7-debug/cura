const PUBLIC_ORIGIN = "https://curareader.vercel.app";

function clean(value, maxLength) {
  return String(value ?? "").replace(/\s+/gu, " ").trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return clean(value, 500)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function passagePage(searchParams) {
  const reading = Math.max(1, Number.parseInt(searchParams.get("reading"), 10) || 1);
  const paragraph = Math.max(0, Number.parseInt(searchParams.get("paragraph"), 10) || 0);
  const lang = searchParams.get("lang") === "fr" ? "fr" : "en";
  const title = clean(searchParams.get("title"), 120) || "A passage in Cura Reader";
  const author = clean(searchParams.get("author"), 80);
  const work = clean(searchParams.get("work"), 120);
  const quote = clean(searchParams.get("quote"), 240);
  const target = new URL("/", PUBLIC_ORIGIN);
  target.searchParams.set("reading", String(reading));
  target.searchParams.set("focus", "reading");
  target.searchParams.set("paragraph", String(paragraph));
  const cardTitle = author ? `${title} — ${author}` : title;
  const description = quote ? `“${quote}”` : "Read, notice, and return in Cura Reader.";
  const image = `${PUBLIC_ORIGIN}/assets/cura-social-card.png`;

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(cardTitle)} | Cura Reader</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Cura Reader">
  <meta property="og:title" content="${escapeHtml(cardTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(target)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Cura Reader — Read. Notice. Return.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(cardTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(target)}">
</head>
<body>
  <p><a href="${escapeHtml(target)}">Read “${escapeHtml(title)}” in Cura Reader</a></p>
  <p>${escapeHtml(work)}</p>
</body>
</html>`;
}

export default function handler(request, response) {
  const url = new URL(request.url, PUBLIC_ORIGIN);
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  response.status(200).send(passagePage(url.searchParams));
}
