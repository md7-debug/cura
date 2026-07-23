# Cura

**Read one passage. Consider one idea. Write back. Return to yourself.**

Cura is a bilingual, private-by-default reading practice for public-domain philosophical and reflective texts. The name evokes *cura sui*, or care of the self. Like tending an inner garden or polishing one facet of a stone, the practice stays small and rewards attention.

The library starts with all 124 of Seneca’s letters, all twelve books of Marcus Aurelius’s *Meditations*, Epictetus’s opening *Enchiridion* passage, all twelve essays in Emerson’s *Society and Solitude*, and *Self-Reliance*. Every reading is available in English and French. Cura includes focused reading, a resizable pop-out reader, contextual notes, concise interpretation, one writing invitation per text, a progressive hourglass session timer, local autosave, Markdown and Obsidian workflows, explicit passage sharing, light and dark modes, and a restrained responsive interface.

## Principles

- Reading before explanation
- Interpretation without simplification
- Writing without performance
- Privacy without an account
- Progress as patient return, not measurement
- English and French as equal first languages, with a small extension path

See the short [`DESIGN_CONTRACT.md`](DESIGN_CONTRACT.md) for the product boundaries.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run build
npm test
```

## Project structure

```text
src/
  content/       Public-domain readings and interpretations
  i18n/          Interface language strings
  lib/           Local persistence
  App.jsx        Reading, library, and writing flows
  styles.css     Visual system and responsive layout
public/assets/   Locally served visual assets
tests/           Storage and static-hosting tests
```

## Content status

Cura bundles all 124 Seneca letters, all twelve books of Marcus Aurelius’s *Meditations*, and thirteen Emerson essays from documented public-domain editions. Letter 32 also includes Cura’s original translation and contextual language notes. Epictetus’s opening *Enchiridion* passage uses separately documented public-domain editions. See [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) for source links and reuse details.

Requested authors appear only after the source text and each translation pass a rights review. Pierre Hadot remains a guide-only influence because his works are still protected in the UK. Simone Weil’s French originals and any English translation are reviewed separately.

Letters 1–20 and 32 include a letter-specific Cura reading guide. The remaining letters use a consistent reading lens until an editor adds and reviews a close guide. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Obsidian workflow

Each saved reply can become one complete Markdown note containing the source reading, the reader’s reply, source metadata, highlights, and typed notes. Supported browsers can write that note directly to a selected local vault folder. Other browsers download the same file for placement in a vault. Cura also provides a daily template and a core-search index without requiring an Obsidian community plugin.

## Privacy and accessibility

Journal text stays in browser storage; there is no account, analytics, cookie banner, or server-side journal. Read [`PRIVACY.md`](PRIVACY.md) and [`ACCESSIBILITY.md`](ACCESSIBILITY.md).

Readers can share a saved source passage through the device share sheet, open an X composer, or copy it with its source link and `#CuraReading`. Cura never adds personal notes or replies to a share.

## Licenses

- Code: [MIT](LICENSE)
- Original Cura translation, interpretation, copy, documentation, and texture: [CC BY 4.0](CONTENT-LICENSE.md)
- Third-party acknowledgements: [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md)
- Generated closing still life: CC0 1.0 to the extent any copyright or related rights exist

“Cura” is a project name, not legal, medical, or mental-health advice.
