import type { IslandId } from "./islandMap.ts";

// What each island's character says to welcome the learner in the strip at the top of the island's pages
// (components/cast/IslandHost.tsx). One line a day, so a page greets you differently from one day to the next.
export const GREETINGS: Readonly<Record<IslandId, readonly string[]>> = {
  home: [
    "Welcome home! Your next step is pinned to the board.",
    "A little every day keeps the streak lantern lit.",
    "Where to today? The bridges are open.",
    "おかえり! That means \"welcome back\".",
  ],
  lessons: [
    "Hoo! Pick up the next lesson where you left off.",
    "One lesson at a time. Words first, then grammar.",
    "Finish a unit's lessons and the dojo test opens.",
    "Read the example sentences aloud. It helps them stick.",
  ],
  practice: [
    "Ears ready? Listening is my favourite.",
    "Say it out loud, even if nobody is listening.",
    "A short passage a day makes reading easy.",
  ],
  games: [
    "Ready to race the clock? Ponpoko!",
    "Particles are tricky. That's what makes the game fun.",
    "Beat your best score and I'll drum for you.",
  ],
  review: [
    "Rake the garden a little each day, and nothing gets overgrown.",
    "Mistakes are seeds. Review them and they grow into knowledge.",
    "Today's cards are waiting, quietly.",
  ],
  kanji: [
    "Each stroke has its place. Shall we write?",
    "Learn a kanji with a word you know, and it stays.",
    "Readings first, or meanings? Both, slowly.",
  ],
  kana: [
    "Chun chun! あ, い, う, え, お, let's go!",
    "Hiragana first, then katakana. Every word starts here.",
    "The hard ones get easier each time you see them.",
  ],
  fuji: [
    "Every level is a station on the way up the mountain.",
    "Look how far you have climbed already.",
    "The summit waits. Train, then try the mock exam.",
  ],
  harbour: [
    "Coo! Any letters to send today?",
    "Studying with friends keeps everyone climbing.",
    "Check the leaderboard. Who earned the most XP this week?",
  ],
  teahouse: [
    "Sit, have some tea, and ask me anything.",
    "No question is too small. That is how we learn.",
  ],
  belltower: [
    "The bell keeps the time on the islands.",
  ],
  onsen: [
    "Every badge is a plaque on the rack. Have a soak!",
    "Hard work deserves a warm bath.",
    "Which badge is next? Some are closer than you think.",
  ],
};

const DAY_MS = 86_400_000;

/** The line of the day: a different one each local day, the same all day long. */
export function lineOfTheDay(lines: readonly string[], date: Date): string {
  const day = Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / DAY_MS);
  return lines[day % lines.length] ?? "";
}
