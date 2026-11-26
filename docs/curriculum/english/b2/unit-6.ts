// B2 Unit 6: Ideas & Opinions. Vietnamese speakers give every reporting verb the same pattern ("She suggested me to
// go", "He apologised to be late"); "chắc là không" becomes "He mustn't have seen us"; past guesses lose have ("She
// might forgot"); emphasis copies "cái mà" ("The thing what I like"); hedges go passive ("It is seemed that") or lose
// to ("Prices are likely rise"); and essays open with "Firstly of all" and "In my point of view". This unit puts those
// right for discussing ideas and writing a clear argument.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B2",
  number: 6,
  lessons: [{
    key: "reporting-verbs", title: "She Suggested Going", titleVi: "Động từ tường thuật",
    objectives: [
      "I can report what people suggested, advised, refused or denied.",
      "Use the right pattern after each reporting verb: -ing, to + verb, or object + to",
      "Use reporting verbs with a preposition + -ing: accuse of, apologise for",
    ],
    vocabulary: [
      { word: "suggest", ipa: "/səˈdʒest/", partOfSpeech: "verb", vietnamese: "gợi ý, đề xuất", definition: "to put forward an idea for others to consider", example: { english: "She suggested taking a taxi.", vietnamese: "Cô ấy gợi ý đi taxi." } },
      { word: "recommend", ipa: "/ˌrekəˈmend/", partOfSpeech: "verb", vietnamese: "giới thiệu, khuyên dùng", definition: "to say that something is good or should be done", example: { english: "I recommend booking early.", vietnamese: "Tôi khuyên bạn nên đặt sớm." } },
      { word: "advise", ipa: "/ədˈvaɪz/", partOfSpeech: "verb", vietnamese: "khuyên", definition: "to tell someone what you think they should do", example: { english: "The doctor advised me to rest.", vietnamese: "Bác sĩ khuyên tôi nghỉ ngơi." } },
      { word: "accuse", ipa: "/əˈkjuːz/", partOfSpeech: "verb", vietnamese: "buộc tội", definition: "to say someone has done something wrong (+ of)", example: { english: "They accused him of lying.", vietnamese: "Họ buộc tội anh ta nói dối." } },
      { word: "deny", ipa: "/dɪˈnaɪ/", partOfSpeech: "verb", vietnamese: "phủ nhận", definition: "to say something is not true", example: { english: "She denied taking the money.", vietnamese: "Cô ấy phủ nhận việc lấy tiền." } },
      { word: "refuse", ipa: "/rɪˈfjuːz/", partOfSpeech: "verb", vietnamese: "từ chối", definition: "to say you will not do something", example: { english: "He refused to answer the question.", vietnamese: "Anh ta từ chối trả lời câu hỏi." } },
      { word: "persuade", ipa: "/pəˈsweɪd/", partOfSpeech: "verb", vietnamese: "thuyết phục", definition: "to make someone agree to do something by giving reasons", example: { english: "I persuaded my dad to buy an electric bike.", vietnamese: "Tôi thuyết phục bố mua xe đạp điện." } },
      { word: "apologise", ipa: "/əˈpɒlədʒaɪz/", partOfSpeech: "verb", vietnamese: "xin lỗi", definition: "to say sorry (British spelling; + for)", example: { english: "He apologised for being late.", vietnamese: "Anh ấy xin lỗi vì đến muộn." } },
    ],
    grammar: [{
      title: "Three verb patterns",
      pattern: "+ -ing: suggest, recommend, deny, admit · + to + verb: refuse, agree, offer, promise · + object + to + verb: advise, persuade, warn, tell",
      explanation: {
        english: "Reporting verbs sum up what someone said, but each has its own pattern. Suggest, recommend and deny take -ing (or a that clause): She suggested leaving early. Refuse, agree and offer take to + verb: He refused to help. Advise, persuade and warn take an object + to: They advised us to wait. Suggest never takes object + to.",
        vietnamese: "Động từ tường thuật tóm tắt điều ai đó đã nói, nhưng mỗi động từ có cấu trúc riêng. Suggest, recommend và deny đi với -ing (hoặc mệnh đề that): She suggested leaving early. Refuse, agree và offer đi với to + động từ: He refused to help. Advise, persuade và warn đi với tân ngữ + to: They advised us to wait. Suggest không bao giờ đi với tân ngữ + to.",
      },
      examples: [
        { english: "The guide recommended visiting the caves in the morning.", vietnamese: "Hướng dẫn viên khuyên nên tham quan hang vào buổi sáng." },
        { english: "My friend persuaded me to apply for the job.", vietnamese: "Bạn tôi thuyết phục tôi nộp đơn xin việc." },
      ],
      mistake: {
        wrong: "She suggested me to go by train.", right: "She suggested going by train. / She suggested that I go by train.",
        why: { english: "Suggest takes -ing or a that clause, never object + to.", vietnamese: "Suggest đi với -ing hoặc mệnh đề that, không bao giờ đi với tân ngữ + to." },
      },
    }, {
      title: "Verb + preposition + -ing",
      pattern: "accuse someone of · blame someone for · apologise for · insist on · thank someone for + verb-ing",
      explanation: {
        english: "Some reporting verbs are followed by a preposition, and a preposition is always followed by -ing: They accused her of cheating. He apologised for breaking the glass. She insisted on paying. Don't use to + verb after these.",
        vietnamese: "Một số động từ tường thuật đi kèm giới từ, mà sau giới từ luôn là -ing: They accused her of cheating. He apologised for breaking the glass. She insisted on paying. Không dùng to + động từ sau các cụm này.",
      },
      examples: [
        { english: "The manager blamed me for losing the client.", vietnamese: "Quản lý đổ lỗi cho tôi vì làm mất khách hàng." },
        { english: "Thank you for helping me with my essay.", vietnamese: "Cảm ơn bạn đã giúp tôi viết bài luận." },
      ],
      mistake: {
        wrong: "He apologised to be late.", right: "He apologised for being late.",
        why: { english: "Apologise for + -ing.", vietnamese: "Apologise for + -ing." },
      },
    }],
    examples: [
      { english: "He denied breaking the window, but his friend admitted it.", vietnamese: "Cậu ấy phủ nhận làm vỡ cửa sổ, nhưng bạn cậu ấy đã thừa nhận." },
      { english: "The teacher advised us to read the question carefully.", vietnamese: "Giáo viên khuyên chúng tôi đọc kỹ câu hỏi." },
      { english: "She refused to apologise for what she'd said.", vietnamese: "Cô ấy từ chối xin lỗi vì những gì đã nói." },
      { english: "They accused the company of hiding the truth.", vietnamese: "Họ buộc tội công ty che giấu sự thật." },
    ],
    dialogue: [
      { speaker: "Ollie", english: "How was the meeting with the landlord?", vietnamese: "Buổi gặp chủ nhà thế nào?" },
      { speaker: "Hanh", english: "Difficult. He accused us of damaging the kitchen.", vietnamese: "Khó khăn lắm. Ông ấy buộc tội bọn mình làm hỏng bếp." },
      { speaker: "Ollie", english: "But it was broken when we moved in!", vietnamese: "Nhưng nó đã hỏng từ khi chúng ta chuyển đến mà!" },
      { speaker: "Hanh", english: "I know. I denied doing anything, and I suggested checking the old photos.", vietnamese: "Mình biết. Mình phủ nhận đã làm gì, và gợi ý xem lại ảnh cũ." },
      { speaker: "Ollie", english: "Good idea. Did he agree to look at them?", vietnamese: "Ý hay. Ông ấy có đồng ý xem không?" },
      { speaker: "Hanh", english: "Eventually. Then he apologised for blaming us!", vietnamese: "Cuối cùng thì có. Rồi ông ấy xin lỗi vì đã đổ lỗi cho bọn mình!" },
    ],
    practice: [
      q("Complete: He suggested ___ a break.", ["taking", "to take", "us to take", "take"], "taking", "Suggest + -ing."),
      q("Complete: She refused ___ me the money.", ["to lend", "lending", "lend", "for lending"], "to lend", "Refuse + to."),
      q("Complete: My mum advised me ___ the job.", ["to take", "taking", "take", "for taking"], "to take", "Advise + object + to."),
      q("“Phủ nhận” in English is…", ["deny", "refuse", "reject to", "denial"], "deny", "Deny = say it's not true."),
    ],
    challenge: [
      q("Complete: They accused him ___ the documents.", ["of stealing", "to steal", "for steal", "stealing"], "of stealing", "Accuse of + -ing."),
      q("Choose the correct sentence.", ["The doctor recommended drinking more water.", "The doctor recommended me to drink more water.", "The doctor recommended to drink more water me.", "The doctor recommended drink more water."], "The doctor recommended drinking more water.", "Recommend + -ing."),
      q("Complete: She insisted ___ for dinner.", ["on paying", "to pay", "paying", "for pay"], "on paying", "Insist on + -ing."),
      q("Complete: I finally ___ my brother to come with us.", ["persuaded", "suggested", "insisted", "denied"], "persuaded", "Persuade + object + to."),
      q("Which sentence is correct?", ["He apologised for forgetting.", "He apologised to forget.", "He apologised forget.", "He apologised of forgetting."], "He apologised for forgetting.", "Apologise for + -ing."),
    ],
  }, {
    key: "past-deduction", title: "It Must Have Been Hard", titleVi: "Phỏng đoán về quá khứ",
    objectives: [
      "I can make guesses about what happened in the past.",
      "Use must have and can't have + past participle for strong guesses",
      "Use might have, may have and could have for possibilities",
    ],
    vocabulary: [
      { word: "witness", ipa: "/ˈwɪtnəs/", partOfSpeech: "noun", vietnamese: "nhân chứng", definition: "a person who sees a crime or accident happen", example: { english: "A witness saw the car drive away.", vietnamese: "Một nhân chứng thấy chiếc xe phóng đi." } },
      { word: "suspect", ipa: "/ˈsʌspekt/", partOfSpeech: "noun", vietnamese: "nghi phạm", definition: "a person who may have committed a crime", example: { english: "The police have arrested two suspects.", vietnamese: "Cảnh sát đã bắt hai nghi phạm." } },
      { word: "motive", ipa: "/ˈməʊtɪv/", partOfSpeech: "noun", vietnamese: "động cơ", definition: "a reason for doing something, especially a crime", example: { english: "What was the motive for the attack?", vietnamese: "Động cơ của vụ tấn công là gì?" } },
      { word: "alibi", ipa: "/ˈæləbaɪ/", partOfSpeech: "noun", vietnamese: "chứng cứ ngoại phạm", definition: "proof that you were somewhere else when a crime happened", example: { english: "He has an alibi: he was at work all night.", vietnamese: "Anh ta có chứng cứ ngoại phạm: anh ta ở chỗ làm cả đêm." } },
      { word: "break in", ipa: "/ˌbreɪk ˈɪn/", partOfSpeech: "phrasal verb", vietnamese: "đột nhập", definition: "to enter a building illegally, often by force", example: { english: "Someone broke in while we were on holiday.", vietnamese: "Có người đột nhập khi chúng tôi đi nghỉ." } },
      { word: "get away", ipa: "/ˌɡet əˈweɪ/", partOfSpeech: "phrasal verb", vietnamese: "trốn thoát", definition: "to escape", example: { english: "The thieves got away on a motorbike.", vietnamese: "Những tên trộm trốn thoát bằng xe máy." } },
      { word: "investigate", ipa: "/ɪnˈvestɪɡeɪt/", partOfSpeech: "verb", vietnamese: "điều tra", definition: "to try to find out the facts about something", example: { english: "The police are investigating the fire.", vietnamese: "Cảnh sát đang điều tra vụ cháy." } },
      { word: "footprint", ipa: "/ˈfʊtprɪnt/", partOfSpeech: "noun", vietnamese: "dấu chân", definition: "a mark left by a foot or shoe", example: { english: "There were muddy footprints on the floor.", vietnamese: "Có những dấu chân lấm bùn trên sàn." } },
    ],
    grammar: [{
      title: "Must have and can't have",
      pattern: "must have + past participle (I'm sure it happened) · can't / couldn't have + past participle (I'm sure it didn't happen)",
      explanation: {
        english: "For guesses about the past, add have + past participle to the modal. Use must have when the evidence makes you almost sure: The window is broken. They must have broken in. The opposite is can't have or couldn't have, not mustn't have: He can't have done it. He was in Hanoi.",
        vietnamese: "Để phỏng đoán về quá khứ, thêm have + quá khứ phân từ sau động từ khuyết thiếu. Dùng must have khi bằng chứng khiến bạn gần như chắc chắn: The window is broken. They must have broken in. Ngược lại là can't have hoặc couldn't have, không phải mustn't have: He can't have done it. He was in Hanoi.",
      },
      examples: [
        { english: "You must have been exhausted after the flight.", vietnamese: "Chắc hẳn bạn đã kiệt sức sau chuyến bay." },
        { english: "She couldn't have seen us. It was too dark.", vietnamese: "Cô ấy không thể nhìn thấy chúng ta được. Trời tối quá." },
      ],
      mistake: {
        wrong: "He mustn't have heard the alarm.", right: "He can't have heard the alarm.",
        why: { english: "For a negative guess about the past, use can't have.", vietnamese: "Phỏng đoán phủ định về quá khứ dùng can't have." },
      },
    }, {
      title: "Might have, may have, could have",
      pattern: "might / may / could have + past participle (perhaps it happened) · might not / may not have (perhaps it didn't)",
      explanation: {
        english: "When you aren't sure, use might have, may have or could have + past participle: The suspect might have left the country. She may not have got your message. Always include have, and use the past participle, not the past simple.",
        vietnamese: "Khi không chắc chắn, dùng might have, may have hoặc could have + quá khứ phân từ: The suspect might have left the country. She may not have got your message. Luôn có have, và dùng quá khứ phân từ, không dùng quá khứ đơn.",
      },
      examples: [
        { english: "The thief could have got in through the roof.", vietnamese: "Tên trộm có thể đã vào qua mái nhà." },
        { english: "He may not have known about the meeting.", vietnamese: "Có lẽ anh ấy không biết về cuộc họp." },
      ],
      mistake: {
        wrong: "She might forgot about the party.", right: "She might have forgotten about the party.",
        why: { english: "For the past, use might have + past participle.", vietnamese: "Với quá khứ, dùng might have + quá khứ phân từ." },
      },
    }],
    examples: [
      { english: "The witness must have seen the suspect's face.", vietnamese: "Nhân chứng chắc chắn đã nhìn thấy mặt nghi phạm." },
      { english: "He has an alibi, so he can't have broken in.", vietnamese: "Anh ta có chứng cứ ngoại phạm, nên không thể đã đột nhập." },
      { english: "The footprints are small. It might have been a child.", vietnamese: "Dấu chân nhỏ. Có thể đó là một đứa trẻ." },
      { english: "The police are investigating, but the thieves may have got away.", vietnamese: "Cảnh sát đang điều tra, nhưng có lẽ những tên trộm đã trốn thoát." },
    ],
    dialogue: [
      { speaker: "Detective", english: "So, what do we know?", vietnamese: "Vậy chúng ta biết những gì?" },
      { speaker: "Officer Trinh", english: "Someone broke in through the back window around midnight.", vietnamese: "Có người đột nhập qua cửa sổ sau vào khoảng nửa đêm." },
      { speaker: "Detective", english: "They must have known the owners were away.", vietnamese: "Chúng chắc chắn biết chủ nhà đi vắng." },
      { speaker: "Officer Trinh", english: "The neighbour is a suspect, but he can't have done it. He was at the hospital.", vietnamese: "Người hàng xóm là nghi phạm, nhưng ông ấy không thể làm việc đó. Ông ấy ở bệnh viện." },
      { speaker: "Detective", english: "Then who had a motive? Look at these footprints.", vietnamese: "Vậy ai có động cơ? Nhìn những dấu chân này xem." },
      { speaker: "Officer Trinh", english: "They're large. It could have been the gardener.", vietnamese: "Chúng to. Có thể là người làm vườn." },
    ],
    practice: [
      q("The ground is wet. It ___ rained last night.", ["must have", "must", "can't have", "mustn't have"], "must have", "Sure it happened: must have."),
      q("She was in Paris. She ___ been at the party.", ["can't have", "mustn't have", "must have", "can't"], "can't have", "Sure it didn't: can't have."),
      q("Complete: He might ___ the bus.", ["have missed", "missed", "miss have", "has missed"], "have missed", "Might have + past participle."),
      q("“Nghi phạm” in English is…", ["suspect", "suspicious", "witness", "criminal man"], "suspect", "Suspect = person who may be guilty."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["They may not have received the email.", "They may not received the email.", "They may have not receive the email.", "They mayn't have receive the email."], "They may not have received the email.", "May not have + past participle."),
      q("Complete: You ___ been so worried when you lost your passport.", ["must have", "can't have", "might", "mustn't"], "must have", "Strong guess about the past."),
      q("Complete: The thieves ___ on a motorbike.", ["got away", "got off", "got out with", "got along"], "got away", "Get away = escape."),
      q("Choose the correct sentence.", ["He couldn't have known the answer.", "He mustn't have known the answer.", "He couldn't knew the answer.", "He can't have know the answer."], "He couldn't have known the answer.", "Couldn't have + past participle."),
      q("What is an “alibi”?", ["proof you were somewhere else during a crime", "a witness", "a kind of weapon", "the reason for a crime"], "proof you were somewhere else during a crime", "Alibi = proof of being elsewhere."),
    ],
  }, {
    key: "emphasis", title: "What I Need Is a Holiday", titleVi: "Câu nhấn mạnh",
    objectives: [
      "I can emphasise the most important part of what I say.",
      "Use What + subject + verb + is / was for emphasis",
      "Use It is / was … that / who to focus on one part of a sentence",
    ],
    vocabulary: [
      { word: "essential", ipa: "/ɪˈsenʃl/", partOfSpeech: "adjective", vietnamese: "thiết yếu, cần thiết", definition: "completely necessary", example: { english: "Water is essential for life.", vietnamese: "Nước là thiết yếu cho sự sống." } },
      { word: "priority", ipa: "/praɪˈɒrəti/", partOfSpeech: "noun", vietnamese: "ưu tiên", definition: "the most important thing to deal with first", example: { english: "My family is my top priority.", vietnamese: "Gia đình là ưu tiên hàng đầu của tôi." } },
      { word: "crucial", ipa: "/ˈkruːʃl/", partOfSpeech: "adjective", vietnamese: "quan trọng sống còn", definition: "extremely important", example: { english: "The next few days are crucial.", vietnamese: "Vài ngày tới là cực kỳ quan trọng." } },
      { word: "genuinely", ipa: "/ˈdʒenjuɪnli/", partOfSpeech: "adverb", vietnamese: "thật sự, chân thành", definition: "really and honestly", example: { english: "I'm genuinely sorry for what happened.", vietnamese: "Tôi thật sự xin lỗi vì những gì đã xảy ra." } },
      { word: "absolutely", ipa: "/ˈæbsəluːtli/", partOfSpeech: "adverb", vietnamese: "hoàn toàn, tuyệt đối", definition: "completely; used to make a strong adjective stronger", example: { english: "The view was absolutely amazing.", vietnamese: "Khung cảnh hoàn toàn tuyệt vời." } },
      { word: "the thing is", ipa: "/ðə ˈθɪŋ ɪz/", partOfSpeech: "phrase", vietnamese: "vấn đề là", definition: "used to introduce an important point or problem", example: { english: "I'd love to come. The thing is, I have no money.", vietnamese: "Tôi rất muốn đi. Vấn đề là tôi không có tiền." } },
      { word: "frankly", ipa: "/ˈfræŋkli/", partOfSpeech: "adverb", vietnamese: "thẳng thắn mà nói", definition: "honestly, even if people don't like it", example: { english: "Frankly, I don't care what he thinks.", vietnamese: "Thẳng thắn mà nói, tôi không quan tâm anh ta nghĩ gì." } },
      { word: "point", ipa: "/pɔɪnt/", partOfSpeech: "noun", vietnamese: "điểm mấu chốt, ý chính", definition: "the most important part of what someone is saying", example: { english: "The point is that we need more time.", vietnamese: "Điểm mấu chốt là chúng ta cần thêm thời gian." } },
    ],
    grammar: [{
      title: "What-clauses for emphasis",
      pattern: "What + subject + verb + is / was + the focus (What I need is a holiday)",
      explanation: {
        english: "To make one part of a sentence stand out, move it to the end after What … is: I need a holiday → What I need is a holiday. She hates the noise → What she hates is the noise. Use what alone, not the thing what. For actions, use do: What we did was call the police.",
        vietnamese: "Để làm nổi bật một phần của câu, đưa phần đó về cuối sau What … is: I need a holiday → What I need is a holiday. She hates the noise → What she hates is the noise. Chỉ dùng what, không dùng the thing what. Với hành động, dùng do: What we did was call the police.",
      },
      examples: [
        { english: "What really matters is your health.", vietnamese: "Điều thực sự quan trọng là sức khoẻ của bạn." },
        { english: "What I love about Hanoi is the street food.", vietnamese: "Điều tôi yêu ở Hà Nội là đồ ăn đường phố." },
      ],
      mistake: {
        wrong: "The thing what I like most is the weather.", right: "What I like most is the weather. / The thing that I like most is the weather.",
        why: { english: "Use what alone, or the thing that. Never the thing what.", vietnamese: "Dùng what một mình, hoặc the thing that. Không bao giờ dùng the thing what." },
      },
    }, {
      title: "It is … that",
      pattern: "It is / was + the focus + that / who + the rest of the sentence",
      explanation: {
        english: "Another way to emphasise is It is / It was + the focus + that (or who for people): My sister called you → It was my sister who called you (not my brother). We met in 2010 → It was in 2010 that we met. Use that for times and places, not when or where.",
        vietnamese: "Một cách nhấn mạnh khác là It is / It was + phần cần nhấn + that (hoặc who với người): My sister called you → It was my sister who called you (không phải anh trai tôi). We met in 2010 → It was in 2010 that we met. Dùng that cho thời gian và nơi chốn, không dùng when hay where.",
      },
      examples: [
        { english: "It's the price that worries me, not the quality.", vietnamese: "Chính giá cả mới làm tôi lo, không phải chất lượng." },
        { english: "It was my grandmother who taught me to cook.", vietnamese: "Chính bà tôi là người dạy tôi nấu ăn." },
      ],
      mistake: {
        wrong: "It was in Da Lat where we got engaged.", right: "It was in Da Lat that we got engaged.",
        why: { english: "In It was … that sentences, use that for places and times.", vietnamese: "Trong câu It was … that, dùng that cho nơi chốn và thời gian." },
      },
    }],
    examples: [
      { english: "What's essential is that everyone feels safe.", vietnamese: "Điều thiết yếu là mọi người cảm thấy an toàn." },
      { english: "It's your attitude that's crucial, not your experience.", vietnamese: "Chính thái độ của bạn mới quan trọng, không phải kinh nghiệm." },
      { english: "Frankly, what we need now is a clear priority.", vietnamese: "Thẳng thắn mà nói, điều chúng ta cần bây giờ là một ưu tiên rõ ràng." },
      { english: "The thing is, I'm genuinely happy where I am.", vietnamese: "Vấn đề là tôi thật sự hạnh phúc ở nơi mình đang sống." },
    ],
    dialogue: [
      { speaker: "Jack", english: "You look stressed. Is it work?", vietnamese: "Trông bạn căng thẳng thế. Do công việc à?" },
      { speaker: "Lien", english: "It's not the work that's the problem. It's my manager.", vietnamese: "Vấn đề không phải công việc. Mà là quản lý của mình." },
      { speaker: "Jack", english: "What does he do?", vietnamese: "Ông ấy làm gì?" },
      { speaker: "Lien", english: "What annoys me is that he changes the priorities every day.", vietnamese: "Điều làm mình bực là ông ấy thay đổi ưu tiên mỗi ngày." },
      { speaker: "Jack", english: "Frankly, what you need is a holiday.", vietnamese: "Thẳng thắn mà nói, cái bạn cần là một kỳ nghỉ." },
      { speaker: "Lien", english: "Absolutely. The thing is, he won't let me take one!", vietnamese: "Hoàn toàn đúng. Vấn đề là ông ấy không cho mình nghỉ!" },
    ],
    practice: [
      q("Complete: ___ I need is a good night's sleep.", ["What", "That", "Which", "The thing what"], "What", "What + subject + verb + is."),
      q("Complete: It was my dad ___ fixed the car.", ["who", "which", "what", "where"], "who", "It was … who for people."),
      q("Complete: It was in 2015 ___ I moved to Hanoi.", ["that", "when", "where", "which"], "that", "It was … that for times."),
      q("“Ưu tiên” in English is…", ["priority", "prior", "first thing", "preference list"], "priority", "Priority = most important thing."),
    ],
    challenge: [
      q("Rewrite with emphasis: “I love the beaches.”", ["What I love is the beaches.", "What I love it is the beaches.", "The thing what I love is the beaches.", "That I love is the beaches."], "What I love is the beaches.", "What + subject + verb + is."),
      q("Complete: What we did ___ call a taxi.", ["was", "is that", "did", "were"], "was", "What we did was + verb."),
      q("Choose the correct sentence.", ["It's the noise that I can't stand.", "It's the noise what I can't stand.", "It's the noise where I can't stand.", "It's the noise when I can't stand."], "It's the noise that I can't stand.", "It is … that."),
      q("Complete: The food was ___ delicious.", ["absolutely", "absolute", "very absolutely", "absolutly"], "absolutely", "Absolutely + strong adjective."),
      q("What does “crucial” mean?", ["extremely important", "cruel", "not important", "difficult"], "extremely important", "Crucial = very important."),
    ],
  }, {
    key: "hedging", title: "It Seems That…", titleVi: "Nói giảm mức chắc chắn",
    objectives: [
      "I can sound careful and less certain in discussions and academic writing.",
      "Use seem and appear: It seems that… / He appears to…",
      "Use be likely / unlikely to + verb and other softening words",
    ],
    vocabulary: [
      { word: "likely", ipa: "/ˈlaɪkli/", partOfSpeech: "adjective", vietnamese: "có khả năng", definition: "probably going to happen or be true", example: { english: "It's likely to rain later.", vietnamese: "Có khả năng lát nữa trời sẽ mưa." } },
      { word: "unlikely", ipa: "/ʌnˈlaɪkli/", partOfSpeech: "adjective", vietnamese: "khó có khả năng", definition: "probably not going to happen or be true", example: { english: "He's unlikely to win.", vietnamese: "Anh ấy khó có khả năng thắng." } },
      { word: "appear", ipa: "/əˈpɪə/", partOfSpeech: "verb", vietnamese: "có vẻ, dường như", definition: "to seem to be (often in more formal English)", example: { english: "The problem appears to be getting worse.", vietnamese: "Vấn đề dường như đang trở nên tồi tệ hơn." } },
      { word: "arguably", ipa: "/ˈɑːɡjuəbli/", partOfSpeech: "adverb", vietnamese: "có thể nói là", definition: "used when you can give good reasons for a statement", example: { english: "Pho is arguably Vietnam's most famous dish.", vietnamese: "Phở có thể nói là món ăn nổi tiếng nhất Việt Nam." } },
      { word: "generally", ipa: "/ˈdʒenrəli/", partOfSpeech: "adverb", vietnamese: "nói chung", definition: "usually, in most cases", example: { english: "Young people are generally good with technology.", vietnamese: "Người trẻ nói chung giỏi công nghệ." } },
      { word: "to some extent", ipa: "/tə ˌsʌm ɪkˈstent/", partOfSpeech: "phrase", vietnamese: "ở một mức độ nào đó", definition: "partly, but not completely", example: { english: "I agree with you to some extent.", vietnamese: "Tôi đồng ý với bạn ở một mức độ nào đó." } },
      { word: "approximately", ipa: "/əˈprɒksɪmətli/", partOfSpeech: "adverb", vietnamese: "xấp xỉ, khoảng", definition: "close to an exact number, but not exact", example: { english: "Approximately 60% of the students agreed.", vietnamese: "Khoảng 60% sinh viên đồng ý." } },
      { word: "indicate", ipa: "/ˈɪndɪkeɪt/", partOfSpeech: "verb", vietnamese: "cho thấy, chỉ ra", definition: "to show that something is probably true", example: { english: "Early results indicate that the plan is working.", vietnamese: "Kết quả ban đầu cho thấy kế hoạch đang có hiệu quả." } },
    ],
    grammar: [{
      title: "Seem and appear",
      pattern: "It seems / appears that + clause · subject + seems / appears + to + verb (or to have + past participle)",
      explanation: {
        english: "Seem and appear make a statement less direct, which sounds polite and careful: Prices are rising → It seems that prices are rising / Prices seem to be rising. For the past, use to have + past participle: He appears to have left. Seem and appear are not used in the passive.",
        vietnamese: "Seem và appear làm câu nói bớt trực tiếp, nghe lịch sự và cẩn trọng: Prices are rising → It seems that prices are rising / Prices seem to be rising. Với quá khứ, dùng to have + quá khứ phân từ: He appears to have left. Seem và appear không dùng ở dạng bị động.",
      },
      examples: [
        { english: "It appears that the train has been delayed.", vietnamese: "Có vẻ như chuyến tàu đã bị hoãn." },
        { english: "The new rules seem to be working.", vietnamese: "Quy định mới có vẻ đang có hiệu quả." },
      ],
      mistake: {
        wrong: "It is seemed that more people are working from home.", right: "It seems that more people are working from home.",
        why: { english: "Seem is never passive.", vietnamese: "Seem không bao giờ ở dạng bị động." },
      },
    }, {
      title: "Likely and other softeners",
      pattern: "be likely / unlikely + to + verb · It is likely that + clause · tend to, generally, arguably, to some extent",
      explanation: {
        english: "Likely is an adjective, so it follows be and takes to + verb: Prices are likely to rise. Or use It is likely that…: It is likely that prices will rise. Other softeners make claims safer: Students tend to… / Generally,… / This is arguably… / I agree to some extent. They are very useful in essays.",
        vietnamese: "Likely là tính từ, nên đứng sau be và đi với to + động từ: Prices are likely to rise. Hoặc dùng It is likely that…: It is likely that prices will rise. Các từ làm mềm khác giúp nhận định an toàn hơn: Students tend to… / Generally,… / This is arguably… / I agree to some extent. Chúng rất hữu ích trong bài luận.",
      },
      examples: [
        { english: "The meeting is unlikely to finish before six.", vietnamese: "Cuộc họp khó có thể kết thúc trước sáu giờ." },
        { english: "Generally, people who sleep well are healthier.", vietnamese: "Nói chung, những người ngủ ngon thì khoẻ mạnh hơn." },
      ],
      mistake: {
        wrong: "House prices are likely rise next year.", right: "House prices are likely to rise next year.",
        why: { english: "Be likely is followed by to + verb.", vietnamese: "Be likely đi với to + động từ." },
      },
    }],
    examples: [
      { english: "The evidence indicates that the policy has been successful to some extent.", vietnamese: "Bằng chứng cho thấy chính sách đã thành công ở một mức độ nào đó." },
      { english: "Approximately half the population appears to support the plan.", vietnamese: "Khoảng một nửa dân số dường như ủng hộ kế hoạch." },
      { english: "It is arguably the best university in the country.", vietnamese: "Có thể nói đó là trường đại học tốt nhất cả nước." },
      { english: "Children are likely to copy their parents' habits.", vietnamese: "Trẻ em có khả năng bắt chước thói quen của bố mẹ." },
    ],
    dialogue: [
      { speaker: "Lecturer", english: "So what did your survey find?", vietnamese: "Vậy khảo sát của em tìm thấy gì?" },
      { speaker: "Nhi", english: "It seems that most students study better in the morning.", vietnamese: "Có vẻ như phần lớn sinh viên học tốt hơn vào buổi sáng." },
      { speaker: "Lecturer", english: "Most? Can you be more precise?", vietnamese: "Phần lớn? Em có thể nói chính xác hơn không?" },
      { speaker: "Nhi", english: "Approximately 65%. However, the sample was small, so the results are unlikely to be perfect.", vietnamese: "Khoảng 65% ạ. Tuy nhiên, mẫu khá nhỏ, nên kết quả khó có thể hoàn hảo." },
      { speaker: "Lecturer", english: "Good. That's careful language. Any other findings?", vietnamese: "Tốt. Đó là cách diễn đạt cẩn trọng. Còn phát hiện nào khác không?" },
      { speaker: "Nhi", english: "Students who work part-time appear to sleep less, which is likely to affect their grades.", vietnamese: "Sinh viên làm thêm dường như ngủ ít hơn, điều này có khả năng ảnh hưởng đến điểm số." },
    ],
    practice: [
      q("Complete: It ___ that the shop has closed.", ["seems", "is seemed", "seeming", "seemed to"], "seems", "It seems that."),
      q("Complete: She appears ___ very busy.", ["to be", "being", "be", "that is"], "to be", "Appear to be."),
      q("Complete: It's likely ___ tomorrow.", ["to snow", "snow", "snowing", "that snowing"], "to snow", "Likely to + verb."),
      q("“Xấp xỉ, khoảng” in English is…", ["approximately", "approximate to", "nearly exact", "around of"], "approximately", "Approximately = about."),
    ],
    challenge: [
      q("Complete: The thieves seem ___ through the window.", ["to have got in", "to get in yesterday", "getting in", "have got in"], "to have got in", "Past: to have + past participle."),
      q("Choose the correct sentence.", ["He is unlikely to come.", "He is unlikely come.", "He is unlikely coming.", "He unlikelies to come."], "He is unlikely to come.", "Be unlikely to + verb."),
      q("Complete: I agree with you to some ___.", ["extent", "extend", "extension", "level of"], "extent", "To some extent."),
      q("Which sentence is the most careful?", ["The results indicate that the drug may work.", "The drug works. Full stop.", "The drug definitely works for everyone.", "Everyone knows the drug works."], "The results indicate that the drug may work.", "Hedged claim."),
      q("What does “arguably” mean?", ["you can give good reasons for saying this", "this is completely certain", "this is an argument", "this is wrong"], "you can give good reasons for saying this", "Arguably = it can be argued."),
    ],
  }, {
    key: "opinion-essays", title: "In Conclusion", titleVi: "Viết bài luận nêu quan điểm",
    objectives: [
      "I can write a clear opinion essay with a balanced argument.",
      "Order ideas with First of all / Firstly, Secondly and Finally",
      "Give my view formally: In my view, From my point of view, It could be argued that",
    ],
    vocabulary: [
      { word: "essay", ipa: "/ˈeseɪ/", partOfSpeech: "noun", vietnamese: "bài luận", definition: "a short piece of writing on one subject", example: { english: "Write an essay of 250 words.", vietnamese: "Hãy viết một bài luận 250 từ." } },
      { word: "argue", ipa: "/ˈɑːɡjuː/", partOfSpeech: "verb", vietnamese: "lập luận, cho rằng", definition: "to give reasons why you think something is true", example: { english: "Some people argue that homework is unnecessary.", vietnamese: "Một số người cho rằng bài tập về nhà là không cần thiết." } },
      { word: "paragraph", ipa: "/ˈpærəɡrɑːf/", partOfSpeech: "noun", vietnamese: "đoạn văn", definition: "a section of writing about one main idea", example: { english: "Each paragraph should have one main idea.", vietnamese: "Mỗi đoạn văn nên có một ý chính." } },
      { word: "firstly", ipa: "/ˈfɜːstli/", partOfSpeech: "adverb", vietnamese: "thứ nhất, trước tiên", definition: "used to introduce the first point in a list", example: { english: "Firstly, public transport reduces pollution.", vietnamese: "Thứ nhất, giao thông công cộng giảm ô nhiễm." } },
      { word: "on balance", ipa: "/ɒn ˈbæləns/", partOfSpeech: "phrase", vietnamese: "cân nhắc mọi mặt", definition: "after considering all the facts", example: { english: "On balance, I think the benefits are greater.", vietnamese: "Cân nhắc mọi mặt, tôi nghĩ lợi ích lớn hơn." } },
      { word: "in conclusion", ipa: "/ɪn kənˈkluːʒn/", partOfSpeech: "phrase", vietnamese: "tóm lại, kết luận", definition: "used to start the final part of an essay or talk", example: { english: "In conclusion, both sides have good points.", vietnamese: "Tóm lại, cả hai phía đều có lý." } },
      { word: "convincing", ipa: "/kənˈvɪnsɪŋ/", partOfSpeech: "adjective", vietnamese: "thuyết phục", definition: "making you believe that something is true", example: { english: "She gave a very convincing argument.", vietnamese: "Cô ấy đưa ra một lập luận rất thuyết phục." } },
      { word: "opposing view", ipa: "/əˌpəʊzɪŋ ˈvjuː/", partOfSpeech: "collocation", vietnamese: "quan điểm trái chiều", definition: "the opinion of people who disagree with you", example: { english: "A good essay also considers the opposing view.", vietnamese: "Một bài luận tốt cũng xem xét quan điểm trái chiều." } },
    ],
    grammar: [{
      title: "Ordering your ideas",
      pattern: "First of all, / Firstly, … · Secondly, … · Finally, / Lastly, … · In conclusion, / To conclude, …",
      explanation: {
        english: "Guide the reader through your points with sequencing words, each followed by a comma. Use First of all or Firstly, but not both together. Give each point its own paragraph, with a topic sentence, an explanation and an example. Start the last paragraph with In conclusion or To conclude, and don't add new ideas there.",
        vietnamese: "Dẫn người đọc qua các ý bằng từ chỉ thứ tự, mỗi từ có dấu phẩy phía sau. Dùng First of all hoặc Firstly, nhưng không dùng cả hai cùng lúc. Mỗi ý một đoạn văn, có câu chủ đề, phần giải thích và ví dụ. Bắt đầu đoạn cuối bằng In conclusion hoặc To conclude, và đừng thêm ý mới ở đó.",
      },
      examples: [
        { english: "Firstly, online learning saves time. Secondly, it is cheaper.", vietnamese: "Thứ nhất, học trực tuyến tiết kiệm thời gian. Thứ hai, nó rẻ hơn." },
        { english: "In conclusion, the advantages outweigh the disadvantages.", vietnamese: "Tóm lại, ưu điểm nhiều hơn nhược điểm." },
      ],
      mistake: {
        wrong: "Firstly of all, I will discuss the advantages.", right: "First of all, I will discuss the advantages.",
        why: { english: "Say First of all or Firstly, not a mix of both.", vietnamese: "Nói First of all hoặc Firstly, không trộn cả hai." },
      },
    }, {
      title: "Giving your view formally",
      pattern: "In my view, / In my opinion, / From my point of view, … · It could be argued that… · While some people argue that…, I believe…",
      explanation: {
        english: "In an essay, give your view with a formal phrase: In my view… / From my point of view… (not In my point of view). Show the opposing view fairly before answering it: While some people argue that cities are too crowded, I believe they offer more opportunities. It could be argued that… presents an idea without saying it's yours.",
        vietnamese: "Trong bài luận, nêu quan điểm bằng cụm trang trọng: In my view… / From my point of view… (không nói In my point of view). Trình bày quan điểm trái chiều một cách công bằng trước khi phản bác: While some people argue that cities are too crowded, I believe they offer more opportunities. It could be argued that… đưa ra một ý mà không nói đó là ý của mình.",
      },
      examples: [
        { english: "From my point of view, school uniforms are a good idea.", vietnamese: "Theo quan điểm của tôi, đồng phục học sinh là một ý hay." },
        { english: "It could be argued that tourism damages local culture.", vietnamese: "Có thể lập luận rằng du lịch làm tổn hại văn hoá địa phương." },
      ],
      mistake: {
        wrong: "In my point of view, students should wear uniforms.", right: "From my point of view, students should wear uniforms.",
        why: { english: "The phrase is From my point of view, or In my view.", vietnamese: "Cụm đúng là From my point of view, hoặc In my view." },
      },
    }],
    examples: [
      { english: "Some people argue that exams are unfair. However, the opposing view is also convincing.", vietnamese: "Một số người cho rằng thi cử không công bằng. Tuy nhiên, quan điểm trái chiều cũng thuyết phục." },
      { english: "On balance, I believe that working from home is positive.", vietnamese: "Cân nhắc mọi mặt, tôi tin rằng làm việc tại nhà là tích cực." },
      { english: "Each paragraph of your essay needs a clear topic sentence.", vietnamese: "Mỗi đoạn văn trong bài luận cần một câu chủ đề rõ ràng." },
      { english: "Firstly, I will outline the problem. Finally, I will suggest a solution.", vietnamese: "Thứ nhất, tôi sẽ trình bày vấn đề. Cuối cùng, tôi sẽ đề xuất một giải pháp." },
    ],
    dialogue: [
      { speaker: "Tutor", english: "Let's look at your essay plan. What's the question?", vietnamese: "Hãy xem dàn ý bài luận của em. Đề bài là gì?" },
      { speaker: "Tri", english: "“Should cars be banned from city centres?” I'm going to argue yes.", vietnamese: "“Có nên cấm ô tô vào trung tâm thành phố không?” Em sẽ lập luận là có." },
      { speaker: "Tutor", english: "Good. How many paragraphs?", vietnamese: "Tốt. Bao nhiêu đoạn?" },
      { speaker: "Tri", english: "Four. Firstly, pollution. Secondly, safety. Then the opposing view, and a conclusion.", vietnamese: "Bốn ạ. Thứ nhất, ô nhiễm. Thứ hai, an toàn. Sau đó là quan điểm trái chiều, và kết luận." },
      { speaker: "Tutor", english: "Nice. How will you introduce the opposing view?", vietnamese: "Hay. Em sẽ dẫn vào quan điểm trái chiều thế nào?" },
      { speaker: "Tri", english: "“It could be argued that shops will lose customers. However, on balance…”", vietnamese: "“Có thể lập luận rằng các cửa hàng sẽ mất khách. Tuy nhiên, cân nhắc mọi mặt…”" },
    ],
    practice: [
      q("Complete: ___, I will look at the advantages.", ["First of all", "Firstly of all", "First of", "At first of all"], "First of all", "First of all / Firstly."),
      q("Complete: ___ my point of view, the plan is too expensive.", ["From", "In", "On", "By"], "From", "From my point of view."),
      q("Which phrase starts the final paragraph?", ["In conclusion,", "Firstly,", "For example,", "Secondly,"], "In conclusion,", "Conclusion."),
      q("“Đoạn văn” in English is…", ["paragraph", "paragraf", "passage line", "sentence group"], "paragraph", "Paragraph = section about one idea."),
    ],
    challenge: [
      q("Complete: It could ___ that technology makes us lonely.", ["be argued", "argue", "be argue", "argued"], "be argued", "It could be argued that."),
      q("Choose the correct sentence.", ["In my view, the law should change.", "In my point of view, the law should change.", "According to me, the law should change.", "On my view, the law should change."], "In my view, the law should change.", "In my view / From my point of view."),
      q("Complete: ___ balance, I support the idea.", ["On", "In", "At", "By"], "On", "On balance."),
      q("Complete: Her argument was very ___. I changed my mind.", ["convincing", "convinced", "convince", "conviction"], "convincing", "Convincing = makes you believe."),
      q("What should you avoid in a conclusion?", ["adding new ideas", "summarising your view", "using In conclusion", "answering the question"], "adding new ideas", "No new ideas in the conclusion."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 6", isReview: true,
    objectives: [
      "I can discuss ideas, guess about the past and write a clear argument.",
      "Check reporting verbs, past deduction, emphasis, hedging and essay language",
    ],
    vocabulary: [
      { word: "persuade", ipa: "/pəˈsweɪd/", partOfSpeech: "verb", vietnamese: "thuyết phục", definition: "to make someone agree to do something by giving reasons", example: { english: "Nothing could persuade him to stay.", vietnamese: "Không gì thuyết phục được anh ấy ở lại." } },
      { word: "deny", ipa: "/dɪˈnaɪ/", partOfSpeech: "verb", vietnamese: "phủ nhận", definition: "to say something is not true", example: { english: "The minister denied the rumours.", vietnamese: "Bộ trưởng phủ nhận các tin đồn." } },
      { word: "suspect", ipa: "/ˈsʌspekt/", partOfSpeech: "noun", vietnamese: "nghi phạm", definition: "a person who may have committed a crime", example: { english: "The main suspect has an alibi.", vietnamese: "Nghi phạm chính có chứng cứ ngoại phạm." } },
      { word: "essential", ipa: "/ɪˈsenʃl/", partOfSpeech: "adjective", vietnamese: "thiết yếu, cần thiết", definition: "completely necessary", example: { english: "A passport is essential for the trip.", vietnamese: "Hộ chiếu là thứ thiết yếu cho chuyến đi." } },
      { word: "likely", ipa: "/ˈlaɪkli/", partOfSpeech: "adjective", vietnamese: "có khả năng", definition: "probably going to happen or be true", example: { english: "What's the most likely explanation?", vietnamese: "Lời giải thích có khả năng nhất là gì?" } },
      { word: "essay", ipa: "/ˈeseɪ/", partOfSpeech: "noun", vietnamese: "bài luận", definition: "a short piece of writing on one subject", example: { english: "The essay is due on Monday.", vietnamese: "Hạn nộp bài luận là thứ Hai." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "suggested going / advised me to go / apologised for being · must have / can't have / might have + past participle · What I need is… / It was … that · It seems that / likely to · First of all / From my point of view",
      explanation: {
        english: "Check these: suggest and deny take -ing, refuse takes to, advise and persuade take object + to, and prepositions take -ing; past guesses use must have, can't have or might have + past participle; for emphasis, use What … is or It is … that, never the thing what; seem is never passive, and likely takes to + verb; in essays, say First of all or Firstly, and From my point of view or In my view.",
        vietnamese: "Hãy kiểm tra: suggest và deny đi với -ing, refuse đi với to, advise và persuade đi với tân ngữ + to, và sau giới từ là -ing; phỏng đoán quá khứ dùng must have, can't have hoặc might have + quá khứ phân từ; để nhấn mạnh, dùng What … is hoặc It is … that, không bao giờ dùng the thing what; seem không ở bị động, và likely đi với to + động từ; trong bài luận, nói First of all hoặc Firstly, và From my point of view hoặc In my view.",
      },
      examples: [
        { english: "The suspect denied breaking in, but he must have been there.", vietnamese: "Nghi phạm phủ nhận việc đột nhập, nhưng chắc chắn hắn đã ở đó." },
        { english: "What's essential in an essay is a clear argument.", vietnamese: "Điều thiết yếu trong một bài luận là lập luận rõ ràng." },
      ],
    }],
    examples: [
      { english: "My teacher persuaded me to rewrite the essay.", vietnamese: "Giáo viên thuyết phục tôi viết lại bài luận." },
      { english: "It seems likely that the suspect will deny everything.", vietnamese: "Có vẻ như nghi phạm sẽ phủ nhận mọi thứ." },
      { english: "Sleep is essential, so it's likely that tired students do worse.", vietnamese: "Giấc ngủ là thiết yếu, nên có khả năng sinh viên mệt mỏi học kém hơn." },
    ],
    dialogue: [
      { speaker: "Zoe", english: "Did you finish your essay on social media?", vietnamese: "Bạn viết xong bài luận về mạng xã hội chưa?" },
      { speaker: "Phat", english: "Almost. My tutor suggested adding the opposing view.", vietnamese: "Gần xong. Thầy hướng dẫn gợi ý thêm quan điểm trái chiều." },
      { speaker: "Zoe", english: "Good advice. What's your main argument?", vietnamese: "Lời khuyên hay. Lập luận chính của bạn là gì?" },
      { speaker: "Phat", english: "What worries me is fake news. It seems to spread faster than real news.", vietnamese: "Điều làm mình lo là tin giả. Nó có vẻ lan nhanh hơn tin thật." },
      { speaker: "Zoe", english: "That's convincing. Is there evidence?", vietnamese: "Thuyết phục đấy. Có bằng chứng không?" },
      { speaker: "Phat", english: "A study found false stories were likely to be shared more. The writers must have been surprised!", vietnamese: "Một nghiên cứu phát hiện tin sai có khả năng được chia sẻ nhiều hơn. Các tác giả chắc hẳn đã rất ngạc nhiên!" },
      { speaker: "Zoe", english: "In conclusion, it's an essential topic. Good luck!", vietnamese: "Tóm lại, đó là một chủ đề thiết yếu. Chúc bạn may mắn!" },
    ],
    practice: [
      q("Complete: He denied ___ the window.", ["breaking", "to break", "break", "of breaking"], "breaking", "Deny + -ing."),
      q("Complete: She ___ have left. Her coat is still here.", ["can't", "mustn't", "must", "might not to"], "can't", "Negative past guess: can't have."),
      q("Complete: ___ I want is some peace and quiet.", ["What", "The thing what", "That", "Which"], "What", "What-clause."),
      q("Complete: It ___ that the plan has failed.", ["seems", "is seemed", "seeming", "seem"], "seems", "It seems that."),
    ],
    challenge: [
      q("Complete: My friend persuaded me ___ the course.", ["to join", "joining", "join", "for joining"], "to join", "Persuade + object + to."),
      q("Complete: They might ___ the wrong road.", ["have taken", "took", "taken", "have took"], "have taken", "Might have + past participle."),
      q("Complete: It was my teacher ___ encouraged me.", ["who", "which", "what", "when"], "who", "It was … who."),
      q("Complete: The weather is likely ___ this weekend.", ["to improve", "improve", "improving", "that improve"], "to improve", "Likely to + verb."),
      q("Choose the correct sentence.", ["From my point of view, the essay is too long.", "In my point of view, the essay is too long.", "On my point of view, the essay is too long.", "At my point of view, the essay is too long."], "From my point of view, the essay is too long.", "From my point of view."),
    ],
  }],
  assessment: [
    { id: "suggest-ing", prompt: "“Cô ấy gợi ý đi xem phim.” in English is…", options: ["She suggested going to the cinema.", "She suggested me to go to the cinema.", "She suggested to go to the cinema me.", "She suggested go to the cinema."], correct: "She suggested going to the cinema.", explanation: "Suggest + -ing." },
    { id: "refuse-to", prompt: "Complete: He refused ___ the form.", options: ["to sign", "signing", "sign", "for signing"], correct: "to sign", explanation: "Refuse + to." },
    { id: "advise-object", prompt: "Complete: The lawyer advised her ___ nothing.", options: ["to say", "saying", "say", "for saying"], correct: "to say", explanation: "Advise + object + to." },
    { id: "accuse-of", prompt: "Complete: They accused him ___ the money.", options: ["of stealing", "to steal", "for steal", "stealing"], correct: "of stealing", explanation: "Accuse of + -ing." },
    { id: "apologise-for", prompt: "Complete: I apologise ___ late.", options: ["for being", "to be", "being", "of being"], correct: "for being", explanation: "Apologise for + -ing." },
    { id: "must-have", prompt: "The streets are wet. It ___ rained.", options: ["must have", "must", "can't have", "mustn't have"], correct: "must have", explanation: "Strong past guess." },
    { id: "cant-have", prompt: "Choose the correct sentence.", options: ["She can't have seen me. I was hiding.", "She mustn't have seen me. I was hiding.", "She can't saw me. I was hiding.", "She can't have see me. I was hiding."], correct: "She can't have seen me. I was hiding.", explanation: "Can't have + past participle." },
    { id: "might-have", prompt: "Complete: He might ___ his phone at home.", options: ["have left", "left", "leave have", "has left"], correct: "have left", explanation: "Might have + past participle." },
    { id: "what-cleft", prompt: "Rewrite with emphasis: “I need more time.”", options: ["What I need is more time.", "The thing what I need is more time.", "That I need is more time.", "What I need it is more time."], correct: "What I need is more time.", explanation: "What + subject + verb + is." },
    { id: "it-cleft", prompt: "Complete: It was in Hue ___ my parents met.", options: ["that", "where", "when", "which"], correct: "that", explanation: "It was … that." },
    { id: "seem-active", prompt: "Choose the correct sentence.", options: ["It seems that he has left.", "It is seemed that he has left.", "It seemed that he has leaving.", "It seems he is left."], correct: "It seems that he has left.", explanation: "Seem is never passive." },
    { id: "likely-to", prompt: "Complete: Prices are likely ___ again.", options: ["to rise", "rise", "rising", "that rise"], correct: "to rise", explanation: "Likely to + verb." },
    { id: "to-some-extent", prompt: "Complete: I agree with you to some ___.", options: ["extent", "extend", "level", "degree of"], correct: "extent", explanation: "To some extent." },
    { id: "first-of-all", prompt: "Which is correct for an essay?", options: ["First of all, …", "Firstly of all, …", "First of, …", "Fistly, …"], correct: "First of all, …", explanation: "First of all / Firstly." },
    { id: "point-of-view", prompt: "“Theo quan điểm của tôi…” in an essay is…", options: ["From my point of view, …", "In my point of view, …", "According to me, …", "On my view, …"], correct: "From my point of view, …", explanation: "From my point of view." },
  ],
};
