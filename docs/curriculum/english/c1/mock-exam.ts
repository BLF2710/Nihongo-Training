// C1 mock exam: an end-of-level practice test over all six C1 units (inversion and nuance, work and the economy,
// science and ethics, the arts, society and change, style). New sentences throughout, and two demanding reading
// texts. Correct answers are written first; the import shuffles them.
import type { MockExamSource, MockQuestionSource } from "../../../../scripts/english-course/mockExam.ts";

const q = (id: string, prompt: string, options: string[], correct: string, explanation: string): MockQuestionSource => ({ id, prompt, options, correct, explanation });

export const mockExam: MockExamSource = {
  level: "C1", minutes: 45, passPercent: 60, sectionMinPercent: 40,
  sections: [{
    id: "vocabulary", title: "Vocabulary", titleVi: "Từ vựng",
    groups: [{
      instruction: "Choose the word or phrase that best completes the sentence.",
      questions: [
        q("vocabulary-1", "After the heavy ___, the roads were flooded.", ["rain", "water", "weather", "storming"], "rain", "Heavy rain is a strong collocation."),
        q("vocabulary-2", "She's not skinny; she's ___ and elegant.", ["slender", "bony", "scrawny", "weedy"], "slender", "Slender has a positive connotation."),
        q("vocabulary-3", "The plan failed, so it's back to the drawing ___.", ["board", "table", "room", "line"], "board", "Back to the drawing board = start again."),
        q("vocabulary-4", "Let's meet each other ___ and split the difference.", ["halfway", "midway", "in the half", "at middle"], "halfway", "Meet someone halfway = compromise."),
        q("vocabulary-5", "The results were positive, ___ limited.", ["albeit", "although", "despite", "even"], "albeit", "Albeit + adjective."),
        q("vocabulary-6", "Critics accused the scientists of playing ___.", ["God", "games", "the fool", "doctor"], "God", "Play God."),
        q("vocabulary-7", "In my view, the film is ___: it's good, but not that good.", ["overrated", "underrated", "outrated", "misrated"], "overrated", "Overrated = thought better than it is."),
        q("vocabulary-8", "Free schooling helps to ___ the gap between rich and poor.", ["bridge", "build", "cross", "jump"], "bridge", "Bridge the gap."),
        q("vocabulary-9", "We are ___ concerned about the latest figures.", ["deeply", "highly", "bitterly", "strongly"], "deeply", "Deeply concerned."),
        q("vocabulary-10", "It is ___ unlikely that the law will change this year.", ["highly", "deeply", "bitterly", "heavily"], "highly", "Highly unlikely."),
        q("vocabulary-11", "The minister was rather economical with the ___.", ["truth", "facts", "money", "words"], "truth", "Economical with the truth = not fully honest."),
        q("vocabulary-12", "I didn't follow every detail, but I got the ___ of it.", ["gist", "point out", "core of", "heart"], "gist", "Get the gist = understand the main idea."),
      ],
    }],
  }, {
    id: "grammar", title: "Grammar", titleVi: "Ngữ pháp",
    groups: [{
      instruction: "Choose the correct answer.",
      questions: [
        q("grammar-1", "Never ___ such a beautiful sunset.", ["have I seen", "I have seen", "I saw", "did I saw"], "have I seen", "Negative inversion: auxiliary before subject."),
        q("grammar-2", "It is essential that every candidate ___ the form.", ["complete", "completes", "completed", "will complete"], "complete", "Subjunctive: base verb."),
        q("grammar-3", "It's high time we ___ a decision.", ["made", "make", "will make", "have made"], "made", "It's high time + past simple."),
        q("grammar-4", "___ I known about the problem, I would have helped.", ["Had", "If", "Should", "Were"], "Had", "Inverted third conditional."),
        q("grammar-5", "You needn't ___ a taxi; I could have driven you.", ["have taken", "to take", "taken", "had taken"], "have taken", "Needn't have + past participle."),
        q("grammar-6", "Strange ___ it may seem, I enjoyed the exam.", ["as", "although", "however", "despite"], "as", "Adjective + as + clause."),
        q("grammar-7", "I'm not used to ___ so early.", ["getting up", "get up", "got up", "be getting up"], "getting up", "Be used to + -ing."),
        q("grammar-8", "Not only ___ late, but he also forgot his notes.", ["was he", "he was", "he is", "did he"], "was he", "Inversion after a fronted not only."),
        q("grammar-9", "I hate ___ when I'm speaking.", ["being interrupted", "to interrupt", "interrupting me", "be interrupted"], "being interrupted", "Passive -ing form."),
        q("grammar-10", "“Will it rain tomorrow?” “I ___.”", ["hope not", "don't hope so", "hope no", "not hope"], "hope not", "Hope not, never don't hope so."),
        q("grammar-11", "I was ___ to call you, but my phone died.", ["going", "about", "willing", "would"], "going", "Was going to for a plan that didn't happen."),
        q("grammar-12", "After the marathon, I was absolutely ___.", ["exhausted", "tired", "sleepy", "weary a bit"], "exhausted", "Absolutely + extreme adjective."),
      ],
    }],
  }, {
    id: "reading", title: "Reading", titleVi: "Đọc hiểu",
    groups: [{
      instruction: "Read the extract from an essay and answer the questions.",
      passage: "It is widely assumed that remote working has improved employees' lives. The evidence, however, is more mixed than this suggests. Granted, the vast majority of workers report saving time and money on commuting. Nonetheless, a significant proportion also describe feeling isolated, and younger staff in particular say they have fewer chances to learn from experienced colleagues. It can therefore be argued that the question is not whether remote working is good or bad, but how organisations can combine its benefits with the informal learning that an office provides.",
      questions: [
        q("reading-1", "What is the writer's main point?", ["The effects of remote working are mixed.", "Remote working should be banned.", "Commuting has become more expensive.", "Offices are no longer needed."], "The effects of remote working are mixed.", "“The evidence … is more mixed than this suggests.”"),
        q("reading-2", "Which group, according to the text, misses out most?", ["younger staff", "experienced colleagues", "managers", "commuters"], "younger staff", "They have fewer chances to learn from colleagues."),
        q("reading-3", "What is the function of “Granted” in the text?", ["to admit a point before arguing against it", "to give an example", "to add a stronger point", "to conclude the argument"], "to admit a point before arguing against it", "Granted concedes a point."),
      ],
    }, {
      instruction: "Read the review and answer the questions.",
      passage: "Rarely does a debut album arrive as fully formed as Mira Lowe's Northern Lights. Gripping from the first track, it blends folk melodies with electronic beats in a way that should feel forced but never does. Lowe's lyrics, full of vivid imagery of the sea and the city, reward repeated listening. If there is a weakness, it is that the final three songs are somewhat predictable, as if she ran out of time. Still, were it not for those, this would be a near-perfect record.",
      questions: [
        q("reading-4", "How does the reviewer feel about the album overall?", ["very positive, with a small criticism", "completely negative", "bored by it", "unsure what to think"], "very positive, with a small criticism", "Near-perfect, apart from the last songs."),
        q("reading-5", "What is the weakness of the album?", ["The last songs are predictable.", "The lyrics are dull.", "The first track is weak.", "The beats feel forced."], "The last songs are predictable.", "“the final three songs are somewhat predictable.”"),
        q("reading-6", "“Were it not for those” means…", ["If it weren't for those songs", "Because of those songs", "Even with those songs", "Unless those songs were longer"], "If it weren't for those songs", "Inverted conditional."),
      ],
    }],
  }],
};
