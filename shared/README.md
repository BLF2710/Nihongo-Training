# Verified Kanji reference data

`kanji.json` contains a small course-specific derivative of KANJIDIC2 and JMdict.
Copyright © James William BREEN and the Electronic Dictionary Research and
Development Group (EDRDG).

The dictionary-derived data and its adaptations in this file are distributed under
[Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
See the [EDRDG licence statement](https://www.edrdg.org/edrdg/licence.html) and
[full CC BY-SA 4.0 legal code](https://creativecommons.org/licenses/by-sa/4.0/legalcode).
This data licence does not change the licence of the application code.

Sources:

- [KANJIDIC project documentation](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project)
- [JMdict project documentation](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project)
- [kanjiapi.dev](https://kanjiapi.dev/) exposes those datasets in JSON.
- Each record/form includes its exact retrieval URL and the snapshot records its retrieval date.

Changes: selected ten characters and nine spellings matching existing course vocabulary;
renamed fields; excluded name readings and unrelated metadata; added stable IDs, course
relationships, and explicit introduction mappings. Dictionary meanings/readings/stroke
counts are retained, including dictionary dot/hyphen notation. Modern JLPT labels are
left null instead of treating inferred source levels as official classifications.
Vocabulary meanings remain in the existing course data, not in this dictionary subset.

This reference catalog contains no stroke paths or textbook media and makes no external
runtime dictionary requests. Separately licensed KanjiVG paths are bundled by the
frontend's existing Kana importer; see `nihon-web/public/kanjivg/ATTRIBUTION.md`.

## Updating

Before releases, and at least monthly for a hosted dictionary display, run
`node scripts/check-kanji-sources.cjs` from `nihon-api`. This is a read-only check;
it requires network access. Review reported changes against the upstream source,
update the selected fields in this file, advance the retrieval date only after verification,
and run the Kanji/course tests. Preserve this attribution and the source links.
Do not automatically replace course readings with rare dictionary variants.
