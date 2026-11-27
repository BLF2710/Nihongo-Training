// What the English townsfolk tell the learner (from their real English study data), and today's errands, which are the
// learner's English study plan for the day: the English isle's version of the Japanese village square's news
// (lib/village/villageNews). Lines are in British English with their Vietnamese. Pure, so it runs under node.
import type { TownsfolkId } from "./townsfolk.ts";

/** What the town knows about the learner. Each part is null while loading or when it couldn't be fetched. */
export type EnglishTownData = {
  cards: { dueTotal: number; reviewedToday: number; total: number } | null;
  /** The next lesson or unit test of the chosen level. */
  nextStep: { title: string; href: string } | null;
  /** Whether a lesson, and a listening or speaking round, were finished today (from today's XP). */
  today: { hasFinishedLesson: boolean; hasPractised: boolean } | null;
  goal: { minutesToday: number; goalMinutes: number; isGoalMet: boolean } | null;
  streak: number | null;
  inbox: { messages: number; friendRequests: number } | null;
  openMistakes: number | null;
};

export type TownErrandId = "flashcards" | "lesson" | "practice" | "goal";
export type TownErrand = { id: TownErrandId; giver: TownsfolkId; task: string; href: string; isDone: boolean };

export type TownLink = { label: string; href: string };
/** A townsperson's line today, in English and Vietnamese, where it leads, and whether it is news. */
export type TownNews = { english: string; vietnamese: string; links: readonly TownLink[]; hasNews: boolean };

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** Today's errands, from what the learner has to do and has done. One is left out when there's nothing to base it on
 *  (no flashcards yet, no next lesson). */
export function englishTownErrands(data: EnglishTownData): TownErrand[] {
  const { cards, nextStep, today, goal } = data;
  const errands: (TownErrand | null)[] = [
    cards && (cards.dueTotal > 0 || cards.reviewedToday > 0)
      ? { id: "flashcards", giver: "barbarian", task: "Clear today's flashcards.", href: "/english/flashcards", isDone: cards.dueTotal === 0 } : null,
    today && (nextStep || today.hasFinishedLesson)
      ? { id: "lesson", giver: "knight", task: "Finish a new lesson.", href: nextStep?.href ?? "/lessons", isDone: today.hasFinishedLesson } : null,
    today ? { id: "practice", giver: "ranger", task: "Do a listening or speaking round.", href: "/english/listening", isDone: today.hasPractised } : null,
    goal ? { id: "goal", giver: "mage", task: `Study for ${plural(goal.goalMinutes, "minute")}.`, href: "/lessons", isDone: goal.isGoalMet } : null,
  ];
  return errands.filter(errand => errand !== null);
}

type NewsWriter = (data: EnglishTownData, errand: TownErrand | undefined) => TownNews;
const THANKS = { english: "Thank you! Today's errand is done.", vietnamese: "Cảm ơn bạn! Việc hôm nay đã xong." };
const thanked = (links: readonly TownLink[]): TownNews => ({ ...THANKS, links, hasNews: false });

// One writer per townsperson, so a new one is a new entry here rather than another branch elsewhere.
const NEWS: Readonly<Record<TownsfolkId, NewsWriter>> = {
  knight: ({ nextStep }, errand) => {
    const links = [...(nextStep ? [{ label: nextStep.title, href: nextStep.href }] : []), { label: "All lessons", href: "/lessons" }];
    if (errand?.isDone) return thanked(links);
    if (!nextStep) return { english: "Welcome to the castle.", vietnamese: "Chào mừng bạn đến lâu đài.", links, hasNews: false };
    return { english: `Your next step: ${nextStep.title}.`, vietnamese: `Bước tiếp theo của bạn: ${nextStep.title}.`, links, hasNews: errand !== undefined };
  },
  barbarian: ({ cards }, errand) => {
    const links = [{ label: "Flashcards", href: "/english/flashcards" }, { label: "Vocabulary", href: "/english/vocabulary" }];
    if (errand?.isDone) return thanked(links);
    if (!cards) return { english: "Fresh words, come and see!", vietnamese: "Từ mới đây, mời bạn xem!", links, hasNews: false };
    if (cards.total === 0) return { english: "My stall is empty. Finish a lesson and its words come to market.", vietnamese: "Quầy của tôi còn trống. Học xong một bài, từ vựng của bài sẽ có ở chợ.", links: [{ label: "Lessons", href: "/lessons" }], hasNews: false };
    if (cards.dueTotal === 0) return { english: "Your flashcards are all done for today.", vietnamese: "Hôm nay bạn đã ôn hết thẻ rồi.", links, hasNews: false };
    return { english: `${plural(cards.dueTotal, "card")} ${cards.dueTotal === 1 ? "is" : "are"} waiting for you.`, vietnamese: `Có ${cards.dueTotal} thẻ đang chờ bạn.`, links, hasNews: true };
  },
  ranger: (_data, errand) => {
    const links = [{ label: "Listening", href: "/english/listening" }, { label: "Speaking", href: "/english/speaking" }];
    if (errand?.isDone) return thanked(links);
    return { english: "Let's practise listening and speaking together!", vietnamese: "Cùng luyện nghe và nói nhé!", links, hasNews: errand !== undefined };
  },
  mage: ({ goal, streak }, errand) => {
    const links = [{ label: "Grammar summary", href: "/english/grammar/summary" }, { label: "Change your goal", href: "/settings/learning" }];
    const onStreak = streak ? { english: ` You're on a ${streak}-day streak.`, vietnamese: ` Bạn đã học liên tục ${streak} ngày.` } : { english: "", vietnamese: "" };
    if (errand?.isDone) return { english: THANKS.english + onStreak.english, vietnamese: THANKS.vietnamese + onStreak.vietnamese, links, hasNews: false };
    if (!goal) return { english: `Welcome, traveller.${onStreak.english}`, vietnamese: `Chào mừng lữ khách.${onStreak.vietnamese}`, links, hasNews: false };
    return {
      english: `You've studied ${plural(goal.minutesToday, "minute")} today, of your ${goal.goalMinutes}.${onStreak.english}`,
      vietnamese: `Hôm nay bạn đã học ${goal.minutesToday} trên ${goal.goalMinutes} phút.${onStreak.vietnamese}`, links, hasNews: errand !== undefined,
    };
  },
  rogue_hooded: ({ inbox, openMistakes }) => {
    const links = [{ label: "Messages", href: "/messages" }, { label: "Mistake notebook", href: "/mistakes" }];
    if (inbox && inbox.messages + inbox.friendRequests > 0) {
      const english = [inbox.messages ? plural(inbox.messages, "unread message") : "", inbox.friendRequests ? plural(inbox.friendRequests, "friend request") : ""].filter(Boolean);
      const vietnamese = [inbox.messages ? `${inbox.messages} tin nhắn chưa đọc` : "", inbox.friendRequests ? `${inbox.friendRequests} lời mời kết bạn` : ""].filter(Boolean);
      return { english: `Mail for you: ${english.join(" and ")}.`, vietnamese: `Có thư cho bạn: ${vietnamese.join(" và ")}.`, links, hasNews: true };
    }
    if (openMistakes) return { english: `${plural(openMistakes, "mistake")} to practise in your notebook.`, vietnamese: `Có ${openMistakes} lỗi sai cần luyện lại trong sổ.`, links: [...links].reverse(), hasNews: false };
    return { english: "No letters for you today.", vietnamese: "Hôm nay không có thư cho bạn.", links, hasNews: false };
  },
};

/** What a townsperson says today, given the learner's data and today's errands. */
export const townsfolkNews = (id: TownsfolkId, data: EnglishTownData, errands: readonly TownErrand[]): TownNews =>
  NEWS[id](data, errands.find(errand => errand.giver === id));
