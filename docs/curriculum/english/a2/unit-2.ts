// A2 Unit 2: Past Experiences. Vietnamese marks the past with words (đã, hôm qua) and never changes the verb, so the
// usual mistakes are a present verb in a past sentence ("Yesterday I go"), "didn't went", a silent -ed ending,
// "before three years" for "three years ago", and the past simple where English needs the past continuous.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "A2",
  number: 2,
  lessons: [{
    key: "last-weekend", title: "Last Weekend", titleVi: "Cuối tuần trước",
    objectives: [
      "I can say what I did last weekend and ask others about theirs.",
      "Add -ed to regular verbs and say the ending as /t/, /d/ or /ɪd/",
      "Ask with did and answer with didn't + the verb",
    ],
    vocabulary: [
      { word: "relax", ipa: "/rɪˈlæks/", partOfSpeech: "verb", vietnamese: "thư giãn, nghỉ ngơi", definition: "to rest and stop worrying or working", example: { english: "We relaxed at home on Saturday.", vietnamese: "Thứ Bảy chúng tôi nghỉ ngơi ở nhà." } },
      { word: "visit", ipa: "/ˈvɪzɪt/", partOfSpeech: "verb", vietnamese: "thăm, đến thăm", definition: "to go and spend time with a person or in a place", example: { english: "I visited my grandmother in Nam Dinh.", vietnamese: "Tôi về thăm bà ở Nam Định." } },
      { word: "tidy up", ipa: "/ˌtaɪdi ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "dọn dẹp", definition: "to put things back in their places so a room looks neat", example: { english: "She tidied up her room on Sunday morning.", vietnamese: "Sáng Chủ nhật cô ấy dọn phòng." } },
      { word: "do the washing", ipa: "/ˌduː ðə ˈwɒʃɪŋ/", partOfSpeech: "collocation", vietnamese: "giặt quần áo", definition: "to wash clothes", example: { english: "I did the washing and cleaned the kitchen.", vietnamese: "Tôi giặt quần áo và lau bếp." } },
      { word: "stay in", ipa: "/ˌsteɪ ˈɪn/", partOfSpeech: "phrasal verb", vietnamese: "ở nhà (không ra ngoài)", definition: "to spend the evening or the day at home", example: { english: "It rained, so we stayed in and watched a film.", vietnamese: "Trời mưa nên chúng tôi ở nhà xem phim." } },
      { word: "go out", ipa: "/ˌɡəʊ ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "đi chơi, ra ngoài", definition: "to leave home to enjoy yourself, for example with friends", example: { english: "Did you go out on Friday night?", vietnamese: "Tối thứ Sáu bạn có đi chơi không?" } },
      { word: "chat", ipa: "/tʃæt/", partOfSpeech: "verb", vietnamese: "trò chuyện, tán gẫu", definition: "to talk in a friendly, informal way", example: { english: "We chatted for hours in a café.", vietnamese: "Chúng tôi tán gẫu hàng giờ ở quán cà phê." } },
      { word: "weekend", ipa: "/ˌwiːkˈend/", partOfSpeech: "noun", vietnamese: "cuối tuần", definition: "Saturday and Sunday", example: { english: "How was your weekend?", vietnamese: "Cuối tuần của bạn thế nào?" } },
    ],
    grammar: [{
      title: "Regular verbs: -ed",
      pattern: "work → worked · stop → stopped · study → studied",
      explanation: {
        english: "The past simple is for finished actions at a finished time. Add -ed to regular verbs; it is the same for every person (I, she, they worked). Say the ending clearly: /t/ after sounds like p, k, s, sh, ch (walked), /ɪd/ after t and d (visited, needed), and /d/ after other sounds (stayed, cleaned).",
        vietnamese: "Thì quá khứ đơn dùng cho hành động đã xong, ở thời điểm đã qua. Thêm -ed vào động từ có quy tắc; mọi ngôi đều giống nhau (I, she, they worked). Hãy phát âm rõ đuôi: /t/ sau các âm như p, k, s, sh, ch (walked), /ɪd/ sau t và d (visited, needed), và /d/ sau các âm khác (stayed, cleaned).",
      },
      examples: [
        { english: "Last Saturday I cleaned the flat and cooked dinner.", vietnamese: "Thứ Bảy tuần trước tôi dọn nhà và nấu bữa tối." },
        { english: "My parents visited us in March.", vietnamese: "Bố mẹ tôi đến thăm chúng tôi vào tháng Ba." },
      ],
      mistake: {
        wrong: "Yesterday I watch a film.", right: "Yesterday I watched a film.",
        why: { english: "In Vietnamese, “hôm qua” is enough to show the past. In English the verb must change too: watched.", vietnamese: "Trong tiếng Việt, chỉ cần “hôm qua” là đủ để chỉ quá khứ. Trong tiếng Anh, động từ cũng phải đổi: watched." },
      },
    }, {
      title: "Did you…? I didn't…",
      pattern: "Did + subject + verb? · subject + didn't + verb",
      explanation: {
        english: "Questions and negatives in the past simple use did and didn't, and then the verb goes back to its base form, with no -ed: Did you relax? I didn't go out. Short answers: Yes, I did. / No, I didn't.",
        vietnamese: "Câu hỏi và câu phủ định ở quá khứ đơn dùng did và didn't, và khi đó động từ trở về dạng nguyên mẫu, không có -ed: Did you relax? I didn't go out. Trả lời ngắn: Yes, I did. / No, I didn't.",
      },
      examples: [
        { english: "Did you chat with Huong yesterday? Yes, I did.", vietnamese: "Hôm qua bạn có nói chuyện với Hương không? Có." },
        { english: "We didn't stay in. We went out with friends.", vietnamese: "Chúng tôi không ở nhà. Chúng tôi đi chơi với bạn bè." },
      ],
      mistake: {
        wrong: "Did you visited your parents?", right: "Did you visit your parents?",
        why: { english: "Did already shows the past, so the verb after it has no -ed.", vietnamese: "Did đã cho biết là quá khứ, nên động từ phía sau không thêm -ed." },
      },
    }],
    examples: [
      { english: "On Saturday morning I tidied up the flat and did the washing.", vietnamese: "Sáng thứ Bảy tôi dọn dẹp căn hộ và giặt quần áo." },
      { english: "In the evening we stayed in and played cards.", vietnamese: "Buổi tối chúng tôi ở nhà và chơi bài." },
      { english: "Did you have a good weekend?", vietnamese: "Cuối tuần của bạn vui chứ?" },
      { english: "I didn't do much. I just relaxed.", vietnamese: "Tôi không làm gì nhiều. Tôi chỉ nghỉ ngơi thôi." },
    ],
    dialogue: [
      { speaker: "Oliver", english: "Morning, Thu! How was your weekend?", vietnamese: "Chào buổi sáng, Thu! Cuối tuần của em thế nào?" },
      { speaker: "Thu", english: "Lovely, thanks. I visited my aunt and we chatted all afternoon.", vietnamese: "Tuyệt lắm, cảm ơn anh. Em đến thăm cô và hai cô cháu nói chuyện cả buổi chiều." },
      { speaker: "Oliver", english: "Did you go out in the evening?", vietnamese: "Buổi tối em có đi chơi không?" },
      { speaker: "Thu", english: "No, I didn't. I stayed in and watched a film. What about you?", vietnamese: "Không ạ. Em ở nhà xem phim. Còn anh thì sao?" },
      { speaker: "Oliver", english: "I just tidied up the flat. Very boring!", vietnamese: "Anh chỉ dọn dẹp căn hộ thôi. Chán lắm!" },
    ],
    practice: [
      q("Complete: Last night we ___ dinner at home.", ["cooked", "cook", "cooks", "cooking"], "cooked", "A finished time (last night) needs the past simple: cooked."),
      q("Choose the correct question.", ["Did you relax on Sunday?", "Did you relaxed on Sunday?", "Do you relaxed on Sunday?", "You did relax on Sunday?"], "Did you relax on Sunday?", "Did + subject + base verb."),
      q("How do you say the -ed in “visited”?", ["/ɪd/", "/t/", "/d/"], "/ɪd/", "After t and d, -ed is an extra syllable: /ɪd/."),
      q("What does “stay in” mean?", ["spend time at home", "stay at a hotel", "go to bed early", "arrive late"], "spend time at home", "To stay in is to spend the evening or day at home."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["We didn't go out last night.", "We didn't went out last night.", "We not go out last night.", "We don't went out last night."], "We didn't go out last night.", "Didn't + base verb."),
      q("Complete: She ___ up her room yesterday.", ["tidied", "tidyed", "tidy", "tidies"], "tidied", "Consonant + y becomes -ied: tidied."),
      q("“Did you have a good weekend?” Choose the best short answer.", ["Yes, I did.", "Yes, I had.", "Yes, I do.", "Yes, I was."], "Yes, I did.", "Answer a Did…? question with did or didn't."),
      q("Which -ed sounds like /t/?", ["walked", "needed", "stayed", "visited"], "walked", "After a k sound, -ed sounds like /t/."),
      q("Complete: I ___ the washing on Saturday.", ["did", "made", "had", "went"], "did", "We say do the washing, so the past is did the washing."),
    ],
  }, {
    key: "irregular-verbs", title: "Common Irregular Verbs", titleVi: "Động từ bất quy tắc thường gặp",
    objectives: [
      "I can talk about the past with the most common irregular verbs.",
      "Use went, had, saw, bought, ate, took, made and got",
      "Use the base form after didn't and did",
    ],
    vocabulary: [
      { word: "went", ipa: "/went/", partOfSpeech: "verb", vietnamese: "đã đi (quá khứ của go)", definition: "the past simple of go", example: { english: "We went to Da Lat last spring.", vietnamese: "Mùa xuân năm ngoái chúng tôi đi Đà Lạt." } },
      { word: "bought", ipa: "/bɔːt/", partOfSpeech: "verb", vietnamese: "đã mua (quá khứ của buy)", definition: "the past simple of buy", example: { english: "She bought a new phone on Monday.", vietnamese: "Cô ấy mua điện thoại mới hôm thứ Hai." } },
      { word: "saw", ipa: "/sɔː/", partOfSpeech: "verb", vietnamese: "đã thấy, đã xem (quá khứ của see)", definition: "the past simple of see", example: { english: "I saw an old friend at the station.", vietnamese: "Tôi gặp một người bạn cũ ở nhà ga." } },
      { word: "took", ipa: "/tʊk/", partOfSpeech: "verb", vietnamese: "đã lấy, đã đi (xe), đã chụp (quá khứ của take)", definition: "the past simple of take", example: { english: "We took a lot of photos.", vietnamese: "Chúng tôi chụp rất nhiều ảnh." } },
      { word: "ate", ipa: "/et/", partOfSpeech: "verb", vietnamese: "đã ăn (quá khứ của eat)", definition: "the past simple of eat", example: { english: "They ate phở for breakfast.", vietnamese: "Họ ăn phở vào bữa sáng." } },
      { word: "got lost", ipa: "/ˌɡɒt ˈlɒst/", partOfSpeech: "collocation", vietnamese: "bị lạc đường", definition: "did not know where you were or how to get somewhere", example: { english: "We got lost in the old town.", vietnamese: "Chúng tôi bị lạc trong phố cổ." } },
      { word: "had a great time", ipa: "/ˌhæd ə ˌɡreɪt ˈtaɪm/", partOfSpeech: "collocation", vietnamese: "đã có khoảng thời gian rất vui", definition: "enjoyed something very much", example: { english: "We had a great time at the beach.", vietnamese: "Chúng tôi đã rất vui ở bãi biển." } },
      { word: "souvenir", ipa: "/ˌsuːvəˈnɪə/", partOfSpeech: "noun", vietnamese: "quà lưu niệm", definition: "something you buy to remember a place", example: { english: "I bought some souvenirs for my colleagues.", vietnamese: "Tôi mua vài món quà lưu niệm cho đồng nghiệp." } },
    ],
    grammar: [{
      title: "Irregular past forms",
      pattern: "go → went · have → had · see → saw · buy → bought",
      explanation: {
        english: "Many common verbs do not add -ed; they have their own past form, which you need to learn: go – went, have – had, see – saw, buy – bought, eat – ate, take – took, make – made, get – got, come – came, say – said. Like regular verbs, the form is the same for every person.",
        vietnamese: "Nhiều động từ thông dụng không thêm -ed mà có dạng quá khứ riêng, cần học thuộc: go – went, have – had, see – saw, buy – bought, eat – ate, take – took, make – made, get – got, come – came, say – said. Giống động từ có quy tắc, mọi ngôi đều dùng cùng một dạng.",
      },
      examples: [
        { english: "I went to Hoi An and ate cao lầu every day.", vietnamese: "Tôi đi Hội An và ngày nào cũng ăn cao lầu." },
        { english: "She made a cake and took it to the party.", vietnamese: "Cô ấy làm một chiếc bánh và mang đến bữa tiệc." },
      ],
      mistake: {
        wrong: "I buyed a souvenir.", right: "I bought a souvenir.",
        why: { english: "Buy is irregular. Adding -ed to an irregular verb is a very common mistake; learn the past form with the verb.", vietnamese: "Buy là động từ bất quy tắc. Thêm -ed vào động từ bất quy tắc là lỗi rất phổ biến; hãy học dạng quá khứ cùng với động từ." },
      },
    }, {
      title: "Didn't go, not didn't went",
      pattern: "I didn't buy … · Did you see …?",
      explanation: {
        english: "With didn't and did, every verb goes back to its base form, irregular verbs too: I didn't see him (not didn't saw). Did you go? (not Did you went?).",
        vietnamese: "Sau didn't và did, mọi động từ đều trở về nguyên mẫu, kể cả động từ bất quy tắc: I didn't see him (không phải didn't saw). Did you go? (không phải Did you went?).",
      },
      examples: [
        { english: "We didn't take the bus. We took a taxi.", vietnamese: "Chúng tôi không đi xe buýt. Chúng tôi đi taxi." },
        { english: "Did you buy any souvenirs?", vietnamese: "Bạn có mua quà lưu niệm nào không?" },
      ],
      mistake: {
        wrong: "I didn't saw the message.", right: "I didn't see the message.",
        why: { english: "The past is already in didn't, so the verb stays in its base form.", vietnamese: "Didn't đã mang nghĩa quá khứ, nên động từ giữ nguyên mẫu." },
      },
    }],
    examples: [
      { english: "Last summer we went to Phu Quoc and had a great time.", vietnamese: "Hè năm ngoái chúng tôi đi Phú Quốc và rất vui." },
      { english: "On the first day we got lost, but a kind man helped us.", vietnamese: "Ngày đầu tiên chúng tôi bị lạc, nhưng một người đàn ông tốt bụng đã giúp chúng tôi." },
      { english: "I saw the sunset and took hundreds of photos.", vietnamese: "Tôi ngắm hoàng hôn và chụp hàng trăm bức ảnh." },
      { english: "We didn't buy any souvenirs because they were expensive.", vietnamese: "Chúng tôi không mua quà lưu niệm vì chúng đắt quá." },
    ],
    dialogue: [
      { speaker: "Sophie", english: "Where did you go for the holiday?", vietnamese: "Kỳ nghỉ bạn đi đâu thế?" },
      { speaker: "Khoa", english: "I went to Hue with my family. We had a great time.", vietnamese: "Mình đi Huế với gia đình. Bọn mình rất vui." },
      { speaker: "Sophie", english: "Did you see the Citadel?", vietnamese: "Bạn có xem Kinh thành không?" },
      { speaker: "Khoa", english: "Yes, we did. And we ate bún bò every morning!", vietnamese: "Có chứ. Và sáng nào bọn mình cũng ăn bún bò!" },
      { speaker: "Sophie", english: "Did you buy me a souvenir?", vietnamese: "Bạn có mua quà lưu niệm cho mình không?" },
      { speaker: "Khoa", english: "Of course. I got you a conical hat.", vietnamese: "Tất nhiên rồi. Mình mua cho bạn một chiếc nón lá." },
    ],
    practice: [
      q("What is the past of “buy”?", ["bought", "buyed", "brought", "buys"], "bought", "Buy – bought. (Brought is the past of bring.)"),
      q("Complete: We ___ to the beach last Sunday.", ["went", "goed", "go", "gone"], "went", "Go – went."),
      q("Choose the correct sentence.", ["I didn't see her yesterday.", "I didn't saw her yesterday.", "I not saw her yesterday.", "I don't saw her yesterday."], "I didn't see her yesterday.", "Didn't + base verb: see."),
      q("“We got lost” means…", ["we didn't know where we were", "we lost our bags", "we arrived late", "we lost a game"], "we didn't know where we were", "To get lost is not to know where you are."),
    ],
    challenge: [
      q("Complete: She ___ a cake for my birthday.", ["made", "maked", "make", "did"], "made", "Make – made; we make a cake."),
      q("Choose the correct question.", ["Did you take many photos?", "Did you took many photos?", "Did you taked many photos?", "Do you took many photos?"], "Did you take many photos?", "Did + base verb: take."),
      q("Complete: They ___ phở for lunch.", ["ate", "eated", "eat", "eaten"], "ate", "Eat – ate."),
      q("Which word is something you buy to remember a trip?", ["souvenir", "ticket", "passport", "receipt"], "souvenir", "A souvenir helps you remember a place."),
      q("Choose the natural sentence.", ["We had a great time in Hue.", "We had a great time at Hue yesterday ago.", "We have a great time in Hue last year.", "We had great time in Hue."], "We had a great time in Hue.", "Have a great time → had a great time, with a."),
    ],
  }, {
    key: "time-expressions", title: "Ago, Last and Yesterday", titleVi: "Ago, last và yesterday",
    objectives: [
      "I can say when something happened in the past.",
      "Put ago after the time: three years ago",
      "Use last, yesterday, in and on without the",
    ],
    vocabulary: [
      { word: "ago", ipa: "/əˈɡəʊ/", partOfSpeech: "adverb", vietnamese: "cách đây", definition: "before now; it comes after a length of time", example: { english: "I moved to Hanoi five years ago.", vietnamese: "Tôi chuyển đến Hà Nội cách đây năm năm." } },
      { word: "the day before yesterday", ipa: "/ðə ˌdeɪ bɪˌfɔː ˈjestədeɪ/", partOfSpeech: "phrase", vietnamese: "hôm kia", definition: "two days ago", example: { english: "She arrived the day before yesterday.", vietnamese: "Cô ấy đến hôm kia." } },
      { word: "last night", ipa: "/ˌlɑːst ˈnaɪt/", partOfSpeech: "phrase", vietnamese: "tối qua, đêm qua", definition: "yesterday evening or the night that has just finished", example: { english: "Did you sleep well last night?", vietnamese: "Đêm qua bạn ngủ ngon không?" } },
      { word: "recently", ipa: "/ˈriːsntli/", partOfSpeech: "adverb", vietnamese: "gần đây", definition: "not long ago", example: { english: "I recently started a new job.", vietnamese: "Gần đây tôi bắt đầu một công việc mới." } },
      { word: "at the time", ipa: "/ət ðə ˈtaɪm/", partOfSpeech: "phrase", vietnamese: "vào lúc đó", definition: "at the moment in the past that you are talking about", example: { english: "I was only ten at the time.", vietnamese: "Lúc đó tôi mới mười tuổi." } },
      { word: "move house", ipa: "/ˌmuːv ˈhaʊs/", partOfSpeech: "collocation", vietnamese: "chuyển nhà", definition: "to leave your home and go to live in a different one", example: { english: "We moved house last year.", vietnamese: "Năm ngoái chúng tôi chuyển nhà." } },
      { word: "graduate", ipa: "/ˈɡrædʒueɪt/", partOfSpeech: "verb", vietnamese: "tốt nghiệp", definition: "to finish your studies at a university", example: { english: "He graduated in 2020.", vietnamese: "Anh ấy tốt nghiệp năm 2020." } },
      { word: "for the first time", ipa: "/fə ðə ˌfɜːst ˈtaɪm/", partOfSpeech: "phrase", vietnamese: "lần đầu tiên", definition: "when something happens and it has never happened before", example: { english: "I saw snow for the first time in Sa Pa.", vietnamese: "Tôi nhìn thấy tuyết lần đầu tiên ở Sa Pa." } },
    ],
    grammar: [{
      title: "Three years ago",
      pattern: "length of time + ago: two days ago · a long time ago",
      explanation: {
        english: "Ago comes after the length of time and counts back from now: ten minutes ago, three years ago. Use it with the past simple. Don't say “before three years” or “three years before”.",
        vietnamese: "Ago đứng sau khoảng thời gian và tính ngược từ bây giờ: ten minutes ago, three years ago. Dùng với thì quá khứ đơn. Đừng nói “before three years” hay “three years before”.",
      },
      examples: [
        { english: "My sister graduated two years ago.", vietnamese: "Chị tôi tốt nghiệp cách đây hai năm." },
        { english: "I had lunch an hour ago, so I'm not hungry.", vietnamese: "Tôi ăn trưa cách đây một tiếng nên giờ không đói." },
      ],
      mistake: {
        wrong: "I came to Hanoi before three years.", right: "I came to Hanoi three years ago.",
        why: { english: "Vietnamese “cách đây ba năm” or “ba năm trước” is three years ago in English, with ago at the end.", vietnamese: "“Cách đây ba năm” hay “ba năm trước” trong tiếng Anh là three years ago, với ago đứng cuối." },
      },
    }, {
      title: "Last, yesterday, in, on",
      pattern: "last week · yesterday morning · in 2019 · on Monday",
      explanation: {
        english: "No preposition and no the before last and yesterday: last week, last summer, yesterday afternoon. Use in for years, months and seasons (in 2019, in May), and on for days and dates (on Monday, on 2nd September). But: last night, not yesterday night.",
        vietnamese: "Không dùng giới từ và không dùng the trước last và yesterday: last week, last summer, yesterday afternoon. Dùng in cho năm, tháng và mùa (in 2019, in May), on cho thứ và ngày (on Monday, on 2nd September). Lưu ý: nói last night, không nói yesterday night.",
      },
      examples: [
        { english: "We moved house last summer.", vietnamese: "Mùa hè năm ngoái chúng tôi chuyển nhà." },
        { english: "I met him on Tuesday, not yesterday.", vietnamese: "Tôi gặp anh ấy hôm thứ Ba, không phải hôm qua." },
      ],
      mistake: {
        wrong: "I saw her in last week.", right: "I saw her last week.",
        why: { english: "Last already says when, so no in, on or the comes before it.", vietnamese: "Last đã cho biết thời điểm, nên không cần in, on hay the phía trước." },
      },
    }],
    examples: [
      { english: "I recently moved house. We moved two weeks ago.", vietnamese: "Gần đây tôi chuyển nhà. Chúng tôi chuyển cách đây hai tuần." },
      { english: "She went to London for the first time in 2022.", vietnamese: "Cô ấy đến London lần đầu tiên vào năm 2022." },
      { english: "I called you last night, but you didn't answer.", vietnamese: "Tối qua tôi gọi cho bạn nhưng bạn không nghe máy." },
      { english: "We met at university. We were nineteen at the time.", vietnamese: "Chúng tôi gặp nhau ở trường đại học. Lúc đó chúng tôi mười chín tuổi." },
    ],
    dialogue: [
      { speaker: "Harry", english: "How long ago did you graduate?", vietnamese: "Bạn tốt nghiệp được bao lâu rồi?" },
      { speaker: "Vy", english: "I graduated four years ago, in 2021.", vietnamese: "Mình tốt nghiệp cách đây bốn năm, vào năm 2021." },
      { speaker: "Harry", english: "And when did you start this job?", vietnamese: "Còn bạn bắt đầu công việc này khi nào?" },
      { speaker: "Vy", english: "Quite recently, actually. I started last month, on the 3rd.", vietnamese: "Thật ra là mới đây thôi. Mình bắt đầu tháng trước, vào ngày mùng 3." },
      { speaker: "Harry", english: "Is this your first job in England?", vietnamese: "Đây là công việc đầu tiên của bạn ở Anh à?" },
      { speaker: "Vy", english: "Yes. I came here for the first time last year.", vietnamese: "Đúng vậy. Mình đến đây lần đầu tiên vào năm ngoái." },
    ],
    practice: [
      q("Choose the correct sentence.", ["I started university five years ago.", "I started university before five years.", "I started university ago five years.", "I started university five years before now ago."], "I started university five years ago.", "Length of time + ago."),
      q("Complete: We went to Da Nang ___ summer.", ["last", "in last", "the last", "on last"], "last", "No preposition before last."),
      q("Complete: He was born ___ 1998.", ["in", "on", "at", "last"], "in", "In for years."),
      q("What does “recently” mean?", ["not long ago", "a long time ago", "every day", "in the future"], "not long ago", "Recently = not long ago."),
    ],
    challenge: [
      q("Choose the natural English.", ["last night", "yesterday night", "the last night", "in last night"], "last night", "We say last night, not yesterday night."),
      q("Complete: I met my best friend ___ Monday.", ["on", "in", "at", "last on"], "on", "On for days."),
      q("“Hôm kia” in English is…", ["the day before yesterday", "the day after tomorrow", "yesterday ago", "last two days"], "the day before yesterday", "Two days ago is the day before yesterday."),
      q("Complete: I was a student ___. Now I'm a teacher.", ["at the time", "in the time", "on time", "at time"], "at the time", "At the time = then, at that moment in the past."),
      q("Choose the correct sentence.", ["We moved house a month ago.", "We moved house ago a month.", "We move house a month ago.", "We moved the house a month ago."], "We moved house a month ago.", "Move house (no the), past simple, ago at the end."),
    ],
  }, {
    key: "past-continuous", title: "What Were You Doing?", titleVi: "Lúc đó bạn đang làm gì?",
    objectives: [
      "I can say what was happening at a moment in the past.",
      "Use was / were + verb-ing for an action in progress",
      "Join a longer action and a short one with when and while",
    ],
    vocabulary: [
      { word: "power cut", ipa: "/ˈpaʊə kʌt/", partOfSpeech: "noun", vietnamese: "mất điện", definition: "a time when the electricity stops working", example: { english: "There was a power cut while we were eating.", vietnamese: "Đang ăn thì mất điện." } },
      { word: "pour", ipa: "/pɔː/", partOfSpeech: "verb", vietnamese: "mưa như trút; rót", definition: "to rain very heavily; to make a liquid flow from a container", example: { english: "It was pouring when I left the office.", vietnamese: "Lúc tôi rời văn phòng trời đang mưa như trút." } },
      { word: "ring", ipa: "/rɪŋ/", partOfSpeech: "verb", vietnamese: "reo (điện thoại); gọi điện", definition: "to make a sound like a bell; in British English, to phone someone", example: { english: "My phone rang while I was driving.", vietnamese: "Điện thoại tôi reo khi tôi đang lái xe." } },
      { word: "drop", ipa: "/drɒp/", partOfSpeech: "verb", vietnamese: "đánh rơi", definition: "to let something fall by accident", example: { english: "She dropped her glass when she heard the noise.", vietnamese: "Cô ấy đánh rơi cái cốc khi nghe thấy tiếng động." } },
      { word: "fall asleep", ipa: "/ˌfɔːl əˈsliːp/", partOfSpeech: "collocation", vietnamese: "ngủ thiếp đi", definition: "to start sleeping", example: { english: "I fell asleep while I was reading.", vietnamese: "Tôi ngủ thiếp đi khi đang đọc sách." } },
      { word: "wait for", ipa: "/ˈweɪt fə/", partOfSpeech: "phrasal verb", vietnamese: "chờ, đợi", definition: "to stay somewhere until someone comes or something happens", example: { english: "We were waiting for the bus when it started to rain.", vietnamese: "Chúng tôi đang đợi xe buýt thì trời bắt đầu mưa." } },
      { word: "while", ipa: "/waɪl/", partOfSpeech: "conjunction", vietnamese: "trong khi", definition: "during the time that something else is happening", example: { english: "While I was cooking, my son was doing his homework.", vietnamese: "Trong khi tôi nấu ăn thì con trai tôi làm bài tập." } },
      { word: "suddenly", ipa: "/ˈsʌdənli/", partOfSpeech: "adverb", vietnamese: "đột nhiên", definition: "quickly and when you do not expect it", example: { english: "Suddenly, the lights went out.", vietnamese: "Đột nhiên đèn tắt phụt." } },
    ],
    grammar: [{
      title: "Was / were + -ing",
      pattern: "I / he / she / it was working · you / we / they were working",
      explanation: {
        english: "The past continuous describes an action in progress at a moment in the past: At eight o'clock I was having dinner. Use was with I, he, she and it, and were with you, we and they. Questions: What were you doing? Negatives: I wasn't sleeping.",
        vietnamese: "Thì quá khứ tiếp diễn diễn tả một hành động đang diễn ra tại một thời điểm trong quá khứ: At eight o'clock I was having dinner. Dùng was với I, he, she, it và were với you, we, they. Câu hỏi: What were you doing? Phủ định: I wasn't sleeping.",
      },
      examples: [
        { english: "What were you doing at ten last night? I was watching football.", vietnamese: "Mười giờ tối qua bạn đang làm gì? Tôi đang xem bóng đá." },
        { english: "It was pouring and we weren't wearing coats.", vietnamese: "Trời đang mưa như trút mà chúng tôi lại không mặc áo khoác." },
      ],
      mistake: {
        wrong: "At nine I watched TV, so I didn't hear the phone.", right: "At nine I was watching TV, so I didn't hear the phone.",
        why: { english: "Vietnamese uses “đang” for both present and past. In the past, đang becomes was / were + -ing.", vietnamese: "Tiếng Việt dùng “đang” cho cả hiện tại và quá khứ. Ở quá khứ, “đang” chuyển thành was / were + -ing." },
      },
    }, {
      title: "When and while",
      pattern: "I was cooking when the phone rang · While I was cooking, the phone rang",
      explanation: {
        english: "Use the past continuous for the longer background action and the past simple for the short action that interrupts it. When usually comes before the short action, and while before the longer one.",
        vietnamese: "Dùng quá khứ tiếp diễn cho hành động dài làm nền, và quá khứ đơn cho hành động ngắn xen vào. When thường đứng trước hành động ngắn, còn while đứng trước hành động dài.",
      },
      examples: [
        { english: "We were waiting for a taxi when it started to pour.", vietnamese: "Chúng tôi đang đợi taxi thì trời bắt đầu mưa như trút." },
        { english: "While she was walking home, she dropped her keys.", vietnamese: "Khi đang đi bộ về nhà, cô ấy đánh rơi chìa khoá." },
      ],
    }],
    examples: [
      { english: "I was working at my desk when there was a power cut.", vietnamese: "Tôi đang làm việc ở bàn thì mất điện." },
      { english: "The children were playing outside while their parents were chatting.", vietnamese: "Bọn trẻ chơi ngoài sân trong khi bố mẹ chúng trò chuyện." },
      { english: "Suddenly my phone rang, and I dropped it.", vietnamese: "Đột nhiên điện thoại reo, và tôi đánh rơi nó." },
      { english: "He fell asleep while he was watching the film.", vietnamese: "Anh ấy ngủ thiếp đi khi đang xem phim." },
    ],
    dialogue: [
      { speaker: "Grace", english: "I rang you last night at about nine. Where were you?", vietnamese: "Tối qua khoảng chín giờ mình gọi cho bạn. Bạn ở đâu thế?" },
      { speaker: "Nam", english: "Sorry! I was waiting for the bus and it was pouring.", vietnamese: "Xin lỗi nhé! Lúc đó mình đang đợi xe buýt mà trời mưa như trút." },
      { speaker: "Grace", english: "Oh no. Were you getting wet?", vietnamese: "Ôi không. Bạn có bị ướt không?" },
      { speaker: "Nam", english: "Very! And when I got home, there was a power cut.", vietnamese: "Ướt sũng! Rồi khi về đến nhà thì bị mất điện." },
      { speaker: "Grace", english: "What a night! What were you doing in the dark?", vietnamese: "Đúng là một buổi tối tệ hại! Bạn làm gì trong bóng tối thế?" },
      { speaker: "Nam", english: "Nothing. I fell asleep on the sofa.", vietnamese: "Chẳng làm gì cả. Mình ngủ thiếp đi trên ghế sofa." },
    ],
    practice: [
      q("Complete: At eight o'clock we ___ dinner.", ["were having", "was having", "had having", "are having"], "were having", "We + were + -ing."),
      q("Complete: She ___ when I called.", ["was sleeping", "were sleeping", "sleeping", "is sleep"], "was sleeping", "She + was + -ing."),
      q("Choose the correct question.", ["What were you doing at ten?", "What did you doing at ten?", "What was you doing at ten?", "What you were doing at ten?"], "What were you doing at ten?", "Question word + were + you + -ing."),
      q("What does “a power cut” mean?", ["the electricity stops working", "a short haircut", "a strong storm", "a cut on your hand"], "the electricity stops working", "A power cut is when there is no electricity."),
    ],
    challenge: [
      q("Choose the best sentence.", ["I was cooking when the phone rang.", "I cooked when the phone was ringing.", "I was cooking when the phone was ring.", "I cook when the phone rang."], "I was cooking when the phone rang.", "Long action: was cooking; short action: rang."),
      q("Complete: ___ I was walking home, I saw an accident.", ["While", "When I", "During", "Suddenly"], "While", "While + the longer action."),
      q("Complete: It ___ heavily, so we stayed inside.", ["was pouring", "were pouring", "pours", "was pour"], "was pouring", "It + was + -ing."),
      q("“Ngủ thiếp đi” in English is…", ["fall asleep", "go asleep", "get sleep", "fall sleep"], "fall asleep", "We say fall asleep (past: fell asleep)."),
      q("Choose the correct negative.", ["We weren't listening.", "We wasn't listening.", "We didn't listening.", "We weren't listen."], "We weren't listening.", "We + weren't + -ing."),
    ],
  }, {
    key: "telling-a-story", title: "Telling a Story", titleVi: "Kể một câu chuyện",
    objectives: [
      "I can tell a short story about something that happened to me.",
      "Order events with first, then, after that and in the end",
      "Mix the past simple and the past continuous in a story",
    ],
    vocabulary: [
      { word: "first of all", ipa: "/ˌfɜːst əv ˈɔːl/", partOfSpeech: "phrase", vietnamese: "trước hết, đầu tiên", definition: "used to introduce the first event or point", example: { english: "First of all, we checked into the hotel.", vietnamese: "Đầu tiên, chúng tôi nhận phòng khách sạn." } },
      { word: "after that", ipa: "/ˌɑːftə ˈðæt/", partOfSpeech: "phrase", vietnamese: "sau đó", definition: "next, following what you have just said", example: { english: "After that, we went for a walk.", vietnamese: "Sau đó, chúng tôi đi dạo." } },
      { word: "in the end", ipa: "/ɪn ði ˈend/", partOfSpeech: "phrase", vietnamese: "cuối cùng", definition: "after a lot of time or problems", example: { english: "In the end, we found a small hotel.", vietnamese: "Cuối cùng, chúng tôi tìm được một khách sạn nhỏ." } },
      { word: "luckily", ipa: "/ˈlʌkɪli/", partOfSpeech: "adverb", vietnamese: "may mắn thay", definition: "used to say that something good happened by chance", example: { english: "Luckily, someone found my wallet.", vietnamese: "May mắn thay, có người đã tìm thấy ví của tôi." } },
      { word: "unfortunately", ipa: "/ʌnˈfɔːtʃənətli/", partOfSpeech: "adverb", vietnamese: "không may, đáng tiếc", definition: "used to say that something bad happened", example: { english: "Unfortunately, the train was late.", vietnamese: "Không may là tàu bị trễ." } },
      { word: "miss", ipa: "/mɪs/", partOfSpeech: "verb", vietnamese: "lỡ (chuyến xe, tàu)", definition: "to arrive too late for a bus, train or plane", example: { english: "We missed the last train home.", vietnamese: "Chúng tôi lỡ chuyến tàu cuối cùng về nhà." } },
      { word: "realise", ipa: "/ˈrɪəlaɪz/", partOfSpeech: "verb", vietnamese: "nhận ra", definition: "to suddenly understand or notice something", example: { english: "At the airport I realised I didn't have my passport.", vietnamese: "Đến sân bay tôi mới nhận ra mình không mang hộ chiếu." } },
      { word: "embarrassed", ipa: "/ɪmˈbærəst/", partOfSpeech: "adjective", vietnamese: "ngượng, xấu hổ", definition: "feeling silly or uncomfortable in front of other people", example: { english: "I felt so embarrassed when I fell over.", vietnamese: "Tôi thấy ngượng chín người khi bị ngã." } },
    ],
    grammar: [{
      title: "Putting events in order",
      pattern: "First of all … Then … After that … In the end …",
      explanation: {
        english: "Sequence words help a listener follow your story. Start with first of all or first, continue with then and after that, and finish with in the end or finally. Then needs no comma; after that and in the end usually have one at the start of a sentence.",
        vietnamese: "Các từ chỉ trình tự giúp người nghe theo dõi câu chuyện. Bắt đầu bằng first of all hoặc first, tiếp theo dùng then và after that, kết thúc bằng in the end hoặc finally. Sau then không cần dấu phẩy; after that và in the end thường có dấu phẩy khi đứng đầu câu.",
      },
      examples: [
        { english: "First, we had breakfast. Then we got on the boat.", vietnamese: "Đầu tiên, chúng tôi ăn sáng. Rồi chúng tôi lên thuyền." },
        { english: "After that, we swam in the bay. In the end, we were very tired.", vietnamese: "Sau đó, chúng tôi bơi ở vịnh. Cuối cùng, chúng tôi rất mệt." },
      ],
    }, {
      title: "Background and events",
      pattern: "background: was / were + -ing · events: past simple",
      explanation: {
        english: "A good story sets the scene with the past continuous (The sun was shining. People were sitting outside.) and moves forward with the past simple (Suddenly a man ran in and shouted). Luckily and unfortunately show how you feel about what happened.",
        vietnamese: "Một câu chuyện hay dùng quá khứ tiếp diễn để tả bối cảnh (The sun was shining. People were sitting outside.) và dùng quá khứ đơn để kể các sự việc tiếp nối (Suddenly a man ran in and shouted). Luckily và unfortunately thể hiện cảm xúc của bạn về điều đã xảy ra.",
      },
      examples: [
        { english: "It was raining and everyone was rushing home.", vietnamese: "Trời đang mưa và ai cũng vội vã về nhà." },
        { english: "Unfortunately, I missed the bus, so I walked.", vietnamese: "Không may tôi lỡ xe buýt nên phải đi bộ." },
      ],
      mistake: {
        wrong: "In the end of the trip, we were tired.", right: "At the end of the trip, we were tired.",
        why: { english: "In the end means “finally, after everything”. At the end of + a thing means the last part of it.", vietnamese: "In the end nghĩa là “cuối cùng, sau tất cả”. At the end of + danh từ nghĩa là phần cuối của cái gì đó." },
      },
    }],
    examples: [
      { english: "We were driving to Mai Chau when the car broke down.", vietnamese: "Chúng tôi đang lái xe đến Mai Châu thì xe bị hỏng." },
      { english: "Luckily, a farmer stopped and helped us.", vietnamese: "May mắn thay, một bác nông dân dừng lại giúp chúng tôi." },
      { english: "I realised my phone was in the taxi, so I felt really embarrassed.", vietnamese: "Tôi nhận ra điện thoại để quên trên taxi nên thấy rất ngượng." },
      { english: "In the end, we arrived three hours late, but we had a great evening.", vietnamese: "Cuối cùng, chúng tôi đến muộn ba tiếng, nhưng buổi tối rất vui." },
    ],
    dialogue: [
      { speaker: "Jack", english: "You look tired. What happened?", vietnamese: "Trông bạn mệt quá. Có chuyện gì thế?" },
      { speaker: "Hien", english: "First of all, I missed the last bus after work.", vietnamese: "Đầu tiên là mình lỡ chuyến xe buýt cuối cùng sau giờ làm." },
      { speaker: "Jack", english: "Oh dear. What did you do?", vietnamese: "Ôi trời. Thế bạn làm gì?" },
      { speaker: "Hien", english: "I was walking to the taxi rank when I realised my wallet was at the office.", vietnamese: "Mình đang đi bộ ra bến taxi thì nhận ra ví để quên ở văn phòng." },
      { speaker: "Jack", english: "Oh no! And then?", vietnamese: "Ôi không! Rồi sao nữa?" },
      { speaker: "Hien", english: "Luckily, a colleague was still there. In the end, she drove me home.", vietnamese: "May mà một đồng nghiệp vẫn còn ở đó. Cuối cùng chị ấy lái xe đưa mình về." },
    ],
    practice: [
      q("Which word starts a story?", ["First of all", "In the end", "After that", "Finally"], "First of all", "First of all introduces the first event."),
      q("Complete: ___, the bus was late, so I missed my meeting.", ["Unfortunately", "Luckily", "First", "In the end of"], "Unfortunately", "Unfortunately introduces something bad."),
      q("“Miss the train” means…", ["arrive too late for it", "feel sad about it", "take the wrong one", "sit on it"], "arrive too late for it", "To miss a train is to arrive after it leaves."),
      q("Complete: The sun ___ and people were sitting outside.", ["was shining", "shone shining", "shines", "were shining"], "was shining", "Set the scene with the past continuous: the sun was shining."),
    ],
    challenge: [
      q("Choose the natural ending to a story.", ["In the end, we got home safely.", "In the end of, we got home safely.", "At the end, we get home safely.", "Finally of all, we got home safely."], "In the end, we got home safely.", "In the end = finally, after everything."),
      q("Complete: I was ordering food when I ___ I had no money.", ["realised", "was realising", "realise", "realised that was"], "realised", "The short, sudden action is past simple."),
      q("Choose the British spelling.", ["realise", "realize", "reelise", "realice"], "realise", "This course uses -ise: realise."),
      q("Complete: ___, a stranger found my phone and gave it back.", ["Luckily", "Unfortunately", "Embarrassed", "After"], "Luckily", "Luckily introduces something good that happened by chance."),
      q("How did you feel? “Everyone laughed when I fell over. I felt so ___.”", ["embarrassed", "embarrassing", "relaxed", "lucky"], "embarrassed", "-ed adjectives describe how a person feels: embarrassed."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 2", isReview: true,
    objectives: [
      "I can talk about past events and tell a short story accurately.",
      "Check -ed and irregular forms, didn't + base verb, ago, and was / were + -ing",
    ],
    vocabulary: [
      { word: "went", ipa: "/went/", partOfSpeech: "verb", vietnamese: "đã đi (quá khứ của go)", definition: "the past simple of go", example: { english: "We went to the cinema last night.", vietnamese: "Tối qua chúng tôi đi xem phim." } },
      { word: "bought", ipa: "/bɔːt/", partOfSpeech: "verb", vietnamese: "đã mua (quá khứ của buy)", definition: "the past simple of buy", example: { english: "He bought a souvenir for his mum.", vietnamese: "Anh ấy mua quà lưu niệm cho mẹ." } },
      { word: "ago", ipa: "/əˈɡəʊ/", partOfSpeech: "adverb", vietnamese: "cách đây", definition: "before now; it comes after a length of time", example: { english: "She left an hour ago.", vietnamese: "Cô ấy đi cách đây một tiếng." } },
      { word: "while", ipa: "/waɪl/", partOfSpeech: "conjunction", vietnamese: "trong khi", definition: "during the time that something else is happening", example: { english: "While we were eating, it started to rain.", vietnamese: "Trong khi chúng tôi đang ăn thì trời bắt đầu mưa." } },
      { word: "miss", ipa: "/mɪs/", partOfSpeech: "verb", vietnamese: "lỡ (chuyến xe, tàu)", definition: "to arrive too late for a bus, train or plane", example: { english: "Hurry up or we'll miss the train!", vietnamese: "Nhanh lên không chúng ta lỡ tàu bây giờ!" } },
      { word: "in the end", ipa: "/ɪn ði ˈend/", partOfSpeech: "phrase", vietnamese: "cuối cùng", definition: "after a lot of time or problems", example: { english: "In the end, we stayed in.", vietnamese: "Cuối cùng chúng tôi ở nhà." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "watched · didn't go · three years ago · last week · was cooking when … rang",
      explanation: {
        english: "When you talk about the past, check these: the verb changes (-ed or its irregular form); after did and didn't the verb is in its base form; ago comes after the time; no in, on or the before last and yesterday; and was / were + -ing for the longer background action.",
        vietnamese: "Khi nói về quá khứ, hãy kiểm tra: động từ phải đổi (-ed hoặc dạng bất quy tắc); sau did và didn't động từ ở dạng nguyên mẫu; ago đứng sau khoảng thời gian; không dùng in, on hay the trước last và yesterday; và dùng was / were + -ing cho hành động nền kéo dài.",
      },
      examples: [
        { english: "Two weeks ago I went to Hoi An. I didn't take my camera.", vietnamese: "Cách đây hai tuần tôi đi Hội An. Tôi không mang máy ảnh." },
        { english: "I was walking by the river when I saw an old friend.", vietnamese: "Tôi đang đi dạo bên sông thì gặp một người bạn cũ." },
      ],
    }],
    examples: [
      { english: "Last weekend we stayed in on Saturday and went out on Sunday.", vietnamese: "Cuối tuần trước chúng tôi ở nhà hôm thứ Bảy và đi chơi hôm Chủ nhật." },
      { english: "I bought my first motorbike ten years ago.", vietnamese: "Tôi mua chiếc xe máy đầu tiên cách đây mười năm." },
      { english: "While I was waiting, I chatted with a friendly old man.", vietnamese: "Trong lúc đợi, tôi trò chuyện với một ông cụ thân thiện." },
    ],
    dialogue: [
      { speaker: "Amelia", english: "Did you have a good holiday?", vietnamese: "Kỳ nghỉ của bạn vui chứ?" },
      { speaker: "Tung", english: "Yes! We went to Ha Long Bay a week ago.", vietnamese: "Vui lắm! Một tuần trước bọn mình đi vịnh Hạ Long." },
      { speaker: "Amelia", english: "What was the best part?", vietnamese: "Phần thích nhất là gì?" },
      { speaker: "Tung", english: "We were sailing round the islands when we saw the sunset. It was amazing.", vietnamese: "Bọn mình đang đi thuyền quanh các đảo thì ngắm được hoàng hôn. Tuyệt vời lắm." },
      { speaker: "Amelia", english: "And the worst part?", vietnamese: "Còn phần tệ nhất?" },
      { speaker: "Tung", english: "We missed the bus back, but in the end we got a taxi.", vietnamese: "Bọn mình lỡ chuyến xe về, nhưng cuối cùng cũng bắt được taxi." },
    ],
    practice: [
      q("Choose the correct sentence.", ["I went to Hue two years ago.", "I go to Hue two years ago.", "I went to Hue before two years.", "I goed to Hue two years ago."], "I went to Hue two years ago.", "Went (irregular) + time + ago."),
      q("Complete: Did you ___ the news?", ["see", "saw", "seen", "seeing"], "see", "Did + base verb."),
      q("Complete: We were sleeping ___ the fire alarm rang.", ["when", "while", "during", "ago"], "when", "When + the short action."),
      q("Choose the correct sentence.", ["We had dinner with them last Friday.", "We had dinner with them on last Friday.", "We had dinner with them the last Friday.", "We have dinner with them last Friday."], "We had dinner with them last Friday.", "Past simple, and no on before last."),
    ],
    challenge: [
      q("Choose the correct question.", ["What were you doing when I called?", "What did you doing when I called?", "What you were doing when I called?", "What was you doing when I called?"], "What were you doing when I called?", "What + were + you + -ing."),
      q("Complete: She ___ her keys while she was running for the bus.", ["dropped", "droped", "was drop", "drops"], "dropped", "Drop doubles the p: dropped."),
      q("Complete: I didn't ___ any souvenirs.", ["buy", "bought", "buyed", "buying"], "buy", "Didn't + base verb."),
      q("Which word introduces good news in a story?", ["Luckily", "Unfortunately", "Suddenly", "After that"], "Luckily", "Luckily = by good luck."),
      q("How do you say the -ed in “needed”?", ["/ɪd/", "/t/", "/d/"], "/ɪd/", "After d, -ed is /ɪd/."),
    ],
  }],
  assessment: [
    { id: "past-regular", prompt: "Complete: Yesterday I ___ my grandparents.", options: ["visited", "visit", "visits", "visiting"], correct: "visited", explanation: "A finished time needs the past simple." },
    { id: "ied-spelling", prompt: "Complete: He ___ English at university.", options: ["studied", "studyed", "studies", "studyied"], correct: "studied", explanation: "Consonant + y becomes -ied." },
    { id: "did-question", prompt: "Choose the correct question.", options: ["Did you go out last night?", "Did you went out last night?", "Do you went out last night?", "Went you out last night?"], correct: "Did you go out last night?", explanation: "Did + base verb." },
    { id: "didnt-base", prompt: "Choose the correct sentence.", options: ["She didn't eat breakfast.", "She didn't ate breakfast.", "She not ate breakfast.", "She doesn't ate breakfast."], correct: "She didn't eat breakfast.", explanation: "Didn't + base verb." },
    { id: "irregular-buy", prompt: "Complete: I ___ a new laptop last month.", options: ["bought", "buyed", "brought", "buy"], correct: "bought", explanation: "Buy – bought." },
    { id: "irregular-take", prompt: "Complete: We ___ a taxi to the airport.", options: ["took", "taked", "take", "taken"], correct: "took", explanation: "Take – took." },
    { id: "ed-sound", prompt: "In which word does -ed sound like /ɪd/?", options: ["wanted", "played", "watched", "cleaned"], correct: "wanted", explanation: "After t, -ed is /ɪd/." },
    { id: "ago", prompt: "Choose the correct sentence.", options: ["I met him six months ago.", "I met him before six months.", "I met him ago six months.", "I meet him six months ago."], correct: "I met him six months ago.", explanation: "Time + ago, with the past simple." },
    { id: "no-prep-last", prompt: "Complete: They got married ___ year.", options: ["last", "in last", "the last", "on last"], correct: "last", explanation: "No preposition before last." },
    { id: "last-night", prompt: "Choose the natural English.", options: ["I slept badly last night.", "I slept badly yesterday night.", "I slept badly in last night.", "I slept badly the last night."], correct: "I slept badly last night.", explanation: "Last night, not yesterday night." },
    { id: "past-continuous-form", prompt: "Complete: At midnight they ___ a film.", options: ["were watching", "was watching", "watching", "were watch"], correct: "were watching", explanation: "They + were + -ing." },
    { id: "when-interrupt", prompt: "Choose the best sentence.", options: ["I was having a shower when the doorbell rang.", "I had a shower when the doorbell was ringing.", "I was having a shower when the doorbell was ring.", "I have a shower when the doorbell rang."], correct: "I was having a shower when the doorbell rang.", explanation: "Long action: past continuous; short action: past simple." },
    { id: "while-long", prompt: "Complete: ___ she was driving, she listened to the radio.", options: ["While", "During", "Ago", "In the end"], correct: "While", explanation: "While + the longer action." },
    { id: "in-the-end", prompt: "Complete: We looked everywhere. ___, we found the keys in the car.", options: ["In the end", "At the end", "In the end of", "First of all"], correct: "In the end", explanation: "In the end = finally, after everything." },
    { id: "embarrassed", prompt: "Complete: I called my teacher “Mum”. I was so ___!", options: ["embarrassed", "embarrassing", "lucky", "relaxing"], correct: "embarrassed", explanation: "-ed adjectives say how a person feels." },
  ],
};
