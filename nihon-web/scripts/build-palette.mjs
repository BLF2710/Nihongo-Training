#!/usr/bin/env node
// Writes src/palette.css: the site's colours in the island map's palette, for the light and the dark theme.
//   node scripts/build-palette.mjs
//
// Every Tailwind colour class reads a CSS variable (bg-gray-50 -> var(--color-gray-50)), so retinting the variables
// recolours the whole site without touching a component.
// - Light: the families the site leans on take traditional Japanese hues: washi paper and sumi ink for gray (white
//   surfaces become a paler washi), ai-zome blue for emerald (the primary colour), asagi blue for teal, wisteria for
//   indigo, gold leaf for amber, vermilion for red. Each shade keeps Tailwind's lightness, so contrast holds.
// - Dark: each shade takes the value of its mirror (50 <-> 950, 100 <-> 900, ... 500 stays), so pale backgrounds become
//   dark, dark text becomes light, and accents keep their hue, without a `dark:` class on every element. Its greys stay
//   Tailwind's cool blue-grey (a night sky) rather than washi.
// Key text and button pairs are checked against WCAG AA; the script stops if one falls short.
// Re-run it after upgrading Tailwind, changing a tint, or when the site starts using a new colour family.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const theme = readFileSync(join(root, "node_modules/tailwindcss/theme.css"), "utf8");
const FAMILIES = ["gray", "emerald", "teal", "green", "indigo", "blue", "purple", "red", "orange", "amber"];
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const MIN_CONTRAST = 4.5;

/** A Tailwind colour as { l, c, h } (lightness in %). */
function tailwind(family, shade) {
  const match = theme.match(new RegExp(`--color-${family}-${shade}:\\s*oklch\\(([\\d.]+)% ([\\d.]+) ([\\d.]+)\\);`));
  if (!match) throw new Error(`Tailwind has no oklch --color-${family}-${shade}`);
  return { l: Number(match[1]), c: Number(match[2]), h: Number(match[3]) };
}
const css = ({ l, c, h }) => `oklch(${+l.toFixed(1)}% ${+c.toFixed(3)} ${+h.toFixed(1)})`;

// The hues. Chroma is scaled down a little for an earthier, printed look; gray gets a floor so it reads as warm paper
// rather than cool blue-grey. The class names stay (emerald, indigo); only their colours change.
const TINTS = {
  gray: { hue: 75, chroma: c => Math.max(c * 0.6, 0.01) },
  emerald: { hue: 252, chroma: c => c * 0.75 },
  teal: { hue: 225, chroma: c => c * 0.7 },
  indigo: { hue: 305, chroma: c => c * 0.6 },
  amber: { hue: 80, chroma: c => c * 0.85 },
  red: { hue: 32, chroma: c => c * 0.95 },
};
const tint = (family, colour) => TINTS[family] ? { l: colour.l, c: TINTS[family].chroma(colour.c), h: TINTS[family].hue } : colour;
const base = (family, shade) => tint(family, tailwind(family, shade));
/** A washi tone at an exact lightness and chroma. */
const washi = (l, c) => ({ l, c, h: TINTS.gray.hue });

// Light-theme contrast fixes (WCAG AA): gray-500 secondary text and gray-400 hints are darkened to read on the washi
// page (Tailwind's gray-400 is about 2.6:1 on white), and emerald-600 is darkened so white text on primary buttons passes; emerald-700 moves down a step too, so hovers show.
const LIGHT_LIGHTNESS = { gray: { 400: 53, 500: 52 }, emerald: { 600: 53.5, 700: 48 } };
// The page and chips are a deeper washi than Tailwind's near-white, so the paler washi of cards and bars stands out.
const LIGHT_GRAY = { 50: [96.6, 0.017], 100: [94.8, 0.017] };
const light = (family, shade) => {
  const tuned = family === "gray" ? LIGHT_GRAY[shade] : undefined;
  if (tuned) return washi(...tuned);
  const colour = base(family, shade);
  return { ...colour, l: LIGHT_LIGHTNESS[family]?.[shade] ?? colour.l };
};

// Dark greys carry surfaces, borders and text, so they are tuned rather than mirrored exactly:
// page < chips < cards, borders that stay visible on cards, and secondary text that stays readable.
const DARK_GRAY = { 100: [20, 0.032, 263], 200: [33, 0.03, 258], 400: [66, 0.024, 262], 500: [70.7, 0.022, 261.3], 600: [80, 0.02, 260] };
const mirror = shade => (shade === 500 ? 500 : 1000 - shade);
const dark = (family, shade) => {
  if (family !== "gray") return base(family, mirror(shade));
  const tuned = DARK_GRAY[shade];
  return tuned ? { l: tuned[0], c: tuned[1], h: tuned[2] } : tailwind("gray", mirror(shade));
};
// In the dark theme white surfaces (cards, inputs) become the darkest raised surface, and white text on accents dark.
const DARK_WHITE = { l: 24, c: 0.03, h: 262 };
// In the light theme white surfaces (cards, the top bar, inputs) and white text on accents are a pale washi.
const WHITE = washi(99.3, 0.008);

/** WCAG relative luminance of an OKLCH colour (clipped to sRGB). */
function luminance({ l, c, h }) {
  const L = l / 100, a = c * Math.cos((h * Math.PI) / 180), b = c * Math.sin((h * Math.PI) / 180);
  const [lc, mc, sc] = [L + 0.3963377774 * a + 0.2158037573 * b, L - 0.1055613458 * a - 0.0638541728 * b, L - 0.0894841775 * a - 1.291485548 * b].map(v => v ** 3);
  const rgb = [4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc, -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc, -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc];
  const [r, g, bl] = rgb.map(v => Math.min(1, Math.max(0, v)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}
const contrast = (x, y) => { const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };

// Pairs the site relies on: [label, text, background].
const CHECKS = [
  ...[["light", light, WHITE], ["dark", dark, DARK_WHITE]].flatMap(([mode, shade, white]) => [
    [`${mode}: body text on the page`, shade("gray", 900), shade("gray", 50)],
    [`${mode}: secondary text on cards`, shade("gray", 500), white],
    [`${mode}: secondary text on the page`, shade("gray", 500), shade("gray", 50)],
    [`${mode}: links on cards`, shade("emerald", 700), white],
    [`${mode}: "Correct!" on cards`, shade("emerald", 700), white],
    [`${mode}: "Not quite." on cards`, shade("red", 700), white],
    [`${mode}: indigo links on cards`, shade("indigo", 700), white],
    [`${mode}: warnings on amber`, shade("amber", 900), shade("amber", 50)],
  ]),
  ["light: hints on cards", light("gray", 400), WHITE],
  ["light: hints on the page", light("gray", 400), light("gray", 50)],
  ["light: white on primary buttons", WHITE, light("emerald", 600)],
  ["light: white on indigo buttons", WHITE, light("indigo", 600)],
  // The dashboard's next-step card (src/pages/noticeBoard.css): pale text on a mid blue in both themes.
  ["light: next-step card text", WHITE, light("emerald", 600)],
  ["light: next-step card text on asagi", WHITE, light("teal", 700)],
  ["light: next-step card labels", light("emerald", 50), light("emerald", 600)],
  ["dark: next-step card text", dark("gray", 950), dark("emerald", 300)],
  ["dark: next-step card text on asagi", dark("gray", 950), dark("teal", 300)],
  ["dark: next-step card labels", dark("emerald", 950), dark("emerald", 300)],
];
const failures = CHECKS.map(([label, text, background]) => ({ label, ratio: contrast(text, background) })).filter(check => check.ratio < MIN_CONTRAST);
if (failures.length) {
  failures.forEach(({ label, ratio }) => console.error(`Too little contrast: ${label} is ${ratio.toFixed(2)}:1`));
  process.exit(1);
}

const block = (selector, shadeOf, extra) => `${selector} {\n${extra}${FAMILIES.flatMap(family => SHADES.map(shade => `  --color-${family}-${shade}: ${css(shadeOf(family, shade))};`)).join("\n")}\n}`;
const output = `/* Generated by scripts/build-palette.mjs. Do not edit by hand. */
/* The island palette: Tailwind's colour scales retinted (light) and mirrored (dark), so every colour class adapts. */
${block(":root:not(.dark)", light, `  --color-white: ${css(WHITE)};
`)}
${block(".dark", dark, `  color-scheme: dark;\n  --color-white: ${css(DARK_WHITE)};\n`)}
`;
writeFileSync(join(root, "src/palette.css"), output);
console.log(`Wrote src/palette.css (${FAMILIES.length} colour families; ${CHECKS.length} contrast pairs pass ${MIN_CONTRAST}:1).`);
