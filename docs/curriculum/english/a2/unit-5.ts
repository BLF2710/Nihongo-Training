// A2 Unit 5: Plans & the Future. Vietnamese "sẽ" covers every future, so learners use will for everything ("I will
// visit my parents next week" for a plan made long ago), or no future form at all ("Tomorrow I meet Lan"). Other
// usual slips: "I going to", "Would you like come?", "Let's to go", "How about go?".
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "A2",
  number: 5,
  lessons: [{
    key: "going-to", title: "What Are You Going to Do?", titleVi: "Dự định với going to",
    objectives: [
      "I can talk about my plans and intentions.",
      "Use am / is / are + going to + verb",
      "Predict what is about to happen from what you can see",
    ],
    vocabulary: [
      { word: "plan", ipa: "/plæn/", partOfSpeech: "noun", vietnamese: "kế hoạch", definition: "something you have decided to do", example: { english: "Have you got any plans for the summer?", vietnamese: "Bạn có kế hoạch gì cho mùa hè chưa?" } },
      { word: "save up", ipa: "/ˌseɪv ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "tiết kiệm, để dành (tiền)", definition: "to keep money so you can buy something later", example: { english: "I'm going to save up for a new laptop.", vietnamese: "Tôi sẽ tiết kiệm tiền để mua máy tính mới." } },
      { word: "take up", ipa: "/ˌteɪk ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "bắt đầu (một sở thích, môn thể thao)", definition: "to start a new hobby or activity", example: { english: "She's going to take up yoga.", vietnamese: "Cô ấy định bắt đầu tập yoga." } },
      { word: "give up", ipa: "/ˌɡɪv ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "từ bỏ", definition: "to stop doing something, often a bad habit", example: { english: "He's going to give up smoking.", vietnamese: "Anh ấy định bỏ thuốc lá." } },
      { word: "abroad", ipa: "/əˈbrɔːd/", partOfSpeech: "adverb", vietnamese: "ở nước ngoài, ra nước ngoài", definition: "in or to another country", example: { english: "My cousin is going to study abroad.", vietnamese: "Em họ tôi sắp đi du học." } },
      { word: "next year", ipa: "/ˌnekst ˈjɪə/", partOfSpeech: "phrase", vietnamese: "năm sau", definition: "the year after this one", example: { english: "We're going to get married next year.", vietnamese: "Năm sau chúng tôi sẽ cưới." } },
      { word: "intend", ipa: "/ɪnˈtend/", partOfSpeech: "verb", vietnamese: "dự định", definition: "to plan to do something", example: { english: "I intend to finish this course.", vietnamese: "Tôi dự định hoàn thành khoá học này." } },
      { word: "look out", ipa: "/ˌlʊk ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "coi chừng, cẩn thận", definition: "used to warn someone of danger", example: { english: "Look out! You're going to fall!", vietnamese: "Coi chừng! Bạn sắp ngã kìa!" } },
    ],
    grammar: [{
      title: "Going to for plans",
      pattern: "I'm / he's / they're + going to + verb",
      explanation: {
        english: "Use be going to for things you have already decided to do: I'm going to learn to drive. Don't forget be: I'm going to, she's going to, they're going to. Questions: Are you going to …? What are you going to do? Negatives: I'm not going to …",
        vietnamese: "Dùng be going to cho những việc bạn đã quyết định làm từ trước: I'm going to learn to drive. Đừng quên be: I'm going to, she's going to, they're going to. Câu hỏi: Are you going to …? What are you going to do? Phủ định: I'm not going to …",
      },
      examples: [
        { english: "We're going to visit my grandparents at Tet.", vietnamese: "Tết này chúng tôi sẽ về thăm ông bà." },
        { english: "What are you going to do after university?", vietnamese: "Sau đại học bạn định làm gì?" },
      ],
      mistake: {
        wrong: "I going to study abroad.", right: "I'm going to study abroad.",
        why: { english: "Going to always needs am, is or are in front. Vietnamese “định” has no verb like be, so it is easy to drop.", vietnamese: "Going to luôn cần am, is hoặc are phía trước. Tiếng Việt “định” không có động từ như be, nên rất dễ bị bỏ sót." },
      },
    }, {
      title: "Going to for what you can see",
      pattern: "Look at the clouds. It's going to rain.",
      explanation: {
        english: "Also use going to when you can see that something is about to happen: Look at those black clouds. It's going to rain. Look out! That glass is going to fall.",
        vietnamese: "Going to cũng dùng khi bạn nhìn thấy dấu hiệu một việc sắp xảy ra: Look at those black clouds. It's going to rain. Look out! That glass is going to fall.",
      },
      examples: [
        { english: "Hurry up! We're going to miss the bus.", vietnamese: "Nhanh lên! Chúng ta sắp lỡ xe buýt rồi." },
        { english: "He's driving too fast. He's going to have an accident.", vietnamese: "Anh ta lái nhanh quá. Thế nào cũng gặp tai nạn." },
      ],
    }],
    examples: [
      { english: "I'm going to save up and travel abroad next year.", vietnamese: "Tôi sẽ tiết kiệm tiền và đi nước ngoài vào năm sau." },
      { english: "My dad is going to give up coffee. I don't believe him!", vietnamese: "Bố tôi định bỏ cà phê. Tôi chẳng tin đâu!" },
      { english: "Are you going to take up a new sport?", vietnamese: "Bạn có định chơi môn thể thao mới nào không?" },
      { english: "Look at the sky. It's going to be a beautiful day.", vietnamese: "Nhìn bầu trời kìa. Hôm nay sẽ là một ngày đẹp trời." },
    ],
    dialogue: [
      { speaker: "Isla", english: "Have you got any plans for the new year?", vietnamese: "Bạn có kế hoạch gì cho năm mới không?" },
      { speaker: "Long", english: "Yes, lots! I'm going to take up running.", vietnamese: "Có, nhiều lắm! Mình định bắt đầu chạy bộ." },
      { speaker: "Isla", english: "Good for you. Anything else?", vietnamese: "Hay quá. Còn gì nữa không?" },
      { speaker: "Long", english: "I'm going to save up. I intend to study abroad.", vietnamese: "Mình sẽ tiết kiệm tiền. Mình dự định đi du học." },
      { speaker: "Isla", english: "Where are you going to study?", vietnamese: "Bạn định học ở đâu?" },
      { speaker: "Long", english: "In Scotland, I hope. I'm not going to give up!", vietnamese: "Ở Scotland, mình hy vọng thế. Mình sẽ không bỏ cuộc đâu!" },
    ],
    practice: [
      q("Complete: She ___ going to learn French.", ["is", "are", "—", "does"], "is", "She + is + going to."),
      q("Choose the correct sentence.", ["We're going to move house.", "We going to move house.", "We're going to moving house.", "We're go to move house."], "We're going to move house.", "Be + going to + base verb."),
      q("Complete: What ___ you going to do this weekend?", ["are", "do", "will", "is"], "are", "Question: are you going to …?"),
      q("“Từ bỏ” (a habit) in English is…", ["give up", "take up", "save up", "look out"], "give up", "Give up = stop doing."),
    ],
    challenge: [
      q("Look at those dark clouds! It ___.", ["'s going to rain", "rains", "rained", "is rain"], "'s going to rain", "You can see it coming: going to."),
      q("Complete: I'm going to ___ for a car.", ["save up", "take up", "give up", "look out"], "save up", "Save up = keep money for later."),
      q("Choose the correct negative.", ["I'm not going to stay here.", "I don't going to stay here.", "I'm not going stay here.", "I not going to stay here."], "I'm not going to stay here.", "Am not + going to + verb."),
      q("“My sister is going to study ___.” (in another country)", ["abroad", "aboard", "away", "outside"], "abroad", "Abroad = in another country."),
      q("Complete: Look ___! The car is going to hit you!", ["out", "up", "on", "after"], "out", "Look out! warns of danger."),
    ],
  }, {
    key: "arrangements", title: "I'm Meeting Lan on Friday", titleVi: "Lịch hẹn đã sắp xếp",
    objectives: [
      "I can talk about my diary: things I have arranged with other people.",
      "Use the present continuous with a future time for arrangements",
      "Ask “What are you doing on Saturday?”",
    ],
    vocabulary: [
      { word: "appointment", ipa: "/əˈpɔɪntmənt/", partOfSpeech: "noun", vietnamese: "cuộc hẹn (với bác sĩ, nha sĩ…)", definition: "an arranged time to see a doctor, dentist or other professional", example: { english: "I've got a dentist's appointment on Monday.", vietnamese: "Tôi có lịch hẹn nha sĩ vào thứ Hai." } },
      { word: "diary", ipa: "/ˈdaɪəri/", partOfSpeech: "noun", vietnamese: "sổ lịch hẹn; nhật ký", definition: "a book or app where you write the things you are going to do", example: { english: "Let me check my diary.", vietnamese: "Để tôi xem lịch đã." } },
      { word: "free", ipa: "/friː/", partOfSpeech: "adjective", vietnamese: "rảnh", definition: "not busy, with nothing arranged", example: { english: "Are you free on Thursday evening?", vietnamese: "Tối thứ Năm bạn có rảnh không?" } },
      { word: "busy", ipa: "/ˈbɪzi/", partOfSpeech: "adjective", vietnamese: "bận", definition: "with a lot of things to do", example: { english: "Sorry, I'm busy all weekend.", vietnamese: "Xin lỗi, tôi bận cả cuối tuần." } },
      { word: "fly", ipa: "/flaɪ/", partOfSpeech: "verb", vietnamese: "bay, đi máy bay", definition: "to travel by plane", example: { english: "We're flying to Bangkok on the 5th.", vietnamese: "Ngày mùng 5 chúng tôi bay đi Bangkok." } },
      { word: "the day after tomorrow", ipa: "/ðə ˌdeɪ ˌɑːftə təˈmɒrəʊ/", partOfSpeech: "phrase", vietnamese: "ngày kia", definition: "in two days' time", example: { english: "My parents are arriving the day after tomorrow.", vietnamese: "Ngày kia bố mẹ tôi đến." } },
      { word: "have people round", ipa: "/ˌhæv ˈpiːpl raʊnd/", partOfSpeech: "phrase", vietnamese: "mời mọi người đến nhà chơi", definition: "to invite people to your home (British English)", example: { english: "We're having some friends round on Saturday.", vietnamese: "Thứ Bảy chúng tôi mời vài người bạn đến nhà." } },
      { word: "pick up", ipa: "/ˌpɪk ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "đón (ai đó)", definition: "to go and collect someone in a car or on a motorbike", example: { english: "I'm picking my son up from school at four.", vietnamese: "Bốn giờ tôi đón con trai ở trường." } },
    ],
    grammar: [{
      title: "Present continuous for arrangements",
      pattern: "I'm meeting Lan on Friday · We're flying to Da Nang tomorrow",
      explanation: {
        english: "When you have arranged something with other people, and it is in your diary, use the present continuous with a future time: I'm seeing the doctor at ten. We're having lunch with my boss tomorrow. The time word shows that it is the future.",
        vietnamese: "Khi bạn đã sắp xếp một việc với người khác và nó có trong lịch của bạn, dùng thì hiện tại tiếp diễn kèm thời gian tương lai: I'm seeing the doctor at ten. We're having lunch with my boss tomorrow. Từ chỉ thời gian cho biết đó là tương lai.",
      },
      examples: [
        { english: "I'm meeting my colleagues at seven tonight.", vietnamese: "Bảy giờ tối nay tôi gặp các đồng nghiệp." },
        { english: "She's flying to London the day after tomorrow.", vietnamese: "Ngày kia cô ấy bay sang London." },
      ],
      mistake: {
        wrong: "Tomorrow I meet my boss at nine.", right: "Tomorrow I'm meeting my boss at nine.",
        why: { english: "“Mai tôi gặp sếp” needs no change in Vietnamese, but English needs a future form. For a fixed arrangement, use am / is / are + -ing.", vietnamese: "“Mai tôi gặp sếp” trong tiếng Việt không cần đổi gì, nhưng tiếng Anh cần một dạng tương lai. Với lịch hẹn cố định, dùng am / is / are + -ing." },
      },
    }, {
      title: "What are you doing on …?",
      pattern: "What are you doing on Saturday? · Are you doing anything tonight?",
      explanation: {
        english: "Ask about someone's arrangements with the present continuous. This is often the first step of an invitation: Are you doing anything on Friday? No? Would you like to come to the cinema?",
        vietnamese: "Hỏi về lịch của ai đó bằng thì hiện tại tiếp diễn. Đây thường là bước đầu của một lời mời: Are you doing anything on Friday? No? Would you like to come to the cinema?",
      },
      examples: [
        { english: "What are you doing this evening? Nothing special.", vietnamese: "Tối nay bạn làm gì? Không có gì đặc biệt." },
        { english: "Are you doing anything at the weekend?", vietnamese: "Cuối tuần này bạn có làm gì không?" },
      ],
    }],
    examples: [
      { english: "I can't come on Monday. I've got a doctor's appointment.", vietnamese: "Thứ Hai tôi không đến được. Tôi có lịch khám bác sĩ." },
      { english: "Let me check my diary. Yes, I'm free on Wednesday.", vietnamese: "Để tôi xem lịch. Có, thứ Tư tôi rảnh." },
      { english: "We're having people round for dinner on Sunday.", vietnamese: "Chủ nhật chúng tôi mời mọi người đến nhà ăn tối." },
      { english: "Who's picking you up from the airport?", vietnamese: "Ai đón bạn ở sân bay?" },
    ],
    dialogue: [
      { speaker: "Noah", english: "Are you free on Friday? Let's have a meeting.", vietnamese: "Thứ Sáu chị có rảnh không? Mình họp một buổi nhé." },
      { speaker: "Ha", english: "Let me check my diary. In the morning I'm seeing a client.", vietnamese: "Để chị xem lịch. Buổi sáng chị gặp một khách hàng." },
      { speaker: "Noah", english: "What are you doing in the afternoon?", vietnamese: "Còn buổi chiều chị làm gì?" },
      { speaker: "Ha", english: "I'm picking my daughter up at three, but I'm free after four.", vietnamese: "Ba giờ chị đón con gái, nhưng sau bốn giờ thì chị rảnh." },
      { speaker: "Noah", english: "Half past four, then?", vietnamese: "Vậy bốn rưỡi nhé?" },
      { speaker: "Ha", english: "Perfect. I'll put it in my diary.", vietnamese: "Được đấy. Chị sẽ ghi vào lịch." },
    ],
    practice: [
      q("Complete: I ___ my friends for dinner tonight.", ["'m meeting", "meet", "met", "'m meet"], "'m meeting", "An arrangement: present continuous."),
      q("Choose the correct question.", ["What are you doing on Saturday?", "What do you doing on Saturday?", "What you are doing on Saturday?", "What are you do on Saturday?"], "What are you doing on Saturday?", "What + are + you + -ing?"),
      q("“Rảnh” in English is…", ["free", "busy", "empty", "cheap"], "free", "Free = with nothing arranged."),
      q("What is an “appointment”?", ["an arranged time to see someone", "a holiday", "a job interview only", "a phone"], "an arranged time to see someone", "You make an appointment with a doctor or dentist."),
    ],
    challenge: [
      q("Complete: We ___ to Paris on the 12th. The tickets are booked.", ["'re flying", "fly", "flew", "'re fly"], "'re flying", "A fixed arrangement: present continuous."),
      q("Choose the correct sentence.", ["She's picking me up at six.", "She picks up me at six tomorrow.", "She picking me up at six.", "She's pick me up at six."], "She's picking me up at six.", "Is + -ing; pick me up."),
      q("“Ngày kia” in English is…", ["the day after tomorrow", "the day before yesterday", "next day", "after day"], "the day after tomorrow", "In two days' time."),
      q("Complete: We're ___ some friends round on Saturday.", ["having", "making", "doing", "getting"], "having", "Have people round = invite them home."),
      q("Choose the best sentence.", ["Tomorrow I'm having lunch with my boss.", "Tomorrow I have lunch with my boss yesterday.", "Tomorrow I had lunch with my boss.", "Tomorrow I having lunch with my boss."], "Tomorrow I'm having lunch with my boss.", "Am + -ing for an arrangement."),
    ],
  }, {
    key: "will-for-decisions", title: "I'll Help You", titleVi: "Quyết định tức thì với will",
    objectives: [
      "I can make quick decisions, offers and promises.",
      "Use I'll for decisions made at the moment of speaking",
      "Choose between will and going to",
    ],
    vocabulary: [
      { word: "I'll", ipa: "/aɪl/", partOfSpeech: "phrase", vietnamese: "tôi sẽ (quyết định ngay lúc nói)", definition: "short for I will", example: { english: "It's cold. I'll close the window.", vietnamese: "Lạnh quá. Để tôi đóng cửa sổ." } },
      { word: "promise", ipa: "/ˈprɒmɪs/", partOfSpeech: "verb", vietnamese: "hứa", definition: "to say that you will certainly do something", example: { english: "I promise I'll call you tonight.", vietnamese: "Tôi hứa tối nay sẽ gọi cho bạn." } },
      { word: "offer", ipa: "/ˈɒfə/", partOfSpeech: "verb", vietnamese: "đề nghị (giúp)", definition: "to say you are willing to do something for someone", example: { english: "He offered to carry my bag.", vietnamese: "Anh ấy đề nghị xách túi giúp tôi." } },
      { word: "carry", ipa: "/ˈkæri/", partOfSpeech: "verb", vietnamese: "mang, xách", definition: "to hold something and take it somewhere", example: { english: "Shall I carry that for you?", vietnamese: "Để tôi xách cái đó giúp bạn nhé?" } },
      { word: "lend", ipa: "/lend/", partOfSpeech: "verb", vietnamese: "cho mượn", definition: "to give something to someone for a short time", example: { english: "I'll lend you my umbrella.", vietnamese: "Tôi sẽ cho bạn mượn ô." } },
      { word: "borrow", ipa: "/ˈbɒrəʊ/", partOfSpeech: "verb", vietnamese: "mượn", definition: "to take something from someone for a short time", example: { english: "Can I borrow your pen?", vietnamese: "Tôi mượn bút của bạn được không?" } },
      { word: "shall I", ipa: "/ˈʃæl aɪ/", partOfSpeech: "phrase", vietnamese: "tôi … nhé? (đề nghị giúp)", definition: "used to offer to do something", example: { english: "Shall I open the door?", vietnamese: "Để tôi mở cửa nhé?" } },
      { word: "on second thoughts", ipa: "/ɒn ˌsekənd ˈθɔːts/", partOfSpeech: "phrase", vietnamese: "nghĩ lại thì", definition: "used when you change your decision", example: { english: "On second thoughts, I'll have tea, not coffee.", vietnamese: "Nghĩ lại thì tôi uống trà, không uống cà phê." } },
    ],
    grammar: [{
      title: "I'll for quick decisions",
      pattern: "I'll + verb (decided now) · I'm going to + verb (decided before)",
      explanation: {
        english: "Use I'll when you decide at the moment you speak: The phone's ringing. I'll answer it. Use going to when you decided before: I'm going to visit my parents next week (I bought the ticket last month). Will is also for offers (I'll help you) and promises (I won't be late).",
        vietnamese: "Dùng I'll khi bạn quyết định ngay lúc nói: The phone's ringing. I'll answer it. Dùng going to khi bạn đã quyết định từ trước: I'm going to visit my parents next week (tôi mua vé từ tháng trước). Will cũng dùng cho lời đề nghị giúp (I'll help you) và lời hứa (I won't be late).",
      },
      examples: [
        { english: "You look tired. I'll make dinner tonight.", vietnamese: "Trông bạn mệt quá. Tối nay để tôi nấu cơm." },
        { english: "I promise I won't tell anyone.", vietnamese: "Tôi hứa sẽ không nói với ai." },
      ],
      mistake: {
        wrong: "I will visit my parents next week. I bought the ticket.", right: "I'm going to visit my parents next week. I bought the ticket.",
        why: { english: "Vietnamese “sẽ” works for every future, but English will is for decisions made now. A plan you made before takes going to.", vietnamese: "“Sẽ” trong tiếng Việt dùng cho mọi tương lai, nhưng will trong tiếng Anh là cho quyết định ngay lúc nói. Kế hoạch đã định trước thì dùng going to." },
      },
    }, {
      title: "Shall I …? Offers",
      pattern: "Shall I + verb? → Yes, please. / No, it's OK, thanks.",
      explanation: {
        english: "Shall I …? is a polite British way to offer help: Shall I carry your bag? Answer Yes, please or No, it's OK, thanks. I'll … also offers: I'll carry it for you.",
        vietnamese: "Shall I …? là cách lịch sự của người Anh để đề nghị giúp đỡ: Shall I carry your bag? Trả lời Yes, please hoặc No, it's OK, thanks. I'll … cũng là lời đề nghị: I'll carry it for you.",
      },
      examples: [
        { english: "Shall I turn on the air conditioning? Yes, please.", vietnamese: "Để tôi bật điều hoà nhé? Vâng, cảm ơn." },
        { english: "It's raining. I'll lend you my coat.", vietnamese: "Trời mưa rồi. Tôi cho bạn mượn áo khoác." },
      ],
      mistake: {
        wrong: "Can you lend me your pen? I'll borrow it back to you.", right: "Can you lend me your pen? I'll give it back to you.",
        why: { english: "Vietnamese “mượn” and “cho mượn” are close, but in English you borrow from someone and lend to someone.", vietnamese: "“Mượn” và “cho mượn” trong tiếng Việt gần nhau, nhưng trong tiếng Anh bạn borrow từ ai đó và lend cho ai đó." },
      },
    }],
    examples: [
      { english: "I've left my wallet at home. Don't worry, I'll pay.", vietnamese: "Tôi để quên ví ở nhà rồi. Đừng lo, để tôi trả." },
      { english: "That box looks heavy. Shall I carry it?", vietnamese: "Cái hộp trông nặng quá. Để tôi bê nhé?" },
      { english: "Can I borrow your charger? I'll give it back tomorrow.", vietnamese: "Tôi mượn bạn sạc được không? Mai tôi trả." },
      { english: "On second thoughts, I'll take the train. It's faster.", vietnamese: "Nghĩ lại thì tôi sẽ đi tàu. Nhanh hơn." },
    ],
    dialogue: [
      { speaker: "Waiter", english: "Are you ready to order?", vietnamese: "Anh chị gọi món chưa ạ?" },
      { speaker: "Ngan", english: "Yes. I'll have the chicken curry, please.", vietnamese: "Rồi ạ. Cho tôi món cà ri gà." },
      { speaker: "Waiter", english: "I'm afraid there's no chicken left.", vietnamese: "Rất tiếc là hết gà rồi ạ." },
      { speaker: "Ngan", english: "Oh. In that case I'll have the fish.", vietnamese: "Ồ. Vậy tôi chọn món cá." },
      { speaker: "Waiter", english: "Shall I bring some bread too?", vietnamese: "Tôi mang thêm bánh mì nhé?" },
      { speaker: "Ngan", english: "Yes, please. Actually, on second thoughts, no bread. Just water.", vietnamese: "Vâng. À mà nghĩ lại thì thôi bánh mì. Chỉ nước thôi." },
    ],
    practice: [
      q("The phone is ringing. You say…", ["I'll answer it.", "I'm going to answer it next week.", "I answer it yesterday.", "I'm answering it last night."], "I'll answer it.", "A decision made now: I'll."),
      q("Choose the polite offer.", ["Shall I open the window?", "Shall you open the window?", "Do I open the window for you shall?", "Will I opened the window?"], "Shall I open the window?", "Shall I + verb? offers help."),
      q("Complete: Can I ___ your umbrella?", ["borrow", "lend", "carry", "offer"], "borrow", "You borrow from someone."),
      q("Complete: I ___ be late. I promise!", ["won't", "don't", "am not going", "not will"], "won't", "Won't = will not, for a promise."),
    ],
    challenge: [
      q("You bought plane tickets last month. Say…", ["I'm going to fly to London in June.", "I'll fly to London in June, I decide now.", "I fly to London last June.", "I'm fly to London in June."], "I'm going to fly to London in June.", "A plan made before: going to."),
      q("Complete: I'll ___ you my notes.", ["lend", "borrow", "promise", "carry"], "lend", "You lend to someone."),
      q("“Shall I help you?” Choose the best answer.", ["Yes, please.", "Yes, you shall.", "Yes, I shall.", "Yes, I will help."], "Yes, please.", "Answer an offer with Yes, please."),
      q("“Nghĩ lại thì…” in English is…", ["On second thoughts, …", "In second thinking, …", "At second thought, …", "On two thoughts, …"], "On second thoughts, …", "British English: on second thoughts."),
      q("Complete: “It's dark in here.” “I ___ the light.”", ["'ll turn on", "'m going to turn on last", "turned on tomorrow", "turning on"], "'ll turn on", "A decision made now: I'll."),
    ],
  }, {
    key: "invitations", title: "Would You Like to Come?", titleVi: "Lời mời",
    objectives: [
      "I can invite someone, and accept or refuse an invitation politely.",
      "Invite with Would you like to …? and Do you fancy …-ing?",
      "Refuse politely with I'd love to, but … and I'm afraid …",
    ],
    vocabulary: [
      { word: "invite", ipa: "/ɪnˈvaɪt/", partOfSpeech: "verb", vietnamese: "mời", definition: "to ask someone to come to an event or to your home", example: { english: "They invited us to their wedding.", vietnamese: "Họ mời chúng tôi đến dự đám cưới." } },
      { word: "invitation", ipa: "/ˌɪnvɪˈteɪʃn/", partOfSpeech: "noun", vietnamese: "lời mời, thiệp mời", definition: "when someone asks you to come to something", example: { english: "Thanks for the invitation!", vietnamese: "Cảm ơn bạn đã mời!" } },
      { word: "do you fancy", ipa: "/du ju ˈfænsi/", partOfSpeech: "phrase", vietnamese: "bạn có muốn … không (thân mật)", definition: "an informal British way to ask if someone wants to do something", example: { english: "Do you fancy going for a drink?", vietnamese: "Bạn có muốn đi uống gì không?" } },
      { word: "I'd love to", ipa: "/aɪd ˈlʌv tə/", partOfSpeech: "phrase", vietnamese: "tôi rất muốn", definition: "a warm way to accept an invitation", example: { english: "Dinner on Friday? I'd love to!", vietnamese: "Ăn tối thứ Sáu à? Tôi rất muốn!" } },
      { word: "I'm afraid", ipa: "/aɪm əˈfreɪd/", partOfSpeech: "phrase", vietnamese: "tôi e là, rất tiếc", definition: "a polite way to give bad news", example: { english: "I'm afraid I can't come.", vietnamese: "Rất tiếc là tôi không đến được." } },
      { word: "another time", ipa: "/əˌnʌðə ˈtaɪm/", partOfSpeech: "phrase", vietnamese: "dịp khác", definition: "on a different day in the future", example: { english: "Maybe another time?", vietnamese: "Có lẽ để dịp khác nhé?" } },
      { word: "birthday party", ipa: "/ˈbɜːθdeɪ ˌpɑːti/", partOfSpeech: "noun", vietnamese: "tiệc sinh nhật", definition: "a party to celebrate someone's birthday", example: { english: "It's my birthday party on Saturday.", vietnamese: "Thứ Bảy là tiệc sinh nhật của tôi." } },
      { word: "join", ipa: "/dʒɔɪn/", partOfSpeech: "verb", vietnamese: "tham gia cùng", definition: "to do something together with other people", example: { english: "Would you like to join us for lunch?", vietnamese: "Bạn có muốn ăn trưa cùng chúng tôi không?" } },
    ],
    grammar: [{
      title: "Inviting",
      pattern: "Would you like to + verb? · Do you fancy + verb-ing?",
      explanation: {
        english: "Would you like to + verb is polite and works with anyone: Would you like to come to dinner? With friends, British people often say Do you fancy + -ing: Do you fancy going to the cinema? Don't forget to after would you like.",
        vietnamese: "Would you like to + động từ là cách lịch sự, dùng được với mọi người: Would you like to come to dinner? Với bạn bè, người Anh hay nói Do you fancy + -ing: Do you fancy going to the cinema? Đừng quên to sau would you like.",
      },
      examples: [
        { english: "Would you like to join us at the weekend?", vietnamese: "Cuối tuần này bạn có muốn đi cùng chúng tôi không?" },
        { english: "Do you fancy getting a takeaway tonight?", vietnamese: "Tối nay mua đồ ăn về nhà không?" },
      ],
      mistake: {
        wrong: "Would you like come to my party?", right: "Would you like to come to my party?",
        why: { english: "Would you like + verb always needs to. (Would you like + noun has no to: Would you like a drink?)", vietnamese: "Would you like + động từ luôn cần to. (Would you like + danh từ thì không có to: Would you like a drink?)" },
      },
    }, {
      title: "Saying yes and no",
      pattern: "Yes: I'd love to. / That sounds great. · No: I'd love to, but … / I'm afraid I can't.",
      explanation: {
        english: "Accept warmly: I'd love to! That sounds great. Refuse politely: start with something kind, then give a reason. I'd love to, but I'm working. I'm afraid I can't. I'm visiting my parents. A plain “No” sounds rude in English.",
        vietnamese: "Nhận lời một cách nhiệt tình: I'd love to! That sounds great. Từ chối lịch sự: bắt đầu bằng một câu dễ nghe rồi nêu lý do. I'd love to, but I'm working. I'm afraid I can't. I'm visiting my parents. Chỉ nói “No” nghe rất bất lịch sự trong tiếng Anh.",
      },
      examples: [
        { english: "Thanks for the invitation. I'd love to come!", vietnamese: "Cảm ơn lời mời. Tôi rất muốn đến!" },
        { english: "I'm afraid I can't. Maybe another time?", vietnamese: "Rất tiếc tôi không đi được. Để dịp khác nhé?" },
      ],
    }],
    examples: [
      { english: "We're having a birthday party for Linh. Would you like to come?", vietnamese: "Chúng tôi tổ chức sinh nhật cho Linh. Bạn có muốn đến không?" },
      { english: "Do you fancy going for a walk by the lake?", vietnamese: "Bạn có muốn đi dạo bờ hồ không?" },
      { english: "I'd love to, but I'm working late tonight.", vietnamese: "Tôi rất muốn, nhưng tối nay tôi làm muộn." },
      { english: "They invited me, but I'm afraid I'm busy.", vietnamese: "Họ mời tôi, nhưng rất tiếc tôi bận." },
    ],
    dialogue: [
      { speaker: "Ava", english: "Do you fancy coming to my birthday party on Saturday?", vietnamese: "Thứ Bảy bạn đến dự tiệc sinh nhật mình không?" },
      { speaker: "Dung", english: "I'd love to! What time?", vietnamese: "Mình rất muốn! Mấy giờ thế?" },
      { speaker: "Ava", english: "Seven o'clock. And would you like to bring your sister?", vietnamese: "Bảy giờ. Và bạn có muốn rủ cả em gái đến không?" },
      { speaker: "Dung", english: "I'm afraid she can't. She's flying to Hanoi on Saturday.", vietnamese: "Rất tiếc là em ấy không đi được. Thứ Bảy em ấy bay ra Hà Nội." },
      { speaker: "Ava", english: "Never mind. Another time!", vietnamese: "Không sao. Để dịp khác!" },
      { speaker: "Dung", english: "Thanks for the invitation. See you on Saturday!", vietnamese: "Cảm ơn bạn đã mời. Hẹn gặp thứ Bảy nhé!" },
    ],
    practice: [
      q("Complete: Would you like ___ to the cinema?", ["to come", "come", "coming", "comes"], "to come", "Would you like + to + verb."),
      q("Complete: Do you fancy ___ for a coffee?", ["going", "to go", "go", "goes"], "going", "Do you fancy + -ing."),
      q("Choose the warmest way to say yes.", ["I'd love to!", "Yes, I would like.", "OK, I come.", "No problem for me."], "I'd love to!", "I'd love to = a warm yes."),
      q("Choose the most polite refusal.", ["I'm afraid I can't. I'm working.", "No.", "I don't want.", "No, I can't come, bye."], "I'm afraid I can't. I'm working.", "I'm afraid + a reason."),
    ],
    challenge: [
      q("Choose the correct invitation.", ["Would you like to join us?", "Would you like join us?", "Would you like joining us?", "Do you like to join us now?"], "Would you like to join us?", "Would you like to + verb."),
      q("Complete: I'd love to, ___ I'm busy that day.", ["but", "and", "so", "because"], "but", "I'd love to, but + reason."),
      q("What is an “invitation”?", ["when someone asks you to come to something", "a birthday present", "a party", "a reply to a letter"], "when someone asks you to come to something", "An invitation asks you to come."),
      q("Complete: I can't come today. Maybe ___ time?", ["another", "other", "an other", "others"], "another", "Another time = on a different day."),
      q("Which is informal British English?", ["Do you fancy a coffee?", "Would you care for coffee, madam?", "I invite you to coffee.", "Coffee is offered."], "Do you fancy a coffee?", "Do you fancy …? is friendly and informal."),
    ],
  }, {
    key: "making-plans", title: "Making Plans Together", titleVi: "Cùng lên kế hoạch",
    objectives: [
      "I can suggest ideas, agree and disagree, and fix a time and place.",
      "Suggest with Let's, Shall we, Why don't we and How about",
      "Agree or disagree politely",
    ],
    vocabulary: [
      { word: "let's", ipa: "/lets/", partOfSpeech: "phrase", vietnamese: "chúng ta hãy", definition: "short for let us; used to suggest doing something together", example: { english: "Let's eat out tonight.", vietnamese: "Tối nay mình đi ăn ngoài đi." } },
      { word: "shall we", ipa: "/ˈʃæl wiː/", partOfSpeech: "phrase", vietnamese: "chúng ta … nhé?", definition: "used to suggest something to someone", example: { english: "Shall we meet at six?", vietnamese: "Mình gặp nhau lúc sáu giờ nhé?" } },
      { word: "why don't we", ipa: "/ˌwaɪ ˈdəʊnt wiː/", partOfSpeech: "phrase", vietnamese: "sao chúng ta không …", definition: "used to make a suggestion", example: { english: "Why don't we take a taxi?", vietnamese: "Sao mình không đi taxi nhỉ?" } },
      { word: "how about", ipa: "/ˈhaʊ əˌbaʊt/", partOfSpeech: "phrase", vietnamese: "thế còn … thì sao", definition: "used to suggest something; followed by a noun or verb-ing", example: { english: "How about going to the beach?", vietnamese: "Đi biển thì sao?" } },
      { word: "good idea", ipa: "/ˌɡʊd aɪˈdɪə/", partOfSpeech: "phrase", vietnamese: "ý hay", definition: "what you say to agree with a suggestion", example: { english: "Let's go by train. Good idea!", vietnamese: "Mình đi tàu đi. Ý hay đấy!" } },
      { word: "suit", ipa: "/suːt/", partOfSpeech: "verb", vietnamese: "phù hợp, tiện (cho ai)", definition: "to be convenient for someone", example: { english: "Does Tuesday suit you?", vietnamese: "Thứ Ba có tiện cho bạn không?" } },
      { word: "meet up", ipa: "/ˌmiːt ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "gặp mặt, hẹn gặp", definition: "to meet someone by arrangement", example: { english: "Let's meet up after work.", vietnamese: "Mình gặp nhau sau giờ làm nhé." } },
      { word: "eat out", ipa: "/ˌiːt ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "đi ăn ngoài", definition: "to have a meal in a restaurant, not at home", example: { english: "We eat out every Friday.", vietnamese: "Thứ Sáu nào chúng tôi cũng đi ăn ngoài." } },
    ],
    grammar: [{
      title: "Suggesting",
      pattern: "Let's + verb · Shall we + verb? · Why don't we + verb? · How about + verb-ing?",
      explanation: {
        english: "Let's, Shall we and Why don't we are followed by the base verb: Let's go. Shall we go? Why don't we go? How about is followed by -ing or a noun: How about going to the park? How about Friday?",
        vietnamese: "Let's, Shall we và Why don't we đi với động từ nguyên mẫu: Let's go. Shall we go? Why don't we go? How about đi với -ing hoặc danh từ: How about going to the park? How about Friday?",
      },
      examples: [
        { english: "Let's meet up at the café by the lake.", vietnamese: "Mình gặp nhau ở quán cà phê bên hồ đi." },
        { english: "How about eating out on Saturday?", vietnamese: "Thứ Bảy đi ăn ngoài thì sao?" },
      ],
      mistake: {
        wrong: "Let's to go to the beach.", right: "Let's go to the beach.",
        why: { english: "Let's is followed by the verb with no to. And with How about, use -ing: How about going …?", vietnamese: "Sau Let's là động từ không có to. Còn với How about, dùng -ing: How about going …?" },
      },
    }, {
      title: "Agreeing and disagreeing",
      pattern: "Yes: Good idea. / Sounds good. · No: I'm not sure. How about …? / I'd rather …",
      explanation: {
        english: "To agree: Good idea! Sounds good. Why not? To disagree politely, don't just say No: say I'm not sure about that, then suggest something else. I'd rather + verb means you prefer another choice: I'd rather stay in.",
        vietnamese: "Để đồng ý: Good idea! Sounds good. Why not? Để không đồng ý một cách lịch sự, đừng chỉ nói No: hãy nói I'm not sure about that, rồi đề xuất ý khác. I'd rather + động từ nghĩa là bạn thích lựa chọn khác hơn: I'd rather stay in.",
      },
      examples: [
        { english: "Shall we go by bus? I'm not sure. How about walking?", vietnamese: "Mình đi xe buýt nhé? Mình không chắc lắm. Đi bộ thì sao?" },
        { english: "Why don't we eat out? Sounds good!", vietnamese: "Sao mình không đi ăn ngoài nhỉ? Nghe hay đấy!" },
      ],
    }],
    examples: [
      { english: "Shall we meet up on Sunday? Does ten o'clock suit you?", vietnamese: "Chủ nhật mình gặp nhau nhé? Mười giờ có tiện cho bạn không?" },
      { english: "Why don't we invite Hoa too? Good idea!", vietnamese: "Sao mình không mời cả Hoa nhỉ? Ý hay đấy!" },
      { english: "How about the new Korean restaurant?", vietnamese: "Nhà hàng Hàn Quốc mới mở thì sao?" },
      { english: "I'd rather eat out than cook tonight.", vietnamese: "Tối nay tôi thích đi ăn ngoài hơn là nấu." },
    ],
    dialogue: [
      { speaker: "Leo", english: "Let's do something this weekend.", vietnamese: "Cuối tuần này mình làm gì đó đi." },
      { speaker: "Anh", english: "Good idea. How about going to the Botanic Gardens?", vietnamese: "Ý hay đấy. Đi vườn bách thảo thì sao?" },
      { speaker: "Leo", english: "I'm not sure. It's going to rain. Why don't we see a film?", vietnamese: "Mình không chắc lắm. Trời sắp mưa đấy. Sao mình không đi xem phim nhỉ?" },
      { speaker: "Anh", english: "Sounds good. Shall we eat out first?", vietnamese: "Nghe hay đấy. Mình đi ăn trước nhé?" },
      { speaker: "Leo", english: "Yes, let's meet up at six. Does that suit you?", vietnamese: "Ừ, gặp nhau lúc sáu giờ nhé. Thế có tiện cho bạn không?" },
      { speaker: "Anh", english: "Perfect. See you then!", vietnamese: "Hoàn hảo. Hẹn gặp lúc đó!" },
    ],
    practice: [
      q("Complete: Let's ___ a taxi.", ["take", "to take", "taking", "takes"], "take", "Let's + base verb."),
      q("Complete: How about ___ to the zoo?", ["going", "go", "to go", "goes"], "going", "How about + -ing."),
      q("Choose a way to agree.", ["Sounds good!", "I'm not sure.", "I'd rather not.", "How about Monday?"], "Sounds good!", "Sounds good = I agree."),
      q("“Đi ăn ngoài” in English is…", ["eat out", "eat in", "go eat outside", "eat away"], "eat out", "Eat out = eat in a restaurant."),
    ],
    challenge: [
      q("Choose the correct suggestion.", ["Why don't we meet at the station?", "Why don't we to meet at the station?", "Why don't we meeting at the station?", "Why we don't meet at the station?"], "Why don't we meet at the station?", "Why don't we + base verb."),
      q("Complete: ___ we go now? It's late.", ["Shall", "Let's", "How about", "Why"], "Shall", "Shall we + verb?"),
      q("Complete: Does Friday ___ you?", ["suit", "fit", "agree", "like"], "suit", "Does it suit you? = Is it convenient?"),
      q("Disagree politely.", ["I'm not sure. How about the park?", "No. Bad idea.", "I don't want your idea.", "Never."], "I'm not sure. How about the park?", "Soften it, then suggest something else."),
      q("Complete: I'd rather ___ at home tonight.", ["stay", "to stay", "staying", "stayed"], "stay", "I'd rather + base verb."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 5", isReview: true,
    objectives: [
      "I can talk about plans, arrangements and decisions, and invite and suggest.",
      "Check going to, the present continuous for arrangements, I'll, would you like to and let's",
    ],
    vocabulary: [
      { word: "give up", ipa: "/ˌɡɪv ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "từ bỏ", definition: "to stop doing something, often a bad habit", example: { english: "Don't give up! You're nearly there.", vietnamese: "Đừng bỏ cuộc! Bạn sắp tới đích rồi." } },
      { word: "free", ipa: "/friː/", partOfSpeech: "adjective", vietnamese: "rảnh", definition: "not busy, with nothing arranged", example: { english: "I'm free after five.", vietnamese: "Sau năm giờ tôi rảnh." } },
      { word: "lend", ipa: "/lend/", partOfSpeech: "verb", vietnamese: "cho mượn", definition: "to give something to someone for a short time", example: { english: "Could you lend me ten pounds?", vietnamese: "Bạn cho tôi mượn mười bảng được không?" } },
      { word: "I'm afraid", ipa: "/aɪm əˈfreɪd/", partOfSpeech: "phrase", vietnamese: "tôi e là, rất tiếc", definition: "a polite way to give bad news", example: { english: "I'm afraid the shop is closed.", vietnamese: "Rất tiếc là cửa hàng đóng cửa rồi." } },
      { word: "how about", ipa: "/ˈhaʊ əˌbaʊt/", partOfSpeech: "phrase", vietnamese: "thế còn … thì sao", definition: "used to suggest something; followed by a noun or verb-ing", example: { english: "How about a walk?", vietnamese: "Đi dạo thì sao?" } },
      { word: "meet up", ipa: "/ˌmiːt ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "gặp mặt, hẹn gặp", definition: "to meet someone by arrangement", example: { english: "Shall we meet up for lunch?", vietnamese: "Mình gặp nhau ăn trưa nhé?" } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "I'm going to … · I'm meeting … on Friday · I'll … · Would you like to …? · Let's …",
      explanation: {
        english: "Check these: be going to (with am, is or are) for plans decided before; the present continuous with a time for arrangements with other people; I'll for decisions made now, offers and promises; Would you like to + verb to invite; and Let's / Shall we + base verb, How about + -ing to suggest.",
        vietnamese: "Hãy kiểm tra: be going to (có am, is hoặc are) cho kế hoạch đã định trước; hiện tại tiếp diễn kèm thời gian cho lịch hẹn với người khác; I'll cho quyết định ngay lúc nói, lời đề nghị và lời hứa; Would you like to + động từ để mời; và Let's / Shall we + động từ nguyên mẫu, How about + -ing để gợi ý.",
      },
      examples: [
        { english: "I'm going to learn to swim. I'm starting lessons on Monday.", vietnamese: "Tôi định học bơi. Thứ Hai tôi bắt đầu học." },
        { english: "Would you like to come? Let's meet at seven.", vietnamese: "Bạn có muốn đến không? Mình gặp nhau lúc bảy giờ nhé." },
      ],
    }],
    examples: [
      { english: "Are you free on Friday? Let's meet up after work.", vietnamese: "Thứ Sáu bạn rảnh không? Mình gặp nhau sau giờ làm nhé." },
      { english: "I forgot my wallet. Don't worry, I'll lend you some money.", vietnamese: "Tôi quên ví rồi. Đừng lo, tôi cho bạn mượn ít tiền." },
      { english: "I'm afraid I can't come. How about next week?", vietnamese: "Rất tiếc tôi không đến được. Tuần sau thì sao?" },
    ],
    dialogue: [
      { speaker: "Freya", english: "What are you doing on Saturday?", vietnamese: "Thứ Bảy bạn làm gì?" },
      { speaker: "Kien", english: "I'm helping my brother move house. Why?", vietnamese: "Mình giúp anh trai chuyển nhà. Sao thế?" },
      { speaker: "Freya", english: "Would you like to come to a concert? I've got two tickets.", vietnamese: "Bạn có muốn đi xem hoà nhạc không? Mình có hai vé." },
      { speaker: "Kien", english: "I'd love to, but I'm afraid I'm busy all day.", vietnamese: "Mình rất muốn, nhưng rất tiếc là mình bận cả ngày." },
      { speaker: "Freya", english: "Never mind. How about meeting up on Sunday instead?", vietnamese: "Không sao. Thế gặp nhau Chủ nhật thì sao?" },
      { speaker: "Kien", english: "Good idea. I'll call you on Sunday morning.", vietnamese: "Ý hay đấy. Sáng Chủ nhật mình sẽ gọi cho bạn." },
    ],
    practice: [
      q("Choose the correct sentence.", ["She's going to give up chocolate.", "She going to give up chocolate.", "She's going give up chocolate.", "She's go to give up chocolate."], "She's going to give up chocolate.", "Is + going to + verb."),
      q("Complete: I ___ the dentist at four tomorrow.", ["'m seeing", "see", "saw", "'m see"], "'m seeing", "An arrangement: present continuous."),
      q("“The bag is heavy.” Offer help.", ["I'll carry it.", "I carry it yesterday.", "I'm going to carry it next year.", "I carried it."], "I'll carry it.", "An offer made now: I'll."),
      q("Complete: Would you like ___ dinner with us?", ["to have", "have", "having", "has"], "to have", "Would you like to + verb."),
    ],
    challenge: [
      q("Complete: How about ___ a picnic?", ["having", "have", "to have", "had"], "having", "How about + -ing."),
      q("Choose the polite refusal.", ["I'd love to, but I'm working.", "No, I don't go.", "I don't like your party.", "No, thanks, bye."], "I'd love to, but I'm working.", "Something kind + but + reason."),
      q("Complete: Can I ___ your pen?", ["borrow", "lend", "offer", "give up"], "borrow", "You borrow from someone."),
      q("Complete: Let's ___ up at the station.", ["meet", "to meet", "meeting", "met"], "meet", "Let's + base verb."),
      q("You decided last month. Say…", ["We're going to visit Hoi An in May.", "We'll visit Hoi An in May, I've just decided.", "We visit Hoi An last May.", "We going to visit Hoi An in May."], "We're going to visit Hoi An in May.", "A plan made before: going to."),
    ],
  }],
  assessment: [
    { id: "going-to-be", prompt: "Complete: They ___ going to buy a new car.", options: ["are", "is", "—", "do"], correct: "are", explanation: "They + are + going to." },
    { id: "going-to-form", prompt: "Choose the correct sentence.", options: ["I'm going to start a new course.", "I going to start a new course.", "I'm going to starting a new course.", "I'm going start a new course."], correct: "I'm going to start a new course.", explanation: "Am + going to + base verb." },
    { id: "going-to-evidence", prompt: "Look at the sky! It ___.", options: ["'s going to rain", "rained", "rain", "'s rain"], correct: "'s going to rain", explanation: "You can see it coming: going to." },
    { id: "arrangement", prompt: "Complete: We ___ dinner with Lan's parents on Sunday. It's all arranged.", options: ["'re having", "have", "had", "'re have"], correct: "'re having", explanation: "An arrangement: present continuous." },
    { id: "what-are-you-doing", prompt: "Choose the correct question.", options: ["What are you doing tonight?", "What do you doing tonight?", "What you are doing tonight?", "What are you do tonight?"], correct: "What are you doing tonight?", explanation: "What + are + you + -ing?" },
    { id: "ill-decision", prompt: "“There's no milk.” “Oh, I ___ some.”", options: ["'ll buy", "bought", "'m buying last week", "buy yesterday"], correct: "'ll buy", explanation: "A decision made now: I'll." },
    { id: "will-vs-going-to", prompt: "You booked the hotel last week. Say…", options: ["I'm going to stay in Da Lat for three nights.", "I'll stay in Da Lat, I decide now.", "I stayed in Da Lat next week.", "I going to stay in Da Lat."], correct: "I'm going to stay in Da Lat for three nights.", explanation: "A plan made before: going to." },
    { id: "promise-wont", prompt: "Complete: I promise I ___ forget.", options: ["won't", "don't", "not will", "am not"], correct: "won't", explanation: "Won't for a promise." },
    { id: "shall-offer", prompt: "Choose the polite offer.", options: ["Shall I help you with that?", "Shall you help me?", "I shall helped you.", "Do I shall help you?"], correct: "Shall I help you with that?", explanation: "Shall I + verb?" },
    { id: "lend-borrow", prompt: "Complete: Could you ___ me your dictionary?", options: ["lend", "borrow", "carry", "offer"], correct: "lend", explanation: "Lend to someone." },
    { id: "would-you-like-to", prompt: "Choose the correct invitation.", options: ["Would you like to come to the party?", "Would you like come to the party?", "Would you like coming to the party?", "Do you like come to the party?"], correct: "Would you like to come to the party?", explanation: "Would you like to + verb." },
    { id: "fancy-ing", prompt: "Complete: Do you fancy ___ for a pizza?", options: ["going", "go", "to go", "went"], correct: "going", explanation: "Fancy + -ing." },
    { id: "polite-refusal", prompt: "Choose the most polite refusal.", options: ["I'm afraid I can't. I'm visiting my aunt.", "No.", "I don't want to come.", "No, busy."], correct: "I'm afraid I can't. I'm visiting my aunt.", explanation: "I'm afraid + a reason." },
    { id: "lets-base", prompt: "Choose the correct suggestion.", options: ["Let's go to the market.", "Let's to go to the market.", "Let's going to the market.", "Let's we go to the market."], correct: "Let's go to the market.", explanation: "Let's + base verb." },
    { id: "how-about-ing", prompt: "Complete: How about ___ the bus?", options: ["taking", "take", "to take", "took"], correct: "taking", explanation: "How about + -ing." },
  ],
};
