import type { CharacterId } from "../../lib/cast.ts";
import type { IslandId } from "../../lib/islandMap.ts";

// What the guest landing says: Hakase's welcome, and each island's character introducing their part of the site,
// in Japanese with English beside it.

export type CastIntroduction = { character: CharacterId; island: IslandId; japanese: string; english: string };

export const GUEST_WELCOME = {
  japanese: "ようこそ！ わたしは はかせ です。",
  // The short line is for phones, where the welcome shares the screen with the whole island.
  englishShort: "Welcome! Start on the Kana island: you'll read Japanese in a minute.",
  english: "Welcome! I'm Hakase. The island is in fog until you start. Visit the Kana island and you'll read your first Japanese word in about a minute.",
} as const;

/** The islands a guest can visit before they have an account; the rest are in fog. */
export const GUEST_OPEN_ISLANDS: readonly IslandId[] = ["home", "kana"];

export const CAST_INTRODUCTIONS: readonly CastIntroduction[] = [
  { character: "chun", island: "kana", japanese: "ひらがなと カタカナ、いっしょに！", english: "Hiragana and katakana with stroke order, sounds and speed quizzes. Start here." },
  { character: "hakase", island: "lessons", japanese: "N5から N1まで おしえます。", english: "Step-by-step units from N5 up: words, grammar and dialogues, each closed by a short assessment." },
  { character: "tama", island: "practice", japanese: "きいて、はなして、よんで。", english: "Listening, speaking and reading practice. Say it aloud and I'll check it." },
  { character: "zen", island: "review", japanese: "わすれないように。", english: "A daily review that brings back each word just before you'd forget it." },
  { character: "tsuru", island: "kanji", japanese: "いっかく ずつ。", english: "Kanji one stroke at a time: meanings, readings and the words they make." },
  { character: "pon", island: "games", japanese: "あそびましょう！", english: "Games in Japanese: errands in the village, particles against the clock." },
  { character: "sensei", island: "teahouse", japanese: "なんでも きいて ください。", english: "Stuck on a grammar point? Ask me anything over a cup of tea." },
  { character: "kurama", island: "fuji", japanese: "やまを のぼろう。", english: "Climb from N5 to N1 with timed mock exams at every level." },
  { character: "hato", island: "harbour", japanese: "ともだちに てがみを。", english: "Friends, messages and a weekly leaderboard, so nobody studies alone." },
  { character: "momo", island: "onsen", japanese: "がんばったね！", english: "Badges for streaks and milestones, hung on the onsen's ema rack." },
];

/** The Kana speed quizzes a guest can play without an account, offered on the Kana island. */
export const GUEST_KANA_QUIZZES = [
  { title: "Hiragana Speed Quiz", mark: "あ", href: "/guest/practice?type=hiragana", description: "Type the romaji of each hiragana, fast." },
  { title: "Katakana Speed Quiz", mark: "ア", href: "/guest/practice?type=katakana", description: "The same for katakana." },
] as const;

/** The introduction of the character who lives on an island, if it has one on the landing. */
export const introductionOf = (island: IslandId) => CAST_INTRODUCTIONS.find(item => item.island === island) ?? null;
