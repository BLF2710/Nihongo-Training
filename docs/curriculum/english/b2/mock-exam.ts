// B2 mock exam: an end-of-level practice test over all six B2 units (relationships, careers, technology, health,
// stories and opinions). New sentences throughout, and two reading texts. Correct answers are written first; the
// import shuffles them.
import type { MockExamSource, MockQuestionSource } from "../../../../scripts/english-course/mockExam.ts";

const q = (id: string, prompt: string, options: string[], correct: string, explanation: string): MockQuestionSource => ({ id, prompt, options, correct, explanation });

export const mockExam: MockExamSource = {
  level: "B2", minutes: 40, passPercent: 60, sectionMinPercent: 40,
  sections: [{
    id: "vocabulary", title: "Vocabulary", titleVi: "Từ vựng",
    groups: [{
      instruction: "Choose the word or phrase that best completes the sentence.",
      questions: [
        q("vocabulary-1", "My brother and I fell ___ last year, but we've made up now.", ["out", "down", "off", "over"], "out", "Fall out = stop being friendly after an argument."),
        q("vocabulary-2", "Could you ___ me a favour and post this letter?", ["do", "make", "give", "take"], "do", "Do someone a favour."),
        q("vocabulary-3", "The company ___ a profit for the first time this year.", ["made", "did", "won", "earned up"], "made", "Make a profit."),
        q("vocabulary-4", "She's very ___: she never gives up, however hard things get.", ["determined", "stubborn", "moody", "reserved"], "determined", "Determined = keeps trying (positive)."),
        q("vocabulary-5", "Please ___ up your work regularly so you don't lose it.", ["back", "set", "take", "give"], "back", "Back up = make a copy of files."),
        q("vocabulary-6", "The new phone is ___ to be released next month.", ["expected", "said it", "believing", "thought it"], "expected", "Impersonal passive: X is expected to…"),
        q("vocabulary-7", "Eating too much sugar can ___ to health problems.", ["lead", "cause", "result", "make"], "lead", "Lead to = cause."),
        q("vocabulary-8", "I'm feeling a bit under the ___ today, so I'll stay at home.", ["weather", "rain", "cloud", "sky"], "weather", "Under the weather = slightly ill."),
        q("vocabulary-9", "After a ___ start, the story becomes really exciting.", ["slow", "lazy", "late", "low"], "slow", "A slow start."),
        q("vocabulary-10", "The manager ___ that the report was finished by Friday.", ["insisted", "demanded on", "told", "suggested to"], "insisted", "Insist that…"),
        q("vocabulary-11", "There are pros and ___ to working from home.", ["cons", "contras", "minuses", "againsts"], "cons", "Pros and cons."),
        q("vocabulary-12", "Her speech was so ___ that half the audience fell asleep.", ["dull", "dulled", "gripping", "lively"], "dull", "Dull = boring."),
      ],
    }],
  }, {
    id: "grammar", title: "Grammar", titleVi: "Ngữ pháp",
    groups: [{
      instruction: "Choose the correct answer.",
      questions: [
        q("grammar-1", "If I had left earlier, I ___ the train.", ["would have caught", "would catch", "had caught", "will have caught"], "would have caught", "Third conditional: would have + past participle."),
        q("grammar-2", "If I had studied medicine, I ___ a doctor now.", ["would be", "would have been", "will be", "had been"], "would be", "Mixed conditional: past condition, present result."),
        q("grammar-3", "By the time we arrived, the film ___.", ["had started", "started", "has started", "was starting"], "had started", "Past perfect for the earlier action."),
        q("grammar-4", "I'm having my car ___ tomorrow.", ["repaired", "repair", "to repair", "repairing"], "repaired", "Have something + past participle."),
        q("grammar-5", "By next June, I ___ here for ten years.", ["will have worked", "will work", "have worked", "am working"], "will have worked", "Future perfect."),
        q("grammar-6", "You'd better ___ now, or you'll miss the bus.", ["leave", "to leave", "leaving", "left"], "leave", "Had better + base verb."),
        q("grammar-7", "She ___ have left already: her coat isn't here.", ["must", "can't", "should", "mustn't"], "must", "Must have = I'm sure it happened."),
        q("grammar-8", "My grandfather, ___ is ninety, still swims every day.", ["who", "that", "which", "whom he"], "who", "Non-defining clause: who, never that."),
        q("grammar-9", "___ the email, she realised she had made a mistake.", ["Having read", "Have read", "Being read", "Read having"], "Having read", "Perfect participle clause."),
        q("grammar-10", "He accused me ___ his phone.", ["of taking", "to take", "for taking", "that I took"], "of taking", "Accuse someone of + -ing."),
        q("grammar-11", "If only I ___ so much last night!", ["hadn't eaten", "didn't eat", "haven't eaten", "wouldn't eat"], "hadn't eaten", "If only + past perfect for past regrets."),
        q("grammar-12", "What I need ___ a long holiday.", ["is", "are", "it is", "that is"], "is", "Cleft sentence: What I need is…"),
      ],
    }],
  }, {
    id: "reading", title: "Reading", titleVi: "Đọc hiểu",
    groups: [{
      instruction: "Read the article and answer the questions.",
      passage: "For years, experts have told us to aim for 10,000 steps a day. But where does the number come from? Surprisingly, it was not discovered by scientists. In the 1960s, a Japanese company sold a step counter whose name meant \"10,000 steps\", simply because the number sounded good. Recent studies suggest that the real benefits start much earlier: people who walk around 7,000 steps a day appear to live longer than those who walk 4,000, and the extra gain above 10,000 seems small. Even so, researchers point out that any movement is better than none, and that a brisk walk counts for more than a slow one.",
      questions: [
        q("reading-1", "Where does the 10,000-step target come from?", ["the name of a product", "a scientific study", "a government report", "a Japanese doctor's advice"], "the name of a product", "A company's step counter was named “10,000 steps”."),
        q("reading-2", "What do recent studies suggest?", ["Benefits begin at a lower number of steps.", "Nobody needs to walk at all.", "10,000 steps is the minimum.", "Slow walking is best."], "Benefits begin at a lower number of steps.", "Around 7,000 steps already seems to help."),
        q("reading-3", "In the last sentence, “brisk” most likely means…", ["quick and energetic", "short and easy", "long and slow", "careful and safe"], "quick and energetic", "It is contrasted with a slow walk."),
      ],
    }, {
      instruction: "Read the review and answer the questions.",
      passage: "Anna Clarke's second novel, The Glass House, tells the story of two sisters who inherit their grandmother's crumbling house in Cornwall. The first half is beautifully written: the descriptions of the sea and the old house are vivid, and the sisters' relationship feels real. Unfortunately, the second half loses its way. A sudden mystery about a missing painting feels far-fetched, and the ending is rushed. Fans of Clarke's first book will still find much to enjoy, but this is not the masterpiece some critics have called it.",
      questions: [
        q("reading-4", "What does the reviewer like most?", ["the first half", "the mystery", "the ending", "the painting"], "the first half", "“The first half is beautifully written.”"),
        q("reading-5", "What does the reviewer say about the mystery?", ["It is hard to believe.", "It is the best part.", "It is too long.", "It is very moving."], "It is hard to believe.", "Far-fetched = hard to believe."),
        q("reading-6", "What is the reviewer's overall opinion?", ["Good in parts, but overrated.", "A perfect novel.", "A complete failure.", "Better than her first book."], "Good in parts, but overrated.", "Much to enjoy, but not a masterpiece."),
      ],
    }],
  }],
};
