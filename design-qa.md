# Cura physical book and focused reading design QA

## Target and implementation

- Selected visual target: `/Users/maxducroisy/.codex/generated_images/019fc20e-ff1f-73d0-bef6-90ab2a6f1b94/exec-f3277888-728d-44aa-93be-0824093ef51c.png` (`1487 × 1058`).
- Final desktop capture: `/tmp/cura-writing-final-desktop-v2.png` (`1425 × 1013`), captured from a `1440 × 1024` browser viewport override in the open-book state.
- Final mobile capture: `/tmp/cura-writing-final-mobile-v2.png` (`375 × 812`), captured from a `390 × 844` browser viewport override in the open-book state.
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
- Responsive checks at `390`, `720`, `900`, and `1440` CSS pixels show no horizontal overflow and preserve the home control: passed.
- Mobile `390 × 844` keeps the full two-page object, close control, page-turn capsule, download, and continue-writing paths visible: passed.
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
- Browser Back from both a normal focus entry and a direct `?focus=reading` link restores the reading page, removes the focus parameter, keeps the selected presentation, and restores focus to the entry action: passed.
- Browser console: no warnings or errors; development connection and React development notices only.
- `npm run build`: passed.
- `npm test`: 74 passed.
- `npm run test:sites`: 4 passed.
- Build artifacts required for Sites and Vercel are present.

## Severity review

- P0 blockers: none.
- P1 material visual or journey mismatches: none.
- P2 polish defects: none.
- Intentional content-density difference: one real saved letter rather than fake background volumes.

final result: passed
