// B2 Unit 5: Stories & Experiences. Vietnamese marks time with "đã" and "rồi" instead of tense, so stories lose the
// past perfect ("When I arrived, the film already started", "By the time the police came, the thief escaped") and the
// past perfect continuous ("I had been work all day"); "trong khi" becomes "During I was waiting"; "mà" becomes that
// or what in non-defining clauses ("My mother, that is a nurse", "He was late, what annoyed me"); participle clauses
// dangle ("Walking home, a fox appeared"); and so / such get mixed ("so a funny story"). This unit puts those right
// for telling a good story.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B2",
  number: 5,
  lessons: [{
    key: "narrative-tenses", title: "It Had Been Raining All Day", titleVi: "Các thì kể chuyện",
    objectives: [
      "I can tell a story in the past with clear background and order of events.",
      "Combine the past simple, past continuous and past perfect",
      "Use the past perfect continuous for a long action before a past moment",
    ],
    vocabulary: [
      { word: "soaked", ipa: "/səʊkt/", partOfSpeech: "adjective", vietnamese: "ướt sũng", definition: "completely wet", example: { english: "We got soaked walking home in the rain.", vietnamese: "Chúng tôi ướt sũng khi đi bộ về nhà dưới mưa." } },
      { word: "stranded", ipa: "/ˈstrændɪd/", partOfSpeech: "adjective", vietnamese: "mắc kẹt", definition: "unable to leave a place", example: { english: "Hundreds of passengers were stranded at the airport.", vietnamese: "Hàng trăm hành khách bị mắc kẹt ở sân bay." } },
      { word: "set off", ipa: "/ˌset ˈɒf/", partOfSpeech: "phrasal verb", vietnamese: "khởi hành, lên đường", definition: "to start a journey", example: { english: "We set off at dawn to beat the traffic.", vietnamese: "Chúng tôi khởi hành lúc bình minh để tránh tắc đường." } },
      { word: "realise", ipa: "/ˈriːəlaɪz/", partOfSpeech: "verb", vietnamese: "nhận ra", definition: "to suddenly understand or notice a fact (British spelling)", example: { english: "I realised I had left my passport at the hotel.", vietnamese: "Tôi nhận ra mình đã để quên hộ chiếu ở khách sạn." } },
      { word: "suddenly", ipa: "/ˈsʌdənli/", partOfSpeech: "adverb", vietnamese: "đột nhiên", definition: "quickly and unexpectedly", example: { english: "Suddenly, all the lights went out.", vietnamese: "Đột nhiên, tất cả đèn tắt phụt." } },
      { word: "luckily", ipa: "/ˈlʌkɪli/", partOfSpeech: "adverb", vietnamese: "may mắn thay", definition: "used to say something good happened by chance", example: { english: "Luckily, a kind stranger helped us.", vietnamese: "May mắn thay, một người lạ tốt bụng đã giúp chúng tôi." } },
      { word: "gradually", ipa: "/ˈɡrædʒuəli/", partOfSpeech: "adverb", vietnamese: "dần dần", definition: "slowly over a period of time", example: { english: "The sky gradually got darker.", vietnamese: "Bầu trời dần dần tối lại." } },
      { word: "power cut", ipa: "/ˈpaʊə kʌt/", partOfSpeech: "noun", vietnamese: "mất điện", definition: "a time when the electricity stops working (British English)", example: { english: "There was a power cut during the storm.", vietnamese: "Đã bị mất điện trong cơn bão." } },
    ],
    grammar: [{
      title: "Three past tenses together",
      pattern: "past continuous = background · past simple = main events · past perfect (had + past participle) = earlier events",
      explanation: {
        english: "Good stories mix past tenses. The past continuous sets the scene: It was getting dark and we were walking home. The past simple tells the main events in order: Suddenly, a dog ran out. The past perfect goes back to something earlier: I realised I had left my phone at the café. Vietnamese “đã” covers all three, but English must choose.",
        vietnamese: "Câu chuyện hay kết hợp nhiều thì quá khứ. Quá khứ tiếp diễn dựng bối cảnh: It was getting dark and we were walking home. Quá khứ đơn kể các sự kiện chính theo thứ tự: Suddenly, a dog ran out. Quá khứ hoàn thành quay lại việc xảy ra trước đó: I realised I had left my phone at the café. “Đã” trong tiếng Việt bao gồm cả ba, nhưng tiếng Anh phải chọn.",
      },
      examples: [
        { english: "While we were having dinner, there was a power cut.", vietnamese: "Khi chúng tôi đang ăn tối thì mất điện." },
        { english: "When we got to the station, the last train had gone.", vietnamese: "Khi chúng tôi đến ga thì chuyến tàu cuối đã đi mất." },
      ],
      mistake: {
        wrong: "When I arrived, the film already started.", right: "When I arrived, the film had already started.",
        why: { english: "The film started before you arrived, so use the past perfect.", vietnamese: "Bộ phim bắt đầu trước khi bạn đến, nên dùng quá khứ hoàn thành." },
      },
    }, {
      title: "Past perfect continuous",
      pattern: "had been + verb-ing (a long action that continued up to a past moment)",
      explanation: {
        english: "Use had been + -ing for an activity that went on for some time before a moment in the past, often to explain a result: The roads were flooded because it had been raining all day. I was tired because I'd been driving for ten hours. It often goes with for and since.",
        vietnamese: "Dùng had been + -ing cho một hoạt động kéo dài một thời gian trước một thời điểm trong quá khứ, thường để giải thích kết quả: The roads were flooded because it had been raining all day. I was tired because I'd been driving for ten hours. Thường đi với for và since.",
      },
      examples: [
        { english: "We'd been waiting for two hours when the bus finally came.", vietnamese: "Chúng tôi đã đợi hai tiếng thì xe buýt mới đến." },
        { english: "Her eyes were red. She had been crying.", vietnamese: "Mắt cô ấy đỏ hoe. Cô ấy đã khóc." },
      ],
      mistake: {
        wrong: "I was exhausted because I had been work all day.", right: "I was exhausted because I had been working all day.",
        why: { english: "The past perfect continuous needs had been + -ing.", vietnamese: "Quá khứ hoàn thành tiếp diễn cần had been + -ing." },
      },
    }],
    examples: [
      { english: "It had been raining for hours, so we were soaked when we arrived.", vietnamese: "Trời đã mưa nhiều giờ liền, nên khi đến nơi chúng tôi ướt sũng." },
      { english: "We set off early, but we were stranded because the road had flooded.", vietnamese: "Chúng tôi khởi hành sớm, nhưng bị mắc kẹt vì đường đã ngập." },
      { english: "Gradually, I realised that we were lost.", vietnamese: "Dần dần, tôi nhận ra là chúng tôi bị lạc." },
      { english: "Luckily, the power cut ended before the match started.", vietnamese: "May thay, điện có lại trước khi trận đấu bắt đầu." },
    ],
    dialogue: [
      { speaker: "Alice", english: "How was your trip to Ha Giang?", vietnamese: "Chuyến đi Hà Giang của bạn thế nào?" },
      { speaker: "Tien", english: "Crazy! It had been raining for days before we set off.", vietnamese: "Điên rồ lắm! Trời đã mưa nhiều ngày trước khi bọn mình khởi hành." },
      { speaker: "Tien", english: "We were riding through the mountains when suddenly the road disappeared.", vietnamese: "Bọn mình đang đi qua núi thì đột nhiên con đường biến mất." },
      { speaker: "Alice", english: "Disappeared?", vietnamese: "Biến mất á?" },
      { speaker: "Tien", english: "A landslide had blocked it. We were stranded for six hours.", vietnamese: "Một vụ sạt lở đã chặn đường. Bọn mình bị mắc kẹt sáu tiếng." },
      { speaker: "Tien", english: "Luckily, a family in the village gave us tea and dry clothes.", vietnamese: "May thay, một gia đình trong bản cho bọn mình uống trà và quần áo khô." },
    ],
    practice: [
      q("Complete: When we arrived, the party ___.", ["had already finished", "already finished", "has already finished", "was already finish"], "had already finished", "Earlier event: past perfect."),
      q("Complete: It ___ dark and the wind was blowing.", ["was getting", "got", "had got", "gets"], "was getting", "Background: past continuous."),
      q("Complete: She was tired because she ___ all night.", ["had been studying", "had been study", "was study", "has been studying"], "had been studying", "Had been + -ing."),
      q("“Mất điện” in British English is…", ["a power cut", "a power stop", "a light out", "an electric gone"], "a power cut", "Power cut."),
    ],
    challenge: [
      q("Complete: I ___ my keys, so I couldn't get in.", ["had lost", "have lost", "was losing", "lose"], "had lost", "Earlier: past perfect."),
      q("Complete: We ___ for an hour when the taxi finally arrived.", ["had been waiting", "were waited", "have been waiting", "waited for"], "had been waiting", "Long action up to a past moment."),
      q("Complete: While I ___ a shower, the phone rang.", ["was having", "had", "had had", "have"], "was having", "Background interrupted."),
      q("Complete: We ___ at 5 a.m. to avoid the traffic.", ["set off", "set up", "set out of", "set on"], "set off", "Set off = start a journey."),
      q("What does “stranded” mean?", ["unable to leave a place", "very happy", "lost in the sea", "tired"], "unable to leave a place", "Stranded = stuck."),
    ],
  }, {
    key: "time-linkers", title: "By the Time We Arrived", titleVi: "Từ nối chỉ thời gian",
    objectives: [
      "I can link events in a story clearly.",
      "Use while + clause and during + noun",
      "Use by the time, as soon as and once with the right tenses",
    ],
    vocabulary: [
      { word: "as soon as", ipa: "/əz ˈsuːn əz/", partOfSpeech: "conjunction", vietnamese: "ngay khi", definition: "immediately after", example: { english: "As soon as I got home, I went to bed.", vietnamese: "Ngay khi về đến nhà, tôi đi ngủ." } },
      { word: "by the time", ipa: "/baɪ ðə ˈtaɪm/", partOfSpeech: "conjunction", vietnamese: "đến lúc, trước khi", definition: "before or when something happens", example: { english: "By the time we arrived, everyone had left.", vietnamese: "Đến lúc chúng tôi tới, mọi người đã về hết." } },
      { word: "the moment", ipa: "/ðə ˈməʊmənt/", partOfSpeech: "conjunction", vietnamese: "đúng lúc, ngay khoảnh khắc", definition: "exactly when", example: { english: "The moment I saw her, I knew something was wrong.", vietnamese: "Ngay khoảnh khắc nhìn thấy cô ấy, tôi biết có chuyện." } },
      { word: "meanwhile", ipa: "/ˈmiːnwaɪl/", partOfSpeech: "adverb", vietnamese: "trong khi đó", definition: "at the same time, in another place", example: { english: "I cooked dinner. Meanwhile, my husband cleaned the house.", vietnamese: "Tôi nấu bữa tối. Trong khi đó, chồng tôi dọn nhà." } },
      { word: "afterwards", ipa: "/ˈɑːftəwədz/", partOfSpeech: "adverb", vietnamese: "sau đó", definition: "later, after an event", example: { english: "We watched a film and afterwards went for a drink.", vietnamese: "Chúng tôi xem phim và sau đó đi uống nước." } },
      { word: "until", ipa: "/ənˈtɪl/", partOfSpeech: "conjunction", vietnamese: "cho đến khi", definition: "up to the time when", example: { english: "We waited until the rain stopped.", vietnamese: "Chúng tôi đợi cho đến khi tạnh mưa." } },
      { word: "once", ipa: "/wʌns/", partOfSpeech: "conjunction", vietnamese: "một khi, khi đã", definition: "as soon as, after", example: { english: "Once you've finished, you can go.", vietnamese: "Khi đã xong, bạn có thể về." } },
      { word: "during", ipa: "/ˈdjʊərɪŋ/", partOfSpeech: "preposition", vietnamese: "trong suốt", definition: "from the beginning to the end of a period", example: { english: "I fell asleep during the film.", vietnamese: "Tôi ngủ gật trong lúc xem phim." } },
    ],
    grammar: [{
      title: "While or during?",
      pattern: "while + subject + verb (while I was waiting) · during + noun (during the flight)",
      explanation: {
        english: "While and during both mean “trong khi / trong lúc”, but they take different things after them. While is a conjunction, so it takes a clause with a subject and verb: while we were eating. During is a preposition, so it takes a noun: during the meal, during the night.",
        vietnamese: "While và during đều có nghĩa “trong khi / trong lúc”, nhưng đi với thành phần khác nhau. While là liên từ, nên đi với mệnh đề có chủ ngữ và động từ: while we were eating. During là giới từ, nên đi với danh từ: during the meal, during the night.",
      },
      examples: [
        { english: "Someone stole my bag while I was sleeping.", vietnamese: "Có người lấy trộm túi của tôi khi tôi đang ngủ." },
        { english: "Nobody spoke during the ceremony.", vietnamese: "Không ai nói gì trong suốt buổi lễ." },
      ],
      mistake: {
        wrong: "During I was waiting, I read a book.", right: "While I was waiting, I read a book.",
        why: { english: "Before a subject and verb, use while, not during.", vietnamese: "Trước chủ ngữ và động từ, dùng while, không dùng during." },
      },
    }, {
      title: "By the time, as soon as, once",
      pattern: "By the time + past simple, past perfect · As soon as / Once / The moment + past simple, past simple",
      explanation: {
        english: "By the time means that one thing was already complete when another happened, so the main clause usually takes the past perfect: By the time the police arrived, the thieves had escaped. As soon as, once and the moment show that one thing happened immediately after another: As soon as the bell rang, everyone ran out.",
        vietnamese: "By the time nghĩa là một việc đã hoàn tất khi việc khác xảy ra, nên mệnh đề chính thường dùng quá khứ hoàn thành: By the time the police arrived, the thieves had escaped. As soon as, once và the moment cho thấy việc này xảy ra ngay sau việc kia: As soon as the bell rang, everyone ran out.",
      },
      examples: [
        { english: "By the time I found my ticket, the plane had taken off.", vietnamese: "Đến lúc tôi tìm được vé, máy bay đã cất cánh." },
        { english: "The moment the door opened, the cat ran in.", vietnamese: "Ngay khi cửa mở, con mèo chạy vào." },
      ],
      mistake: {
        wrong: "By the time the police came, the thief escaped.", right: "By the time the police came, the thief had escaped.",
        why: { english: "The escape was complete before the police came, so use the past perfect.", vietnamese: "Việc trốn thoát đã xong trước khi cảnh sát đến, nên dùng quá khứ hoàn thành." },
      },
    }],
    examples: [
      { english: "As soon as the storm stopped, we went outside.", vietnamese: "Ngay khi bão tạnh, chúng tôi ra ngoài." },
      { english: "I stayed until the end, but afterwards I felt exhausted.", vietnamese: "Tôi ở lại đến cuối, nhưng sau đó thấy kiệt sức." },
      { english: "Once we'd checked in, we went straight to the beach.", vietnamese: "Khi đã nhận phòng xong, chúng tôi đi thẳng ra biển." },
      { english: "Meanwhile, back at the hotel, our friends were worried.", vietnamese: "Trong khi đó, ở khách sạn, bạn bè chúng tôi lo lắng." },
    ],
    dialogue: [
      { speaker: "Sam", english: "Did you see the fireworks on New Year's Eve?", vietnamese: "Bạn có xem pháo hoa đêm giao thừa không?" },
      { speaker: "Vy", english: "No! By the time we found a place to park, they'd finished.", vietnamese: "Không! Đến lúc bọn mình tìm được chỗ đỗ xe thì pháo hoa đã bắn xong." },
      { speaker: "Sam", english: "Oh no. What did you do afterwards?", vietnamese: "Ôi không. Sau đó các bạn làm gì?" },
      { speaker: "Vy", english: "We had noodles by the lake. Meanwhile, my phone was full of photos from friends!", vietnamese: "Bọn mình ăn mì bên hồ. Trong khi đó, điện thoại mình đầy ảnh bạn bè gửi!" },
      { speaker: "Sam", english: "Next year, leave as soon as you finish dinner.", vietnamese: "Năm sau, ăn tối xong là đi ngay nhé." },
      { speaker: "Vy", english: "Good idea. And we won't take the car during the holiday.", vietnamese: "Ý hay. Và bọn mình sẽ không đi ô tô trong dịp lễ." },
    ],
    practice: [
      q("Complete: I fell asleep ___ the lesson.", ["during", "while", "meanwhile", "as soon as"], "during", "During + noun."),
      q("Complete: She called me ___ I was driving.", ["while", "during", "meanwhile", "by the time"], "while", "While + clause."),
      q("Complete: By the time we got there, the shop ___.", ["had closed", "closed", "has closed", "was close"], "had closed", "By the time: past perfect."),
      q("“Ngay khi” in English is…", ["as soon as", "as long as", "so soon as", "as early"], "as soon as", "As soon as = immediately after."),
    ],
    challenge: [
      q("Complete: ___ the door opened, the dog ran out.", ["The moment", "During", "Meanwhile", "Afterwards"], "The moment", "The moment = exactly when."),
      q("Choose the correct sentence.", ["While we were walking, it started to rain.", "During we were walking, it started to rain.", "During walking we were, it started to rain.", "While the walk, it started to rain."], "While we were walking, it started to rain.", "While + clause."),
      q("Complete: We had dinner and ___ we went dancing.", ["afterwards", "after", "during", "until"], "afterwards", "Afterwards = later."),
      q("Complete: Wait here ___ I come back.", ["until", "by", "during", "meanwhile"], "until", "Until = up to the time when."),
      q("What does “meanwhile” mean?", ["at the same time, in another place", "after a long time", "never", "before"], "at the same time, in another place", "Meanwhile = at the same time."),
    ],
  }, {
    key: "non-defining-clauses", title: "My Uncle, Who Lives in Hue", titleVi: "Mệnh đề quan hệ không xác định",
    objectives: [
      "I can add extra information about people, places and things.",
      "Use commas with who, which, where and whose, but never that",
      "Use which to comment on a whole sentence",
    ],
    vocabulary: [
      { word: "hometown", ipa: "/ˈhəʊmtaʊn/", partOfSpeech: "noun", vietnamese: "quê nhà", definition: "the town where you were born or grew up", example: { english: "My hometown, which is near Vinh, is very quiet.", vietnamese: "Quê tôi, gần Vinh, rất yên tĩnh." } },
      { word: "relative", ipa: "/ˈrelətɪv/", partOfSpeech: "noun", vietnamese: "họ hàng", definition: "a member of your family", example: { english: "All my relatives come together at Tet.", vietnamese: "Tất cả họ hàng tôi tụ họp vào dịp Tết." } },
      { word: "ancestor", ipa: "/ˈænsestə/", partOfSpeech: "noun", vietnamese: "tổ tiên", definition: "a family member who lived a long time ago", example: { english: "We light incense for our ancestors.", vietnamese: "Chúng tôi thắp hương cho tổ tiên." } },
      { word: "generation", ipa: "/ˌdʒenəˈreɪʃn/", partOfSpeech: "noun", vietnamese: "thế hệ", definition: "all the people born at about the same time", example: { english: "Four generations live in this house.", vietnamese: "Bốn thế hệ sống trong ngôi nhà này." } },
      { word: "inherit", ipa: "/ɪnˈherɪt/", partOfSpeech: "verb", vietnamese: "thừa hưởng, thừa kế", definition: "to receive money, property or a quality from a family member", example: { english: "She inherited her grandmother's ring.", vietnamese: "Cô ấy được thừa kế chiếc nhẫn của bà." } },
      { word: "landmark", ipa: "/ˈlændmɑːk/", partOfSpeech: "noun", vietnamese: "địa danh, công trình nổi tiếng", definition: "a famous building or place that is easy to recognise", example: { english: "The One Pillar Pagoda is a famous landmark.", vietnamese: "Chùa Một Cột là một địa danh nổi tiếng." } },
      { word: "remarkable", ipa: "/rɪˈmɑːkəbl/", partOfSpeech: "adjective", vietnamese: "đáng chú ý, phi thường", definition: "unusual and surprising in a good way", example: { english: "She was a remarkable woman.", vietnamese: "Bà ấy là một người phụ nữ phi thường." } },
      { word: "settle", ipa: "/ˈsetl/", partOfSpeech: "verb", vietnamese: "định cư", definition: "to go and live in a place permanently", example: { english: "My great-grandparents settled in Saigon in 1930.", vietnamese: "Cụ tôi định cư ở Sài Gòn năm 1930." } },
    ],
    grammar: [{
      title: "Extra information with commas",
      pattern: "noun, who / which / where / whose + clause, … (never that)",
      explanation: {
        english: "A non-defining relative clause adds extra information about something already clear. Put it between commas: My uncle, who lives in Hue, is a chef. Hoi An, which is a UNESCO site, is very busy. You can't use that in these clauses, and you can't leave out who or which.",
        vietnamese: "Mệnh đề quan hệ không xác định thêm thông tin phụ về một đối tượng đã rõ. Đặt nó giữa hai dấu phẩy: My uncle, who lives in Hue, is a chef. Hoi An, which is a UNESCO site, is very busy. Không được dùng that trong loại mệnh đề này, và không được lược bỏ who hay which.",
      },
      examples: [
        { english: "My grandmother, whose house is by the river, has twelve grandchildren.", vietnamese: "Bà tôi, có ngôi nhà bên sông, có mười hai đứa cháu." },
        { english: "We visited Da Lat, where my parents first met.", vietnamese: "Chúng tôi đến thăm Đà Lạt, nơi bố mẹ tôi gặp nhau lần đầu." },
      ],
      mistake: {
        wrong: "My mother, that is a nurse, works at night.", right: "My mother, who is a nurse, works at night.",
        why: { english: "Clauses between commas can't use that. For people, use who.", vietnamese: "Mệnh đề giữa hai dấu phẩy không dùng that. Với người, dùng who." },
      },
    }, {
      title: "Which about a whole sentence",
      pattern: "sentence, which + verb (= and this …)",
      explanation: {
        english: "Which can refer back to everything in the first part of the sentence, not just one noun: He passed all his exams, which surprised everyone. It rained all week, which meant we stayed inside. Use which here, not what, and put a comma before it.",
        vietnamese: "Which có thể thay cho toàn bộ ý ở phần đầu câu, không chỉ một danh từ: He passed all his exams, which surprised everyone. It rained all week, which meant we stayed inside. Dùng which ở đây, không dùng what, và đặt dấu phẩy trước nó.",
      },
      examples: [
        { english: "She inherited the family business, which was a big responsibility.", vietnamese: "Cô ấy thừa kế công việc kinh doanh của gia đình, đó là một trách nhiệm lớn." },
        { english: "The flight was cancelled, which was annoying.", vietnamese: "Chuyến bay bị huỷ, thật là bực mình." },
      ],
      mistake: {
        wrong: "He forgot my birthday, what made me sad.", right: "He forgot my birthday, which made me sad.",
        why: { english: "To refer to a whole sentence, use which, not what.", vietnamese: "Để thay cho cả câu, dùng which, không dùng what." },
      },
    }],
    examples: [
      { english: "My hometown, where four generations of my family have lived, is changing fast.", vietnamese: "Quê tôi, nơi bốn thế hệ gia đình tôi đã sống, đang thay đổi nhanh chóng." },
      { english: "Our ancestors, who settled here 200 years ago, were fishermen.", vietnamese: "Tổ tiên chúng tôi, những người định cư ở đây 200 năm trước, là ngư dân." },
      { english: "The bridge, which is the town's main landmark, was built in 1920.", vietnamese: "Cây cầu, công trình nổi tiếng nhất của thị trấn, được xây năm 1920." },
      { english: "My aunt, whose life was remarkable, wrote a book about it.", vietnamese: "Dì tôi, người có cuộc đời phi thường, đã viết một cuốn sách về nó." },
    ],
    dialogue: [
      { speaker: "James", english: "Is that a photo of your family?", vietnamese: "Đó là ảnh gia đình bạn à?" },
      { speaker: "Huyen", english: "Yes. That's my great-grandfather, who built our house in Nam Dinh.", vietnamese: "Đúng. Đó là cụ tôi, người đã xây ngôi nhà của chúng tôi ở Nam Định." },
      { speaker: "James", english: "And who's the woman next to him?", vietnamese: "Còn người phụ nữ bên cạnh cụ là ai?" },
      { speaker: "Huyen", english: "His wife, whose father was a teacher. She was remarkable.", vietnamese: "Vợ cụ, có bố là thầy giáo. Cụ bà là người phi thường." },
      { speaker: "James", english: "Do your relatives still live in that house?", vietnamese: "Họ hàng bạn vẫn sống trong ngôi nhà đó chứ?" },
      { speaker: "Huyen", english: "My uncle does, which means we all go there for Tet.", vietnamese: "Chú tôi vẫn sống ở đó, nên Tết cả nhà đều về đấy." },
    ],
    practice: [
      q("Complete: My sister, ___ lives in Canada, is a doctor.", ["who", "that", "which", "where"], "who", "Non-defining, person: who."),
      q("Complete: Hue, ___ was the old capital, is beautiful.", ["which", "that", "who", "where"], "which", "Non-defining, thing: which."),
      q("Complete: He won the lottery, ___ changed his life.", ["which", "what", "that", "who"], "which", "Which = the whole sentence."),
      q("“Tổ tiên” in English is…", ["ancestor", "ancient", "grandparent", "relative old"], "ancestor", "Ancestor = family member long ago."),
    ],
    challenge: [
      q("Complete: My neighbour, ___ son is in my class, is very kind.", ["whose", "who", "which", "that"], "whose", "Belonging: whose."),
      q("Complete: We stayed in Sa Pa, ___ it was very cold.", ["where", "which", "that", "who"], "where", "Place: where."),
      q("Choose the correct sentence.", ["My boss, who is French, speaks Vietnamese.", "My boss, that is French, speaks Vietnamese.", "My boss who is French, speaks Vietnamese.", "My boss, is French, speaks Vietnamese."], "My boss, who is French, speaks Vietnamese.", "Commas and who."),
      q("Complete: He ___ a lot of money from his grandfather.", ["inherited", "inhabited", "settled", "heritaged"], "inherited", "Inherit = receive from family."),
      q("What is a “landmark”?", ["a famous building or place that is easy to recognise", "a piece of land", "a map", "a type of farm"], "a famous building or place that is easy to recognise", "Landmark = famous place."),
    ],
  }, {
    key: "participle-clauses", title: "Walking Home, I Saw…", titleVi: "Mệnh đề phân từ",
    objectives: [
      "I can make my stories shorter and more fluent.",
      "Use an -ing clause when two actions share the same subject",
      "Use Having + past participle for the earlier of two actions",
    ],
    vocabulary: [
      { word: "wander", ipa: "/ˈwɒndə/", partOfSpeech: "verb", vietnamese: "đi lang thang", definition: "to walk slowly with no clear direction", example: { english: "We wandered around the old quarter all afternoon.", vietnamese: "Chúng tôi đi lang thang quanh phố cổ cả buổi chiều." } },
      { word: "notice", ipa: "/ˈnəʊtɪs/", partOfSpeech: "verb", vietnamese: "để ý, nhận thấy", definition: "to see or become aware of something", example: { english: "Did you notice the man in the red hat?", vietnamese: "Bạn có để ý người đàn ông đội mũ đỏ không?" } },
      { word: "spot", ipa: "/spɒt/", partOfSpeech: "verb", vietnamese: "phát hiện, nhìn thấy", definition: "to see something that is hard to see", example: { english: "I spotted a monkey in the trees.", vietnamese: "Tôi phát hiện một con khỉ trên cây." } },
      { word: "rush", ipa: "/rʌʃ/", partOfSpeech: "verb", vietnamese: "vội vã, lao đi", definition: "to move or do something very quickly", example: { english: "She rushed to the station but missed the train.", vietnamese: "Cô ấy vội vã ra ga nhưng vẫn lỡ tàu." } },
      { word: "glance", ipa: "/ɡlɑːns/", partOfSpeech: "verb", vietnamese: "liếc nhìn", definition: "to look at something quickly", example: { english: "He glanced at his watch and stood up.", vietnamese: "Anh ấy liếc nhìn đồng hồ rồi đứng dậy." } },
      { word: "overhear", ipa: "/ˌəʊvəˈhɪə/", partOfSpeech: "verb", vietnamese: "nghe lỏm", definition: "to hear what others are saying without them knowing", example: { english: "I overheard two people talking about me.", vietnamese: "Tôi nghe lỏm được hai người đang nói về mình." } },
      { word: "approach", ipa: "/əˈprəʊtʃ/", partOfSpeech: "verb", vietnamese: "tiến lại gần", definition: "to come nearer to someone or something", example: { english: "A stranger approached me and asked for directions.", vietnamese: "Một người lạ tiến lại gần và hỏi đường tôi." } },
      { word: "worn out", ipa: "/ˌwɔːn ˈaʊt/", partOfSpeech: "adjective", vietnamese: "mệt lả, rã rời", definition: "extremely tired", example: { english: "After the hike, we were completely worn out.", vietnamese: "Sau chuyến đi bộ đường dài, chúng tôi rã rời." } },
    ],
    grammar: [{
      title: "-ing clauses",
      pattern: "Verb-ing …, subject + verb (both actions have the same subject)",
      explanation: {
        english: "An -ing clause can replace a clause with when, while, because or as, making a story more fluent: Walking home, I saw a fox (= While I was walking home…). Feeling tired, she went to bed early (= Because she felt tired…). The subject of the main clause must be the person doing the -ing action.",
        vietnamese: "Mệnh đề -ing có thể thay cho mệnh đề với when, while, because hoặc as, giúp câu chuyện trôi chảy hơn: Walking home, I saw a fox (= While I was walking home…). Feeling tired, she went to bed early (= Because she felt tired…). Chủ ngữ của mệnh đề chính phải là người thực hiện hành động -ing.",
      },
      examples: [
        { english: "Glancing at the clock, he realised he was late.", vietnamese: "Liếc nhìn đồng hồ, anh ấy nhận ra mình bị muộn." },
        { english: "Not knowing the way, we asked a local.", vietnamese: "Không biết đường, chúng tôi hỏi một người dân địa phương." },
      ],
      mistake: {
        wrong: "Walking along the beach, a crab bit my foot.", right: "Walking along the beach, I was bitten by a crab.",
        why: { english: "The subject after the comma must be the one walking: I, not the crab.", vietnamese: "Chủ ngữ sau dấu phẩy phải là người đang đi bộ: I, không phải con cua." },
      },
    }, {
      title: "Having + past participle",
      pattern: "Having + past participle …, subject + verb (the first action finished before the second)",
      explanation: {
        english: "Use Having + past participle to show that one action was completed before the next: Having finished dinner, we went for a walk (= After we had finished…). Having lived in London, she knows the city well. The negative is Not having + past participle.",
        vietnamese: "Dùng Having + quá khứ phân từ để cho thấy một hành động đã hoàn tất trước hành động tiếp theo: Having finished dinner, we went for a walk (= After we had finished…). Having lived in London, she knows the city well. Dạng phủ định là Not having + quá khứ phân từ.",
      },
      examples: [
        { english: "Having missed the last bus, we took a taxi.", vietnamese: "Lỡ chuyến xe buýt cuối, chúng tôi đi taxi." },
        { english: "Not having slept, I was worn out the next day.", vietnamese: "Vì không ngủ, hôm sau tôi rã rời." },
      ],
      mistake: {
        wrong: "Finished my work, I went home.", right: "Having finished my work, I went home.",
        why: { english: "For an earlier finished action, start with Having + past participle.", vietnamese: "Với hành động đã xong trước đó, bắt đầu bằng Having + quá khứ phân từ." },
      },
    }],
    examples: [
      { english: "Wandering through the market, I spotted an old friend.", vietnamese: "Đang lang thang trong chợ, tôi nhìn thấy một người bạn cũ." },
      { english: "Having overheard the news, she rushed home.", vietnamese: "Nghe lỏm được tin, cô ấy vội vã về nhà." },
      { english: "Approaching the house, we noticed the door was open.", vietnamese: "Tiến lại gần ngôi nhà, chúng tôi nhận thấy cửa đang mở." },
      { english: "Worn out after the journey, he fell asleep on the sofa.", vietnamese: "Rã rời sau chuyến đi, anh ấy ngủ thiếp đi trên ghế sofa." },
    ],
    dialogue: [
      { speaker: "Chloe", english: "So how did you find your wallet?", vietnamese: "Vậy bạn tìm lại ví bằng cách nào?" },
      { speaker: "Dat", english: "Having searched the whole flat, I gave up and went out.", vietnamese: "Tìm khắp căn hộ xong, mình bỏ cuộc và đi ra ngoài." },
      { speaker: "Dat", english: "Walking past the café, I noticed a sign in the window.", vietnamese: "Đi ngang qua quán cà phê, mình để ý thấy một tấm biển trên cửa kính." },
      { speaker: "Chloe", english: "What did it say?", vietnamese: "Trên đó ghi gì?" },
      { speaker: "Dat", english: "“Wallet found. Please ask inside.” I'd left it there that morning!", vietnamese: "“Nhặt được ví. Vui lòng hỏi bên trong.” Mình đã để quên ở đó sáng hôm ấy!" },
      { speaker: "Chloe", english: "What luck! Having found it, I hope you bought them a coffee.", vietnamese: "May thật! Tìm được rồi thì mong là bạn đã mua cà phê cảm ơn họ." },
    ],
    practice: [
      q("Complete: ___ along the street, I saw an accident.", ["Walking", "Walked", "Walk", "To walk"], "Walking", "-ing clause, same subject."),
      q("Complete: ___ my homework, I went out.", ["Having finished", "Finished", "Have finished", "To finish"], "Having finished", "Earlier action: Having + past participle."),
      q("Complete: ___ the answer, she stayed silent.", ["Not knowing", "Knowing not", "Don't know", "No knowing"], "Not knowing", "Negative -ing clause."),
      q("“Nghe lỏm” in English is…", ["overhear", "hear over", "underhear", "listen out"], "overhear", "Overhear = hear secretly."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["Opening the door, I saw a strange man.", "Opening the door, a strange man was there.", "Opened the door, I saw a strange man.", "Open the door, I saw a strange man."], "Opening the door, I saw a strange man.", "Same subject: I."),
      q("Complete: ___ in Hanoi for years, he knows every street.", ["Having lived", "Lived", "Live", "Have lived"], "Having lived", "Having + past participle."),
      q("Complete: She ___ at the menu and ordered quickly.", ["glanced", "glanced on", "glimpsed in", "glared to"], "glanced", "Glance at = look quickly."),
      q("Complete: After ten hours of walking, we were ___.", ["worn out", "worn off", "worn down to", "wear out"], "worn out", "Worn out = extremely tired."),
      q("What does “wander” mean?", ["to walk slowly with no clear direction", "to run quickly", "to wonder about something", "to wait"], "to walk slowly with no clear direction", "Wander = walk aimlessly."),
    ],
  }, {
    key: "anecdotes", title: "You'll Never Guess What Happened", titleVi: "Kể giai thoại",
    objectives: [
      "I can tell a funny or surprising story and keep the listener interested.",
      "Use it turned out (that) and turn out to be for surprises",
      "Use so + adjective and such + a + adjective + noun",
    ],
    vocabulary: [
      { word: "anecdote", ipa: "/ˈænɪkdəʊt/", partOfSpeech: "noun", vietnamese: "giai thoại, chuyện vui", definition: "a short, interesting story about a real event", example: { english: "He told a funny anecdote about his first job.", vietnamese: "Anh ấy kể một chuyện vui về công việc đầu tiên." } },
      { word: "hilarious", ipa: "/hɪˈleəriəs/", partOfSpeech: "adjective", vietnamese: "cực kỳ buồn cười", definition: "extremely funny", example: { english: "The film was hilarious. I couldn't stop laughing.", vietnamese: "Bộ phim cực kỳ buồn cười. Tôi cười không ngớt." } },
      { word: "embarrassing", ipa: "/ɪmˈbærəsɪŋ/", partOfSpeech: "adjective", vietnamese: "đáng xấu hổ, ngượng chín mặt", definition: "making you feel silly in front of others", example: { english: "It was so embarrassing when I fell on stage.", vietnamese: "Thật xấu hổ khi tôi ngã trên sân khấu." } },
      { word: "turn out", ipa: "/ˌtɜːn ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "hoá ra", definition: "to happen in an unexpected way, or be discovered to be", example: { english: "The quiet man turned out to be a famous writer.", vietnamese: "Người đàn ông ít nói hoá ra là một nhà văn nổi tiếng." } },
      { word: "to cut a long story short", ipa: "/tə ˌkʌt ə ˌlɒŋ ˈstɔːri ʃɔːt/", partOfSpeech: "idiom", vietnamese: "nói tóm lại", definition: "used to finish a story quickly", example: { english: "To cut a long story short, we missed the wedding.", vietnamese: "Nói tóm lại, chúng tôi đã lỡ đám cưới." } },
      { word: "apparently", ipa: "/əˈpærəntli/", partOfSpeech: "adverb", vietnamese: "nghe nói, hình như", definition: "according to what you have heard", example: { english: "Apparently, the hotel is haunted.", vietnamese: "Nghe nói khách sạn đó có ma." } },
      { word: "believe it or not", ipa: "/bɪˌliːv ɪt ɔː ˈnɒt/", partOfSpeech: "idiom", vietnamese: "tin hay không thì tuỳ", definition: "used before saying something surprising", example: { english: "Believe it or not, I've never eaten pho.", vietnamese: "Tin hay không thì tuỳ, tôi chưa bao giờ ăn phở." } },
      { word: "burst out laughing", ipa: "/ˌbɜːst aʊt ˈlɑːfɪŋ/", partOfSpeech: "collocation", vietnamese: "bật cười", definition: "to suddenly start laughing", example: { english: "When he saw my face, he burst out laughing.", vietnamese: "Thấy mặt tôi, anh ấy bật cười." } },
    ],
    grammar: [{
      title: "It turned out…",
      pattern: "It turned out (that) + clause · subject + turned out + to be + noun / adjective",
      explanation: {
        english: "Turn out tells the listener about a surprise discovered later. Use It turned out that + clause, or subject + turned out to be: It turned out that the “stranger” was my cousin. The weather turned out to be perfect. Turn out is active, so never say It was turned out.",
        vietnamese: "Turn out cho người nghe biết một điều bất ngờ được phát hiện sau đó. Dùng It turned out that + mệnh đề, hoặc chủ ngữ + turned out to be: It turned out that the “stranger” was my cousin. The weather turned out to be perfect. Turn out là chủ động, nên không bao giờ nói It was turned out.",
      },
      examples: [
        { english: "It turned out that I'd been at the wrong station all along.", vietnamese: "Hoá ra tôi đã ở nhầm ga suốt từ đầu." },
        { english: "The test turned out to be easier than I thought.", vietnamese: "Bài kiểm tra hoá ra dễ hơn tôi nghĩ." },
      ],
      mistake: {
        wrong: "It was turned out that he was her brother.", right: "It turned out that he was her brother.",
        why: { english: "Turn out is never passive.", vietnamese: "Turn out không bao giờ ở dạng bị động." },
      },
    }, {
      title: "So and such",
      pattern: "so + adjective / adverb (so funny) · such + a / an + adjective + noun (such a funny story) · such + adjective + plural / uncountable noun",
      explanation: {
        english: "Both add emphasis, often with that + result. Use so before an adjective alone: It was so embarrassing. Use such before a noun phrase, with a / an for singular nouns: It was such an embarrassing moment. They're such nice people. Vietnamese “quá” or “thật là” covers both, so check whether a noun follows.",
        vietnamese: "Cả hai đều dùng để nhấn mạnh, thường kèm that + kết quả. Dùng so trước tính từ đứng một mình: It was so embarrassing. Dùng such trước cụm danh từ, có a / an với danh từ số ít: It was such an embarrassing moment. They're such nice people. “Quá” hay “thật là” trong tiếng Việt dùng cho cả hai, nên hãy xem phía sau có danh từ không.",
      },
      examples: [
        { english: "The joke was so hilarious that everyone burst out laughing.", vietnamese: "Câu đùa buồn cười đến mức ai cũng bật cười." },
        { english: "It was such a long journey that we slept the whole next day.", vietnamese: "Chuyến đi dài đến nỗi chúng tôi ngủ cả ngày hôm sau." },
      ],
      mistake: {
        wrong: "It was so a funny story.", right: "It was such a funny story.",
        why: { english: "Before a / an + adjective + noun, use such.", vietnamese: "Trước a / an + tính từ + danh từ, dùng such." },
      },
    }],
    examples: [
      { english: "Believe it or not, the man next to me on the plane turned out to be my new boss.", vietnamese: "Tin hay không thì tuỳ, người ngồi cạnh tôi trên máy bay hoá ra là sếp mới của tôi." },
      { english: "Apparently, it's one of the most embarrassing stories in the family.", vietnamese: "Nghe nói đó là một trong những chuyện xấu hổ nhất trong gia đình." },
      { english: "To cut a long story short, we got married a year later.", vietnamese: "Nói tóm lại, một năm sau chúng tôi cưới nhau." },
      { english: "He tells such hilarious anecdotes.", vietnamese: "Anh ấy kể những giai thoại vô cùng buồn cười." },
    ],
    dialogue: [
      { speaker: "Tom", english: "You'll never guess what happened at the wedding.", vietnamese: "Bạn sẽ không bao giờ đoán được chuyện gì đã xảy ra ở đám cưới." },
      { speaker: "Ngan", english: "Go on, tell me!", vietnamese: "Kể đi, kể mình nghe!" },
      { speaker: "Tom", english: "I gave a speech about the groom, and it was going so well.", vietnamese: "Mình phát biểu về chú rể, và mọi thứ đang rất suôn sẻ." },
      { speaker: "Tom", english: "Then it turned out I'd been saying the wrong name the whole time!", vietnamese: "Rồi hoá ra mình đã nói sai tên suốt từ đầu!" },
      { speaker: "Ngan", english: "No! That's such an embarrassing mistake!", vietnamese: "Không thể nào! Đúng là một lỗi đáng xấu hổ!" },
      { speaker: "Tom", english: "Luckily, everyone burst out laughing. Even the bride thought it was hilarious.", vietnamese: "May là mọi người đều bật cười. Đến cả cô dâu cũng thấy buồn cười." },
    ],
    practice: [
      q("Complete: It was ___ a beautiful day.", ["such", "so", "very", "too"], "such", "Such + a + adjective + noun."),
      q("Complete: The film was ___ funny.", ["so", "such", "such a", "so a"], "so", "So + adjective."),
      q("Complete: It ___ that he was lying.", ["turned out", "was turned out", "turned up", "turns out to"], "turned out", "It turned out that."),
      q("“Cực kỳ buồn cười” in English is…", ["hilarious", "hilarity", "funnily", "hysterical sad"], "hilarious", "Hilarious = extremely funny."),
    ],
    challenge: [
      q("Complete: The trip turned out ___ a disaster.", ["to be", "being", "be", "that"], "to be", "Turn out to be."),
      q("Complete: They're ___ kind people.", ["such", "so", "such a", "so a"], "such", "Such + adjective + plural noun."),
      q("Choose the correct sentence.", ["It was such an embarrassing moment.", "It was so an embarrassing moment.", "It was such embarrassing moment.", "It was so embarrassing a moment that."], "It was such an embarrassing moment.", "Such + an + adjective + noun."),
      q("Complete: ___, the shop sold out in an hour.", ["Apparently", "Apparent", "Appear", "Apparence"], "Apparently", "Apparently = I heard that."),
      q("When do we say “to cut a long story short”?", ["to finish a story quickly", "to start a long story", "to stop listening", "to cut a piece of paper"], "to finish a story quickly", "Idiom for ending a story."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 5", isReview: true,
    objectives: [
      "I can tell clear, fluent and interesting stories.",
      "Check narrative tenses, time linkers, non-defining clauses, participle clauses, turn out and so / such",
    ],
    vocabulary: [
      { word: "soaked", ipa: "/səʊkt/", partOfSpeech: "adjective", vietnamese: "ướt sũng", definition: "completely wet", example: { english: "My shoes are soaked.", vietnamese: "Giày tôi ướt sũng." } },
      { word: "power cut", ipa: "/ˈpaʊə kʌt/", partOfSpeech: "noun", vietnamese: "mất điện", definition: "a time when the electricity stops working (British English)", example: { english: "We used candles during the power cut.", vietnamese: "Chúng tôi dùng nến khi mất điện." } },
      { word: "as soon as", ipa: "/əz ˈsuːn əz/", partOfSpeech: "conjunction", vietnamese: "ngay khi", definition: "immediately after", example: { english: "Call me as soon as you land.", vietnamese: "Gọi tôi ngay khi bạn hạ cánh nhé." } },
      { word: "relative", ipa: "/ˈrelətɪv/", partOfSpeech: "noun", vietnamese: "họ hàng", definition: "a member of your family", example: { english: "She's staying with relatives in Can Tho.", vietnamese: "Cô ấy đang ở nhà họ hàng ở Cần Thơ." } },
      { word: "notice", ipa: "/ˈnəʊtɪs/", partOfSpeech: "verb", vietnamese: "để ý, nhận thấy", definition: "to see or become aware of something", example: { english: "Nobody noticed that I'd left.", vietnamese: "Không ai để ý là tôi đã đi." } },
      { word: "hilarious", ipa: "/hɪˈleəriəs/", partOfSpeech: "adjective", vietnamese: "cực kỳ buồn cười", definition: "extremely funny", example: { english: "My little brother is hilarious.", vietnamese: "Em trai tôi cực kỳ hài hước." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "had already started · had been working · while + clause / during + noun · by the time … had · my uncle, who … · Walking home, I … · Having finished … · such a funny story",
      explanation: {
        english: "Check these: use the past continuous for background, the past simple for events and the past perfect for earlier events, with had been + -ing for long earlier actions; while takes a clause and during a noun, and by the time usually needs the past perfect; non-defining clauses use commas and never that, and which can refer to a whole sentence; an -ing clause must share the subject, and Having + past participle shows the earlier action; turn out is never passive, and such comes before a noun phrase.",
        vietnamese: "Hãy kiểm tra: dùng quá khứ tiếp diễn cho bối cảnh, quá khứ đơn cho sự kiện và quá khứ hoàn thành cho sự kiện trước đó, với had been + -ing cho hành động kéo dài trước đó; while đi với mệnh đề còn during đi với danh từ, và by the time thường cần quá khứ hoàn thành; mệnh đề không xác định dùng dấu phẩy và không bao giờ dùng that, và which có thể thay cho cả câu; mệnh đề -ing phải chung chủ ngữ, và Having + quá khứ phân từ chỉ hành động trước; turn out không bao giờ ở bị động, và such đứng trước cụm danh từ.",
      },
      examples: [
        { english: "By the time the power cut ended, we had been sitting in the dark for hours.", vietnamese: "Đến lúc có điện lại, chúng tôi đã ngồi trong bóng tối nhiều giờ." },
        { english: "My cousin, who is hilarious, told such a good story.", vietnamese: "Em họ tôi, người cực kỳ hài hước, đã kể một câu chuyện rất hay." },
      ],
    }],
    examples: [
      { english: "As soon as we got out of the taxi, we were soaked.", vietnamese: "Vừa ra khỏi taxi, chúng tôi đã ướt sũng." },
      { english: "Having noticed the smoke, a relative called the fire brigade.", vietnamese: "Nhận thấy khói, một người họ hàng đã gọi cứu hoả." },
      { english: "The power cut turned out to be hilarious: we played games all night.", vietnamese: "Vụ mất điện hoá ra rất vui: chúng tôi chơi trò chơi cả đêm." },
    ],
    dialogue: [
      { speaker: "Ella", english: "How was Tet with your relatives?", vietnamese: "Tết với họ hàng của bạn thế nào?" },
      { speaker: "Khang", english: "Memorable! On New Year's Eve, there was a power cut.", vietnamese: "Đáng nhớ lắm! Đêm giao thừa bị mất điện." },
      { speaker: "Khang", english: "We'd been cooking all day, and suddenly everything went dark.", vietnamese: "Cả nhà đã nấu nướng cả ngày, và đột nhiên mọi thứ tối om." },
      { speaker: "Ella", english: "Oh no! What did you do?", vietnamese: "Ôi không! Các bạn đã làm gì?" },
      { speaker: "Khang", english: "Having found some candles, my grandmother told stories about our ancestors.", vietnamese: "Tìm được ít nến, bà tôi kể chuyện về tổ tiên." },
      { speaker: "Khang", english: "Some of them were hilarious. As soon as the lights came back, we were all a bit sad.", vietnamese: "Có những chuyện cực kỳ buồn cười. Ngay khi có điện lại, ai cũng thấy hơi tiếc." },
      { speaker: "Ella", english: "That's such a lovely story!", vietnamese: "Đó là một câu chuyện thật dễ thương!" },
    ],
    practice: [
      q("Complete: When I got to the cinema, the film ___.", ["had started", "started", "has started", "was start"], "had started", "Earlier event: past perfect."),
      q("Complete: I lost my phone ___ the concert.", ["during", "while", "meanwhile", "as soon as"], "during", "During + noun."),
      q("Complete: My aunt, ___ is a chef, cooked dinner.", ["who", "that", "which", "whose"], "who", "Non-defining: who, never that."),
      q("Complete: ___ my keys, I couldn't get in.", ["Having lost", "Lost", "Lose", "Had lost"], "Having lost", "Having + past participle."),
    ],
    challenge: [
      q("Complete: She was tired because she ___ all day.", ["had been driving", "had been drive", "was drove", "has been driving"], "had been driving", "Had been + -ing."),
      q("Complete: By the time I woke up, everyone ___.", ["had gone", "went", "goes", "has gone"], "had gone", "By the time: past perfect."),
      q("Complete: He missed the bus, ___ made him late.", ["which", "what", "that", "who"], "which", "Which = the whole sentence."),
      q("Choose the correct sentence.", ["It turned out that she was right.", "It was turned out that she was right.", "It turned that she was right out.", "It turns out to she was right."], "It turned out that she was right.", "Turn out is not passive."),
      q("Complete: It was ___ a hilarious evening.", ["such", "so", "very", "too"], "such", "Such + a + adjective + noun."),
    ],
  }],
  assessment: [
    { id: "past-perfect", prompt: "Complete: When we arrived, the train ___.", options: ["had left", "left", "has left", "was leave"], correct: "had left", explanation: "Earlier event: past perfect." },
    { id: "past-continuous", prompt: "Complete: It was midnight and it ___ heavily.", options: ["was snowing", "snowed", "had snowed", "snows"], correct: "was snowing", explanation: "Background: past continuous." },
    { id: "past-perfect-continuous", prompt: "“Tôi mệt vì đã làm việc cả ngày.” in English is…", options: ["I was tired because I had been working all day.", "I was tired because I worked all day long before.", "I was tired because I had been work all day.", "I was tired because I have been working all day."], correct: "I was tired because I had been working all day.", explanation: "Had been + -ing." },
    { id: "while", prompt: "Complete: ___ I was cooking, the phone rang.", options: ["While", "During", "Meanwhile", "By the time"], correct: "While", explanation: "While + clause." },
    { id: "during", prompt: "Complete: Please don't talk ___ the exam.", options: ["during", "while", "meanwhile", "until"], correct: "during", explanation: "During + noun." },
    { id: "by-the-time", prompt: "Complete: By the time the doctor arrived, he ___.", options: ["had recovered", "recovered", "recovers", "has recovered"], correct: "had recovered", explanation: "By the time: past perfect." },
    { id: "as-soon-as", prompt: "Complete: ___ the film ended, we left.", options: ["As soon as", "During", "Meanwhile", "Until"], correct: "As soon as", explanation: "As soon as = immediately after." },
    { id: "non-defining-who", prompt: "Choose the correct sentence.", options: ["My father, who is 60, still plays football.", "My father, that is 60, still plays football.", "My father who is 60, still plays football.", "My father, which is 60, still plays football."], correct: "My father, who is 60, still plays football.", explanation: "Commas and who." },
    { id: "whose", prompt: "Complete: Mr Hai, ___ daughter is my friend, is a doctor.", options: ["whose", "who", "which", "that"], correct: "whose", explanation: "Belonging: whose." },
    { id: "which-sentence", prompt: "Complete: She failed the test, ___ surprised everyone.", options: ["which", "what", "that", "who"], correct: "which", explanation: "Which = the whole sentence." },
    { id: "ing-clause", prompt: "Choose the correct sentence.", options: ["Looking out of the window, I saw a rainbow.", "Looking out of the window, a rainbow appeared.", "Looked out of the window, I saw a rainbow.", "Look out of the window, I saw a rainbow."], correct: "Looking out of the window, I saw a rainbow.", explanation: "Same subject: I." },
    { id: "having-pp", prompt: "Complete: ___ the report, she sent it to her boss.", options: ["Having written", "Written", "Have written", "Wrote"], correct: "Having written", explanation: "Having + past participle." },
    { id: "turn-out", prompt: "Complete: The party turned out ___ great fun.", options: ["to be", "being", "be", "that"], correct: "to be", explanation: "Turn out to be." },
    { id: "such", prompt: "Complete: It was ___ a strange experience.", options: ["such", "so", "very", "too"], correct: "such", explanation: "Such + a + adjective + noun." },
    { id: "so", prompt: "Complete: The story was ___ embarrassing that I went red.", options: ["so", "such", "such an", "so an"], correct: "so", explanation: "So + adjective + that." },
  ],
};
