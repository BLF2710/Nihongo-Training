// B1 Unit 5: News & Media. Vietnamese "được" and "bị" lead to "The accident was happened" and "It was build in
// 1890"; "nói với tôi" gives "She said me"; reported speech without tense changes gives "He said he will come" and
// "He asked me where did I live"; relative clauses with "mà" bring "the man which…" and "the book which I bought it";
// and "theo tôi" becomes "According to me". This unit puts those right for reading and passing on the news.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B1",
  number: 5,
  lessons: [{
    key: "the-passive", title: "It Was Built in 1890", titleVi: "Câu bị động",
    objectives: [
      "I can describe how things are made and what happened when the doer is not important.",
      "Use is / are and was / were + past participle, with by for the doer",
      "Know which verbs have no passive: happen, arrive, die",
    ],
    vocabulary: [
      { word: "invent", ipa: "/ɪnˈvent/", partOfSpeech: "verb", vietnamese: "phát minh", definition: "to make or design something that did not exist before", example: { english: "The telephone was invented in the 1870s.", vietnamese: "Điện thoại được phát minh vào những năm 1870." } },
      { word: "publish", ipa: "/ˈpʌblɪʃ/", partOfSpeech: "verb", vietnamese: "xuất bản, đăng", definition: "to print a book, magazine or article, or put it online", example: { english: "Her first novel was published last year.", vietnamese: "Cuốn tiểu thuyết đầu tay của cô ấy được xuất bản năm ngoái." } },
      { word: "produce", ipa: "/prəˈdjuːs/", partOfSpeech: "verb", vietnamese: "sản xuất", definition: "to make or grow something", example: { english: "Most of the world's pepper is produced in Vietnam.", vietnamese: "Phần lớn hồ tiêu trên thế giới được sản xuất ở Việt Nam." } },
      { word: "design", ipa: "/dɪˈzaɪn/", partOfSpeech: "verb", vietnamese: "thiết kế", definition: "to plan how something will look and work", example: { english: "The building was designed by a French architect.", vietnamese: "Toà nhà được thiết kế bởi một kiến trúc sư người Pháp." } },
      { word: "found", ipa: "/faʊnd/", partOfSpeech: "verb", vietnamese: "thành lập", definition: "to start an organisation or company", example: { english: "The university was founded in 1906.", vietnamese: "Trường đại học được thành lập năm 1906." } },
      { word: "translate", ipa: "/trænzˈleɪt/", partOfSpeech: "verb", vietnamese: "dịch", definition: "to change words into another language", example: { english: "The book has been translated into thirty languages.", vietnamese: "Cuốn sách đã được dịch ra ba mươi thứ tiếng." } },
      { word: "be based on", ipa: "/bi ˈbeɪst ɒn/", partOfSpeech: "phrase", vietnamese: "dựa trên", definition: "to use something as the starting point", example: { english: "The film is based on a true story.", vietnamese: "Bộ phim dựa trên một câu chuyện có thật." } },
      { word: "destroy", ipa: "/dɪˈstrɔɪ/", partOfSpeech: "verb", vietnamese: "phá huỷ", definition: "to damage something so badly that it no longer exists", example: { english: "Many houses were destroyed by the floods.", vietnamese: "Nhiều ngôi nhà bị lũ lụt phá huỷ." } },
    ],
    grammar: [{
      title: "The passive",
      pattern: "is / are + past participle (present) · was / were + past participle (past) · + by + the doer",
      explanation: {
        english: "Use the passive when the action, or the thing it happens to, matters more than who does it: Coffee is grown in the Central Highlands. The bridge was built in 1890. Add by only when the doer is important: It was designed by Gustave Eiffel. Vietnamese “được” and “bị” both become be + past participle.",
        vietnamese: "Dùng câu bị động khi hành động, hoặc đối tượng chịu tác động, quan trọng hơn người thực hiện: Coffee is grown in the Central Highlands. The bridge was built in 1890. Chỉ thêm by khi người thực hiện quan trọng: It was designed by Gustave Eiffel. Cả “được” và “bị” trong tiếng Việt đều thành be + quá khứ phân từ.",
      },
      examples: [
        { english: "English is spoken all over the world.", vietnamese: "Tiếng Anh được nói khắp thế giới." },
        { english: "The thieves were caught by the police.", vietnamese: "Những tên trộm bị cảnh sát bắt." },
      ],
      mistake: {
        wrong: "The bridge was build in 1890.", right: "The bridge was built in 1890.",
        why: { english: "The passive needs the past participle (built), not the base verb.", vietnamese: "Câu bị động cần quá khứ phân từ (built), không dùng động từ nguyên mẫu." },
      },
    }, {
      title: "No passive",
      pattern: "happen, arrive, die, appear, disappear → no passive · something happened (not was happened)",
      explanation: {
        english: "Only verbs with an object can be passive. Verbs like happen, arrive, die, appear and disappear have no object, so they are never passive: The accident happened at night. Vietnamese “xảy ra” has no “bị” either, so don't add was.",
        vietnamese: "Chỉ động từ có tân ngữ mới chuyển được sang bị động. Các động từ như happen, arrive, die, appear và disappear không có tân ngữ, nên không bao giờ ở dạng bị động: The accident happened at night. Tiếng Việt “xảy ra” cũng không có “bị”, nên đừng thêm was.",
      },
      examples: [
        { english: "What happened to your car?", vietnamese: "Xe của bạn bị làm sao vậy?" },
        { english: "The plane arrived two hours late.", vietnamese: "Máy bay đến muộn hai tiếng." },
      ],
      mistake: {
        wrong: "The accident was happened on the motorway.", right: "The accident happened on the motorway.",
        why: { english: "Happen has no object, so it has no passive form.", vietnamese: "Happen không có tân ngữ, nên không có dạng bị động." },
      },
    }],
    examples: [
      { english: "This app was designed by two students in Da Nang.", vietnamese: "Ứng dụng này được thiết kế bởi hai sinh viên ở Đà Nẵng." },
      { english: "The company was founded in 1998 and now employs 500 people.", vietnamese: "Công ty được thành lập năm 1998 và nay có 500 nhân viên." },
      { english: "The story is based on the writer's childhood.", vietnamese: "Câu chuyện dựa trên tuổi thơ của nhà văn." },
      { english: "The old market was destroyed by fire, but it was rebuilt.", vietnamese: "Khu chợ cũ bị lửa thiêu rụi, nhưng đã được xây lại." },
    ],
    dialogue: [
      { speaker: "Guide", english: "This cathedral was built in the 1880s.", vietnamese: "Nhà thờ này được xây vào những năm 1880." },
      { speaker: "Cuong", english: "Who was it designed by?", vietnamese: "Nó được ai thiết kế vậy?" },
      { speaker: "Guide", english: "A French architect. And all the bricks were brought from France.", vietnamese: "Một kiến trúc sư người Pháp. Và toàn bộ gạch được mang từ Pháp sang." },
      { speaker: "Cuong", english: "Really? What happened during the war?", vietnamese: "Thật sao? Trong chiến tranh có chuyện gì xảy ra không?" },
      { speaker: "Guide", english: "Some windows were destroyed, but they were replaced later.", vietnamese: "Một số cửa sổ bị phá huỷ, nhưng sau đó đã được thay mới." },
      { speaker: "Cuong", english: "It's beautiful. Is it still used today?", vietnamese: "Đẹp quá. Ngày nay nó vẫn được sử dụng chứ?" },
    ],
    practice: [
      q("Complete: Rice ___ in many parts of Asia.", ["is grown", "grows by", "is grow", "grown"], "is grown", "Present passive: is + past participle."),
      q("Complete: The Eiffel Tower ___ in 1889.", ["was built", "was build", "built", "is built"], "was built", "Past passive: was + past participle."),
      q("Choose the correct sentence.", ["The accident happened at 6 p.m.", "The accident was happened at 6 p.m.", "The accident is happened at 6 p.m.", "The accident happen at 6 p.m."], "The accident happened at 6 p.m.", "Happen has no passive."),
      q("“Được thành lập” (a company) in English is…", ["was founded", "was found", "was finded", "founded by itself"], "was founded", "Found (start) → founded."),
    ],
    challenge: [
      q("Complete: Harry Potter ___ by J. K. Rowling.", ["was written", "wrote", "was wrote", "is writing"], "was written", "Past passive + by + the doer."),
      q("Complete: These phones ___ in Vietnam.", ["are made", "is made", "are make", "make"], "are made", "Plural present passive: are + past participle."),
      q("Choose the correct sentence.", ["Her grandfather died in 1990.", "Her grandfather was died in 1990.", "Her grandfather is died in 1990.", "Her grandfather was dead in 1990 by illness."], "Her grandfather died in 1990.", "Die has no passive."),
      q("Complete: The film is based ___ a novel.", ["on", "in", "at", "from"], "on", "Be based on."),
      q("Why is “The window was broken” passive?", ["We don't know or care who broke it.", "The window broke itself.", "It happened in the future.", "It's a question."], "We don't know or care who broke it.", "The passive hides an unimportant doer."),
    ],
  }, {
    key: "reported-statements", title: "She Said She Was Tired", titleVi: "Câu tường thuật",
    objectives: [
      "I can pass on what other people said.",
      "Use say and tell correctly: said that, told me that",
      "Move the tense back in reported speech: will → would, am → was",
    ],
    vocabulary: [
      { word: "announce", ipa: "/əˈnaʊns/", partOfSpeech: "verb", vietnamese: "thông báo", definition: "to tell people something officially", example: { english: "The company announced that it would close two shops.", vietnamese: "Công ty thông báo sẽ đóng cửa hai cửa hàng." } },
      { word: "claim", ipa: "/kleɪm/", partOfSpeech: "verb", vietnamese: "khẳng định, cho rằng", definition: "to say something is true, though others may not believe it", example: { english: "He claimed that he had never seen the money.", vietnamese: "Anh ta khẳng định chưa bao giờ nhìn thấy số tiền đó." } },
      { word: "explain", ipa: "/ɪkˈspleɪn/", partOfSpeech: "verb", vietnamese: "giải thích", definition: "to make something clear or give the reason for it", example: { english: "She explained that the train had been cancelled.", vietnamese: "Cô ấy giải thích rằng chuyến tàu đã bị huỷ." } },
      { word: "mention", ipa: "/ˈmenʃn/", partOfSpeech: "verb", vietnamese: "nhắc đến", definition: "to talk about something briefly", example: { english: "He mentioned that he was moving to Hue.", vietnamese: "Anh ấy có nhắc là sắp chuyển ra Huế." } },
      { word: "admit", ipa: "/ədˈmɪt/", partOfSpeech: "verb", vietnamese: "thừa nhận", definition: "to agree that something bad is true, often unwillingly", example: { english: "The minister admitted that mistakes had been made.", vietnamese: "Bộ trưởng thừa nhận đã có sai sót." } },
      { word: "promise", ipa: "/ˈprɒmɪs/", partOfSpeech: "verb", vietnamese: "hứa", definition: "to say you will certainly do something", example: { english: "He promised he would call me back.", vietnamese: "Anh ấy hứa sẽ gọi lại cho tôi." } },
      { word: "insist", ipa: "/ɪnˈsɪst/", partOfSpeech: "verb", vietnamese: "khăng khăng, nhất quyết", definition: "to say firmly that something is true or must happen", example: { english: "She insisted that she was right.", vietnamese: "Cô ấy khăng khăng rằng mình đúng." } },
      { word: "spokesperson", ipa: "/ˈspəʊkspɜːsn/", partOfSpeech: "noun", vietnamese: "người phát ngôn", definition: "a person who speaks officially for a group or company", example: { english: "A police spokesperson said that no one was hurt.", vietnamese: "Người phát ngôn cảnh sát cho biết không ai bị thương." } },
    ],
    grammar: [{
      title: "Say or tell?",
      pattern: "say (that) … · say something to someone · tell someone (that) …",
      explanation: {
        english: "Tell always needs a person after it: She told me (that) she was tired. Say does not take a person directly: She said (that) she was tired, or She said something to me. So you can say told me, but not said me. That is often left out in speaking.",
        vietnamese: "Tell luôn cần có người nghe đứng sau: She told me (that) she was tired. Say không đi trực tiếp với người nghe: She said (that) she was tired, hoặc She said something to me. Vì vậy có told me, nhưng không có said me. That thường được lược bỏ khi nói.",
      },
      examples: [
        { english: "My boss told us that the meeting was cancelled.", vietnamese: "Sếp bảo chúng tôi rằng cuộc họp bị huỷ." },
        { english: "What did he say to you?", vietnamese: "Anh ấy đã nói gì với bạn?" },
      ],
      mistake: {
        wrong: "She said me that she was busy.", right: "She told me that she was busy.",
        why: { english: "“Nói với tôi” is told me. Say can't be followed directly by a person.", vietnamese: "“Nói với tôi” là told me. Say không đi trực tiếp với người nghe." },
      },
    }, {
      title: "Moving the tense back",
      pattern: "am / is → was · will → would · can → could · present perfect / past → had + past participle",
      explanation: {
        english: "When you report what someone said earlier, the tense usually moves one step back: “I'm tired” → She said she was tired. “I'll call you” → He said he would call me. “I can't come” → She said she couldn't come. “I've finished” → He said he had finished. Pronouns and time words change too: tomorrow → the next day.",
        vietnamese: "Khi thuật lại lời ai đó nói trước đó, thì của động từ thường lùi một bậc: “I'm tired” → She said she was tired. “I'll call you” → He said he would call me. “I can't come” → She said she couldn't come. “I've finished” → He said he had finished. Đại từ và từ chỉ thời gian cũng đổi: tomorrow → the next day.",
      },
      examples: [
        { english: "“We're moving to Can Tho.” → They said they were moving to Can Tho.", vietnamese: "“Chúng tôi sắp chuyển đến Cần Thơ.” → Họ nói họ sắp chuyển đến Cần Thơ." },
        { english: "“I've lost my keys.” → He said he had lost his keys.", vietnamese: "“Tôi mất chìa khoá rồi.” → Anh ấy nói anh ấy đã mất chìa khoá." },
      ],
      mistake: {
        wrong: "Last week he said he will come to the party.", right: "Last week he said he would come to the party.",
        why: { english: "In reported speech after said, will usually becomes would.", vietnamese: "Trong câu tường thuật sau said, will thường đổi thành would." },
      },
    }],
    examples: [
      { english: "The government announced that taxes would rise next year.", vietnamese: "Chính phủ thông báo thuế sẽ tăng vào năm sau." },
      { english: "He admitted that he had made a mistake.", vietnamese: "Anh ấy thừa nhận đã mắc lỗi." },
      { english: "She told me she couldn't come because she was ill.", vietnamese: "Cô ấy bảo tôi là không đến được vì bị ốm." },
      { english: "The spokesperson insisted that the water was safe to drink.", vietnamese: "Người phát ngôn khẳng định nước uống được an toàn." },
    ],
    dialogue: [
      { speaker: "Joe", english: "Did you talk to Kim about the trip?", vietnamese: "Bạn đã nói chuyện với Kim về chuyến đi chưa?" },
      { speaker: "Dao", english: "Yes. She said she was really busy at work.", vietnamese: "Rồi. Cô ấy nói cô ấy đang rất bận việc." },
      { speaker: "Joe", english: "So she isn't coming?", vietnamese: "Vậy là cô ấy không đi à?" },
      { speaker: "Dao", english: "She told me she would try, but she couldn't promise anything.", vietnamese: "Cô ấy bảo sẽ cố, nhưng không hứa trước được gì." },
      { speaker: "Joe", english: "Did she mention her brother?", vietnamese: "Cô ấy có nhắc đến anh trai không?" },
      { speaker: "Dao", english: "She said he had already booked a ticket!", vietnamese: "Cô ấy nói anh ấy đã đặt vé rồi!" },
    ],
    practice: [
      q("Complete: She ___ me that she liked the film.", ["told", "said", "spoke", "talked"], "told", "Tell + person."),
      q("Complete: He ___ that he was hungry.", ["said", "told", "said me", "told that"], "said", "Say (that) …"),
      q("“I'm tired.” → She said she ___ tired.", ["was", "is", "will be", "has been"], "was", "Am → was."),
      q("“Người phát ngôn” in English is…", ["spokesperson", "speak man", "talker", "announcer person"], "spokesperson", "Spokesperson = official speaker."),
    ],
    challenge: [
      q("“I'll help you.” → He said he ___ help me.", ["would", "will", "can", "is"], "would", "Will → would."),
      q("“I can't swim.” → She told me she ___ swim.", ["couldn't", "can't", "won't", "didn't"], "couldn't", "Can't → couldn't."),
      q("“I've seen it.” → He said he ___ it.", ["had seen", "has seen", "saw it already", "sees"], "had seen", "Present perfect → had + past participle."),
      q("Choose the correct sentence.", ["They told us the shop was closed.", "They said us the shop was closed.", "They told the shop was closed.", "They said to us that the shop is closing was."], "They told us the shop was closed.", "Tell + person."),
      q("Complete: He ___ that he had taken the money. He was sorry.", ["admitted", "promised", "insisted", "announced"], "admitted", "Admit = agree that something bad is true."),
    ],
  }, {
    key: "reported-questions", title: "He Asked Where I Lived", titleVi: "Câu hỏi tường thuật",
    objectives: [
      "I can report questions that people asked me.",
      "Use asked + question word + subject + verb, with no do or did",
      "Report yes / no questions with if or whether",
    ],
    vocabulary: [
      { word: "journalist", ipa: "/ˈdʒɜːnəlɪst/", partOfSpeech: "noun", vietnamese: "nhà báo", definition: "a person who writes news stories", example: { english: "A journalist asked me what I thought of the new law.", vietnamese: "Một nhà báo hỏi tôi nghĩ gì về luật mới." } },
      { word: "interview", ipa: "/ˈɪntəvjuː/", partOfSpeech: "verb", vietnamese: "phỏng vấn", definition: "to ask someone questions for a report, a job or research", example: { english: "They interviewed people in the street.", vietnamese: "Họ phỏng vấn người đi đường." } },
      { word: "survey", ipa: "/ˈsɜːveɪ/", partOfSpeech: "noun", vietnamese: "cuộc khảo sát", definition: "a set of questions asked to many people to find out their opinions", example: { english: "A survey found that most teenagers sleep too little.", vietnamese: "Một cuộc khảo sát cho thấy phần lớn thanh thiếu niên ngủ quá ít." } },
      { word: "whether", ipa: "/ˈweðə/", partOfSpeech: "conjunction", vietnamese: "liệu… có… hay không", definition: "if; used when there are two possibilities", example: { english: "She asked whether I was free on Friday.", vietnamese: "Cô ấy hỏi liệu thứ Sáu tôi có rảnh không." } },
      { word: "wonder", ipa: "/ˈwʌndə/", partOfSpeech: "verb", vietnamese: "tự hỏi, thắc mắc", definition: "to think about something and want to know about it", example: { english: "I wonder why he didn't reply.", vietnamese: "Tôi tự hỏi sao anh ấy không trả lời." } },
      { word: "reply", ipa: "/rɪˈplaɪ/", partOfSpeech: "verb", vietnamese: "trả lời, hồi âm", definition: "to answer someone", example: { english: "I asked her twice, but she didn't reply.", vietnamese: "Tôi hỏi cô ấy hai lần, nhưng cô ấy không trả lời." } },
      { word: "find out", ipa: "/ˌfaɪnd ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "tìm hiểu, phát hiện ra", definition: "to get information about something", example: { english: "I called to find out what time the shop opened.", vietnamese: "Tôi gọi điện để hỏi xem mấy giờ cửa hàng mở cửa." } },
      { word: "the public", ipa: "/ðə ˈpʌblɪk/", partOfSpeech: "noun", vietnamese: "công chúng", definition: "ordinary people in general", example: { english: "The museum is open to the public at weekends.", vietnamese: "Bảo tàng mở cửa cho công chúng vào cuối tuần." } },
    ],
    grammar: [{
      title: "Asked + question word",
      pattern: "asked (me) + who / what / where / when / why / how + subject + verb (tense moved back)",
      explanation: {
        english: "A reported question is no longer a real question, so it has normal sentence order: subject before verb, no do, does or did, and no question mark. Move the tense back as in reported statements: “Where do you live?” → He asked me where I lived.",
        vietnamese: "Câu hỏi tường thuật không còn là câu hỏi thật, nên dùng trật tự câu bình thường: chủ ngữ trước động từ, không có do, does hay did, và không có dấu chấm hỏi. Lùi thì như câu tường thuật: “Where do you live?” → He asked me where I lived.",
      },
      examples: [
        { english: "“What are you doing?” → She asked me what I was doing.", vietnamese: "“Bạn đang làm gì thế?” → Cô ấy hỏi tôi đang làm gì." },
        { english: "“Why did you leave?” → They asked why I had left.", vietnamese: "“Sao bạn lại bỏ đi?” → Họ hỏi vì sao tôi đã bỏ đi." },
      ],
      mistake: {
        wrong: "He asked me where did I live.", right: "He asked me where I lived.",
        why: { english: "Reported questions use normal order, with no did.", vietnamese: "Câu hỏi tường thuật dùng trật tự bình thường, không có did." },
      },
    }, {
      title: "If or whether",
      pattern: "asked (me) + if / whether + subject + verb",
      explanation: {
        english: "To report a yes / no question, use if or whether, then normal order: “Do you like coffee?” → She asked me if I liked coffee. Whether is a little more formal and is common with or not: They asked whether or not I agreed.",
        vietnamese: "Để tường thuật câu hỏi có / không, dùng if hoặc whether, rồi trật tự bình thường: “Do you like coffee?” → She asked me if I liked coffee. Whether trang trọng hơn một chút và hay đi với or not: They asked whether or not I agreed.",
      },
      examples: [
        { english: "“Are you a student?” → The journalist asked if I was a student.", vietnamese: "“Bạn là sinh viên à?” → Nhà báo hỏi tôi có phải sinh viên không." },
        { english: "“Can you help?” → He asked whether I could help.", vietnamese: "“Bạn giúp được không?” → Anh ấy hỏi liệu tôi có giúp được không." },
      ],
      mistake: {
        wrong: "She asked me do I like spicy food.", right: "She asked me if I liked spicy food.",
        why: { english: "A reported yes / no question needs if or whether, with no do.", vietnamese: "Câu hỏi có / không khi tường thuật cần if hoặc whether, không có do." },
      },
    }],
    examples: [
      { english: "The survey asked people how often they used public transport.", vietnamese: "Cuộc khảo sát hỏi mọi người dùng phương tiện công cộng thường xuyên thế nào." },
      { english: "A journalist interviewed me and asked whether I felt safe in the city.", vietnamese: "Một nhà báo phỏng vấn tôi và hỏi liệu tôi có thấy an toàn trong thành phố không." },
      { english: "I wonder if the museum is open to the public today.", vietnamese: "Không biết hôm nay bảo tàng có mở cửa cho công chúng không." },
      { english: "I emailed to find out when they would reply.", vietnamese: "Tôi gửi email để hỏi khi nào họ sẽ trả lời." },
    ],
    dialogue: [
      { speaker: "Phong", english: "Guess what? A TV journalist interviewed me today!", vietnamese: "Đoán xem? Hôm nay một nhà báo truyền hình phỏng vấn mình đấy!" },
      { speaker: "Lily", english: "Really? What did she ask?", vietnamese: "Thật à? Cô ấy hỏi gì?" },
      { speaker: "Phong", english: "She asked me how I got to work every day.", vietnamese: "Cô ấy hỏi mình đi làm hằng ngày bằng gì." },
      { speaker: "Lily", english: "Was it for a survey about traffic?", vietnamese: "Cho cuộc khảo sát về giao thông à?" },
      { speaker: "Phong", english: "Yes. Then she asked if I would use a metro line.", vietnamese: "Ừ. Rồi cô ấy hỏi liệu mình có đi tàu điện không." },
      { speaker: "Lily", english: "I wonder whether they'll show it on TV tonight!", vietnamese: "Không biết tối nay họ có chiếu lên tivi không!" },
    ],
    practice: [
      q("“Where are you from?” → She asked me where I ___ from.", ["was", "am", "were", "is"], "was", "Normal order, tense back: I was."),
      q("Choose the correct sentence.", ["He asked me what my name was.", "He asked me what was my name.", "He asked me what is my name?", "He asked what did my name be."], "He asked me what my name was.", "Subject + verb: my name was."),
      q("“Do you smoke?” → The doctor asked ___ I smoked.", ["if", "that", "do", "what"], "if", "Yes / no question: if."),
      q("“Cuộc khảo sát” in English is…", ["survey", "surview", "research test", "inquiry list"], "survey", "Survey = questions to many people."),
    ],
    challenge: [
      q("“Why are you crying?” → Mum asked me why I ___.", ["was crying", "am crying", "were I crying", "did I cry"], "was crying", "Is / am → was; normal order."),
      q("Choose the correct sentence.", ["They asked whether we had booked a table.", "They asked whether had we booked a table.", "They asked did we book a table.", "They asked whether we have booked a table?"], "They asked whether we had booked a table.", "Whether + subject + verb, tense back."),
      q("“Can you speak English?” → She asked if I ___ speak English.", ["could", "can", "would", "did"], "could", "Can → could."),
      q("Complete: I called the bank to ___ why my card didn't work.", ["find out", "find", "find up", "look out"], "find out", "Find out = get information."),
      q("Complete: I ___ what she meant by that.", ["wonder", "wonder about if", "am wondering do", "wonders"], "wonder", "I wonder + question word + subject + verb."),
    ],
  }, {
    key: "relative-clauses", title: "The Man Who Lives Next Door", titleVi: "Mệnh đề quan hệ",
    objectives: [
      "I can describe people, things and places in more detail.",
      "Use who for people, which for things, that for both, and where for places",
      "Use whose, and don't repeat the object pronoun",
    ],
    vocabulary: [
      { word: "colleague", ipa: "/ˈkɒliːɡ/", partOfSpeech: "noun", vietnamese: "đồng nghiệp", definition: "a person you work with", example: { english: "She's the colleague who helped me on my first day.", vietnamese: "Cô ấy là đồng nghiệp đã giúp tôi ngày đầu đi làm." } },
      { word: "author", ipa: "/ˈɔːθə/", partOfSpeech: "noun", vietnamese: "tác giả", definition: "the writer of a book or article", example: { english: "Nguyen Nhat Anh is an author whose books are loved by children.", vietnamese: "Nguyễn Nhật Ánh là tác giả có sách được trẻ em yêu thích." } },
      { word: "owner", ipa: "/ˈəʊnə/", partOfSpeech: "noun", vietnamese: "chủ sở hữu", definition: "the person something belongs to", example: { english: "The owner of the café is from Hai Phong.", vietnamese: "Chủ quán cà phê là người Hải Phòng." } },
      { word: "gadget", ipa: "/ˈɡædʒɪt/", partOfSpeech: "noun", vietnamese: "đồ công nghệ nhỏ, thiết bị", definition: "a small, useful machine or tool", example: { english: "This is a gadget that turns off the lights for you.", vietnamese: "Đây là một thiết bị tự tắt đèn giúp bạn." } },
      { word: "character", ipa: "/ˈkærəktə/", partOfSpeech: "noun", vietnamese: "nhân vật", definition: "a person in a book, film or play", example: { english: "The main character is a girl who wants to be a pilot.", vietnamese: "Nhân vật chính là một cô gái muốn trở thành phi công." } },
      { word: "local", ipa: "/ˈləʊkl/", partOfSpeech: "adjective", vietnamese: "địa phương", definition: "belonging to the area where you live", example: { english: "This is the local market where I buy my vegetables.", vietnamese: "Đây là chợ địa phương nơi tôi mua rau." } },
      { word: "volunteer", ipa: "/ˌvɒlənˈtɪə/", partOfSpeech: "noun", vietnamese: "tình nguyện viên", definition: "a person who works without being paid, to help others", example: { english: "The volunteers who cleaned the beach were all students.", vietnamese: "Các tình nguyện viên dọn bãi biển đều là sinh viên." } },
      { word: "neighbourhood", ipa: "/ˈneɪbəhʊd/", partOfSpeech: "noun", vietnamese: "khu phố, khu dân cư", definition: "the area of a town where you live (British spelling)", example: { english: "I grew up in a neighbourhood where everyone knew each other.", vietnamese: "Tôi lớn lên ở một khu phố mà ai cũng biết nhau." } },
    ],
    grammar: [{
      title: "Who, which, that, where",
      pattern: "people: who / that · things: which / that · places: where (+ subject + verb)",
      explanation: {
        english: "A relative clause tells us which person, thing or place we mean. Use who (or that) for people, which (or that) for things, and where for places: the man who lives next door, the phone which I bought, the café where we met. Vietnamese uses “mà” or nothing for all of these, but English chooses by the noun.",
        vietnamese: "Mệnh đề quan hệ cho biết ta đang nói về người, vật hay nơi nào. Dùng who (hoặc that) cho người, which (hoặc that) cho vật, và where cho nơi chốn: the man who lives next door, the phone which I bought, the café where we met. Tiếng Việt dùng “mà” hoặc không dùng gì cho tất cả, còn tiếng Anh chọn theo danh từ.",
      },
      examples: [
        { english: "The woman who runs the bakery is very friendly.", vietnamese: "Người phụ nữ điều hành tiệm bánh rất thân thiện." },
        { english: "This is the street where I used to live.", vietnamese: "Đây là con phố nơi tôi từng sống." },
      ],
      mistake: {
        wrong: "The man which lives next door is a doctor.", right: "The man who lives next door is a doctor.",
        why: { english: "For people, use who (or that), not which.", vietnamese: "Với người, dùng who (hoặc that), không dùng which." },
      },
    }, {
      title: "Whose, and no extra pronoun",
      pattern: "whose + noun (= his / her / their) · the book (which) I bought (not I bought it)",
      explanation: {
        english: "Whose shows that something belongs to someone: the author whose books I love. When who, which or that is the object, it replaces the pronoun, so don't add it or him again: the book which I bought yesterday. You can also leave out who, which or that when it is the object: the book I bought yesterday.",
        vietnamese: "Whose chỉ sự sở hữu: the author whose books I love. Khi who, which hay that làm tân ngữ, nó đã thay cho đại từ, nên đừng thêm it hay him nữa: the book which I bought yesterday. Bạn cũng có thể bỏ who, which hay that khi nó làm tân ngữ: the book I bought yesterday.",
      },
      examples: [
        { english: "That's the girl whose brother plays for Hanoi FC.", vietnamese: "Đó là cô gái có anh trai chơi cho câu lạc bộ Hà Nội." },
        { english: "The film we watched last night was brilliant.", vietnamese: "Bộ phim chúng tôi xem tối qua rất hay." },
      ],
      mistake: {
        wrong: "This is the bag which I bought it in Hoi An.", right: "This is the bag which I bought in Hoi An.",
        why: { english: "Which already stands for the bag, so don't add it.", vietnamese: "Which đã thay cho the bag, nên đừng thêm it." },
      },
    }],
    examples: [
      { english: "The volunteer who showed us around was very kind.", vietnamese: "Tình nguyện viên dẫn chúng tôi tham quan rất tử tế." },
      { english: "I've got a gadget which charges my phone with sunlight.", vietnamese: "Tôi có một thiết bị sạc điện thoại bằng ánh nắng." },
      { english: "That's the owner whose dog keeps barking at night.", vietnamese: "Đó là người chủ có con chó cứ sủa suốt đêm." },
      { english: "Is there a local café in your neighbourhood where you can work?", vietnamese: "Khu phố bạn có quán cà phê nào để ngồi làm việc không?" },
    ],
    dialogue: [
      { speaker: "Nick", english: "Who's the woman who's talking to your boss?", vietnamese: "Người phụ nữ đang nói chuyện với sếp bạn là ai vậy?" },
      { speaker: "Huong", english: "She's the author whose book we're turning into a film.", vietnamese: "Bà ấy là tác giả có cuốn sách mà chúng tôi đang chuyển thể thành phim." },
      { speaker: "Nick", english: "The one about the boy who lives on a boat?", vietnamese: "Cuốn về cậu bé sống trên thuyền à?" },
      { speaker: "Huong", english: "That's it. The main character is based on her son.", vietnamese: "Đúng rồi. Nhân vật chính dựa trên con trai bà ấy." },
      { speaker: "Nick", english: "Where are you filming?", vietnamese: "Các bạn quay ở đâu?" },
      { speaker: "Huong", english: "In the Mekong Delta, in the village where she grew up.", vietnamese: "Ở đồng bằng sông Cửu Long, tại ngôi làng nơi bà ấy lớn lên." },
    ],
    practice: [
      q("Complete: She's the teacher ___ helped me with my English.", ["who", "which", "where", "whose"], "who", "People: who."),
      q("Complete: This is the restaurant ___ we had our first date.", ["where", "which", "who", "whose"], "where", "Places: where."),
      q("Complete: I lost the umbrella ___ you gave me.", ["which", "who", "where", "whose"], "which", "Things: which (or that)."),
      q("“Đồng nghiệp” in English is…", ["colleague", "college", "co-friend", "workman"], "colleague", "Colleague = someone you work with."),
    ],
    challenge: [
      q("Complete: That's the man ___ car was stolen.", ["whose", "who", "who's", "which"], "whose", "Belonging: whose + noun."),
      q("Choose the correct sentence.", ["The book I'm reading is great.", "The book I'm reading it is great.", "The book which I'm reading it is great.", "The book who I'm reading is great."], "The book I'm reading is great.", "No extra pronoun; which can be left out."),
      q("Choose the correct sentence.", ["People who exercise sleep better.", "People which exercise sleep better.", "People where exercise sleep better.", "People who they exercise sleep better."], "People who exercise sleep better.", "People: who, no extra pronoun."),
      q("Complete: I grew up in a ___ where everyone helped each other.", ["neighbourhood", "neighborhood", "neighbour", "neighbours"], "neighbourhood", "British spelling: neighbourhood."),
      q("What is a “volunteer”?", ["someone who works without pay to help", "a paid manager", "a famous author", "a shop owner"], "someone who works without pay to help", "Volunteer = unpaid helper."),
    ],
  }, {
    key: "the-news", title: "In the Headlines", titleVi: "Trên các tiêu đề báo",
    objectives: [
      "I can understand news headlines and talk about where my news comes from.",
      "Read headline grammar: present for the past, to + verb for the future",
      "Give my opinion with In my opinion, not According to me",
    ],
    vocabulary: [
      { word: "headline", ipa: "/ˈhedlaɪn/", partOfSpeech: "noun", vietnamese: "tiêu đề (báo)", definition: "the title of a news story, in large letters", example: { english: "The flood was in all the headlines.", vietnamese: "Trận lũ xuất hiện trên mọi tiêu đề báo." } },
      { word: "article", ipa: "/ˈɑːtɪkl/", partOfSpeech: "noun", vietnamese: "bài báo", definition: "a piece of writing in a newspaper, magazine or website", example: { english: "I read an interesting article about sleep.", vietnamese: "Tôi đọc một bài báo thú vị về giấc ngủ." } },
      { word: "breaking news", ipa: "/ˌbreɪkɪŋ ˈnjuːz/", partOfSpeech: "noun", vietnamese: "tin nóng, tin khẩn", definition: "news about something that is happening right now", example: { english: "We interrupt this programme for breaking news.", vietnamese: "Chúng tôi tạm ngừng chương trình để đưa tin nóng." } },
      { word: "fake news", ipa: "/ˌfeɪk ˈnjuːz/", partOfSpeech: "noun", vietnamese: "tin giả", definition: "false stories that look like real news", example: { english: "Check the source before you share it. It might be fake news.", vietnamese: "Kiểm tra nguồn trước khi chia sẻ. Có thể đó là tin giả." } },
      { word: "source", ipa: "/sɔːs/", partOfSpeech: "noun", vietnamese: "nguồn (tin)", definition: "where information comes from", example: { english: "What's your main source of news?", vietnamese: "Nguồn tin chính của bạn là gì?" } },
      { word: "reliable", ipa: "/rɪˈlaɪəbl/", partOfSpeech: "adjective", vietnamese: "đáng tin cậy", definition: "able to be trusted", example: { english: "Is this website a reliable source?", vietnamese: "Trang web này có phải nguồn đáng tin cậy không?" } },
      { word: "go viral", ipa: "/ˌɡəʊ ˈvaɪrəl/", partOfSpeech: "idiom", vietnamese: "lan truyền mạnh, gây bão mạng", definition: "to spread very quickly online", example: { english: "Her video went viral overnight.", vietnamese: "Video của cô ấy gây bão mạng chỉ sau một đêm." } },
      { word: "according to", ipa: "/əˈkɔːdɪŋ tə/", partOfSpeech: "preposition", vietnamese: "theo (nguồn tin)", definition: "as said or reported by someone else", example: { english: "According to the BBC, the strike will end tomorrow.", vietnamese: "Theo BBC, cuộc đình công sẽ kết thúc vào ngày mai." } },
    ],
    grammar: [{
      title: "Headline grammar",
      pattern: "present simple = a past event · to + verb = a future event · past participle = passive · few articles",
      explanation: {
        english: "Headlines save space. The present simple usually reports something that has just happened: Storm hits coast (= a storm has hit the coast). To + verb means the future: PM to visit Hanoi (= the Prime Minister is going to visit). A past participle alone is passive: Ten injured in crash (= ten people were injured). Articles and be are often left out.",
        vietnamese: "Tiêu đề báo tiết kiệm chữ. Hiện tại đơn thường báo tin vừa xảy ra: Storm hits coast (= bão đã đổ bộ vào bờ biển). To + động từ chỉ tương lai: PM to visit Hanoi (= Thủ tướng sẽ đến thăm Hà Nội). Quá khứ phân từ đứng một mình là bị động: Ten injured in crash (= mười người bị thương trong vụ tai nạn). Mạo từ và be thường bị lược bỏ.",
      },
      examples: [
        { english: "Headline: “Local girl wins national prize” = A local girl has won a national prize.", vietnamese: "Tiêu đề: “Local girl wins national prize” = Một cô gái địa phương đã đoạt giải quốc gia." },
        { english: "Headline: “New bridge to open in May” = A new bridge will open in May.", vietnamese: "Tiêu đề: “New bridge to open in May” = Một cây cầu mới sẽ khánh thành vào tháng Năm." },
      ],
      mistake: {
        wrong: "“Minister to resign” means the minister resigned last week.", right: "“Minister to resign” means the minister is going to resign.",
        why: { english: "In a headline, to + verb is about the future.", vietnamese: "Trong tiêu đề báo, to + động từ nói về tương lai." },
      },
    }, {
      title: "According to and in my opinion",
      pattern: "According to + another person / source · In my opinion, / I think / Personally, …",
      explanation: {
        english: "According to reports what someone else says: According to the police, … It is not used for your own view. For your opinion, say In my opinion, I think or Personally. Vietnamese “theo tôi” is In my opinion in English.",
        vietnamese: "According to dùng để thuật lại lời người khác: According to the police, … Không dùng cho quan điểm của chính mình. Để nêu ý kiến, nói In my opinion, I think hoặc Personally. “Theo tôi” trong tiếng Việt là In my opinion trong tiếng Anh.",
      },
      examples: [
        { english: "According to a new survey, people read less news than before.", vietnamese: "Theo một khảo sát mới, mọi người đọc tin tức ít hơn trước." },
        { english: "In my opinion, social media isn't a reliable source.", vietnamese: "Theo tôi, mạng xã hội không phải là nguồn đáng tin cậy." },
      ],
      mistake: {
        wrong: "According to me, the news is too negative.", right: "In my opinion, the news is too negative.",
        why: { english: "According to is for other people's words. For your own view, use In my opinion.", vietnamese: "According to dùng cho lời người khác. Với quan điểm của mình, dùng In my opinion." },
      },
    }],
    examples: [
      { english: "I never trust a headline until I've read the whole article.", vietnamese: "Tôi không bao giờ tin tiêu đề cho đến khi đọc hết bài báo." },
      { english: "The story went viral, but it turned out to be fake news.", vietnamese: "Câu chuyện lan truyền khắp mạng, nhưng hoá ra là tin giả." },
      { english: "According to several reliable sources, the airport will reopen tomorrow.", vietnamese: "Theo một số nguồn tin đáng tin cậy, sân bay sẽ mở cửa trở lại vào ngày mai." },
      { english: "There's breaking news on every channel tonight.", vietnamese: "Tối nay kênh nào cũng có tin nóng." },
    ],
    dialogue: [
      { speaker: "Mia", english: "Have you seen this headline? “Robot to replace teachers.”", vietnamese: "Bạn đã thấy tiêu đề này chưa? “Robot sẽ thay thế giáo viên.”" },
      { speaker: "Dung", english: "Where's it from? Is it a reliable source?", vietnamese: "Nó từ đâu ra vậy? Có phải nguồn đáng tin không?" },
      { speaker: "Mia", english: "A website my cousin shared. It's gone viral.", vietnamese: "Một trang web em họ mình chia sẻ. Nó đang lan truyền rất mạnh." },
      { speaker: "Dung", english: "Read the article first. Headlines often sound worse than the story.", vietnamese: "Đọc bài báo trước đã. Tiêu đề thường nghe đáng sợ hơn nội dung." },
      { speaker: "Mia", english: "You're right. According to the article, it's just one robot in one school.", vietnamese: "Bạn nói đúng. Theo bài báo, chỉ có một con robot ở một trường thôi." },
      { speaker: "Dung", english: "In my opinion, that's almost fake news!", vietnamese: "Theo mình, đó gần như là tin giả!" },
    ],
    practice: [
      q("“Storm hits north coast” means…", ["A storm has hit the north coast.", "A storm will hit the north coast.", "A storm hit the coast years ago.", "There is never a storm on the coast."], "A storm has hit the north coast.", "Headline present = recent past."),
      q("“Singer to marry in June” means…", ["The singer is going to marry in June.", "The singer married last June.", "The singer is married.", "The singer wants to marry someone called June."], "The singer is going to marry in June.", "To + verb = future."),
      q("Choose the correct sentence.", ["In my opinion, the film was too long.", "According to me, the film was too long.", "In my opinion of me, the film was too long.", "According my opinion, the film was too long."], "In my opinion, the film was too long.", "Your view: In my opinion."),
      q("“Tin giả” in English is…", ["fake news", "false new", "lie news", "wrong newspaper"], "fake news", "Fake news = false stories."),
    ],
    challenge: [
      q("“Five hurt in factory fire” means…", ["Five people were hurt in a factory fire.", "Five people will hurt someone.", "Five factories hurt people.", "Five people started a fire."], "Five people were hurt in a factory fire.", "Past participle alone = passive."),
      q("Complete: ___ the weather service, it will snow tonight.", ["According to", "In my opinion", "Personally", "By the opinion of"], "According to", "Reporting a source: according to."),
      q("Complete: His joke ___ and now he's famous.", ["went viral", "went virus", "made viral", "got virally"], "went viral", "Go viral = spread fast online."),
      q("What does “reliable” mean?", ["able to be trusted", "very new", "very long", "easy to read"], "able to be trusted", "Reliable = trustworthy."),
      q("Complete: What is your main ___ of news?", ["source", "sauce", "resource", "origin place"], "source", "Source = where information comes from."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 5", isReview: true,
    objectives: [
      "I can read, understand and pass on the news accurately.",
      "Check the passive, say / tell, tense changes in reported speech, relative clauses and opinions",
    ],
    vocabulary: [
      { word: "publish", ipa: "/ˈpʌblɪʃ/", partOfSpeech: "verb", vietnamese: "xuất bản, đăng", definition: "to print a book, magazine or article, or put it online", example: { english: "The results will be published online.", vietnamese: "Kết quả sẽ được đăng trực tuyến." } },
      { word: "announce", ipa: "/əˈnaʊns/", partOfSpeech: "verb", vietnamese: "thông báo", definition: "to tell people something officially", example: { english: "They announced the winners on Friday.", vietnamese: "Họ công bố người thắng cuộc vào thứ Sáu." } },
      { word: "journalist", ipa: "/ˈdʒɜːnəlɪst/", partOfSpeech: "noun", vietnamese: "nhà báo", definition: "a person who writes news stories", example: { english: "My sister works as a journalist in Saigon.", vietnamese: "Chị tôi làm nhà báo ở Sài Gòn." } },
      { word: "colleague", ipa: "/ˈkɒliːɡ/", partOfSpeech: "noun", vietnamese: "đồng nghiệp", definition: "a person you work with", example: { english: "A colleague told me about the job.", vietnamese: "Một đồng nghiệp kể cho tôi về công việc đó." } },
      { word: "headline", ipa: "/ˈhedlaɪn/", partOfSpeech: "noun", vietnamese: "tiêu đề (báo)", definition: "the title of a news story, in large letters", example: { english: "Don't just read the headlines.", vietnamese: "Đừng chỉ đọc tiêu đề." } },
      { word: "reliable", ipa: "/rɪˈlaɪəbl/", partOfSpeech: "adjective", vietnamese: "đáng tin cậy", definition: "able to be trusted", example: { english: "We need a more reliable internet connection.", vietnamese: "Chúng ta cần kết nối internet ổn định hơn." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "was built (not was happened) · told me / said that · will → would · asked where I lived · who / which / where, no extra pronoun",
      explanation: {
        english: "Check these: the passive is be + past participle, but happen, arrive and die have no passive; tell needs a person (told me), say doesn't (said that); in reported speech the tense moves back (will → would, am → was); reported questions keep normal order with no did, and yes / no questions take if; who for people, which for things, where for places, whose for belonging, and no extra pronoun. And for your own view, say In my opinion.",
        vietnamese: "Hãy kiểm tra: bị động là be + quá khứ phân từ, nhưng happen, arrive và die không có bị động; tell cần người nghe (told me), say thì không (said that); trong câu tường thuật thì lùi một bậc (will → would, am → was); câu hỏi tường thuật giữ trật tự bình thường, không có did, câu hỏi có / không dùng if; who cho người, which cho vật, where cho nơi chốn, whose cho sở hữu, và không thêm đại từ. Và nêu quan điểm của mình thì nói In my opinion.",
      },
      examples: [
        { english: "The journalist who wrote the article said it had been checked twice.", vietnamese: "Nhà báo viết bài đó nói rằng nó đã được kiểm tra hai lần." },
        { english: "She asked me where the results were published.", vietnamese: "Cô ấy hỏi tôi kết quả được đăng ở đâu." },
      ],
    }],
    examples: [
      { english: "The report was published yesterday, and it was in all the headlines.", vietnamese: "Bản báo cáo được công bố hôm qua, và xuất hiện trên mọi tiêu đề báo." },
      { english: "A colleague told me that the company would announce the news soon.", vietnamese: "Một đồng nghiệp bảo tôi công ty sắp công bố tin này." },
      { english: "In my opinion, the journalist used reliable sources.", vietnamese: "Theo tôi, nhà báo đã dùng các nguồn đáng tin cậy." },
    ],
    dialogue: [
      { speaker: "Tom", english: "Did you hear what happened at the stadium?", vietnamese: "Bạn có nghe chuyện xảy ra ở sân vận động không?" },
      { speaker: "Quynh", english: "Yes. The match was stopped because of the rain.", vietnamese: "Có. Trận đấu bị dừng vì mưa." },
      { speaker: "Tom", english: "A friend told me the players had refused to continue.", vietnamese: "Một người bạn bảo mình là các cầu thủ đã từ chối đá tiếp." },
      { speaker: "Quynh", english: "That's not what the article said. Who told you that?", vietnamese: "Bài báo đâu có nói vậy. Ai bảo bạn thế?" },
      { speaker: "Tom", english: "A colleague whose brother was at the match.", vietnamese: "Một đồng nghiệp có anh trai đã xem trận đấu." },
      { speaker: "Quynh", english: "Well, according to the BBC, the referee stopped it.", vietnamese: "À, theo BBC thì trọng tài đã cho dừng trận." },
      { speaker: "Tom", english: "In my opinion, the BBC is more reliable than my colleague!", vietnamese: "Theo mình thì BBC đáng tin hơn đồng nghiệp của mình!" },
    ],
    practice: [
      q("Complete: The first iPhone ___ in 2007.", ["was released", "released", "was release", "is released"], "was released", "Past passive."),
      q("Complete: He ___ us that the shop was closing.", ["told", "said", "said to", "spoke"], "told", "Tell + person."),
      q("“I'm leaving.” → She said she ___ leaving.", ["was", "is", "will be", "has"], "was", "Am → was."),
      q("Complete: That's the woman ___ son is a famous singer.", ["whose", "who", "which", "who's"], "whose", "Belonging: whose."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["Something strange happened last night.", "Something strange was happened last night.", "Something strange is happened last night.", "Something strange happening last night."], "Something strange happened last night.", "Happen has no passive."),
      q("“Do you have a pen?” → He asked me ___ a pen.", ["if I had", "do I have", "if had I", "did I have"], "if I had", "If + subject + verb, tense back."),
      q("Choose the correct sentence.", ["The laptop I bought last week is broken.", "The laptop I bought it last week is broken.", "The laptop who I bought is broken.", "The laptop where I bought is broken."], "The laptop I bought last week is broken.", "No extra pronoun."),
      q("“Prices to rise again” means…", ["Prices are going to rise.", "Prices rose last year.", "Prices are falling.", "Prices are the same."], "Prices are going to rise.", "Headline to + verb = future."),
      q("Choose the best way to give your view.", ["Personally, I think it's a good idea.", "According to me, it's a good idea.", "As me, it's a good idea.", "My opinion is according good idea."], "Personally, I think it's a good idea.", "Your view: Personally / In my opinion."),
    ],
  }],
  assessment: [
    { id: "present-passive", prompt: "Complete: Coffee ___ in the Central Highlands.", options: ["is grown", "grows by", "is grow", "grown is"], correct: "is grown", explanation: "Present passive: is + past participle." },
    { id: "past-passive", prompt: "Complete: The temple ___ in the 11th century.", options: ["was built", "was build", "built", "is build"], correct: "was built", explanation: "Past passive: was + past participle." },
    { id: "by-agent", prompt: "Complete: This song was written ___ a 15-year-old girl.", options: ["by", "from", "with", "of"], correct: "by", explanation: "The doer: by." },
    { id: "no-passive", prompt: "Choose the correct sentence.", options: ["What happened to your phone?", "What was happened to your phone?", "What is happened to your phone?", "What happen to your phone?"], correct: "What happened to your phone?", explanation: "Happen has no passive." },
    { id: "told-me", prompt: "“Cô ấy nói với tôi rằng cô ấy mệt.” in English is…", options: ["She told me that she was tired.", "She said me that she was tired.", "She told that she was tired me.", "She said to me she tired."], correct: "She told me that she was tired.", explanation: "Tell + person." },
    { id: "will-would", prompt: "“I'll send it tomorrow.” → He said he ___ send it the next day.", options: ["would", "will", "can", "is"], correct: "would", explanation: "Will → would." },
    { id: "pp-had", prompt: "“We've finished.” → They said they ___.", options: ["had finished", "have finished", "finish", "will finish"], correct: "had finished", explanation: "Present perfect → had + past participle." },
    { id: "reported-wh", prompt: "Choose the correct sentence.", options: ["She asked me what time it was.", "She asked me what time was it.", "She asked me what time did it be.", "She asked me what time is it?"], correct: "She asked me what time it was.", explanation: "Normal order: it was." },
    { id: "reported-yes-no", prompt: "“Are you hungry?” → Mum asked ___ I was hungry.", options: ["if", "that", "are", "what"], correct: "if", explanation: "Yes / no question: if." },
    { id: "who", prompt: "Complete: The doctor ___ treated me was very kind.", options: ["who", "which", "where", "whose"], correct: "who", explanation: "People: who." },
    { id: "where", prompt: "Complete: That's the hospital ___ I was born.", options: ["where", "which", "who", "whose"], correct: "where", explanation: "Places: where." },
    { id: "whose", prompt: "Complete: I met a man ___ wife is a famous chef.", options: ["whose", "who", "who's", "which"], correct: "whose", explanation: "Belonging: whose." },
    { id: "no-extra-pronoun", prompt: "Choose the correct sentence.", options: ["The cake that she made was delicious.", "The cake that she made it was delicious.", "The cake who she made was delicious.", "The cake she made it was delicious."], correct: "The cake that she made was delicious.", explanation: "No extra pronoun." },
    { id: "headline-future", prompt: "“Hanoi to host games in 2030” means…", options: ["Hanoi is going to host the games in 2030.", "Hanoi hosted the games in 2030.", "Hanoi hosts games every year.", "Hanoi wanted to host the games."], correct: "Hanoi is going to host the games in 2030.", explanation: "Headline to + verb = future." },
    { id: "in-my-opinion", prompt: "“Theo tôi, phim này hay.” in English is…", options: ["In my opinion, this film is good.", "According to me, this film is good.", "Following me, this film is good.", "By my opinion, this film is good."], correct: "In my opinion, this film is good.", explanation: "Your view: In my opinion." },
  ],
};
