// B1 Unit 1: Experiences & Achievements. Vietnamese marks the past with "đã" and "chưa" whether or not a time is
// given, so learners write "Did you ever go…?", "I didn't finish yet", "I have graduated in 2020" and "I am learning
// English for five years". This unit sorts out when English needs the present perfect, simple and continuous.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B1",
  number: 1,
  lessons: [{
    key: "have-you-ever", title: "Have You Ever…?", titleVi: "Bạn đã bao giờ…?",
    objectives: [
      "I can ask and talk about experiences in my life.",
      "Use Have you ever…? and I've never… for experiences",
      "Choose between been to and gone to",
    ],
    vocabulary: [
      { word: "experience", ipa: "/ɪkˈspɪəriəns/", partOfSpeech: "noun", vietnamese: "trải nghiệm", definition: "something that happens to you and affects how you feel", example: { english: "Living abroad was an amazing experience.", vietnamese: "Sống ở nước ngoài là một trải nghiệm tuyệt vời." } },
      { word: "abroad", ipa: "/əˈbrɔːd/", partOfSpeech: "adverb", vietnamese: "ở nước ngoài, ra nước ngoài", definition: "in or to a foreign country", example: { english: "Have you ever studied abroad?", vietnamese: "Bạn đã bao giờ du học chưa?" } },
      { word: "ever", ipa: "/ˈevə/", partOfSpeech: "adverb", vietnamese: "bao giờ, từng", definition: "at any time in your life, used in questions", example: { english: "Have you ever eaten durian?", vietnamese: "Bạn đã bao giờ ăn sầu riêng chưa?" } },
      { word: "never", ipa: "/ˈnevə/", partOfSpeech: "adverb", vietnamese: "chưa bao giờ", definition: "not at any time", example: { english: "I've never seen snow.", vietnamese: "Tôi chưa bao giờ thấy tuyết." } },
      { word: "once", ipa: "/wʌns/", partOfSpeech: "adverb", vietnamese: "một lần", definition: "one time", example: { english: "I've been to Singapore once, for work.", vietnamese: "Tôi đã đến Singapore một lần, đi công tác." } },
      { word: "try", ipa: "/traɪ/", partOfSpeech: "verb", vietnamese: "thử", definition: "to do or eat something to see what it is like", example: { english: "Have you tried fish and chips?", vietnamese: "Bạn đã thử món cá và khoai tây chiên chưa?" } },
      { word: "bucket list", ipa: "/ˈbʌkɪt lɪst/", partOfSpeech: "noun", vietnamese: "danh sách những việc muốn làm trong đời", definition: "a list of things you want to do before you die", example: { english: "Seeing the Northern Lights is on my bucket list.", vietnamese: "Ngắm cực quang nằm trong danh sách những việc tôi muốn làm trong đời." } },
      { word: "unforgettable", ipa: "/ˌʌnfəˈɡetəbl/", partOfSpeech: "adjective", vietnamese: "khó quên", definition: "so special that you will always remember it", example: { english: "Our trip to Ha Long Bay was unforgettable.", vietnamese: "Chuyến đi vịnh Hạ Long của chúng tôi thật khó quên." } },
    ],
    grammar: [{
      title: "Have you ever…?",
      pattern: "Have you ever + past participle? · I've + past participle (once / twice / three times) · I've never + past participle",
      explanation: {
        english: "To talk about experiences in your life, with no time given, use the present perfect: have / has + past participle. Ask with ever and answer with never, once, twice or three times. As soon as you say when, change to the past simple: I've been to Japan. I went there in 2022.",
        vietnamese: "Để nói về trải nghiệm trong đời mà không nêu thời gian, dùng thì hiện tại hoàn thành: have / has + quá khứ phân từ. Hỏi bằng ever và trả lời bằng never, once, twice hoặc three times. Khi đã nói rõ lúc nào thì chuyển sang quá khứ đơn: I've been to Japan. I went there in 2022.",
      },
      examples: [
        { english: "Have you ever ridden a horse? No, never.", vietnamese: "Bạn đã bao giờ cưỡi ngựa chưa? Chưa bao giờ." },
        { english: "She's climbed Fansipan twice.", vietnamese: "Cô ấy đã leo Fansipan hai lần." },
      ],
      mistake: {
        wrong: "Did you ever go to England?", right: "Have you ever been to England?",
        why: { english: "Vietnamese uses “đã bao giờ” for any past time, but for experiences in your life (no time given), English uses the present perfect.", vietnamese: "Tiếng Việt dùng “đã bao giờ” cho mọi thời điểm trong quá khứ, nhưng với trải nghiệm trong đời (không nêu thời gian), tiếng Anh dùng thì hiện tại hoàn thành." },
      },
    }, {
      title: "Been to or gone to?",
      pattern: "She's been to Da Nang (and come back) · She's gone to Da Nang (she's there now)",
      explanation: {
        english: "Been to means you went somewhere and came back: it is an experience. Gone to means someone went and is still there or on the way. So you can say I've been to London, but not I've gone to London when you are talking to someone at home.",
        vietnamese: "Been to nghĩa là đã đến một nơi và đã quay về: đó là một trải nghiệm. Gone to nghĩa là ai đó đã đi và hiện vẫn đang ở đó hoặc đang trên đường. Vì vậy có thể nói I've been to London, nhưng không nói I've gone to London khi bạn đang ở nhà nói chuyện với người khác.",
      },
      examples: [
        { english: "Where's Minh? He's gone to the bank. He'll be back soon.", vietnamese: "Minh đâu rồi? Anh ấy ra ngân hàng rồi. Lát nữa anh ấy về." },
        { english: "I've been to Thailand three times.", vietnamese: "Tôi đã đến Thái Lan ba lần." },
      ],
      mistake: {
        wrong: "I've gone to Paris twice.", right: "I've been to Paris twice.",
        why: { english: "You are back home, so the trips are experiences: use been to. Gone to means you are still there.", vietnamese: "Bạn đã về nhà, nên các chuyến đi là trải nghiệm: dùng been to. Gone to nghĩa là bạn vẫn còn ở đó." },
      },
    }],
    examples: [
      { english: "I've never travelled abroad, but it's on my bucket list.", vietnamese: "Tôi chưa bao giờ ra nước ngoài, nhưng việc đó nằm trong danh sách những điều tôi muốn làm." },
      { english: "Have you ever tried Marmite? Once, and I hated it.", vietnamese: "Bạn đã thử Marmite bao giờ chưa? Một lần, và tôi ghét nó." },
      { english: "My parents have been to Europe twice.", vietnamese: "Bố mẹ tôi đã đến châu Âu hai lần." },
      { english: "Meeting my favourite singer was an unforgettable experience.", vietnamese: "Gặp ca sĩ yêu thích là một trải nghiệm khó quên." },
    ],
    dialogue: [
      { speaker: "Sophie", english: "Have you ever been to the UK, Huy?", vietnamese: "Huy đã bao giờ đến Anh chưa?" },
      { speaker: "Huy", english: "No, never. Have you ever been to Vietnam?", vietnamese: "Chưa, chưa bao giờ. Còn bạn đã đến Việt Nam bao giờ chưa?" },
      { speaker: "Sophie", english: "Yes, once. I went to Hoi An in 2019.", vietnamese: "Rồi, một lần. Mình đến Hội An năm 2019." },
      { speaker: "Huy", english: "Did you try cao lau when you were there?", vietnamese: "Lúc ở đó bạn có ăn thử cao lầu không?" },
      { speaker: "Sophie", english: "I did! It was unforgettable. Where's your brother, by the way?", vietnamese: "Có chứ! Ngon khó quên. À mà anh trai bạn đâu rồi?" },
      { speaker: "Huy", english: "He's gone to Australia. He's studying there this year.", vietnamese: "Anh ấy đi Úc rồi. Năm nay anh ấy học ở đó." },
    ],
    practice: [
      q("Complete: Have you ever ___ to Scotland?", ["been", "gone", "went", "go"], "been", "Experience, and you came back: been to."),
      q("Choose the correct sentence.", ["I've never seen a kangaroo.", "I never have seen a kangaroo.", "I didn't ever see a kangaroo.", "I've ever seen a kangaroo."], "I've never seen a kangaroo.", "Have + never + past participle."),
      q("“Ra nước ngoài” in English is…", ["go abroad", "go to abroad", "go foreign", "go outside"], "go abroad", "Abroad is an adverb: no to."),
      q("Lan isn't here. She's ___ to the post office.", ["gone", "been", "went", "going been"], "gone", "She is still there: gone to."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["Have you ever eaten snails?", "Did you ever eat snails?", "Have you ever ate snails?", "Do you ever eaten snails?"], "Have you ever eaten snails?", "Have you ever + past participle (eaten)."),
      q("Complete: I've been to Hue ___. Once in 2018 and once last year.", ["twice", "two time", "two once", "second"], "twice", "Two times = twice."),
      q("Complete: I've been to Bangkok. I ___ there last summer.", ["went", "have gone", "have been", "go"], "went", "A finished time (last summer): past simple."),
      q("What is a “bucket list”?", ["things you want to do in your life", "a list of things to buy", "a list of jobs at home", "a list of friends"], "things you want to do in your life", "A bucket list is your life wishes."),
      q("“Have you ever been skiing?” Choose the best short answer.", ["No, I haven't.", "No, I didn't.", "No, I don't.", "No, I wasn't."], "No, I haven't.", "Answer a present perfect question with have / haven't."),
    ],
  }, {
    key: "already-just-yet", title: "Already, Just and Yet", titleVi: "Already, just và yet",
    objectives: [
      "I can say what I have and haven't done so far.",
      "Put just and already between have and the past participle",
      "Use yet in questions and negatives, and say “chưa” as haven't … yet",
    ],
    vocabulary: [
      { word: "already", ipa: "/ɔːlˈredi/", partOfSpeech: "adverb", vietnamese: "đã… rồi", definition: "before now, often sooner than expected", example: { english: "I've already booked the tickets.", vietnamese: "Tôi đã đặt vé rồi." } },
      { word: "just", ipa: "/dʒʌst/", partOfSpeech: "adverb", vietnamese: "vừa mới", definition: "a very short time ago", example: { english: "The bus has just left.", vietnamese: "Xe buýt vừa mới đi." } },
      { word: "yet", ipa: "/jet/", partOfSpeech: "adverb", vietnamese: "chưa (câu phủ định); …chưa? (câu hỏi)", definition: "until now, used at the end of questions and negative sentences", example: { english: "Have you finished your homework yet?", vietnamese: "Con làm xong bài tập chưa?" } },
      { word: "still", ipa: "/stɪl/", partOfSpeech: "adverb", vietnamese: "vẫn (còn)", definition: "continuing until now, often longer than expected", example: { english: "I still haven't heard from the bank.", vietnamese: "Tôi vẫn chưa nhận được tin gì từ ngân hàng." } },
      { word: "so far", ipa: "/ˌsəʊ ˈfɑː/", partOfSpeech: "phrase", vietnamese: "cho đến giờ", definition: "until now", example: { english: "So far I've visited three museums.", vietnamese: "Cho đến giờ tôi đã thăm ba bảo tàng." } },
      { word: "recently", ipa: "/ˈriːsntli/", partOfSpeech: "adverb", vietnamese: "gần đây", definition: "not long ago", example: { english: "Have you seen any good films recently?", vietnamese: "Gần đây bạn có xem phim nào hay không?" } },
      { word: "hand in", ipa: "/ˌhænd ˈɪn/", partOfSpeech: "phrasal verb", vietnamese: "nộp (bài)", definition: "to give your work to a teacher or a person in charge", example: { english: "Have you handed in your essay yet?", vietnamese: "Bạn đã nộp bài luận chưa?" } },
      { word: "sort out", ipa: "/ˌsɔːt ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "giải quyết, thu xếp", definition: "to deal with a problem or organise something", example: { english: "Don't worry, I've already sorted it out.", vietnamese: "Đừng lo, tôi giải quyết xong rồi." } },
    ],
    grammar: [{
      title: "Just and already",
      pattern: "have / has + just / already + past participle",
      explanation: {
        english: "Just means a very short time ago; already means before now, often earlier than someone expected. Both go between have and the past participle: I've just eaten. She's already left. Don't put them after the verb.",
        vietnamese: "Just nghĩa là vừa mới; already nghĩa là đã… rồi, thường sớm hơn người khác nghĩ. Cả hai đứng giữa have và quá khứ phân từ: I've just eaten. She's already left. Đừng đặt chúng sau động từ.",
      },
      examples: [
        { english: "I've just got home. Can I call you back?", vietnamese: "Tôi vừa về đến nhà. Lát tôi gọi lại cho bạn nhé?" },
        { english: "Don't cook. I've already ordered a pizza.", vietnamese: "Đừng nấu nữa. Tôi đặt pizza rồi." },
      ],
      mistake: {
        wrong: "I already have finished the report.", right: "I've already finished the report.",
        why: { english: "Already goes after have, not before it.", vietnamese: "Already đứng sau have, không đứng trước." },
      },
    }, {
      title: "Not … yet and still haven't",
      pattern: "Have you … yet? · I haven't … yet · I still haven't …",
      explanation: {
        english: "Vietnamese “chưa” is often haven't … yet in English, with yet at the end: I haven't eaten yet. In questions, yet means “…chưa?”: Have you eaten yet? Still haven't is stronger: it shows you expected it to happen before now.",
        vietnamese: "“Chưa” trong tiếng Việt thường là haven't … yet trong tiếng Anh, yet đứng cuối câu: I haven't eaten yet. Trong câu hỏi, yet nghĩa là “…chưa?”: Have you eaten yet? Still haven't mạnh hơn: cho thấy bạn đã mong việc đó xảy ra từ trước.",
      },
      examples: [
        { english: "Has the parcel arrived yet? No, not yet.", vietnamese: "Bưu kiện đến chưa? Chưa, vẫn chưa." },
        { english: "It's been a month and he still hasn't paid me back.", vietnamese: "Đã một tháng rồi mà anh ta vẫn chưa trả tiền tôi." },
      ],
      mistake: {
        wrong: "I didn't finish yet.", right: "I haven't finished yet.",
        why: { english: "“Chưa xong” is about now, not a finished past time, so English uses the present perfect.", vietnamese: "“Chưa xong” nói về hiện tại, không phải một thời điểm đã kết thúc, nên tiếng Anh dùng thì hiện tại hoàn thành." },
      },
    }],
    examples: [
      { english: "We've just moved in, so the flat is still a mess.", vietnamese: "Chúng tôi vừa chuyển vào nên căn hộ vẫn còn bừa bộn." },
      { english: "Have you sorted out your visa yet?", vietnamese: "Bạn đã lo xong visa chưa?" },
      { english: "So far this year I've read six books.", vietnamese: "Từ đầu năm đến giờ tôi đã đọc sáu cuốn sách." },
      { english: "I've already handed in my project, but Nam hasn't started his yet.", vietnamese: "Tôi đã nộp dự án rồi, nhưng Nam vẫn chưa bắt đầu." },
    ],
    dialogue: [
      { speaker: "Mai", english: "Have you packed for the trip yet?", vietnamese: "Anh đã xếp đồ cho chuyến đi chưa?" },
      { speaker: "Tom", english: "Not yet. I've just got back from work.", vietnamese: "Chưa. Anh vừa đi làm về." },
      { speaker: "Mai", english: "I've already checked in online for both of us.", vietnamese: "Em đã làm thủ tục trực tuyến cho cả hai rồi." },
      { speaker: "Tom", english: "Great. Have you booked a taxi to the airport?", vietnamese: "Tuyệt. Em đã đặt taxi ra sân bay chưa?" },
      { speaker: "Mai", english: "No, I still haven't sorted that out.", vietnamese: "Chưa, em vẫn chưa lo việc đó." },
      { speaker: "Tom", english: "Don't worry, I'll do it now.", vietnamese: "Đừng lo, anh làm ngay đây." },
    ],
    practice: [
      q("Choose the correct sentence.", ["I've just had lunch.", "I've had just lunch.", "I just have had lunch.", "I've had lunch just."], "I've just had lunch.", "Have + just + past participle."),
      q("Complete: Have you called your mum ___?", ["yet", "already", "just", "still"], "yet", "Yet at the end of a question."),
      q("“Tôi chưa ăn sáng” in English is…", ["I haven't had breakfast yet.", "I didn't have breakfast yet.", "I don't have breakfast yet.", "I haven't yet breakfast."], "I haven't had breakfast yet.", "“Chưa” = haven't … yet."),
      q("Complete: The film has ___ started. Sit down quickly!", ["just", "yet", "still", "ever"], "just", "A very short time ago: just."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["She's already left.", "She already has left.", "She's left already yet.", "She has yet left."], "She's already left.", "Has + already + past participle."),
      q("Complete: I ___ my essay yet.", ["haven't handed in", "didn't hand in", "don't hand in", "haven't hand in"], "haven't handed in", "Haven't + past participle + yet."),
      q("Complete: He ___ hasn't replied to my email. It's been a week!", ["still", "yet", "already", "just"], "still", "Still haven't: longer than expected."),
      q("What does “sort out” mean?", ["deal with a problem", "go outside", "choose the worst", "sleep late"], "deal with a problem", "Sort out = deal with, organise."),
      q("“Have you finished yet?” Choose the best answer.", ["Not yet.", "Not already.", "Yet no.", "No, I didn't yet."], "Not yet.", "Short answer: not yet."),
    ],
  }, {
    key: "perfect-or-past", title: "Present Perfect or Past Simple?", titleVi: "Hiện tại hoàn thành hay quá khứ đơn?",
    objectives: [
      "I can talk about changes in my life and say when they happened.",
      "Use the past simple with a finished time: in 2020, last year, when I was ten",
      "Give news with the present perfect, then the details with the past simple",
    ],
    vocabulary: [
      { word: "graduate", ipa: "/ˈɡrædʒueɪt/", partOfSpeech: "verb", vietnamese: "tốt nghiệp", definition: "to finish university or college successfully", example: { english: "I graduated from Hanoi University in 2021.", vietnamese: "Tôi tốt nghiệp Đại học Hà Nội năm 2021." } },
      { word: "move house", ipa: "/ˌmuːv ˈhaʊs/", partOfSpeech: "collocation", vietnamese: "chuyển nhà", definition: "to leave your home and go to live in a new one", example: { english: "We've moved house three times in five years.", vietnamese: "Chúng tôi đã chuyển nhà ba lần trong năm năm." } },
      { word: "career", ipa: "/kəˈrɪə/", partOfSpeech: "noun", vietnamese: "sự nghiệp", definition: "the jobs you do during your working life", example: { english: "She started her career as a nurse.", vietnamese: "Cô ấy bắt đầu sự nghiệp là một y tá." } },
      { word: "promotion", ipa: "/prəˈməʊʃn/", partOfSpeech: "noun", vietnamese: "sự thăng chức", definition: "a move to a more important job in the same company", example: { english: "He's just got a promotion.", vietnamese: "Anh ấy vừa được thăng chức." } },
      { word: "quit", ipa: "/kwɪt/", partOfSpeech: "verb", vietnamese: "bỏ, nghỉ (việc)", definition: "to leave a job or stop doing something", example: { english: "She quit her job last month to travel.", vietnamese: "Tháng trước cô ấy bỏ việc để đi du lịch." } },
      { word: "lately", ipa: "/ˈleɪtli/", partOfSpeech: "adverb", vietnamese: "dạo này", definition: "in the last few days or weeks", example: { english: "I haven't been sleeping well lately.", vietnamese: "Dạo này tôi ngủ không ngon." } },
      { word: "since then", ipa: "/ˌsɪns ˈðen/", partOfSpeech: "phrase", vietnamese: "kể từ đó", definition: "from that time until now", example: { english: "I moved to Saigon in 2019 and I've lived here since then.", vietnamese: "Tôi chuyển vào Sài Gòn năm 2019 và sống ở đây từ đó đến nay." } },
      { word: "turning point", ipa: "/ˈtɜːnɪŋ pɔɪnt/", partOfSpeech: "noun", vietnamese: "bước ngoặt", definition: "a time when an important change happens", example: { english: "Getting that scholarship was a turning point in my life.", vietnamese: "Nhận được học bổng đó là một bước ngoặt trong đời tôi." } },
    ],
    grammar: [{
      title: "When? Past simple",
      pattern: "past simple + finished time: yesterday, in 2020, last year, two years ago, when I was a child",
      explanation: {
        english: "If you say or ask when something happened, and that time is finished, use the past simple, not the present perfect. Questions with When…? and What time…? also take the past simple: When did you graduate?",
        vietnamese: "Nếu bạn nói hoặc hỏi việc gì xảy ra khi nào, và thời điểm đó đã kết thúc, hãy dùng quá khứ đơn, không dùng hiện tại hoàn thành. Câu hỏi với When…? và What time…? cũng dùng quá khứ đơn: When did you graduate?",
      },
      examples: [
        { english: "I got my first job when I was twenty-two.", vietnamese: "Tôi có công việc đầu tiên năm hai mươi hai tuổi." },
        { english: "When did you move to Da Nang? Three years ago.", vietnamese: "Bạn chuyển đến Đà Nẵng khi nào? Ba năm trước." },
      ],
      mistake: {
        wrong: "I have graduated in 2020.", right: "I graduated in 2020.",
        why: { english: "In 2020 is a finished time, so English needs the past simple, even though Vietnamese says “đã tốt nghiệp”.", vietnamese: "In 2020 là thời điểm đã kết thúc, nên tiếng Anh phải dùng quá khứ đơn, dù tiếng Việt nói “đã tốt nghiệp”." },
      },
    }, {
      title: "News, then details",
      pattern: "Present perfect for the news · past simple for the details (when, where, how)",
      explanation: {
        english: "When you give news, start with the present perfect, because it matters now: I've changed jobs! Then switch to the past simple for the details: I started in March. The company called me after the interview. Unfinished times (today, this week, lately) also take the present perfect.",
        vietnamese: "Khi báo tin, hãy bắt đầu bằng hiện tại hoàn thành, vì tin đó quan trọng ở hiện tại: I've changed jobs! Rồi chuyển sang quá khứ đơn cho các chi tiết: I started in March. The company called me after the interview. Các khoảng thời gian chưa kết thúc (today, this week, lately) cũng dùng hiện tại hoàn thành.",
      },
      examples: [
        { english: "I've lost my wallet! I think I left it on the bus.", vietnamese: "Tôi mất ví rồi! Chắc tôi để quên trên xe buýt." },
        { english: "Have you seen Linh this week? Yes, I saw her on Monday.", vietnamese: "Tuần này bạn có gặp Linh không? Có, tôi gặp cô ấy hôm thứ Hai." },
      ],
      mistake: {
        wrong: "Have you watched the match last night?", right: "Did you watch the match last night?",
        why: { english: "Last night is finished, so use the past simple in the question too.", vietnamese: "Last night đã kết thúc, nên câu hỏi cũng dùng quá khứ đơn." },
      },
    }],
    examples: [
      { english: "I've had three jobs since I graduated.", vietnamese: "Từ khi tốt nghiệp tôi đã làm ba công việc." },
      { english: "My sister got a promotion last year, and she's been much happier since then.", vietnamese: "Năm ngoái chị tôi được thăng chức, và từ đó chị ấy vui hơn nhiều." },
      { english: "Have you heard? Duc has quit his job!", vietnamese: "Bạn nghe chưa? Đức bỏ việc rồi!" },
      { english: "Moving to London was a turning point in my career.", vietnamese: "Chuyển đến London là một bước ngoặt trong sự nghiệp của tôi." },
    ],
    dialogue: [
      { speaker: "Anna", english: "Long time no see, Quang! What have you been up to?", vietnamese: "Lâu quá không gặp, Quang! Dạo này bạn làm gì?" },
      { speaker: "Quang", english: "Lots of news. I've moved house and I've changed jobs.", vietnamese: "Nhiều tin lắm. Mình chuyển nhà và đổi việc rồi." },
      { speaker: "Anna", english: "Wow! When did you start the new job?", vietnamese: "Ồ! Bạn bắt đầu việc mới khi nào?" },
      { speaker: "Quang", english: "In January. I quit the bank in December.", vietnamese: "Tháng Một. Mình nghỉ ở ngân hàng hồi tháng Mười Hai." },
      { speaker: "Anna", english: "Do you like it?", vietnamese: "Bạn có thích không?" },
      { speaker: "Quang", english: "I love it. It's been a real turning point for me.", vietnamese: "Mình rất thích. Đó thật sự là một bước ngoặt với mình." },
    ],
    practice: [
      q("Complete: I ___ to Vung Tau last weekend.", ["went", "have gone", "have been", "go"], "went", "Last weekend is finished: past simple."),
      q("Complete: ___ you seen my keys? I can't find them.", ["Have", "Did", "Do", "Were"], "Have", "News that matters now: present perfect."),
      q("Choose the correct sentence.", ["She graduated two years ago.", "She has graduated two years ago.", "She has graduate two years ago.", "She graduates two years ago."], "She graduated two years ago.", "Ago: past simple."),
      q("“Chuyển nhà” in English is…", ["move house", "change home", "go house", "transfer house"], "move house", "Move house is the British collocation."),
    ],
    challenge: [
      q("Complete: When ___ you start learning English?", ["did", "have", "do", "has"], "did", "When…? takes the past simple."),
      q("Complete: I ___ a lot of coffee lately.", ["have drunk", "drank", "drink yesterday", "was drinking"], "have drunk", "Lately is unfinished time: present perfect."),
      q("Choose the best pair: “I've got a new phone! ___ it yesterday.”", ["I bought", "I've bought", "I buy", "I have buy"], "I bought", "Details with a time: past simple."),
      q("What is a “promotion”?", ["a move to a better job in your company", "a new company", "a holiday from work", "losing your job"], "a move to a better job in your company", "Promotion = a more important job."),
      q("Choose the correct sentence.", ["Did you see the news this morning? (It's now evening.)", "Have you seen the news this morning? (It's now evening.)", "Do you see the news this morning?", "Have you saw the news this morning?"], "Did you see the news this morning? (It's now evening.)", "In the evening, this morning is finished: past simple."),
    ],
  }, {
    key: "how-long", title: "I've Been Learning for Years", titleVi: "Tôi học được nhiều năm rồi",
    objectives: [
      "I can say how long I have been doing something.",
      "Use have been + -ing with for and since",
      "Say how long with the continuous, and how much or how many with the simple",
    ],
    vocabulary: [
      { word: "for ages", ipa: "/fər ˈeɪdʒɪz/", partOfSpeech: "phrase", vietnamese: "lâu lắm rồi", definition: "for a very long time (informal)", example: { english: "I've been waiting for ages!", vietnamese: "Tôi chờ lâu lắm rồi!" } },
      { word: "fluent", ipa: "/ˈfluːənt/", partOfSpeech: "adjective", vietnamese: "trôi chảy, lưu loát", definition: "able to speak a language easily and well", example: { english: "She's fluent in English and French.", vietnamese: "Cô ấy nói tiếng Anh và tiếng Pháp lưu loát." } },
      { word: "practise", ipa: "/ˈpræktɪs/", partOfSpeech: "verb", vietnamese: "luyện tập", definition: "to do something again and again to get better at it (British spelling for the verb)", example: { english: "I've been practising the piano every evening.", vietnamese: "Tối nào tôi cũng luyện đàn piano." } },
      { word: "make progress", ipa: "/ˌmeɪk ˈprəʊɡres/", partOfSpeech: "collocation", vietnamese: "tiến bộ", definition: "to get better at something", example: { english: "You've made a lot of progress this term.", vietnamese: "Học kỳ này em đã tiến bộ nhiều." } },
      { word: "brush up on", ipa: "/ˌbrʌʃ ˈʌp ɒn/", partOfSpeech: "phrasal verb", vietnamese: "ôn lại, trau dồi lại", definition: "to practise something you used to be good at", example: { english: "I need to brush up on my grammar before the exam.", vietnamese: "Tôi cần ôn lại ngữ pháp trước kỳ thi." } },
      { word: "queue", ipa: "/kjuː/", partOfSpeech: "verb", vietnamese: "xếp hàng", definition: "to wait in a line of people (British English)", example: { english: "We've been queuing for half an hour.", vietnamese: "Chúng tôi xếp hàng nửa tiếng rồi." } },
      { word: "exhausted", ipa: "/ɪɡˈzɔːstɪd/", partOfSpeech: "adjective", vietnamese: "kiệt sức", definition: "extremely tired", example: { english: "I'm exhausted. I've been working since six.", vietnamese: "Tôi kiệt sức rồi. Tôi làm việc từ sáu giờ." } },
      { word: "out of breath", ipa: "/ˌaʊt əv ˈbreθ/", partOfSpeech: "idiom", vietnamese: "hụt hơi, thở không ra hơi", definition: "breathing very fast because you have been running or working hard", example: { english: "Why are you out of breath? I've been running.", vietnamese: "Sao bạn thở hổn hển thế? Tôi vừa chạy bộ." } },
    ],
    grammar: [{
      title: "How long have you been …ing?",
      pattern: "have / has been + -ing + for (a length of time) / since (a starting point)",
      explanation: {
        english: "For an activity that started in the past and is still going on now, use the present perfect continuous: I've been learning English for six years. Use for with a length of time and since with the start. Ask How long have you been …ing? Verbs like know, like and have (own) don't usually take -ing: I've known her since school.",
        vietnamese: "Với một hoạt động bắt đầu trong quá khứ và vẫn đang tiếp diễn, dùng thì hiện tại hoàn thành tiếp diễn: I've been learning English for six years. Dùng for với khoảng thời gian và since với mốc bắt đầu. Hỏi How long have you been …ing? Các động từ như know, like và have (sở hữu) thường không thêm -ing: I've known her since school.",
      },
      examples: [
        { english: "How long have you been working here? Since 2022.", vietnamese: "Bạn làm ở đây bao lâu rồi? Từ năm 2022." },
        { english: "It's been raining all day.", vietnamese: "Trời mưa cả ngày rồi." },
      ],
      mistake: {
        wrong: "I am learning English for five years.", right: "I've been learning English for five years.",
        why: { english: "Vietnamese says “Tôi học tiếng Anh được năm năm rồi” with no tense, but English needs have been + -ing for something from the past until now.", vietnamese: "Tiếng Việt nói “Tôi học tiếng Anh được năm năm rồi” không cần thì, nhưng tiếng Anh cần have been + -ing cho việc kéo dài từ quá khứ đến giờ." },
      },
    }, {
      title: "How long or how many?",
      pattern: "How long: have been + -ing · How many / how much: have + past participle",
      explanation: {
        english: "The continuous shows how long an activity has lasted: I've been writing emails all morning. The simple shows a result you can count: I've written twelve emails. With a number of things finished, use the simple, not the continuous.",
        vietnamese: "Dạng tiếp diễn cho biết hoạt động kéo dài bao lâu: I've been writing emails all morning. Dạng đơn cho biết kết quả đếm được: I've written twelve emails. Khi có số lượng việc đã xong, dùng dạng đơn, không dùng tiếp diễn.",
      },
      examples: [
        { english: "She's been reading that book for weeks. She's read two hundred pages.", vietnamese: "Cô ấy đọc cuốn sách đó mấy tuần nay. Cô ấy đã đọc được hai trăm trang." },
        { english: "I've been cleaning the house since lunch, and I've done the kitchen.", vietnamese: "Tôi dọn nhà từ trưa, và đã xong phần bếp." },
      ],
      mistake: {
        wrong: "I've been drinking three cups of coffee today.", right: "I've drunk three cups of coffee today.",
        why: { english: "Three cups is a number of finished things: use the present perfect simple.", vietnamese: "Ba cốc là số lượng việc đã xong: dùng hiện tại hoàn thành đơn." },
      },
    }],
    examples: [
      { english: "I've been brushing up on my English since I got the job offer.", vietnamese: "Tôi ôn lại tiếng Anh từ khi nhận được lời mời làm việc." },
      { english: "You look exhausted. Have you been working late again?", vietnamese: "Trông bạn kiệt sức quá. Bạn lại làm muộn à?" },
      { english: "He's been practising every day, and he's made a lot of progress.", vietnamese: "Ngày nào anh ấy cũng luyện tập, và đã tiến bộ nhiều." },
      { english: "We've been queuing for ages and the doors still haven't opened.", vietnamese: "Chúng tôi xếp hàng lâu lắm rồi mà cửa vẫn chưa mở." },
    ],
    dialogue: [
      { speaker: "Teacher", english: "Your English is very fluent. How long have you been learning it?", vietnamese: "Tiếng Anh của em rất lưu loát. Em học được bao lâu rồi?" },
      { speaker: "Thu", english: "Since primary school, so about fifteen years.", vietnamese: "Từ hồi tiểu học, nên khoảng mười lăm năm ạ." },
      { speaker: "Teacher", english: "And have you been practising speaking a lot?", vietnamese: "Em có luyện nói nhiều không?" },
      { speaker: "Thu", english: "Yes. I've been talking to a language partner online for a year.", vietnamese: "Có ạ. Em nói chuyện với một bạn học ngôn ngữ trên mạng được một năm rồi." },
      { speaker: "Teacher", english: "That's great. How many sessions have you had?", vietnamese: "Tuyệt quá. Em đã học bao nhiêu buổi rồi?" },
      { speaker: "Thu", english: "I've had about fifty, and I've made real progress.", vietnamese: "Khoảng năm mươi buổi, và em tiến bộ thật sự." },
    ],
    practice: [
      q("Complete: I've been living in Hanoi ___ 2018.", ["since", "for", "from", "ago"], "since", "Since + a starting point."),
      q("Complete: How long ___ waiting?", ["have you been", "are you", "did you", "you have been"], "have you been", "How long have you been + -ing?"),
      q("Choose the correct sentence.", ["I've been working here for three years.", "I'm working here for three years.", "I work here since three years.", "I've been work here for three years."], "I've been working here for three years.", "Have been + -ing + for."),
      q("“Xếp hàng” in British English is…", ["queue", "line on", "stand row", "wait row"], "queue", "British English: queue."),
    ],
    challenge: [
      q("Complete: She ___ five chapters so far.", ["has written", "has been writing", "is writing", "writes"], "has written", "A number of finished things: simple."),
      q("Complete: I've ___ her since we were at school.", ["known", "been knowing", "know", "knew"], "known", "Know doesn't usually take -ing."),
      q("Choose the correct sentence.", ["It's been snowing for two hours.", "It snows for two hours.", "It's snowing since two hours.", "It has snowing for two hours."], "It's been snowing for two hours.", "Has been + -ing + for."),
      q("What does “brush up on” mean?", ["practise something again", "clean your teeth", "forget something", "learn something for the first time"], "practise something again", "Brush up on = refresh a skill."),
      q("You have been running. You are…", ["out of breath", "out of mind", "out of work", "out of order"], "out of breath", "Breathing fast: out of breath."),
    ],
  }, {
    key: "achievements", title: "Proud Moments", titleVi: "Những khoảnh khắc tự hào",
    objectives: [
      "I can talk about things I have achieved and how I did them.",
      "Use manage to + verb and succeed in + -ing",
      "Say the best thing I've ever done",
    ],
    vocabulary: [
      { word: "achieve", ipa: "/əˈtʃiːv/", partOfSpeech: "verb", vietnamese: "đạt được", definition: "to succeed in doing something after working hard", example: { english: "She achieved her dream of becoming a doctor.", vietnamese: "Cô ấy đã đạt được ước mơ trở thành bác sĩ." } },
      { word: "proud of", ipa: "/ˈpraʊd əv/", partOfSpeech: "adjective", vietnamese: "tự hào về", definition: "pleased about something you or someone close to you has done", example: { english: "I'm really proud of my little brother.", vietnamese: "Tôi thật sự tự hào về em trai mình." } },
      { word: "manage to", ipa: "/ˈmænɪdʒ tə/", partOfSpeech: "phrase", vietnamese: "xoay xở được, làm được", definition: "to succeed in doing something difficult", example: { english: "I managed to finish the marathon.", vietnamese: "Tôi đã chạy được hết cuộc thi marathon." } },
      { word: "succeed in", ipa: "/səkˈsiːd ɪn/", partOfSpeech: "phrase", vietnamese: "thành công trong việc", definition: "to do what you tried to do", example: { english: "He succeeded in getting a place at Oxford.", vietnamese: "Anh ấy đã thành công giành được một suất ở Oxford." } },
      { word: "overcome", ipa: "/ˌəʊvəˈkʌm/", partOfSpeech: "verb", vietnamese: "vượt qua", definition: "to deal successfully with a problem or a fear", example: { english: "She has overcome her fear of flying.", vietnamese: "Cô ấy đã vượt qua nỗi sợ đi máy bay." } },
      { word: "award", ipa: "/əˈwɔːd/", partOfSpeech: "noun", vietnamese: "giải thưởng", definition: "a prize for doing something well", example: { english: "Our team won an award for the best design.", vietnamese: "Nhóm chúng tôi đoạt giải thiết kế đẹp nhất." } },
      { word: "set a goal", ipa: "/ˌset ə ˈɡəʊl/", partOfSpeech: "collocation", vietnamese: "đặt mục tiêu", definition: "to decide on something you want to achieve", example: { english: "I've set a goal to read twenty books this year.", vietnamese: "Tôi đặt mục tiêu đọc hai mươi cuốn sách năm nay." } },
      { word: "challenge", ipa: "/ˈtʃælɪndʒ/", partOfSpeech: "noun", vietnamese: "thử thách", definition: "something difficult that tests your ability", example: { english: "Learning to drive was a big challenge for me.", vietnamese: "Học lái xe là một thử thách lớn với tôi." } },
    ],
    grammar: [{
      title: "Manage to and succeed in",
      pattern: "manage to + base verb · succeed in + -ing",
      explanation: {
        english: "Both mean you did something difficult. Manage is followed by to + base verb: I managed to pass. Succeed is followed by in + -ing: I succeeded in passing. Manage to is more common in speaking.",
        vietnamese: "Cả hai đều nghĩa là bạn đã làm được việc khó. Manage đi với to + động từ nguyên mẫu: I managed to pass. Succeed đi với in + V-ing: I succeeded in passing. Manage to phổ biến hơn trong văn nói.",
      },
      examples: [
        { english: "We managed to get the last two tickets.", vietnamese: "Chúng tôi mua được hai vé cuối cùng." },
        { english: "The charity succeeded in raising £10,000.", vietnamese: "Tổ chức từ thiện đã quyên góp được 10.000 bảng." },
      ],
      mistake: {
        wrong: "I succeeded to find a job.", right: "I succeeded in finding a job.",
        why: { english: "Succeed takes in + -ing, not to. Manage takes to: I managed to find a job.", vietnamese: "Succeed đi với in + V-ing, không đi với to. Manage mới đi với to: I managed to find a job." },
      },
    }, {
      title: "The best thing I've ever done",
      pattern: "the + superlative + noun + I've ever + past participle",
      explanation: {
        english: "To say something is the most special of all your experiences, use a superlative with the present perfect and ever: It's the best film I've ever seen. It was the hardest exam I've ever taken. Don't use the past simple with ever here.",
        vietnamese: "Để nói điều gì đó đặc biệt nhất trong mọi trải nghiệm của bạn, dùng so sánh nhất với hiện tại hoàn thành và ever: It's the best film I've ever seen. It was the hardest exam I've ever taken. Không dùng quá khứ đơn với ever trong trường hợp này.",
      },
      examples: [
        { english: "Climbing that mountain is the hardest thing I've ever done.", vietnamese: "Leo ngọn núi đó là việc khó nhất tôi từng làm." },
        { english: "She's the kindest person I've ever met.", vietnamese: "Cô ấy là người tốt bụng nhất tôi từng gặp." },
      ],
      mistake: {
        wrong: "It's the most beautiful place I ever saw.", right: "It's the most beautiful place I've ever seen.",
        why: { english: "Ever with a superlative covers your whole life until now: use the present perfect.", vietnamese: "Ever với so sánh nhất bao trùm cả cuộc đời bạn đến giờ: dùng hiện tại hoàn thành." },
      },
    }],
    examples: [
      { english: "My proudest moment was when I managed to speak English at a conference.", vietnamese: "Khoảnh khắc tôi tự hào nhất là khi tôi nói được tiếng Anh tại một hội nghị." },
      { english: "He's overcome a lot of challenges to get where he is.", vietnamese: "Anh ấy đã vượt qua nhiều thử thách để có được vị trí hôm nay." },
      { english: "Setting a clear goal helped me achieve more.", vietnamese: "Đặt mục tiêu rõ ràng giúp tôi đạt được nhiều hơn." },
      { english: "Winning that award is the best thing that has ever happened to our team.", vietnamese: "Đoạt giải thưởng đó là điều tuyệt nhất từng đến với nhóm chúng tôi." },
    ],
    dialogue: [
      { speaker: "Interviewer", english: "What achievement are you most proud of?", vietnamese: "Thành tựu nào khiến bạn tự hào nhất?" },
      { speaker: "Ngoc", english: "Last year I set a goal to run a half marathon.", vietnamese: "Năm ngoái tôi đặt mục tiêu chạy bán marathon." },
      { speaker: "Interviewer", english: "Were you a runner before that?", vietnamese: "Trước đó bạn có hay chạy bộ không?" },
      { speaker: "Ngoc", english: "Not at all. It was a huge challenge, but I trained every morning.", vietnamese: "Hoàn toàn không. Đó là một thử thách lớn, nhưng sáng nào tôi cũng tập." },
      { speaker: "Interviewer", english: "And did you finish?", vietnamese: "Và bạn có về đích không?" },
      { speaker: "Ngoc", english: "I managed to finish in just over two hours. It's the hardest thing I've ever done.", vietnamese: "Tôi về đích sau hơn hai tiếng một chút. Đó là việc khó nhất tôi từng làm." },
    ],
    practice: [
      q("Complete: I managed ___ the exam.", ["to pass", "passing", "pass", "in passing"], "to pass", "Manage + to + base verb."),
      q("Complete: She succeeded ___ a scholarship.", ["in winning", "to win", "win", "on winning"], "in winning", "Succeed + in + -ing."),
      q("“Tự hào về” in English is…", ["proud of", "proud about", "proud with", "proud for"], "proud of", "Proud + of."),
      q("Complete: It's the best meal I've ___ eaten.", ["ever", "never", "already", "yet"], "ever", "Superlative + I've ever."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["He's the funniest person I've ever met.", "He's the funniest person I ever met.", "He's the funniest person I've never met.", "He's the most funny person I ever have met."], "He's the funniest person I've ever met.", "Superlative + have ever + past participle."),
      q("Complete: After months of practice, I ___ my fear of speaking in public.", ["overcame", "overcomed", "overcome to", "overcame in"], "overcame", "Overcome is irregular: overcame."),
      q("Choose the correct sentence.", ["We managed to fix the car.", "We managed fixing the car.", "We managed in fixing the car.", "We managed fix the car."], "We managed to fix the car.", "Manage to + base verb."),
      q("What is an “award”?", ["a prize for doing something well", "a difficult problem", "a long journey", "a kind of exam"], "a prize for doing something well", "Award = prize."),
      q("Complete: I've ___ myself a goal: no social media after 10 p.m.", ["set", "put", "made up", "done"], "set", "The collocation is set a goal."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 1", isReview: true,
    objectives: [
      "I can talk about my experiences, recent news and achievements with the right tense.",
      "Check ever / never, been / gone, just / already / yet, finished times, for / since and -ing",
    ],
    vocabulary: [
      { word: "abroad", ipa: "/əˈbrɔːd/", partOfSpeech: "adverb", vietnamese: "ở nước ngoài, ra nước ngoài", definition: "in or to a foreign country", example: { english: "I'd love to work abroad one day.", vietnamese: "Tôi rất muốn một ngày nào đó được làm việc ở nước ngoài." } },
      { word: "yet", ipa: "/jet/", partOfSpeech: "adverb", vietnamese: "chưa (câu phủ định); …chưa? (câu hỏi)", definition: "until now, used at the end of questions and negative sentences", example: { english: "I haven't decided yet.", vietnamese: "Tôi vẫn chưa quyết định." } },
      { word: "graduate", ipa: "/ˈɡrædʒueɪt/", partOfSpeech: "verb", vietnamese: "tốt nghiệp", definition: "to finish university or college successfully", example: { english: "What did you do after you graduated?", vietnamese: "Bạn làm gì sau khi tốt nghiệp?" } },
      { word: "fluent", ipa: "/ˈfluːənt/", partOfSpeech: "adjective", vietnamese: "trôi chảy, lưu loát", definition: "able to speak a language easily and well", example: { english: "I want to be fluent by the end of next year.", vietnamese: "Tôi muốn nói lưu loát vào cuối năm sau." } },
      { word: "manage to", ipa: "/ˈmænɪdʒ tə/", partOfSpeech: "phrase", vietnamese: "xoay xở được, làm được", definition: "to succeed in doing something difficult", example: { english: "Did you manage to find a parking space?", vietnamese: "Bạn có tìm được chỗ đỗ xe không?" } },
      { word: "achieve", ipa: "/əˈtʃiːv/", partOfSpeech: "verb", vietnamese: "đạt được", definition: "to succeed in doing something after working hard", example: { english: "What do you want to achieve this year?", vietnamese: "Năm nay bạn muốn đạt được điều gì?" } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "Have you ever…? · been ≠ gone · haven't … yet · finished time → past simple · have been + -ing for / since",
      explanation: {
        english: "Check these: experiences with no time take the present perfect (Have you ever been…?); been to means you came back, gone to means you are still there; “chưa” is haven't … yet; a finished time (yesterday, in 2020, ago) needs the past simple; something from the past until now takes have been + -ing with for or since, but a number of finished things takes the simple.",
        vietnamese: "Hãy kiểm tra: trải nghiệm không nêu thời gian dùng hiện tại hoàn thành (Have you ever been…?); been to là đã quay về, gone to là vẫn còn ở đó; “chưa” là haven't … yet; thời điểm đã kết thúc (yesterday, in 2020, ago) cần quá khứ đơn; việc kéo dài từ quá khứ đến giờ dùng have been + -ing với for hoặc since, nhưng số lượng việc đã xong thì dùng dạng đơn.",
      },
      examples: [
        { english: "I've been to Korea, but I haven't been to Japan yet.", vietnamese: "Tôi đã đến Hàn Quốc, nhưng chưa đến Nhật." },
        { english: "I started yoga in May, and I've been doing it ever since.", vietnamese: "Tôi bắt đầu tập yoga hồi tháng Năm, và tập đều từ đó đến nay." },
      ],
    }],
    examples: [
      { english: "Have you ever lived abroad? Yes, I lived in Seoul for a year.", vietnamese: "Bạn đã bao giờ sống ở nước ngoài chưa? Rồi, tôi sống ở Seoul một năm." },
      { english: "She hasn't graduated yet, but she's already got a job offer.", vietnamese: "Cô ấy chưa tốt nghiệp, nhưng đã có lời mời làm việc." },
      { english: "I've been learning the guitar for a year and I've managed to learn ten songs.", vietnamese: "Tôi học guitar được một năm và đã tập được mười bài." },
    ],
    dialogue: [
      { speaker: "Ben", english: "So, what have you achieved this year, Hoa?", vietnamese: "Vậy năm nay Hoa đã đạt được những gì?" },
      { speaker: "Hoa", english: "Well, I graduated in June, and I've been working at a hotel since August.", vietnamese: "À, mình tốt nghiệp hồi tháng Sáu, và làm ở một khách sạn từ tháng Tám." },
      { speaker: "Ben", english: "Have you ever worked in a hotel before?", vietnamese: "Trước đây bạn đã bao giờ làm ở khách sạn chưa?" },
      { speaker: "Hoa", english: "Never. But my English has become much more fluent.", vietnamese: "Chưa bao giờ. Nhưng tiếng Anh của mình trôi chảy hơn nhiều rồi." },
      { speaker: "Ben", english: "Have you been abroad yet?", vietnamese: "Bạn đã ra nước ngoài chưa?" },
      { speaker: "Hoa", english: "Not yet, but I've just booked a trip to Singapore.", vietnamese: "Chưa, nhưng mình vừa đặt một chuyến đi Singapore." },
      { speaker: "Ben", english: "That's the best news I've heard all week!", vietnamese: "Đó là tin vui nhất mình nghe được cả tuần nay!" },
    ],
    practice: [
      q("Complete: Have you ever ___ sushi?", ["eaten", "ate", "eat", "eating"], "eaten", "Have you ever + past participle."),
      q("Complete: I ___ my driving test in 2021.", ["passed", "have passed", "have been passing", "pass"], "passed", "In 2021 is finished: past simple."),
      q("Complete: We've been friends ___ ten years.", ["for", "since", "ago", "during"], "for", "For + a length of time."),
      q("Choose the correct sentence.", ["I haven't paid the bill yet.", "I didn't pay the bill yet.", "I haven't yet paid the bill yet.", "I don't pay the bill yet."], "I haven't paid the bill yet.", "“Chưa” = haven't … yet."),
    ],
    challenge: [
      q("Tuan is in Hue now. Tuan has…", ["gone to Hue", "been to Hue", "went to Hue", "go to Hue"], "gone to Hue", "Still there: gone to."),
      q("Complete: How long ___ for this company?", ["have you been working", "are you working", "do you work", "did you work"], "have you been working", "How long + have been + -ing."),
      q("Complete: I've ___ eaten. I'm not hungry.", ["already", "yet", "ever", "still"], "already", "Have + already + past participle."),
      q("Choose the correct sentence.", ["He succeeded in getting the job.", "He succeeded to get the job.", "He succeeded get the job.", "He managed getting the job."], "He succeeded in getting the job.", "Succeed in + -ing."),
      q("Complete: It's the longest journey I've ___.", ["ever made", "never made", "ever make", "made ever"], "ever made", "Superlative + I've ever + past participle."),
    ],
  }],
  assessment: [
    { id: "ever-experience", prompt: "Choose the correct sentence.", options: ["Have you ever been to Australia?", "Did you ever go to Australia?", "Have you ever went to Australia?", "Are you ever been to Australia?"], correct: "Have you ever been to Australia?", explanation: "Life experience, no time: present perfect." },
    { id: "never", prompt: "Complete: I've ___ ridden a motorbike. I'm scared of them.", options: ["never", "ever", "yet", "already"], correct: "never", explanation: "Never = not at any time." },
    { id: "been-gone", prompt: "Mum isn't at home. She's ___ to the market.", options: ["gone", "been", "went", "going"], correct: "gone", explanation: "She is still there: gone to." },
    { id: "just", prompt: "Choose the correct sentence.", options: ["The train has just left.", "The train has left just.", "The train just has left.", "The train has yet left."], correct: "The train has just left.", explanation: "Has + just + past participle." },
    { id: "not-yet", prompt: "“Tôi chưa gọi cho anh ấy.” in English is…", options: ["I haven't called him yet.", "I didn't call him yet.", "I don't call him yet.", "I haven't called him already."], correct: "I haven't called him yet.", explanation: "“Chưa” = haven't … yet." },
    { id: "still", prompt: "Complete: It's 10 o'clock and Nam ___ hasn't got up.", options: ["still", "yet", "already", "ever"], correct: "still", explanation: "Still haven't: longer than expected." },
    { id: "finished-time", prompt: "Complete: We ___ to Phu Quoc two years ago.", options: ["went", "have gone", "have been", "go"], correct: "went", explanation: "Ago: past simple." },
    { id: "when-question", prompt: "Complete: When ___ your degree?", options: ["did you finish", "have you finished", "have you been finishing", "do you finished"], correct: "did you finish", explanation: "When…? takes the past simple." },
    { id: "news-details", prompt: "Choose the best second sentence: “I've found a new flat! ___”", options: ["I saw it online last week.", "I've seen it online last week.", "I see it online last week.", "I've been seeing it last week."], correct: "I saw it online last week.", explanation: "Details with a finished time: past simple." },
    { id: "pp-continuous", prompt: "Complete: I ___ English for eight years.", options: ["have been learning", "am learning", "learn", "was learning"], correct: "have been learning", explanation: "From the past until now: have been + -ing." },
    { id: "since", prompt: "Complete: They've been married ___ 2015.", options: ["since", "for", "from", "ago"], correct: "since", explanation: "Since + a starting point." },
    { id: "simple-count", prompt: "Complete: I ___ four cups of tea this morning.", options: ["have had", "have been having", "am having", "has had"], correct: "have had", explanation: "A number of finished things: present perfect simple." },
    { id: "stative", prompt: "Choose the correct sentence.", options: ["I've known Lan since 2010.", "I've been knowing Lan since 2010.", "I know Lan since 2010.", "I'm knowing Lan since 2010."], correct: "I've known Lan since 2010.", explanation: "Know doesn't take -ing." },
    { id: "manage-to", prompt: "Complete: Did you manage ___ the report on time?", options: ["to finish", "finishing", "finish", "in finishing"], correct: "to finish", explanation: "Manage + to + base verb." },
    { id: "superlative-ever", prompt: "Complete: That was the worst film I've ___.", options: ["ever seen", "ever saw", "never seen", "seen ever"], correct: "ever seen", explanation: "Superlative + I've ever + past participle." },
  ],
};
