// B1 mock exam: an end-of-level practice test over all six B1 units (experiences, work and study, travel, wishes
// and conditionals, news and media, society and the environment). New sentences throughout, and two reading texts.
// Correct answers are written first; the import shuffles them.
import type { MockExamSource, MockQuestionSource } from "../../../../scripts/english-course/mockExam.ts";

const q = (id: string, prompt: string, options: string[], correct: string, explanation: string): MockQuestionSource => ({ id, prompt, options, correct, explanation });

export const mockExam: MockExamSource = {
  level: "B1", minutes: 35, passPercent: 60, sectionMinPercent: 40,
  sections: [{
    id: "vocabulary", title: "Vocabulary", titleVi: "Từ vựng",
    groups: [{
      instruction: "Choose the word or phrase that best completes the sentence.",
      questions: [
        q("vocabulary-1", "She ___ for a job at a bank, and they offered it to her.", ["applied", "asked", "worked", "looked"], "applied", "Apply for a job."),
        q("vocabulary-2", "Our flight was ___ because of the fog, so we waited for three hours.", ["delayed", "missed", "booked", "landed"], "delayed", "Delayed = later than planned."),
        q("vocabulary-3", "I'd like to ___ my English before I study abroad.", ["improve", "increase", "grow", "rise"], "improve", "Improve a skill."),
        q("vocabulary-4", "Recycling helps to ___ the amount of rubbish we produce.", ["reduce", "remove", "refuse", "return"], "reduce", "Reduce = make smaller."),
        q("vocabulary-5", "He has a lot of ___ in marketing; he's worked in it for ten years.", ["experience", "experiment", "expert", "experiences"], "experience", "Work experience is uncountable."),
        q("vocabulary-6", "The ___ said that the storm would arrive tonight.", ["headline", "forecast", "advert", "review"], "forecast", "A weather forecast."),
        q("vocabulary-7", "When in Japan, it's polite to take ___ your shoes indoors.", ["off", "out", "away", "down"], "off", "Take off your shoes."),
        q("vocabulary-8", "I can't ___ to buy a new car this year.", ["afford", "spend", "pay", "cost"], "afford", "Can't afford = not have enough money."),
        q("vocabulary-9", "Air ___ is a serious problem in many big cities.", ["pollution", "pollute", "polluted", "polluting"], "pollution", "Noun: pollution."),
        q("vocabulary-10", "She ___ her driving test on the first try!", ["passed", "succeeded", "won", "achieved"], "passed", "Pass a test."),
        q("vocabulary-11", "The government plans to ___ more trees in the city centre.", ["plant", "grow up", "build", "put up"], "plant", "Plant trees."),
        q("vocabulary-12", "I'm looking ___ to the holidays.", ["forward", "after", "for", "up"], "forward", "Look forward to."),
      ],
    }],
  }, {
    id: "grammar", title: "Grammar", titleVi: "Ngữ pháp",
    groups: [{
      instruction: "Choose the correct answer.",
      questions: [
        q("grammar-1", "I ___ to Paris three times.", ["have been", "went", "have gone to", "was"], "have been", "Present perfect for experiences: have been."),
        q("grammar-2", "She has lived here ___ 2019.", ["since", "for", "from", "during"], "since", "Since + a point in time."),
        q("grammar-3", "If it rains tomorrow, we ___ at home.", ["'ll stay", "stay", "would stay", "stayed"], "'ll stay", "First conditional: if + present, will."),
        q("grammar-4", "If I ___ more time, I'd learn the guitar.", ["had", "have", "would have", "will have"], "had", "Second conditional: if + past simple."),
        q("grammar-5", "I wish I ___ speak French.", ["could", "can", "will", "am able"], "could", "Wish + could for an ability you don't have."),
        q("grammar-6", "The bridge ___ in 1890.", ["was built", "built", "is built", "has built"], "was built", "Past passive."),
        q("grammar-7", "He said that he ___ tired.", ["was", "is being", "has", "be"], "was", "Reported speech: is → was."),
        q("grammar-8", "She asked me where I ___.", ["lived", "did live", "do I live", "live I"], "lived", "Reported question: no question order."),
        q("grammar-9", "This is the woman ___ helped me.", ["who", "which", "what", "whose"], "who", "Who for people."),
        q("grammar-10", "You ___ wear a seat belt. It's the law.", ["must", "mustn't", "don't have to", "might"], "must", "Must = it is necessary."),
        q("grammar-11", "I've ___ finished my homework. Can I go out?", ["just", "yet", "ever", "since"], "just", "Just = a very short time ago."),
        q("grammar-12", "We're used ___ in a big city now.", ["to living", "to live", "living", "live"], "to living", "Be used to + -ing."),
      ],
    }],
  }, {
    id: "reading", title: "Reading", titleVi: "Đọc hiểu",
    groups: [{
      instruction: "Read the article and answer the questions.",
      passage: "Last year, the small town of Kirkby decided to close its main street to cars on Saturdays. Many shop owners were worried at first. They thought fewer people would come if they couldn't park outside. In fact, the opposite happened. Families started to walk and cycle into town, and cafés put tables outside. After six months, most shops reported higher sales on Saturdays than before. The town council now plans to close the street on Sundays too, although some older residents say it is harder for them to get to the shops.",
      questions: [
        q("reading-1", "Why were shop owners worried?", ["They thought fewer customers would come.", "They had to close on Saturdays.", "Cafés would take their customers.", "Rents would go up."], "They thought fewer customers would come.", "They thought fewer people would come if they couldn't park."),
        q("reading-2", "What happened after six months?", ["Most shops sold more on Saturdays.", "Most shops closed.", "Cars came back to the street.", "Cafés stopped putting tables outside."], "Most shops sold more on Saturdays.", "“most shops reported higher sales on Saturdays.”"),
        q("reading-3", "Who is unhappy with the plan for Sundays?", ["some older residents", "the town council", "café owners", "families with children"], "some older residents", "“some older residents say it is harder for them.”"),
      ],
    }, {
      instruction: "Read the email and answer the questions.",
      passage: "Dear Mr Evans,\nI am writing to apply for the summer job as a tour guide that I saw on your website. I am a second-year history student, and I have worked at the city museum as a volunteer for two years, so I know the old town very well. I speak English and Vietnamese fluently, and I am learning Spanish. I am available from 1st July to 31st August. I have attached my CV, and I would be happy to come for an interview at any time.\nYours sincerely,\nNguyen Thi Ha",
      questions: [
        q("reading-4", "Why is Ha writing?", ["to apply for a job", "to book a tour", "to complain about a museum", "to arrange a holiday"], "to apply for a job", "“I am writing to apply for the summer job.”"),
        q("reading-5", "How does Ha know the old town well?", ["She has volunteered at the museum.", "She was born there.", "She has worked as a tour guide.", "She studies Spanish there."], "She has volunteered at the museum.", "She has been a volunteer at the city museum for two years."),
        q("reading-6", "Which language is Ha still learning?", ["Spanish", "English", "Vietnamese", "History"], "Spanish", "“I am learning Spanish.”"),
      ],
    }],
  }],
};
