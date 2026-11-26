// C1 Unit 2: Work & the Economy. Advanced Vietnamese speakers often lose the passive after verbs and prepositions
// ("I don't like interrupting by my boss", "The office needs to clean"), write verb-heavy reports instead of noun
// phrases ("The quickly growth"), choose the wrong preposition after nouns ("demand of nurses"), add will after as long
// as, use to after consider, bend fixed idioms ("the drawing table", "call it the day"), and use recommend + object +
// to. This unit puts those right for negotiation, meetings and formal reports.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "C1",
  number: 2,
  lessons: [{
    key: "advanced-passive", title: "I Hate Being Interrupted", titleVi: "Bị động nâng cao",
    objectives: [
      "I can talk about how I'm treated at work.",
      "Use being + past participle and to be + past participle after verbs and prepositions",
      "Use need + -ing or need to be + past participle for jobs that must be done",
    ],
    vocabulary: [
      { word: "promote", ipa: "/prəˈməʊt/", partOfSpeech: "verb", vietnamese: "thăng chức", definition: "to give someone a more important job", example: { english: "She expects to be promoted this year.", vietnamese: "Cô ấy mong được thăng chức năm nay." } },
      { word: "overlook", ipa: "/ˌəʊvəˈlʊk/", partOfSpeech: "verb", vietnamese: "bỏ qua, xem nhẹ", definition: "to fail to notice or consider someone or something", example: { english: "He was tired of being overlooked for promotion.", vietnamese: "Anh ấy mệt mỏi vì bị bỏ qua khi xét thăng chức." } },
      { word: "consult", ipa: "/kənˈsʌlt/", partOfSpeech: "verb", vietnamese: "hỏi ý kiến, tham vấn", definition: "to ask someone for their opinion before deciding", example: { english: "Staff want to be consulted about the changes.", vietnamese: "Nhân viên muốn được hỏi ý kiến về các thay đổi." } },
      { word: "shortlist", ipa: "/ˈʃɔːtlɪst/", partOfSpeech: "verb", vietnamese: "đưa vào danh sách rút gọn", definition: "to choose a small number of candidates from a larger group", example: { english: "I was delighted to be shortlisted for the job.", vietnamese: "Tôi rất vui khi được vào danh sách rút gọn cho vị trí đó." } },
      { word: "be made redundant", ipa: "/bi ˌmeɪd rɪˈdʌndənt/", partOfSpeech: "phrase", vietnamese: "bị cắt giảm biên chế", definition: "to lose your job because it is no longer needed (British English)", example: { english: "Two hundred workers were made redundant.", vietnamese: "Hai trăm công nhân bị cắt giảm biên chế." } },
      { word: "reward", ipa: "/rɪˈwɔːd/", partOfSpeech: "verb", vietnamese: "khen thưởng", definition: "to give something to someone because they have done well", example: { english: "Everyone likes being rewarded for hard work.", vietnamese: "Ai cũng thích được khen thưởng vì làm việc chăm chỉ." } },
      { word: "undervalue", ipa: "/ˌʌndəˈvæljuː/", partOfSpeech: "verb", vietnamese: "đánh giá thấp", definition: "to think someone or something is less important than they are", example: { english: "Nurses often feel undervalued.", vietnamese: "Y tá thường cảm thấy bị đánh giá thấp." } },
      { word: "appraisal", ipa: "/əˈpreɪzl/", partOfSpeech: "noun", vietnamese: "đánh giá năng lực", definition: "a meeting to discuss how well an employee is doing", example: { english: "My annual appraisal is next week.", vietnamese: "Buổi đánh giá năng lực hằng năm của tôi là tuần sau." } },
    ],
    grammar: [{
      title: "Passive -ing and infinitive",
      pattern: "verb / preposition + being + past participle (hate being told) · verb + to be + past participle (expect to be promoted)",
      explanation: {
        english: "When a verb that takes -ing or to + verb needs a passive meaning, use being + past participle or to be + past participle. I hate being interrupted. She's afraid of being made redundant. He expects to be promoted. We want to be consulted. Without being or to be, the meaning becomes active and wrong.",
        vietnamese: "Khi một động từ đi với -ing hoặc to + động từ cần mang nghĩa bị động, dùng being + quá khứ phân từ hoặc to be + quá khứ phân từ. I hate being interrupted. She's afraid of being made redundant. He expects to be promoted. We want to be consulted. Thiếu being hay to be, nghĩa thành chủ động và sai.",
      },
      examples: [
        { english: "Nobody enjoys being criticised in public.", vietnamese: "Không ai thích bị phê bình trước mặt mọi người." },
        { english: "The project is likely to be delayed.", vietnamese: "Dự án có khả năng bị trì hoãn." },
      ],
      mistake: {
        wrong: "I don't like interrupting by my manager.", right: "I don't like being interrupted by my manager.",
        why: { english: "You are the one interrupted, so use being + past participle.", vietnamese: "Bạn là người bị ngắt lời, nên dùng being + quá khứ phân từ." },
      },
    }, {
      title: "Need + -ing",
      pattern: "something + needs + verb-ing = something + needs to be + past participle",
      explanation: {
        english: "When a thing needs a job done to it, use needs + -ing or needs to be + past participle. Both have a passive meaning: The report needs checking. The report needs to be checked. Needs to check would mean the report must check something, which makes no sense.",
        vietnamese: "Khi một vật cần được làm gì đó, dùng needs + -ing hoặc needs to be + quá khứ phân từ. Cả hai đều mang nghĩa bị động: The report needs checking. The report needs to be checked. Needs to check sẽ có nghĩa bản báo cáo phải tự kiểm tra gì đó, điều này vô nghĩa.",
      },
      examples: [
        { english: "The printer needs fixing again.", vietnamese: "Máy in lại cần sửa." },
        { english: "These figures need to be updated before Friday.", vietnamese: "Các số liệu này cần được cập nhật trước thứ Sáu." },
      ],
      mistake: {
        wrong: "The meeting room needs to clean.", right: "The meeting room needs cleaning. / The meeting room needs to be cleaned.",
        why: { english: "The room is cleaned by someone, so use needs + -ing or needs to be + past participle.", vietnamese: "Căn phòng được người khác dọn, nên dùng needs + -ing hoặc needs to be + quá khứ phân từ." },
      },
    }],
    examples: [
      { english: "She resented being overlooked at her appraisal.", vietnamese: "Cô ấy bực bội vì bị xem nhẹ trong buổi đánh giá năng lực." },
      { english: "Staff who feel undervalued are likely to leave.", vietnamese: "Nhân viên cảm thấy bị đánh giá thấp có khả năng sẽ nghỉ việc." },
      { english: "After being shortlisted, he was invited to a second interview.", vietnamese: "Sau khi được vào danh sách rút gọn, anh ấy được mời phỏng vấn vòng hai." },
      { english: "Nobody wants to be made redundant just before Tet.", vietnamese: "Không ai muốn bị cắt giảm ngay trước Tết." },
    ],
    dialogue: [
      { speaker: "HR Manager", english: "Thanks for coming. How do you feel about your role?", vietnamese: "Cảm ơn bạn đã đến. Bạn cảm thấy thế nào về vai trò của mình?" },
      { speaker: "Hieu", english: "Honestly, I feel a bit undervalued. I've been overlooked for promotion twice.", vietnamese: "Thật lòng mà nói, tôi cảm thấy hơi bị đánh giá thấp. Tôi đã bị bỏ qua khi xét thăng chức hai lần." },
      { speaker: "HR Manager", english: "I'm sorry to hear that. What would help?", vietnamese: "Tôi rất tiếc khi nghe vậy. Điều gì sẽ giúp được bạn?" },
      { speaker: "Hieu", english: "I'd like to be consulted on decisions that affect my team.", vietnamese: "Tôi muốn được hỏi ý kiến về các quyết định ảnh hưởng đến nhóm mình." },
      { speaker: "HR Manager", english: "That's fair. Your job description probably needs updating too.", vietnamese: "Hợp lý. Bản mô tả công việc của bạn có lẽ cũng cần cập nhật." },
      { speaker: "Hieu", english: "Thank you. I just want to be rewarded for the work I actually do.", vietnamese: "Cảm ơn. Tôi chỉ muốn được khen thưởng cho công việc mình thực sự làm." },
    ],
    practice: [
      q("Complete: I hate ___ what to do.", ["being told", "telling", "to tell", "be told"], "being told", "Passive -ing."),
      q("Complete: She hopes ___ next year.", ["to be promoted", "to promote", "promoting", "being promote"], "to be promoted", "Passive infinitive."),
      q("Complete: The car needs ___.", ["washing", "to wash", "wash", "washed"], "washing", "Needs + -ing."),
      q("“Bị cắt giảm biên chế” in British English is…", ["be made redundant", "be made fired", "be redundanted", "be cut away"], "be made redundant", "Be made redundant."),
    ],
    challenge: [
      q("Complete: He's worried about ___ redundant.", ["being made", "making", "to be made", "be made"], "being made", "Preposition + being + past participle."),
      q("Choose the correct sentence.", ["The windows need to be repaired.", "The windows need to repair.", "The windows need repaired.", "The windows need be repairing."], "The windows need to be repaired.", "Need to be + past participle."),
      q("Complete: Staff want ___ before changes are made.", ["to be consulted", "consulting", "to consult", "being consult"], "to be consulted", "Passive infinitive."),
      q("Complete: I was thrilled to be ___ for the award.", ["shortlisted", "shortlisting", "short listed by", "shortlist"], "shortlisted", "Passive infinitive."),
      q("What is an “appraisal”?", ["a meeting about how well an employee is doing", "a pay rise", "a job advert", "a type of contract"], "a meeting about how well an employee is doing", "Appraisal = performance review."),
    ],
  }, {
    key: "nominalisation", title: "The Rapid Growth of…", titleVi: "Danh từ hoá",
    objectives: [
      "I can write formal, compact sentences about economic trends.",
      "Turn verbs and adverbs into nouns and adjectives: prices rose quickly → the rapid rise in prices",
      "Use the right preposition after a noun: demand for, decline in, shortage of",
    ],
    vocabulary: [
      { word: "growth", ipa: "/ɡrəʊθ/", partOfSpeech: "noun", vietnamese: "sự tăng trưởng", definition: "an increase in size or amount", example: { english: "The economy saw steady growth last year.", vietnamese: "Năm ngoái nền kinh tế tăng trưởng đều đặn." } },
      { word: "decline", ipa: "/dɪˈklaɪn/", partOfSpeech: "noun", vietnamese: "sự sụt giảm", definition: "a gradual decrease", example: { english: "There has been a decline in tourism.", vietnamese: "Du lịch đã có sự sụt giảm." } },
      { word: "reduction", ipa: "/rɪˈdʌkʃn/", partOfSpeech: "noun", vietnamese: "sự cắt giảm", definition: "a decrease in size, amount or price", example: { english: "The company announced a reduction in costs.", vietnamese: "Công ty thông báo cắt giảm chi phí." } },
      { word: "expansion", ipa: "/ɪkˈspænʃn/", partOfSpeech: "noun", vietnamese: "sự mở rộng", definition: "an increase in size, range or activity", example: { english: "The firm's expansion into Europe was successful.", vietnamese: "Việc công ty mở rộng sang châu Âu đã thành công." } },
      { word: "implementation", ipa: "/ˌɪmplɪmenˈteɪʃn/", partOfSpeech: "noun", vietnamese: "sự triển khai, thực thi", definition: "the act of putting a plan into action", example: { english: "The implementation of the new policy took a year.", vietnamese: "Việc triển khai chính sách mới mất một năm." } },
      { word: "consumption", ipa: "/kənˈsʌmpʃn/", partOfSpeech: "noun", vietnamese: "sự tiêu thụ", definition: "the amount of something that is used", example: { english: "Energy consumption rises in the summer.", vietnamese: "Lượng tiêu thụ năng lượng tăng vào mùa hè." } },
      { word: "shortage", ipa: "/ˈʃɔːtɪdʒ/", partOfSpeech: "noun", vietnamese: "sự thiếu hụt", definition: "a situation when there is not enough of something", example: { english: "There is a shortage of skilled workers.", vietnamese: "Đang thiếu hụt lao động có tay nghề." } },
      { word: "demand", ipa: "/dɪˈmɑːnd/", partOfSpeech: "noun", vietnamese: "nhu cầu", definition: "the need or wish for goods or services", example: { english: "Demand for electric cars is growing.", vietnamese: "Nhu cầu về ô tô điện đang tăng." } },
    ],
    grammar: [{
      title: "From verbs to nouns",
      pattern: "Prices rose rapidly → the rapid rise in prices · The company expanded → the company's expansion · (verb → noun, adverb → adjective)",
      explanation: {
        english: "Formal writing often turns actions into nouns, which packs more information into fewer words. The verb becomes a noun, the adverb becomes an adjective, and the subject becomes a possessive or an of phrase: Unemployment fell sharply → a sharp fall in unemployment. The government implemented the plan → the government's implementation of the plan.",
        vietnamese: "Văn viết trang trọng thường biến hành động thành danh từ, giúp gói nhiều thông tin hơn trong ít chữ hơn. Động từ thành danh từ, trạng từ thành tính từ, và chủ ngữ thành sở hữu cách hoặc cụm of: Unemployment fell sharply → a sharp fall in unemployment. The government implemented the plan → the government's implementation of the plan.",
      },
      examples: [
        { english: "The rapid expansion of the city has caused traffic problems.", vietnamese: "Việc thành phố mở rộng nhanh chóng đã gây ra vấn đề giao thông." },
        { english: "The failure of the project surprised investors.", vietnamese: "Sự thất bại của dự án khiến các nhà đầu tư bất ngờ." },
      ],
      mistake: {
        wrong: "The quickly growth of online shopping has hurt shops.", right: "The rapid growth of online shopping has hurt shops.",
        why: { english: "Before a noun, use an adjective (rapid, quick), not an adverb.", vietnamese: "Trước danh từ, dùng tính từ (rapid, quick), không dùng trạng từ." },
      },
    }, {
      title: "Noun + preposition",
      pattern: "increase / rise / fall / decline / reduction in · demand / need for · shortage / lack / cause of",
      explanation: {
        english: "Each noun has its usual preposition. Changes take in: a rise in prices, a reduction in costs. Demand and need take for: demand for housing. Shortage, lack and cause take of: a shortage of doctors. These are fixed, so learn the noun and preposition together.",
        vietnamese: "Mỗi danh từ đi với giới từ quen thuộc của nó. Sự thay đổi đi với in: a rise in prices, a reduction in costs. Demand và need đi với for: demand for housing. Shortage, lack và cause đi với of: a shortage of doctors. Đây là các cụm cố định, nên hãy học danh từ kèm giới từ.",
      },
      examples: [
        { english: "There has been a sharp decline in birth rates.", vietnamese: "Tỷ lệ sinh đã giảm mạnh." },
        { english: "The main cause of the shortage is low pay.", vietnamese: "Nguyên nhân chính của sự thiếu hụt là lương thấp." },
      ],
      mistake: {
        wrong: "There is a high demand of nurses in the UK.", right: "There is a high demand for nurses in the UK.",
        why: { english: "Demand is followed by for.", vietnamese: "Demand đi với for." },
      },
    }],
    examples: [
      { english: "A reduction in consumption would help the environment.", vietnamese: "Việc giảm tiêu thụ sẽ có lợi cho môi trường." },
      { english: "The shortage of housing has pushed up demand for flats.", vietnamese: "Sự thiếu hụt nhà ở đã đẩy nhu cầu căn hộ tăng cao." },
      { english: "Economic growth slowed after the expansion ended.", vietnamese: "Tăng trưởng kinh tế chậm lại sau khi đợt mở rộng kết thúc." },
      { english: "The implementation of the plan led to a decline in costs.", vietnamese: "Việc triển khai kế hoạch dẫn đến chi phí giảm." },
    ],
    dialogue: [
      { speaker: "Editor", english: "Your article is good, but it sounds like speech. Can we make it more formal?", vietnamese: "Bài của bạn tốt, nhưng nghe như văn nói. Chúng ta làm nó trang trọng hơn được không?" },
      { speaker: "Hoa", english: "Sure. Which part?", vietnamese: "Được ạ. Phần nào ạ?" },
      { speaker: "Editor", english: "“House prices went up very fast.” Try a noun.", vietnamese: "“House prices went up very fast.” Thử dùng danh từ xem." },
      { speaker: "Hoa", english: "“There has been a rapid rise in house prices.”", vietnamese: "“Giá nhà đã tăng nhanh.” (dùng danh từ rise)" },
      { speaker: "Editor", english: "Much better. And “people want more flats”?", vietnamese: "Tốt hơn nhiều. Còn “people want more flats”?" },
      { speaker: "Hoa", english: "“Demand for flats has grown, partly because of a shortage of land.”", vietnamese: "“Nhu cầu về căn hộ đã tăng, một phần do thiếu đất.”" },
    ],
    practice: [
      q("“Prices rose sharply” as a noun phrase is…", ["a sharp rise in prices", "a sharply rise of prices", "a sharp rising prices", "prices' sharply rise"], "a sharp rise in prices", "Adverb → adjective, verb → noun."),
      q("Complete: There's a shortage ___ teachers.", ["of", "for", "in", "on"], "of", "Shortage of."),
      q("Complete: Demand ___ coffee is rising.", ["for", "of", "in", "on"], "for", "Demand for."),
      q("“Sự tiêu thụ” in English is…", ["consumption", "consume", "consumer", "consuming-ness"], "consumption", "Consumption = amount used."),
    ],
    challenge: [
      q("Complete: There has been a reduction ___ unemployment.", ["in", "of", "for", "at"], "in", "Reduction in."),
      q("“The company expanded rapidly” as a noun phrase is…", ["the company's rapid expansion", "the company's rapidly expansion", "the rapid expand of the company", "the company expanding rapid"], "the company's rapid expansion", "Nominalisation."),
      q("Choose the correct phrase.", ["the steady growth of the economy", "the steadily growth of the economy", "the steady grow of the economy", "the steady growing economy of"], "the steady growth of the economy", "Adjective + noun + of."),
      q("Complete: The main cause ___ the problem is poor planning.", ["of", "for", "in", "to"], "of", "Cause of."),
      q("What does “implementation” mean?", ["putting a plan into action", "making a plan", "cancelling a plan", "paying for a plan"], "putting a plan into action", "Implementation = carrying out."),
    ],
  }, {
    key: "negotiating", title: "Meet Me Halfway", titleVi: "Đàm phán",
    objectives: [
      "I can negotiate a deal politely and firmly.",
      "Make conditional offers with provided that, as long as and on condition that",
      "Make tentative proposals: We'd be prepared to… / Would you consider + -ing?",
    ],
    vocabulary: [
      { word: "concession", ipa: "/kənˈseʃn/", partOfSpeech: "noun", vietnamese: "sự nhượng bộ", definition: "something you agree to give up in a negotiation", example: { english: "We're willing to make a concession on the delivery date.", vietnamese: "Chúng tôi sẵn sàng nhượng bộ về ngày giao hàng." } },
      { word: "counter-offer", ipa: "/ˈkaʊntər ɒfə/", partOfSpeech: "noun", vietnamese: "đề nghị ngược lại, hoàn giá", definition: "an offer made in reply to another offer", example: { english: "They rejected our price and made a counter-offer.", vietnamese: "Họ từ chối giá của chúng tôi và đưa ra một mức giá khác." } },
      { word: "deal-breaker", ipa: "/ˈdiːl breɪkə/", partOfSpeech: "noun", vietnamese: "điều kiện tiên quyết, yếu tố phá vỡ thoả thuận", definition: "a problem that makes you refuse an agreement", example: { english: "The long contract is a deal-breaker for us.", vietnamese: "Hợp đồng dài hạn là điều chúng tôi không thể chấp nhận." } },
      { word: "meet someone halfway", ipa: "/ˌmiːt ˌsʌmwʌn ˌhɑːfˈweɪ/", partOfSpeech: "idiom", vietnamese: "mỗi bên nhượng một nửa", definition: "to compromise by each giving up part of what you want", example: { english: "If you can meet us halfway, we'll sign today.", vietnamese: "Nếu anh có thể nhượng một nửa, chúng tôi sẽ ký hôm nay." } },
      { word: "bottom line", ipa: "/ˌbɒtəm ˈlaɪn/", partOfSpeech: "noun", vietnamese: "mức giới hạn cuối cùng; điểm mấu chốt", definition: "the lowest you will accept; the most important fact", example: { english: "Our bottom line is a 10% discount.", vietnamese: "Mức cuối cùng của chúng tôi là giảm 10%." } },
      { word: "flexible", ipa: "/ˈfleksəbl/", partOfSpeech: "adjective", vietnamese: "linh hoạt", definition: "able to change easily", example: { english: "We can be flexible on the payment terms.", vietnamese: "Chúng tôi có thể linh hoạt về điều khoản thanh toán." } },
      { word: "terms", ipa: "/tɜːmz/", partOfSpeech: "noun", vietnamese: "điều khoản", definition: "the conditions of an agreement", example: { english: "Let's agree on the terms before we sign.", vietnamese: "Hãy thống nhất các điều khoản trước khi ký." } },
      { word: "leverage", ipa: "/ˈliːvərɪdʒ/", partOfSpeech: "noun", vietnamese: "lợi thế để gây sức ép", definition: "power to influence a negotiation", example: { english: "As their biggest client, we have a lot of leverage.", vietnamese: "Là khách hàng lớn nhất của họ, chúng tôi có nhiều lợi thế." } },
    ],
    grammar: [{
      title: "Conditional offers",
      pattern: "provided (that) / providing / as long as / on condition that + present tense, we'll / we can …",
      explanation: {
        english: "Negotiators make offers that depend on a condition. Provided that, as long as and on condition that are stronger than if: they mean “only if”. Like if, they take a present tense for a future meaning, never will: Provided that you order 500 units, we can offer free delivery.",
        vietnamese: "Người đàm phán đưa ra đề nghị kèm điều kiện. Provided that, as long as và on condition that mạnh hơn if: nghĩa là “chỉ khi”. Giống if, chúng đi với thì hiện tại để chỉ tương lai, không bao giờ dùng will: Provided that you order 500 units, we can offer free delivery.",
      },
      examples: [
        { english: "We'll accept the price as long as you deliver by March.", vietnamese: "Chúng tôi sẽ chấp nhận giá này miễn là các anh giao hàng trước tháng Ba." },
        { english: "They agreed on condition that the contract was for two years.", vietnamese: "Họ đồng ý với điều kiện hợp đồng kéo dài hai năm." },
      ],
      mistake: {
        wrong: "As long as you will pay in advance, we'll give you a discount.", right: "As long as you pay in advance, we'll give you a discount.",
        why: { english: "Like if, as long as takes a present tense, not will.", vietnamese: "Giống if, as long as đi với thì hiện tại, không dùng will." },
      },
    }, {
      title: "Tentative proposals",
      pattern: "We'd be prepared / willing to + verb · Would you consider + verb-ing? · How would you feel about + verb-ing?",
      explanation: {
        english: "Would makes a proposal sound open rather than final, which helps keep the other side talking: We'd be prepared to lower the price. Consider and feel about take -ing: Would you consider extending the deadline? How would you feel about splitting the cost?",
        vietnamese: "Would làm lời đề xuất nghe cởi mở thay vì dứt khoát, giúp phía bên kia tiếp tục trao đổi: We'd be prepared to lower the price. Consider và feel about đi với -ing: Would you consider extending the deadline? How would you feel about splitting the cost?",
      },
      examples: [
        { english: "We'd be willing to pay a deposit.", vietnamese: "Chúng tôi sẵn sàng đặt cọc." },
        { english: "How would you feel about a three-year contract?", vietnamese: "Anh thấy thế nào về hợp đồng ba năm?" },
      ],
      mistake: {
        wrong: "Would you consider to lower the price?", right: "Would you consider lowering the price?",
        why: { english: "Consider is followed by -ing.", vietnamese: "Consider đi với -ing." },
      },
    }],
    examples: [
      { english: "Provided the terms are flexible, we're happy to sign.", vietnamese: "Miễn là các điều khoản linh hoạt, chúng tôi sẵn lòng ký." },
      { english: "Their counter-offer was close to our bottom line.", vietnamese: "Đề nghị ngược lại của họ gần sát mức giới hạn của chúng tôi." },
      { english: "Payment in advance is a deal-breaker for most small firms.", vietnamese: "Thanh toán trước là điều không thể chấp nhận với hầu hết các công ty nhỏ." },
      { english: "We made one concession, so we expect them to meet us halfway.", vietnamese: "Chúng tôi đã nhượng bộ một lần, nên mong họ cũng nhượng một nửa." },
    ],
    dialogue: [
      { speaker: "Buyer", english: "Your price is too high for an order this size.", vietnamese: "Giá của các anh quá cao cho một đơn hàng cỡ này." },
      { speaker: "Phuc", english: "We'd be prepared to offer 5% off, provided that you sign for two years.", vietnamese: "Chúng tôi sẵn sàng giảm 5%, với điều kiện anh ký hợp đồng hai năm." },
      { speaker: "Buyer", english: "Two years is a deal-breaker, I'm afraid. Would you consider one year at 8%?", vietnamese: "Rất tiếc, hai năm là điều chúng tôi không chấp nhận được. Anh có cân nhắc một năm với mức giảm 8% không?" },
      { speaker: "Phuc", english: "8% is below our bottom line. Could you meet us halfway?", vietnamese: "8% thấp hơn mức giới hạn của chúng tôi. Anh có thể nhượng một nửa không?" },
      { speaker: "Buyer", english: "How would you feel about 6.5%, as long as delivery is free?", vietnamese: "Anh thấy 6,5% thì sao, miễn là giao hàng miễn phí?" },
      { speaker: "Phuc", english: "That's acceptable. Let's agree on the terms.", vietnamese: "Chấp nhận được. Hãy thống nhất các điều khoản." },
    ],
    practice: [
      q("Complete: As long as you ___ on time, we'll pay.", ["deliver", "will deliver", "delivered", "would deliver"], "deliver", "Present tense after as long as."),
      q("Complete: Would you consider ___ the contract?", ["extending", "to extend", "extend", "extended"], "extending", "Consider + -ing."),
      q("Complete: We'd be ___ to lower the price.", ["prepared", "preparing", "prepare", "preparation"], "prepared", "We'd be prepared to…"),
      q("“Sự nhượng bộ” in English is…", ["concession", "confession", "concert", "condition"], "concession", "Concession = something you give up."),
    ],
    challenge: [
      q("Complete: ___ that you pay a deposit, we can start next week.", ["Provided", "Unless", "Even if", "Although"], "Provided", "Provided that = only if."),
      q("Complete: How would you feel about ___ the cost?", ["sharing", "to share", "share", "shared"], "sharing", "Feel about + -ing."),
      q("Complete: If you can meet us ___, we have a deal.", ["halfway", "half", "in the middle way", "halfpath"], "halfway", "Meet someone halfway."),
      q("Complete: We agreed on condition that the price ___ fixed.", ["was", "will be", "would being", "is being"], "was", "Past reported condition."),
      q("What is a “deal-breaker”?", ["a problem that makes you refuse an agreement", "a very good deal", "a lawyer", "a discount"], "a problem that makes you refuse an agreement", "Deal-breaker."),
    ],
  }, {
    key: "business-idioms", title: "Back to the Drawing Board", titleVi: "Thành ngữ trong kinh doanh",
    objectives: [
      "I can understand and use common idioms in British workplaces.",
      "Use business idioms in their exact fixed form",
      "Keep idioms for meetings and emails to colleagues, not formal reports",
    ],
    vocabulary: [
      { word: "back to the drawing board", ipa: "/ˌbæk tə ðə ˈdrɔːɪŋ bɔːd/", partOfSpeech: "idiom", vietnamese: "làm lại từ đầu", definition: "used when a plan has failed and you must start again", example: { english: "The client hated it, so it's back to the drawing board.", vietnamese: "Khách hàng không thích, nên phải làm lại từ đầu." } },
      { word: "think outside the box", ipa: "/ˌθɪŋk aʊtˌsaɪd ðə ˈbɒks/", partOfSpeech: "idiom", vietnamese: "tư duy sáng tạo, phá cách", definition: "to think in a new and creative way", example: { english: "We need someone who can think outside the box.", vietnamese: "Chúng ta cần người có tư duy phá cách." } },
      { word: "get the ball rolling", ipa: "/ˌɡet ðə ˈbɔːl ˌrəʊlɪŋ/", partOfSpeech: "idiom", vietnamese: "khởi động, bắt đầu", definition: "to start an activity", example: { english: "Let me get the ball rolling with a few ideas.", vietnamese: "Để tôi khởi động bằng vài ý tưởng." } },
      { word: "a ballpark figure", ipa: "/ə ˌbɔːlpɑːk ˈfɪɡə/", partOfSpeech: "idiom", vietnamese: "con số ước chừng", definition: "a rough estimate", example: { english: "Can you give me a ballpark figure for the cost?", vietnamese: "Anh có thể cho tôi con số ước chừng về chi phí không?" } },
      { word: "on the same page", ipa: "/ɒn ðə ˌseɪm ˈpeɪdʒ/", partOfSpeech: "idiom", vietnamese: "cùng quan điểm, hiểu ý nhau", definition: "agreeing about what to do", example: { english: "Let's make sure we're all on the same page.", vietnamese: "Hãy đảm bảo tất cả chúng ta cùng hiểu một ý." } },
      { word: "cut corners", ipa: "/ˌkʌt ˈkɔːnəz/", partOfSpeech: "idiom", vietnamese: "làm ẩu, đốt cháy giai đoạn", definition: "to do something badly or cheaply to save time or money", example: { english: "Don't cut corners on safety.", vietnamese: "Đừng làm ẩu trong vấn đề an toàn." } },
      { word: "call it a day", ipa: "/ˌkɔːl ɪt ə ˈdeɪ/", partOfSpeech: "idiom", vietnamese: "kết thúc, nghỉ thôi", definition: "to stop working for the day", example: { english: "It's seven o'clock. Let's call it a day.", vietnamese: "Bảy giờ rồi. Nghỉ thôi." } },
      { word: "touch base", ipa: "/ˌtʌtʃ ˈbeɪs/", partOfSpeech: "idiom", vietnamese: "liên lạc lại, trao đổi nhanh", definition: "to make brief contact with someone", example: { english: "Let's touch base next week about the launch.", vietnamese: "Tuần sau chúng ta trao đổi nhanh về đợt ra mắt nhé." } },
    ],
    grammar: [{
      title: "Fixed form",
      pattern: "back to the drawing board (not table) · call it a day (not the day) · get the ball rolling (not the ball moving)",
      explanation: {
        english: "Idioms only work in their exact form. Changing a word, even to a synonym, makes them sound wrong or confusing: back to the drawing board, not the drawing table. You can usually change the verb tense or subject (We called it a day), but the main words and articles stay the same.",
        vietnamese: "Thành ngữ chỉ có tác dụng khi dùng đúng nguyên dạng. Thay một từ, kể cả bằng từ đồng nghĩa, sẽ khiến chúng nghe sai hoặc khó hiểu: back to the drawing board, không phải the drawing table. Thường có thể đổi thì của động từ hoặc chủ ngữ (We called it a day), nhưng các từ chính và mạo từ giữ nguyên.",
      },
      examples: [
        { english: "The prototype failed, so we went back to the drawing board.", vietnamese: "Mẫu thử thất bại, nên chúng tôi làm lại từ đầu." },
        { english: "We'd better call it a day. It's late.", vietnamese: "Chúng ta nên nghỉ thôi. Muộn rồi." },
      ],
      mistake: {
        wrong: "The plan failed, so it's back to the drawing table.", right: "The plan failed, so it's back to the drawing board.",
        why: { english: "The idiom is fixed: drawing board.", vietnamese: "Thành ngữ là cố định: drawing board." },
      },
    }, {
      title: "Articles and register",
      pattern: "on the same page · a ballpark figure · cut corners (plural) · idioms: meetings and informal emails, not formal reports",
      explanation: {
        english: "Small words matter: we're on the same page (not a same page), a ballpark figure, cut corners (always plural). Business idioms are informal to neutral. They're natural in meetings and emails to colleagues, but in a formal report write the plain meaning: an approximate figure instead of a ballpark figure.",
        vietnamese: "Từ nhỏ cũng quan trọng: we're on the same page (không phải a same page), a ballpark figure, cut corners (luôn số nhiều). Thành ngữ kinh doanh mang tính thân mật đến trung tính. Chúng tự nhiên trong cuộc họp và email cho đồng nghiệp, nhưng trong báo cáo trang trọng hãy viết nghĩa thông thường: an approximate figure thay vì a ballpark figure.",
      },
      examples: [
        { english: "Before we start, are we all on the same page?", vietnamese: "Trước khi bắt đầu, tất cả chúng ta đã thống nhất chưa?" },
        { english: "Report: The approximate cost is £20,000.", vietnamese: "Báo cáo: Chi phí ước tính là 20.000 bảng." },
      ],
      mistake: {
        wrong: "I don't think we're on a same page.", right: "I don't think we're on the same page.",
        why: { english: "Same always takes the: on the same page.", vietnamese: "Same luôn đi với the: on the same page." },
      },
    }],
    examples: [
      { english: "To get the ball rolling, let's brainstorm some names.", vietnamese: "Để khởi động, chúng ta hãy cùng nghĩ vài cái tên." },
      { english: "They cut corners, and the product broke after a month.", vietnamese: "Họ làm ẩu, và sản phẩm hỏng sau một tháng." },
      { english: "Give me a ballpark figure and I'll touch base with finance.", vietnamese: "Cho tôi con số ước chừng rồi tôi sẽ trao đổi với bộ phận tài chính." },
      { english: "We need fresh ideas. Try to think outside the box.", vietnamese: "Chúng ta cần ý tưởng mới. Hãy cố tư duy phá cách." },
    ],
    dialogue: [
      { speaker: "Team leader", english: "Right, let's get the ball rolling. How did the test go?", vietnamese: "Được rồi, bắt đầu thôi. Buổi thử nghiệm thế nào?" },
      { speaker: "Nga", english: "Not well. Users found the app confusing. It's back to the drawing board.", vietnamese: "Không tốt. Người dùng thấy ứng dụng khó hiểu. Phải làm lại từ đầu." },
      { speaker: "Team leader", english: "OK. We can't cut corners this time. Any new ideas?", vietnamese: "Được. Lần này không được làm ẩu. Có ý tưởng mới nào không?" },
      { speaker: "Nga", english: "Let's think outside the box. What if we used voice instead of menus?", vietnamese: "Hãy tư duy phá cách. Nếu chúng ta dùng giọng nói thay cho menu thì sao?" },
      { speaker: "Team leader", english: "Interesting. Can you give me a ballpark figure for the cost?", vietnamese: "Thú vị đấy. Chị có thể cho con số ước chừng về chi phí không?" },
      { speaker: "Nga", english: "I'll touch base with the developers and let you know tomorrow.", vietnamese: "Tôi sẽ trao đổi với các lập trình viên và báo anh vào ngày mai." },
    ],
    practice: [
      q("Complete: The plan failed. It's back to the drawing ___.", ["board", "table", "desk", "paper"], "board", "Fixed idiom."),
      q("Complete: It's late. Let's call it a ___.", ["day", "night", "time", "the day"], "day", "Call it a day."),
      q("Complete: Can you give me a ___ figure?", ["ballpark", "football", "park", "rough-park"], "ballpark", "A ballpark figure."),
      q("“Làm ẩu, đốt cháy giai đoạn” in English is…", ["cut corners", "cut edges", "cut the corner road", "short corners"], "cut corners", "Cut corners."),
    ],
    challenge: [
      q("Complete: Let me get the ball ___.", ["rolling", "moving", "running", "kicking"], "rolling", "Get the ball rolling."),
      q("Choose the correct sentence.", ["Are we all on the same page?", "Are we all on a same page?", "Are we all in the same page?", "Are we all on same pages?"], "Are we all on the same page?", "On the same page."),
      q("Which is best for a formal report?", ["The approximate cost is £5,000.", "The ballpark figure is five grand.", "It's roughly five K, give or take.", "Cost? About five-ish."], "The approximate cost is £5,000.", "Avoid idioms in formal reports."),
      q("Complete: I'll touch ___ with you next week.", ["base", "bottom", "ground", "basis"], "base", "Touch base."),
      q("What does “think outside the box” mean?", ["think creatively", "work outside", "think about boxes", "stop thinking"], "think creatively", "Creative thinking."),
    ],
  }, {
    key: "reports", title: "The Findings Suggest…", titleVi: "Viết báo cáo",
    objectives: [
      "I can write a clear, impersonal report with findings and recommendations.",
      "Use impersonal language: It was found that…, The data show…",
      "Make recommendations with recommend / propose / suggest + that + (should) + base verb",
    ],
    vocabulary: [
      { word: "findings", ipa: "/ˈfaɪndɪŋz/", partOfSpeech: "noun", vietnamese: "kết quả nghiên cứu, phát hiện", definition: "the information discovered by research", example: { english: "The findings will be published next month.", vietnamese: "Kết quả nghiên cứu sẽ được công bố vào tháng tới." } },
      { word: "respondent", ipa: "/rɪˈspɒndənt/", partOfSpeech: "noun", vietnamese: "người trả lời khảo sát", definition: "a person who answers a survey", example: { english: "Over half of respondents prefer working from home.", vietnamese: "Hơn một nửa số người trả lời thích làm việc tại nhà." } },
      { word: "significant", ipa: "/sɪɡˈnɪfɪkənt/", partOfSpeech: "adjective", vietnamese: "đáng kể", definition: "large or important enough to notice", example: { english: "There was a significant increase in sales.", vietnamese: "Doanh số tăng đáng kể." } },
      { word: "in light of", ipa: "/ɪn ˈlaɪt əv/", partOfSpeech: "phrase", vietnamese: "dựa trên, xét đến", definition: "because of; considering", example: { english: "In light of these results, we will change the policy.", vietnamese: "Dựa trên các kết quả này, chúng tôi sẽ thay đổi chính sách." } },
      { word: "conclude", ipa: "/kənˈkluːd/", partOfSpeech: "verb", vietnamese: "kết luận", definition: "to decide something is true after considering the facts", example: { english: "The report concludes that the scheme was a success.", vietnamese: "Báo cáo kết luận rằng chương trình đã thành công." } },
      { word: "data", ipa: "/ˈdeɪtə/", partOfSpeech: "noun", vietnamese: "dữ liệu", definition: "facts and figures collected for study (often plural in formal English)", example: { english: "The data show a clear pattern.", vietnamese: "Dữ liệu cho thấy một xu hướng rõ ràng." } },
      { word: "trend", ipa: "/trend/", partOfSpeech: "noun", vietnamese: "xu hướng", definition: "a general direction of change", example: { english: "The trend towards online learning is continuing.", vietnamese: "Xu hướng học trực tuyến đang tiếp diễn." } },
      { word: "propose", ipa: "/prəˈpəʊz/", partOfSpeech: "verb", vietnamese: "đề xuất", definition: "to formally suggest a plan", example: { english: "We propose that the office open at eight.", vietnamese: "Chúng tôi đề xuất văn phòng mở cửa lúc tám giờ." } },
    ],
    grammar: [{
      title: "Impersonal report language",
      pattern: "This report aims to… · It was found that… · The data show / indicate that… · According to the survey, …",
      explanation: {
        english: "Reports avoid I and we so that the facts, not the writer, are the focus. Use This report aims to…, the passive (It was found that…, Respondents were asked…), or the data as subject (The data show…). In formal English data is often treated as plural: The data show, not The data shows.",
        vietnamese: "Báo cáo tránh dùng I và we để trọng tâm là sự kiện chứ không phải người viết. Dùng This report aims to…, câu bị động (It was found that…, Respondents were asked…), hoặc lấy dữ liệu làm chủ ngữ (The data show…). Trong tiếng Anh trang trọng, data thường được coi là số nhiều: The data show, không phải The data shows.",
      },
      examples: [
        { english: "This report aims to evaluate the new training scheme.", vietnamese: "Báo cáo này nhằm đánh giá chương trình đào tạo mới." },
        { english: "It was found that most respondents felt more productive.", vietnamese: "Kết quả cho thấy phần lớn người trả lời cảm thấy làm việc hiệu quả hơn." },
      ],
      mistake: {
        wrong: "I found that we are losing customers.", right: "It was found that customer numbers have fallen.",
        why: { english: "Reports use impersonal forms, not I or we.", vietnamese: "Báo cáo dùng cấu trúc khách quan, không dùng I hay we." },
      },
    }, {
      title: "Recommendations",
      pattern: "It is recommended that… · We recommend / propose / suggest that + subject + (should) + base verb · We recommend + verb-ing",
      explanation: {
        english: "To make a recommendation, use recommend, propose or suggest with that + subject + base verb (or should + base verb): We recommend that the company reduce costs / should reduce costs. Or use -ing: We recommend reducing costs. Recommend does not take object + to.",
        vietnamese: "Để đưa ra khuyến nghị, dùng recommend, propose hoặc suggest với that + chủ ngữ + động từ nguyên mẫu (hoặc should + động từ nguyên mẫu): We recommend that the company reduce costs / should reduce costs. Hoặc dùng -ing: We recommend reducing costs. Recommend không đi với tân ngữ + to.",
      },
      examples: [
        { english: "It is recommended that staff receive further training.", vietnamese: "Khuyến nghị nhân viên được đào tạo thêm." },
        { english: "We propose introducing flexible hours.", vietnamese: "Chúng tôi đề xuất áp dụng giờ làm linh hoạt." },
      ],
      mistake: {
        wrong: "We recommend the company to open a new branch.", right: "We recommend that the company open a new branch.",
        why: { english: "Recommend takes that + subject + base verb, or -ing, not object + to.", vietnamese: "Recommend đi với that + chủ ngữ + động từ nguyên mẫu, hoặc -ing, không đi với tân ngữ + to." },
      },
    }],
    examples: [
      { english: "The findings indicate a significant trend towards remote work.", vietnamese: "Kết quả cho thấy một xu hướng đáng kể về làm việc từ xa." },
      { english: "In light of the data, it is recommended that the scheme continue.", vietnamese: "Dựa trên dữ liệu, khuyến nghị tiếp tục chương trình." },
      { english: "Most respondents were satisfied with the service.", vietnamese: "Phần lớn người trả lời hài lòng với dịch vụ." },
      { english: "The report concludes that costs could be cut by 15%.", vietnamese: "Báo cáo kết luận rằng chi phí có thể được cắt giảm 15%." },
    ],
    dialogue: [
      { speaker: "Director", english: "Could you summarise the report's findings?", vietnamese: "Chị có thể tóm tắt kết quả của báo cáo không?" },
      { speaker: "Quyen", english: "Certainly. It was found that 70% of respondents want flexible hours.", vietnamese: "Chắc chắn rồi. Kết quả cho thấy 70% người trả lời muốn giờ làm linh hoạt." },
      { speaker: "Director", english: "Is that significant?", vietnamese: "Con số đó có đáng kể không?" },
      { speaker: "Quyen", english: "Yes. The data show a clear trend since last year.", vietnamese: "Có. Dữ liệu cho thấy một xu hướng rõ ràng kể từ năm ngoái." },
      { speaker: "Director", english: "And your recommendations?", vietnamese: "Còn khuyến nghị của chị?" },
      { speaker: "Quyen", english: "In light of the findings, we recommend that the company introduce a trial in January.", vietnamese: "Dựa trên kết quả, chúng tôi khuyến nghị công ty triển khai thử nghiệm vào tháng Một." },
    ],
    practice: [
      q("Complete: It ___ that most staff were happy.", ["was found", "found", "was finding", "has found it"], "was found", "Impersonal passive."),
      q("Complete: We recommend that the company ___ costs.", ["reduce", "to reduce", "reduces to", "reducing to"], "reduce", "That + subject + base verb."),
      q("Complete: In formal English, “The data ___ a clear pattern.”", ["show", "shows", "is showing", "has show"], "show", "Data as plural."),
      q("“Người trả lời khảo sát” in English is…", ["respondent", "responder man", "answerer", "response"], "respondent", "Respondent = person who answers."),
    ],
    challenge: [
      q("Which sentence fits a formal report?", ["This report aims to assess customer satisfaction.", "I want to look at whether customers are happy.", "Let's see if customers like us!", "We reckon customers are fine."], "This report aims to assess customer satisfaction.", "Impersonal and formal."),
      q("Complete: We propose ___ a new website.", ["launching", "to launch", "launch", "the launch to"], "launching", "Propose + -ing."),
      q("Choose the correct sentence.", ["It is recommended that staff be trained.", "It is recommended staff to be trained.", "It is recommended that staff are train.", "It recommends staff to train."], "It is recommended that staff be trained.", "It is recommended that + base."),
      q("Complete: ___ light of the results, we will act.", ["In", "On", "At", "By"], "In", "In light of."),
      q("What does “significant” mean in a report?", ["large or important enough to notice", "small", "secret", "signed"], "large or important enough to notice", "Significant = notable."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 2", isReview: true,
    objectives: [
      "I can discuss work and the economy formally and negotiate effectively.",
      "Check passive forms, nominalisation, negotiating language, business idioms and reports",
    ],
    vocabulary: [
      { word: "promote", ipa: "/prəˈməʊt/", partOfSpeech: "verb", vietnamese: "thăng chức", definition: "to give someone a more important job", example: { english: "He was promoted to sales director.", vietnamese: "Anh ấy được thăng chức giám đốc kinh doanh." } },
      { word: "growth", ipa: "/ɡrəʊθ/", partOfSpeech: "noun", vietnamese: "sự tăng trưởng", definition: "an increase in size or amount", example: { english: "Vietnam's economic growth is impressive.", vietnamese: "Tăng trưởng kinh tế của Việt Nam rất ấn tượng." } },
      { word: "demand", ipa: "/dɪˈmɑːnd/", partOfSpeech: "noun", vietnamese: "nhu cầu", definition: "the need or wish for goods or services", example: { english: "Demand for English teachers is high.", vietnamese: "Nhu cầu về giáo viên tiếng Anh rất cao." } },
      { word: "concession", ipa: "/kənˈseʃn/", partOfSpeech: "noun", vietnamese: "sự nhượng bộ", definition: "something you agree to give up in a negotiation", example: { english: "Neither side would make a concession.", vietnamese: "Không bên nào chịu nhượng bộ." } },
      { word: "a ballpark figure", ipa: "/ə ˌbɔːlpɑːk ˈfɪɡə/", partOfSpeech: "idiom", vietnamese: "con số ước chừng", definition: "a rough estimate", example: { english: "Ten thousand pounds is a ballpark figure.", vietnamese: "Mười nghìn bảng là con số ước chừng." } },
      { word: "findings", ipa: "/ˈfaɪndɪŋz/", partOfSpeech: "noun", vietnamese: "kết quả nghiên cứu, phát hiện", definition: "the information discovered by research", example: { english: "The findings surprised everyone.", vietnamese: "Kết quả nghiên cứu khiến mọi người bất ngờ." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "hate being told / expect to be promoted · needs cleaning · a rapid rise in / demand for · as long as you pay / consider lowering · back to the drawing board · It was found that… / recommend that + base verb",
      explanation: {
        english: "Check these: passive meaning after verbs and prepositions needs being or to be + past participle, and needs + -ing is passive; in formal writing, turn verbs into nouns and adverbs into adjectives, with the right preposition (rise in, demand for, shortage of); conditions with as long as or provided take a present tense, and consider takes -ing; idioms keep their exact form and stay out of formal reports; reports are impersonal, and recommend takes that + base verb or -ing.",
        vietnamese: "Hãy kiểm tra: nghĩa bị động sau động từ và giới từ cần being hoặc to be + quá khứ phân từ, và needs + -ing mang nghĩa bị động; trong văn trang trọng, chuyển động từ thành danh từ và trạng từ thành tính từ, với giới từ đúng (rise in, demand for, shortage of); điều kiện với as long as hay provided dùng thì hiện tại, và consider đi với -ing; thành ngữ giữ nguyên dạng và không dùng trong báo cáo trang trọng; báo cáo mang tính khách quan, và recommend đi với that + động từ nguyên mẫu hoặc -ing.",
      },
      examples: [
        { english: "The findings show a sharp rise in demand for training.", vietnamese: "Kết quả cho thấy nhu cầu đào tạo tăng mạnh." },
        { english: "She hopes to be promoted, provided that growth continues.", vietnamese: "Cô ấy hy vọng được thăng chức, miễn là tăng trưởng tiếp tục." },
      ],
    }],
    examples: [
      { english: "Strong growth has increased demand for skilled staff.", vietnamese: "Tăng trưởng mạnh đã làm tăng nhu cầu nhân viên có tay nghề." },
      { english: "In light of the findings, a small concession seems sensible.", vietnamese: "Dựa trên kết quả, một sự nhượng bộ nhỏ có vẻ hợp lý." },
      { english: "Can you give me a ballpark figure before we promote anyone?", vietnamese: "Anh có thể cho tôi con số ước chừng trước khi chúng ta thăng chức cho ai không?" },
    ],
    dialogue: [
      { speaker: "CEO", english: "What do the findings tell us?", vietnamese: "Kết quả nghiên cứu cho chúng ta biết điều gì?" },
      { speaker: "Thinh", english: "There's been a sharp rise in demand for our products in the north.", vietnamese: "Nhu cầu về sản phẩm của chúng ta ở miền Bắc tăng mạnh." },
      { speaker: "CEO", english: "Excellent. Can you give me a ballpark figure for the growth?", vietnamese: "Tuyệt vời. Anh có thể cho tôi con số ước chừng về mức tăng trưởng không?" },
      { speaker: "Thinh", english: "Around 20%. But our factory needs upgrading to keep up.", vietnamese: "Khoảng 20%. Nhưng nhà máy của chúng ta cần nâng cấp để theo kịp." },
      { speaker: "CEO", english: "The supplier wants a long contract. Should we make a concession?", vietnamese: "Nhà cung cấp muốn hợp đồng dài hạn. Chúng ta có nên nhượng bộ không?" },
      { speaker: "Thinh", english: "Only provided that they lower the price. I'd recommend negotiating hard.", vietnamese: "Chỉ khi họ giảm giá. Tôi khuyên nên đàm phán cứng rắn." },
      { speaker: "CEO", english: "Agreed. And by the way, you deserve to be promoted for this work.", vietnamese: "Đồng ý. Và nhân tiện, anh xứng đáng được thăng chức vì công việc này." },
    ],
    practice: [
      q("Complete: Nobody likes ___ at.", ["being shouted", "shouting", "to shout", "be shouted"], "being shouted", "Passive -ing."),
      q("Complete: There's a shortage ___ engineers.", ["of", "for", "in", "on"], "of", "Shortage of."),
      q("Complete: Would you consider ___ the price?", ["reducing", "to reduce", "reduce", "reduced"], "reducing", "Consider + -ing."),
      q("Complete: It's back to the drawing ___.", ["board", "table", "room", "book"], "board", "Fixed idiom."),
    ],
    challenge: [
      q("Complete: The roof needs ___.", ["repairing", "to repair", "repair", "repaired"], "repairing", "Needs + -ing."),
      q("“Unemployment fell sharply” as a noun phrase is…", ["a sharp fall in unemployment", "a sharply fall of unemployment", "unemployment's sharply falling", "a sharp falling unemployment"], "a sharp fall in unemployment", "Nominalisation."),
      q("Complete: Provided that you ___ today, we'll start tomorrow.", ["sign", "will sign", "would sign", "signed tomorrow"], "sign", "Present tense after provided that."),
      q("Choose the best sentence for a report.", ["It was found that sales had increased.", "I found sales went up loads.", "We think sales are kind of up.", "Sales? Up, basically."], "It was found that sales had increased.", "Impersonal."),
      q("Complete: We recommend that the team ___ more often.", ["meet", "to meet", "meets to", "meeting to"], "meet", "That + subject + base verb."),
    ],
  }],
  assessment: [
    { id: "passive-ing", prompt: "Complete: I can't stand ___ what to do.", options: ["being told", "telling", "to tell", "be told"], correct: "being told", explanation: "Passive -ing." },
    { id: "passive-infinitive", prompt: "Complete: He expects ___ next month.", options: ["to be promoted", "to promote", "promoting", "being promote"], correct: "to be promoted", explanation: "Passive infinitive." },
    { id: "needs-ing", prompt: "“Văn phòng cần được dọn dẹp.” in English is…", options: ["The office needs cleaning.", "The office needs to clean.", "The office needs clean.", "The office is needing to clean."], correct: "The office needs cleaning.", explanation: "Needs + -ing." },
    { id: "nominalise", prompt: "“Costs rose rapidly” as a noun phrase is…", options: ["a rapid rise in costs", "a rapidly rise of costs", "costs' rapid rising up", "a rapid rising costs"], correct: "a rapid rise in costs", explanation: "Adjective + noun + in." },
    { id: "demand-for", prompt: "Complete: Demand ___ housing is very high.", options: ["for", "of", "in", "on"], correct: "for", explanation: "Demand for." },
    { id: "decline-in", prompt: "Complete: There has been a decline ___ visitors.", options: ["in", "of", "for", "at"], correct: "in", explanation: "Decline in." },
    { id: "as-long-as", prompt: "Complete: As long as you ___ in advance, we'll offer a discount.", options: ["pay", "will pay", "paid", "would pay"], correct: "pay", explanation: "Present tense after as long as." },
    { id: "consider-ing", prompt: "Complete: Would you consider ___ the deadline?", options: ["extending", "to extend", "extend", "extended"], correct: "extending", explanation: "Consider + -ing." },
    { id: "prepared-to", prompt: "Complete: We'd be ___ to offer free delivery.", options: ["prepared", "preparing", "prepare", "preparation"], correct: "prepared", explanation: "We'd be prepared to." },
    { id: "drawing-board", prompt: "Complete: The design failed. It's back to the ___.", options: ["drawing board", "drawing table", "drawing desk", "draw board"], correct: "drawing board", explanation: "Fixed idiom." },
    { id: "same-page", prompt: "Choose the correct sentence.", options: ["Let's make sure we're on the same page.", "Let's make sure we're on a same page.", "Let's make sure we're in same page.", "Let's make sure we're on the same pages of book."], correct: "Let's make sure we're on the same page.", explanation: "On the same page." },
    { id: "call-it-a-day", prompt: "Complete: We're all tired. Let's call it ___.", options: ["a day", "the day", "one day", "day"], correct: "a day", explanation: "Call it a day." },
    { id: "impersonal", prompt: "Which sentence suits a formal report?", options: ["It was found that turnover had increased.", "I found that turnover went up loads.", "Turnover is up, I reckon.", "We kind of found more turnover."], correct: "It was found that turnover had increased.", explanation: "Impersonal passive." },
    { id: "recommend-that", prompt: "Choose the correct sentence.", options: ["We recommend that the firm hire more staff.", "We recommend the firm to hire more staff.", "We recommend to the firm hiring more staff to.", "We recommend that the firm to hire more staff."], correct: "We recommend that the firm hire more staff.", explanation: "Recommend that + base verb." },
    { id: "data-show", prompt: "Complete (formal): The data ___ a clear trend.", options: ["show", "shows", "is show", "showing"], correct: "show", explanation: "Data as plural." },
  ],
};
