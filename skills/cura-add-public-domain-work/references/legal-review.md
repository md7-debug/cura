# Mandatory legal review for a Cura work

Complete this review for the exact material Cura will distribute. This is a publication risk-control workflow, not legal advice. When evidence is incomplete or the law is uncertain, block release and obtain advice from a qualified intellectual-property lawyer.

## 1. Define the release and jurisdictions

- Record whether Cura will reproduce, translate, adapt, annotate, display, download, cache offline, export, print, and share the material.
- Record every deliberately targeted jurisdiction.
- Because the current public web release is not geo-restricted, review at least the United Kingdom, the relevant European Union source country, and the United States.
- Never write `public domain worldwide`. Copyright status is jurisdiction-specific.

Use current official sources. Start with:

- UK Intellectual Property Office: [copyright duration](https://www.gov.uk/copyright/how-long-copyright-lasts), [detailed term notice](https://www.gov.uk/government/publications/copyright-notice-duration-of-copyright-term/copyright-notice-duration-of-copyright-term), and [rights granted by copyright](https://www.gov.uk/guidance/the-rights-granted-by-copyright).
- European Union: [Directive 2006/116/EC on copyright term](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32006L0116) plus the source country's implementing law and official guidance.
- United States Copyright Office: [duration FAQ](https://www.copyright.gov/help/faq/faq-duration.html), [Circular 15A](https://www.copyright.gov/circs/circ15a.pdf), [17 U.S.C. chapter 3](https://www.copyright.gov/title17/92chap3.html), and [restored foreign copyrights under 17 U.S.C. 104A](https://www.copyright.gov/title17/92chap1.html#104a).

Recheck these sources at each intake. Do not hard-code a changing public-domain cutoff year into the skill.

## 2. Identify every rights-bearing layer

Make a separate row for:

1. underlying original work;
2. each volume, instalment, chapter, letter, or posthumously issued portion;
3. English translation;
4. French translation;
5. critical edition, selection, arrangement, introduction, footnotes, and annotations;
6. transcription or database extract;
7. scan, photograph, facsimile, or manuscript image;
8. Cura translation, guide, contextual note, cover, illustration, and social image;
9. embedded fonts, libraries, and other third-party assets.

One cleared layer does not clear another. A public-domain original does not clear a modern translation, introduction, critical apparatus, cover, or website transcription.

## 3. Calculate the underlying-work term

For every target jurisdiction, record:

- author identity, nationality, domicile, and death date;
- joint authors and the last-surviving author's death date;
- anonymous or pseudonymous status;
- creation, lawful first-publication, and first-publication-country dates;
- unpublished and posthumous history;
- whether separate volumes or instalments carry separate terms;
- wartime extensions, transitional rules, revived rights, and country-specific exceptions;
- the exact statutory rule, calculation, and first date on which the work is reusable.

For the UK, explicitly check the special treatment of some unpublished works and the transitional protection that can run to 31 December 2039. Check the separate 25-year term for a published edition's typographical arrangement.

For the US, do not apply a simple life-plus-70 rule to older publications. Check publication date, notice, registration, renewal where relevant, unpublished-work rules, and whether copyright in a foreign work was restored under the Uruguay Round Agreements Act. Search the Copyright Office records when the result depends on registration, renewal, or a Notice of Intent to Enforce.

For EU distribution, check Directive 2006/116/EC and the source country's implementation, including posthumous publication and any exceptional national rules.

## 4. Clear each translation and edition

For English and French separately:

- identify the exact edition displayed by Cura;
- identify every translator, editor, annotator, and contributor;
- record their death dates and the edition's lawful publication date;
- calculate the term in every target jurisdiction;
- exclude protected editorial matter when only the translation is clear;
- compare the ingested text against that exact edition so Cura does not accidentally mix later revisions;
- preserve a direct source link and bibliographic record.

If Cura creates a fresh translation, verify the underlying text is reusable, identify the human authorship and review process accurately, and apply the declared Cura content licence. Do not falsely attribute a Cura translation to the source edition.

## 5. Clear the source copy and site terms

- Read the source repository's reuse statement and terms of use.
- Distinguish copyright in the text from contractual limits, database rights, scan rights, photographic rights, watermarks, and the edition's typographical arrangement.
- Record whether the source supplies a faithful transcription, OCR, facsimile, or editorially corrected text.
- Keep required attribution and provenance notices.
- Do not treat `available online`, `free to read`, `no known copyright`, or an absent copyright notice as permission.
- For Project Gutenberg or another jurisdiction-limited source, check the stated geographic limitation and the law where Cura distributes the copy.

## 6. Validate any licence

Record the exact licence name, version, licensor, URL, and retrieval date. Confirm that it covers every intended Cura use, including reproduction, public distribution, adaptation or translation, offline caching, export, social sharing, and commercial use if Cura may ever be used commercially.

Check and satisfy:

- attribution and attribution-placement requirements;
- share-alike obligations and licence compatibility;
- no-derivatives restrictions before editing, translating, excerpting, or annotating;
- non-commercial restrictions before any use that could be considered commercial;
- source, notice, warranty-disclaimer, and modification-marking requirements;
- whether sublicensing is permitted or whether the material must remain under its original terms.

Do not imply that Cura's AGPL software licence covers public-domain texts or CC-licensed assets. Keep software, source texts, and original Cura content clearly separated in `ATTRIBUTIONS.md` and repository notices.

## 7. Check moral rights, attribution, and integrity

- Credit authors, translators, editors, repositories, and licensors as required.
- Do not falsely attribute a translation, edit, or image.
- Mark abridgements, modernisations, corrections, and Cura-authored additions.
- Check applicable rights of attribution and integrity even when economic copyright is owned, licensed, waived, or expired.
- Avoid cover treatments, titles, logos, or trade dress that suggest endorsement by an author estate, publisher, library, Meng To, Stripe Press, or another third party.

## 8. Preserve evidence and sign off

For every conclusion, keep:

- authoritative catalogue or registry record;
- official legal source;
- source page and reuse terms;
- edition title page or bibliographic record;
- translator/editor identity and dates;
- licence text and version;
- calculation and access date;
- reviewer, decision date, and unresolved assumptions.

Use `PASS`, `BLOCKED`, or `COUNSEL REQUIRED` for every layer and jurisdiction. Only `PASS` may enter the published corpus. A later source, edition, translation, or asset change reopens the relevant legal gates.

## Immediate blockers

Block publication when any of these apply:

- exact work or edition is unidentified;
- translator, editor, contributor, publication date, or source country is unknown;
- the work was unpublished or first published posthumously and the special term has not been resolved;
- US foreign-work restoration could apply and has not been checked;
- the source offers access but no clear reuse basis;
- a licence conflicts with Cura's intended reproduction, adaptation, export, or sharing;
- an included introduction, note, scan, image, cover, or typography layer is still protected or unclear;
- authoritative sources conflict;
- the conclusion depends only on an automated calculator, a search snippet, a community assertion, or the author's death year.
