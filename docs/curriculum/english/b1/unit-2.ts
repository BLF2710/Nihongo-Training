// B1 Unit 2: Work & Study. Vietnamese "từng", "chán" and "quen với" lead to "I was used to live in Hue", "I'm
// boring" (for "tôi thấy chán") and "I'm used to get up early"; verbs after verbs give "I enjoy to read" and "I look
// forward to hear from you"; and interviews and emails bring "Could you tell me what is the salary?" and "I write to
// ask…". This unit puts those right and adds the language of applications and formal emails.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B1",
  number: 2,
  lessons: [{
    key: "used-to", title: "I Used to Live in Hue", titleVi: "Tôi từng sống ở Huế",
    objectives: [
      "I can talk about how my life used to be and how it has changed.",
      "Use used to and didn't use to for past habits and states",
      "Tell used to (từng) apart from be used to (quen với)",
    ],
    vocabulary: [
      { word: "used to", ipa: "/ˈjuːst tə/", partOfSpeech: "phrase", vietnamese: "từng, đã từng (thói quen trong quá khứ)", definition: "used for something that was true or happened often in the past but not now", example: { english: "I used to walk to school every day.", vietnamese: "Hồi trước ngày nào tôi cũng đi bộ đến trường." } },
      { word: "childhood", ipa: "/ˈtʃaɪldhʊd/", partOfSpeech: "noun", vietnamese: "thời thơ ấu", definition: "the time when you are a child", example: { english: "I spent my childhood in a small village.", vietnamese: "Tôi trải qua thời thơ ấu ở một ngôi làng nhỏ." } },
      { word: "hometown", ipa: "/ˈhəʊmtaʊn/", partOfSpeech: "noun", vietnamese: "quê nhà", definition: "the town or city where you were born or grew up", example: { english: "My hometown has changed a lot.", vietnamese: "Quê tôi đã thay đổi nhiều." } },
      { word: "grow up", ipa: "/ˌɡrəʊ ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "lớn lên", definition: "to change from a child into an adult", example: { english: "Where did you grow up?", vietnamese: "Bạn lớn lên ở đâu?" } },
      { word: "countryside", ipa: "/ˈkʌntrisaɪd/", partOfSpeech: "noun", vietnamese: "vùng nông thôn", definition: "land outside towns and cities, with fields and farms", example: { english: "We used to spend every summer in the countryside.", vietnamese: "Mùa hè nào chúng tôi cũng về quê." } },
      { word: "nowadays", ipa: "/ˈnaʊədeɪz/", partOfSpeech: "adverb", vietnamese: "ngày nay", definition: "at the present time, compared with the past", example: { english: "Nowadays most people pay by phone.", vietnamese: "Ngày nay hầu hết mọi người thanh toán bằng điện thoại." } },
      { word: "commute", ipa: "/kəˈmjuːt/", partOfSpeech: "verb", vietnamese: "đi lại (giữa nhà và nơi làm việc)", definition: "to travel regularly between home and work", example: { english: "I used to commute two hours a day.", vietnamese: "Tôi từng mất hai tiếng mỗi ngày để đi làm." } },
      { word: "be used to", ipa: "/bi ˈjuːst tə/", partOfSpeech: "phrase", vietnamese: "quen với", definition: "to know something well so it no longer seems strange or difficult", example: { english: "I'm used to the noise now.", vietnamese: "Giờ tôi quen với tiếng ồn rồi." } },
    ],
    grammar: [{
      title: "Used to",
      pattern: "used to + base verb · didn't use to + base verb · Did you use to + base verb?",
      explanation: {
        english: "Used to shows habits and states in the past that are not true now: I used to smoke (but I don't now). It has no be before it. In negatives and questions, after did, write use to without d: I didn't use to like coffee. Did you use to live here?",
        vietnamese: "Used to diễn tả thói quen hoặc trạng thái trong quá khứ mà nay không còn: I used to smoke (giờ tôi không hút nữa). Không có be đứng trước. Trong câu phủ định và câu hỏi, sau did viết use to, không có d: I didn't use to like coffee. Did you use to live here?",
      },
      examples: [
        { english: "My grandfather used to be a teacher.", vietnamese: "Ông tôi từng là giáo viên." },
        { english: "Did you use to play video games as a child?", vietnamese: "Hồi nhỏ bạn có hay chơi điện tử không?" },
      ],
      mistake: {
        wrong: "I was used to live in Hue.", right: "I used to live in Hue.",
        why: { english: "For “từng”, used to has no be. Be used to means “quen với”, which is different.", vietnamese: "Với nghĩa “từng”, used to không có be. Be used to nghĩa là “quen với”, khác hẳn." },
      },
    }, {
      title: "Be used to and get used to",
      pattern: "be used to + noun / -ing (quen với) · get used to + noun / -ing (dần quen với)",
      explanation: {
        english: "Be used to means something is normal for you now: I'm used to working at night. Get used to means it is becoming normal: I'm getting used to the cold. Here to is a preposition, so it is followed by a noun or -ing, not a base verb.",
        vietnamese: "Be used to nghĩa là việc gì đó đã bình thường với bạn: I'm used to working at night. Get used to nghĩa là đang dần quen: I'm getting used to the cold. Ở đây to là giới từ, nên theo sau là danh từ hoặc V-ing, không phải động từ nguyên mẫu.",
      },
      examples: [
        { english: "She isn't used to driving on the left.", vietnamese: "Cô ấy chưa quen lái xe bên trái." },
        { english: "It took me a year to get used to British food.", vietnamese: "Tôi mất một năm để quen với đồ ăn Anh." },
      ],
      mistake: {
        wrong: "I'm used to get up early.", right: "I'm used to getting up early.",
        why: { english: "After be used to, the verb takes -ing, because to is a preposition here.", vietnamese: "Sau be used to, động từ thêm -ing, vì to ở đây là giới từ." },
      },
    }],
    examples: [
      { english: "I grew up in the countryside, so I'm not used to city traffic.", vietnamese: "Tôi lớn lên ở nông thôn nên chưa quen với giao thông thành phố." },
      { english: "There used to be a cinema in my hometown, but it closed.", vietnamese: "Quê tôi từng có một rạp chiếu phim, nhưng nó đóng cửa rồi." },
      { english: "I didn't use to like vegetables, but nowadays I eat them every day.", vietnamese: "Trước đây tôi không thích rau, nhưng giờ ngày nào tôi cũng ăn." },
      { english: "He used to commute by motorbike. Now he works from home.", vietnamese: "Anh ấy từng đi làm bằng xe máy. Giờ anh ấy làm việc ở nhà." },
    ],
    dialogue: [
      { speaker: "Kate", english: "Where did you grow up, Long?", vietnamese: "Long lớn lên ở đâu?" },
      { speaker: "Long", english: "In Hue. I used to live near the river.", vietnamese: "Ở Huế. Mình từng sống gần sông." },
      { speaker: "Kate", english: "Do you miss it?", vietnamese: "Bạn có nhớ không?" },
      { speaker: "Long", english: "Yes. Life used to be slower there. Nowadays I'm always busy.", vietnamese: "Có. Ở đó cuộc sống từng chậm hơn. Giờ lúc nào mình cũng bận." },
      { speaker: "Kate", english: "Are you used to London now?", vietnamese: "Giờ bạn quen với London chưa?" },
      { speaker: "Long", english: "Mostly. But I'm still getting used to the weather!", vietnamese: "Gần như rồi. Nhưng mình vẫn đang dần quen với thời tiết!" },
    ],
    practice: [
      q("Complete: I ___ play football every weekend when I was at school.", ["used to", "was used to", "use to", "am used to"], "used to", "Past habit: used to + base verb."),
      q("Complete: Did you ___ have long hair?", ["use to", "used to", "using to", "be used to"], "use to", "After did: use to (no d)."),
      q("“Quen với việc làm ca đêm” in English is…", ["be used to working nights", "used to work nights", "be used to work nights", "use to working nights"], "be used to working nights", "Be used to + -ing."),
      q("Where did you ___? In Da Lat.", ["grow up", "grow", "grow out", "up grow"], "grow up", "Grow up = become an adult."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["There used to be a market here.", "There was used to be a market here.", "There use to be a market here.", "It used to have a market here."], "There used to be a market here.", "There used to be = there was in the past."),
      q("Complete: She ___ to the noise yet. She only moved in last week.", ["isn't used", "didn't use", "doesn't use", "wasn't use"], "isn't used", "Not normal for her yet: isn't used to."),
      q("Complete: It took me months to get used to ___ on the left.", ["driving", "drive", "drove", "be driving"], "driving", "Get used to + -ing."),
      q("Choose the correct sentence.", ["I didn't use to drink coffee.", "I didn't used to drink coffee.", "I wasn't used to drink coffee.", "I used not drinking coffee."], "I didn't use to drink coffee.", "Didn't + use to + base verb."),
      q("What does “commute” mean?", ["travel between home and work", "work at home", "move to a new city", "stay in the countryside"], "travel between home and work", "Commute = the daily journey to work."),
    ],
  }, {
    key: "ed-and-ing", title: "Bored or Boring?", titleVi: "Bored hay boring?",
    objectives: [
      "I can describe how I feel and what makes me feel that way.",
      "Use -ed adjectives for feelings and -ing adjectives for causes",
      "Use the right preposition: interested in, bored with, disappointed with",
    ],
    vocabulary: [
      { word: "bored", ipa: "/bɔːd/", partOfSpeech: "adjective", vietnamese: "thấy chán", definition: "feeling unhappy because nothing is interesting", example: { english: "I'm bored. Let's go out.", vietnamese: "Chán quá. Mình ra ngoài đi." } },
      { word: "boring", ipa: "/ˈbɔːrɪŋ/", partOfSpeech: "adjective", vietnamese: "nhàm chán, tẻ nhạt", definition: "not interesting; making you feel bored", example: { english: "The meeting was so boring.", vietnamese: "Cuộc họp chán kinh khủng." } },
      { word: "confused", ipa: "/kənˈfjuːzd/", partOfSpeech: "adjective", vietnamese: "bối rối, không hiểu", definition: "not able to understand something clearly", example: { english: "I'm confused. Which form do I fill in?", vietnamese: "Tôi rối quá. Tôi phải điền mẫu nào?" } },
      { word: "confusing", ipa: "/kənˈfjuːzɪŋ/", partOfSpeech: "adjective", vietnamese: "khó hiểu, gây rối", definition: "difficult to understand", example: { english: "These instructions are really confusing.", vietnamese: "Hướng dẫn này thật khó hiểu." } },
      { word: "embarrassed", ipa: "/ɪmˈbærəst/", partOfSpeech: "adjective", vietnamese: "ngượng, xấu hổ", definition: "feeling shy or silly in front of other people", example: { english: "I was embarrassed when I forgot his name.", vietnamese: "Tôi ngượng chín người khi quên tên anh ấy." } },
      { word: "embarrassing", ipa: "/ɪmˈbærəsɪŋ/", partOfSpeech: "adjective", vietnamese: "đáng xấu hổ, gây ngượng", definition: "making you feel shy or silly", example: { english: "It was an embarrassing mistake.", vietnamese: "Đó là một lỗi đáng xấu hổ." } },
      { word: "disappointed", ipa: "/ˌdɪsəˈpɔɪntɪd/", partOfSpeech: "adjective", vietnamese: "thất vọng", definition: "sad because something was not as good as you hoped", example: { english: "We were disappointed with the hotel.", vietnamese: "Chúng tôi thất vọng về khách sạn." } },
      { word: "annoying", ipa: "/əˈnɔɪɪŋ/", partOfSpeech: "adjective", vietnamese: "gây khó chịu, phiền", definition: "making you a little angry", example: { english: "That noise is so annoying!", vietnamese: "Tiếng ồn đó khó chịu quá!" } },
    ],
    grammar: [{
      title: "-ed for feelings, -ing for causes",
      pattern: "I'm bored / interested / tired (how I feel) · It's boring / interesting / tiring (what makes me feel it)",
      explanation: {
        english: "Adjectives ending in -ed describe how a person feels: I'm interested. Adjectives ending in -ing describe the thing or person that causes the feeling: The film is interesting. So I'm boring means other people find you dull. To say “tôi thấy chán”, say I'm bored.",
        vietnamese: "Tính từ đuôi -ed mô tả cảm giác của một người: I'm interested. Tính từ đuôi -ing mô tả sự vật hoặc người gây ra cảm giác đó: The film is interesting. Vì vậy I'm boring nghĩa là người khác thấy bạn nhạt nhẽo. Để nói “tôi thấy chán”, hãy nói I'm bored.",
      },
      examples: [
        { english: "The journey was tiring, so we were tired when we arrived.", vietnamese: "Chuyến đi mệt mỏi nên chúng tôi mệt rã rời khi đến nơi." },
        { english: "His jokes are embarrassing. Everyone feels embarrassed.", vietnamese: "Mấy câu đùa của anh ta thật ngượng. Ai cũng thấy ngại." },
      ],
      mistake: {
        wrong: "I'm boring. There's nothing to do.", right: "I'm bored. There's nothing to do.",
        why: { english: "“Chán” about your feeling is bored. Boring describes something that makes people feel bored.", vietnamese: "“Chán” nói về cảm giác của bạn là bored. Boring mô tả thứ khiến người khác thấy chán." },
      },
    }, {
      title: "Feeling + preposition",
      pattern: "interested in · bored with / of · disappointed with / by · embarrassed about · worried about · excited about",
      explanation: {
        english: "Many -ed adjectives go with a fixed preposition, followed by a noun or -ing: I'm interested in history. She's excited about starting university. Learn them together as one phrase.",
        vietnamese: "Nhiều tính từ đuôi -ed đi với một giới từ cố định, theo sau là danh từ hoặc V-ing: I'm interested in history. She's excited about starting university. Hãy học chúng cùng nhau như một cụm.",
      },
      examples: [
        { english: "Are you interested in working abroad?", vietnamese: "Bạn có hứng thú làm việc ở nước ngoài không?" },
        { english: "He's worried about his exam results.", vietnamese: "Anh ấy lo lắng về kết quả thi." },
      ],
      mistake: {
        wrong: "I'm interesting in photography.", right: "I'm interested in photography.",
        why: { english: "For your own interest, use interested (-ed), and the preposition is in.", vietnamese: "Khi nói về sở thích của bạn, dùng interested (-ed), và giới từ là in." },
      },
    }],
    examples: [
      { english: "I was confused because the timetable was so confusing.", vietnamese: "Tôi bối rối vì thời gian biểu quá khó hiểu." },
      { english: "It's annoying when people talk during a film.", vietnamese: "Thật khó chịu khi người ta nói chuyện trong lúc xem phim." },
      { english: "The fans were disappointed with the result.", vietnamese: "Người hâm mộ thất vọng với kết quả." },
      { english: "Don't be embarrassed about making mistakes. Everyone does.", vietnamese: "Đừng ngại mắc lỗi. Ai cũng thế mà." },
    ],
    dialogue: [
      { speaker: "Chris", english: "How was the training course?", vietnamese: "Khoá đào tạo thế nào?" },
      { speaker: "Phuong", english: "Honestly, it was boring. I was bored after ten minutes.", vietnamese: "Nói thật là chán lắm. Mười phút là mình thấy chán rồi." },
      { speaker: "Chris", english: "Oh no. Was it confusing too?", vietnamese: "Trời. Có khó hiểu nữa không?" },
      { speaker: "Phuong", english: "A bit. The trainer kept changing the slides. It was annoying.", vietnamese: "Hơi hơi. Người hướng dẫn cứ đổi slide liên tục. Khó chịu lắm." },
      { speaker: "Chris", english: "I'm disappointed. I wanted to go next month.", vietnamese: "Mình thất vọng ghê. Mình định đi vào tháng sau." },
      { speaker: "Phuong", english: "Go if you're interested in the topic. Just take a coffee!", vietnamese: "Cứ đi nếu bạn quan tâm chủ đề đó. Nhớ mang theo cà phê!" },
    ],
    practice: [
      q("Complete: The lecture was really ___.", ["boring", "bored", "bore", "boredom"], "boring", "The lecture caused the feeling: -ing."),
      q("Complete: I'm ___ in learning Korean.", ["interested", "interesting", "interest", "interests"], "interested", "Your feeling: interested in."),
      q("“Tôi thấy chán” in English is…", ["I'm bored.", "I'm boring.", "I bore.", "I'm boredom."], "I'm bored.", "Your feeling: bored."),
      q("Complete: She was ___ when she fell over in front of everyone.", ["embarrassed", "embarrassing", "embarrass", "embarrassment"], "embarrassed", "How she felt: -ed."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["The news was very disappointing.", "The news was very disappointed.", "I was very disappointing with the news.", "The news disappointed with me."], "The news was very disappointing.", "The news caused the feeling: -ing."),
      q("Complete: Are you worried ___ the interview?", ["about", "in", "with", "for"], "about", "Worried about."),
      q("Complete: These road signs are ___. I don't know which way to go.", ["confusing", "confused", "confuse", "confusion"], "confusing", "The signs cause confusion: -ing."),
      q("“My brother is boring.” What does it mean?", ["People find him dull.", "He feels bored.", "He is tired.", "He is angry."], "People find him dull.", "-ing describes the cause: he makes others bored."),
      q("Complete: It's really ___ when the Wi-Fi keeps stopping.", ["annoying", "annoyed", "annoy", "annoyance"], "annoying", "What causes the feeling: annoying."),
    ],
  }, {
    key: "gerund-or-infinitive", title: "Enjoy Doing, Decide to Do", titleVi: "Danh động từ hay động từ nguyên mẫu",
    objectives: [
      "I can talk about my likes, plans and decisions using two verbs together.",
      "Know which verbs take -ing (enjoy, avoid, mind) and which take to (want, decide, afford)",
      "Use -ing after prepositions: look forward to meeting, keen on cooking",
    ],
    vocabulary: [
      { word: "avoid", ipa: "/əˈvɔɪd/", partOfSpeech: "verb", vietnamese: "tránh", definition: "to stay away from something or not do it", example: { english: "I try to avoid driving in the rush hour.", vietnamese: "Tôi cố tránh lái xe giờ cao điểm." } },
      { word: "mind", ipa: "/maɪnd/", partOfSpeech: "verb", vietnamese: "phiền, ngại", definition: "to be unhappy or annoyed about something", example: { english: "Do you mind waiting a few minutes?", vietnamese: "Bạn có phiền đợi vài phút không?" } },
      { word: "can't stand", ipa: "/ˌkɑːnt ˈstænd/", partOfSpeech: "phrase", vietnamese: "không chịu nổi", definition: "to hate something very much", example: { english: "I can't stand waiting in queues.", vietnamese: "Tôi không chịu nổi việc xếp hàng chờ." } },
      { word: "decide", ipa: "/dɪˈsaɪd/", partOfSpeech: "verb", vietnamese: "quyết định", definition: "to choose what to do after thinking about it", example: { english: "We've decided to sell the car.", vietnamese: "Chúng tôi đã quyết định bán xe." } },
      { word: "afford", ipa: "/əˈfɔːd/", partOfSpeech: "verb", vietnamese: "có đủ tiền / khả năng", definition: "to have enough money or time for something", example: { english: "I can't afford to buy a flat in the city.", vietnamese: "Tôi không đủ tiền mua căn hộ trong thành phố." } },
      { word: "look forward to", ipa: "/ˌlʊk ˈfɔːwəd tə/", partOfSpeech: "phrasal verb", vietnamese: "mong chờ", definition: "to feel happy about something that is going to happen", example: { english: "I'm looking forward to seeing you.", vietnamese: "Mình rất mong được gặp bạn." } },
      { word: "keen on", ipa: "/ˈkiːn ɒn/", partOfSpeech: "adjective", vietnamese: "thích, say mê", definition: "very interested in something (British English)", example: { english: "She's really keen on baking.", vietnamese: "Cô ấy rất mê làm bánh." } },
      { word: "put off", ipa: "/ˌpʊt ˈɒf/", partOfSpeech: "phrasal verb", vietnamese: "trì hoãn", definition: "to decide to do something later", example: { english: "Stop putting off going to the dentist!", vietnamese: "Đừng trì hoãn việc đi nha sĩ nữa!" } },
    ],
    grammar: [{
      title: "Verb + -ing or verb + to",
      pattern: "enjoy / avoid / finish / mind / can't stand / suggest + -ing · want / decide / hope / plan / afford / agree + to + verb",
      explanation: {
        english: "When one verb follows another, the first verb decides the form. Enjoy, avoid, finish, mind, can't stand and suggest take -ing: I enjoy cooking. Want, decide, hope, plan, afford and agree take to + base verb: I want to cook. Like, love and hate can take either. There is no rule that tells you which: learn each verb with its pattern.",
        vietnamese: "Khi một động từ đi sau một động từ khác, động từ đầu quyết định dạng của động từ sau. Enjoy, avoid, finish, mind, can't stand và suggest đi với V-ing: I enjoy cooking. Want, decide, hope, plan, afford và agree đi với to + động từ nguyên mẫu: I want to cook. Like, love và hate dùng được cả hai. Không có quy tắc chung: hãy học mỗi động từ cùng cấu trúc của nó.",
      },
      examples: [
        { english: "Have you finished writing your CV?", vietnamese: "Bạn viết xong CV chưa?" },
        { english: "They hope to open a second shop next year.", vietnamese: "Họ hy vọng mở cửa hàng thứ hai vào năm sau." },
      ],
      mistake: {
        wrong: "I enjoy to read before bed.", right: "I enjoy reading before bed.",
        why: { english: "Enjoy is always followed by -ing, never to.", vietnamese: "Enjoy luôn đi với V-ing, không bao giờ đi với to." },
      },
    }, {
      title: "Preposition + -ing",
      pattern: "look forward to / keen on / good at / interested in / instead of / before / after + -ing",
      explanation: {
        english: "After a preposition, a verb always takes -ing. Be careful with look forward to: to is a preposition here, so it is followed by -ing or a noun, not a base verb. This is a very common line in emails: I look forward to hearing from you.",
        vietnamese: "Sau giới từ, động từ luôn ở dạng V-ing. Cẩn thận với look forward to: to ở đây là giới từ, nên theo sau là V-ing hoặc danh từ, không phải động từ nguyên mẫu. Đây là câu rất hay gặp trong email: I look forward to hearing from you.",
      },
      examples: [
        { english: "He's good at explaining difficult ideas.", vietnamese: "Anh ấy giỏi giải thích những ý tưởng khó." },
        { english: "Let's walk instead of taking a taxi.", vietnamese: "Mình đi bộ thay vì đi taxi nhé." },
      ],
      mistake: {
        wrong: "I look forward to hear from you.", right: "I look forward to hearing from you.",
        why: { english: "To in look forward to is a preposition, so the verb takes -ing.", vietnamese: "To trong look forward to là giới từ, nên động từ phải thêm -ing." },
      },
    }],
    examples: [
      { english: "I can't afford to go on holiday this year.", vietnamese: "Năm nay tôi không đủ tiền đi nghỉ." },
      { english: "She avoids eating late at night.", vietnamese: "Cô ấy tránh ăn khuya." },
      { english: "Would you mind closing the window?", vietnamese: "Phiền bạn đóng cửa sổ giúp được không?" },
      { english: "I keep putting off learning to drive.", vietnamese: "Tôi cứ trì hoãn việc học lái xe mãi." },
    ],
    dialogue: [
      { speaker: "Emma", english: "What do you enjoy doing at the weekend, Khoa?", vietnamese: "Cuối tuần Khoa thích làm gì?" },
      { speaker: "Khoa", english: "I'm keen on cycling, so I usually ride out of the city.", vietnamese: "Mình mê đạp xe, nên thường đạp ra ngoại thành." },
      { speaker: "Emma", english: "Don't you mind riding in the traffic?", vietnamese: "Bạn không ngại đạp xe giữa dòng xe cộ à?" },
      { speaker: "Khoa", english: "I can't stand it, so I avoid going on busy roads.", vietnamese: "Mình không chịu nổi, nên mình tránh đi đường đông." },
      { speaker: "Emma", english: "I've decided to buy a bike too.", vietnamese: "Mình cũng quyết định mua một chiếc xe đạp." },
      { speaker: "Khoa", english: "Great! I'm looking forward to riding together.", vietnamese: "Tuyệt! Mình mong được đạp xe cùng bạn." },
    ],
    practice: [
      q("Complete: I enjoy ___ to podcasts.", ["listening", "to listen", "listen", "listened"], "listening", "Enjoy + -ing."),
      q("Complete: We've decided ___ a new car.", ["to buy", "buying", "buy", "bought"], "to buy", "Decide + to + base verb."),
      q("Complete: I look forward to ___ you.", ["meeting", "meet", "met", "to meet"], "meeting", "Look forward to + -ing."),
      q("“Không chịu nổi” in English is…", ["can't stand", "can't stay", "don't stand", "can't sit"], "can't stand", "Can't stand = hate."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["Would you mind opening the door?", "Would you mind to open the door?", "Would you mind open the door?", "Would you mind for opening the door?"], "Would you mind opening the door?", "Mind + -ing."),
      q("Complete: They can't afford ___ in the city centre.", ["to live", "living", "live", "lived"], "to live", "Afford + to + base verb."),
      q("Complete: She's keen ___ learning new languages.", ["on", "in", "at", "of"], "on", "Keen on + -ing."),
      q("Complete: Brush your teeth before ___ to bed.", ["going", "go", "to go", "went"], "going", "After a preposition: -ing."),
      q("What does “put off” mean?", ["decide to do something later", "wear clothes", "switch on", "finish quickly"], "decide to do something later", "Put off = postpone."),
    ],
  }, {
    key: "job-interview", title: "At a Job Interview", titleVi: "Phỏng vấn xin việc",
    objectives: [
      "I can talk about my qualifications, strengths and experience in an interview.",
      "Use have experience in, be good at and be responsible for",
      "Ask polite questions: Could you tell me what the salary is?",
    ],
    vocabulary: [
      { word: "apply for", ipa: "/əˈplaɪ fə/", partOfSpeech: "phrasal verb", vietnamese: "ứng tuyển, nộp đơn xin", definition: "to ask formally for a job, a place at a university, etc.", example: { english: "I'm applying for a job in marketing.", vietnamese: "Tôi đang ứng tuyển một vị trí trong ngành marketing." } },
      { word: "CV", ipa: "/ˌsiː ˈviː/", partOfSpeech: "noun", vietnamese: "sơ yếu lý lịch", definition: "a document listing your education and work experience (British English)", example: { english: "Please send your CV and a covering letter.", vietnamese: "Vui lòng gửi CV và thư xin việc." } },
      { word: "qualifications", ipa: "/ˌkwɒlɪfɪˈkeɪʃnz/", partOfSpeech: "noun", vietnamese: "bằng cấp, trình độ chuyên môn", definition: "exams you have passed or courses you have finished", example: { english: "What qualifications do you need for this job?", vietnamese: "Công việc này cần bằng cấp gì?" } },
      { word: "strength", ipa: "/streŋθ/", partOfSpeech: "noun", vietnamese: "điểm mạnh", definition: "a good quality or ability that someone has", example: { english: "My main strength is communication.", vietnamese: "Điểm mạnh chính của tôi là giao tiếp." } },
      { word: "weakness", ipa: "/ˈwiːknəs/", partOfSpeech: "noun", vietnamese: "điểm yếu", definition: "a quality or ability that is not as good as it should be", example: { english: "One weakness is that I find it hard to say no.", vietnamese: "Một điểm yếu là tôi khó từ chối người khác." } },
      { word: "salary", ipa: "/ˈsæləri/", partOfSpeech: "noun", vietnamese: "lương", definition: "the money you are paid every month or year for your job", example: { english: "The salary is paid at the end of each month.", vietnamese: "Lương được trả vào cuối mỗi tháng." } },
      { word: "responsible for", ipa: "/rɪˈspɒnsəbl fə/", partOfSpeech: "adjective", vietnamese: "chịu trách nhiệm", definition: "having the job of doing or looking after something", example: { english: "I was responsible for training new staff.", vietnamese: "Tôi chịu trách nhiệm đào tạo nhân viên mới." } },
      { word: "team player", ipa: "/ˈtiːm ˌpleɪə/", partOfSpeech: "noun", vietnamese: "người có tinh thần đồng đội", definition: "someone who works well with other people", example: { english: "We're looking for a real team player.", vietnamese: "Chúng tôi đang tìm một người thật sự có tinh thần đồng đội." } },
    ],
    grammar: [{
      title: "Talking about your experience",
      pattern: "I have experience in + noun / -ing · I'm good at + -ing · I was responsible for + noun / -ing",
      explanation: {
        english: "In an interview, describe your experience with fixed phrases and the right preposition: experience in (an area), good at (a skill), responsible for (a task). Each is followed by a noun or -ing. Give an example after each claim: I'm good at solving problems. For example, …",
        vietnamese: "Khi phỏng vấn, hãy mô tả kinh nghiệm bằng các cụm cố định với đúng giới từ: experience in (một lĩnh vực), good at (một kỹ năng), responsible for (một nhiệm vụ). Theo sau là danh từ hoặc V-ing. Hãy đưa ví dụ sau mỗi điều bạn nói: I'm good at solving problems. For example, …",
      },
      examples: [
        { english: "I have three years' experience in customer service.", vietnamese: "Tôi có ba năm kinh nghiệm trong dịch vụ khách hàng." },
        { english: "In my last job I was responsible for managing the budget.", vietnamese: "Ở công việc trước, tôi chịu trách nhiệm quản lý ngân sách." },
      ],
      mistake: {
        wrong: "I have experience about marketing.", right: "I have experience in marketing.",
        why: { english: "Experience goes with in (an area), not about.", vietnamese: "Experience đi với in (một lĩnh vực), không đi với about." },
      },
    }, {
      title: "Polite indirect questions",
      pattern: "Could you tell me + question word + subject + verb? · Do you know if / whether …?",
      explanation: {
        english: "To ask politely, start with Could you tell me…? or Do you know…?, then use normal sentence order (subject before verb), with no do / does / did: Could you tell me when the job starts? For yes / no questions, add if: Do you know if there is a dress code?",
        vietnamese: "Để hỏi lịch sự, mở đầu bằng Could you tell me…? hoặc Do you know…?, rồi dùng trật tự câu bình thường (chủ ngữ trước động từ), không có do / does / did: Could you tell me when the job starts? Với câu hỏi có / không, thêm if: Do you know if there is a dress code?",
      },
      examples: [
        { english: "Could you tell me how many people work in the team?", vietnamese: "Anh / chị có thể cho tôi biết nhóm có bao nhiêu người không?" },
        { english: "Do you know when I will hear from you?", vietnamese: "Anh / chị có biết khi nào tôi nhận được phản hồi không?" },
      ],
      mistake: {
        wrong: "Could you tell me what is the salary?", right: "Could you tell me what the salary is?",
        why: { english: "Inside an indirect question, the verb comes after the subject, as in a normal sentence.", vietnamese: "Trong câu hỏi gián tiếp, động từ đứng sau chủ ngữ, như câu bình thường." },
      },
    }],
    examples: [
      { english: "I'd like to apply for the position of sales assistant.", vietnamese: "Tôi muốn ứng tuyển vị trí trợ lý bán hàng." },
      { english: "My biggest strength is that I'm a team player.", vietnamese: "Điểm mạnh lớn nhất của tôi là tinh thần đồng đội." },
      { english: "Could you tell me what qualifications I need?", vietnamese: "Anh / chị có thể cho tôi biết tôi cần bằng cấp gì không?" },
      { english: "I've attached my CV to this email.", vietnamese: "Tôi đã đính kèm CV trong email này." },
    ],
    dialogue: [
      { speaker: "Interviewer", english: "Why did you apply for this job?", vietnamese: "Vì sao bạn ứng tuyển công việc này?" },
      { speaker: "Vy", english: "I have four years' experience in event planning, and I love working with people.", vietnamese: "Tôi có bốn năm kinh nghiệm tổ chức sự kiện, và tôi rất thích làm việc với mọi người." },
      { speaker: "Interviewer", english: "What would you say is your greatest weakness?", vietnamese: "Bạn nghĩ điểm yếu lớn nhất của mình là gì?" },
      { speaker: "Vy", english: "I sometimes take on too much, but I'm getting better at saying no.", vietnamese: "Đôi khi tôi nhận quá nhiều việc, nhưng tôi đang tiến bộ trong việc biết từ chối." },
      { speaker: "Interviewer", english: "Do you have any questions for us?", vietnamese: "Bạn có câu hỏi nào cho chúng tôi không?" },
      { speaker: "Vy", english: "Yes. Could you tell me when the job starts?", vietnamese: "Có ạ. Anh / chị có thể cho tôi biết khi nào bắt đầu làm việc không?" },
    ],
    practice: [
      q("Complete: I'm applying ___ a job at a bank.", ["for", "to", "on", "in"], "for", "Apply for a job."),
      q("Complete: I have experience ___ teaching children.", ["in", "about", "of", "on"], "in", "Experience in."),
      q("“Sơ yếu lý lịch” in British English is…", ["CV", "résumé paper", "profile letter", "bio card"], "CV", "British English: CV."),
      q("Complete: I was responsible ___ the company's social media.", ["for", "of", "with", "to"], "for", "Responsible for."),
    ],
    challenge: [
      q("Choose the correct question.", ["Could you tell me where the office is?", "Could you tell me where is the office?", "Could you tell me where does the office be?", "Could you tell me where the office it is?"], "Could you tell me where the office is?", "Indirect question: subject + verb."),
      q("Choose the correct question.", ["Do you know if the job includes weekends?", "Do you know does the job include weekends?", "Do you know if does the job include weekends?", "Do you know the job includes if weekends?"], "Do you know if the job includes weekends?", "Yes / no indirect question: if + subject + verb."),
      q("Complete: I'm good at ___ under pressure.", ["working", "work", "to work", "worked"], "working", "Good at + -ing."),
      q("What is a “team player”?", ["someone who works well with others", "a football fan", "a manager", "someone who works alone"], "someone who works well with others", "Team player = good in a team."),
      q("Complete: Could you tell me how much the salary ___?", ["is", "does", "be", "is it"], "is", "Normal order at the end: the salary is."),
    ],
  }, {
    key: "formal-emails", title: "Writing a Formal Email", titleVi: "Viết email trang trọng",
    objectives: [
      "I can write a short formal email to ask, apologise or reply.",
      "Open and close formal emails correctly: Dear Sir or Madam … Yours faithfully",
      "Use I'm writing to and polite requests instead of direct commands",
    ],
    vocabulary: [
      { word: "regarding", ipa: "/rɪˈɡɑːdɪŋ/", partOfSpeech: "preposition", vietnamese: "về việc, liên quan đến", definition: "about (formal)", example: { english: "I'm writing regarding your advertisement.", vietnamese: "Tôi viết thư này về mẩu quảng cáo của quý công ty." } },
      { word: "enquire", ipa: "/ɪnˈkwaɪə/", partOfSpeech: "verb", vietnamese: "hỏi thông tin", definition: "to ask for information (formal, British spelling)", example: { english: "I'm writing to enquire about your evening classes.", vietnamese: "Tôi viết thư để hỏi về các lớp học buổi tối." } },
      { word: "attached", ipa: "/əˈtætʃt/", partOfSpeech: "adjective", vietnamese: "được đính kèm", definition: "sent with an email as a separate file", example: { english: "Please find attached my application form.", vietnamese: "Xin gửi kèm theo đây đơn đăng ký của tôi." } },
      { word: "apologise", ipa: "/əˈpɒlədʒaɪz/", partOfSpeech: "verb", vietnamese: "xin lỗi", definition: "to say you are sorry (British spelling)", example: { english: "I apologise for the late reply.", vietnamese: "Tôi xin lỗi vì trả lời muộn." } },
      { word: "inconvenience", ipa: "/ˌɪnkənˈviːniəns/", partOfSpeech: "noun", vietnamese: "sự bất tiện", definition: "trouble or problems caused for someone", example: { english: "We are sorry for any inconvenience.", vietnamese: "Chúng tôi xin lỗi vì mọi sự bất tiện." } },
      { word: "available", ipa: "/əˈveɪləbl/", partOfSpeech: "adjective", vietnamese: "có sẵn; rảnh", definition: "able to be used or seen; free to do something", example: { english: "I am available for an interview next week.", vietnamese: "Tôi có thể tham gia phỏng vấn vào tuần sau." } },
      { word: "Yours faithfully", ipa: "/ˌjɔːz ˈfeɪθfəli/", partOfSpeech: "phrase", vietnamese: "Kính thư (khi không biết tên người nhận)", definition: "the ending of a formal email that begins Dear Sir or Madam", example: { english: "Yours faithfully, Nguyen Van An", vietnamese: "Kính thư, Nguyễn Văn An" } },
      { word: "Yours sincerely", ipa: "/ˌjɔːz sɪnˈsɪəli/", partOfSpeech: "phrase", vietnamese: "Trân trọng (khi biết tên người nhận)", definition: "the ending of a formal email that begins with the person's name", example: { english: "Yours sincerely, Tran Thi Mai", vietnamese: "Trân trọng, Trần Thị Mai" } },
    ],
    grammar: [{
      title: "Formal phrases",
      pattern: "I'm writing to + verb · I would be grateful if you could … · Could you please …? · Please find attached …",
      explanation: {
        english: "Start a formal email by saying why you are writing: I'm writing to enquire / apply / complain. Ask for things politely: I would be grateful if you could send me… Avoid short forms and slang in very formal emails: I am, not I'm; would like, not want.",
        vietnamese: "Mở đầu email trang trọng bằng lý do bạn viết: I'm writing to enquire / apply / complain. Đề nghị một cách lịch sự: I would be grateful if you could send me… Tránh viết tắt và từ lóng trong email rất trang trọng: dùng I am, không dùng I'm; dùng would like, không dùng want.",
      },
      examples: [
        { english: "I am writing to apply for the position of receptionist.", vietnamese: "Tôi viết thư này để ứng tuyển vị trí lễ tân." },
        { english: "I would be grateful if you could reply by Friday.", vietnamese: "Tôi sẽ rất cảm kích nếu anh / chị có thể trả lời trước thứ Sáu." },
      ],
      mistake: {
        wrong: "I write to ask about the course.", right: "I'm writing to ask about the course.",
        why: { english: "For the reason you are writing now, English uses the present continuous: I'm writing to…", vietnamese: "Để nói lý do bạn đang viết, tiếng Anh dùng hiện tại tiếp diễn: I'm writing to…" },
      },
    }, {
      title: "Opening and closing",
      pattern: "Dear Sir or Madam → Yours faithfully · Dear Ms Taylor → Yours sincerely · Hi Tom → Best wishes",
      explanation: {
        english: "If you don't know the person's name, begin Dear Sir or Madam and end Yours faithfully. If you know the name, begin Dear Mr / Ms + family name and end Yours sincerely. In British English, Mr and Ms have no full stop. With colleagues you know, Best wishes or Kind regards is fine.",
        vietnamese: "Nếu không biết tên người nhận, mở đầu bằng Dear Sir or Madam và kết thúc bằng Yours faithfully. Nếu biết tên, mở đầu bằng Dear Mr / Ms + họ và kết thúc bằng Yours sincerely. Trong tiếng Anh Anh, Mr và Ms không có dấu chấm. Với đồng nghiệp quen biết, dùng Best wishes hoặc Kind regards là được.",
      },
      examples: [
        { english: "Dear Ms Taylor, Thank you for your email of 3 May.", vietnamese: "Kính gửi chị Taylor, Cảm ơn email ngày 3 tháng 5 của chị." },
        { english: "Kind regards, Linh", vietnamese: "Trân trọng, Linh" },
      ],
      mistake: {
        wrong: "Dear Sir or Madam, … Yours sincerely", right: "Dear Sir or Madam, … Yours faithfully",
        why: { english: "When you don't know the name, the British ending is Yours faithfully.", vietnamese: "Khi không biết tên người nhận, cách kết thư kiểu Anh là Yours faithfully." },
      },
    }],
    examples: [
      { english: "I am writing regarding my order, which has not arrived.", vietnamese: "Tôi viết thư về đơn hàng của tôi, đến nay vẫn chưa nhận được." },
      { english: "Please find attached a copy of my certificate.", vietnamese: "Xin gửi kèm bản sao chứng chỉ của tôi." },
      { english: "We apologise for any inconvenience this may cause.", vietnamese: "Chúng tôi xin lỗi vì mọi sự bất tiện có thể gây ra." },
      { english: "Could you please let me know if the room is still available?", vietnamese: "Anh / chị vui lòng cho tôi biết phòng còn trống không?" },
    ],
    dialogue: [
      { speaker: "Hanh", english: "Can you check my email? It's to a language school.", vietnamese: "Anh xem giúp em email này được không? Em gửi cho một trường ngôn ngữ." },
      { speaker: "Mark", english: "Sure. Do you know the name of the person?", vietnamese: "Được chứ. Em có biết tên người nhận không?" },
      { speaker: "Hanh", english: "No, so I started with Dear Sir or Madam.", vietnamese: "Không ạ, nên em mở đầu bằng Dear Sir or Madam." },
      { speaker: "Mark", english: "Good. Then end with Yours faithfully, not Yours sincerely.", vietnamese: "Tốt. Vậy kết thư bằng Yours faithfully, không phải Yours sincerely." },
      { speaker: "Hanh", english: "And is “I want information about your courses” OK?", vietnamese: "Còn câu “I want information about your courses” có được không ạ?" },
      { speaker: "Mark", english: "Make it more polite: I'm writing to enquire about your courses.", vietnamese: "Viết lịch sự hơn: I'm writing to enquire about your courses." },
    ],
    practice: [
      q("Complete: I'm writing to ___ about the job.", ["enquire", "enquiring", "enquired", "enquiry"], "enquire", "I'm writing to + base verb."),
      q("You don't know the name. End with…", ["Yours faithfully", "Yours sincerely", "Love", "See you"], "Yours faithfully", "Dear Sir or Madam → Yours faithfully."),
      q("“Xin gửi kèm theo đây” in an email is…", ["Please find attached", "Please look in", "Please see the attach", "Find the attaching"], "Please find attached", "A fixed formal phrase."),
      q("Choose the most polite request.", ["I would be grateful if you could call me.", "Call me.", "You must call me.", "I want you call me."], "I would be grateful if you could call me.", "Polite: I would be grateful if you could…"),
    ],
    challenge: [
      q("Complete: I apologise ___ the delay.", ["for", "about", "of", "to"], "for", "Apologise for."),
      q("Begin with “Dear Mr Brown”. End with…", ["Yours sincerely", "Yours faithfully", "Cheers", "Bye"], "Yours sincerely", "You know the name: Yours sincerely."),
      q("Choose the correct sentence.", ["I am writing regarding the meeting.", "I am writing regarding to the meeting.", "I write regarding the meeting.", "I am writing regard the meeting."], "I am writing regarding the meeting.", "Regarding + noun, no to."),
      q("What does “available” mean in “I am available on Monday”?", ["free to do something", "busy", "late", "absent"], "free to do something", "Available = free."),
      q("Which is the British form?", ["Dear Ms Taylor", "Dear Ms. Taylor", "Dear Miss. Taylor", "Dear M.s Taylor"], "Dear Ms Taylor", "British English: no full stop after Ms or Mr."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 2", isReview: true,
    objectives: [
      "I can talk about my past, my feelings, my work and write a formal email accurately.",
      "Check used to / be used to, -ed / -ing, verb patterns, indirect questions and formal endings",
    ],
    vocabulary: [
      { word: "used to", ipa: "/ˈjuːst tə/", partOfSpeech: "phrase", vietnamese: "từng, đã từng (thói quen trong quá khứ)", definition: "used for something that was true or happened often in the past but not now", example: { english: "We used to go fishing with Grandad.", vietnamese: "Chúng tôi từng đi câu cá với ông." } },
      { word: "bored", ipa: "/bɔːd/", partOfSpeech: "adjective", vietnamese: "thấy chán", definition: "feeling unhappy because nothing is interesting", example: { english: "The children get bored on long journeys.", vietnamese: "Bọn trẻ thấy chán trên những chuyến đi dài." } },
      { word: "look forward to", ipa: "/ˌlʊk ˈfɔːwəd tə/", partOfSpeech: "phrasal verb", vietnamese: "mong chờ", definition: "to feel happy about something that is going to happen", example: { english: "We look forward to welcoming you.", vietnamese: "Chúng tôi mong được đón tiếp quý khách." } },
      { word: "apply for", ipa: "/əˈplaɪ fə/", partOfSpeech: "phrasal verb", vietnamese: "ứng tuyển, nộp đơn xin", definition: "to ask formally for a job, a place at a university, etc.", example: { english: "She applied for a scholarship.", vietnamese: "Cô ấy đã nộp đơn xin học bổng." } },
      { word: "strength", ipa: "/streŋθ/", partOfSpeech: "noun", vietnamese: "điểm mạnh", definition: "a good quality or ability that someone has", example: { english: "Patience is one of his strengths.", vietnamese: "Kiên nhẫn là một trong những điểm mạnh của anh ấy." } },
      { word: "enquire", ipa: "/ɪnˈkwaɪə/", partOfSpeech: "verb", vietnamese: "hỏi thông tin", definition: "to ask for information (formal, British spelling)", example: { english: "Several people have enquired about the flat.", vietnamese: "Đã có vài người hỏi về căn hộ." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "used to + verb ≠ be used to + -ing · bored ≠ boring · enjoy + -ing, decide + to · Could you tell me what it is? · Dear Sir or Madam → Yours faithfully",
      explanation: {
        english: "Check these: used to + base verb is a past habit, be used to + -ing is “quen với”; -ed adjectives are feelings, -ing adjectives are causes; some verbs take -ing (enjoy, avoid, mind) and some take to (want, decide, afford), and prepositions always take -ing (look forward to hearing); indirect questions keep normal order (what the salary is); Dear Sir or Madam ends Yours faithfully.",
        vietnamese: "Hãy kiểm tra: used to + động từ nguyên mẫu là thói quen trong quá khứ, be used to + V-ing là “quen với”; tính từ -ed là cảm giác, tính từ -ing là nguyên nhân; có động từ đi với V-ing (enjoy, avoid, mind), có động từ đi với to (want, decide, afford), và sau giới từ luôn là V-ing (look forward to hearing); câu hỏi gián tiếp giữ trật tự bình thường (what the salary is); Dear Sir or Madam kết thúc bằng Yours faithfully.",
      },
      examples: [
        { english: "I used to hate public speaking, but now I'm used to giving presentations.", vietnamese: "Tôi từng ghét nói trước đám đông, nhưng giờ tôi đã quen thuyết trình." },
        { english: "The course was interesting, and I'm looking forward to starting the next one.", vietnamese: "Khoá học rất thú vị, và tôi mong được bắt đầu khoá tiếp theo." },
      ],
    }],
    examples: [
      { english: "I'm applying for jobs abroad because I'm bored with my routine.", vietnamese: "Tôi đang ứng tuyển việc ở nước ngoài vì chán thói quen hằng ngày." },
      { english: "Could you tell me what my main strength is?", vietnamese: "Anh / chị có thể cho tôi biết điểm mạnh chính của tôi là gì không?" },
      { english: "I am writing to enquire about the training programme.", vietnamese: "Tôi viết thư để hỏi về chương trình đào tạo." },
    ],
    dialogue: [
      { speaker: "Lucy", english: "How's the job hunt going, Duy?", vietnamese: "Việc tìm việc thế nào rồi, Duy?" },
      { speaker: "Duy", english: "I've applied for five jobs. I used to hate writing applications.", vietnamese: "Mình nộp đơn năm chỗ rồi. Trước mình ghét viết đơn lắm." },
      { speaker: "Lucy", english: "And now?", vietnamese: "Thế còn bây giờ?" },
      { speaker: "Duy", english: "I'm used to it. The interviews are the stressful part.", vietnamese: "Mình quen rồi. Phỏng vấn mới là phần căng thẳng." },
      { speaker: "Lucy", english: "Are you nervous about tomorrow's?", vietnamese: "Bạn có lo về buổi phỏng vấn ngày mai không?" },
      { speaker: "Duy", english: "A bit, but I'm looking forward to meeting the team.", vietnamese: "Hơi hơi, nhưng mình mong được gặp nhóm làm việc." },
      { speaker: "Lucy", english: "Remember to ask them what the next step is.", vietnamese: "Nhớ hỏi họ bước tiếp theo là gì nhé." },
    ],
    practice: [
      q("Complete: I ___ live in Can Tho. Now I live in Hanoi.", ["used to", "am used to", "use to", "was used to"], "used to", "Past state: used to + base verb."),
      q("Complete: The film was so ___ that I fell asleep.", ["boring", "bored", "bore", "boredom"], "boring", "The film caused the feeling: -ing."),
      q("Complete: She avoids ___ coffee after 3 p.m.", ["drinking", "to drink", "drink", "drank"], "drinking", "Avoid + -ing."),
      q("Complete: Dear Sir or Madam … Yours ___", ["faithfully", "sincerely", "truly yours", "lovely"], "faithfully", "No name: Yours faithfully."),
    ],
    challenge: [
      q("Complete: I'm not used to ___ so early.", ["getting up", "get up", "got up", "to get up"], "getting up", "Be used to + -ing."),
      q("Choose the correct question.", ["Do you know what time the bank opens?", "Do you know what time does the bank open?", "Do you know what time opens the bank?", "Do you know the bank opens what time?"], "Do you know what time the bank opens?", "Indirect question: subject + verb."),
      q("Complete: We can't afford ___ a new sofa.", ["to buy", "buying", "buy", "bought"], "to buy", "Afford + to."),
      q("Complete: I'm interested ___ joining the club.", ["in", "on", "at", "for"], "in", "Interested in + -ing."),
      q("Choose the correct sentence.", ["I look forward to hearing from you.", "I look forward to hear from you.", "I look forward hearing from you.", "I'm look forward to hearing from you."], "I look forward to hearing from you.", "Look forward to + -ing."),
    ],
  }],
  assessment: [
    { id: "used-to-habit", prompt: "Complete: When I was a student, I ___ work in a café.", options: ["used to", "was used to", "am used to", "use to"], correct: "used to", explanation: "Past habit: used to + base verb." },
    { id: "didnt-use-to", prompt: "Choose the correct sentence.", options: ["He didn't use to like sport.", "He didn't used to like sport.", "He wasn't used to like sport.", "He used not liking sport."], correct: "He didn't use to like sport.", explanation: "Didn't + use to." },
    { id: "be-used-to", prompt: "Complete: I'm used to ___ in a noisy office.", options: ["working", "work", "worked", "to work"], correct: "working", explanation: "Be used to + -ing." },
    { id: "ed-feeling", prompt: "“Tôi thấy rất hào hứng” in English is…", options: ["I'm very excited.", "I'm very exciting.", "I very excite.", "I'm very excitement."], correct: "I'm very excited.", explanation: "Your feeling: -ed." },
    { id: "ing-cause", prompt: "Complete: The match was really ___. We were on our feet the whole time.", options: ["exciting", "excited", "excite", "excitement"], correct: "exciting", explanation: "The match caused the feeling: -ing." },
    { id: "adjective-preposition", prompt: "Complete: We were disappointed ___ the service.", options: ["with", "of", "on", "at"], correct: "with", explanation: "Disappointed with." },
    { id: "enjoy-ing", prompt: "Complete: Do you enjoy ___ new people?", options: ["meeting", "to meet", "meet", "met"], correct: "meeting", explanation: "Enjoy + -ing." },
    { id: "decide-to", prompt: "Complete: She decided ___ her job.", options: ["to quit", "quitting", "quit", "quitted"], correct: "to quit", explanation: "Decide + to." },
    { id: "preposition-ing", prompt: "Complete: Thank you for ___ me.", options: ["helping", "help", "to help", "helped"], correct: "helping", explanation: "After a preposition: -ing." },
    { id: "experience-in", prompt: "Complete: I have five years' experience ___ sales.", options: ["in", "about", "of", "with"], correct: "in", explanation: "Experience in." },
    { id: "indirect-question", prompt: "Choose the correct question.", options: ["Could you tell me where the meeting room is?", "Could you tell me where is the meeting room?", "Could you tell me where does the meeting room is?", "Could you tell me is where the meeting room?"], correct: "Could you tell me where the meeting room is?", explanation: "Indirect question: subject + verb." },
    { id: "indirect-if", prompt: "Complete: Do you know ___ the shop is open on Sundays?", options: ["if", "does", "is", "what"], correct: "if", explanation: "Yes / no indirect question: if." },
    { id: "writing-to", prompt: "Choose the best opening for a formal email.", options: ["I am writing to enquire about your courses.", "I write to enquire about your courses.", "I want to know your courses.", "Hey, tell me about your courses."], correct: "I am writing to enquire about your courses.", explanation: "Formal: I am writing to + base verb." },
    { id: "faithfully", prompt: "An email begins “Dear Sir or Madam”. It ends…", options: ["Yours faithfully", "Yours sincerely", "Best friend", "Lots of love"], correct: "Yours faithfully", explanation: "No name: Yours faithfully." },
    { id: "apologise-for", prompt: "Complete: We apologise ___ any inconvenience.", options: ["for", "about", "to", "with"], correct: "for", explanation: "Apologise for." },
  ],
};
