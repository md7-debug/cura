---
name: cura-add-public-domain-work
description: Add, import, replace, review, or publish a bilingual public-domain work in Cura Reader without drifting its content model, rights record, editorial design, responsive book experience, local-first behavior, or release quality. Use for author/work intake, edition or translation changes, cover additions, catalogue maintenance, publication-queue changes, and audits of an existing Cura collection.
---

# Add a public-domain work to Cura Reader

Treat publication as a gated editorial release. Do not infer that a text is reusable merely because its author is old or an online copy is accessible.

## Establish the repository contract

1. Read the repository `AGENTS.md`, `DESIGN_CONTRACT.md`, `CONTRIBUTING.md`, `README.md`, and `ATTRIBUTIONS.md` before editing.
2. Read [references/repository-map.md](references/repository-map.md) before choosing files.
3. Read and complete [references/legal-review.md](references/legal-review.md) before accepting any text, translation, edition, scan, transcription, or artwork.
4. Read [references/review-gates.md](references/review-gates.md) before accepting content or declaring completion.
5. Inspect the current data shapes, neighbouring covers, interaction patterns, tests, and uncommitted work. Preserve unrelated changes.

## Gate 1: clear rights for an exact edition

Create an evidence record for each proposed work using [references/intake-record-template.md](references/intake-record-template.md). Record:

- canonical author name and death year;
- exact original title, original language, and first-publication date;
- exact English edition, translator or editor, their death year, publication date, source URL, and reuse basis;
- exact French edition, translator or editor, their death year, publication date, source URL, and reuse basis;
- target publication jurisdictions, including the United Kingdom;
- separate status for introductions, annotations, footnotes, transcription, scan, cover image, and any other included material.

Verify all claims against authoritative catalogues, source-library records, and official copyright guidance. Treat author age as triage only. Copyright can subsist separately in a translation, edition, typographical arrangement, annotation, scan, or posthumously published text.

Because Cura is publicly accessible without geographic restriction, clear at least the United Kingdom, European Union source country, United States, and every other jurisdiction deliberately targeted by the release. Do not claim that a work is public domain worldwide. Record the law or official guidance used, the calculation, the evidence URL, and the access date for each jurisdiction.

Stop publication when any included layer is unclear. Keep the item outside the published corpus and label it as an exact-edition review. Do not use `public domain`, `cleared`, `copyright free`, or equivalent wording for a merely probable candidate. Automated checks support the record but never constitute legal clearance. Escalate contradictory evidence, orphan works, unpublished material, foreign restoration questions, and any non-standard licence to qualified counsel.

## Gate 2: ingest complete bilingual content

1. Allocate stable, non-colliding numeric reading IDs. Never renumber a published reading.
2. Add the source module under `src/content/` and compose it into `src/content/readings.js`.
3. Supply `author`, `authorId`, localized `work`, localized `code` where applicable, and direct HTTPS `sources.en` and `sources.fr` on every reading.
4. Supply complete localized `title`, `preview`, `text`, and `translationNote` fields. Keep paragraphs ordered and stable because bookmarks, annotations, sharing, and reading position use them as anchors.
5. Keep source text distinct from Cura-authored prompts, notes, guides, and translations. Record the applicable licence for every Cura-authored layer.
6. Add localized reflective fields and contextual notes only when they are accurate, useful, and complete in both languages.
7. Run `npm run content:runtime`. Never hand-edit `src/content/readingCatalog.generated.js` or `public/readings/*.json`.

Do not publish a partial work as though it were complete. Name excerpts and selections explicitly in both languages.

## Gate 3: integrate the collection once

1. Add one Author -> Work entry to `src/content/libraryCollections.js` with stable IDs, localized title and description, an original Cura cover, cover colour, and an exact `matches` predicate.
2. Add or update the author summary in the full and lightweight catalogues through their existing shared source where possible. Avoid duplicating manually maintained metadata.
3. Remove a candidate from `src/content/publicDomainQueue.js` only after the exact published work and both displayed editions pass the rights gate.
4. Confirm the existing Author -> Work -> Text selectors expose the work without author-specific buttons or a new route.
5. Confirm title search finds every text by title, number, and displayed reading code.

Run the deterministic audit before visual work:

```bash
node /Users/maxducroisy/.codex/skills/cura-add-public-domain-work/scripts/audit-cura-work.mjs \
  --repo /absolute/path/to/cura \
  --author-id AUTHOR_ID \
  --work-en "EXACT ENGLISH WORK TITLE"
```

Fix every failure. Treat warnings as review items, not automatic permission to ignore them.

## Gate 4: make the work native to Cura

Use Cura's existing editorial system, not a theme made for the new author:

- warm textured paper, ink, one vermilion structural accent, and generous negative space;
- Cormorant Garamond for editorial text, Inter for controls, and Allura only for the established signature accents;
- thin outlined action capsules, detached chevrons, circular close controls, hairlines, and square editorial index frames;
- original meaningful cover art with a distinct silhouette, palette, spine, and motif from adjacent books;
- calm spatial motion that explains selection, opening, page turning, and return.

Check the work in the 3D shelf, static fallback, opening handoff, scroll reader, book reader, focus reader, writing archive, passage preview, and footer-level return paths. The reading must remain primary after the shelf transition settles.

On desktop, preserve the physical two-page spread where supported. On mobile, preserve the book's material identity and turn cadence while using one legible page when two pages would reduce the reading measure. Do not shrink the desktop spread into illegibility.

Respect `prefers-reduced-motion`. Keep every state change and navigation outcome when motion is shortened or skipped.

## Gate 5: preserve the full reader journey

Exercise the new reading through:

1. Today or Library -> selected work -> opening transition -> exact text.
2. Author -> Work -> Text changes with browser history and Back restoration.
3. Scroll <-> Book at the nearest stable paragraph.
4. EN <-> FR without losing the reading or saved place.
5. Focus entry and exit with fixed CURA home, close, language, Notes, and Aa controls.
6. Bookmark, highlight, Define for one word, Keep, typed note, freehand note, and Highlights return.
7. Reply, private local save, writing archive, side-by-side source and letter, export, import, print, and Obsidian fallback.
8. Passage sharing with only public source text, attribution, Cura return link, and `#CuraReading`; never include a private note or reply.
9. Offline shell and an already-opened reading. A first-time uncached reading may fail offline but must fail clearly.
10. Escape, visible close controls, CURA home, and browser Back from every immersive or temporary surface.

## Gate 6: update durable records

Update:

- `ATTRIBUTIONS.md` with exact editions, translators, source URLs, dates, reuse basis, and separate original Cura material;
- `README.md` with the honest collection scope and counts;
- `AGENTS.md` only for durable product decisions or patterns future contributors must preserve;
- `DESIGN_CONTRACT.md` when the established product or interaction contract changes;
- `CONTRIBUTING.md` when the repeatable editorial process changes;
- tests and localized copy whenever visible behavior or claims change.

Do not describe a work as complete, bilingual, or public domain unless the repository evidence and rendered product support that claim.

## Gate 7: validate in three passes

### Syntax and build

Run the audit script, `npm run content:runtime`, the relevant syntax check, and `npm run build`.

### Tests

Run focused content, collection, storage, export, sharing, asset, metadata, and route tests. Then run `npm test`. Run `npm run test:sites` when build output, routing, metadata, hosting, service-worker behavior, or handoff can be affected.

### Review

Inspect the diff and rendered app at minimum:

- `1440 x 900` and `390 x 844`;
- widths around `900px` and `720px` breakpoints;
- English and French;
- warm and dark themes plus clear, night, and e-ink reader modes where relevant;
- keyboard, visible focus, one-press Escape, browser Back, 200% zoom, and reduced motion;
- console errors, failed requests, cover loading, layout overflow, and mobile browser chrome.

Do not commit `dist/`, `tmp/`, `output/`, screenshots, QA captures, or machine-specific files.

## Report the release gate

Return a concise table or checklist with these headings: Rights, Content, Collection, Visual, Interaction, Accessibility, Documentation, Tests, Release. Mark each `PASS` or `BLOCKED`, attach evidence, and name any unresolved exact-edition question.

Commit or push only when explicitly requested. When pushing `main`, verify `https://curareader.vercel.app` returns HTTP 200 and exercise Today -> reading, Library -> opening -> reading, browser Back, both themes, the CURA header, favicon, and mobile layout.
