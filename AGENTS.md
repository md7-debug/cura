# Cura Reader product and prototype instructions

Act like a high-performing senior engineer. Be concise, direct, and execution-focused.

Prefer simple, maintainable, production-friendly solutions. Keep behavior explicit, naming clear, and dependencies light. Do not add abstractions or packages unless they bring clear product value.

Run the local server and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making a substantial visual change, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable Cura-specific feedback or makes a design decision, record it here.

When implementing from a selected mock or reference image, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy. Adapt it to Cura's established system rather than copying unrelated branding.

## Canonical product contract

### Product promise

- Cura is a calm, bilingual place to read a text, consider it, and answer in the reader's own words.
- Preserve the `read → consider → write back` flow. The shelf and book-opening sequence are the threshold into that practice, not the product's purpose.
- Keep English and French equal. A complete path, control, or message in one language must have an equivalent in the other.
- Cura is a multi-author reading shell. Use Author → Work as the collection boundary. Do not add one-off author buttons to the reading screen or library.
- Read, Note, Write, and Keep are real navigation controls. Never render a stage that leads nowhere.

### Product boundaries

- Avoid gamification, scores, streaks, public activity, accounts, analytics, notifications, ornamental Japanese motifs, and unnecessary UI.
- Do not use cards, soft dashboard panels, gratuitous shadows, glass effects, or generic startup gradients.
- Keep reading preferences, position, replies, highlights, and annotations private and local. Use versioned storage.
- Strong composition, tactile material detail, and precise motion are welcome when they support orientation or mark a transition.

## Visual system

### Source of truth

- The canonical direction is warm textured paper, black ink, one vermilion rule, strong asymmetry, and generous negative space.
- The interface should feel editorial, tactile, restrained, and designed with care. It should not look like a component library or a game.
- Use real cover art and meaningful content. Do not fill important surfaces with generic placeholders or decorative chrome.

### Core tokens

- Warm theme: paper `#f3efe7`, ink `#24221f`, vermilion `#b44932`, violet `#704b91`.
- Dark theme: paper `#1a1917`, ink `#eee8dc`, vermilion `#cf7059`, violet `#c4a4e2`.
- Use `public/assets/paper-texture.png` on warm paper surfaces. Preserve enough contrast for text and controls; do not let the texture become visible noise.
- Vermilion is the structural accent for rules, active outlines, focus states, and small editorial signals.
- Violet is reserved for a selected contextual phrase, its reading-focus cue, and saved highlight behavior. Margin notes stay in the vermilion and ink system.
- Keep the clear, night, and e-ink reader modes functional. They may simplify the texture but must preserve hierarchy and contrast.

### Typography

- Cormorant Garamond is the editorial face for titles, reading text, and reflective copy.
- Inter is the interface face for navigation, labels, metadata, and controls.
- Allura is a rare signature accent. Limit it to lines such as “The practice of return” and the small “Open source” footer note.
- Prefer strong type scale, measure, and whitespace over borders or containers. Do not use script type for controls or body copy.

### Composition

- Keep the main page asymmetric, spacious, and immediately legible. Its opening composition uses the editorial title, today's reading, real cover art, and one vermilion rule.
- The home page must lead naturally into Today, Library, and the existing reading flow without turning those choices into cards.
- Reading remains the quietest surface. Shelf detail and motion must settle before the text becomes the focus.

## Shared interaction grammar

- Use a thin outlined capsule for a primary action, simple flanking chevrons for previous and next, and a thin circular outline for close or return.
- Reuse these shapes across home, shelf, focus reading, and other navigation. Keep proportions, stroke weight, hover behavior, focus treatment, and motion consistent.
- A capsule label is short and active, such as OPEN or BEGIN READING. Do not pack secondary actions inside it.
- Circular close controls must have an accessible name, a visible focus state, and a predictable Escape equivalent.
- Use motion to explain spatial change. Avoid motion that merely decorates, delays, or competes with reading.

## Navigation and return paths

- Treat the CURA wordmark as a resilient home link. It always returns to the main Today arrival, including from focused reading and the footer.
- Keep the site header legible in every theme, including mobile dark mode. Do not let theme color, texture, scrolling, or stacking hide CURA.
- Keep navigation in reach on long pages. Browser Back must restore the previous Cura surface.
- Every immersive surface needs a visible close or back control and Escape support. Focused reading keeps both the CURA home control and the close/back control fixed while the text scrolls.
- End each reading with explicit paths to Write, Notes, and Interpretation. Never trap the reader in focus mode, an opened shelf volume, a note surface, or an annotation tool.
- When a temporary surface closes, restore focus to the control that opened it whenever practical.

## Surface patterns

### Home

- Preserve the editorial arrival: warm paper, ink, vermilion detail, real reading material, and generous negative space.
- The first screen should establish Cura's purpose and give a clear next action. Keep supporting copy short and human.
- The Today, Library, and Your Writing controls remain useful on desktop and mobile. Compacting the header must not remove the home route or language switch.

### Library and shelf

- The Library may use a modern, tactile shelf and book-opening interaction as a spatial collection metaphor. This is not a reward mechanic.
- Shelf controls use a thin position line, a compact OPEN capsule flanked by chevrons, and a circular close control after a work opens.
- Opening a volume is one continuous path into its first available text: select the work, open the book, show its identity briefly, then enter the actual reading automatically.
- The Library arrives on Seneca's *Moral Letters to Lucilius* by default. OPEN enters “On Saving Time” unless the reader selects another volume first.
- The reading header uses Author → Work → Text. Changing any selector opens the matching text in place and updates browser history, so the reader never has to return to Library just to move through a work.
- Long works use a step-or-jump Text control. The flanking chevrons move sequentially; the current title opens the complete, locally searchable index. Search filters by title, Arabic number, or displayed reading code without replacing the full list. Keep the index keyboard-accessible, closable with one Escape press, focus-restoring, responsive, and built from Cura's hairlines, square editorial frame, circular close control, and vermilion active rule. Do not turn it into cards, a command palette, or a separate route.
- The close control cancels the opening sequence. Escape also cancels it. A direct Read action may complete the handoff immediately.
- Desktop and compact shelves share the same narrative cadence: reveal the page block, open the selected cover, quiet surrounding works, show the work identity, and enter the reading.
- Mobile is not a reduced fallback. It preserves the same action, meaning, and transition while adapting perspective, scale, and spacing to the smaller viewport.
- When WebGL is available, mobile keeps the same spatial shelf, real cover textures, shelf plane, capsule, markers, and opening motion as desktop. Horizontal swipes map to previous and next work without blocking vertical page scroll; the static shelf is a renderer-failure fallback only.
- The compact shelf begins at `720px` and below. The selected cover opens over a real paper page block while surrounding books fade or recede.
- Reduced-motion mode may skip the shelf animation and enter the reading directly.

### Reading and focus

- The reading page exposes its focus-entry capsule in the first viewport on desktop and mobile. Keep it directly after the reading title, before the excerpt, so Library → Open → Read never depends on scrolling.
- On handheld focused reading, keep CURA, close, EN/FR, Notes, and Aa immediate in one unwrapped header row. Theme/display remains inside Aa; Pop out and browser fullscreen are desktop-only controls.
- Close focused reading with the same threshold grammar used to open it: WRITE A REPLY owns the central capsule, its detached chevrons mean previous and next reading, and Notes plus Interpretation remain quiet underlined routes that survive 200% zoom.
- On handheld screens, an untouched reader profile resolves to ragged-left text with hyphenation off. Persist explicit alignment, hyphenation, and preset choices so the reader always overrides the responsive default.
- Focused reading uses one quiet vermilion scroll rail without a numeric percentage. Save the paragraph nearest the reading line on close and page exit, clamp stale positions to the current text, and keep touch bookmarks visible at a minimum 44px target.
- Keep the text centered and primary when opening a contextual phrase or moving between notes.
- A single selected word may open an explicit DEFINE action beside KEEP. DEFINE sends only that word to the matching English or French Wiktionary edition; it never sends the sentence, a note, or a reply. Cache successful definitions locally so a repeated lookup and previously opened word can work offline.
- Resolve Wiktionary redirects, prefer its structured English definition response, and retain the MediaWiki parser as the bilingual fallback. If no concise definition can be rendered, keep a direct full-entry link beside Retry so the reader is never left at a dead end.
- Dictionary lookup never replaces Highlight and Note. KEEP preserves the violet highlight, opens the existing private typed/freehand note surface, and keeps the passage in the Highlights list. Multiword selections offer KEEP without DEFINE.
- Use the shared thin capsule geometry for DEFINE and KEEP. Show a quiet definition in the safe margin on wide screens and a centered outlined bottom sheet on compact screens. Keep explicit Wiktionary and CC BY-SA attribution, one lookup surface at a time, a visible close control, and Escape support. Do not look up a word until the reader asks.
- Bookmark toggles save immediately, deduplicate by language and paragraph, remain visible on touch screens, and return keyboard focus to the exact paragraph marker. A quick close or repeated tap must not lose or duplicate the place.
- Temporary selection paint settles quickly over only the chosen line fragments. Keep the DEFINE/KEEP capsule close to the selection without covering the selected opening lines, and remove its motion under reduced-motion preferences.
- Clip temporary and saved violet highlights to the centered reading measure and selected line fragments. Never let selection color wash across the viewport.
- Margin notes must never overlap the reading column. Use a side note only when the viewport safely supports it; otherwise use a centered bottom sheet.
- Only one note surface may be open at a time. A personal annotation must not open beside another note surface.
- Personal annotations may be typed or freehand and may attach to the letter or a contextual passage. They remain private in versioned local storage.
- The optional timer stays local. Its date, duration, countdown, start/pause action, reset, and progressive sand state belong to the hourglass.
- Keep 10, 15, 20, and 30-minute choices visible on the compact hourglass while reading and writing. Use no sound, notification, streak, score, or celebratory state.
- Keep the vanitas still life at the close of a practice. It may recall mortality and passing time, but it must not compete with reading or behave like a modal, alert, badge, or reward.

### Writing, keeping, and sharing

- Letter portability stays client-only: Markdown and text for reading, JSON for complete backups including annotations, local import for restoration, and print CSS for PDF output.
- Obsidian export keeps the original letter, the reader's reply, highlights, typed notes, metadata, and source URL in one Markdown note.
- Direct folder access is optional and local. Always keep a download fallback.
- Sharing is explicit. Share only a saved source passage, attribution, source link, and `#CuraReading`. Never include a private note or reply automatically.
- The compact hourglass belongs only to active reading and reply surfaces. It must never cover archive, library, navigation, or primary copy on mobile.
- Focused reading is text-first: its timer starts collapsed, while Cura, the close control, the title, and the opening passage remain immediately available.
- A saved paragraph turns the home action into a contextual resume action and opens that passage directly. This continuity remains local and carries no score or streak.
- Empty writing states keep both paths visible: return to Today in the capsule language, or open a local letter.
- Production pages ship canonical and social-preview metadata plus an installable offline shell. Offline caching is first-party, preserves local privacy, and covers only the shell and readings the visitor has opened.

## Responsive and accessible behavior

- The full header compacts at `900px`; the library uses the compact shelf at `720px` and below.
- Treat `390 × 844` as the minimum mobile QA viewport and `1440 × 900` as the standard desktop QA viewport. Also check intermediate widths around both breakpoints.
- Preserve hierarchy, reading measure, navigation, and language parity at every width. Avoid horizontal overflow and controls hidden under browser chrome.
- All interactive controls need semantic elements, accessible names, keyboard operation, and visible focus states.
- Respect `prefers-reduced-motion`. Skip or shorten transitions without removing state changes or navigation outcomes.
- Test dark mode on mobile and desktop. The header, CURA home link, icons, text, and focus states must remain visible.

## Content, rights, and privacy

- Publish a reading only when the original text and both translations have a clear reuse basis.
- Protected authors may appear as guide-only influences, never as copied source text.
- Keep reader data on the client unless the product direction is explicitly changed. Do not add telemetry or third-party tracking by default.
- Make source attribution and source URLs durable through reading, export, and sharing flows.

## Brand and repository credit

- Use **Cura Reader** as the public product name in browser titles, search and social metadata, install surfaces, accessibility labels, and public documentation. Use `curareader` as the URL and handle form.
- Keep **CURA** as the visual wordmark and **Cura** as the short in-product name. Do not rename versioned storage keys, backup formats, export filenames, source tags, repository paths, or `#CuraReading`; those are stable compatibility identifiers.
- Pair the public name with “The practice of return.” This naming hierarchy does not authorize a redesign or an extra logo lockup in the site header.
- Use Cura's ink `C` monogram with one vermilion rule as the browser icon and as a compact footer signature above the CURA wordmark.
- Ensure the monogram background blends with the surrounding paper or dark surface. Do not show a mismatched square or halo.
- The CURA wordmark in the header and footer is a home control, not static decoration.
- Keep repository credit visual and quiet: use the recognizable GitHub mark with an accessible label, with the small “Open source” signature underneath.
- Link the GitHub mark to `https://github.com/md7-debug/cura`.

## Engineering boundaries

- Build app UI in `src/` and serve durable public assets from `public/assets/`.
- Keep the heavier Three.js shelf isolated and loaded on demand. Do not make the calm reading path depend on the 3D scene being available.
- Keep APIs small and behavior explicit. Prefer CSS and existing utilities over new runtime dependencies for small visual changes.
- Preserve `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` so the same prototype can be handed to Sites.
- Do not commit `tmp/`, local screenshots, QA captures, generated `dist/`, or machine-specific files.

## Validation contract

Use three validation passes for every change:

1. Syntax and build: run the relevant syntax check and `npm run build` for application changes.
2. Tests: run the focused tests, then `npm test`; run `npm run test:sites` when build, hosting, routing, or handoff behavior can be affected.
3. Review: inspect the diff and the rendered app. Check both target viewports, both themes, EN and FR, keyboard paths, Escape, browser Back, reduced motion, overflow, asset loading, and the browser console.

Before a Sites handoff, `npm run build` and `npm run test:sites` must pass. The build must leave:

- `dist/client/index.html`
- `dist/server/index.js`
- `dist/.openai/hosting.json`

## GitHub and Vercel release

- The canonical repository is `https://github.com/md7-debug/cura`.
- The production branch is `main`. The linked Vercel project deploys pushes to `main` automatically.
- The canonical production address is `https://curareader.vercel.app`. Treat other generated Vercel names as deployment aliases, not the public brand address.
- Keep `vercel.json` explicit: use `npm run build` as the build command and `dist/client` as the output directory.
- A successful build log does not prove the release works. After a production push, open the canonical address and verify an HTTP 200 response, the CURA header in both themes, favicon and brand assets, Today → reading, Library → book opening → reading, browser Back, and the mobile layout.
- Treat a Vite chunk-size notice as a performance signal, not a failed deployment. Preserve on-demand loading for the shelf and investigate material regressions before merely raising warning limits.

## Writing rules

- Write in a clean, active voice. Cut padding and vague claims.
- Never use “delve,” “foster,” “leverage,” “it's worth noting,” “importantly,” “game changer,” “paradigm shift,” or “this is huge.”
- Avoid the stock forms “Question? Answer.” and “This isn't about X. It's about Y.”
- Prefer short sentences and plain punctuation. Use em dashes rarely.
- Keep the tone calm and precise. Do not oversell the product or its philosophy.
