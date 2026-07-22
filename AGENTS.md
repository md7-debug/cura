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

## Writing rules

- Write in a clean, active voice. Cut padding and vague claims.
- Never use “delve,” “foster,” “leverage,” “it’s worth noting,” “importantly,” “game changer,” “paradigm shift,” or “this is huge.”
- Avoid the stock forms “Question? Answer.” and “This isn’t about X. It’s about Y.”
- Prefer short sentences and plain punctuation. Use em dashes rarely.
- Keep the tone calm and precise. Do not oversell the product or the philosophy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
