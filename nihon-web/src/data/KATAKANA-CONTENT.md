# Katakana learning coverage

The learning catalog in `katakanaLearning.ts` explicitly declares teaching order:
46 basic, 20 dakuten, 5 handakuten, 33 yōon, and 38 extended combinations.
All combinations requested for this expansion are included; none are excluded.
The earlier implementation stopped at the 71 single-character quiz records.

The catalog reuses those records' IDs by matching the character, preserving
existing links. Additional entries have stable negative IDs derived from their
Unicode sequence. These are learning content identities, never game records.
Ordering and sections come from the configured rows, not database IDs or sorting.
No migration, quiz change, API addition, or XP/progress write is required.

## Spelling references and uncommon examples

Japanese Agency for Cultural Affairs, *Spelling of Foreign Words*:
- https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/gairai/honbun01.html
- https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/gairai/honbun02.html
- https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/gairai/honbun05.html

The later extended rows are specialized foreign-sound transcriptions, not equally
common beginner spellings. The official guidance leaves some such transcriptions
unprescribed. Alternative spellings are noted where relevant. Romaji is a sound
guide, not a claim that all these spellings are common vocabulary.

ドゥ, スィ, ズィ, テュ, ニェ, ヒェ, and ミェ have no forced beginner vocabulary
example. Their details explicitly explain the absence. They still support audio,
verified component stroke order, and tracing. Rare yōon/native-word examples
are labelled, rather than presented as everyday loanwords.

## Stroke data and verification

All 80 individual Katakana glyphs used by the catalog are present in the pinned
KanjiVG source, including ヴ and the eight small vowel/y kana. Multi-character
entries animate original component paths from left to right, without invented
combined paths. See `public/kanjivg/ATTRIBUTION.md` and `COPYING` for CC BY-SA 3.0.

Run `node scripts/verify-katakana-learning.mjs` to verify counts, exact requested
sets, the 30 requested samples, examples, audio text inputs, route identity,
teaching order, and extracted path equality with all bundled upstream SVG files.
This does not test audible voice quality, pointer hardware, or browser layout.
