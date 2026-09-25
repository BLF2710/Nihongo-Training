export type AssessmentQuestion = { id: string; prompt: string; options: string[]; correctIndex: number };
export type UnitAssessment = { id: string; passPercent: number; questions: AssessmentQuestion[] };

// Answer keys stay on the server. Content draws only on existing Unit 1 Lessons 1–6.
export const UNIT_ASSESSMENTS: UnitAssessment[] = [{
  id: "japanese-n5-unit-1-assessment", passPercent: 80,
  questions: [
    { id: "greeting-evening", prompt: "You arrive in the evening. Which greeting fits?", options: ["おはようございます。", "こんばんは。", "ありがとうございます。", "またね。"], correctIndex: 1 },
    { id: "polite-thanks", prompt: "Someone you do not know well helps you. Choose a polite thank-you.", options: ["ありがとうございます。", "おはよう。", "こんばんは。", "よろしくおねがいします。"], correctIndex: 0 },
    { id: "get-attention", prompt: "You want to get someone's attention politely before asking a question. Choose the expression.", options: ["またね。", "はい。", "すみません。", "いいえ。"], correctIndex: 2 },
    { id: "introduction-reading", prompt: "Read: わたしは マリアです。なまえは なんですか。 What is Maria doing?", options: ["Asking someone's age", "Saying where she comes from", "Asking what an object is", "Introducing herself and asking a name"], correctIndex: 3 },
    { id: "topic-sound", prompt: "In わたしは さくらです, how is は pronounced?", options: ["ha", "wa", "ka", "na"], correctIndex: 1 },
    { id: "origin-reading", prompt: "Read: アメリカから きました。 What does the speaker tell you?", options: ["They came from the United States", "They are twenty years old", "Their name is Amerika", "They are holding a book"], correctIndex: 0 },
    { id: "nationality-reading", prompt: "Read: わたしは かんこくじんです。 What does this mean?", options: ["I came from Vietnam", "I am Japanese", "I am Korean", "Where is Korea?"], correctIndex: 2 },
    { id: "question-ending", prompt: "Complete the polite question: それは ほんです___。", options: ["から", "じん", "は", "か"], correctIndex: 3 },
    { id: "question-person", prompt: "Which question word asks about a person's identity?", options: ["どこ", "なん", "だれ", "なんさい"], correctIndex: 2 },
    { id: "negative-reply", prompt: "Someone asks これは ほんですか。 The object is a bag. Which short reply fits?", options: ["いいえ。", "はい。", "こんにちは。", "またね。"], correctIndex: 0 },
    { id: "numbers-reading", prompt: "Which pair means four and nine?", options: ["ろく・なな", "よん・きゅう", "さん・はち", "ご・じゅう"], correctIndex: 1 },
    { id: "age-reading", prompt: "Read: なんさいですか。— わたしは 20さいです。 What did you learn?", options: ["The person's name", "The person's nationality", "Where the person came from", "The person is twenty years old"], correctIndex: 3 },
    { id: "distant-object", prompt: "You point to an object far from both you and your listener. Which word means that one over there?", options: ["それ", "これ", "あれ", "この"], correctIndex: 2 },
    { id: "this-bag", prompt: "Choose the correct phrase for this bag.", options: ["この かばん", "これ かばん", "その かばん", "あの かばん"], correctIndex: 0 },
    { id: "combined-reading", prompt: "Read: あの ひとは せんせいです。 Choose the meaning.", options: ["That person over there is a student", "That person over there is a teacher", "Is this a book?", "Where is that bag?"], correctIndex: 1 },
  ],
}];
