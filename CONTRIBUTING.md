# Contributing

Thank you for helping Cura grow slowly and carefully.

## Before opening a pull request

1. Open an issue for substantial design, content, or architecture changes.
2. Keep the `read → consider → write back → return` flow and the boundaries in [`DESIGN_CONTRACT.md`](DESIGN_CONTRACT.md).
3. Run `npm run build` and `npm test`.
4. Explain the content source, translation authorship, and reuse rights in the pull request.

## Add a language

1. Add interface strings to `src/i18n/copy.js` using the existing key set.
2. Add the locale’s source mapping and content schema under `src/content/`.
3. Add the locale to the language switcher in `src/App.jsx`.
4. Verify layout, accents, document language, and date formatting at desktop and mobile widths.

The generated English and French collection remains separate from Cura’s edited reading guides so source updates do not overwrite interpretation.

## Content standard

- Work from the public-domain Latin text and cite the edition.
- Mark quotation, fresh translation, and interpretation distinctly.
- Do not submit a modern translation unless its license clearly allows repository redistribution.
- Prefer a lucid, faithful translation over archaic imitation.
- Explain genuine interpretive uncertainty instead of smoothing it away.

By contributing code, you agree to license it under MIT. By contributing original content or assets, you agree to license them under CC BY 4.0.
