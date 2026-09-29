import type { UnitAssessment } from "./unit-assessments";

// Original, unit-wide checks. Answer keys are never returned by the public API.
export const UNIT_2_3_ASSESSMENTS: UnitAssessment[] = [
  {
    "id": "japanese-n5-unit-2-assessment",
    "passPercent": 80,
    "questions": [
      {
        "id": "family-pair",
        "prompt": "A speaker says あにと おとうとです。 Who are these people?",
        "options": [
          "Their parents",
          "Their older and younger brothers",
          "Their sisters",
          "Their friends"
        ],
        "correctIndex": 1
      },
      {
        "id": "family-age",
        "prompt": "Read: いもうとは 10さいです。 Which is true?",
        "options": [
          "The older sister is ten.",
          "The younger brother is ten.",
          "The younger sister is ten.",
          "The mother is ten."
        ],
        "correctIndex": 2
      },
      {
        "id": "person-question",
        "prompt": "You want to identify the person standing nearby. Which question asks who?",
        "options": [
          "この ひとは どこですか。",
          "この ひとは なんさいですか。",
          "これは なんですか。",
          "この ひとは だれですか。"
        ],
        "correctIndex": 3
      },
      {
        "id": "residence",
        "prompt": "Choose 'My older sister lives in Osaka'.",
        "options": [
          "あねは おおさかに すんでいます。",
          "あねは おおさかから きました。",
          "あねは おおさかが すきです。",
          "あねは おおさかのです。"
        ],
        "correctIndex": 0
      },
      {
        "id": "residence-question",
        "prompt": "Complete: どこ ___ すんでいますか。",
        "options": [
          "を",
          "に",
          "が",
          "と"
        ],
        "correctIndex": 1
      },
      {
        "id": "noun-link",
        "prompt": "What does にほんの まち mean?",
        "options": [
          "Japan and a town",
          "a town's name",
          "a town in Japan",
          "a Japanese person"
        ],
        "correctIndex": 2
      },
      {
        "id": "ownership",
        "prompt": "Read: その かさは ちちのです。 Who owns the umbrella?",
        "options": [
          "The speaker's mother",
          "The listener",
          "The speaker's sister",
          "The speaker's father"
        ],
        "correctIndex": 3
      },
      {
        "id": "whose",
        "prompt": "You found a pen. Ask who owns it.",
        "options": [
          "これは だれの ペンですか。",
          "これは どこですか。",
          "これは なんさいですか。",
          "これは どこの まちですか。"
        ],
        "correctIndex": 0
      },
      {
        "id": "preference",
        "prompt": "Complete: さかな ___ すきです。",
        "options": [
          "を",
          "が",
          "に",
          "から"
        ],
        "correctIndex": 1
      },
      {
        "id": "dislike",
        "prompt": "Choose 'I do not like meat'.",
        "options": [
          "にくが すきです。",
          "にくを たべます。",
          "にくは すきじゃないです。",
          "にくを ください。"
        ],
        "correctIndex": 2
      },
      {
        "id": "soft-refusal",
        "prompt": "Someone offers meat. You hear にくは ちょっと…。 What is the likely intention?",
        "options": [
          "Ask for a small portion",
          "Ask whose meat it is",
          "Say they always eat meat",
          "Politely decline the meat"
        ],
        "correctIndex": 3
      },
      {
        "id": "object",
        "prompt": "Choose the correct way to say 'I drink tea'.",
        "options": [
          "おちゃを のみます。",
          "おちゃが のみます。",
          "おちゃに のみます。",
          "おちゃを たべます。"
        ],
        "correctIndex": 0
      },
      {
        "id": "frequency",
        "prompt": "Read: パンを よく たべます。 What does よく tell you?",
        "options": [
          "The speaker never eats bread.",
          "The speaker eats bread often.",
          "The speaker dislikes bread.",
          "The speaker is asking for bread."
        ],
        "correctIndex": 1
      },
      {
        "id": "negative-frequency",
        "prompt": "Choose 'I do not drink coffee often'.",
        "options": [
          "コーヒーは あまり のみます。",
          "コーヒーを いつも のみます。",
          "コーヒーは あまり のみません。",
          "コーヒーが すきです。"
        ],
        "correctIndex": 2
      },
      {
        "id": "integrated",
        "prompt": "Read: ははは とうきょうに すんでいます。おちゃが すきです。あさごはんは よく パンを たべます。 Which summary matches?",
        "options": [
          "The mother lives in Osaka and dislikes tea.",
          "The father lives in Tokyo and often eats eggs.",
          "The mother never eats breakfast.",
          "The mother lives in Tokyo, likes tea, and often eats bread for breakfast."
        ],
        "correctIndex": 3
      }
    ]
  },
  {
    "id": "japanese-n5-unit-3-assessment",
    "passPercent": 80,
    "questions": [
      {
        "id": "menu",
        "prompt": "You need to see the restaurant's menu. What should you say?",
        "options": [
          "メニューを たべます。",
          "メニューを ください。",
          "メニューに すんでいます。",
          "メニューは いません。"
        ],
        "correctIndex": 1
      },
      {
        "id": "quantity",
        "prompt": "What is requested by うどん、ふたつ おねがいします。?",
        "options": [
          "One portion of udon",
          "Two cups of tea",
          "Two portions of udon",
          "Four portions of udon"
        ],
        "correctIndex": 2
      },
      {
        "id": "choice",
        "prompt": "Choose 'I will have coffee'.",
        "options": [
          "コーヒーは ありますか。",
          "コーヒーが すきです。",
          "コーヒーを のみません。",
          "コーヒーに します。"
        ],
        "correctIndex": 3
      },
      {
        "id": "availability",
        "prompt": "How do you ask whether the restaurant has juice?",
        "options": [
          "ジュースは ありますか。",
          "ジュースは いますか。",
          "ジュースは だれですか。",
          "ジュースに すんでいますか。"
        ],
        "correctIndex": 0
      },
      {
        "id": "negative-availability",
        "prompt": "Read: カレーは ありますか。— いいえ、ありません。 What does this tell you?",
        "options": [
          "The speaker chooses curry.",
          "Curry is not available.",
          "Curry is available.",
          "There are two curries."
        ],
        "correctIndex": 1
      },
      {
        "id": "kitchen",
        "prompt": "Which word names the kitchen?",
        "options": [
          "きょうしつ",
          "トイレ",
          "だいどころ",
          "しょくどう"
        ],
        "correctIndex": 2
      },
      {
        "id": "rooms",
        "prompt": "Read: わたしの いえには へやが よっつ あります。 How many rooms are there?",
        "options": [
          "Three",
          "Two",
          "One",
          "Four"
        ],
        "correctIndex": 3
      },
      {
        "id": "existence-particle",
        "prompt": "Complete: へやに いす ___ あります。",
        "options": [
          "が",
          "を",
          "から",
          "です"
        ],
        "correctIndex": 0
      },
      {
        "id": "distant-place",
        "prompt": "A restroom is far from both speakers. Complete: トイレは ___ です。",
        "options": [
          "そこ",
          "あそこ",
          "ここ",
          "これ"
        ],
        "correctIndex": 1
      },
      {
        "id": "position",
        "prompt": "What does ベッドの うしろ mean?",
        "options": [
          "under the bed",
          "on the bed",
          "behind the bed",
          "inside the bed"
        ],
        "correctIndex": 2
      },
      {
        "id": "object-location",
        "prompt": "Choose 'The book is inside the bag'.",
        "options": [
          "ほんは かばんの なかに います。",
          "ほんは かばんの うえに あります。",
          "ほんは かばんを なかに あります。",
          "ほんは かばんの なかに あります。"
        ],
        "correctIndex": 3
      },
      {
        "id": "person-location",
        "prompt": "Complete: がくせいは きょうしつに ___.",
        "options": [
          "います",
          "あります",
          "ください",
          "のみます"
        ],
        "correctIndex": 0
      },
      {
        "id": "absence",
        "prompt": "Read: ともだちは かいしゃに いません。 Which is definitely true?",
        "options": [
          "The friend is at home.",
          "The friend is not at the workplace.",
          "The friend is in the cafeteria.",
          "The friend is at the workplace."
        ],
        "correctIndex": 1
      },
      {
        "id": "left",
        "prompt": "Where is the restroom in トイレは しょくどうの ひだりです。?",
        "options": [
          "To the right of the cafeteria",
          "Inside the cafeteria",
          "To the left of the cafeteria",
          "Behind the cafeteria"
        ],
        "correctIndex": 2
      },
      {
        "id": "integrated",
        "prompt": "Read: たなかさんは しょくどうに います。おちゃに します。かばんは いすの したに あります。 Which summary matches?",
        "options": [
          "Tanaka is in the classroom and chooses coffee.",
          "Tanaka is absent from the cafeteria.",
          "The bag is on the chair and Tanaka chooses curry.",
          "Tanaka is in the cafeteria, chooses tea, and the bag is under the chair."
        ],
        "correctIndex": 3
      }
    ]
  }
];
