# Cura design QA

## Visual target

- Selected concept: Reading Alcove, revised with the repaired wooden hourglass.
- Desktop comparison: selected generated reference beside the live implementation at the same reading state.
- Core match: warm paper, three-part reading layout, vermilion rules, serif text, restrained controls, and the hourglass as the central session instrument.

## Responsive checks

- Desktop: 1440 × 1024 target, three-column reading layout, no document-level horizontal overflow.
- Mobile: 390 × 844 target, stacked reading sections, two-column Author and Work selector, no document or selector overflow.
- Light and dark hourglass assets use transparent backgrounds and remain legible in both themes.

## Interaction checks

- Author selector changes the current author and updates the work selector.
- Library author filter updates the work options and visible reading count.
- Read, Note, Write, and Keep lead to working destinations and update the current stage.
- Full-screen reading keeps Escape and a header return available.
- The end of a reading offers Write a reply, Open notes, and Return to the interpretation.
- Write a reply closes focused reading, scrolls to the composer, and focuses the editor.
- The hourglass accepts 10, 15, 20, or 30 minutes; start changes to pause; remaining time and sand progress update from wall time.
- The compact hourglass keeps all four duration choices visible in focused reading and while moving through the practice.
- Reaching zero changes the session message without blocking reading or writing.
- Native selection paint is suppressed on reading surfaces. Cura draws clipped violet line fragments inside the active reading measure, including source text, interpretation, focused reading, Markdown preview, and letter comparison.
- A saved source passage exposes native Share, Post to X, and Copy actions. Share content contains the passage, attribution, source, and `#CuraReading`, never the private note or reply.

## Quality gates

- Syntax/build: passed.
- Unit and static-hosting tests: passed.
- Console: no application errors found during the checked flow.
- Copyright boundary: only verified public-domain readings are published. Requested authors with unresolved editions remain visibly marked as under review. Pierre Hadot remains guide-only.

## Fixes made during QA

- Removed the white and black rectangles from the generated hourglass assets with alpha mattes.
- Restored timer-control contrast in dark mode.
- Removed mobile horizontal scrolling from the Author and Work selector.
- Replaced non-functional stage labels with working navigation.
- Added explicit exits at the end of focused reading.
- Replaced viewport-wide browser selection bands with measure-clipped selection markers.
- Exposed 10, 15, 20, and 30-minute choices on the persistent compact hourglass.
