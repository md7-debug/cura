# Attributions

Cura Reader combines public-domain texts, open-source software, and original Cura assets. This file records the source and reuse basis for each published part.

## Texts and translations

- Seneca, *Epistulae Morales ad Lucilium*, all 124 letters.
  - English: Richard M. Gummere, *Moral Letters to Lucilius* (1917–1925), public domain, transcribed by [Wikisource](https://en.wikisource.org/wiki/Moral_letters_to_Lucilius).
  - French: Joseph Baillard, *Lettres à Lucilius* (1914), public domain, transcribed by [Wikisource](https://fr.wikisource.org/wiki/Lettres_%C3%A0_Lucilius).
  - Letter 32 also includes Cura’s original translation from the public-domain Latin, released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Marcus Aurelius, *Meditations*, all twelve books.
  - English: George Long (1862), public domain, via [Wikisource](https://en.wikisource.org/wiki/The_Thoughts_of_the_Emperor_Marcus_Aurelius_Antoninus).
  - French: Jules Barthélemy-Saint-Hilaire (1876), public domain, via [Wikisource](https://fr.wikisource.org/wiki/Pens%C3%A9es_pour_moi-m%C3%AAme).
- Epictetus, *Enchiridion*, I.
  - English: Elizabeth Carter, via [Wikisource](https://en.wikisource.org/wiki/All_the_Works_of_Epictetus,_Which_Are_Now_Extant/The_Encheiridion).
  - French: Jean-Marie Guyau, via [Wikisource](https://fr.wikisource.org/wiki/Manuel_d%E2%80%99%C3%89pict%C3%A8te_%28trad._Guyau%29/Texte_entier).
- Ralph Waldo Emerson, *Society and Solitude*, all twelve essays.
  - English: original 1870 edition, public domain, via [Project Gutenberg](https://www.gutenberg.org/ebooks/69258).
  - French: Marie Dugard (1911), public domain in life-plus-70 jurisdictions, transcribed by [Wikisource](https://fr.wikisource.org/wiki/Soci%C3%A9t%C3%A9_et_Solitude).
- Ralph Waldo Emerson, *Self-Reliance*.
  - English: original 1841 edition, public domain, via [Project Gutenberg](https://www.gutenberg.org/ebooks/2944).
  - French: Émile Montégut (1851), public domain. Cura’s transcription is generated from the [Bibliothèque nationale de France scan](https://gallica.bnf.fr/ark:/12148/bpt6k272222p).
- Ecclesiastes 1:2 appears in the public-domain King James Version and Louis Segond 1910 editions, linked in the interface through Wikisource.

The generated collection keeps a direct source URL for every text and language. The rebuild scripts are documented in `scripts/` and fetch only the editions named above.

## Dictionary content

Reader-requested definitions come from the English and French editions of Wiktionary through Wikimedia REST and MediaWiki APIs. Entries are credited in the interface and are available under CC BY-SA 4.0. See [English Wiktionary copyright](https://en.wiktionary.org/wiki/Wiktionary:Copyrights) and [French Wiktionary reuse terms](https://fr.wiktionary.org/wiki/Wiktionnaire:R%C3%A9utilisation_du_contenu_du_Wiktionnaire).

## Typefaces and interface libraries

- Cormorant Garamond by Christian Thalmann: SIL Open Font License 1.1, distributed through `@fontsource/cormorant-garamond`.
- Inter by Rasmus Andersson: SIL Open Font License 1.1, distributed through `@fontsource/inter`.
- Allura by Robert E. Leuschke: SIL Open Font License 1.1, distributed through `@fontsource/allura`.
- [Three.js](https://github.com/mrdoob/three.js): MIT License.
- [Phosphor Icons](https://github.com/phosphor-icons/core): MIT License.

## Original Cura assets

- The paper texture was generated specifically for Cura.
- The interactive hourglass is an original Cura Three.js model built from extruded and lathed geometry. Its capsule frame, glass, vermilion axis, materials, sand, and turning motion were created specifically for Cura from a text-only design brief. It does not incorporate the earlier unidentified online image.
- The collection covers and the seven Personal Edition covers were generated specifically for Cura. They contain no third-party book titles, logos, or publisher artwork.
- The closing memento painting was generated specifically for Cura from a text-only design brief. Its candle, blank letter, pomegranate, living sprig, vermilion thread, composition, and painterly treatment do not incorporate a supplied or referenced image.

To the extent copyright or related rights apply, Max Ducroisy makes the paper texture, interactive hourglass design, Cura cover artwork, and closing memento painting available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit: **Max Ducroisy / Cura Reader**.

## Design and interaction references

- Cura’s spatial shelf and book-opening transitions were informed by Meng To’s [complete-shelf](https://github.com/mengto/complete-shelf), which cites [Stripe Press](https://press.stripe.com/) as a visual reference.

Cura’s implementation, cover artwork, textures, layouts, and content are original. Cura is not affiliated with Meng To, Stripe Press, or Stripe and does not distribute code or artwork from those references.
