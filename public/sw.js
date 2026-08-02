const CACHE_PREFIX = "cura-reading";
const CACHE_NAME = `${CACHE_PREFIX}-v1`;
const CORE_PATHS = [
  "./manifest.webmanifest",
  "./assets/cura-favicon.png",
  "./assets/cura-apple-touch-icon.png",
  "./assets/cura-mark.png",
  "./assets/paper-texture.png",
  "./assets/hourglass-light.png",
  "./assets/hourglass-dark.png",
  "./readings/1.json",
];

function scopedUrl(path) {
  return new URL(path, self.registration.scope).toString();
}

async function cacheResponse(cache, request, response) {
  if (response?.ok) await cache.put(request, response.clone());
  return response;
}

async function cacheAppShell(cache) {
  const shellUrl = scopedUrl("./");
  const response = await fetch(shellUrl, { cache: "reload" });
  if (!response.ok) return;
  await cache.put(shellUrl, response.clone());
  const html = await response.text();
  const assetUrls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map(([, path]) => new URL(path, shellUrl))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => url.toString());
  await Promise.allSettled([...new Set(assetUrls)].map((url) => cache.add(url)));
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled([
      cacheAppShell(cache),
      ...CORE_PATHS.map((path) => cache.add(scopedUrl(path))),
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        return cacheResponse(cache, scopedUrl("./"), response);
      } catch {
        return (await cache.match(request))
          ?? (await cache.match(scopedUrl("./")))
          ?? Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      return cacheResponse(cache, request, response);
    } catch {
      return Response.error();
    }
  })());
});
