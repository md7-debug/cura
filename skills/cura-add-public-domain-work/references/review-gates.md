# Cura publication review gates

Use this as the definition of done. A blocked rights gate blocks publication even when every engineering check passes.

## 1. Rights evidence

- [ ] The proposed item names one exact work or explicitly named excerpt.
- [ ] Original author, death year, first-publication date, and original-language title are evidenced.
- [ ] English source identifies the exact edition, translator/editor, date, source URL, and reuse basis.
- [ ] French source identifies the exact edition, translator/editor, date, source URL, and reuse basis.
- [ ] Posthumous publication, unpublished-manuscript rules, restored copyright, and target jurisdictions were considered.
- [ ] UK, relevant EU source-country, US pre-1978/renewal, and US foreign-restoration rules have documented outcomes.
- [ ] Introductions, notes, footnotes, typography, transcription, scans, and images were reviewed separately.
- [ ] Source-site terms, database rights, geographic limitations, moral rights, and licence compatibility were reviewed.
- [ ] The source permits the intended reproduction, adaptation, translation, and distribution.
- [ ] `ATTRIBUTIONS.md` says only what the evidence proves.
- [ ] Any Cura translation or guide has an explicit licence and credit.
- [ ] Every layer and jurisdiction is `PASS`; no `BLOCKED` or `COUNSEL REQUIRED` item enters the corpus.

Do not copy a modern translation merely because the underlying original is public domain. Do not treat an online library's access page as a licence by itself.

## 2. Corpus integrity

- [ ] Reading numbers are unique, stable, positive integers outside existing ranges.
- [ ] `authorId`, author name, localized work title, code, and source URLs are consistent.
- [ ] English and French titles, previews, translation notes, and complete paragraph arrays are present.
- [ ] Paragraph order and boundaries are stable enough for bookmarks, notes, sharing, and resume state.
- [ ] Quotes, punctuation, diacritics, paragraph breaks, and section numbering were checked against the named editions.
- [ ] Notes point to text actually present in the matching locale.
- [ ] Partial translations or excerpts are labelled honestly.
- [ ] Generated runtime readings and the lightweight catalogue were rebuilt, not edited manually.

## 3. Collection integrity

- [ ] One `libraryCollections` entry owns every new reading exactly once.
- [ ] The match predicate cannot absorb an adjacent work accidentally.
- [ ] Cover path, cover colour, titles, descriptions, and counts agree across full and lightweight catalogues.
- [ ] The publication queue no longer contains the published exact candidate.
- [ ] Author, Work, and Text selectors open the expected reading and update history.
- [ ] Search works by localized title, Arabic number, and displayed code.

## 4. Visual craft

- [ ] Cover artwork is original or separately cleared and recorded.
- [ ] Adjacent shelf covers differ in dominant palette, motif, spine treatment, and silhouette.
- [ ] Shelf texture, page block, open-cover motion, position line, capsule, chevrons, and close control use Cura's geometry.
- [ ] The transition settles before reading begins and reduced motion skips safely.
- [ ] Desktop book mode is a legible physical spread; mobile is a legible physical page, not a scaled-down spread.
- [ ] Scroll and Book preserve the same complete text and nearest stable place.
- [ ] Warm/dark/e-ink/clear/night contrast and cover visibility remain intentional.
- [ ] No generic cards, startup gradients, gratuitous shadows, glass panels, gamification, or ornamental drift were introduced.

## 5. Journey and local data

- [ ] Today and Library reach the work without a dead end.
- [ ] Opening, cancellation, Escape, CURA home, close, and browser Back are reliable.
- [ ] Focus mode exposes essential controls in the first mobile viewport.
- [ ] Language and display changes preserve the selected reading and place.
- [ ] Bookmarking deduplicates and persists immediately.
- [ ] Highlight, Define, Keep, typed/freehand notes, and note return work on the new paragraphs.
- [ ] Reply saves privately, appears in Your Writing, and supports source/letter reading.
- [ ] Markdown, text, JSON backup, import, print/PDF, and Obsidian fallback retain source metadata.
- [ ] Sharing includes only selected public text, attribution, source, return link, and `#CuraReading`.
- [ ] Opened readings work offline without exposing private data.

## 6. Accessibility and responsive QA

- [ ] Semantic controls, accessible names, keyboard operation, and visible focus are present.
- [ ] One Escape press closes only the top temporary surface and restores focus.
- [ ] `390 x 844`, `1440 x 900`, and widths around 720px/900px have no horizontal overflow or browser-chrome collision.
- [ ] English and French fit without truncating essential meaning.
- [ ] 200% zoom preserves navigation and reading paths.
- [ ] Reduced motion preserves state and orientation.
- [ ] Touch targets meet the established minimum and text selection is not blocked.

## 7. Engineering and release

- [ ] The audit script passes for the exact author/work.
- [ ] Content runtime generation passes.
- [ ] Focused tests pass, then `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test:sites` passes when applicable.
- [ ] The diff contains no unrelated edits, secrets, `dist/`, `tmp/`, `output/`, or QA captures.
- [ ] Browser console and network checks are clean.
- [ ] If pushed, the canonical Vercel URL returns 200 and the critical desktop/mobile paths work in production.
