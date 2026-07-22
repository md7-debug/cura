# Cura

**Read Seneca. Consider one idea. Write back. Return to yourself.**

Cura is a bilingual, private-by-default reading practice for Seneca’s *Letters to Lucilius*. The name evokes *cura sui*, or care of the self. Like tending an inner garden or polishing one facet of a stone, the practice stays small and rewards attention.

The library includes all 124 letters in English and French, focused reading, contextual notes, concise interpretation, one writing invitation per letter, local autosave, Markdown and Obsidian workflows, light and dark modes, and a restrained responsive interface.

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
  content/       Seneca translations and interpretations
  i18n/          Interface language strings
  lib/           Local persistence
  App.jsx        Reading, library, and writing flows
  styles.css     Visual system and responsive layout
public/assets/   Locally served visual assets
tests/           Storage and static-hosting tests
```

## Content status

Cura bundles all 124 letters from public-domain editions: Richard M. Gummere’s English translation and Joseph Baillard’s French translation, sourced from Wikisource. Letter 32 also includes Cura’s original translation and contextual language notes. See [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) for source links and reuse details.

Letters 1–20 and 32 include a letter-specific Cura reading guide. The remaining letters use a consistent reading lens until an editor adds and reviews a close guide. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Obsidian workflow

Each saved reply can become one complete Markdown note containing Seneca’s original letter, the reader’s reply, source metadata, highlights, and typed notes. Supported browsers can write that note directly to a selected local vault folder. Other browsers download the same file for placement in a vault. Cura also provides a daily template and a core-search index without requiring an Obsidian community plugin.

## Privacy and accessibility

Journal text stays in browser storage; there is no account, analytics, cookie banner, or server-side journal. Read [`PRIVACY.md`](PRIVACY.md) and [`ACCESSIBILITY.md`](ACCESSIBILITY.md).

## Licenses

- Code: [MIT](LICENSE)
- Original Cura translation, interpretation, copy, documentation, and texture: [CC BY 4.0](CONTENT-LICENSE.md)
- Third-party acknowledgements: [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md)

“Cura” is a project name, not legal, medical, or mental-health advice.
