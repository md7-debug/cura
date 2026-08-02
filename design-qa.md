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
- Unit and static-hosting tests: 50 passed, 0 failed.

## Follow-up polish

- No P3 item is required for handoff. If the collection grows beyond five works, reassess Three.js texture memory and shelf pagination before adding more covers.

Shelf result: passed

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
- Unit and static-hosting tests: 50 passed, 0 failed.

## Repository mark and favicon follow-up

### Source and implementation evidence

- Source visual truth: `/var/folders/tm/vrrbvjtn483gyq472k30gptc0000gn/T/codex-clipboard-f65aecf1-46a1-4b02-8c2d-f0348545d805.png`, 228 × 96 px. It identifies the footer’s existing “Open source” placement and paper treatment.
- Desktop implementation: `tmp/footer-github-desktop-final.png`, 1425 × 891 px from a 1440 × 900 CSS viewport at device scale 1.
- Compact implementation: `tmp/footer-github-mobile-final.png`, 375 × 812 px from a 390 × 844 CSS viewport at device scale 1.
- Focused equal-size comparison: `tmp/footer-github-final-comparison.png`, 456 × 96 px. The source and implementation crops are each 228 × 96 px and are joined without rescaling.
- Favicon evidence: `public/assets/cura-favicon.png`, 512 × 512 px, with `tmp/cura-favicon-32.png` used to check small-size legibility. The Apple touch icon is a 180 × 180 px derivative of the same source.

### Findings and comparison history

1. P2 — The first pass replaced the footer text with an icon-only link, which removed the explicit open-source cue requested in the follow-up.
   - Fix: retained the filled GitHub mark as the primary visual and placed the localized “Open source” label beneath it in Cura’s Allura signature style.
   - Post-fix evidence: `tmp/footer-github-desktop-final.png`, `tmp/footer-github-mobile-final.png`, and `tmp/footer-github-final-comparison.png`.
- No actionable P0, P1, or P2 findings remain.
- Fonts and typography: the label uses the same Allura family as “The practice of return” at 13.6 px, while the GitHub mark remains visually dominant.
- Spacing and layout rhythm: the stacked lockup is 54.6 × 55.7 CSS px, stays aligned to the footer’s right edge, and does not create horizontal overflow at either checked viewport.
- Colors and visual tokens: the mark and label use Cura’s quiet ink token, with ink and vermilion reserved for hover and keyboard focus.
- Image and icon quality: the filled Phosphor GitHub mark remains crisp at 23 px. The generated Cura favicon preserves its black `C` and vermilion rule at 32 px without introducing a generic framework mark.
- Copy and content: “Open source” remains visible and follows the active English/French locale. The link retains a descriptive accessible name, title, new-tab target, and `noreferrer`.

### Browser and build checks

- Checked normal, hover, desktop, and compact footer states.
- Confirmed both favicon links resolve to the generated Cura assets.
- Browser console errors and warnings: none.
- Production and Sites build: passed.
- Unit and static-hosting tests: 50 passed, 0 failed.

## Navigation safety and dark-header regression

### Findings and fixes

1. P1 — On the deployed mobile dark theme, the site header kept the light paper texture while its text switched to light ink. CURA, Today, and other controls became nearly invisible.
   - Fix: the sticky header now blends the paper texture with its active paper color, matching the body in both light and dark themes.
   - Before/after evidence: `/tmp/cura-navigation-audit/02-vercel-mobile-dark-header-before.png`, `/tmp/cura-navigation-audit/03-local-mobile-dark-header-after.png`, and `/tmp/cura-navigation-audit/04-mobile-dark-header-comparison.png`.
2. P1 — In focused reading, CURA scrolled away with the article. The circular close remained fixed, but the explicit Home route was not continuously visible.
   - Fix: CURA is now a fixed, paper-backed capsule opposite the fixed close/back control. Both remain within the mobile viewport at deep scroll positions and preserve safe-area spacing.
   - Post-fix evidence: `/tmp/cura-navigation-audit/05-focused-reader-deep-scroll-after.png`.

### Flow checks

1. Home arrival → header CURA remains visible in dark mode. Health: passed.
2. Home → Library → sticky header remains visible; primary navigation remains available. Health: passed.
3. Library → Your writing → sticky header remains visible; CURA returns to the home introduction. Health: passed.
4. Reading → focused reader → deep scroll → CURA and close/back stay fixed. Health: passed.
5. Focus close/back → reading and Interpretation are restored; `focus=reading` is removed from the URL. Health: passed.
6. Focus CURA → the dialog closes, the root URL is restored, and the main introduction is visible. Health: passed.

### Validation

- Compact viewport: 390 × 844 CSS pixels; no horizontal overflow.
- Both persistent focus controls measured inside the viewport at deep scroll: CURA 85.25 × 48 px at 12 px from the top-left; close/back 48 × 48 px at 12 px from the top-right.
- Browser console errors and warnings: none locally or on the deployed comparison build.
- Production and Sites build: passed.
- Unit tests: 50 passed, 0 failed. Sites tests: 4 passed, 0 failed.

final result: passed

# Cura reading selector design QA

## Evidence

- Source visual truth: `/var/folders/tm/vrrbvjtn483gyq472k30gptc0000gn/T/codex-clipboard-66a1871f-faa0-480f-9572-1f4d8ecc19fe.png`
- Source pixels: `3020 × 442`; desktop header reference; source density not declared.
- Initial implementation capture: `/tmp/cura-library-before.png`
- Final light implementation capture: `/tmp/cura-reading-selector-mobile.png`
- Final dark implementation capture: `/tmp/cura-reading-selector-dark-mobile.png`
- Final desktop header capture: `/tmp/cura-reading-selector-desktop-header.png`
- Combined comparison board: `/tmp/cura-selector-comparison-full.png`
- Mobile CSS viewport: `450 × 863` at device pixel ratio `2`; captured page area `435 × 835` after browser chrome and scrollbar.
- Desktop CSS viewport check: `1440 × 900` at device pixel ratio `1`. The in-app capture remained constrained to the browser panel, so desktop layout was also checked with rendered DOM geometry rather than treated as a pixel-identical screenshot.
- State: Library default and reading `?reading=1`, English and French, light and dark themes.

## Full-view comparison

The final reading header preserves the reference hierarchy, warm paper texture, ink, thin rules, compact uppercase labels, native chevrons, and vermilion focus line. The added Text selector reads as part of the existing Author → Work system rather than a separate component. At compact width, Author and Work share the first row and Text receives the full second row. No horizontal overflow was present.

## Focused comparison

The combined comparison board places the supplied desktop header above the final compact implementation. The selector region was large enough to inspect type, rules, spacing, control alignment, and the selected-state treatment without a separate crop. The source does not contain the new Text control, so its fidelity was judged against the adjacent Author and Work controls.

## Required fidelity surfaces

- Fonts and typography: passed. Inter remains on navigation and selector labels; Cormorant Garamond remains on reading content. Weight, capitalization, and letter spacing follow the reference.
- Spacing and layout rhythm: passed. Desktop keeps all three selectors on one line. Compact widths use a balanced two-column first row and full-width Text row.
- Colors and tokens: passed. Paper, ink, vermilion focus, and dark-theme equivalents use the existing Cura tokens.
- Image quality and assets: passed. No new image or icon asset was needed; the paper texture and existing navigation assets remain unchanged.
- Copy and content: passed. `Text` / `Texte` is concise, and “On Saving Time” / “Sur l’emploi du temps” is selected after the shelf handoff.
- Accessibility and behavior: passed. Native labelled selects support keyboard and mobile pickers. Focus remains visible, browser Back restores the prior reading, and both themes keep CURA visible.

## Interaction evidence

- `Library → OPEN` changed the URL to `?reading=1` and rendered “On Saving Time.”
- Text changed reading `1 → 2` in place and rendered “On Discursiveness in Reading.”
- Browser Back restored reading `1` and its title.
- Author changed to Ralph Waldo Emerson without returning to Library.
- Work changed to Self-Reliance and rendered reading `313` in place.
- French exposed Auteur → Œuvre → Texte and selected “Sur l’emploi du temps.”
- Browser console showed no warnings or errors during the tested flow.
- Production build passed. Unit tests: 51 passed, 0 failed. Sites tests: 4 passed, 0 failed.

## Comparison history

- Initial P1: Library inherited the last saved author and could arrive on Epictetus instead of the intended Seneca entry point. Fixed by giving the shelf an explicit Seneca default.
- Initial P1: the reading header could change author or broad work but not move between Seneca's 124 texts. Fixed with the native Text selector and direct history-aware reading navigation.
- Post-fix evidence: both issues were re-tested through the rendered flow on mobile and at the desktop breakpoint. No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- P3: a future library search pattern could supplement the native picker for readers who know a title but not its letter number. This consideration is resolved in the searchable index follow-up below.

final result: passed

# Searchable text index follow-up

## Evidence

- Desktop complete index: `/tmp/cura-text-index-desktop.png`.
- Mobile filtered index: `/tmp/cura-text-index-filtered-mobile.png`.
- Mobile dark index: `/tmp/cura-text-index-dark-mobile.png`.
- Mobile browser viewport: `450 × 863` CSS pixels with no horizontal overflow.

## Design decision

- The Text selector remains in the Author → Work → Text header and still exposes all 124 Seneca letters.
- Previous and next chevrons handle sequential reading. The current title opens a searchable index for direct jumps.
- The index uses Cura's existing geometry: paired hairlines, a square editorial frame, a circular close control, restrained vermilion focus rules, serif titles, and uppercase sans labels.
- The desktop index uses two scanning columns. The mobile index becomes a bottom sheet with one column and keeps the complete list scrollable.
- Search is local and immediate. It matches localized titles, Arabic numbers, and displayed Roman reading codes. An empty result is explicit, and clearing search restores the complete list.

## Interaction evidence

- `?reading=1` opened the index with `124 of 124 texts` and focus in the search field.
- Searching `discursiveness` returned one result. Choosing it loaded “On Discursiveness in Reading” and updated the URL to `?reading=2`.
- Searching `old age` on mobile returned three precise matches. Choosing “On Old Age” loaded reading `12` without returning to Library.
- A single Escape press closed the index and restored focus to the Text trigger.
- The visible close button, browser Back, header CURA link, and Library return remain available, so the reader cannot become trapped.
- English and French labels, light and dark themes, the desktop layout, and the existing mobile-width browser tab were checked.
- Browser console errors and warnings: none.

## Visual review

- Desktop: the dialog remains centered and visually subordinate to the reading, with the page context softly receding behind it.
- Mobile: the sheet anchors to the bottom, the title may wrap naturally, the search line remains fully visible, and results keep comfortable touch targets.
- Search results are plain editorial rows rather than cards. The current text uses the same vermilion edge and quiet ink wash across both themes.
- The native search cancel affordance was replaced with Cura's circular Phosphor close glyph so no browser-blue control breaks the palette.

final result: passed
