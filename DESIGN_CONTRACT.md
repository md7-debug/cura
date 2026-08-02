# Cura Reader: design contract

## Purpose

Cura Reader helps one person complete one quiet cycle: **read → consider → write back → return**.

The name comes from *cura sui*: care of the self. The governing metaphor is patient cultivation. Like polishing one facet of a stone or tending an inner garden, the practice gains meaning through repetition and attention.

## Experience

- The first screen begins with a source text, never with product explanation.
- Interpretation clarifies the letter without replacing it.
- Focused reading gives the full letter a quiet, centered measure before returning to interpretation.
- Focused reading opens as a true full-screen modal. The underlying site becomes inert, Escape returns safely, and keyboard focus returns to the reading invitation.
- Sparse margin notes explain key words and sayings in place. They never interrupt ordinary reading.
- Selecting one word offers an explicit, bilingual Wiktionary definition without weakening the existing Highlight and Note path. Only the word leaves the browser; context ranking stays local.
- Writing is an invitation, not an assignment; silence is a valid outcome.
- Improvement is framed as return and care, never measurement or self-optimization.
- Notes stay in the browser. No account, analytics, streaks, badges, or public profile.

## Experience elevation contract

These acceptance rules protect the complete return journey across desktop and mobile:

1. **No covered content.** The compact hourglass appears only while a reader is actively moving through the reading or reply surfaces. It never floats over the Library, the writing archive, navigation, or important copy.
2. **Focused reading is text-first.** Entering full-screen reading keeps Cura and the close action visible, but the timer begins collapsed. The title and opening text remain in the first mobile viewport; the hourglass expands only when the reader asks for it.
3. **An empty archive is still a path.** When no reply exists, Your Writing offers a direct capsule action back to Today as well as the local-file import path.
4. **Return means resume.** A saved paragraph changes the home action from a generic beginning to a contextual continuation naming the current text and paragraph. Activating it opens the saved passage directly.
5. **Shared links carry Cura Reader.** The production page includes canonical, Open Graph, and X card metadata backed by a purpose-made 1200 × 630 image using the CURA wordmark.
6. **The practice survives a lost connection.** Cura publishes an app manifest and a small first-party service worker. After one successful production visit, the shell and previously opened readings remain available offline. Offline support never uploads or broadens access to private writing.
7. **Focus is visible before scrolling.** Opening a work places the shared focus-entry capsule directly after the reading title in the first desktop and mobile viewport.
8. **The handheld header does not wrap.** CURA, close, language, Notes, and Aa stay immediate. Display choices remain in Aa; Pop out and browser fullscreen stay on wider screens.
9. **The close mirrors the open.** WRITE A REPLY uses the shared capsule at the end of focused reading. Its chevrons move to adjacent readings; Notes and Interpretation remain quieter routes at 200% zoom.
10. **Narrow reading stays legible.** An untouched handheld profile uses ragged-left text without forced hyphenation. Explicit reader preferences remain local and always take precedence.
11. **Position stays local and quiet.** A one-pixel vermilion rail orients without scoring. The current paragraph, bookmarks, and resume target persist reliably on the device, and touch bookmark targets remain at least 44px.

For every change above, validation covers a phone-sized viewport and desktop, keyboard-safe return paths, reduced motion, a production build, unit tests, and the Sites handoff tests.

## Visual language

- Warm paper (`#f3efe7`), near-black ink (`#24221f`), one vermilion accent (`#b44932`).
- A restrained violet marker appears only on a selected contextual phrase and its reading-focus cue. Margin notes keep the vermilion and ink system.
- Dark mode reverses the same materials into warm ink on charcoal paper. It adds no new ornament.
- Cormorant Garamond for reading; Inter for orientation and controls.
- Space is structural: asymmetry, long pauses, hairlines, and restrained density.
- No cards, shadows, decorative illustrations, gradients, or ornamental “Japanese” motifs.
- Motion is limited to purposeful scrolling and respects reduced-motion settings.
- Reader controls stay compact: three type sizes, two line-height choices, and local position memory.
- Side notes align with the selected passage on wide screens and become a bottom sheet before they can overlap the letter.
- Word definitions use the same outlined capsule and circular-close grammar as the shelf. The definition stays unboxed in a safe desktop margin and becomes a compact centered sheet on smaller screens. Successful lookups are cached locally and remain attributed to Wiktionary under CC BY-SA.
- The full-screen reader includes a private notebook with typed and freehand modes. Annotations attach to the whole letter or the selected contextual passage and remain on the device.
- A reader can select text within one paragraph, keep a violet highlight, attach a typed or handwritten note, and return through the notebook’s Highlights list. Highlights remain language-specific and local.
- Paragraph bookmarks persist immediately, remain discoverable on touch screens, reject duplicate return points, and restore both scroll position and keyboard orientation.
- Selection paint is clipped to the centered reading measure and follows only the selected line fragments. It never washes across the full-screen canvas.
- A saved source passage can open the device share sheet, an X composer, or copy a link. Cura shares only that passage, attribution, source link, and `#CuraReading`; notes and replies remain private unless the reader copies them separately.
- Letters download as Markdown, text, or a restorable Cura JSON backup. Local import and print-to-PDF never upload writing or annotations.
- The reply editor keeps Markdown as readable source and offers a quiet reading preview. Cura renders a small safe subset without accepting raw HTML; its own Markdown files reopen without duplicating the letter title.
- Roman letter numbers are derived from the numeric letter ID and localized automatically. They appear as quiet orientation, never as text the reader must maintain.
- The Obsidian path creates one portable Markdown note containing the source text, the reply, highlights, typed notes, metadata, and source link. Cura writes only to a folder the reader selects and falls back to a normal download.
- An optional dated reading timer lives inside a tactile hourglass. The upper sand chamber empties as the lower chamber fills; the stream pauses with the timer. Duration, countdown, start, pause, and reset stay on the object so reading remains central.
- The hourglass never becomes a productivity score. It makes chosen reading time perceptible and gives no streak, alarm, or performance judgment.
- The compact hourglass keeps the 10, 15, 20, and 30-minute budget visible while the reader moves through the text or reply.
- A vanitas still life appears only near the end of the practice. It recalls time and mortality without interrupting the source text or turning the interface into a warning.
- The Read, Note, Write, and Keep stages are working navigation. Each stage moves to the relevant surface and reflects the reader’s current place.
- Full-screen reading ends with three clear exits: write a reply, open notes, or return to the interpretation. Escape and the header return remain available throughout.
- Author and work selectors form the stable collection navigation. New authors and books enter through content data without adding another row of controls.

## Content

- Distinguish Seneca’s Latin, Cura’s translation, and Cura’s interpretation.
- Cite the source and avoid presenting paraphrase as quotation.
- Ship only content with a clear reuse basis; new Cura text is CC BY 4.0.
- Verify the original work and each translation independently. Keep protected works out of the reading corpus unless Cura has permission.
- English and French have equal status. New languages implement the same content schema.

## Accessibility

- Semantic landmarks, visible keyboard focus, a skip link, meaningful language metadata.
- Body text remains readable from 320 px upward and at browser zoom.
- Color is never the only carrier of state; contrast targets WCAG 2.2 AA.

## Collection boundary

The library contains all 124 Seneca letters, all twelve books of Marcus Aurelius’s *Meditations*, Epictetus’s opening *Enchiridion* passage, the twelve essays in Emerson’s *Society and Solitude*, and *Self-Reliance*. Letters 1–20 and 32 include a close Cura reading guide; the remaining Seneca letters use a clearly framed reading lens until a letter-specific guide is edited and reviewed. New authors enter one verified bilingual edition at a time.
