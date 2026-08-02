# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable design decisions

- The selected source of truth is visual concept 2: warm textured paper, black ink, one vermilion rule, strong asymmetry, and generous negative space.
- Preserve the `read → consider → write back` flow and the equal English/French language switch.
- Avoid cards, shadows, gamification, accounts, analytics, ornamental Japanese motifs, and unnecessary UI.
- Use violet only for the selected contextual phrase and its reading-focus cue. Margin notes retain the vermilion and ink system. Opening a phrase must keep the text central, move smoothly between notes, and respect reduced-motion preferences.
- Reading preferences and position stay local, use versioned storage, and never become scores, streaks, or public activity.
- Margin notes must never overlap the reading column. Use a side note only when the viewport safely supports it, otherwise use a centered bottom sheet.
- Personal annotations support typed and freehand input, attach to the letter or a contextual passage, remain private in versioned local storage, and never open beside another note surface.
- Letter portability stays client-only: Markdown and text for reading, JSON for complete backups including annotations, local import for restoration, and print CSS for PDF output.
- Obsidian export keeps the original letter, the reader’s reply, highlights, typed notes, metadata, and source URL in one Markdown note. Direct folder access remains optional and local, with a download fallback.
- The reading timer remains optional and local. Its date, duration, countdown, start/pause action, reset, and progressive sand state belong to the hourglass itself. It uses no sound, notification, streak, or score.
- Cura is a multi-author reading shell. Publish a reading only after the original text and both translations have a clear reuse basis. Protected authors may appear as guide-only influences, never as copied source text.
- Keep the vanitas still life at the close of a practice. It may recall mortality and passing time, but it must not compete with reading or appear as a modal, alert, badge, or streak device.
- Read, Note, Write, and Keep are real navigation controls. Do not render a stage that leads nowhere.
- Use the Author → Work selector as the collection boundary. Do not add one-off author buttons to the reading screen or library.
- Never trap the reader in focus mode. Keep Escape and the header return active, then end the text with explicit paths to Write, Notes, and Interpretation.
- Keep the site header legible in every theme, including mobile dark mode. In focused reading, keep both the CURA home control and the close/back control fixed and visible while the text scrolls.
- Clip temporary and saved violet highlights to the centered reading measure and the selected line fragments. Never let selection paint wash across the viewport.
- Keep the 10, 15, 20, and 30-minute budget visible on the compact hourglass while reading and writing.
- Sharing is always explicit. Share only a saved source passage, attribution, source link, and `#CuraReading`; never include a private note or reply automatically.
- Treat the CURA wordmark as a resilient home link. It always returns to the main Today arrival, including from focused reading and the footer.
- Keep navigation available during long pages. The main header stays in reach, browser Back restores the previous Cura surface, and every immersive surface has a visible circular close control plus Escape support.
- Reuse the shelf navigation language across the product: thin outlined capsules for primary actions, simple flanking chevrons for previous and next, and circular outlines for close or return actions. Keep proportions, strokes, hover states, and motion consistent.
- The main page opens with an asymmetric editorial introduction using real cover art, warm paper, ink, and one vermilion rule. It previews today’s reading and leads into the existing read, consider, and write-back flow without cards or shadows.
- The Library may use a modern, tactile shelf and book-opening interaction as a spatial collection metaphor. This is not gamification. Let stronger composition, material detail, and precise motion add value at the threshold into a work while the reading surface stays calm, bilingual, private, and recognizably Cura.
- Shelf controls use a thin position line, a compact OPEN pill flanked by chevrons, and a circular close control for an opened work. Keep these patterns functional, light, and free of decorative chrome.
- Opening a shelf volume is one continuous path into its first available text: animate the book, show the work identity briefly, then enter the reading automatically. The circular close control cancels that transition.
- Keep repository credit visual and quiet: use the recognizable GitHub mark with an accessible label instead of a text link. Cura’s ink `C` monogram with one vermilion rule is the browser icon and a compact signature above the footer wordmark, not a generic framework or repository icon.

## Writing rules

- Write in a clean, active voice. Cut padding and vague claims.
- Never use “delve,” “foster,” “leverage,” “it’s worth noting,” “importantly,” “game changer,” “paradigm shift,” or “this is huge.”
- Avoid the stock forms “Question? Answer.” and “This isn’t about X. It’s about Y.”
- Prefer short sentences and plain punctuation. Use em dashes rarely.
- Keep the tone calm and precise. Do not oversell the product or the philosophy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
