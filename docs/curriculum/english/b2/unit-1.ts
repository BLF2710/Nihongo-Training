// B2 Unit 1: People & Relationships. Vietnamese speakers at this level often put the pronoun in the wrong place
// ("She brought up me", "He looks his mum after"), drop the preposition from three-part verbs ("I get on well my
// sister"), say "unpatient" or "open mind", use "would" for past states ("I would have long hair"), add an adverb
// after look ("She looks happily"), and turn "phải không" into "isn't it?" for every tag. This unit puts those right
// for describing people and getting a conversation going.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B2",
  number: 1,
  lessons: [{
    key: "relationship-phrasal-verbs", title: "We Get On Really Well", titleVi: "Cụm động từ về các mối quan hệ",
    objectives: [
      "I can talk about friends and family with natural phrasal verbs.",
      "Put a pronoun between a separable phrasal verb and its particle: bring me up",
      "Keep three-part phrasal verbs together: get on with, put up with, look up to",
    ],
    vocabulary: [
      { word: "get on (with)", ipa: "/ˌɡet ˈɒn wɪð/", partOfSpeech: "phrasal verb", vietnamese: "hợp nhau, hoà thuận", definition: "to have a friendly relationship with someone", example: { english: "I get on really well with my flatmates.", vietnamese: "Tôi rất hợp với mấy người ở cùng căn hộ." } },
      { word: "fall out (with)", ipa: "/ˌfɔːl ˈaʊt wɪð/", partOfSpeech: "phrasal verb", vietnamese: "cãi nhau, bất hoà", definition: "to argue with someone and stop being friendly", example: { english: "She fell out with her best friend over a boy.", vietnamese: "Cô ấy bất hoà với bạn thân vì một cậu con trai." } },
      { word: "make up", ipa: "/ˌmeɪk ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "làm lành", definition: "to become friends again after an argument", example: { english: "They had a big argument, but they made up the next day.", vietnamese: "Họ cãi nhau to, nhưng hôm sau đã làm lành." } },
      { word: "look up to", ipa: "/ˌlʊk ˈʌp tə/", partOfSpeech: "phrasal verb", vietnamese: "kính trọng, ngưỡng mộ", definition: "to admire and respect someone", example: { english: "I've always looked up to my grandfather.", vietnamese: "Tôi luôn kính trọng ông nội." } },
      { word: "put up with", ipa: "/ˌpʊt ˈʌp wɪð/", partOfSpeech: "phrasal verb", vietnamese: "chịu đựng", definition: "to accept something unpleasant without complaining", example: { english: "I can't put up with his loud music any more.", vietnamese: "Tôi không thể chịu nổi tiếng nhạc ầm ĩ của anh ta nữa." } },
      { word: "break up", ipa: "/ˌbreɪk ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "chia tay", definition: "to end a romantic relationship", example: { english: "Linh and her boyfriend broke up last month.", vietnamese: "Linh và bạn trai đã chia tay tháng trước." } },
      { word: "bring up", ipa: "/ˌbrɪŋ ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "nuôi dạy", definition: "to look after a child until it is an adult", example: { english: "I was brought up by my grandparents in Nam Dinh.", vietnamese: "Tôi được ông bà nuôi dạy ở Nam Định." } },
      { word: "count on", ipa: "/ˈkaʊnt ɒn/", partOfSpeech: "phrasal verb", vietnamese: "trông cậy vào", definition: "to trust someone to help you", example: { english: "You can always count on Hoa. She never lets you down.", vietnamese: "Bạn luôn có thể trông cậy vào Hoa. Cô ấy không bao giờ làm bạn thất vọng." } },
    ],
    grammar: [{
      title: "Where the pronoun goes",
      pattern: "separable: bring up my sister / bring my sister up / bring her up (not bring up her) · inseparable: look after her",
      explanation: {
        english: "Some phrasal verbs can be split. With a noun, the noun can go before or after the particle: They brought up three children / They brought three children up. With a pronoun (me, him, it, them), the pronoun must go in the middle: They brought them up. Other phrasal verbs can't be split, so the object always comes after: look after her, count on him. A good dictionary marks which is which.",
        vietnamese: "Một số cụm động từ có thể tách ra. Với danh từ, danh từ có thể đứng trước hoặc sau tiểu từ: They brought up three children / They brought three children up. Với đại từ (me, him, it, them), đại từ bắt buộc đứng giữa: They brought them up. Các cụm động từ khác không tách được, nên tân ngữ luôn đứng sau: look after her, count on him. Từ điển tốt sẽ ghi rõ loại nào.",
      },
      examples: [
        { english: "My aunt brought me up after my parents moved abroad.", vietnamese: "Dì tôi nuôi tôi khi bố mẹ tôi ra nước ngoài." },
        { english: "If you need help, you can count on us.", vietnamese: "Nếu cần giúp, bạn có thể trông cậy vào chúng tôi." },
      ],
      mistake: {
        wrong: "My grandmother brought up me.", right: "My grandmother brought me up.",
        why: { english: "With a separable phrasal verb, a pronoun goes between the verb and the particle.", vietnamese: "Với cụm động từ tách được, đại từ đứng giữa động từ và tiểu từ." },
      },
    }, {
      title: "Three-part phrasal verbs",
      pattern: "get on with · fall out with · put up with · look up to · + object (never split)",
      explanation: {
        english: "Some phrasal verbs have three parts: a verb, a particle and a preposition. Keep all three together, with the object at the end: I get on with my boss. She looks up to her mum. If there is no object, the last word drops: We get on well. They fell out.",
        vietnamese: "Một số cụm động từ có ba phần: động từ, tiểu từ và giới từ. Giữ cả ba đi liền nhau, tân ngữ đặt cuối: I get on with my boss. She looks up to her mum. Nếu không có tân ngữ thì bỏ từ cuối: We get on well. They fell out.",
      },
      examples: [
        { english: "How do you put up with all that noise?", vietnamese: "Làm sao bạn chịu nổi chừng ấy tiếng ồn?" },
        { english: "We fell out years ago, but now we get on fine.", vietnamese: "Chúng tôi bất hoà từ nhiều năm trước, nhưng giờ thì hoà thuận rồi." },
      ],
      mistake: {
        wrong: "I get on well my sister.", right: "I get on well with my sister.",
        why: { english: "With an object, get on needs with.", vietnamese: "Khi có tân ngữ, get on cần có with." },
      },
    }],
    examples: [
      { english: "We broke up because we couldn't put up with each other's habits.", vietnamese: "Chúng tôi chia tay vì không chịu được thói quen của nhau." },
      { english: "Do you get on with your in-laws?", vietnamese: "Bạn có hợp với nhà chồng / nhà vợ không?" },
      { english: "Every child needs someone to look up to.", vietnamese: "Đứa trẻ nào cũng cần một người để noi gương." },
      { english: "They fell out over money, but they made up in the end.", vietnamese: "Họ bất hoà vì tiền, nhưng cuối cùng đã làm lành." },
    ],
    dialogue: [
      { speaker: "Ellie", english: "You and your brother seem really close.", vietnamese: "Bạn và anh trai có vẻ rất thân." },
      { speaker: "Quan", english: "We get on well now, but we used to fall out all the time.", vietnamese: "Giờ thì bọn mình hợp nhau, nhưng trước đây suốt ngày cãi nhau." },
      { speaker: "Ellie", english: "What changed?", vietnamese: "Điều gì đã thay đổi?" },
      { speaker: "Quan", english: "Our parents worked abroad, so he brought me up for a few years.", vietnamese: "Bố mẹ mình làm việc ở nước ngoài, nên anh ấy nuôi mình vài năm." },
      { speaker: "Ellie", english: "That's amazing. No wonder you look up to him.", vietnamese: "Tuyệt thật. Thảo nào bạn kính trọng anh ấy." },
      { speaker: "Quan", english: "Exactly. I know I can always count on him.", vietnamese: "Đúng thế. Mình biết mình luôn có thể trông cậy vào anh ấy." },
    ],
    practice: [
      q("Complete: I ___ really well with my colleagues.", ["get on", "get up", "get off", "get along to"], "get on", "Get on (well) with = have a good relationship."),
      q("Choose the correct sentence.", ["Her parents brought her up in Hue.", "Her parents brought up her in Hue.", "Her parents brought her in Hue up.", "Her parents up brought her in Hue."], "Her parents brought her up in Hue.", "Pronoun in the middle."),
      q("Complete: They argued, but they ___ an hour later.", ["made up", "made out", "broke up", "fell up"], "made up", "Make up = become friends again."),
      q("“Chịu đựng” in English is…", ["put up with", "put on with", "put down to", "bring up with"], "put up with", "Put up with = accept something unpleasant."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["I look up to my teacher.", "I look up my teacher to.", "I look my teacher up to.", "I look to up my teacher."], "I look up to my teacher.", "Three-part verbs stay together."),
      q("Complete: She ___ with her flatmate about the bills.", ["fell out", "fell off", "fell down", "fell for"], "fell out", "Fall out with = argue."),
      q("Choose the correct sentence.", ["You can count on me.", "You can count me on.", "You can count on with me.", "You can on count me."], "You can count on me.", "Count on can't be split."),
      q("Complete: After five years together, they ___.", ["broke up", "broke out", "brought up", "made out"], "broke up", "Break up = end a relationship."),
      q("Complete: I can't put up ___ this heat.", ["with", "to", "on", "for"], "with", "Put up with."),
    ],
  }, {
    key: "personality", title: "Easy-Going and Reliable", titleVi: "Tính cách",
    objectives: [
      "I can describe people's personalities precisely.",
      "Make opposites with un-, in-, im-, dis- and ir-",
      "Use hyphenated compound adjectives: open-minded, bad-tempered",
    ],
    vocabulary: [
      { word: "easy-going", ipa: "/ˌiːzi ˈɡəʊɪŋ/", partOfSpeech: "adjective", vietnamese: "dễ tính", definition: "relaxed and not easily worried or annoyed", example: { english: "My dad is very easy-going. He never gets angry.", vietnamese: "Bố tôi rất dễ tính. Ông không bao giờ nổi giận." } },
      { word: "reliable", ipa: "/rɪˈlaɪəbl/", partOfSpeech: "adjective", vietnamese: "đáng tin cậy", definition: "someone you can trust to do what they say", example: { english: "We need someone reliable to look after the shop.", vietnamese: "Chúng tôi cần một người đáng tin cậy để trông cửa hàng." } },
      { word: "outgoing", ipa: "/ˌaʊtˈɡəʊɪŋ/", partOfSpeech: "adjective", vietnamese: "hướng ngoại, cởi mở", definition: "friendly and happy to meet new people", example: { english: "She's so outgoing that she makes friends everywhere.", vietnamese: "Cô ấy hướng ngoại đến mức đi đâu cũng kết bạn." } },
      { word: "stubborn", ipa: "/ˈstʌbən/", partOfSpeech: "adjective", vietnamese: "bướng bỉnh, cứng đầu", definition: "not willing to change your mind", example: { english: "He's too stubborn to say sorry.", vietnamese: "Anh ấy cứng đầu đến mức không chịu xin lỗi." } },
      { word: "generous", ipa: "/ˈdʒenərəs/", partOfSpeech: "adjective", vietnamese: "hào phóng", definition: "happy to give money, time or help", example: { english: "It was generous of you to pay for dinner.", vietnamese: "Bạn thật hào phóng khi trả tiền bữa tối." } },
      { word: "sensitive", ipa: "/ˈsensətɪv/", partOfSpeech: "adjective", vietnamese: "nhạy cảm", definition: "easily upset, or good at understanding others' feelings", example: { english: "Be careful what you say. He's quite sensitive.", vietnamese: "Cẩn thận lời nói nhé. Anh ấy khá nhạy cảm." } },
      { word: "open-minded", ipa: "/ˌəʊpən ˈmaɪndɪd/", partOfSpeech: "adjective", vietnamese: "cởi mở, thoáng", definition: "willing to listen to new ideas", example: { english: "My grandparents are surprisingly open-minded.", vietnamese: "Ông bà tôi thoáng đến bất ngờ." } },
      { word: "bad-tempered", ipa: "/ˌbæd ˈtempəd/", partOfSpeech: "adjective", vietnamese: "nóng tính, cáu kỉnh", definition: "often angry or annoyed", example: { english: "He's always bad-tempered before his morning coffee.", vietnamese: "Anh ấy lúc nào cũng cáu kỉnh trước khi uống cà phê sáng." } },
    ],
    grammar: [{
      title: "Negative prefixes",
      pattern: "un- (unreliable) · in- (insensitive) · im- before p / m (impatient, immature) · dis- (dishonest) · ir- before r (irresponsible)",
      explanation: {
        english: "Many personality adjectives make their opposite with a prefix. un- is the most common: unreliable, unfriendly. in- is used with some: insensitive. Before p and m it becomes im-: impatient, impolite, immature. Before r it becomes ir-: irresponsible. dis- goes with a few: dishonest, disorganised. Learn each one with its prefix.",
        vietnamese: "Nhiều tính từ chỉ tính cách tạo từ trái nghĩa bằng tiền tố. un- phổ biến nhất: unreliable, unfriendly. in- dùng với một số từ: insensitive. Trước p và m thì thành im-: impatient, impolite, immature. Trước r thì thành ir-: irresponsible. dis- đi với một vài từ: dishonest, disorganised. Hãy học mỗi từ kèm tiền tố của nó.",
      },
      examples: [
        { english: "It was very insensitive of him to laugh.", vietnamese: "Anh ta cười như vậy thật thiếu tế nhị." },
        { english: "Leaving the children alone was irresponsible.", vietnamese: "Để bọn trẻ ở nhà một mình là vô trách nhiệm." },
      ],
      mistake: {
        wrong: "Don't be so unpatient!", right: "Don't be so impatient!",
        why: { english: "Before p, the negative prefix is im-: impatient.", vietnamese: "Trước p, tiền tố phủ định là im-: impatient." },
      },
    }, {
      title: "Compound adjectives",
      pattern: "adjective + noun-ed: open-minded, bad-tempered, kind-hearted · adjective + -ing: easy-going, good-looking",
      explanation: {
        english: "Compound adjectives join two words with a hyphen. Many end in -ed, made from a noun: an open mind → open-minded, a bad temper → bad-tempered. Others end in -ing: easy-going, hard-working. Vietnamese says “đầu óc cởi mở” with a noun, but English needs the adjective form.",
        vietnamese: "Tính từ ghép nối hai từ bằng dấu gạch nối. Nhiều từ kết thúc bằng -ed, tạo từ danh từ: an open mind → open-minded, a bad temper → bad-tempered. Một số khác kết thúc bằng -ing: easy-going, hard-working. Tiếng Việt nói “đầu óc cởi mở” bằng danh từ, nhưng tiếng Anh cần dạng tính từ.",
      },
      examples: [
        { english: "She's a kind-hearted, hard-working nurse.", vietnamese: "Cô ấy là một y tá tốt bụng và chăm chỉ." },
        { english: "He's absent-minded. He always forgets his keys.", vietnamese: "Anh ấy hay đãng trí. Lúc nào cũng quên chìa khoá." },
      ],
      mistake: {
        wrong: "My boss is very open mind.", right: "My boss is very open-minded.",
        why: { english: "Use the compound adjective open-minded, with -ed and a hyphen.", vietnamese: "Dùng tính từ ghép open-minded, có -ed và dấu gạch nối." },
      },
    }],
    examples: [
      { english: "She's outgoing and generous, but she can be stubborn.", vietnamese: "Cô ấy hướng ngoại và hào phóng, nhưng đôi khi khá bướng." },
      { english: "An easy-going manager is nice, but a reliable one is better.", vietnamese: "Một quản lý dễ tính thì tốt, nhưng một quản lý đáng tin cậy thì tốt hơn." },
      { english: "He seems bad-tempered, but he's actually very sensitive.", vietnamese: "Anh ấy trông có vẻ nóng tính, nhưng thật ra rất nhạy cảm." },
      { english: "Travelling has made me more open-minded.", vietnamese: "Đi du lịch đã khiến tôi cởi mở hơn." },
    ],
    dialogue: [
      { speaker: "Hannah", english: "What's your new boss like?", vietnamese: "Sếp mới của bạn thế nào?" },
      { speaker: "Trang", english: "She's quite easy-going, and very open-minded about new ideas.", vietnamese: "Bà ấy khá dễ tính, và rất cởi mở với ý tưởng mới." },
      { speaker: "Hannah", english: "Lucky you! Mine is so bad-tempered.", vietnamese: "Bạn may thật! Sếp mình nóng tính lắm." },
      { speaker: "Trang", english: "Is he reliable, at least?", vietnamese: "Ít nhất ông ấy có đáng tin không?" },
      { speaker: "Hannah", english: "Not really. He's disorganised and a bit impatient.", vietnamese: "Không hẳn. Ông ấy bừa bộn và hơi thiếu kiên nhẫn." },
      { speaker: "Trang", english: "Maybe he's just stressed. Give him time.", vietnamese: "Có lẽ ông ấy chỉ đang căng thẳng. Cho ông ấy thời gian đi." },
    ],
    practice: [
      q("The opposite of “honest” is…", ["dishonest", "unhonest", "inhonest", "imhonest"], "dishonest", "dis- + honest."),
      q("The opposite of “patient” is…", ["impatient", "unpatient", "inpatient", "dispatient"], "impatient", "im- before p."),
      q("Complete: She's very ___. She listens to every idea.", ["open-minded", "open mind", "open-mind", "opened-minded"], "open-minded", "Compound adjective with -ed."),
      q("“Dễ tính” in English is…", ["easy-going", "easy-go", "easily going", "going-easy"], "easy-going", "Easy-going = relaxed."),
    ],
    challenge: [
      q("The opposite of “responsible” is…", ["irresponsible", "unresponsible", "inresponsible", "disresponsible"], "irresponsible", "ir- before r."),
      q("Complete: He never changes his mind. He's so ___.", ["stubborn", "generous", "outgoing", "sensitive"], "stubborn", "Stubborn = won't change his mind."),
      q("Choose the correct sentence.", ["My uncle is quite bad-tempered.", "My uncle is quite bad temper.", "My uncle is quite bad-temper.", "My uncle has quite bad-tempered."], "My uncle is quite bad-tempered.", "Compound adjective with -ed."),
      q("Complete: You can trust him. He's very ___.", ["reliable", "unreliable", "impatient", "stubborn"], "reliable", "Reliable = can be trusted."),
      q("What does “generous” mean?", ["happy to give money, time or help", "often angry", "not willing to change", "easily upset"], "happy to give money, time or help", "Generous = giving."),
    ],
  }, {
    key: "habits", title: "She's Always Borrowing My Things", titleVi: "Nói về thói quen",
    objectives: [
      "I can talk about habits, including annoying ones and ones from the past.",
      "Use be always + -ing to complain about a habit",
      "Use would for past actions, but used to for past states",
    ],
    vocabulary: [
      { word: "habit", ipa: "/ˈhæbɪt/", partOfSpeech: "noun", vietnamese: "thói quen", definition: "something you do often, often without thinking", example: { english: "Biting your nails is a bad habit.", vietnamese: "Cắn móng tay là một thói quen xấu." } },
      { word: "annoying", ipa: "/əˈnɔɪɪŋ/", partOfSpeech: "adjective", vietnamese: "khó chịu, gây bực mình", definition: "making you a little angry", example: { english: "It's annoying when people talk during films.", vietnamese: "Thật bực mình khi người ta nói chuyện lúc xem phim." } },
      { word: "tend to", ipa: "/ˈtend tə/", partOfSpeech: "phrase", vietnamese: "có xu hướng, thường hay", definition: "to usually do or be something", example: { english: "I tend to eat too much when I'm stressed.", vietnamese: "Tôi hay ăn quá nhiều khi căng thẳng." } },
      { word: "keep on", ipa: "/ˌkiːp ˈɒn/", partOfSpeech: "phrasal verb", vietnamese: "cứ, liên tục", definition: "to continue doing something, often in an annoying way (+ -ing)", example: { english: "He keeps on asking me the same question.", vietnamese: "Anh ta cứ hỏi tôi cùng một câu." } },
      { word: "untidy", ipa: "/ʌnˈtaɪdi/", partOfSpeech: "adjective", vietnamese: "bừa bộn", definition: "not neat or in order", example: { english: "My brother's room is always untidy.", vietnamese: "Phòng em trai tôi lúc nào cũng bừa bộn." } },
      { word: "interrupt", ipa: "/ˌɪntəˈrʌpt/", partOfSpeech: "verb", vietnamese: "ngắt lời", definition: "to stop someone while they are speaking", example: { english: "Sorry to interrupt, but your taxi is here.", vietnamese: "Xin lỗi đã ngắt lời, nhưng taxi của bạn đến rồi." } },
      { word: "routine", ipa: "/ruːˈtiːn/", partOfSpeech: "noun", vietnamese: "nếp sinh hoạt, thói quen hằng ngày", definition: "the things you usually do every day, in the same order", example: { english: "Exercise is part of my morning routine.", vietnamese: "Tập thể dục là một phần nếp sinh hoạt buổi sáng của tôi." } },
      { word: "get into the habit of", ipa: "/ˌɡet ˈɪntə ðə ˈhæbɪt əv/", partOfSpeech: "collocation", vietnamese: "tập thói quen, nhiễm thói quen", definition: "to start doing something regularly (+ -ing)", example: { english: "I've got into the habit of reading before bed.", vietnamese: "Tôi đã tập được thói quen đọc sách trước khi ngủ." } },
    ],
    grammar: [{
      title: "Always + -ing for annoying habits",
      pattern: "be + always / constantly + verb-ing (= this happens too often and it annoys me)",
      explanation: {
        english: "The present simple with always is neutral: He always walks to work. The present continuous with always or constantly shows that a habit annoys you: He's always leaving his socks on the floor! Put always between be and the -ing verb. Keep on + -ing has a similar meaning: She keeps on interrupting me.",
        vietnamese: "Hiện tại đơn với always mang nghĩa trung tính: He always walks to work. Hiện tại tiếp diễn với always hoặc constantly cho thấy thói quen đó làm bạn khó chịu: He's always leaving his socks on the floor! Đặt always giữa be và động từ -ing. Keep on + -ing có nghĩa tương tự: She keeps on interrupting me.",
      },
      examples: [
        { english: "My flatmate is always eating my food!", vietnamese: "Bạn cùng phòng tôi cứ ăn đồ của tôi suốt!" },
        { english: "You're constantly checking your phone.", vietnamese: "Bạn cứ liên tục kiểm tra điện thoại." },
      ],
      mistake: {
        wrong: "She is always borrow my charger.", right: "She is always borrowing my charger.",
        why: { english: "After be always, use the -ing form.", vietnamese: "Sau be always, dùng dạng -ing." },
      },
    }, {
      title: "Would and used to",
      pattern: "past actions: would / used to + verb · past states (be, have, live, like): used to only",
      explanation: {
        english: "For repeated actions in the past, you can use used to or would: Every summer we would go to the beach. For past states, such as be, have, live, like or know, only used to is possible: I used to have long hair (not I would have). Would for habits usually appears in stories, after the time has been set.",
        vietnamese: "Với hành động lặp lại trong quá khứ, có thể dùng used to hoặc would: Every summer we would go to the beach. Với trạng thái trong quá khứ, như be, have, live, like hay know, chỉ dùng được used to: I used to have long hair (không dùng I would have). Would chỉ thói quen thường xuất hiện khi kể chuyện, sau khi đã nói rõ thời gian.",
      },
      examples: [
        { english: "When I was a child, my grandmother would tell me stories every night.", vietnamese: "Hồi nhỏ, tối nào bà cũng kể chuyện cho tôi nghe." },
        { english: "We used to live in a tiny flat in Hai Phong.", vietnamese: "Chúng tôi từng sống trong một căn hộ nhỏ xíu ở Hải Phòng." },
      ],
      mistake: {
        wrong: "I would have a dog when I was young.", right: "I used to have a dog when I was young.",
        why: { english: "Have (own) is a state, so use used to, not would.", vietnamese: "Have (sở hữu) là trạng thái, nên dùng used to, không dùng would." },
      },
    }],
    examples: [
      { english: "I tend to wake up early, even at weekends.", vietnamese: "Tôi thường dậy sớm, kể cả cuối tuần." },
      { english: "It's so annoying. He keeps on interrupting me in meetings.", vietnamese: "Thật bực mình. Anh ta cứ ngắt lời tôi trong các cuộc họp." },
      { english: "I've got into the habit of walking to work.", vietnamese: "Tôi đã tập thói quen đi bộ đi làm." },
      { english: "My routine changed completely when the baby was born.", vietnamese: "Nếp sinh hoạt của tôi thay đổi hoàn toàn khi em bé ra đời." },
    ],
    dialogue: [
      { speaker: "Grace", english: "How's living with your cousin?", vietnamese: "Sống chung với em họ thế nào?" },
      { speaker: "Bao", english: "Fine, but she's always borrowing my things without asking.", vietnamese: "Ổn, nhưng con bé cứ lấy đồ của mình mà không hỏi." },
      { speaker: "Grace", english: "That's annoying! Is she untidy too?", vietnamese: "Bực mình thật! Cô ấy có bừa bộn không?" },
      { speaker: "Bao", english: "Very. She tends to leave dishes in the sink for days.", vietnamese: "Rất bừa. Cô ấy hay để bát đĩa trong bồn rửa mấy ngày liền." },
      { speaker: "Grace", english: "My sister used to be like that. I would wash everything for her.", vietnamese: "Chị mình trước đây cũng thế. Mình toàn rửa hết cho chị ấy." },
      { speaker: "Bao", english: "Well, I'm not going to get into that habit!", vietnamese: "Thôi, mình sẽ không tập cái thói quen đó đâu!" },
    ],
    practice: [
      q("Complete: He's always ___ late. It drives me mad!", ["arriving", "arrive", "arrives", "arrived"], "arriving", "Be always + -ing."),
      q("Complete: I ___ long hair when I was at school.", ["used to have", "would have", "was having", "use to have"], "used to have", "State: used to."),
      q("Complete: She keeps on ___ the same song.", ["singing", "sing", "to sing", "sang"], "singing", "Keep on + -ing."),
      q("“Thói quen hằng ngày” in English is…", ["routine", "habitude", "daily custom", "regular"], "routine", "Routine = the things you usually do."),
    ],
    challenge: [
      q("Which sentence shows the speaker is annoyed?", ["You're always losing your keys!", "You always lock the door.", "You lost your keys.", "You will lose your keys."], "You're always losing your keys!", "Be always + -ing = annoying habit."),
      q("Choose the correct sentence.", ["Every Sunday we would visit our grandparents.", "Every Sunday we would to visit our grandparents.", "Every Sunday we would visiting our grandparents.", "Every Sunday we were would visit our grandparents."], "Every Sunday we would visit our grandparents.", "Would + base verb for past actions."),
      q("Choose the correct sentence.", ["I used to live near the sea.", "I would live near the sea.", "I was used to live near the sea.", "I use to lived near the sea."], "I used to live near the sea.", "Live is a state: used to."),
      q("Complete: I ___ to get headaches when I don't drink enough water.", ["tend", "keep", "use", "would"], "tend", "Tend to = usually."),
      q("Complete: Please don't ___ me while I'm speaking.", ["interrupt", "interview", "interest", "interfere me"], "interrupt", "Interrupt = stop someone speaking."),
    ],
  }, {
    key: "first-impressions", title: "He Looks As If He's Tired", titleVi: "Ấn tượng đầu tiên",
    objectives: [
      "I can describe how people look and the impression they make.",
      "Use an adjective, not an adverb, after look, seem and appear",
      "Use look like + noun and look as if + clause",
    ],
    vocabulary: [
      { word: "impression", ipa: "/ɪmˈpreʃn/", partOfSpeech: "noun", vietnamese: "ấn tượng", definition: "the opinion you form of someone when you first meet them", example: { english: "She made a great impression at the interview.", vietnamese: "Cô ấy đã gây ấn tượng tuyệt vời ở buổi phỏng vấn." } },
      { word: "appearance", ipa: "/əˈpɪərəns/", partOfSpeech: "noun", vietnamese: "ngoại hình, vẻ bề ngoài", definition: "the way someone or something looks", example: { english: "Don't judge people by their appearance.", vietnamese: "Đừng đánh giá người khác qua vẻ bề ngoài." } },
      { word: "seem", ipa: "/siːm/", partOfSpeech: "verb", vietnamese: "có vẻ, dường như", definition: "to appear to be something", example: { english: "Your new neighbour seems friendly.", vietnamese: "Người hàng xóm mới của bạn có vẻ thân thiện." } },
      { word: "judge", ipa: "/dʒʌdʒ/", partOfSpeech: "verb", vietnamese: "đánh giá", definition: "to form an opinion about someone", example: { english: "It's hard not to judge people when you first meet them.", vietnamese: "Thật khó để không đánh giá người khác khi mới gặp." } },
      { word: "nervous", ipa: "/ˈnɜːvəs/", partOfSpeech: "adjective", vietnamese: "lo lắng, hồi hộp", definition: "worried and a little afraid", example: { english: "He looked nervous before his speech.", vietnamese: "Anh ấy trông hồi hộp trước bài phát biểu." } },
      { word: "scruffy", ipa: "/ˈskrʌfi/", partOfSpeech: "adjective", vietnamese: "luộm thuộm", definition: "untidy and dirty-looking", example: { english: "You can't go to the wedding in those scruffy jeans.", vietnamese: "Bạn không thể đi đám cưới với cái quần bò luộm thuộm đó." } },
      { word: "smart", ipa: "/smɑːt/", partOfSpeech: "adjective", vietnamese: "chỉnh tề, bảnh bao (Anh-Anh)", definition: "clean, tidy and well dressed (British English)", example: { english: "You look very smart in that suit.", vietnamese: "Bạn trông rất bảnh bao trong bộ vest đó." } },
      { word: "come across as", ipa: "/ˌkʌm əˈkrɒs əz/", partOfSpeech: "phrasal verb", vietnamese: "tạo cảm giác là, có vẻ là", definition: "to seem to have a particular quality to other people", example: { english: "He comes across as shy, but he's really funny.", vietnamese: "Anh ấy có vẻ nhút nhát, nhưng thật ra rất hài hước." } },
    ],
    grammar: [{
      title: "Look, seem, appear + adjective",
      pattern: "look / seem / appear / sound / feel + adjective (not adverb)",
      explanation: {
        english: "Look, seem, appear, sound and feel describe the subject, not the action, so they are followed by an adjective: She looks happy. He seems nervous. It sounds great. Don't use an adverb with -ly: not She looks happily. Seem and appear can also take to + verb: He seems to be tired.",
        vietnamese: "Look, seem, appear, sound và feel mô tả chủ ngữ, không mô tả hành động, nên theo sau là tính từ: She looks happy. He seems nervous. It sounds great. Đừng dùng trạng từ đuôi -ly: không nói She looks happily. Seem và appear cũng có thể đi với to + động từ: He seems to be tired.",
      },
      examples: [
        { english: "You look smart. Have you got an interview?", vietnamese: "Bạn trông bảnh thế. Có buổi phỏng vấn à?" },
        { english: "The new manager appears to be very organised.", vietnamese: "Quản lý mới có vẻ rất ngăn nắp." },
      ],
      mistake: {
        wrong: "She looked very nervously.", right: "She looked very nervous.",
        why: { english: "After look (= seem), use an adjective, not an adverb.", vietnamese: "Sau look (= trông có vẻ), dùng tính từ, không dùng trạng từ." },
      },
    }, {
      title: "Look like and look as if",
      pattern: "look like + noun · look as if / as though + subject + verb · look + adjective",
      explanation: {
        english: "Use look like before a noun: He looks like a footballer. She looks like her mother. Use look as if or look as though before a clause: You look as if you haven't slept. With an adjective alone, use look with no like: He looks tired (not He looks like tired).",
        vietnamese: "Dùng look like trước danh từ: He looks like a footballer. She looks like her mother. Dùng look as if hoặc look as though trước một mệnh đề: You look as if you haven't slept. Với tính từ đứng một mình, dùng look không có like: He looks tired (không nói He looks like tired).",
      },
      examples: [
        { english: "It looks as if it's going to rain.", vietnamese: "Trông như trời sắp mưa." },
        { english: "That building looks like a giant egg.", vietnamese: "Toà nhà đó trông như một quả trứng khổng lồ." },
      ],
      mistake: {
        wrong: "You look like tired.", right: "You look tired.",
        why: { english: "Before an adjective, use look without like.", vietnamese: "Trước tính từ, dùng look không có like." },
      },
    }],
    examples: [
      { english: "First impressions matter, so look smart for the interview.", vietnamese: "Ấn tượng đầu tiên rất quan trọng, nên hãy ăn mặc chỉnh tề khi phỏng vấn." },
      { english: "He comes across as confident, but he's actually nervous.", vietnamese: "Anh ấy có vẻ tự tin, nhưng thật ra rất lo lắng." },
      { english: "She looks as if she's just won the lottery.", vietnamese: "Cô ấy trông như vừa trúng xổ số." },
      { english: "Don't judge him by his scruffy appearance.", vietnamese: "Đừng đánh giá anh ấy qua vẻ ngoài luộm thuộm." },
    ],
    dialogue: [
      { speaker: "Oliver", english: "So, what did you think of the new designer?", vietnamese: "Vậy bạn thấy nhà thiết kế mới thế nào?" },
      { speaker: "Nhung", english: "He seemed a bit nervous at first.", vietnamese: "Lúc đầu anh ấy có vẻ hơi hồi hộp." },
      { speaker: "Oliver", english: "Really? He came across as very confident to me.", vietnamese: "Thật à? Mình thấy anh ấy có vẻ rất tự tin." },
      { speaker: "Nhung", english: "Maybe. He looked as if he hadn't slept, though.", vietnamese: "Có thể. Nhưng trông anh ấy như thể chưa ngủ." },
      { speaker: "Oliver", english: "And he looks like a rock star with that hair!", vietnamese: "Mà với kiểu tóc đó trông anh ấy như ngôi sao nhạc rock!" },
      { speaker: "Nhung", english: "Let's not judge him on appearance. His work is great.", vietnamese: "Đừng đánh giá anh ấy qua ngoại hình. Sản phẩm của anh ấy rất tuyệt." },
    ],
    practice: [
      q("Complete: You look ___ today.", ["happy", "happily", "like happy", "as if happy"], "happy", "Look + adjective."),
      q("Complete: She looks ___ a film star.", ["like", "as", "as if", "—"], "like", "Look like + noun."),
      q("Complete: You look ___ you've seen a ghost.", ["as if", "like a", "as", "seem"], "as if", "Look as if + clause."),
      q("“Ấn tượng” in English is…", ["impression", "expression", "impressive", "pressure"], "impression", "Impression = opinion from first meeting."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["That soup smells delicious.", "That soup smells deliciously.", "That soup smells like delicious.", "That soup smells as delicious."], "That soup smells delicious.", "Sense verbs + adjective."),
      q("Complete: He seems ___ a bit lonely.", ["to be", "being", "be", "like"], "to be", "Seem to be + adjective."),
      q("Choose the correct sentence.", ["He looks exhausted.", "He looks like exhausted.", "He looks as exhausted.", "He looks exhaustedly."], "He looks exhausted.", "Look + adjective, no like."),
      q("Complete: She ___ as shy, but she's very funny.", ["comes across", "comes over to", "goes across", "comes along"], "comes across", "Come across as = seem."),
      q("What does “scruffy” mean?", ["untidy and dirty-looking", "very well dressed", "nervous", "friendly"], "untidy and dirty-looking", "Scruffy = untidy."),
    ],
  }, {
    key: "small-talk", title: "Breaking the Ice", titleVi: "Bắt chuyện",
    objectives: [
      "I can start and keep a friendly conversation going with someone new.",
      "Make question tags that match the verb: aren't you?, didn't she?",
      "Show interest with short replies: Have you? Do you? Really?",
    ],
    vocabulary: [
      { word: "small talk", ipa: "/ˈsmɔːl tɔːk/", partOfSpeech: "noun", vietnamese: "chuyện phiếm, xã giao", definition: "polite conversation about unimportant things", example: { english: "I'm not very good at small talk at parties.", vietnamese: "Tôi không giỏi nói chuyện xã giao ở các bữa tiệc." } },
      { word: "break the ice", ipa: "/ˌbreɪk ði ˈaɪs/", partOfSpeech: "idiom", vietnamese: "phá băng, làm không khí bớt ngượng", definition: "to make people feel relaxed when they first meet", example: { english: "A funny story is a good way to break the ice.", vietnamese: "Một câu chuyện vui là cách hay để phá băng." } },
      { word: "chat", ipa: "/tʃæt/", partOfSpeech: "verb", vietnamese: "tán gẫu, trò chuyện", definition: "to talk in a friendly, informal way", example: { english: "We chatted for hours about music.", vietnamese: "Chúng tôi trò chuyện hàng giờ về âm nhạc." } },
      { word: "awkward", ipa: "/ˈɔːkwəd/", partOfSpeech: "adjective", vietnamese: "ngượng ngùng, khó xử", definition: "making you feel uncomfortable or embarrassed", example: { english: "There was an awkward silence after his joke.", vietnamese: "Có một khoảng lặng ngượng ngùng sau câu đùa của anh ta." } },
      { word: "acquaintance", ipa: "/əˈkweɪntəns/", partOfSpeech: "noun", vietnamese: "người quen", definition: "someone you know a little, but who is not a close friend", example: { english: "He's not a friend, just an acquaintance from work.", vietnamese: "Anh ấy không phải bạn, chỉ là người quen ở chỗ làm." } },
      { word: "catch up", ipa: "/ˌkætʃ ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "hàn huyên, cập nhật tin tức", definition: "to talk to someone you haven't seen for a while about their news", example: { english: "Let's meet for coffee and catch up.", vietnamese: "Mình đi cà phê hàn huyên nhé." } },
      { word: "by the way", ipa: "/ˌbaɪ ðə ˈweɪ/", partOfSpeech: "phrase", vietnamese: "nhân tiện", definition: "used to add something or change the subject", example: { english: "By the way, have you met Anna?", vietnamese: "Nhân tiện, bạn đã gặp Anna chưa?" } },
      { word: "anyway", ipa: "/ˈeniweɪ/", partOfSpeech: "adverb", vietnamese: "dù sao thì, thôi", definition: "used to return to the main subject or end a conversation", example: { english: "Anyway, I'd better go. Nice talking to you!", vietnamese: "Thôi, mình phải đi đây. Rất vui được nói chuyện với bạn!" } },
    ],
    grammar: [{
      title: "Question tags",
      pattern: "positive sentence + negative tag (It's hot, isn't it?) · negative sentence + positive tag (You don't smoke, do you?)",
      explanation: {
        english: "A question tag invites the other person to agree, which makes it perfect for small talk. Repeat the auxiliary verb (be, do, have, can, will) with a pronoun, and change positive to negative: You're from Da Nang, aren't you? She went home, didn't she? Vietnamese uses “phải không” for everything, but English tags must match the verb and subject.",
        vietnamese: "Câu hỏi đuôi mời người nghe đồng tình, nên rất hợp cho chuyện xã giao. Lặp lại trợ động từ (be, do, have, can, will) kèm đại từ, và đổi khẳng định thành phủ định: You're from Da Nang, aren't you? She went home, didn't she? Tiếng Việt dùng “phải không” cho mọi câu, nhưng đuôi câu trong tiếng Anh phải khớp với động từ và chủ ngữ.",
      },
      examples: [
        { english: "Lovely weather today, isn't it?", vietnamese: "Hôm nay thời tiết đẹp nhỉ?" },
        { english: "You haven't been here before, have you?", vietnamese: "Bạn chưa đến đây bao giờ, đúng không?" },
      ],
      mistake: {
        wrong: "You're a teacher, isn't it?", right: "You're a teacher, aren't you?",
        why: { english: "The tag repeats the verb and subject: you are → aren't you.", vietnamese: "Đuôi câu lặp lại động từ và chủ ngữ: you are → aren't you." },
      },
    }, {
      title: "Showing interest",
      pattern: "Have you? / Do you? / Did she? / Really? / How interesting! (+ a follow-up question)",
      explanation: {
        english: "Good listeners react. A short echo question repeats the auxiliary verb from what the other person said: “I've been to Scotland.” “Have you?” “I work in a bank.” “Do you?” Then ask a follow-up question to keep the chat going: What was it like? How long have you been there?",
        vietnamese: "Người nghe giỏi luôn phản hồi. Câu hỏi đáp ngắn lặp lại trợ động từ trong câu người kia vừa nói: “I've been to Scotland.” “Have you?” “I work in a bank.” “Do you?” Sau đó hỏi thêm để câu chuyện tiếp tục: What was it like? How long have you been there?",
      },
      examples: [
        { english: "“I can speak four languages.” “Can you? That's amazing!”", vietnamese: "“Tôi nói được bốn thứ tiếng.” “Thật à? Giỏi quá!”" },
        { english: "“We moved here last year.” “Did you? Where from?”", vietnamese: "“Chúng tôi chuyển đến đây năm ngoái.” “Vậy à? Từ đâu thế?”" },
      ],
      mistake: {
        wrong: "“I've just got back from Japan.” “Do you?”", right: "“I've just got back from Japan.” “Have you?”",
        why: { english: "The echo question uses the same auxiliary: I've → Have you?", vietnamese: "Câu hỏi đáp dùng cùng trợ động từ: I've → Have you?" },
      },
    }],
    examples: [
      { english: "Making small talk helps to break the ice at a new job.", vietnamese: "Nói chuyện xã giao giúp phá băng ở chỗ làm mới." },
      { english: "It was awkward because I'd forgotten his name.", vietnamese: "Thật ngượng vì tôi đã quên tên anh ấy." },
      { english: "By the way, we should catch up some time.", vietnamese: "Nhân tiện, lúc nào đó mình gặp nhau hàn huyên nhé." },
      { english: "Anyway, it was lovely to chat. See you soon!", vietnamese: "Thôi, rất vui được trò chuyện. Hẹn gặp lại!" },
    ],
    dialogue: [
      { speaker: "Fiona", english: "Busy in here tonight, isn't it?", vietnamese: "Tối nay ở đây đông nhỉ?" },
      { speaker: "Hai", english: "It is. You're Mark's sister, aren't you?", vietnamese: "Đúng thế. Bạn là em gái của Mark, phải không?" },
      { speaker: "Fiona", english: "That's right. I've just moved here from Edinburgh.", vietnamese: "Đúng rồi. Mình vừa chuyển từ Edinburgh đến đây." },
      { speaker: "Hai", english: "Have you? How are you finding Saigon?", vietnamese: "Vậy à? Bạn thấy Sài Gòn thế nào?" },
      { speaker: "Fiona", english: "Hot! But I love it. By the way, what do you do?", vietnamese: "Nóng! Nhưng mình rất thích. Nhân tiện, bạn làm nghề gì?" },
      { speaker: "Hai", english: "I'm a chef. You haven't tried bánh xèo yet, have you?", vietnamese: "Mình là đầu bếp. Bạn chưa thử bánh xèo, đúng không?" },
    ],
    practice: [
      q("Complete: It's cold today, ___?", ["isn't it", "is it", "doesn't it", "isn't"], "isn't it", "Positive + negative tag."),
      q("Complete: You don't eat meat, ___?", ["do you", "don't you", "are you", "aren't you"], "do you", "Negative + positive tag."),
      q("“I live in London.” “___? Which part?”", ["Do you", "Are you", "Have you", "Did you"], "Do you", "Echo the auxiliary: do."),
      q("“Người quen” in English is…", ["acquaintance", "friendship", "relative", "colleague friend"], "acquaintance", "Acquaintance = someone you know a little."),
    ],
    challenge: [
      q("Complete: She went to the party, ___?", ["didn't she", "wasn't she", "doesn't she", "did she"], "didn't she", "Past simple: didn't."),
      q("Complete: You've met Tom, ___?", ["haven't you", "didn't you", "aren't you", "have you"], "haven't you", "Present perfect: haven't."),
      q("“I can't swim.” “___? I'll teach you!”", ["Can't you", "Don't you", "Can you", "Aren't you"], "Can't you", "Echo the negative auxiliary."),
      q("Complete: A joke can help to ___ the ice.", ["break", "crack", "melt", "open"], "break", "Break the ice."),
      q("What does “awkward” mean?", ["uncomfortable or embarrassing", "very exciting", "boring", "polite"], "uncomfortable or embarrassing", "Awkward = uncomfortable."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 1", isReview: true,
    objectives: [
      "I can describe people, relationships and habits, and make small talk naturally.",
      "Check phrasal verb word order, personality prefixes, habits, look + adjective and question tags",
    ],
    vocabulary: [
      { word: "get on (with)", ipa: "/ˌɡet ˈɒn wɪð/", partOfSpeech: "phrasal verb", vietnamese: "hợp nhau, hoà thuận", definition: "to have a friendly relationship with someone", example: { english: "Do you get on with your neighbours?", vietnamese: "Bạn có hoà thuận với hàng xóm không?" } },
      { word: "reliable", ipa: "/rɪˈlaɪəbl/", partOfSpeech: "adjective", vietnamese: "đáng tin cậy", definition: "someone you can trust to do what they say", example: { english: "Our old car was very reliable.", vietnamese: "Chiếc xe cũ của chúng tôi rất bền bỉ, đáng tin." } },
      { word: "stubborn", ipa: "/ˈstʌbən/", partOfSpeech: "adjective", vietnamese: "bướng bỉnh, cứng đầu", definition: "not willing to change your mind", example: { english: "Don't be so stubborn. Just say sorry.", vietnamese: "Đừng cứng đầu thế. Xin lỗi đi." } },
      { word: "habit", ipa: "/ˈhæbɪt/", partOfSpeech: "noun", vietnamese: "thói quen", definition: "something you do often, often without thinking", example: { english: "Old habits are hard to break.", vietnamese: "Thói quen cũ khó bỏ." } },
      { word: "impression", ipa: "/ɪmˈpreʃn/", partOfSpeech: "noun", vietnamese: "ấn tượng", definition: "the opinion you form of someone when you first meet them", example: { english: "What was your first impression of London?", vietnamese: "Ấn tượng đầu tiên của bạn về London là gì?" } },
      { word: "small talk", ipa: "/ˈsmɔːl tɔːk/", partOfSpeech: "noun", vietnamese: "chuyện phiếm, xã giao", definition: "polite conversation about unimportant things", example: { english: "The weather is the most common topic of small talk in Britain.", vietnamese: "Thời tiết là chủ đề xã giao phổ biến nhất ở Anh." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "bring me up · get on with · impatient / open-minded · I used to have (not would have) · look tired · You're…, aren't you?",
      explanation: {
        english: "Check these: a pronoun goes in the middle of a separable phrasal verb, and three-part verbs stay together; learn each opposite with its prefix (impatient, dishonest), and write compound adjectives with a hyphen; be always + -ing complains about a habit, and would is for past actions but not states; look, seem and sound take an adjective, look like a noun and look as if a clause; question tags and echo questions repeat the auxiliary verb.",
        vietnamese: "Hãy kiểm tra: đại từ đứng giữa cụm động từ tách được, còn cụm ba phần thì giữ liền nhau; học từ trái nghĩa kèm tiền tố (impatient, dishonest), và viết tính từ ghép có gạch nối; be always + -ing để phàn nàn về thói quen, còn would dùng cho hành động trong quá khứ chứ không cho trạng thái; look, seem và sound đi với tính từ, look like với danh từ và look as if với mệnh đề; câu hỏi đuôi và câu hỏi đáp lặp lại trợ động từ.",
      },
      examples: [
        { english: "You get on with your boss, don't you?", vietnamese: "Bạn hợp với sếp, đúng không?" },
        { english: "He looks stubborn, but he's very easy-going.", vietnamese: "Trông anh ấy có vẻ cứng đầu, nhưng rất dễ tính." },
      ],
    }],
    examples: [
      { english: "My first impression was that she was reliable and kind.", vietnamese: "Ấn tượng đầu tiên của tôi là cô ấy đáng tin và tốt bụng." },
      { english: "I've got into the habit of making small talk with my neighbours.", vietnamese: "Tôi đã tập thói quen trò chuyện xã giao với hàng xóm." },
      { english: "We get on well, although he can be stubborn.", vietnamese: "Chúng tôi hợp nhau, dù đôi khi anh ấy khá cứng đầu." },
    ],
    dialogue: [
      { speaker: "Amy", english: "You've met my cousin Khoa, haven't you?", vietnamese: "Bạn gặp em họ mình là Khoa rồi, đúng không?" },
      { speaker: "Duc", english: "Only briefly. He seemed nice, but a bit quiet.", vietnamese: "Chỉ gặp qua thôi. Anh ấy có vẻ tốt, nhưng hơi ít nói." },
      { speaker: "Amy", english: "He comes across as shy, but he's really outgoing once you know him.", vietnamese: "Anh ấy có vẻ nhút nhát, nhưng khi quen rồi thì rất cởi mở." },
      { speaker: "Duc", english: "Do you two get on?", vietnamese: "Hai người có hợp nhau không?" },
      { speaker: "Amy", english: "Mostly. He's always borrowing my car, though!", vietnamese: "Phần lớn là có. Nhưng anh ấy cứ mượn xe mình suốt!" },
      { speaker: "Duc", english: "That's annoying. Does he bring it back?", vietnamese: "Bực mình thật. Anh ấy có trả lại không?" },
      { speaker: "Amy", english: "Always. He's very reliable, so I put up with it.", vietnamese: "Luôn luôn. Anh ấy rất đáng tin, nên mình chịu được." },
    ],
    practice: [
      q("Choose the correct sentence.", ["Can you pick me up at six?", "Can you pick up me at six?", "Can you me pick up at six?", "Can you pick at six me up?"], "Can you pick me up at six?", "Pronoun in the middle."),
      q("The opposite of “polite” is…", ["impolite", "unpolite", "inpolite", "dispolite"], "impolite", "im- before p."),
      q("Complete: I ___ be very shy as a child.", ["used to", "would", "was used to", "use to"], "used to", "State: used to."),
      q("Complete: You look ___.", ["worried", "worriedly", "like worried", "as worried"], "worried", "Look + adjective."),
    ],
    challenge: [
      q("Complete: He's always ___ about the weather!", ["complaining", "complain", "complains", "to complain"], "complaining", "Be always + -ing."),
      q("Complete: She looks ___ she's going to cry.", ["as if", "like", "as", "seem"], "as if", "Look as if + clause."),
      q("Complete: They haven't arrived yet, ___?", ["have they", "haven't they", "did they", "are they"], "have they", "Negative + positive tag."),
      q("Choose the correct sentence.", ["I don't get on with my brother-in-law.", "I don't get on my brother-in-law.", "I don't get with on my brother-in-law.", "I don't get my brother-in-law on."], "I don't get on with my brother-in-law.", "Get on with + object."),
      q("“I've been to Wales.” “___? What was it like?”", ["Have you", "Do you", "Did you", "Are you"], "Have you", "Echo the auxiliary: have."),
    ],
  }],
  assessment: [
    { id: "pronoun-middle", prompt: "Choose the correct sentence.", options: ["My aunt brought me up.", "My aunt brought up me.", "My aunt up brought me.", "My aunt brought me on up."], correct: "My aunt brought me up.", explanation: "Pronoun in the middle." },
    { id: "three-part", prompt: "Complete: I can't put up ___ the noise.", options: ["with", "to", "on", "for"], correct: "with", explanation: "Put up with." },
    { id: "look-up-to", prompt: "“Tôi luôn ngưỡng mộ mẹ tôi.” in English is…", options: ["I've always looked up to my mum.", "I've always looked my mum up to.", "I've always looked up my mum.", "I've always looked to my mum up."], correct: "I've always looked up to my mum.", explanation: "Three-part verbs stay together." },
    { id: "make-up", prompt: "Complete: After the argument, they ___.", options: ["made up", "broke up", "brought up", "fell up"], correct: "made up", explanation: "Make up = become friends again." },
    { id: "im-prefix", prompt: "The opposite of “mature” is…", options: ["immature", "unmature", "inmature", "dismature"], correct: "immature", explanation: "im- before m." },
    { id: "ir-prefix", prompt: "The opposite of “responsible” is…", options: ["irresponsible", "unresponsible", "inresponsible", "disresponsible"], correct: "irresponsible", explanation: "ir- before r." },
    { id: "compound-adjective", prompt: "Complete: She's very ___ about other cultures.", options: ["open-minded", "open mind", "open-mind", "opened mind"], correct: "open-minded", explanation: "Compound adjective with -ed." },
    { id: "always-ing", prompt: "Complete: You're always ___ my sentences!", options: ["finishing", "finish", "finished", "to finish"], correct: "finishing", explanation: "Be always + -ing." },
    { id: "used-to-state", prompt: "Choose the correct sentence.", options: ["We used to have a garden.", "We would have a garden.", "We were used to have a garden.", "We use to had a garden."], correct: "We used to have a garden.", explanation: "Have (own) is a state: used to." },
    { id: "would-action", prompt: "Complete: Every evening my dad ___ read the newspaper.", options: ["would", "was", "used", "has"], correct: "would", explanation: "Would + base verb for a past action." },
    { id: "look-adjective", prompt: "Complete: The cake looks ___.", options: ["delicious", "deliciously", "like delicious", "as delicious"], correct: "delicious", explanation: "Look + adjective." },
    { id: "look-as-if", prompt: "Complete: You look ___ you need a holiday.", options: ["as if", "like a", "as", "seem"], correct: "as if", explanation: "Look as if + clause." },
    { id: "tag-be", prompt: "Complete: You're from Hue, ___?", options: ["aren't you", "isn't it", "don't you", "are you"], correct: "aren't you", explanation: "Tag matches you are." },
    { id: "tag-past", prompt: "Complete: He passed the exam, ___?", options: ["didn't he", "wasn't he", "hasn't he", "did he"], correct: "didn't he", explanation: "Past simple: didn't." },
    { id: "echo-question", prompt: "“I've never seen snow.” “___? You must come to Scotland!”", options: ["Haven't you", "Don't you", "Have you", "Didn't you"], correct: "Haven't you", explanation: "Echo the negative auxiliary." },
  ],
};
