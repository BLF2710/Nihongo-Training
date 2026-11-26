// B1 Unit 4: Possibilities & Wishes. Vietnamese "nếu", "khi" and "ước gì" carry no tense, so learners write "If it
// will rain…", "I'll call you when I will arrive", "If I have money, I would…", "I wish I can…" and "If I am you";
// "có thể" gives "you can miss the train" for a possibility; and "unless you don't" doubles the negative. This unit
// sets out the tenses English needs in real and imaginary conditions, time clauses, wishes and advice.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B1",
  number: 4,
  lessons: [{
    key: "first-conditional", title: "If It Rains, We'll Stay In", titleVi: "Câu điều kiện loại 1",
    objectives: [
      "I can talk about likely situations in the future and their results.",
      "Use if + present simple with will in the result",
      "Use might for a possible result, not can",
    ],
    vocabulary: [
      { word: "forecast", ipa: "/ˈfɔːkɑːst/", partOfSpeech: "noun", vietnamese: "dự báo", definition: "a statement about what is likely to happen, especially the weather", example: { english: "The forecast says it'll be sunny tomorrow.", vietnamese: "Dự báo nói mai trời nắng." } },
      { word: "probably", ipa: "/ˈprɒbəbli/", partOfSpeech: "adverb", vietnamese: "có lẽ, chắc là", definition: "almost certainly", example: { english: "If it rains, we'll probably stay at home.", vietnamese: "Nếu trời mưa, có lẽ chúng tôi sẽ ở nhà." } },
      { word: "likely", ipa: "/ˈlaɪkli/", partOfSpeech: "adjective", vietnamese: "có khả năng", definition: "probably going to happen", example: { english: "It's likely to be busy at the weekend.", vietnamese: "Cuối tuần có khả năng sẽ đông." } },
      { word: "chance", ipa: "/tʃɑːns/", partOfSpeech: "noun", vietnamese: "khả năng, cơ hội", definition: "how possible it is that something will happen", example: { english: "There's a good chance we'll win.", vietnamese: "Có nhiều khả năng chúng ta sẽ thắng." } },
      { word: "stay in", ipa: "/ˌsteɪ ˈɪn/", partOfSpeech: "phrasal verb", vietnamese: "ở nhà", definition: "to stay at home and not go out", example: { english: "Let's stay in and watch a film tonight.", vietnamese: "Tối nay mình ở nhà xem phim nhé." } },
      { word: "call off", ipa: "/ˌkɔːl ˈɒf/", partOfSpeech: "phrasal verb", vietnamese: "huỷ bỏ", definition: "to decide that a planned event will not happen", example: { english: "They'll call off the match if it snows.", vietnamese: "Họ sẽ huỷ trận đấu nếu tuyết rơi." } },
      { word: "go ahead", ipa: "/ˌɡəʊ əˈhed/", partOfSpeech: "phrasal verb", vietnamese: "diễn ra (như dự kiến)", definition: "to happen as planned", example: { english: "The concert will go ahead if the weather is good.", vietnamese: "Buổi hoà nhạc sẽ diễn ra nếu thời tiết đẹp." } },
      { word: "outdoor", ipa: "/ˈaʊtdɔː/", partOfSpeech: "adjective", vietnamese: "ngoài trời", definition: "happening or used outside, not in a building", example: { english: "The festival has an outdoor stage.", vietnamese: "Lễ hội có một sân khấu ngoài trời." } },
    ],
    grammar: [{
      title: "If + present, will",
      pattern: "If + present simple, will + base verb · will + base verb + if + present simple",
      explanation: {
        english: "For a real, likely situation in the future, use the present simple after if and will in the result: If it rains, we'll stay in. Even though the if part is about the future, it takes the present: never will after if. The if part can come first (with a comma) or second.",
        vietnamese: "Với tình huống có thật, có khả năng xảy ra trong tương lai, dùng hiện tại đơn sau if và will ở mệnh đề kết quả: If it rains, we'll stay in. Dù vế if nói về tương lai, nó vẫn dùng thì hiện tại: không bao giờ dùng will sau if. Vế if có thể đứng trước (có dấu phẩy) hoặc sau.",
      },
      examples: [
        { english: "If you leave now, you'll catch the bus.", vietnamese: "Nếu bạn đi bây giờ, bạn sẽ kịp xe buýt." },
        { english: "We won't go to the beach if it's cold.", vietnamese: "Chúng tôi sẽ không ra biển nếu trời lạnh." },
      ],
      mistake: {
        wrong: "If it will rain tomorrow, we'll stay in.", right: "If it rains tomorrow, we'll stay in.",
        why: { english: "After if, English uses the present simple for the future, not will.", vietnamese: "Sau if, tiếng Anh dùng hiện tại đơn cho tương lai, không dùng will." },
      },
    }, {
      title: "Might for a possible result",
      pattern: "If + present simple, might / may + base verb · If you heat water, it boils (always true)",
      explanation: {
        english: "If the result is only possible, not certain, use might or may: If we're late, we might miss the start. Don't use can for “có thể” about the future; can is for ability or permission. For things that are always true, use the present in both parts: If you heat ice, it melts.",
        vietnamese: "Nếu kết quả chỉ là có thể, không chắc chắn, dùng might hoặc may: If we're late, we might miss the start. Đừng dùng can cho nghĩa “có thể” về tương lai; can dùng cho khả năng hoặc sự cho phép. Với điều luôn đúng, dùng thì hiện tại ở cả hai vế: If you heat ice, it melts.",
      },
      examples: [
        { english: "If the traffic is bad, we might be a bit late.", vietnamese: "Nếu tắc đường, có thể chúng tôi sẽ đến muộn một chút." },
        { english: "If you mix blue and yellow, you get green.", vietnamese: "Nếu trộn màu xanh dương và vàng, bạn sẽ được màu xanh lá." },
      ],
      mistake: {
        wrong: "If you don't hurry, you can miss the train.", right: "If you don't hurry, you might miss the train.",
        why: { english: "Vietnamese “có thể” for a possibility in the future is might or may in English, not can.", vietnamese: "“Có thể” chỉ khả năng xảy ra trong tương lai là might hoặc may trong tiếng Anh, không phải can." },
      },
    }],
    examples: [
      { english: "If the forecast is right, the outdoor concert will go ahead.", vietnamese: "Nếu dự báo đúng, buổi hoà nhạc ngoài trời sẽ diễn ra." },
      { english: "They'll call off the trip if there's a storm.", vietnamese: "Họ sẽ huỷ chuyến đi nếu có bão." },
      { english: "If you study every day, there's a good chance you'll pass.", vietnamese: "Nếu bạn học mỗi ngày, nhiều khả năng bạn sẽ đỗ." },
      { english: "If it's likely to rain, we'll probably stay in.", vietnamese: "Nếu nhiều khả năng mưa, có lẽ chúng tôi sẽ ở nhà." },
    ],
    dialogue: [
      { speaker: "Grace", english: "Are we still going to the food festival on Saturday?", vietnamese: "Thứ Bảy mình vẫn đi lễ hội ẩm thực chứ?" },
      { speaker: "Bao", english: "If the weather's OK, yes. It's all outdoor.", vietnamese: "Nếu thời tiết ổn thì đi. Lễ hội toàn ở ngoài trời." },
      { speaker: "Grace", english: "What does the forecast say?", vietnamese: "Dự báo nói sao?" },
      { speaker: "Bao", english: "There's a chance of storms. If it's really bad, they'll call it off.", vietnamese: "Có khả năng có bão. Nếu tệ quá thì họ sẽ huỷ." },
      { speaker: "Grace", english: "And if they call it off, what will we do?", vietnamese: "Thế nếu họ huỷ thì mình làm gì?" },
      { speaker: "Bao", english: "We'll stay in and I'll cook. We might even have more fun!", vietnamese: "Mình ở nhà và mình sẽ nấu ăn. Biết đâu còn vui hơn!" },
    ],
    practice: [
      q("Complete: If it ___ tomorrow, we'll go to the beach.", ["is sunny", "will be sunny", "would be sunny", "sunny"], "is sunny", "If + present simple."),
      q("Complete: If you call me, I ___ you.", ["'ll help", "help", "would helped", "helping"], "'ll help", "Result: will + base verb."),
      q("Complete: If we're late, we ___ miss the beginning.", ["might", "can", "are", "would to"], "might", "Possible result: might."),
      q("“Huỷ bỏ (sự kiện)” in English is…", ["call off", "call up", "call on", "call in"], "call off", "Call off = cancel."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["I'll text you if I need anything.", "I'll text you if I will need anything.", "I text you if I'll need anything.", "I'd text you if I need anything."], "I'll text you if I need anything.", "Present simple after if."),
      q("Complete: If you heat water to 100°C, it ___.", ["boils", "will boiled", "boiling", "would boil"], "boils", "Always true: present in both parts."),
      q("Complete: If she ___ the bus, she'll be late for work.", ["misses", "will miss", "missed", "miss"], "misses", "He / she / it + -es after if."),
      q("What does “go ahead” mean in “The match will go ahead”?", ["happen as planned", "move forward on foot", "be cancelled", "start early"], "happen as planned", "Go ahead = take place."),
      q("Complete: It's ___ to rain this afternoon. Take an umbrella.", ["likely", "probably", "chance", "possibly"], "likely", "Be likely to + verb."),
    ],
  }, {
    key: "time-clauses", title: "As Soon As and Unless", titleVi: "As soon as và unless",
    objectives: [
      "I can talk about what will happen when, before or until something else happens.",
      "Use the present after when, as soon as, until, before and after for the future",
      "Use unless to mean if … not, and in case for a precaution",
    ],
    vocabulary: [
      { word: "as soon as", ipa: "/əz ˈsuːn əz/", partOfSpeech: "conjunction", vietnamese: "ngay khi", definition: "immediately after something happens", example: { english: "I'll call you as soon as I land.", vietnamese: "Mình sẽ gọi bạn ngay khi hạ cánh." } },
      { word: "until", ipa: "/ənˈtɪl/", partOfSpeech: "conjunction", vietnamese: "cho đến khi", definition: "up to the time when something happens", example: { english: "Wait here until I come back.", vietnamese: "Đợi ở đây cho đến khi tôi quay lại." } },
      { word: "unless", ipa: "/ənˈles/", partOfSpeech: "conjunction", vietnamese: "trừ khi, nếu không", definition: "except if; if … not", example: { english: "We'll be late unless we leave now.", vietnamese: "Chúng ta sẽ muộn nếu không đi ngay." } },
      { word: "in case", ipa: "/ɪn ˈkeɪs/", partOfSpeech: "conjunction", vietnamese: "phòng khi", definition: "because something might happen", example: { english: "Take an umbrella in case it rains.", vietnamese: "Mang ô theo phòng khi trời mưa." } },
      { word: "as long as", ipa: "/əz ˈlɒŋ əz/", partOfSpeech: "conjunction", vietnamese: "miễn là", definition: "only if", example: { english: "You can borrow my car as long as you drive carefully.", vietnamese: "Bạn có thể mượn xe tôi miễn là lái cẩn thận." } },
      { word: "get in touch", ipa: "/ˌɡet ɪn ˈtʌtʃ/", partOfSpeech: "idiom", vietnamese: "liên lạc", definition: "to contact someone", example: { english: "I'll get in touch when I have more news.", vietnamese: "Tôi sẽ liên lạc khi có thêm tin." } },
      { word: "land", ipa: "/lænd/", partOfSpeech: "verb", vietnamese: "hạ cánh", definition: "to come down to the ground after flying", example: { english: "The plane lands at half past six.", vietnamese: "Máy bay hạ cánh lúc sáu giờ rưỡi." } },
      { word: "confirm", ipa: "/kənˈfɜːm/", partOfSpeech: "verb", vietnamese: "xác nhận", definition: "to say or show that something is definitely true or arranged", example: { english: "Please confirm your booking by email.", vietnamese: "Vui lòng xác nhận đặt chỗ qua email." } },
    ],
    grammar: [{
      title: "Present after time words",
      pattern: "when / as soon as / until / before / after + present simple, will + base verb",
      explanation: {
        english: "After time words like when, as soon as, until, before and after, use the present simple for the future, just as after if: I'll call you when I arrive. The other part of the sentence has will. You can also use the present perfect to show something will be finished: I'll tell you after I've spoken to him.",
        vietnamese: "Sau các từ chỉ thời gian như when, as soon as, until, before và after, dùng hiện tại đơn cho tương lai, giống như sau if: I'll call you when I arrive. Vế còn lại dùng will. Bạn cũng có thể dùng hiện tại hoàn thành để nhấn mạnh việc đã xong: I'll tell you after I've spoken to him.",
      },
      examples: [
        { english: "As soon as the results come out, I'll let you know.", vietnamese: "Ngay khi có kết quả, tôi sẽ báo bạn." },
        { english: "Don't open the oven until the cake is ready.", vietnamese: "Đừng mở lò cho đến khi bánh chín." },
      ],
      mistake: {
        wrong: "I'll call you when I will arrive.", right: "I'll call you when I arrive.",
        why: { english: "Like if, time words such as when take the present simple for the future.", vietnamese: "Giống if, các từ chỉ thời gian như when dùng hiện tại đơn cho tương lai." },
      },
    }, {
      title: "Unless and in case",
      pattern: "unless + positive verb (= if … not) · in case + present simple (as a precaution)",
      explanation: {
        english: "Unless means if … not, so the verb after it is positive: Unless you hurry, you'll be late (= If you don't hurry…). In case is different: you do something now because something might happen later: Take a jumper in case it gets cold.",
        vietnamese: "Unless nghĩa là if … not, nên động từ theo sau ở dạng khẳng định: Unless you hurry, you'll be late (= If you don't hurry…). In case khác: bạn làm gì đó bây giờ vì có thể điều gì đó xảy ra sau này: Take a jumper in case it gets cold.",
      },
      examples: [
        { english: "I won't go unless you come with me.", vietnamese: "Tôi sẽ không đi trừ khi bạn đi cùng." },
        { english: "Write down my number in case you get lost.", vietnamese: "Ghi số của tôi lại phòng khi bạn bị lạc." },
      ],
      mistake: {
        wrong: "Unless you don't study, you'll fail.", right: "Unless you study, you'll fail.",
        why: { english: "Unless already means if … not, so don't add another not.", vietnamese: "Unless đã mang nghĩa if … not, nên đừng thêm not nữa." },
      },
    }],
    examples: [
      { english: "I'll get in touch as soon as the hotel confirms our room.", vietnamese: "Tôi sẽ liên lạc ngay khi khách sạn xác nhận phòng." },
      { english: "You can stay out late as long as you text me.", vietnamese: "Con có thể về muộn miễn là nhắn tin cho mẹ." },
      { english: "Before you leave, check that the windows are closed.", vietnamese: "Trước khi đi, nhớ kiểm tra cửa sổ đã đóng chưa." },
      { english: "Bring some cash in case the card machine doesn't work.", vietnamese: "Mang theo ít tiền mặt phòng khi máy quẹt thẻ không hoạt động." },
    ],
    dialogue: [
      { speaker: "Mum", english: "Call me as soon as you land, OK?", vietnamese: "Hạ cánh là gọi mẹ ngay nhé?" },
      { speaker: "Nga", english: "I will. But my phone might not work until I buy a SIM card.", vietnamese: "Con sẽ gọi. Nhưng có thể điện thoại không dùng được cho đến khi con mua sim." },
      { speaker: "Mum", english: "Then message me on Wi-Fi when you get to the hotel.", vietnamese: "Vậy khi về đến khách sạn thì nhắn mẹ qua Wi-Fi." },
      { speaker: "Nga", english: "OK. Unless the Wi-Fi is down!", vietnamese: "Vâng. Trừ khi Wi-Fi bị hỏng!" },
      { speaker: "Mum", english: "Take my friend's number in case you need help.", vietnamese: "Cầm số của bạn mẹ phòng khi con cần giúp." },
      { speaker: "Nga", english: "Thanks, Mum. I'll be fine as long as I don't lose my passport!", vietnamese: "Cảm ơn mẹ. Con sẽ ổn miễn là không làm mất hộ chiếu!" },
    ],
    practice: [
      q("Complete: I'll phone you when I ___ home.", ["get", "will get", "got", "getting"], "get", "Time word + present simple."),
      q("Complete: Stay here ___ I come back.", ["until", "unless", "in case", "as long"], "until", "Until = up to the time when."),
      q("Complete: ___ you hurry, you'll miss the bus.", ["Unless", "If not", "In case", "As soon as"], "Unless", "Unless = if … not."),
      q("“Phòng khi” in English is…", ["in case", "in fact", "unless", "until"], "in case", "In case = as a precaution."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["As soon as I finish, I'll help you.", "As soon as I'll finish, I'll help you.", "As soon as I finish, I help you.", "As soon as I finished, I'll help you."], "As soon as I finish, I'll help you.", "As soon as + present, will."),
      q("Complete: I'll lend you the money ___ you pay me back next week.", ["as long as", "unless", "in case", "until"], "as long as", "As long as = only if."),
      q("Choose the correct sentence.", ["Unless it rains, we'll eat outside.", "Unless it doesn't rain, we'll eat outside.", "Unless it will rain, we'll eat outside.", "Unless it rains, we eat outside will."], "Unless it rains, we'll eat outside.", "No double negative with unless."),
      q("Complete: Take a map ___ your phone dies.", ["in case", "unless", "until", "as long as"], "in case", "A precaution: in case."),
      q("What does “confirm” mean?", ["say that something is definitely arranged", "cancel a booking", "forget a plan", "change a date"], "say that something is definitely arranged", "Confirm = make certain."),
    ],
  }, {
    key: "second-conditional", title: "If I Won the Lottery", titleVi: "Câu điều kiện loại 2",
    objectives: [
      "I can imagine situations that are not real or not likely and say what I would do.",
      "Use if + past simple with would in the result",
      "Choose between the first conditional (likely) and the second (unlikely or unreal)",
    ],
    vocabulary: [
      { word: "win the lottery", ipa: "/ˌwɪn ðə ˈlɒtəri/", partOfSpeech: "collocation", vietnamese: "trúng xổ số", definition: "to get a lot of money in a game where numbers are chosen by chance", example: { english: "What would you do if you won the lottery?", vietnamese: "Bạn sẽ làm gì nếu trúng xổ số?" } },
      { word: "imagine", ipa: "/ɪˈmædʒɪn/", partOfSpeech: "verb", vietnamese: "tưởng tượng", definition: "to make a picture of something in your mind", example: { english: "Imagine you could live anywhere in the world.", vietnamese: "Hãy tưởng tượng bạn có thể sống ở bất cứ đâu trên thế giới." } },
      { word: "millionaire", ipa: "/ˌmɪljəˈneə/", partOfSpeech: "noun", vietnamese: "triệu phú", definition: "a person who has at least a million pounds or dollars", example: { english: "If I were a millionaire, I'd buy a house by the sea.", vietnamese: "Nếu tôi là triệu phú, tôi sẽ mua một ngôi nhà bên biển." } },
      { word: "charity", ipa: "/ˈtʃærəti/", partOfSpeech: "noun", vietnamese: "tổ chức từ thiện", definition: "an organisation that collects money to help people in need", example: { english: "She gives some of her salary to charity.", vietnamese: "Cô ấy dành một phần lương cho từ thiện." } },
      { word: "give up", ipa: "/ˌɡɪv ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "từ bỏ", definition: "to stop doing something", example: { english: "If I had more money, I'd give up my job.", vietnamese: "Nếu có nhiều tiền hơn, tôi sẽ nghỉ việc." } },
      { word: "invisible", ipa: "/ɪnˈvɪzəbl/", partOfSpeech: "adjective", vietnamese: "vô hình, tàng hình", definition: "impossible to see", example: { english: "If you were invisible for a day, what would you do?", vietnamese: "Nếu bạn được tàng hình một ngày, bạn sẽ làm gì?" } },
      { word: "dream job", ipa: "/ˈdriːm dʒɒb/", partOfSpeech: "noun", vietnamese: "công việc mơ ước", definition: "the job you would most like to have", example: { english: "My dream job would be a travel writer.", vietnamese: "Công việc mơ ước của tôi là viết về du lịch." } },
      { word: "realistic", ipa: "/ˌriːəˈlɪstɪk/", partOfSpeech: "adjective", vietnamese: "thực tế", definition: "based on what is possible, not on hopes or dreams", example: { english: "Be realistic. You can't learn Japanese in a month.", vietnamese: "Thực tế đi. Bạn không thể học tiếng Nhật trong một tháng." } },
    ],
    grammar: [{
      title: "If + past, would",
      pattern: "If + past simple, would / 'd + base verb · would + base verb + if + past simple",
      explanation: {
        english: "For situations that are imaginary or very unlikely, now or in the future, use the past simple after if and would in the result: If I won the lottery, I'd travel the world. The past form doesn't mean the past here; it shows the situation isn't real. Never use would after if.",
        vietnamese: "Với tình huống tưởng tượng hoặc rất khó xảy ra, ở hiện tại hay tương lai, dùng quá khứ đơn sau if và would ở mệnh đề kết quả: If I won the lottery, I'd travel the world. Dạng quá khứ ở đây không chỉ quá khứ; nó cho thấy tình huống không có thật. Không bao giờ dùng would sau if.",
      },
      examples: [
        { english: "If I had more free time, I'd learn to play the piano.", vietnamese: "Nếu có nhiều thời gian rảnh hơn, tôi sẽ học chơi piano." },
        { english: "What would you do if you lost your job?", vietnamese: "Bạn sẽ làm gì nếu mất việc?" },
      ],
      mistake: {
        wrong: "If I have a lot of money, I would buy a house.", right: "If I had a lot of money, I would buy a house.",
        why: { english: "With would in the result, the if part takes the past simple.", vietnamese: "Khi vế kết quả có would, vế if dùng quá khứ đơn." },
      },
    }, {
      title: "Likely or unlikely?",
      pattern: "First: If I see him, I'll tell him (likely) · Second: If I saw a ghost, I'd scream (unlikely)",
      explanation: {
        english: "The choice depends on how real the situation feels to you. If it is a real possibility, use the first conditional. If it is imaginary, impossible or very unlikely, use the second. Compare: If I get the job, I'll move to Hanoi (I've had an interview). If I got a job in Paris, I'd move there (just a dream).",
        vietnamese: "Lựa chọn phụ thuộc vào việc tình huống có thật đến đâu với bạn. Nếu đó là khả năng có thật, dùng câu điều kiện loại 1. Nếu là tưởng tượng, không thể hoặc rất khó xảy ra, dùng loại 2. So sánh: If I get the job, I'll move to Hanoi (tôi đã phỏng vấn rồi). If I got a job in Paris, I'd move there (chỉ là mơ ước).",
      },
      examples: [
        { english: "If it's sunny tomorrow, we'll go swimming.", vietnamese: "Nếu mai trời nắng, chúng ta sẽ đi bơi." },
        { english: "If I lived on the moon, I'd miss Vietnamese food.", vietnamese: "Nếu sống trên mặt trăng, tôi sẽ nhớ đồ ăn Việt." },
      ],
      mistake: {
        wrong: "If I would have more time, I would help you.", right: "If I had more time, I would help you.",
        why: { english: "Would goes only in the result, never in the if part.", vietnamese: "Would chỉ đứng ở vế kết quả, không bao giờ ở vế if." },
      },
    }],
    examples: [
      { english: "If I won the lottery, I'd give half of it to charity.", vietnamese: "Nếu trúng xổ số, tôi sẽ dành một nửa cho từ thiện." },
      { english: "Imagine you were invisible. Where would you go?", vietnamese: "Hãy tưởng tượng bạn tàng hình. Bạn sẽ đi đâu?" },
      { english: "I wouldn't give up my job even if I were a millionaire.", vietnamese: "Tôi sẽ không bỏ việc ngay cả khi là triệu phú." },
      { english: "If it were realistic, I'd open a café on the beach. That's my dream job.", vietnamese: "Nếu điều đó thực tế, tôi sẽ mở một quán cà phê trên bãi biển. Đó là công việc mơ ước của tôi." },
    ],
    dialogue: [
      { speaker: "Harry", english: "What would you do if you won the lottery, Yen?", vietnamese: "Yến sẽ làm gì nếu trúng xổ số?" },
      { speaker: "Yen", english: "I'd buy my parents a house in Da Lat.", vietnamese: "Mình sẽ mua cho bố mẹ một căn nhà ở Đà Lạt." },
      { speaker: "Harry", english: "That's lovely. Would you give up your job?", vietnamese: "Dễ thương ghê. Bạn có nghỉ việc không?" },
      { speaker: "Yen", english: "No, I like it too much. But I'd travel more. What about you?", vietnamese: "Không, mình thích công việc lắm. Nhưng mình sẽ đi du lịch nhiều hơn. Còn bạn?" },
      { speaker: "Harry", english: "If I had that much money, I'd start a charity for animals.", vietnamese: "Nếu có nhiều tiền như thế, mình sẽ lập một quỹ từ thiện cho động vật." },
      { speaker: "Yen", english: "We'd need to buy a ticket first, of course!", vietnamese: "Tất nhiên là trước hết phải mua vé số đã!" },
    ],
    practice: [
      q("Complete: If I ___ rich, I'd buy a boat.", ["were", "am", "will be", "would be"], "were", "Second conditional: if + past (were)."),
      q("Complete: If she had a car, she ___ to work.", ["would drive", "will drive", "drives", "drove"], "would drive", "Result: would + base verb."),
      q("“Trúng xổ số” in English is…", ["win the lottery", "get the lottery", "hit a lottery", "earn the lottery"], "win the lottery", "The collocation is win the lottery."),
      q("Complete: What ___ you do if you met a famous actor?", ["would", "will", "do", "did"], "would", "Imaginary: would."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["If I knew the answer, I'd tell you.", "If I would know the answer, I'd tell you.", "If I know the answer, I'd tell you.", "If I knew the answer, I'll tell you."], "If I knew the answer, I'd tell you.", "If + past, would."),
      q("You have an interview tomorrow. Which is best?", ["If I get the job, I'll celebrate.", "If I got the job, I'd celebrate.", "If I will get the job, I'll celebrate.", "If I would get the job, I celebrate."], "If I get the job, I'll celebrate.", "A real possibility: first conditional."),
      q("Complete: If dogs ___ talk, what would they say?", ["could", "can", "will", "would"], "could", "Could = the past form of can."),
      q("Complete: I'd never ___ chocolate, even for a million pounds!", ["give up", "give in", "give out", "give off"], "give up", "Give up = stop doing or having."),
      q("What does “realistic” mean?", ["based on what is possible", "very expensive", "full of dreams", "very old"], "based on what is possible", "Realistic = practical, possible."),
    ],
  }, {
    key: "wishes", title: "I Wish I Had More Time", titleVi: "Câu ước",
    objectives: [
      "I can talk about things I would like to be different in my life.",
      "Use I wish + past simple and I wish I could for the present",
      "Use I wish … would for things other people do that annoy me",
    ],
    vocabulary: [
      { word: "wish", ipa: "/wɪʃ/", partOfSpeech: "verb", vietnamese: "ước", definition: "to want something to be different from how it is", example: { english: "I wish I lived closer to the sea.", vietnamese: "Ước gì tôi sống gần biển hơn." } },
      { word: "if only", ipa: "/ɪf ˈəʊnli/", partOfSpeech: "phrase", vietnamese: "giá mà", definition: "a stronger way to say I wish", example: { english: "If only I had a car!", vietnamese: "Giá mà tôi có ô tô!" } },
      { word: "regret", ipa: "/rɪˈɡret/", partOfSpeech: "verb", vietnamese: "hối tiếc", definition: "to feel sorry about something you did or didn't do", example: { english: "I regret not learning to swim as a child.", vietnamese: "Tôi hối tiếc vì hồi nhỏ không học bơi." } },
      { word: "spare time", ipa: "/ˌspeə ˈtaɪm/", partOfSpeech: "noun", vietnamese: "thời gian rảnh", definition: "time when you are not working", example: { english: "What do you do in your spare time?", vietnamese: "Bạn làm gì lúc rảnh?" } },
      { word: "stressed out", ipa: "/ˌstrest ˈaʊt/", partOfSpeech: "adjective", vietnamese: "căng thẳng", definition: "very worried and tired because of too much work or pressure", example: { english: "I'm so stressed out about my exams.", vietnamese: "Tôi căng thẳng vì các kỳ thi quá." } },
      { word: "jealous", ipa: "/ˈdʒeləs/", partOfSpeech: "adjective", vietnamese: "ghen tị", definition: "unhappy because someone has something you want", example: { english: "I'm a bit jealous of your long holiday.", vietnamese: "Tôi hơi ghen tị với kỳ nghỉ dài của bạn." } },
      { word: "make the most of", ipa: "/ˌmeɪk ðə ˈməʊst əv/", partOfSpeech: "idiom", vietnamese: "tận dụng tối đa", definition: "to use something in the best way while you can", example: { english: "Make the most of your time at university.", vietnamese: "Hãy tận dụng tối đa thời gian ở đại học." } },
      { word: "daydream", ipa: "/ˈdeɪdriːm/", partOfSpeech: "verb", vietnamese: "mơ mộng", definition: "to think about pleasant things instead of what you should be doing", example: { english: "Stop daydreaming and finish your work!", vietnamese: "Thôi mơ mộng và làm xong việc đi!" } },
    ],
    grammar: [{
      title: "I wish + past",
      pattern: "I wish + past simple · I wish I were / was · I wish I could + base verb",
      explanation: {
        english: "To say you want the present to be different, use I wish (or If only) + the past simple: I wish I had more spare time (but I don't). With be, were is common in careful English: I wish I were taller. For abilities, use could: I wish I could speak French.",
        vietnamese: "Để nói bạn muốn hiện tại khác đi, dùng I wish (hoặc If only) + quá khứ đơn: I wish I had more spare time (nhưng tôi không có). Với be, dạng were hay dùng trong tiếng Anh chuẩn mực: I wish I were taller. Với khả năng, dùng could: I wish I could speak French.",
      },
      examples: [
        { english: "I wish I didn't have to work this weekend.", vietnamese: "Ước gì cuối tuần này tôi không phải làm việc." },
        { english: "If only I knew her phone number!", vietnamese: "Giá mà tôi biết số điện thoại của cô ấy!" },
      ],
      mistake: {
        wrong: "I wish I can speak English fluently.", right: "I wish I could speak English fluently.",
        why: { english: "After wish, move the verb one step back: can becomes could.", vietnamese: "Sau wish, lùi động từ một thì: can thành could." },
      },
    }, {
      title: "I wish … would",
      pattern: "I wish + someone / something + would + base verb",
      explanation: {
        english: "Use wish + would to complain about something another person does, or something you want to change but can't control: I wish my neighbours would turn their music down. I wish it would stop raining. Don't use it about yourself: not I wish I would.",
        vietnamese: "Dùng wish + would để phàn nàn về việc người khác làm, hoặc điều bạn muốn thay đổi nhưng không kiểm soát được: I wish my neighbours would turn their music down. I wish it would stop raining. Không dùng cấu trúc này cho chính mình: không nói I wish I would.",
      },
      examples: [
        { english: "I wish you would listen to me!", vietnamese: "Ước gì anh chịu nghe em nói!" },
        { english: "I wish the bus would come.", vietnamese: "Ước gì xe buýt đến." },
      ],
      mistake: {
        wrong: "I wish my brother stops using my laptop.", right: "I wish my brother would stop using my laptop.",
        why: { english: "For another person's annoying habit, use wish + would + base verb.", vietnamese: "Với thói quen gây khó chịu của người khác, dùng wish + would + động từ nguyên mẫu." },
      },
    }],
    examples: [
      { english: "I wish I had more spare time to read.", vietnamese: "Ước gì tôi có nhiều thời gian rảnh hơn để đọc sách." },
      { english: "She's stressed out. She wishes her boss would give her less work.", vietnamese: "Cô ấy căng thẳng lắm. Cô ấy ước sếp giao ít việc hơn." },
      { english: "I regret wasting so much time. I wish I had a second chance.", vietnamese: "Tôi hối tiếc vì đã phí quá nhiều thời gian. Ước gì tôi có cơ hội thứ hai." },
      { english: "Stop daydreaming and make the most of the sunshine!", vietnamese: "Đừng mơ mộng nữa, tận hưởng ánh nắng đi!" },
    ],
    dialogue: [
      { speaker: "Ella", english: "You look stressed out, Hung.", vietnamese: "Trông Hùng căng thẳng quá." },
      { speaker: "Hung", english: "I am. I wish I didn't have so many deadlines.", vietnamese: "Đúng vậy. Ước gì mình không có quá nhiều hạn chót." },
      { speaker: "Ella", english: "Can't you ask your team for help?", vietnamese: "Bạn không nhờ nhóm giúp được à?" },
      { speaker: "Hung", english: "I wish I could, but they're busy too. And I wish my manager would stop adding new tasks!", vietnamese: "Ước gì được, nhưng họ cũng bận. Và ước gì quản lý thôi giao thêm việc mới!" },
      { speaker: "Ella", english: "If only we were on holiday right now.", vietnamese: "Giá mà bây giờ chúng mình đang đi nghỉ." },
      { speaker: "Hung", english: "Stop it, I'm jealous of everyone on a beach today!", vietnamese: "Thôi đi, hôm nay mình ghen tị với tất cả những ai đang ở bãi biển đấy!" },
    ],
    practice: [
      q("Complete: I wish I ___ a bigger flat.", ["had", "have", "will have", "would have"], "had", "Wish + past simple."),
      q("Complete: I wish I ___ play the guitar.", ["could", "can", "will", "would"], "could", "Wish + could for abilities."),
      q("“Giá mà” in English is…", ["If only", "Only if", "As if", "If so"], "If only", "If only = a stronger I wish."),
      q("Complete: I wish it ___ stop raining.", ["would", "will", "is", "does"], "would", "Things you can't control: wish + would."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["I wish I were on holiday.", "I wish I am on holiday.", "I wish I will be on holiday.", "I wish I would be on holiday."], "I wish I were on holiday.", "Wish + were."),
      q("Complete: I wish my flatmate ___ the washing-up.", ["would do", "does", "will do", "do"], "would do", "Another person's habit: wish + would."),
      q("Complete: I regret ___ my old bike. I miss it.", ["selling", "to sell", "sell", "sold"], "selling", "Regret + -ing for something you did."),
      q("Complete: I wish I ___ so tired all the time.", ["wasn't", "am not", "won't be", "don't"], "wasn't", "Wish + past (wasn't)."),
      q("What does “make the most of” mean?", ["use something in the best way", "make a lot of something", "do the least work", "make a mistake"], "use something in the best way", "Make the most of = use fully."),
    ],
  }, {
    key: "if-i-were-you", title: "If I Were You…", titleVi: "Nếu tôi là bạn…",
    objectives: [
      "I can give and ask for advice in different ways.",
      "Give advice with If I were you, I'd…",
      "Use suggest and advise with the right patterns",
    ],
    vocabulary: [
      { word: "advise", ipa: "/ədˈvaɪz/", partOfSpeech: "verb", vietnamese: "khuyên", definition: "to tell someone what you think they should do", example: { english: "The doctor advised me to rest.", vietnamese: "Bác sĩ khuyên tôi nghỉ ngơi." } },
      { word: "suggest", ipa: "/səˈdʒest/", partOfSpeech: "verb", vietnamese: "gợi ý, đề xuất", definition: "to give an idea for someone to think about", example: { english: "I suggest booking early.", vietnamese: "Tôi đề xuất nên đặt sớm." } },
      { word: "suggestion", ipa: "/səˈdʒestʃən/", partOfSpeech: "noun", vietnamese: "lời gợi ý", definition: "an idea someone puts forward", example: { english: "Thanks for the suggestion. I'll try it.", vietnamese: "Cảm ơn lời gợi ý. Tôi sẽ thử." } },
      { word: "ought to", ipa: "/ˈɔːt tə/", partOfSpeech: "phrase", vietnamese: "nên", definition: "should; used for advice or the right thing to do", example: { english: "You ought to apologise to her.", vietnamese: "Bạn nên xin lỗi cô ấy." } },
      { word: "option", ipa: "/ˈɒpʃn/", partOfSpeech: "noun", vietnamese: "lựa chọn", definition: "something you can choose", example: { english: "You have two options: stay or leave.", vietnamese: "Bạn có hai lựa chọn: ở lại hoặc rời đi." } },
      { word: "consider", ipa: "/kənˈsɪdə/", partOfSpeech: "verb", vietnamese: "cân nhắc, xem xét", definition: "to think carefully about something before deciding", example: { english: "Have you considered studying part-time?", vietnamese: "Bạn đã cân nhắc học bán thời gian chưa?" } },
      { word: "worth", ipa: "/wɜːθ/", partOfSpeech: "adjective", vietnamese: "đáng (làm gì)", definition: "good or useful enough to do", example: { english: "It might be worth asking your teacher.", vietnamese: "Có lẽ đáng để hỏi thầy cô của bạn." } },
      { word: "pros and cons", ipa: "/ˌprəʊz ən ˈkɒnz/", partOfSpeech: "idiom", vietnamese: "ưu và nhược điểm", definition: "the good and bad points of something", example: { english: "Let's think about the pros and cons first.", vietnamese: "Hãy nghĩ về ưu và nhược điểm trước đã." } },
    ],
    grammar: [{
      title: "If I were you",
      pattern: "If I were you, I'd (I would) + base verb · I wouldn't + base verb if I were you",
      explanation: {
        english: "A friendly way to give advice is to imagine you are the other person, with the second conditional: If I were you, I'd talk to your manager. Use were, not am or was, in this fixed phrase, and would (not will) in the result.",
        vietnamese: "Một cách thân thiện để khuyên là tưởng tượng mình là người kia, dùng câu điều kiện loại 2: If I were you, I'd talk to your manager. Dùng were, không dùng am hay was, trong cụm cố định này, và would (không phải will) ở vế kết quả.",
      },
      examples: [
        { english: "If I were you, I'd take the job.", vietnamese: "Nếu tôi là bạn, tôi sẽ nhận công việc đó." },
        { english: "I wouldn't eat that if I were you. It smells strange.", vietnamese: "Nếu tôi là bạn thì tôi sẽ không ăn cái đó. Nó có mùi lạ." },
      ],
      mistake: {
        wrong: "If I am you, I will see a doctor.", right: "If I were you, I'd see a doctor.",
        why: { english: "You can't really be the other person, so English uses the unreal form: If I were you, I'd…", vietnamese: "Bạn không thể thật sự là người kia, nên tiếng Anh dùng dạng không có thật: If I were you, I'd…" },
      },
    }, {
      title: "Suggest and advise",
      pattern: "suggest + -ing · suggest (that) + someone + (should) + verb · advise + someone + to + verb",
      explanation: {
        english: "Suggest is followed by -ing or by a that-clause: I suggest taking a taxi. I suggest (that) you take a taxi. It is never followed by someone + to. Advise works differently: advise someone to do something. Other ways: Why don't you…? It might be worth + -ing. You ought to…",
        vietnamese: "Suggest đi với V-ing hoặc mệnh đề that: I suggest taking a taxi. I suggest (that) you take a taxi. Không bao giờ dùng suggest + ai đó + to. Advise thì khác: advise someone to do something. Các cách khác: Why don't you…? It might be worth + V-ing. You ought to…",
      },
      examples: [
        { english: "My teacher advised me to read more in English.", vietnamese: "Cô giáo khuyên tôi đọc nhiều hơn bằng tiếng Anh." },
        { english: "Why don't you consider all your options first?", vietnamese: "Sao bạn không cân nhắc mọi lựa chọn trước?" },
      ],
      mistake: {
        wrong: "He suggested me to rest.", right: "He suggested that I should rest.",
        why: { english: "Suggest never takes someone + to. Use -ing or a that-clause.", vietnamese: "Suggest không bao giờ đi với ai đó + to. Dùng V-ing hoặc mệnh đề that." },
      },
    }],
    examples: [
      { english: "If I were you, I'd write down the pros and cons.", vietnamese: "Nếu tôi là bạn, tôi sẽ ghi ra ưu và nhược điểm." },
      { english: "It's worth considering a cheaper option.", vietnamese: "Đáng để cân nhắc một lựa chọn rẻ hơn." },
      { english: "You ought to tell your parents before you decide.", vietnamese: "Bạn nên nói với bố mẹ trước khi quyết định." },
      { english: "That's a great suggestion. I'll try it tomorrow.", vietnamese: "Gợi ý hay đấy. Mai tôi sẽ thử." },
    ],
    dialogue: [
      { speaker: "Thanh", english: "I've got two job offers and I can't decide. What would you do?", vietnamese: "Mình có hai lời mời làm việc và không quyết được. Bạn sẽ làm gì?" },
      { speaker: "Rosie", english: "What are the options?", vietnamese: "Các lựa chọn là gì?" },
      { speaker: "Thanh", english: "One pays more, but the other is closer to home.", vietnamese: "Một chỗ lương cao hơn, nhưng chỗ kia gần nhà hơn." },
      { speaker: "Rosie", english: "If I were you, I'd consider the journey. Long commutes are tiring.", vietnamese: "Nếu mình là bạn, mình sẽ cân nhắc quãng đường. Đi làm xa mệt lắm." },
      { speaker: "Thanh", english: "That's true. My sister suggested asking about working from home.", vietnamese: "Đúng thật. Chị mình gợi ý hỏi xem có được làm ở nhà không." },
      { speaker: "Rosie", english: "Good idea. It's worth asking before you decide.", vietnamese: "Ý hay đấy. Đáng để hỏi trước khi quyết định." },
    ],
    practice: [
      q("Complete: If I ___ you, I'd apologise.", ["were", "am", "will be", "be"], "were", "Fixed phrase: If I were you."),
      q("Complete: If I were you, I ___ the bus.", ["'d take", "'ll take", "take", "took"], "'d take", "Result: would + base verb."),
      q("Complete: I suggest ___ a jacket. It's cold.", ["taking", "to take", "you to take", "take"], "taking", "Suggest + -ing."),
      q("“Ưu và nhược điểm” in English is…", ["pros and cons", "ups and outs", "goods and bads", "yes and nos"], "pros and cons", "Pros and cons = good and bad points."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["She advised me to study abroad.", "She advised me study abroad.", "She advised me studying abroad.", "She advised to me study abroad."], "She advised me to study abroad.", "Advise someone to + verb."),
      q("Choose the correct sentence.", ["I suggest that you call her.", "I suggest you to call her.", "I suggest to you calling her.", "I suggest you calling to her."], "I suggest that you call her.", "Suggest (that) + subject + verb."),
      q("Complete: It might be worth ___ the price online.", ["checking", "to check", "check", "checked"], "checking", "Worth + -ing."),
      q("Complete: You ___ to see a doctor about that cough.", ["ought", "should", "must", "had"], "ought", "Ought to + verb."),
      q("Complete: I wouldn't buy that phone ___.", ["if I were you", "if I am you", "if I will be you", "when I were you"], "if I were you", "I wouldn't … if I were you."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 4", isReview: true,
    objectives: [
      "I can talk about real and imaginary situations, wishes and advice with the right tenses.",
      "Check if + present / will, time words + present, unless, if + past / would, wish + past and If I were you",
    ],
    vocabulary: [
      { word: "forecast", ipa: "/ˈfɔːkɑːst/", partOfSpeech: "noun", vietnamese: "dự báo", definition: "a statement about what is likely to happen, especially the weather", example: { english: "Did you hear the forecast for the weekend?", vietnamese: "Bạn có nghe dự báo cho cuối tuần chưa?" } },
      { word: "unless", ipa: "/ənˈles/", partOfSpeech: "conjunction", vietnamese: "trừ khi, nếu không", definition: "except if; if … not", example: { english: "I don't drink coffee unless I'm very tired.", vietnamese: "Tôi không uống cà phê trừ khi rất mệt." } },
      { word: "in case", ipa: "/ɪn ˈkeɪs/", partOfSpeech: "conjunction", vietnamese: "phòng khi", definition: "because something might happen", example: { english: "Save your work in case the computer crashes.", vietnamese: "Lưu bài lại phòng khi máy tính bị treo." } },
      { word: "imagine", ipa: "/ɪˈmædʒɪn/", partOfSpeech: "verb", vietnamese: "tưởng tượng", definition: "to make a picture of something in your mind", example: { english: "I can't imagine life without music.", vietnamese: "Tôi không thể tưởng tượng cuộc sống thiếu âm nhạc." } },
      { word: "wish", ipa: "/wɪʃ/", partOfSpeech: "verb", vietnamese: "ước", definition: "to want something to be different from how it is", example: { english: "Do you ever wish you were someone else?", vietnamese: "Bạn có bao giờ ước mình là người khác không?" } },
      { word: "advise", ipa: "/ədˈvaɪz/", partOfSpeech: "verb", vietnamese: "khuyên", definition: "to tell someone what you think they should do", example: { english: "What would you advise me to do?", vietnamese: "Bạn khuyên tôi nên làm gì?" } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "If it rains, we'll… · when I arrive · unless + positive · If I had…, I'd… · I wish I could… · If I were you",
      explanation: {
        english: "Check these: likely futures take if + present and will; when, as soon as, until and before also take the present for the future; unless means if … not, so no extra not; imaginary situations take if + past and would, and would never goes after if; wish + past (or could) for the present, wish + would for other people's habits; advice: If I were you, I'd…, suggest + -ing, advise someone to.",
        vietnamese: "Hãy kiểm tra: tương lai có khả năng xảy ra dùng if + hiện tại và will; when, as soon as, until và before cũng dùng hiện tại cho tương lai; unless nghĩa là if … not, nên không thêm not; tình huống tưởng tượng dùng if + quá khứ và would, và would không bao giờ đứng sau if; wish + quá khứ (hoặc could) cho hiện tại, wish + would cho thói quen của người khác; lời khuyên: If I were you, I'd…, suggest + V-ing, advise someone to.",
      },
      examples: [
        { english: "I'll tell you as soon as I know, unless they ask me not to.", vietnamese: "Tôi sẽ báo bạn ngay khi biết, trừ khi họ dặn tôi đừng nói." },
        { english: "I wish I could help. If I were you, I'd ask Minh.", vietnamese: "Ước gì tôi giúp được. Nếu tôi là bạn, tôi sẽ hỏi Minh." },
      ],
    }],
    examples: [
      { english: "If the forecast is right, we'll have a sunny weekend.", vietnamese: "Nếu dự báo đúng, chúng ta sẽ có cuối tuần nắng đẹp." },
      { english: "Imagine you had a year off. What would you do?", vietnamese: "Hãy tưởng tượng bạn được nghỉ một năm. Bạn sẽ làm gì?" },
      { english: "I'd advise you to bring a coat in case it gets cold.", vietnamese: "Tôi khuyên bạn mang áo khoác phòng khi trời trở lạnh." },
    ],
    dialogue: [
      { speaker: "Sam", english: "I wish I could go on the trip, but I've got an exam.", vietnamese: "Ước gì mình đi chuyến này được, nhưng mình có bài thi." },
      { speaker: "Lan", english: "If you finish revising early, you could join us on Sunday.", vietnamese: "Nếu ôn xong sớm, bạn có thể đi cùng tụi mình vào Chủ nhật." },
      { speaker: "Sam", english: "Maybe. I won't come unless I feel ready, though.", vietnamese: "Có thể. Nhưng mình sẽ không đi trừ khi thấy sẵn sàng." },
      { speaker: "Lan", english: "If I were you, I'd take a break. You've studied all week.", vietnamese: "Nếu mình là bạn, mình sẽ nghỉ ngơi một chút. Bạn học cả tuần rồi." },
      { speaker: "Sam", english: "You're right. I'll call you as soon as I decide.", vietnamese: "Bạn nói đúng. Mình sẽ gọi bạn ngay khi quyết định." },
      { speaker: "Lan", english: "And bring a raincoat in case the forecast is wrong!", vietnamese: "Và mang áo mưa phòng khi dự báo sai nhé!" },
      { speaker: "Sam", english: "If it rained all weekend, I'd just stay in and study!", vietnamese: "Nếu mưa cả cuối tuần thì mình cứ ở nhà học thôi!" },
    ],
    practice: [
      q("Complete: If you ___ hungry later, there's soup in the fridge.", ["are", "will be", "would be", "were being"], "are", "If + present for a likely future."),
      q("Complete: I'll wait here until you ___ back.", ["come", "will come", "came", "would come"], "come", "Until + present."),
      q("Complete: If I ___ a million pounds, I'd buy an island.", ["had", "have", "will have", "would have"], "had", "Imaginary: if + past."),
      q("Complete: I wish I ___ more confident.", ["were", "am", "will be", "would be"], "were", "Wish + were."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["Unless you leave now, you'll miss it.", "Unless you don't leave now, you'll miss it.", "Unless you'll leave now, you'll miss it.", "Unless you left now, you'll miss it."], "Unless you leave now, you'll miss it.", "Unless + positive verb."),
      q("Choose the correct sentence.", ["If I were you, I'd say sorry.", "If I was you, I will say sorry.", "If I am you, I'd say sorry.", "If I were you, I'll say sorry."], "If I were you, I'd say sorry.", "If I were you, I'd…"),
      q("Complete: I wish my neighbour ___ his car horn at night.", ["wouldn't use", "doesn't use", "won't use", "not use"], "wouldn't use", "Another person's habit: wish + would."),
      q("Complete: She suggested ___ the museum first.", ["visiting", "to visit", "us to visit", "visit"], "visiting", "Suggest + -ing."),
      q("Complete: Take some water ___ you get thirsty.", ["in case", "unless", "until", "as long as"], "in case", "A precaution: in case."),
    ],
  }],
  assessment: [
    { id: "first-if", prompt: "Complete: If it ___ this afternoon, the match will be cancelled.", options: ["rains", "will rain", "would rain", "rained"], correct: "rains", explanation: "If + present simple for a likely future." },
    { id: "first-result", prompt: "Complete: If you study hard, you ___ the exam.", options: ["'ll pass", "pass will", "would passed", "passing"], correct: "'ll pass", explanation: "Result: will + base verb." },
    { id: "might", prompt: "Complete: Take a coat. If you don't, you ___ get cold.", options: ["might", "can", "are", "would to"], correct: "might", explanation: "Possible result: might, not can." },
    { id: "zero", prompt: "Complete: If you press this button, the machine ___.", options: ["stops", "will stopped", "stopped", "would stop to"], correct: "stops", explanation: "Always true: present in both parts." },
    { id: "when-present", prompt: "Choose the correct sentence.", options: ["I'll text you when I get there.", "I'll text you when I'll get there.", "I text you when I'll get there.", "I'll text you when I got there."], correct: "I'll text you when I get there.", explanation: "When + present for the future." },
    { id: "unless", prompt: "“Nếu không mặc áo ấm, bạn sẽ bị lạnh.” Choose the best sentence.", options: ["Unless you wear a coat, you'll be cold.", "Unless you don't wear a coat, you'll be cold.", "Unless you will wear a coat, you'll be cold.", "Unless you wore a coat, you'll be cold."], correct: "Unless you wear a coat, you'll be cold.", explanation: "Unless = if … not; no extra not." },
    { id: "in-case", prompt: "Complete: Bring your passport ___ they ask for ID.", options: ["in case", "unless", "until", "as soon as"], correct: "in case", explanation: "A precaution: in case." },
    { id: "second-if", prompt: "Complete: If I ___ a car, I'd drive to work.", options: ["had", "have", "would have", "will have"], correct: "had", explanation: "Imaginary: if + past simple." },
    { id: "no-would-after-if", prompt: "Choose the correct sentence.", options: ["If I had wings, I'd fly to the mountains.", "If I would have wings, I'd fly to the mountains.", "If I have wings, I'd fly to the mountains.", "If I had wings, I'll fly to the mountains."], correct: "If I had wings, I'd fly to the mountains.", explanation: "If + past, would; no would after if." },
    { id: "first-or-second", prompt: "You think it's possible your friend will visit. Which is best?", options: ["If she comes, I'll show her the city.", "If she came, I'd show her the city.", "If she will come, I'll show her the city.", "If she would come, I'd show her the city."], correct: "If she comes, I'll show her the city.", explanation: "A real possibility: first conditional." },
    { id: "wish-past", prompt: "Complete: I wish I ___ in a bigger city.", options: ["lived", "live", "will live", "would live"], correct: "lived", explanation: "Wish + past simple." },
    { id: "wish-could", prompt: "“Ước gì tôi bơi được.” in English is…", options: ["I wish I could swim.", "I wish I can swim.", "I wish I will swim.", "I wish I swim."], correct: "I wish I could swim.", explanation: "Wish + could for abilities." },
    { id: "wish-would", prompt: "Complete: I wish you ___ interrupting me!", options: ["would stop", "stop", "will stop", "stopped to"], correct: "would stop", explanation: "Another person's habit: wish + would." },
    { id: "if-i-were-you", prompt: "Complete: If I ___ you, I'd ask for a refund.", options: ["were", "am", "will be", "would be"], correct: "were", explanation: "Fixed phrase: If I were you." },
    { id: "suggest", prompt: "Choose the correct sentence.", options: ["He suggested going by train.", "He suggested to go by train.", "He suggested me to go by train.", "He suggested go by train."], correct: "He suggested going by train.", explanation: "Suggest + -ing." },
  ],
};
