# Cura Library design QA

## Comparison target

- Source visual truth:
  - `/var/folders/tm/vrrbvjtn483gyq472k30gptc0000gn/T/codex-clipboard-22b96fd6-e904-429b-a658-e76b1cf4cd49.png` — pill OPEN control with chevrons, 528 × 146 px.
  - `/var/folders/tm/vrrbvjtn483gyq472k30gptc0000gn/T/codex-clipboard-34cb9c3a-d383-4e49-9725-8f407b9b2f4f.png` — thin position marker and small instruction copy, 234 × 66 px.
  - `/var/folders/tm/vrrbvjtn483gyq472k30gptc0000gn/T/codex-clipboard-35408f4c-4d9f-423a-bd0a-ea2f370de73e.png` — circular close control, 348 × 150 px.
- Source role: control and motion references, not an exact full-page mock. Cura's established warm-paper, ink, vermilion, bilingual, and reading-first system remains authoritative for the surrounding product.
- Browser-rendered implementation:
  - `tmp/design-qa/implementation-desktop-final.png` — closed shelf.
  - `tmp/design-qa/implementation-opening-final.png` — opening transition.
  - `tmp/design-qa/implementation-mobile-final.png` — compact shelf.
- Combined comparison evidence: `tmp/design-qa/combined-comparison-final.png`.

## Capture normalization

- Desktop CSS viewport: 1440 × 900 at device scale 1. Browser capture: 1425 × 891 px after browser scrollbar/chrome exclusion.
- Compact CSS viewport: 390 × 844 at device scale 1. Browser capture: 375 × 812 px after browser scrollbar/chrome exclusion.
- Source control references were enlarged with Lanczos scaling and placed on a 1425 × 891 comparison board. The implementation captures were kept at native browser size. No density-only differences were filed as findings.
- States compared: closed selected work, opening work with circular cancel, English desktop, French desktop, and compact shelf.

## Findings

- No actionable P0, P1, or P2 findings remain.
- Typography: Cormorant Garamond retains Cura's editorial hierarchy; Inter handles small controls with restrained tracking. Long work titles now wrap within a dedicated measure without touching selectors or covers.
- Spacing and layout: the hero, selectors, work identity, books, OPEN control, position markers, and instruction line have distinct vertical bands. Desktop controls remain visible in the opening viewport. Compact layout has no document-level horizontal overflow.
- Colors and tokens: ink, warm paper, and vermilion remain consistent with Cura. The reference red and blue were treated as pattern examples rather than new product tokens.
- Image quality: five original generated clothbound covers are sharp at rendered size, consistently cropped, and free of placeholder graphics, logos, or ornamental Japanese motifs.
- Copy and content: all new interface copy is complete in English and French. OPEN leads to a real reading and does not introduce scoring, streaks, or game language.
- Icons and controls: Phosphor chevrons and close icon share a light stroke weight. The OPEN pill, thin markers, circular close control, keyboard arrows, Escape path, and reduced-motion path are present.

## Comparison history

1. P2 — The first desktop capture placed long work titles over the book row, and an adjacent volume intruded on the opened-work detail.
   - Fix: separated the closed work identity from the opening detail and moved surrounding books farther out during opening.
   - Evidence: `tmp/design-qa/implementation-desktop-v2.png` and `tmp/design-qa/implementation-opening-v2.png`.
2. P2 — Moving the work identity upward then caused it to collide with the Author and Work selectors.
   - Fix: reduced the closed state to author and work title, assigned it a dedicated band between selectors and covers, and kept the description in the opening and contents states.
   - Post-fix evidence: `tmp/design-qa/implementation-desktop-final.png`, `tmp/design-qa/implementation-opening-final.png`, and `tmp/design-qa/combined-comparison-final.png`.
3. P2 — The compact shelf initially exposed a native horizontal scrollbar, did not center the restored work, and lacked the desktop shelf's labelled region.
   - Fix: hid the native scrollbar, centered the active volume without moving the page vertically, and added the labelled region.
   - Post-fix evidence: `tmp/design-qa/implementation-mobile-final.png` and the browser DOM snapshot.

## Focused comparison

- A separate crop was not needed. The combined board preserves the desktop captures at their native 1425 px width and enlarges the small source references, so the pill outline, chevron weight, position line, tiny instruction copy, and circular close border remain directly readable in one image.

## Interaction and browser checks

- Tested: next/previous work, Author → Work selection, direct work markers, OPEN animation, automatic first-reading route, Read now fast-forward, circular close cancellation, Escape cancellation, contents filtering, reading handoff, return to Library, English/French switching, desktop and compact layouts.
- The normal Library navigation uses the redesigned shelf; `?shelf=1` remains a direct preview entry.
- Compact shelf OPEN routes directly to the first real reading and the active volume is restored on return.
- Console errors checked in the browser: none.
- Production build: passed.
- Unit and static-hosting tests: 49 passed, 0 failed.

## Follow-up polish

- No P3 item is required for handoff. If the collection grows beyond five works, reassess Three.js texture memory and shelf pagination before adding more covers.

final result: passed

## Home and navigation follow-up

### Flow evidence

1. Home arrival: `http://127.0.0.1:5173/` opens on the asymmetric “Read. Notice. Return.” introduction with a real selected-work cover, capsule action, and Library path. Health: passed.
2. Home to reading: Begin reading removes the introduction, opens the selected text, and writes `?reading={number}` into browser history. Health: passed.
3. Reading to Library: the sticky primary header and the contextual Library capsule remain available. Library writes `?shelf=1`. Health: passed.
4. Browser Back: Back from Library restores the exact reading without a reload or dead state. Health: passed.
5. Wordmark return: CURA in the site header, focused reader, and footer returns to the main home introduction. Health: passed.
6. Focused reading: the persistent circular close returns to reflection, the focus wordmark returns home, and Escape closes the dialog. Health: passed.
7. Bilingual path: the full introduction and navigation controls switch between English and French. Health: passed.

### Visual evidence

- `/tmp/cura-navigation-qa/01-home-after.jpg` — compact home arrival.
- `/tmp/cura-navigation-qa/02-reading-after.jpg` — reading with persistent shared navigation.
- `/tmp/cura-navigation-qa/04-library-controls-after.jpg` — sticky Library header and source-matched OPEN control.
- `/tmp/cura-navigation-qa/05-focus-after.jpg` — focused reading with the fixed circular close and CURA home link.

### Final checks

- Mobile viewport checked at 604 × 863 CSS pixels with no horizontal overflow.
- Reference and implementation were inspected together. The capsule proportions, hairline stroke, flanking chevrons, and restrained control copy match the supplied pattern while using Cura’s existing ink and vermilion system.
- Console errors and warnings: none.
- Production build: passed.
- Unit and static-hosting tests: 49 passed, 0 failed.
