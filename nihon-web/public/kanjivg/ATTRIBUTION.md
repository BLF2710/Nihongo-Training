# KanjiVG kana stroke data

Copyright © Ulrich Apel and KanjiVG contributors.
Source: https://kanjivg.tagaini.net/ and https://github.com/KanjiVG/kanjivg
Pinned revision: 422b5538595676da918c288a4230cb5e22a1ee7e
License: Creative Commons Attribution-ShareAlike 3.0 Unported
https://creativecommons.org/licenses/by-sa/3.0/
Full license: COPYING in this directory.

The bundled SVG files are unmodified upstream assets retaining their copyright
headers. src/data/kanaStrokes.json extracts their ordered path geometry without
altering coordinates. The extracted dataset is distributed under CC BY-SA 3.0.
Our viewer changes presentation colors and animates the original ordered paths.
Contracted sounds display the two original character diagrams side by side;
the second diagram is the verified small kana, not a fabricated combined path.

Reproduce this import using node scripts/import-kana-strokes.mjs in nihon-web.
The importer verifies exact character labels and sequential stroke IDs and
reports unsupported characters. No stroke paths are manually authored.

Verified coverage: 154 individual characters (74 Hiragana and 80 Katakana,
including small kana and ヴ), covering all 246 learning entries: 104 Hiragana
and 142 Katakana. None of the configured combinations lack component paths.
