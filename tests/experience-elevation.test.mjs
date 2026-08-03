import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

test("production metadata describes canonical and rich social previews", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /rel="canonical" href="https:\/\/curareader\.vercel\.app\/"/);
  assert.match(html, /name="application-name" content="Cura Reader"/);
  assert.match(html, /property="og:site_name" content="Cura Reader"/);
  assert.match(html, /property="og:title" content="Cura Reader \| The practice of return"/);
  assert.match(html, /property="og:image" content="https:\/\/curareader\.vercel\.app\/assets\/cura-social-card\.png"/);
  assert.match(html, /name="twitter:image:alt" content="Cura Reader — Read\. Notice\. Return\."/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /rel="manifest"/);
});

test("Cura publishes its source and original assets under explicit licences", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const contentLicense = await readFile(new URL("../CONTENT-LICENSE.md", import.meta.url), "utf8");
  const license = await readFile(new URL("../LICENSE", import.meta.url), "utf8");
  const notice = await readFile(new URL("../NOTICE", import.meta.url), "utf8");
  const packageManifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.equal(packageManifest.license, "AGPL-3.0-only");
  assert.match(license, /GNU AFFERO GENERAL PUBLIC LICENSE/);
  assert.match(license, /Version 3, 19 November 2007/);
  assert.match(notice, /Copyright © 2026 Max Ducroisy/);
  assert.match(contentLicense, /cover artwork, and closing memento painting are licensed under/);
  assert.match(app, /className="footer-license"/);
  assert.match(app, /rel="license noreferrer"/);
});

test("offline support is installable and registered only for production", async () => {
  const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  const main = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
  const worker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.name, "Cura Reader — The practice of return");
  assert.equal(manifest.short_name, "Cura Reader");
  assert.equal(manifest.start_url, "./");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  assert.match(main, /import\.meta\.env\.PROD/);
  assert.match(main, /serviceWorker\.register/);
  assert.match(worker, /request\.mode === "navigate"/);
  assert.match(worker, /\.\/readings\/1\.json/);
});

test("the social preview image is shipped with public assets", async () => {
  await access(new URL("../public/assets/cura-social-card.png", import.meta.url));
});

test("the closing memento ships as Cura's text-originated painting", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const copy = await readFile(new URL("../src/i18n/copy.js", import.meta.url), "utf8");
  const attributions = await readFile(new URL("../ATTRIBUTIONS.md", import.meta.url), "utf8");

  await access(new URL("../public/assets/closing-memento.png", import.meta.url));
  assert.match(app, /assets\/closing-memento\.png/);
  assert.match(copy, /extinguished candle, an opened blank letter, a split pomegranate/);
  assert.match(copy, /bougie éteinte, une lettre blanche ouverte, une grenade fendue/);
  assert.match(attributions, /closing memento painting was generated specifically for Cura from a text-only design brief/);
  assert.doesNotMatch(`${copy}\n${attributions}`, /pale tulip|old skull|wooden hourglass|user-supplied composition reference/i);
});

test("the timer uses Cura's deferred procedural hourglass instead of legacy image assets", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const deferredScene = await readFile(new URL("../src/components/DeferredCuraHourglass.jsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../src/components/CuraHourglassScene.jsx", import.meta.url), "utf8");
  const worker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  const attributions = await readFile(new URL("../ATTRIBUTIONS.md", import.meta.url), "utf8");

  assert.match(app, /<DeferredCuraHourglass/);
  assert.match(app, /\.focus-reading-timer, \.session-instrument, \.timer-dock\.is-inline, \.closing-memento, footer/);
  assert.match(app, /obscured \? " is-obscured"/);
  assert.match(app, /inert=\{obscured \|\| undefined\}/);
  assert.match(deferredScene, /lazy\(\(\) => import\("\.\/CuraHourglassScene\.jsx"\)\)/);
  assert.match(deferredScene, /IntersectionObserver/);
  assert.match(scene, /new THREE\.ExtrudeGeometry/);
  assert.match(scene, /new THREE\.LatheGeometry/);
  assert.match(scene, /new THREE\.Points/);
  assert.match(scene, /stream\.scale\.y/);
  assert.doesNotMatch(`${app}\n${worker}`, /hourglass-(?:light|dark)\.png/);
  assert.match(attributions, /original Cura Three\.js model/);
  await assert.rejects(access(new URL("../public/assets/hourglass-light.png", import.meta.url)));
  await assert.rejects(access(new URL("../public/assets/hourglass-dark.png", import.meta.url)));
});

test("the service worker returns the cached shell for an offline navigation", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  const listeners = new Map();
  const entries = new Map();
  const cache = {
    add: async (request) => {
      const key = typeof request === "string" ? request : request.url;
      entries.set(key, new Response("cached shell", { status: 200 }));
    },
    match: async (request) => {
      const key = typeof request === "string" ? request : request.url;
      return entries.get(key);
    },
    put: async (request, response) => {
      const key = typeof request === "string" ? request : request.url;
      entries.set(key, response.clone());
    },
  };
  const context = {
    caches: {
      delete: async () => true,
      keys: async () => [],
      open: async () => cache,
    },
    fetch: async () => new Response(
      'cached shell<script type="module" src="./assets/app.js"></script>',
      { status: 200 },
    ),
    Promise,
    Response,
    self: {
      addEventListener: (name, listener) => listeners.set(name, listener),
      clients: { claim: async () => {} },
      location: { origin: "https://cura.test" },
      registration: { scope: "https://cura.test/" },
      skipWaiting: async () => {},
    },
    URL,
  };

  vm.runInNewContext(source, context);

  let installWork;
  listeners.get("install")({ waitUntil: (work) => { installWork = work; } });
  await installWork;
  assert.ok(entries.has("https://cura.test/assets/app.js"));
  context.fetch = async () => { throw new Error("offline"); };

  let navigationResponse;
  listeners.get("fetch")({
    request: { method: "GET", mode: "navigate", url: "https://cura.test/?reading=1" },
    respondWith: (response) => { navigationResponse = response; },
  });

  const response = await navigationResponse;
  assert.match(await response.text(), /^cached shell/);
});
