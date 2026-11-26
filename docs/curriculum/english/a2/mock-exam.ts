// A2 mock exam: an end-of-level practice test over all six A2 units (everyday life, past experiences, places,
// food and shopping, plans, health). Vocabulary and grammar questions use new sentences, not the lessons' own, and
// the reading section has two short everyday texts. Correct answers are written first; the import shuffles them.
import type { MockExamSource, MockQuestionSource } from "../../../../scripts/english-course/mockExam.ts";

const q = (id: string, prompt: string, options: string[], correct: string, explanation: string): MockQuestionSource => ({ id, prompt, options, correct, explanation });

export const mockExam: MockExamSource = {
  level: "A2", minutes: 30, passPercent: 60, sectionMinPercent: 40,
  sections: [{
    id: "vocabulary", title: "Vocabulary", titleVi: "Từ vựng",
    groups: [{
      instruction: "Choose the word that best completes the sentence.",
      questions: [
        q("vocabulary-1", "My sister is very ___. She always helps people.", ["kind", "lazy", "rude", "noisy"], "kind", "Kind = nice to other people."),
        q("vocabulary-2", "Turn ___ at the bank, and the station is on your right.", ["left", "behind", "across", "along"], "left", "Turn left / turn right."),
        q("vocabulary-3", "Can I have the ___, please? We'd like to pay.", ["bill", "menu", "change", "price"], "bill", "Ask for the bill to pay in a restaurant."),
        q("vocabulary-4", "I've got a terrible ___. I need some paracetamol.", ["headache", "ankle", "medicine", "doctor"], "headache", "Headache = pain in your head."),
        q("vocabulary-5", "These shoes are too small. Do you have a bigger ___?", ["size", "shape", "price", "colour"], "size", "Size = how big something is."),
        q("vocabulary-6", "The museum is ___ the bank and the post office.", ["between", "among", "through", "over"], "between", "Between two places."),
        q("vocabulary-7", "We ___ a great time on holiday last year.", ["had", "made", "did", "took"], "had", "Have a great time."),
        q("vocabulary-8", "I'm going to ___ a table for four at eight o'clock.", ["book", "buy", "order", "pay"], "book", "Book a table = reserve it."),
        q("vocabulary-9", "He works in a hospital. He's a ___.", ["nurse", "waiter", "pilot", "farmer"], "nurse", "Nurses work in hospitals."),
        q("vocabulary-10", "It's ___ outside. Take an umbrella.", ["raining", "sunny", "dry", "warm"], "raining", "You need an umbrella when it rains."),
        q("vocabulary-11", "Could you ___ me the way to the station?", ["tell", "say", "speak", "talk"], "tell", "Tell someone the way."),
        q("vocabulary-12", "I usually ___ the bus to work.", ["take", "drive", "ride on", "go"], "take", "Take the bus."),
      ],
    }],
  }, {
    id: "grammar", title: "Grammar", titleVi: "Ngữ pháp",
    groups: [{
      instruction: "Choose the correct answer.",
      questions: [
        q("grammar-1", "She ___ to work every day.", ["walks", "walk", "is walk", "walking"], "walks", "Present simple: he/she/it + -s."),
        q("grammar-2", "Where ___ you go last weekend?", ["did", "do", "were", "have"], "did", "Past simple question: did + base verb."),
        q("grammar-3", "I ___ my keys yesterday.", ["lost", "losed", "lose", "have lose"], "lost", "Lose → lost (irregular)."),
        q("grammar-4", "Look! It ___.", ["is snowing", "snows", "snow", "snowing"], "is snowing", "Present continuous for now."),
        q("grammar-5", "Is there ___ milk in the fridge?", ["any", "a", "many", "some of"], "any", "Any in questions with uncountable nouns."),
        q("grammar-6", "How ___ apples do you need?", ["many", "much", "lot", "any"], "many", "How many + plural noun."),
        q("grammar-7", "This bag is ___ than that one.", ["cheaper", "more cheap", "cheapest", "cheap"], "cheaper", "Short adjective + -er."),
        q("grammar-8", "We ___ visit my grandparents next Sunday.", ["are going to", "going to", "will to", "go to"], "are going to", "Be going to for plans."),
        q("grammar-9", "You ___ see a doctor about that cough.", ["should", "should to", "shoulds", "must to"], "should", "Should + base verb for advice."),
        q("grammar-10", "I was cooking when the phone ___.", ["rang", "was ringing", "rings", "ring"], "rang", "Past continuous + past simple for an interruption."),
        q("grammar-11", "It's the ___ restaurant in town.", ["best", "better", "most good", "goodest"], "best", "Good → better → best."),
        q("grammar-12", "I'm meeting Tom ___ Friday.", ["on", "in", "at", "to"], "on", "On + day."),
      ],
    }],
  }, {
    id: "reading", title: "Reading", titleVi: "Đọc hiểu",
    groups: [{
      instruction: "Read the message and answer the questions.",
      passage: "Hi Mai,\nThanks for inviting me to your birthday party on Saturday! I'd love to come. I finish work at five, so I'll be there at about half past six. Is it at your flat or at the café near the park? I can bring a cake if you like. I'm making a chocolate one for my mum's birthday too, so it's no trouble.\nSee you soon,\nLucy",
      questions: [
        q("reading-1", "What time will Lucy arrive?", ["at about 6.30", "at 5.00", "at about 5.30", "at 7.00"], "at about 6.30", "“I'll be there at about half past six.”"),
        q("reading-2", "What doesn't Lucy know?", ["where the party is", "what day the party is", "whose birthday it is", "what time she finishes work"], "where the party is", "She asks if it is at the flat or the café."),
        q("reading-3", "What does Lucy offer to do?", ["bring a cake", "cook dinner", "book the café", "buy a present for Mai's mum"], "bring a cake", "“I can bring a cake if you like.”"),
      ],
    }, {
      instruction: "Read the notice and answer the questions.",
      passage: "GREENFIELD SPORTS CENTRE\nThe swimming pool will be closed from 3rd to 10th June for cleaning. During this time, the gym and tennis courts are open as usual (7 a.m. to 10 p.m.). Members can use the pool at Hillside Leisure Centre for free. Just show your membership card at reception. We are sorry for any problems this may cause.",
      questions: [
        q("reading-4", "Why is the pool closed?", ["for cleaning", "for a competition", "because it is broken", "because of the weather"], "for cleaning", "“closed … for cleaning.”"),
        q("reading-5", "What can members do at Hillside Leisure Centre?", ["swim for free", "play tennis for free", "buy a membership card", "use the gym until 10 p.m."], "swim for free", "“Members can use the pool at Hillside … for free.”"),
        q("reading-6", "What must members take to Hillside?", ["their membership card", "a swimming lesson ticket", "some money", "a letter from Greenfield"], "their membership card", "“Show your membership card at reception.”"),
      ],
    }],
  }],
};
