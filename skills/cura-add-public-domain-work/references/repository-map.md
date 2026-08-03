# Cura public-domain work repository map

Use this map to edit the smallest coherent set of files. Confirm the paths still exist before relying on them.

## Editorial sources

- `src/content/readings.js`: canonical composition of the complete source corpus. Add a work module here.
- `src/content/letters.js`, `src/content/marcus.js`, `src/content/emerson.js`, and related generated modules: current examples of content modules and imports.
- `src/content/publicDomainQueue.js`: single visible queue of candidates awaiting exact-edition clearance. A queue entry is not a rights claim.
- `src/content/libraryCollections.js`: Author -> Work collection metadata, cover assignment, localized descriptions, and exact reading membership.
- `src/content/catalog.js`: lightweight runtime catalogue entry point. Avoid duplicating data that can be derived.
- `src/content/readingLoader.js`: on-demand full-reading loader.

## Generated outputs

- `src/content/readingCatalog.generated.js`: lightweight generated catalogue. Never hand-edit.
- `public/readings/{number}.json`: generated complete readings. Never hand-edit.
- `scripts/prepare-reading-data.mjs`: generates both outputs from `src/content/readings.js`.

Run `npm run content:runtime` after source changes and include legitimate generated changes in the same release.

## Visual and interaction integration

- `public/assets/covers/`: durable original collection covers.
- `src/components/LibraryShelf.jsx`: shelf loading and selection.
- `src/components/WritingArchive.jsx`: personal editions and source/letter book spread.
- `src/App.jsx`: routes, selectors, reading, focus, writing, notes, sharing, and return paths.
- `src/styles.css`: canonical responsive editorial system and interaction geometry.
- `src/i18n/copy.js`: visible English and French interface copy.
- `src/lib/share.js`: safe public passage payload and return link.
- `public/sw.js`: offline shell and opened-reading caching.

Reuse existing components and shared geometry. Do not create author-specific reader controls.

## Rights and product records

- `ATTRIBUTIONS.md`: exact text, translation, transcription, artwork, library, and interaction-source records.
- `README.md`: public collection scope, counts, product name, licence, and release claims.
- `AGENTS.md`: durable Cura product and engineering contract.
- `DESIGN_CONTRACT.md`: detailed interaction and visual contract.
- `CONTRIBUTING.md`: contributor-facing editorial and validation process.
- `LICENSE`: repository software licence. Do not confuse it with source-text or asset licences.

## Tests and release

- `tests/content.test.mjs`: corpus integrity, bilingual structure, and queue policy.
- `tests/library-collections.test.mjs`: collection membership and cover metadata.
- `tests/metadata.test.mjs`, `tests/assets.test.mjs`, `tests/license.test.mjs`: public output and rights metadata.
- `tests/storage.test.mjs`, export tests, share tests, and writing-book tests: local continuity and portability.
- `tests/sites-worker.test.mjs`: built Sites handoff and route behavior.
- `vercel.json`, `.openai/hosting.json`, `worker/index.js`, and `scripts/prepare-sites-build.mjs`: production and Sites build contracts.

Use `rg --files tests` to locate newly added focused coverage. Keep tests behavior-focused rather than snapshotting large generated payloads.
