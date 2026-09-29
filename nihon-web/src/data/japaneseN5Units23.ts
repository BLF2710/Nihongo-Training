import type { N5Lesson, Question } from "./japaneseN5Lessons";

// Original activities adapted to IRODORI Starter's Can-do sequence.
// Source mapping and deliberate simplifications: docs/JAPANESE-CURRICULUM.md.
type QuestionSeed = [prompt: string, correct: string, distractors: [string, string, string], explanation: string];
type LessonSeed = {
  unitNumber: number; lessonNumber: number; key: string; title: string; goal: string;
  vocabulary: N5Lesson["vocabulary"]; grammar: NonNullable<N5Lesson["grammar"]>;
  dialogue: N5Lesson["dialogue"]; practice: QuestionSeed[]; challenge: QuestionSeed[];
};

const seeds: LessonSeed[] = [
  {
    "unitNumber": 2,
    "lessonNumber": 1,
    "key": "family",
    "title": "Family & People",
    "goal": "I can introduce family members and identify people in a photograph.",
    "vocabulary": [
      [
        "かぞく",
        "kazoku",
        "family"
      ],
      [
        "ちち",
        "chichi",
        "my father"
      ],
      [
        "はは",
        "haha",
        "my mother"
      ],
      [
        "あに",
        "ani",
        "my older brother"
      ],
      [
        "あね",
        "ane",
        "my older sister"
      ],
      [
        "おとうと",
        "otouto",
        "younger brother"
      ],
      [
        "いもうと",
        "imouto",
        "younger sister"
      ],
      [
        "ともだち",
        "tomodachi",
        "friend"
      ],
      [
        "ひと",
        "hito",
        "person"
      ],
      [
        "しゃしん",
        "shashin",
        "photograph"
      ]
    ],
    "grammar": [
      {
        "title": "Name two people with と",
        "pattern": "N1 と N2 です。",
        "explanation": "Put と between two nouns to say and. Use ちち and はは when speaking about your own parents to someone outside your family. These are not the usual words for addressing your parents.",
        "examples": [
          {
            "japanese": "ちちと ははです。",
            "romaji": "Chichi to haha desu.",
            "meaning": "They are my father and mother."
          }
        ],
        "notes": [
          "For someone else's parents, おとうさん (otousan) and おかあさん (okaasan) are polite choices."
        ]
      },
      {
        "title": "Identify a person",
        "pattern": "あの ひとは だれですか。",
        "explanation": "Use あの ひと for that person over there, not あれ when referring directly to a person. In a family photo, point and ask だれですか. Age questions use the Unit 1 pattern; ask only when appropriate.",
        "examples": [
          {
            "japanese": "あの ひとは だれですか。あにです。",
            "romaji": "Ano hito wa dare desu ka. Ani desu.",
            "meaning": "Who is that person over there? My older brother."
          },
          {
            "japanese": "いもうとは 8さいです。",
            "romaji": "Imouto wa hassai desu.",
            "meaning": "My younger sister is eight."
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "この しゃしんは？",
        "B",
        "かぞくです。"
      ],
      [
        "A",
        "だれですか。",
        "B",
        "ちちと ははです。"
      ]
    ],
    "practice": [
      [
        "Which word means your own mother?",
        "はは",
        [
          "ちち",
          "あに",
          "あね"
        ],
        "はは refers to your mother when speaking about her."
      ],
      [
        "Complete: ちち ___ ははです。 (father and mother)",
        "と",
        [
          "か",
          "から",
          "です"
        ],
        "と joins nouns: father and mother."
      ],
      [
        "Translate: あねです。",
        "She is my older sister.",
        [
          "She is my younger sister.",
          "He is my older brother.",
          "She is my mother."
        ],
        "あね means your older sister."
      ],
      [
        "Ask who a person in a photograph is.",
        "だれですか。",
        [
          "なんさいですか。",
          "どこから きましたか。",
          "これは なんですか。"
        ],
        "だれ asks about a person's identity."
      ],
      [
        "Read: いもうとは 8さいです。 Who is eight?",
        "My younger sister",
        [
          "My older sister",
          "My younger brother",
          "My friend"
        ],
        "いもうと identifies a younger sister; 8さい is hassai."
      ]
    ],
    "challenge": [
      [
        "Which means family?",
        "かぞく",
        [
          "くに",
          "なまえ",
          "しゃしん"
        ],
        "かぞく means family."
      ],
      [
        "Translate: おとうとです。",
        "He is my younger brother.",
        [
          "He is my father.",
          "She is my younger sister.",
          "He is my older brother."
        ],
        "おとうと is younger brother."
      ],
      [
        "Choose 'my older brother and older sister'.",
        "あにと あね",
        [
          "あにか あね",
          "あにから あね",
          "あにです あね"
        ],
        "と joins the two family-member nouns."
      ],
      [
        "You point to an adult standing far away. Ask who they are.",
        "あの ひとは だれですか。",
        [
          "あれは なんですか。",
          "あの ひとは どこですか。",
          "これは ほんですか。"
        ],
        "あの ひと is a person over there; だれ asks who."
      ],
      [
        "Read: ちちと ははです。ともだちですか。— いいえ。 Who were introduced?",
        "The speaker's parents",
        [
          "Two friends",
          "Two teachers",
          "The speaker's siblings"
        ],
        "ちち and はは are the speaker's father and mother."
      ]
    ]
  },
  {
    "unitNumber": 2,
    "lessonNumber": 2,
    "key": "living",
    "title": "Where I Live",
    "goal": "I can say where I live and ask where someone lives.",
    "vocabulary": [
      [
        "すんでいます",
        "sunde imasu",
        "live / be living"
      ],
      [
        "いえ",
        "ie",
        "house / home"
      ],
      [
        "まち",
        "machi",
        "town"
      ],
      [
        "とうきょう",
        "Toukyou",
        "Tokyo"
      ],
      [
        "おおさか",
        "Oosaka",
        "Osaka"
      ],
      [
        "にほん",
        "Nihon",
        "Japan"
      ],
      [
        "ベトナム",
        "Betonamu",
        "Vietnam"
      ]
    ],
    "grammar": [
      {
        "title": "Say where you live",
        "pattern": "Place に すんでいます。",
        "explanation": "Put に after the place where you live. Learn すんでいます as a useful whole expression meaning live; you do not need to conjugate new verbs yet. This says where you live now, not where you came from.",
        "examples": [
          {
            "japanese": "わたしは おおさかに すんでいます。",
            "romaji": "Watashi wa Oosaka ni sunde imasu.",
            "meaning": "I live in Osaka."
          },
          {
            "japanese": "どこに すんでいますか。",
            "romaji": "Doko ni sunde imasu ka.",
            "meaning": "Where do you live?"
          }
        ]
      },
      {
        "title": "Connect places with の",
        "pattern": "N1 の N2",
        "explanation": "の links two nouns. The second noun is the main thing: にほんの まち means a town in Japan. You will use the same connector for belongings next.",
        "examples": [
          {
            "japanese": "おおさかは にほんの まちです。",
            "romaji": "Oosaka wa Nihon no machi desu.",
            "meaning": "Osaka is a city in Japan."
          }
        ],
        "notes": [
          "住んでいます is written すんでいます here. Its dictionary form is 住む（すむ）, to live."
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "どこに すんでいますか。",
        "B",
        "とうきょうに すんでいます。"
      ],
      [
        "A",
        "かぞくは？",
        "B",
        "ベトナムに すんでいます。"
      ]
    ],
    "practice": [
      [
        "Which means town?",
        "まち",
        [
          "かぞく",
          "なまえ",
          "はは"
        ],
        "まち means town or city."
      ],
      [
        "Complete: おおさか ___ すんでいます。",
        "に",
        [
          "を",
          "か",
          "と"
        ],
        "に marks the place where someone lives."
      ],
      [
        "Translate: かぞくは ベトナムに すんでいます。",
        "My family lives in Vietnam.",
        [
          "My family came from Vietnam.",
          "My friend lives in Japan.",
          "My family is Vietnamese."
        ],
        "すんでいます describes current residence, not nationality or origin."
      ],
      [
        "Choose 'a town in Japan'.",
        "にほんの まち",
        [
          "にほんと まち",
          "にほんか まち",
          "まちの にほん"
        ],
        "の links Japan to the main noun まち."
      ],
      [
        "Ask where someone lives.",
        "どこに すんでいますか。",
        [
          "だれですか。",
          "なんさいですか。",
          "なまえは なんですか。"
        ],
        "どこに asks in what place."
      ]
    ],
    "challenge": [
      [
        "Which is Tokyo?",
        "とうきょう",
        [
          "おおさか",
          "ベトナム",
          "いえ"
        ],
        "とうきょう is Tokyo."
      ],
      [
        "Read: おおさかに すんでいます。 Where does the speaker live?",
        "Osaka",
        [
          "Tokyo",
          "Vietnam",
          "Korea"
        ],
        "おおさか is Osaka; に すんでいます names where someone lives."
      ],
      [
        "Complete: にほん ___ まちです。 (a town in Japan)",
        "の",
        [
          "か",
          "を",
          "です"
        ],
        "の connects the location noun to まち."
      ],
      [
        "Choose 'I live in Vietnam'.",
        "わたしは ベトナムに すんでいます。",
        [
          "わたしは ベトナムから きました。",
          "わたしは ベトナムじんです。",
          "わたしは ベトナムですか。"
        ],
        "Use に すんでいます for where you live."
      ],
      [
        "Read: わたしは とうきょうに すんでいます。かぞくは ベトナムに すんでいます。 Where does the speaker live?",
        "Tokyo",
        [
          "Vietnam",
          "Osaka",
          "The sentence does not say"
        ],
        "The first sentence describes わたし; the second describes かぞく."
      ]
    ]
  },
  {
    "unitNumber": 2,
    "lessonNumber": 3,
    "key": "belongings",
    "title": "My Family & My Things",
    "goal": "I can explain who something belongs to.",
    "vocabulary": [
      [
        "わたしの",
        "watashi no",
        "my / mine"
      ],
      [
        "あなたの",
        "anata no",
        "your / yours"
      ],
      [
        "だれの",
        "dare no",
        "whose"
      ],
      [
        "かばん",
        "kaban",
        "bag"
      ],
      [
        "ほん",
        "hon",
        "book"
      ],
      [
        "かさ",
        "kasa",
        "umbrella"
      ],
      [
        "ペン",
        "pen",
        "pen"
      ]
    ],
    "grammar": [
      {
        "title": "Name the owner with の",
        "pattern": "Owner の Noun",
        "explanation": "Put the owner first and the thing second: わたしの かばん is my bag. の also connects family relationships, as in わたしの はは. Use a person's name plus さん when possible instead of repeatedly saying あなた.",
        "examples": [
          {
            "japanese": "これは わたしの かさです。",
            "romaji": "Kore wa watashi no kasa desu.",
            "meaning": "This is my umbrella."
          },
          {
            "japanese": "その ほんは たなかさんの ほんです。",
            "romaji": "Sono hon wa Tanaka-san no hon desu.",
            "meaning": "That book is Tanaka's book."
          }
        ]
      },
      {
        "title": "Ask whose it is",
        "pattern": "これは だれの Noun ですか。",
        "explanation": "だれの means whose. If the object is already clear, you can omit the repeated noun: わたしのです means it is mine.",
        "examples": [
          {
            "japanese": "これは だれの ペンですか。わたしのです。",
            "romaji": "Kore wa dare no pen desu ka. Watashi no desu.",
            "meaning": "Whose pen is this? It is mine."
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "これは だれの かばんですか。",
        "B",
        "あねの かばんです。"
      ],
      [
        "A",
        "その ペンは あなたのですか。",
        "B",
        "はい、わたしのです。"
      ]
    ],
    "practice": [
      [
        "Which means umbrella?",
        "かさ",
        [
          "かばん",
          "ほん",
          "ペン"
        ],
        "かさ is an umbrella."
      ],
      [
        "Complete: わたし ___ ほんです。",
        "の",
        [
          "と",
          "から",
          "か"
        ],
        "の connects an owner to the thing owned."
      ],
      [
        "Translate: ははの かばん",
        "my mother's bag",
        [
          "my mother and a bag",
          "my friend's bag",
          "my mother's name"
        ],
        "はは is your mother; の links her to the bag."
      ],
      [
        "Ask whose umbrella this is.",
        "これは だれの かさですか。",
        [
          "これは どこの かさですか。",
          "これは なんですか。",
          "だれに すんでいますか。"
        ],
        "だれの asks about ownership, rather than origin or object type."
      ],
      [
        "Someone asks if a pen is yours. Answer yes.",
        "はい、わたしのです。",
        [
          "いいえ、わたしのです。",
          "はい、たなかさんのです。",
          "はい、かぞくです。"
        ],
        "わたしの identifies you as the owner."
      ]
    ],
    "challenge": [
      [
        "What does だれの mean?",
        "whose",
        [
          "where",
          "how old",
          "what"
        ],
        "Add の to だれ to ask who owns something."
      ],
      [
        "Read: これは あにの ほんです。 Who owns the book?",
        "My older brother",
        [
          "My younger brother",
          "My older sister",
          "Tanaka"
        ],
        "あに means your older brother."
      ],
      [
        "Choose 'Tanaka's umbrella'.",
        "たなかさんの かさ",
        [
          "たなかさんと かさ",
          "かさの たなかさん",
          "たなかさんは かさ"
        ],
        "The owner comes before の and the object after it."
      ],
      [
        "Choose the correct sentence for 'That bag is mine'.",
        "その かばんは わたしのです。",
        [
          "それ かばんは わたしのです。",
          "その かばんは あなたのです。",
          "その かばんは わたしとです。"
        ],
        "その needs a noun; わたしの can stand alone when the bag is understood."
      ],
      [
        "Read: この ペンは わたしのです。その ペンは ともだちのです。 Who owns the second pen?",
        "A friend",
        [
          "The speaker",
          "The speaker's father",
          "A teacher"
        ],
        "その ペン is the second pen, linked to ともだち by の."
      ]
    ]
  },
  {
    "unitNumber": 2,
    "lessonNumber": 4,
    "key": "preferences",
    "title": "Things I Like",
    "goal": "I can say what food and drinks I like and politely decline something.",
    "vocabulary": [
      [
        "すき",
        "suki",
        "liked / favorite"
      ],
      [
        "たべもの",
        "tabemono",
        "food"
      ],
      [
        "のみもの",
        "nomimono",
        "drink / beverage"
      ],
      [
        "おちゃ",
        "ocha",
        "tea"
      ],
      [
        "みず",
        "mizu",
        "water"
      ],
      [
        "ごはん",
        "gohan",
        "cooked rice / meal"
      ],
      [
        "にく",
        "niku",
        "meat"
      ],
      [
        "さかな",
        "sakana",
        "fish"
      ],
      [
        "やさい",
        "yasai",
        "vegetables"
      ]
    ],
    "grammar": [
      {
        "title": "Talk about likes",
        "pattern": "N が すきです。 / N が すきですか。",
        "explanation": "Put が after the thing you like and finish with すきです. Add か to ask. Unlike English like, すき does not take the action-object marker を in this pattern.",
        "examples": [
          {
            "japanese": "わたしは やさいが すきです。",
            "romaji": "Watashi wa yasai ga suki desu.",
            "meaning": "I like vegetables."
          },
          {
            "japanese": "どんな たべものが すきですか。",
            "romaji": "Donna tabemono ga suki desu ka.",
            "meaning": "What kind of food do you like?"
          }
        ],
        "notes": [
          "どんな means what kind of and comes before a noun. 好き is read すき."
        ]
      },
      {
        "title": "Express a dislike gently",
        "pattern": "N は すきじゃないです。 / N は ちょっと…。",
        "explanation": "すきじゃないです means do not like. は can contrast a food with others. In reply to an offer, N は ちょっと… is a gentle way to signal that it does not suit you; it does not mean you want a small portion.",
        "examples": [
          {
            "japanese": "にくは すきじゃないです。",
            "romaji": "Niku wa suki janai desu.",
            "meaning": "I do not like meat."
          },
          {
            "japanese": "さかなは ちょっと…。",
            "romaji": "Sakana wa chotto...",
            "meaning": "Fish is not really for me…"
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "どんな たべものが すきですか。",
        "B",
        "やさいが すきです。"
      ],
      [
        "A",
        "にくは？",
        "B",
        "にくは ちょっと…。"
      ]
    ],
    "practice": [
      [
        "Which means vegetables?",
        "やさい",
        [
          "にく",
          "さかな",
          "みず"
        ],
        "やさい means vegetables."
      ],
      [
        "Complete: おちゃ ___ すきです。",
        "が",
        [
          "を",
          "から",
          "に"
        ],
        "が marks what you like in this pattern."
      ],
      [
        "Translate: さかなは すきじゃないです。",
        "I do not like fish.",
        [
          "I like fish.",
          "I do not drink water.",
          "I like meat."
        ],
        "じゃない makes this preference negative."
      ],
      [
        "You want to ask what kind of food someone likes.",
        "どんな たべものが すきですか。",
        [
          "どこに すんでいますか。",
          "だれの たべものですか。",
          "なんさいですか。"
        ],
        "どんな + noun asks what kind; が すきですか asks about liking it."
      ],
      [
        "You offer fish. Someone says さかなは ちょっと…。 What is likely meant?",
        "A gentle refusal of fish",
        [
          "A request for a little fish",
          "A strong love of fish",
          "A question about the fish's owner"
        ],
        "In an offer/refusal context, trailing off after ちょっと softens reluctance."
      ]
    ],
    "challenge": [
      [
        "Which means drink or beverage?",
        "のみもの",
        [
          "たべもの",
          "かぞく",
          "ひと"
        ],
        "のみもの means a beverage."
      ],
      [
        "Read: ごはんが すきです。",
        "I like rice.",
        [
          "I do not like rice.",
          "I live in Japan.",
          "Whose rice is this?"
        ],
        "ごはん can mean cooked rice or a meal; here it names a food preference."
      ],
      [
        "Choose 'I like tea'.",
        "おちゃが すきです。",
        [
          "おちゃを すきです。",
          "おちゃに すきです。",
          "おちゃが すきじゃないです。"
        ],
        "Use が before すきです."
      ],
      [
        "Reply yes to やさいが すきですか。",
        "はい、すきです。",
        [
          "いいえ、すきです。",
          "はい、すきじゃないです。",
          "だれのですか。"
        ],
        "When the food is understood, you can answer simply すきです."
      ],
      [
        "Read: ははは さかなが すきです。わたしは さかなは すきじゃないです。 Who likes fish?",
        "The speaker's mother",
        [
          "The speaker",
          "Both people",
          "Neither person"
        ],
        "はは has a positive preference; わたし has a negative one."
      ]
    ]
  },
  {
    "unitNumber": 2,
    "lessonNumber": 5,
    "key": "eat-drink",
    "title": "What I Eat and Drink",
    "goal": "I can say what I usually eat and drink for breakfast.",
    "vocabulary": [
      [
        "あさごはん",
        "asagohan",
        "breakfast"
      ],
      [
        "パン",
        "pan",
        "bread"
      ],
      [
        "たまご",
        "tamago",
        "egg"
      ],
      [
        "コーヒー",
        "koohii",
        "coffee"
      ],
      [
        "たべます",
        "tabemasu",
        "eat"
      ],
      [
        "のみます",
        "nomimasu",
        "drink"
      ],
      [
        "いつも",
        "itsumo",
        "always / usually"
      ],
      [
        "よく",
        "yoku",
        "often"
      ],
      [
        "あまり",
        "amari",
        "not often / not much (with a negative)"
      ]
    ],
    "grammar": [
      {
        "title": "Food and polite actions",
        "pattern": "N を たべます / のみます。",
        "explanation": "を is pronounced o and marks what you eat or drink. Learn たべます and のみます as polite action forms. Replace ます with ません to say do not: たべません, のみません.",
        "examples": [
          {
            "japanese": "あさごはんは パンを たべます。",
            "romaji": "Asagohan wa pan o tabemasu.",
            "meaning": "For breakfast, I eat bread."
          },
          {
            "japanese": "コーヒーは のみません。",
            "romaji": "Koohii wa nomimasen.",
            "meaning": "I do not drink coffee."
          }
        ],
        "notes": [
          "は can replace を when you contrast a food or drink with others."
        ]
      },
      {
        "title": "Say how often",
        "pattern": "いつも / よく V-ます。 / あまり V-ません。",
        "explanation": "いつも means always or habitually; よく means often. Use あまり with a negative ending to say not often or not much. Keep the food before を and the action at the end.",
        "examples": [
          {
            "japanese": "いつも おちゃを のみます。",
            "romaji": "Itsumo ocha o nomimasu.",
            "meaning": "I always drink tea."
          },
          {
            "japanese": "よく たまごを たべます。",
            "romaji": "Yoku tamago o tabemasu.",
            "meaning": "I often eat eggs."
          },
          {
            "japanese": "にくは あまり たべません。",
            "romaji": "Niku wa amari tabemasen.",
            "meaning": "I do not eat much meat."
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "あさごはんは なにを たべますか。",
        "B",
        "いつも パンを たべます。"
      ],
      [
        "A",
        "コーヒーを のみますか。",
        "B",
        "いいえ、コーヒーは あまり のみません。おちゃを のみます。"
      ]
    ],
    "practice": [
      [
        "Which word means breakfast?",
        "あさごはん",
        [
          "かぞく",
          "のみもの",
          "まち"
        ],
        "あさ means morning; あさごはん is breakfast."
      ],
      [
        "Complete: みず ___ のみます。",
        "を",
        [
          "が",
          "の",
          "と"
        ],
        "を marks the drink consumed."
      ],
      [
        "Choose the negative of たべます.",
        "たべません",
        [
          "たべです",
          "たべか",
          "たべすき"
        ],
        "Replace the polite ending ます with ません."
      ],
      [
        "Translate: よく パンを たべます。",
        "I often eat bread.",
        [
          "I never eat bread.",
          "I always drink tea.",
          "I like bread."
        ],
        "よく adds often to the action たべます."
      ],
      [
        "Complete: コーヒーは あまり ___.",
        "のみません",
        [
          "のみます",
          "すきです",
          "です"
        ],
        "Frequency あまり pairs with a negative action to mean not often."
      ]
    ],
    "challenge": [
      [
        "Which means drink (polite)?",
        "のみます",
        [
          "たべます",
          "すんでいます",
          "すき"
        ],
        "のみます is the action of drinking."
      ],
      [
        "Read: いつも たまごを たべます。",
        "I always eat eggs.",
        [
          "I sometimes drink tea.",
          "I do not eat eggs.",
          "I always eat fish."
        ],
        "いつも signals a regular habit; たまご is egg."
      ],
      [
        "Choose 'I do not drink water'.",
        "みずを のみません。",
        [
          "みずを のみます。",
          "みずを たべます。",
          "みずに すんでいます。"
        ],
        "Use the drink verb with its negative ません ending."
      ],
      [
        "A friend asks なにを たべますか。 Choose a direct answer.",
        "パンと たまごを たべます。",
        [
          "おちゃを のみます。",
          "とうきょうに すんでいます。",
          "パンは だれのですか。"
        ],
        "なにを たべますか asks what you eat; と joins the foods."
      ],
      [
        "Read: あさごはんは よく パンを たべます。コーヒーは あまり のみません。 Which is true?",
        "The speaker often eats bread and does not drink coffee often.",
        [
          "The speaker never eats bread.",
          "The speaker always drinks coffee.",
          "The speaker lives in Tokyo."
        ],
        "よく is often; あまり with のみません is not often."
      ]
    ]
  },
  {
    "unitNumber": 2,
    "lessonNumber": 6,
    "key": "review",
    "title": "Unit 2 Review",
    "goal": "I can understand a short introduction about family, home, belongings, and eating habits.",
    "vocabulary": [
      [
        "かぞく",
        "kazoku",
        "family"
      ],
      [
        "わたしの",
        "watashi no",
        "my / mine"
      ],
      [
        "すんでいます",
        "sunde imasu",
        "live / be living"
      ],
      [
        "すき",
        "suki",
        "liked / favorite"
      ],
      [
        "よく",
        "yoku",
        "often"
      ],
      [
        "あまり",
        "amari",
        "not often / not much (with a negative)"
      ]
    ],
    "grammar": [
      {
        "title": "Connect familiar ideas",
        "pattern": "N と N / N の N / Place に すんでいます",
        "explanation": "Use と to list family members, の to connect an owner and a thing, and に to mark where someone lives. Keep each statement short. This lesson reviews earlier patterns; the separate unit assessment comes afterward.",
        "examples": [
          {
            "japanese": "ちちと ははは ベトナムに すんでいます。",
            "romaji": "Chichi to haha wa Betonamu ni sunde imasu.",
            "meaning": "My father and mother live in Vietnam."
          },
          {
            "japanese": "この かばんは あねのです。",
            "romaji": "Kono kaban wa ane no desu.",
            "meaning": "This bag is my older sister's."
          }
        ]
      },
      {
        "title": "Separate preference from habit",
        "pattern": "N が すきです。 / N を よく V-ます。",
        "explanation": "すきです tells what you like; たべます and のみます tell what you do. For not often, use あまり with ません.",
        "examples": [
          {
            "japanese": "おちゃが すきです。よく おちゃを のみます。",
            "romaji": "Ocha ga suki desu. Yoku ocha o nomimasu.",
            "meaning": "I like tea. I often drink tea."
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "どこに すんでいますか。",
        "B",
        "おおさかに すんでいます。"
      ],
      [
        "A",
        "あさごはんは なにを たべますか。",
        "B",
        "パンと たまごを たべます。"
      ]
    ],
    "practice": [
      [
        "Complete: あに ___ あねです。 (older brother and older sister)",
        "と",
        [
          "を",
          "に",
          "か"
        ],
        "と lists two nouns."
      ],
      [
        "Read: この かさは ははのです。 Whose umbrella?",
        "My mother's",
        [
          "My father's",
          "My friend's",
          "Mine"
        ],
        "ははの means your mother's."
      ],
      [
        "Choose 'My family lives in Japan'.",
        "かぞくは にほんに すんでいます。",
        [
          "かぞくは にほんから きました。",
          "かぞくは にほんのです。",
          "かぞくは にほんを のみます。"
        ],
        "に すんでいます describes residence."
      ],
      [
        "Complete: やさい ___ すきです。",
        "が",
        [
          "を",
          "に",
          "と"
        ],
        "Use が with すきです, not the action-object を."
      ],
      [
        "Read: にくは あまり たべません。",
        "I do not eat much meat.",
        [
          "I always eat meat.",
          "I like meat.",
          "I never drink water."
        ],
        "あまり with a negative means not much or not often, not necessarily never."
      ]
    ],
    "challenge": [
      [
        "Which question asks whose bag it is?",
        "だれの かばんですか。",
        [
          "どこに すんでいますか。",
          "かばんが すきですか。",
          "かばんは なんさいですか。"
        ],
        "だれの asks ownership."
      ],
      [
        "Choose a sentence meaning 'I often drink tea'.",
        "よく おちゃを のみます。",
        [
          "よく おちゃを たべます。",
          "あまり おちゃを のみます。",
          "おちゃに すんでいます。"
        ],
        "Tea takes のみます; よく is often."
      ],
      [
        "Read: わたしは おおさかに すんでいます。ははは とうきょうに すんでいます。 Where does the mother live?",
        "Tokyo",
        [
          "Osaka",
          "Vietnam",
          "Not stated"
        ],
        "The second sentence uses はは as its topic."
      ],
      [
        "Politely express reluctance when offered meat.",
        "にくは ちょっと…。",
        [
          "にくが すきです。",
          "にくを よく たべます。",
          "にくは だれのですか。"
        ],
        "Trailing off with ちょっと can soften a refusal."
      ],
      [
        "Read: あねの かばんです。あねは ベトナムに すんでいます。やさいが すきです。 Choose the matching summary.",
        "The bag belongs to the older sister, who lives in Vietnam and likes vegetables.",
        [
          "The bag belongs to the mother, who lives in Japan.",
          "The younger sister owns the bag and dislikes vegetables.",
          "The older brother owns the bag and drinks tea."
        ],
        "あねの gives ownership; に gives residence; が すきです gives a preference."
      ]
    ]
  },
  {
    "unitNumber": 3,
    "lessonNumber": 1,
    "key": "ordering",
    "title": "Ordering Food",
    "goal": "I can politely order simple food and drinks.",
    "vocabulary": [
      [
        "レストラン",
        "resutoran",
        "restaurant"
      ],
      [
        "みせ",
        "mise",
        "shop / restaurant"
      ],
      [
        "メニュー",
        "menyuu",
        "menu"
      ],
      [
        "カレー",
        "karee",
        "curry"
      ],
      [
        "うどん",
        "udon",
        "udon noodles"
      ],
      [
        "おねがいします",
        "onegaishimasu",
        "please (a polite request)"
      ],
      [
        "ください",
        "kudasai",
        "please give me"
      ],
      [
        "ひとつ",
        "hitotsu",
        "one item / portion"
      ],
      [
        "ふたつ",
        "futatsu",
        "two items / portions"
      ]
    ],
    "grammar": [
      {
        "title": "Order politely",
        "pattern": "N、 おねがいします。 / N を ください。",
        "explanation": "Name the item, then say おねがいします or ください. を can mark the item requested with ください and is often omitted in short orders. These patterns request things; they do not mean you are already eating them.",
        "examples": [
          {
            "japanese": "うどん、 おねがいします。",
            "romaji": "Udon, onegaishimasu.",
            "meaning": "Udon, please."
          },
          {
            "japanese": "みずを ください。",
            "romaji": "Mizu o kudasai.",
            "meaning": "Water, please."
          }
        ]
      },
      {
        "title": "Order one or two portions",
        "pattern": "N、 ひとつ / ふたつ ください。",
        "explanation": "Use ひとつ for one and ふたつ for two in simple orders. These are general item counts, different from ages. Other counters exist, but you only need these two here.",
        "examples": [
          {
            "japanese": "カレー、 ふたつ おねがいします。",
            "romaji": "Karee, futatsu onegaishimasu.",
            "meaning": "Two curries, please."
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "メニューを ください。",
        "B",
        "はい。"
      ],
      [
        "A",
        "カレー、 ひとつ おねがいします。",
        "B",
        "はい、カレー、ひとつ。"
      ]
    ],
    "practice": [
      [
        "Which word means menu?",
        "メニュー",
        [
          "みせ",
          "いえ",
          "かぞく"
        ],
        "メニュー is a menu."
      ],
      [
        "Choose a polite request for water.",
        "みずを ください。",
        [
          "みずを たべます。",
          "みずに すんでいます。",
          "みずの かぞくです。"
        ],
        "N を ください asks someone to give you an item."
      ],
      [
        "How many portions is ふたつ?",
        "Two",
        [
          "One",
          "Three",
          "Ten"
        ],
        "ふたつ is the general count for two items."
      ],
      [
        "Complete: カレー、ひとつ ___. (a request)",
        "おねがいします",
        [
          "すんでいます",
          "たべません",
          "すきですか"
        ],
        "おねがいします turns the named item and quantity into a polite order."
      ],
      [
        "Translate: うどんを ください。",
        "Udon, please.",
        [
          "I do not eat udon.",
          "Where is the udon?",
          "Whose udon is this?"
        ],
        "ください requests an item."
      ]
    ],
    "challenge": [
      [
        "Which means restaurant?",
        "レストラン",
        [
          "メニュー",
          "かばん",
          "まち"
        ],
        "レストラン is restaurant."
      ],
      [
        "Read: カレー、ひとつ おねがいします。",
        "One curry, please.",
        [
          "Two curries, please.",
          "I like curry.",
          "I do not eat curry."
        ],
        "ひとつ requests one portion."
      ],
      [
        "Complete the taught pattern: みず ___ ください。",
        "を",
        [
          "に",
          "が",
          "から"
        ],
        "を marks what you request before ください."
      ],
      [
        "You need a menu. Choose a request, not a statement.",
        "メニューを ください。",
        [
          "メニューです。",
          "メニューが すきです。",
          "メニューは たなかさんのです。"
        ],
        "ください asks for the menu."
      ],
      [
        "Order two udon portions politely.",
        "うどん、ふたつ おねがいします。",
        [
          "うどん、ひとつ おねがいします。",
          "うどん、ふたつ すんでいます。",
          "うどんは あまり たべません。"
        ],
        "Use the food plus ふたつ and a polite request."
      ]
    ]
  },
  {
    "unitNumber": 3,
    "lessonNumber": 2,
    "key": "choosing",
    "title": "What Would You Like?",
    "goal": "I can choose an order and ask whether an item is available.",
    "vocabulary": [
      [
        "にします",
        "ni shimasu",
        "choose / decide on"
      ],
      [
        "ありますか",
        "arimasu ka",
        "is there? / do you have?"
      ],
      [
        "あります",
        "arimasu",
        "there is / there are"
      ],
      [
        "ありません",
        "arimasen",
        "there is not / there are not"
      ],
      [
        "なに",
        "nani",
        "what"
      ],
      [
        "ジュース",
        "juusu",
        "juice"
      ],
      [
        "コーヒー",
        "koohii",
        "coffee"
      ]
    ],
    "grammar": [
      {
        "title": "Say what you choose",
        "pattern": "N にします。 / なにに しますか。",
        "explanation": "にします means you decide on an option. Ask なにに しますか when choosing together. This is a choice, not the same as saying you like something.",
        "examples": [
          {
            "japanese": "わたしは カレーに します。",
            "romaji": "Watashi wa karee ni shimasu.",
            "meaning": "I will have curry."
          },
          {
            "japanese": "なにに しますか。",
            "romaji": "Nani ni shimasu ka.",
            "meaning": "What will you have?"
          }
        ]
      },
      {
        "title": "Check availability",
        "pattern": "N は ありますか。",
        "explanation": "Use は ありますか to ask whether an item is available. Answer あります for yes or ありません for no. Next you will use あります for objects in a home too.",
        "examples": [
          {
            "japanese": "ジュースは ありますか。",
            "romaji": "Juusu wa arimasu ka.",
            "meaning": "Do you have juice?"
          },
          {
            "japanese": "いいえ、ありません。",
            "romaji": "Iie, arimasen.",
            "meaning": "No, we do not."
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "ジュースは ありますか。",
        "B",
        "いいえ、ありません。"
      ],
      [
        "A",
        "おちゃに します。おちゃ、ひとつ おねがいします。",
        "B",
        "はい。"
      ]
    ],
    "practice": [
      [
        "Choose the meaning of にします in an order.",
        "decide on",
        [
          "live in",
          "belong to",
          "come from"
        ],
        "にします expresses a choice."
      ],
      [
        "Complete: コーヒー ___ します。",
        "に",
        [
          "が",
          "を",
          "と"
        ],
        "Use N にします for deciding on something."
      ],
      [
        "Ask whether tea is available.",
        "おちゃは ありますか。",
        [
          "おちゃは だれですか。",
          "おちゃに すんでいますか。",
          "おちゃを たべますか。"
        ],
        "ありますか asks about availability."
      ],
      [
        "What does ありません mean here?",
        "There is none / we do not have it.",
        [
          "I will have it.",
          "It is mine.",
          "There are two."
        ],
        "ません makes あります negative."
      ],
      [
        "A friend asks なにに しますか。 Choose a direct answer.",
        "うどんに します。",
        [
          "うどんは どこですか。",
          "うどんは だれのですか。",
          "うどんが すきですか。"
        ],
        "State your choice with にします."
      ]
    ],
    "challenge": [
      [
        "Which means juice?",
        "ジュース",
        [
          "コーヒー",
          "おちゃ",
          "みず"
        ],
        "ジュース is juice."
      ],
      [
        "Read: わたしは おちゃに します。",
        "I will have tea.",
        [
          "I live in a tea shop.",
          "I do not like tea.",
          "Do you have tea?"
        ],
        "にします expresses the speaker's decision."
      ],
      [
        "Complete: カレーは ___。 (Do you have curry?)",
        "ありますか",
        [
          "あります",
          "ありません",
          "にします"
        ],
        "A question needs the question ending か."
      ],
      [
        "Reply no when asked ジュースは ありますか。",
        "いいえ、ありません。",
        [
          "はい、あります。",
          "はい、すきです。",
          "いいえ、にします。"
        ],
        "ありません is the negative availability reply."
      ],
      [
        "Read: ジュースは ありますか。— いいえ、ありません。— では、おちゃに します。 (では = then.) What is chosen?",
        "Tea",
        [
          "Juice",
          "Coffee",
          "Water"
        ],
        "The final にします sentence names tea as the choice."
      ]
    ]
  },
  {
    "unitNumber": 3,
    "lessonNumber": 3,
    "key": "home",
    "title": "My Home",
    "goal": "I can name rooms and say what is in my home.",
    "vocabulary": [
      [
        "へや",
        "heya",
        "room"
      ],
      [
        "だいどころ",
        "daidokoro",
        "kitchen"
      ],
      [
        "トイレ",
        "toire",
        "toilet / restroom"
      ],
      [
        "ベッド",
        "beddo",
        "bed"
      ],
      [
        "テーブル",
        "teeburu",
        "table"
      ],
      [
        "つくえ",
        "tsukue",
        "desk"
      ],
      [
        "いす",
        "isu",
        "chair"
      ],
      [
        "みっつ",
        "mittsu",
        "three items"
      ],
      [
        "よっつ",
        "yottsu",
        "four items"
      ]
    ],
    "grammar": [
      {
        "title": "Say what is there",
        "pattern": "Place に N が あります。",
        "explanation": "に marks a location and が introduces the thing there. Use あります for objects, not people. Use ありません if the object is absent.",
        "examples": [
          {
            "japanese": "へやに ベッドが あります。",
            "romaji": "Heya ni beddo ga arimasu.",
            "meaning": "There is a bed in the room."
          },
          {
            "japanese": "だいどころに テーブルが あります。",
            "romaji": "Daidokoro ni teeburu ga arimasu.",
            "meaning": "There is a table in the kitchen."
          }
        ]
      },
      {
        "title": "Count rooms",
        "pattern": "へやが Number あります。",
        "explanation": "You already know ひとつ and ふたつ. Add みっつ (three) and よっつ (four). Place the count before あります. These general counts can describe rooms, not people's ages.",
        "examples": [
          {
            "japanese": "わたしの いえには へやが みっつ あります。",
            "romaji": "Watashi no ie ni wa heya ga mittsu arimasu.",
            "meaning": "My home has three rooms."
          }
        ],
        "notes": [
          "には combines location に with topic は: as for in my home."
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "へやに ベッドは ありますか。",
        "B",
        "はい、あります。"
      ],
      [
        "A",
        "つくえは ありますか。",
        "B",
        "いいえ、ありません。テーブルが あります。"
      ]
    ],
    "practice": [
      [
        "Which means kitchen?",
        "だいどころ",
        [
          "トイレ",
          "ベッド",
          "つくえ"
        ],
        "だいどころ is a kitchen."
      ],
      [
        "Complete: へや ___ ベッドが あります。",
        "に",
        [
          "を",
          "から",
          "と"
        ],
        "に marks the location."
      ],
      [
        "Complete: だいどころに テーブル ___ あります。",
        "が",
        [
          "を",
          "から",
          "です"
        ],
        "が introduces the object that exists there."
      ],
      [
        "Read: へやが よっつ あります。 How many rooms?",
        "Four",
        [
          "Three",
          "Two",
          "One"
        ],
        "よっつ is the general count for four."
      ],
      [
        "Choose 'There is no desk'.",
        "つくえは ありません。",
        [
          "つくえが あります。",
          "つくえに します。",
          "つくえは すきです。"
        ],
        "ありません means the item is absent."
      ]
    ],
    "challenge": [
      [
        "Which means chair?",
        "いす",
        [
          "いえ",
          "かさ",
          "みせ"
        ],
        "いす is chair; いえ is home."
      ],
      [
        "Read: だいどころに テーブルが あります。 Where is the table?",
        "In the kitchen",
        [
          "In the restroom",
          "In Tokyo",
          "In the bag"
        ],
        "The place before に is だいどころ."
      ],
      [
        "Choose the correct object-existence sentence.",
        "へやに ベッドが あります。",
        [
          "へやを ベッドが あります。",
          "へやに ベッドを あります。",
          "へやが ベッドですか。"
        ],
        "Use place に and object が before あります."
      ],
      [
        "Say your home has three rooms.",
        "わたしの いえには へやが みっつ あります。",
        [
          "わたしの いえには へやが よっつ あります。",
          "わたしの いえには へやが ありません。",
          "わたしの いえは 3さいです。"
        ],
        "みっつ counts three rooms; さい counts years of age."
      ],
      [
        "Read: へやに ベッドが あります。つくえは ありません。 What is true?",
        "There is a bed but no desk.",
        [
          "There is a desk but no bed.",
          "Both a bed and desk are present.",
          "Neither is present."
        ],
        "あります is positive; ありません is negative."
      ]
    ]
  },
  {
    "unitNumber": 3,
    "lessonNumber": 4,
    "key": "locations",
    "title": "Where Is It?",
    "goal": "I can ask where a thing is and understand simple location descriptions.",
    "vocabulary": [
      [
        "ここ",
        "koko",
        "here"
      ],
      [
        "そこ",
        "soko",
        "there (near the listener)"
      ],
      [
        "あそこ",
        "asoko",
        "over there"
      ],
      [
        "うえ",
        "ue",
        "above / on top"
      ],
      [
        "した",
        "shita",
        "under / below"
      ],
      [
        "なか",
        "naka",
        "inside"
      ],
      [
        "まえ",
        "mae",
        "in front"
      ],
      [
        "うしろ",
        "ushiro",
        "behind"
      ]
    ],
    "grammar": [
      {
        "title": "Point to a place",
        "pattern": "N は ここ / そこ / あそこ です。",
        "explanation": "ここ, そこ, and あそこ refer to places, unlike これ, それ, and あれ, which stand for things. Ask N は どこですか to locate something.",
        "examples": [
          {
            "japanese": "トイレは どこですか。あそこです。",
            "romaji": "Toire wa doko desu ka. Asoko desu.",
            "meaning": "Where is the restroom? Over there."
          }
        ]
      },
      {
        "title": "Locate an object precisely",
        "pattern": "N は Object の Position に あります。",
        "explanation": "の connects an object to a position: つくえの した is under the desk. に marks that location. Use あります for things; people use います, which you will practice next.",
        "examples": [
          {
            "japanese": "かばんは つくえの したに あります。",
            "romaji": "Kaban wa tsukue no shita ni arimasu.",
            "meaning": "The bag is under the desk."
          },
          {
            "japanese": "ペンは かばんの なかに あります。",
            "romaji": "Pen wa kaban no naka ni arimasu.",
            "meaning": "The pen is inside the bag."
          },
          {
            "japanese": "ベッドの うしろに いすが あります。",
            "romaji": "Beddo no ushiro ni isu ga arimasu.",
            "meaning": "There is a chair behind the bed."
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "ほんは どこですか。",
        "B",
        "つくえの うえに あります。"
      ],
      [
        "A",
        "かばんは？",
        "B",
        "いすの まえに あります。"
      ]
    ],
    "practice": [
      [
        "Which means over there (a place)?",
        "あそこ",
        [
          "あれ",
          "あの",
          "これ"
        ],
        "あそこ refers to a distant place, rather than an object."
      ],
      [
        "Translate: つくえの した",
        "under the desk",
        [
          "on the desk",
          "inside the desk",
          "behind the desk"
        ],
        "した means below or under."
      ],
      [
        "Complete: ペンは かばんの なか ___ あります。",
        "に",
        [
          "を",
          "と",
          "から"
        ],
        "に marks the location of the pen."
      ],
      [
        "Ask where the restroom is.",
        "トイレは どこですか。",
        [
          "トイレは だれですか。",
          "トイレは なんさいですか。",
          "トイレに しますか。"
        ],
        "どこ asks where."
      ],
      [
        "Read: いすの まえに かばんが あります。 Where is the bag?",
        "In front of the chair",
        [
          "Behind the chair",
          "On the chair",
          "Inside the bag"
        ],
        "まえ means in front of."
      ]
    ],
    "challenge": [
      [
        "Which means inside?",
        "なか",
        [
          "うえ",
          "した",
          "うしろ"
        ],
        "なか is inside."
      ],
      [
        "Read: トイレは そこです。",
        "The restroom is there.",
        [
          "This is a restroom object.",
          "Where is the restroom?",
          "There is no restroom."
        ],
        "そこ is a place near the listener or a place just referred to."
      ],
      [
        "Choose 'on top of the table'.",
        "テーブルの うえ",
        [
          "テーブルと うえ",
          "テーブルの した",
          "うえを テーブル"
        ],
        "の joins the table to its position うえ."
      ],
      [
        "Choose the natural sentence for 'The book is inside the bag'.",
        "ほんは かばんの なかに あります。",
        [
          "ほんは かばんの なかを あります。",
          "ほんは かばんの なかに います。",
          "ほんは かばんの うえに あります。"
        ],
        "The object ほん uses あります; なかに locates it inside."
      ],
      [
        "Read: ペンは つくえの うえに あります。かばんは つくえの したに あります。 What is under the desk?",
        "The bag",
        [
          "The pen",
          "The chair",
          "The bed"
        ],
        "Track the two topics: ペン is above and かばん is below."
      ]
    ]
  },
  {
    "unitNumber": 3,
    "lessonNumber": 5,
    "key": "people-locations",
    "title": "Where Is Everyone?",
    "goal": "I can ask where someone is and understand a simple answer.",
    "vocabulary": [
      [
        "います",
        "imasu",
        "is / are present (people and animals)"
      ],
      [
        "いません",
        "imasen",
        "is / are not present (people and animals)"
      ],
      [
        "きょうしつ",
        "kyoushitsu",
        "classroom"
      ],
      [
        "しょくどう",
        "shokudou",
        "dining hall / cafeteria"
      ],
      [
        "かいしゃ",
        "kaisha",
        "company / workplace"
      ],
      [
        "みぎ",
        "migi",
        "right"
      ],
      [
        "ひだり",
        "hidari",
        "left"
      ],
      [
        "せんせい",
        "sensei",
        "teacher"
      ],
      [
        "がくせい",
        "gakusei",
        "student"
      ]
    ],
    "grammar": [
      {
        "title": "Find a person",
        "pattern": "Person は Place に います。 / どこに いますか。",
        "explanation": "Use います for people and animals, and あります for objects. Ask どこに いますか when you want someone's location, not だれですか, which asks identity. どこですか is also common when the person is already understood.",
        "examples": [
          {
            "japanese": "せんせいは きょうしつに います。",
            "romaji": "Sensei wa kyoushitsu ni imasu.",
            "meaning": "The teacher is in the classroom."
          },
          {
            "japanese": "たなかさんは どこに いますか。",
            "romaji": "Tanaka-san wa doko ni imasu ka.",
            "meaning": "Where is Tanaka?"
          },
          {
            "japanese": "しょくどうに がくせいが います。",
            "romaji": "Shokudou ni gakusei ga imasu.",
            "meaning": "There is a student in the cafeteria."
          }
        ]
      },
      {
        "title": "Absence and relative locations",
        "pattern": "Person は Place に いません。 / N の みぎ / ひだり",
        "explanation": "いません means someone is not there. Use the same の + position pattern from the last lesson with みぎ (right) and ひだり (left). In these examples directions are from your viewpoint.",
        "examples": [
          {
            "japanese": "せんせいは きょうしつに いません。",
            "romaji": "Sensei wa kyoushitsu ni imasen.",
            "meaning": "The teacher is not in the classroom."
          },
          {
            "japanese": "たなかさんは つくえの みぎに います。",
            "romaji": "Tanaka-san wa tsukue no migi ni imasu.",
            "meaning": "Tanaka is to the right of the desk."
          },
          {
            "japanese": "トイレは しょくどうの ひだりです。",
            "romaji": "Toire wa shokudou no hidari desu.",
            "meaning": "The restroom is to the left of the cafeteria."
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "せんせいは きょうしつに いますか。",
        "B",
        "いいえ、いません。"
      ],
      [
        "A",
        "どこに いますか。",
        "B",
        "しょくどうに います。"
      ]
    ],
    "practice": [
      [
        "Which means classroom?",
        "きょうしつ",
        [
          "しょくどう",
          "だいどころ",
          "トイレ"
        ],
        "きょうしつ is a classroom."
      ],
      [
        "Complete: ともだちは かいしゃに ___.",
        "います",
        [
          "あります",
          "のみます",
          "ください"
        ],
        "A friend is a person, so use います."
      ],
      [
        "Ask where Tanaka is.",
        "たなかさんは どこに いますか。",
        [
          "たなかさんは だれのですか。",
          "たなかさんは なんさいですか。",
          "たなかさんは なんですか。"
        ],
        "どこに いますか asks a person's location."
      ],
      [
        "Read: せんせいは きょうしつに いません。",
        "The teacher is not in the classroom.",
        [
          "The teacher is in the classroom.",
          "There is no desk in the classroom.",
          "The teacher dislikes the classroom."
        ],
        "いません is the negative of います."
      ],
      [
        "Which is to the left of the desk?",
        "つくえの ひだり",
        [
          "つくえの みぎ",
          "つくえの うえ",
          "つくえの した"
        ],
        "ひだり is left, みぎ is right."
      ]
    ],
    "challenge": [
      [
        "Which means cafeteria?",
        "しょくどう",
        [
          "かいしゃ",
          "いえ",
          "きょうしつ"
        ],
        "しょくどう is a dining hall or cafeteria."
      ],
      [
        "Choose the verb for a teacher's presence.",
        "います",
        [
          "あります",
          "のみます",
          "たべます"
        ],
        "Use います for living beings such as people."
      ],
      [
        "Complete: きょうしつに がくせい ___ います。",
        "が",
        [
          "を",
          "から",
          "です"
        ],
        "が introduces who is present; に already marks the place."
      ],
      [
        "Read: たなかさんは つくえの みぎに います。 Where is Tanaka?",
        "To the right of the desk",
        [
          "To the left of the desk",
          "Under the desk",
          "Behind the desk"
        ],
        "みぎ means right."
      ],
      [
        "Read: せんせいは きょうしつに いません。しょくどうに います。つくえは きょうしつに あります。 Which is correct?",
        "The teacher is in the cafeteria; the desk is in the classroom.",
        [
          "The teacher and desk are both in the classroom.",
          "The teacher is absent from the cafeteria.",
          "The desk is in the cafeteria."
        ],
        "Track います for the teacher and あります for the desk; いません negates only the classroom location."
      ]
    ]
  },
  {
    "unitNumber": 3,
    "lessonNumber": 6,
    "key": "review",
    "title": "Unit 3 Review",
    "goal": "I can order a meal, describe my home, and locate people and things.",
    "vocabulary": [
      [
        "おねがいします",
        "onegaishimasu",
        "please (a polite request)"
      ],
      [
        "ください",
        "kudasai",
        "please give me"
      ],
      [
        "にします",
        "ni shimasu",
        "decide on"
      ],
      [
        "あります",
        "arimasu",
        "there is / are (things)"
      ],
      [
        "います",
        "imasu",
        "is / are present (people and animals)"
      ],
      [
        "どこ",
        "doko",
        "where"
      ]
    ],
    "grammar": [
      {
        "title": "Choose, check, and request",
        "pattern": "N にします。 / N は ありますか。 / N を ください。",
        "explanation": "First choose, check availability if needed, then request the item. These are different purposes: a choice is not a question and a question is not an order. This is consolidation, not the separate unit assessment.",
        "examples": [
          {
            "japanese": "カレーに します。カレー、ひとつ おねがいします。",
            "romaji": "Karee ni shimasu. Karee, hitotsu onegaishimasu.",
            "meaning": "I will have curry. One curry, please."
          }
        ]
      },
      {
        "title": "Locate people and objects",
        "pattern": "N は Place に あります / います。",
        "explanation": "Keep the place before に. Objects use あります; people use います. Add の + position to be more precise, and use ありません or いません for absence.",
        "examples": [
          {
            "japanese": "ともだちは しょくどうに います。かばんは いすの したに あります。",
            "romaji": "Tomodachi wa shokudou ni imasu. Kaban wa isu no shita ni arimasu.",
            "meaning": "My friend is in the cafeteria. The bag is under the chair."
          }
        ]
      }
    ],
    "dialogue": [
      [
        "A",
        "たなかさんは どこですか。",
        "B",
        "しょくどうに います。"
      ],
      [
        "A",
        "しょくどうは どこですか。",
        "B",
        "あそこです。"
      ]
    ],
    "practice": [
      [
        "Order two curries.",
        "カレー、ふたつ ください。",
        [
          "カレー、ひとつ ください。",
          "カレーが すきです。",
          "カレーは ありません。"
        ],
        "ふたつ counts two portions; ください requests them."
      ],
      [
        "Ask whether coffee is available.",
        "コーヒーは ありますか。",
        [
          "コーヒーは いますか。",
          "コーヒーに すんでいますか。",
          "コーヒーは だれですか。"
        ],
        "An item uses ありますか, not いますか."
      ],
      [
        "Read: へやが よっつ あります。",
        "There are four rooms.",
        [
          "There are three rooms.",
          "There are four students.",
          "There are no rooms."
        ],
        "よっつ counts four; へや means rooms."
      ],
      [
        "Complete: せんせいは しょくどうに ___.",
        "います",
        [
          "あります",
          "ください",
          "にします"
        ],
        "The teacher is a person, so the presence verb is います."
      ],
      [
        "Choose 'under the table'.",
        "テーブルの した",
        [
          "テーブルの うえ",
          "テーブルの なか",
          "テーブルの うしろ"
        ],
        "した is below or under."
      ]
    ],
    "challenge": [
      [
        "Which means 'I will have tea' in a choice of drinks?",
        "おちゃに します。",
        [
          "おちゃは ありますか。",
          "おちゃが すきです。",
          "おちゃを のみません。"
        ],
        "にします makes a decision."
      ],
      [
        "Choose a polite request for a menu.",
        "メニューを ください。",
        [
          "メニューを たべます。",
          "メニューが います。",
          "メニューに すんでいます。"
        ],
        "ください requests a thing."
      ],
      [
        "Read: ともだちは きょうしつに いません。 What do you know?",
        "The friend is not in the classroom.",
        [
          "The friend is at home.",
          "The friend is in the classroom.",
          "The classroom has no chairs."
        ],
        "Absence from one place does not tell you where the friend actually is."
      ],
      [
        "Choose 'The pen is on the desk'.",
        "ペンは つくえの うえに あります。",
        [
          "ペンは つくえの うえに います。",
          "ペンは つくえの したに あります。",
          "ペンを つくえが あります。"
        ],
        "An object uses あります; うえに means on top."
      ],
      [
        "Read: しょくどうに ともだちが います。ともだちは カレーに します。かばんは いすの したに あります。 Which summary matches?",
        "A friend in the cafeteria chooses curry; the bag is under the chair.",
        [
          "A teacher chooses udon in the classroom.",
          "A friend chooses tea; the bag is on the chair.",
          "Nobody is in the cafeteria."
        ],
        "Combine the person/location, choice, and object/location sentences."
      ]
    ]
  }
];

function questions(seeds: QuestionSeed[]): Question[] {
  return seeds.map(([prompt, correct, distractors, explanation], index) => {
    const options = [...distractors];
    options.splice(index % 4, 0, correct);
    return { prompt, correct, options, explanation };
  });
}

export const UNIT_2_3_LESSONS: N5Lesson[] = seeds.map(seed => {
  const examples = seed.grammar.flatMap(point => point.examples);
  return {
    id: `japanese-n5-unit-${seed.unitNumber}-${seed.key}`,
    slug: `n5-unit-${seed.unitNumber}-${seed.key}`,
    unitNumber: seed.unitNumber, lessonNumber: seed.lessonNumber, title: seed.title,
    objectives: [seed.goal, ...seed.grammar.map(point => point.title)],
    vocabulary: seed.vocabulary, grammar: seed.grammar,
    concept: {
      title: seed.grammar.map(point => point.title).join(" · "),
      text: seed.grammar.map(point => [point.explanation, ...(point.notes ?? [])].join(" ")).join("\n\n"),
      examples: seed.grammar.map(point => point.pattern),
    },
    examples: examples.map(example => [example.japanese, `${example.romaji} — ${example.meaning}`]),
    dialogue: seed.dialogue, practice: questions(seed.practice), challenge: questions(seed.challenge),
  };
});
