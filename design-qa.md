# Cura physical book and focused reading design QA

## Target and implementation

- Selected visual target: `/Users/maxducroisy/.codex/generated_images/019fc20e-ff1f-73d0-bef6-90ab2a6f1b94/exec-f3277888-728d-44aa-93be-0824093ef51c.png` (`1487 × 1058`).
- Final desktop capture: `/tmp/cura-writing-final-desktop-v2.png` (`1425 × 1013`), captured from a `1440 × 1024` browser viewport override in the open-book state.
- Final mobile capture: `/tmp/cura-writing-final-mobile-v2.png` (`375 × 812`), captured from a `390 × 844` browser viewport override in the open-book state.
- Supplied mobile legibility capture: `/var/folders/tm/vrrbvjtn483gyq472k30gptc0000gn/T/codex-clipboard-18a63cb8-ed75-4f05-a559-085f3e0dc808.png` (`848 × 1030`).
- Final compact archive capture: `/Users/maxducroisy/cura/tmp/design-qa/mobile-writing-book.png` (`390 × 844`).
- Final compact Focus Book capture: `/Users/maxducroisy/cura/tmp/design-qa/mobile-focus-book.png` (`390 × 844`).
- Same-input before/after comparison: `/Users/maxducroisy/cura/tmp/design-qa/mobile-book-comparison.png` (`1248 × 1346`).
- Supplied Focus Book collision captures: `/var/folders/tm/vrrbvjtn483gyq472k30gptc0000gn/T/codex-clipboard-e9b837fa-5735-4a80-b1ee-78c2e7fe0d01.png` (`1490 × 594`), `/var/folders/tm/vrrbvjtn483gyq472k30gptc0000gn/T/codex-clipboard-aebe84a6-11b2-4aa1-9664-568d7a1b405c.png` (`1044 × 230`), and `/var/folders/tm/vrrbvjtn483gyq472k30gptc0000gn/T/codex-clipboard-6f7a4253-4470-4038-bc57-145869fda8ab.png` (`876 × 124`).
- Final Focus Book collision QA: `/Users/maxducroisy/cura/tmp/design-qa/focus-book-final-1280.png` (`1280 × 720`), `/Users/maxducroisy/cura/tmp/design-qa/focus-book-final-750.png` (`750 × 600`), and `/Users/maxducroisy/cura/tmp/design-qa/focus-book-final-390.png` (`390 × 844`).
- Same-input Focus Book collision comparison: `/Users/maxducroisy/cura/tmp/design-qa/focus-book-overlap-comparison.png` (`1532 × 992`).
- Page-turn motion capture: `/tmp/cura-writing-refined-turn.png` (`1425 × 1013`).
- Focus Book desktop capture: `/tmp/cura-focus-book-desktop.png` (`1440 × 900`).
- Focus Book mobile capture: `/tmp/cura-focus-book-mobile-v2.png` (`390 × 844`).
- Focus Book Night mobile capture: `/tmp/cura-focus-book-mobile-night-v2.png` (`390 × 844`).
- Focus Book page-turn capture: `/tmp/cura-focus-book-turn.png` (`1440 × 900`).
- Pre-focus reading-mode desktop capture: `/tmp/cura-reading-mode-before-focus-desktop.png` (`1440 × 900`).
- Pre-focus reading-mode mobile capture: `/tmp/cura-reading-mode-before-focus-mobile.png` (`390 × 844`).
- Pre-focus reading-mode dark mobile capture: `/tmp/cura-reading-mode-before-focus-mobile-dark.png` (`390 × 844`).
- Focus reading-mode mobile capture: `/tmp/cura-reading-mode-focus-mobile.png` (`390 × 844`).
- Focus Book reading-mode desktop capture: `/tmp/cura-reading-mode-focus-desktop.png` (`1440 × 900`).
- Route: `http://127.0.0.1:5173/?view=writing`.
- Focus route: `http://127.0.0.1:5173/?reading=1&focus=reading`.
- Content state: one real locally saved reply to “On Saving Time,” English, warm theme, open volume.

The selected target and final desktop implementation were inspected together at their original resolution and near-identical aspect ratio. The implementation preserves the target hierarchy: dark reading room, resilient CURA header, one selected physical volume, source on the left, reply on the right, quiet circular close, and a centered capsule page-turn control.

## Comparison history

1. The first implementation pass made the open spread materially narrower than the selected target and left the warm site header above a dark reading room. Both were P1 mismatches. The spread geometry, camera scale, vertical placement, and route-scoped header treatment were corrected.
2. The enlarged spread then clipped both outer page edges at `390 × 844`. This was a P1 responsive regression. Compact pagination, camera scale, and the final book scale were adjusted so both pages remain fully visible side by side.
3. The settled pages read too much like flat panels. Segmented settled-page geometry, gutter lift, fore-edge lift, stronger page deformation, physical shadows, and a slower damped turn were added. The final motion capture shows the curved leaf and deterministic turn endpoint.
4. Print/PDF output was reviewed after replacing the flat archive. A separate print-only full source/reply spread now preserves the complete letter instead of printing the WebGL canvas or only the current paginated screen.
5. The first compact Focus Book pass placed EN/FR, Notes, and Aa under the experience selector and inherited dark ink for two controls. This was a P1 navigation and contrast regression. The header was restored to one unwrapped row with CURA and close, and all actions now use the correct light treatment.
6. Night display initially multiplied the dark canvas palette by a dark Three.js material, reducing page-text contrast. The mapped page material is now neutral, so the canvas owns the paper and ink palette in warm, clear, night, and e-ink modes.
7. The Focus Book instruction remained visible at the `900px` compact-footer breakpoint while the shared turner had already expanded to the full-width layout. This created a direct text/capsule collision. The compact breakpoint now removes that secondary instruction at the same `900px` threshold as the turner.
8. The first reading-mode selector used a generic split capsule with a full-width underline, weak state emphasis, and no preview before focus entry. One shared selector now uses a nested active capsule, a short vermilion cue, clear icons, and synchronized state before and inside focus.
9. The first mobile dark-mode return from Focus Book could briefly restore the floating hourglass over the new selector and primary focus action. Returning to reflection now immediately restores the reading surface visibility state before scrolling, so the timer yields to those controls.
10. Focus previously replaced the reading URL, so Browser Back could leave a directly opened focus route instead of restoring Cura's reading surface. Focus now owns a real history entry, including direct focus links, and Back closes the immersive view while preserving the selected presentation.
11. Compact page textures initially rendered at one device pixel in the QA browser and the scene lighting lifted dark type into grey. Mobile page artwork now renders at a fixed 2× texture density, uses stronger ink and metadata values, and sits under restrained directional lighting. The supplied and final compact captures were inspected together; the final page has materially darker type, a complete title hierarchy, clearer folio, and preserved 3D page depth.
12. Long Scroll reading could leave the in-flow hourglass above the viewport with no timer control in reach. The compact procedural hourglass now reappears as a quiet fixed dock only after the full instrument leaves view, in both pre-focus and Focus Scroll, and yields whenever the in-flow timer, closing memento, or footer is visible.
13. The Focus Book canvas already printed the letter label and title, while a separately positioned DOM identity layer kept the same title visible above it after the opening transition. This was the root cause of the duplicate “On Saving Time” collision. The rendered page now owns the only visible identity; the DOM heading remains semantic-only for the dialog and assistive technology.
14. A fixed helper sentence described the Scroll selection tools from an independent viewport position. At browser zoom and compact widths it crossed the page label and chapter metadata. The visible helper was removed. The same explanation now lives in the Scroll and Book controls' accessible names, where it remains useful without entering the page canvas.
15. Focus Book pagination compacted at `720px` while its header and footer compacted at `900px`. Tablet widths and browser zoom could therefore combine a two-page canvas with compact controls. Both the Focus Book canvas and its chrome now compact at `920px`, with the library shelf deliberately retaining its separate `720px` threshold.
16. The newly aligned compact canvas exposed the inside cover leaf after the opening settled and allowed the zoom group to share the turner's row. The settled compact reader now owns one centered page, while the cover remains available only for opening and closing motion; the footer gives page turn, bookmark, zoom, and folio explicit rows.
17. A `921–1100px` intermediate density range now reduces header and three-column reading dimensions before the full desktop layout resumes. This closes the last scrollbar-width seam without flattening the standard desktop composition.

## Product constraints and intentional differences

- The target illustrates several background volumes. The QA browser contains one real saved letter, so Cura shows one volume. It does not invent private writing or ornamental archive entries.
- The implementation uses Cura’s real collection cover, real source text, private local reply, paper material, typography, vermilion rule, and shared capsule geometry. It borrows Meng’s spatial interaction pattern without importing code or unrelated branding.

## Interaction and regression checks

- Shelf selection → OPEN → hinged cover → two-page reading spread: passed.
- Next and previous page turns: passed; counters update only after the turn settles.
- Pointer drag path, cancellation threshold, click turn, arrow-key turn, and reduced-motion endpoint: source-reviewed; button turn rendered and captured.
- Circular close and Escape: passed.
- Focus moves to close after opening and returns to OPEN after closing: passed.
- Source text remains on the left and the reader’s letter remains on the right at every settled spread: passed.
- English/French label parity, including close, page turn, source, and reply: passed.
- CURA remains visible in light and dark themes: passed.
- Responsive checks at `390`, `720`, `750`, `900`, `920`, `921`, `1024`, `1100`, `1101`, and `1440` CSS pixels show no horizontal overflow and preserve the home control: passed.
- Mobile `390 × 844` uses one full-width physical page at a time so type remains readable without destroying the book metaphor; close, page-turn, download, zoom, and continue-writing paths remain visible: passed.
- Compact archive and Focus Book pages render at 2× page-texture density with dark ink, restrained lighting, and no missing title: passed.
- Page zoom at 90%, 100%, 115%, and 130% repaginates without truncating source or reply text: passed.
- Focus entry → saved Scroll/Book preference → full selected letter: passed.
- Scroll → Book → Scroll preserves the nearest paragraph; compact and desktop repagination map back to that source paragraph: passed.
- Focus Book reopens in the saved presentation and returns through the visible close control without losing the reading route: passed.
- Focus Book keeps CURA, EN/FR, Notes, Aa, and close visible in one mobile row; the presentation selector remains separate and reachable: passed.
- Focus Book English/French labels, full-text pagination, bookmarking, warm/night display, page-turn settling, and responsive overflow: passed.
- Focus Book from `390–900px` keeps the page-turn capsule free of instructional copy: passed.
- Reading page exposes the persisted Scroll/Book choice immediately before the focus-entry capsule on desktop and mobile: passed.
- Choosing Scroll or Book before focus does not enter automatically; the next focus action opens the selected presentation: passed.
- The selector stays synchronized before and inside focus, including after closing and reopening: passed.
- Reading-mode labels and selected state remain legible in English/French and warm/dark modes: passed.
- Selector layouts at `390`, `640`, `720`, `900`, and `1440` CSS pixels have no horizontal overflow: passed.
- Returning from Focus Book does not restore the compact timer over the reading-mode or focus-entry controls: passed.
- Pre-focus and focused Scroll modes restore the compact hourglass dock after the full instrument scrolls out of view: passed.
- Browser Back from both a normal focus entry and a direct `?focus=reading` link restores the reading page, removes the focus parameter, keeps the selected presentation, and restores focus to the entry action: passed.
- Focus Book contains no visible DOM identity overlay or fixed guidance layer at desktop, browser-zoom-equivalent, or mobile widths; the canvas page is the sole visible work identity: passed.
- English and French Book controls retain their complete descriptions as accessible names; French compact layout remains within `390px`: passed.
- The Focus Book close control and Browser Back provide explicit return paths; the native dialog cancel handler remains the Escape owner and was source-reviewed after the layout change: passed.
- Browser console: no warnings or errors in the final responsive pass.
- `npm run build`: passed.
- `npm test`: 86 passed, including a structural regression guard for one visible Book identity layer and aligned compact breakpoints.
- `npm run test:sites`: 4 passed.
- Build artifacts required for Sites and Vercel are present.

## Severity review

- P0 blockers: none.
- P1 material visual or journey mismatches: none.
- P2 polish defects: none.
- Intentional content-density difference: one real saved letter rather than fake background volumes.

final result: passed
