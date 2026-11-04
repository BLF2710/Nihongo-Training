// The village square: what each villager has to tell the learner today (from their real study data), and the day's
// errands, which are the learner's study plan for today. Pure, so it runs under node's test runner.
import type { CharacterId } from "../cast.ts";

/** What the village knows about the learner. Each part is null while loading or when it couldn't be fetched. */
export type VillageLiveData = {
  reviews: { dueTotal: number; reviewedToday: number; total: number } | null;
  inbox: { messages: number; friendRequests: number } | null;
  nextStep: { title: string; href: string } | null;
  goal: { minutesToday: number; goalMinutes: number; isGoalMet: boolean } | null;
  /** Whether a new lesson, and a listening/speaking/reading round, were finished today (from today's XP). */
  today: { hasFinishedLesson: boolean; hasPractised: boolean } | null;
  streak: number | null;
  openMistakes: number | null;
};

export type DailyErrandId = "review" | "lesson" | "practice" | "goal";
export type DailyErrand = { id: DailyErrandId; giver: CharacterId; task: string; href: string; isDone: boolean };

export type VillageLink = { label: string; href: string };
/** A villager's line today: Japanese (with an English translation), where it leads, and whether it is news. */
export type VillagerNews = { japanese: string; english: string; links: readonly VillageLink[]; hasNews: boolean };

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** Today's errands, from what the learner has to do and has done. One is left out when there's nothing to base it on
 *  (no deck yet, no next lesson). */
export function dailyErrands(data: VillageLiveData): DailyErrand[] {
  const errands: DailyErrand[] = [];
  const { reviews, nextStep, today, goal } = data;
  if (reviews && (reviews.dueTotal > 0 || reviews.reviewedToday > 0)) {
    errands.push({ id: "review", giver: "zen", task: "Clear today's review cards.", href: "/srs", isDone: reviews.dueTotal === 0 });
  }
  if (today && (nextStep || today.hasFinishedLesson)) {
    errands.push({ id: "lesson", giver: "hakase", task: "Finish a new lesson.", href: nextStep?.href ?? "/lessons", isDone: today.hasFinishedLesson });
  }
  if (today) errands.push({ id: "practice", giver: "tama", task: "Do a listening, speaking or reading round.", href: "/listening", isDone: today.hasPractised });
  if (goal) errands.push({ id: "goal", giver: "kon", task: `Study for ${plural(goal.goalMinutes, "minute")}.`, href: "/lessons", isDone: goal.isGoalMet });
  return errands;
}

const errandOf = (errands: readonly DailyErrand[], giver: CharacterId) => errands.find(errand => errand.giver === giver);

type NewsWriter = (data: VillageLiveData, errand: DailyErrand | undefined) => VillagerNews;
const THANKS = { japanese: "ありがとう！きょうの おつかいは おわりです。", english: "Thank you! Today's errand is done." };
const thanked = (links: readonly VillageLink[]): VillagerNews => ({ ...THANKS, links, hasNews: false });

// One writer per villager, so a new villager is a new entry here rather than another branch elsewhere.
const NEWS: Readonly<Record<CharacterId, NewsWriter>> = {
  zen: ({ reviews }, errand) => {
    const links = [{ label: "Daily review", href: "/srs" }, { label: "Your deck", href: "/srs/deck" }];
    if (errand?.isDone) return thanked(links);
    if (!reviews) return { japanese: "しずかな にわです。", english: "It's a quiet garden.", links, hasNews: false };
    if (reviews.total === 0) return { japanese: "にわは まだ からっぽです。", english: "The garden is still empty. Finish a lesson and its words and kanji grow here.", links: [{ label: "Lessons", href: "/lessons" }], hasNews: false };
    if (reviews.dueTotal === 0) return { japanese: "にわは きれいです。", english: "The garden is tidy: no cards are due.", links, hasNews: false };
    return { japanese: `カードが ${reviews.dueTotal}まい まって います。`, english: `${plural(reviews.dueTotal, "card")} ${reviews.dueTotal === 1 ? "is" : "are"} waiting for you.`, links, hasNews: true };
  },
  hakase: ({ nextStep }, errand) => {
    const links = nextStep ? [{ label: nextStep.title, href: nextStep.href }, { label: "All lessons", href: "/lessons" }] : [{ label: "Lessons", href: "/lessons" }];
    if (errand?.isDone) return thanked(links);
    if (!nextStep) return { japanese: "がっこうへ ようこそ。", english: "Welcome to the school.", links, hasNews: false };
    return { japanese: "つぎの じゅぎょうは これです。", english: `Your next lesson: ${nextStep.title}.`, links, hasNews: errand !== undefined };
  },
  tama: (_data, errand) => {
    const links = [{ label: "Listening", href: "/listening" }, { label: "Speaking", href: "/speaking" }, { label: "Reading", href: "/reading" }];
    if (errand?.isDone) return thanked(links);
    return { japanese: "いっしょに れんしゅう しましょう！", english: "Let's practise together! Listening, speaking or reading.", links, hasNews: errand !== undefined };
  },
  kon: ({ goal }, errand) => {
    const links = [{ label: "Change your goal", href: "/settings/learning" }];
    if (errand?.isDone) return thanked(links);
    if (!goal) return { japanese: "じんじゃへ ようこそ。", english: "Welcome to the shrine.", links, hasNews: false };
    return { japanese: `きょうは ${goal.minutesToday}ぷん べんきょう しました。`, english: `You've studied ${plural(goal.minutesToday, "minute")} today, of your ${goal.goalMinutes}.`, links, hasNews: errand !== undefined };
  },
  hato: ({ inbox }) => {
    const links = [{ label: "Messages", href: "/messages" }, { label: "Friends", href: "/friends" }];
    if (!inbox || inbox.messages + inbox.friendRequests === 0) return { japanese: "きょうは てがみが ありません。", english: "No letters for you today.", links, hasNews: false };
    const parts = [inbox.messages ? plural(inbox.messages, "unread message") : "", inbox.friendRequests ? plural(inbox.friendRequests, "friend request") : ""].filter(Boolean);
    return { japanese: "てがみが きて います！", english: `Mail for you: ${parts.join(" and ")}.`, links, hasNews: true };
  },
  momo: ({ streak }) => {
    const links = [{ label: "Achievements", href: "/achievements" }];
    if (!streak) return { japanese: "おんせんで ゆっくり して ください。", english: "Relax in the hot spring. Study today to start a streak.", links, hasNews: false };
    return { japanese: `${streak}にち つづいて います！`, english: `You're on a ${plural(streak, "day")} streak!`, links, hasNews: false };
  },
  pon: () => ({ japanese: "あそびましょう！", english: "Let's play! Games in Japanese.", links: [{ label: "Island Errands", href: "/games/errands" }, { label: "Particle Drop", href: "/games/particles" }], hasNews: false }),
  sensei: () => ({ japanese: "なにか しつもんが ありますか。", english: "Do you have a question? Ask me anything about Japanese.", links: [{ label: "Study assistant", href: "/assistant" }], hasNews: false }),
  tsuru: () => ({ japanese: "かんじを かきましょう。", english: "Let's write some kanji.", links: [{ label: "Kanji", href: "/learn/kanji" }, { label: "Kanji practice", href: "/learn/kanji/practice" }], hasNews: false }),
  chun: () => ({ japanese: "ひらがなと カタカナ、ちゅん！", english: "Hiragana and katakana, tweet!", links: [{ label: "Hiragana", href: "/learn/hiragana" }, { label: "Katakana", href: "/learn/katakana" }], hasNews: false }),
  kurama: ({ openMistakes }) => {
    const links = [{ label: "Mock exam", href: "/mock-exam" }, { label: "Mistake notebook", href: "/mistakes" }];
    if (openMistakes) return { japanese: "まちがいを なおしましょう。", english: `${plural(openMistakes, "mistake")} to practise before the exam.`, links, hasNews: false };
    return { japanese: "しけんの じゅんびは いいですか。", english: "Ready for an exam?", links, hasNews: false };
  },
};

/** What a villager says today, given the learner's data and today's errands. */
export const villagerNews = (id: CharacterId, data: VillageLiveData, errands: readonly DailyErrand[]): VillagerNews => NEWS[id](data, errandOf(errands, id));
