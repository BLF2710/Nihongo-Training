// C1 Unit 5: Society & Change. Advanced Vietnamese speakers often keep if in an inverted conditional ("If had I
// known"); say "Were not it for"; confuse used to do with be used to doing ("I'm used to get up early"); say "the most
// of people", "a few" when they mean almost none, or "a great deal of problems"; answer their own rhetorical
// questions too bluntly; and mix up social nouns and adjectives ("the inequality is increase"). This unit puts those
// right for discussing how society is changing.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "C1",
  number: 5,
  lessons: [{
    key: "inverted-conditionals", title: "Were It Not for…", titleVi: "Đảo ngữ câu điều kiện",
    objectives: [
      "I can use formal conditionals without if.",
      "Use Had I known, Were it not for and Should you need",
      "Use but for, otherwise and provided that as alternatives to if",
    ],
    vocabulary: [
      { word: "reform", ipa: "/rɪˈfɔːm/", partOfSpeech: "noun", vietnamese: "cải cách", definition: "a change made to improve a system", example: { english: "The reform changed the voting system.", vietnamese: "Cuộc cải cách đã thay đổi hệ thống bầu cử." } },
      { word: "legislation", ipa: "/ˌledʒɪsˈleɪʃn/", partOfSpeech: "noun", vietnamese: "luật pháp, đạo luật", definition: "a law or set of laws", example: { english: "New legislation protects workers' rights.", vietnamese: "Đạo luật mới bảo vệ quyền của người lao động." } },
      { word: "campaigner", ipa: "/kæmˈpeɪnə/", partOfSpeech: "noun", vietnamese: "nhà vận động", definition: "a person who works to achieve social or political change", example: { english: "Campaigners fought for decades for equal pay.", vietnamese: "Các nhà vận động đã đấu tranh hàng chục năm cho việc trả lương bình đẳng." } },
      { word: "outcome", ipa: "/ˈaʊtkʌm/", partOfSpeech: "noun", vietnamese: "kết quả", definition: "the result of an action or event", example: { english: "Nobody predicted the outcome of the vote.", vietnamese: "Không ai đoán được kết quả cuộc bỏ phiếu." } },
      { word: "turning point", ipa: "/ˈtɜːnɪŋ pɔɪnt/", partOfSpeech: "noun", vietnamese: "bước ngoặt", definition: "a time when an important change happens", example: { english: "The protest was a turning point in history.", vietnamese: "Cuộc biểu tình là một bước ngoặt trong lịch sử." } },
      { word: "but for", ipa: "/ˈbʌt fə/", partOfSpeech: "preposition", vietnamese: "nếu không có", definition: "without (formal; + noun)", example: { english: "But for their courage, nothing would have changed.", vietnamese: "Nếu không có lòng dũng cảm của họ, sẽ chẳng có gì thay đổi." } },
      { word: "provided that", ipa: "/prəˈvaɪdɪd ðæt/", partOfSpeech: "conjunction", vietnamese: "miễn là, với điều kiện là", definition: "only if", example: { english: "You can vote provided that you are over eighteen.", vietnamese: "Bạn có thể bỏ phiếu miễn là trên mười tám tuổi." } },
      { word: "otherwise", ipa: "/ˈʌðəwaɪz/", partOfSpeech: "adverb", vietnamese: "nếu không thì", definition: "if not; or else", example: { english: "We must act now; otherwise, it will be too late.", vietnamese: "Chúng ta phải hành động ngay; nếu không thì sẽ quá muộn." } },
    ],
    grammar: [{
      title: "Inversion instead of if",
      pattern: "Had + subject + past participle (= If… had) · Were + subject + to / adjective (= If… were) · Should + subject + verb (= If… should)",
      explanation: {
        english: "In formal English, drop if and put the auxiliary first. Had I known = If I had known. Were it not for the campaigners = If it were not for them. Should you need help = If you need help (by any chance). The negative comes after the subject: Had they not acted, nothing would have changed.",
        vietnamese: "Trong tiếng Anh trang trọng, bỏ if và đưa trợ động từ lên đầu. Had I known = If I had known. Were it not for the campaigners = If it were not for them. Should you need help = If you need help (nếu chẳng may). Phủ định đứng sau chủ ngữ: Had they not acted, nothing would have changed.",
      },
      examples: [
        { english: "Had the law been passed earlier, many lives would have been saved.", vietnamese: "Nếu đạo luật được thông qua sớm hơn, nhiều sinh mạng đã được cứu." },
        { english: "Should you have any questions, please contact the office.", vietnamese: "Nếu có bất kỳ câu hỏi nào, xin hãy liên hệ văn phòng." },
      ],
      mistake: {
        wrong: "If had I known about the reform, I would have voted.", right: "Had I known about the reform, I would have voted.",
        why: { english: "When you invert, drop if.", vietnamese: "Khi đảo ngữ, bỏ if." },
      },
    }, {
      title: "But for, otherwise and provided that",
      pattern: "But for + noun, … would (have) … · …; otherwise, … · provided / providing (that) + present simple",
      explanation: {
        english: "But for + noun means if it were not for or if it hadn't been for: But for the new legislation, workers would still earn less. Otherwise means if not and often follows a semicolon. Provided that is a strong only if, and like if it takes the present simple for the future: provided that the vote passes.",
        vietnamese: "But for + danh từ nghĩa là nếu không có: But for the new legislation, workers would still earn less. Otherwise nghĩa là nếu không thì và thường đứng sau dấu chấm phẩy. Provided that là chỉ khi mang nghĩa mạnh, và giống if nó đi với hiện tại đơn cho tương lai: provided that the vote passes.",
      },
      examples: [
        { english: "But for the campaigners, women might still not have the vote.", vietnamese: "Nếu không có các nhà vận động, phụ nữ có lẽ vẫn chưa có quyền bầu cử." },
        { english: "The reform will work provided that it is properly funded.", vietnamese: "Cuộc cải cách sẽ hiệu quả miễn là được cấp đủ kinh phí." },
      ],
      mistake: {
        wrong: "Provided that the law will pass, things will improve.", right: "Provided that the law passes, things will improve.",
        why: { english: "Use the present simple after provided that.", vietnamese: "Dùng hiện tại đơn sau provided that." },
      },
    }],
    examples: [
      { english: "Were it not for the reform, millions would still be poor.", vietnamese: "Nếu không có cuộc cải cách, hàng triệu người vẫn còn nghèo." },
      { english: "The election was a turning point; otherwise, little would have changed.", vietnamese: "Cuộc bầu cử là bước ngoặt; nếu không thì sẽ chẳng mấy thay đổi." },
      { english: "Had the campaigners given up, the outcome would have been different.", vietnamese: "Nếu các nhà vận động bỏ cuộc, kết quả đã khác." },
      { english: "Should the legislation fail, protests are likely.", vietnamese: "Nếu đạo luật thất bại, rất có thể sẽ có biểu tình." },
    ],
    dialogue: [
      { speaker: "Interviewer", english: "Your grandmother marched for equal pay. Was it worth it?", vietnamese: "Bà của bà đã tuần hành vì quyền trả lương bình đẳng. Điều đó có đáng không?" },
      { speaker: "Ms Harris", english: "Absolutely. Were it not for people like her, we'd still be paid less.", vietnamese: "Chắc chắn rồi. Nếu không có những người như bà, chúng ta vẫn bị trả lương thấp hơn." },
      { speaker: "Interviewer", english: "Did she expect the law to change?", vietnamese: "Bà ấy có mong luật sẽ thay đổi không?" },
      { speaker: "Ms Harris", english: "Not really. Had she known the outcome, she'd have been amazed.", vietnamese: "Không hẳn. Nếu bà biết trước kết quả, bà hẳn đã rất kinh ngạc." },
      { speaker: "Interviewer", english: "Is there still work to do?", vietnamese: "Vẫn còn việc phải làm chứ?" },
      { speaker: "Ms Harris", english: "Yes. The gap will close provided that we keep pushing; otherwise, it won't.", vietnamese: "Có. Khoảng cách sẽ được thu hẹp miễn là chúng ta tiếp tục thúc đẩy; nếu không thì sẽ không." },
    ],
    practice: [
      q("Complete: ___ I known, I would have come.", ["Had", "If had", "Have", "Should"], "Had", "Had I known = If I had known."),
      q("Complete: ___ it not been for your help, I'd have failed.", ["Had", "Were", "Should", "If"], "Had", "Had it not been for = If it hadn't been for."),
      q("Complete: ___ you need anything, just call.", ["Should", "Would", "Had", "Were"], "Should", "Should you need."),
      q("“Bước ngoặt” in English is…", ["turning point", "turning round", "point of turn", "turnover"], "turning point", "Turning point."),
    ],
    challenge: [
      q("Complete: ___ for the rain, we'd have won.", ["But", "Unless", "Otherwise", "Provided"], "But", "But for + noun."),
      q("Complete: You can go, provided that you ___ back by ten.", ["are", "will be", "would be", "were"], "are", "Present simple after provided that."),
      q("Complete: Hurry up; ___, we'll miss the train.", ["otherwise", "provided", "but for", "unless"], "otherwise", "Otherwise = if not."),
      q("Choose the correct sentence.", ["Had they not protested, nothing would have changed.", "Had not they protested, nothing would have changed.", "If had they not protested, nothing would have changed.", "Hadn't they protested, nothing would change."], "Had they not protested, nothing would have changed.", "Not after the subject."),
      q("What is “legislation”?", ["a law or set of laws", "a protest", "a type of election", "a politician"], "a law or set of laws", "Legislation."),
    ],
  }, {
    key: "used-to-doing", title: "I'm Not Used to Being Told", titleVi: "Be used to và get used to",
    objectives: [
      "I can talk about adapting to change.",
      "Tell used to + verb (past habit) from be used to + -ing (familiar)",
      "Use get used to + -ing for the process of adapting",
    ],
    vocabulary: [
      { word: "adapt", ipa: "/əˈdæpt/", partOfSpeech: "verb", vietnamese: "thích nghi", definition: "to change to suit a new situation", example: { english: "Older workers had to adapt to new technology.", vietnamese: "Người lao động lớn tuổi phải thích nghi với công nghệ mới." } },
      { word: "accustomed to", ipa: "/əˈkʌstəmd tə/", partOfSpeech: "phrase", vietnamese: "quen với", definition: "familiar with something (formal; + noun or -ing)", example: { english: "She is accustomed to working long hours.", vietnamese: "Cô ấy đã quen làm việc nhiều giờ." } },
      { word: "migrant", ipa: "/ˈmaɪɡrənt/", partOfSpeech: "noun", vietnamese: "người di cư", definition: "a person who moves to another place to find work", example: { english: "Many migrants moved to the cities.", vietnamese: "Nhiều người di cư đã chuyển đến các thành phố." } },
      { word: "culture shock", ipa: "/ˈkʌltʃə ʃɒk/", partOfSpeech: "noun", vietnamese: "sốc văn hoá", definition: "confusion felt in a very different culture", example: { english: "I experienced culture shock in my first month abroad.", vietnamese: "Tôi bị sốc văn hoá trong tháng đầu ở nước ngoài." } },
      { word: "homesick", ipa: "/ˈhəʊmsɪk/", partOfSpeech: "adjective", vietnamese: "nhớ nhà", definition: "sad because you are away from home", example: { english: "He felt homesick during his first winter.", vietnamese: "Anh ấy nhớ nhà trong mùa đông đầu tiên." } },
      { word: "urbanisation", ipa: "/ˌɜːbənaɪˈzeɪʃn/", partOfSpeech: "noun", vietnamese: "đô thị hoá", definition: "the process of more people moving to towns and cities", example: { english: "Rapid urbanisation has changed rural life.", vietnamese: "Đô thị hoá nhanh chóng đã thay đổi đời sống nông thôn." } },
      { word: "settle in", ipa: "/ˌsetl ˈɪn/", partOfSpeech: "phrasal verb", vietnamese: "ổn định, quen dần", definition: "to become comfortable in a new place", example: { english: "It took a few months to settle in.", vietnamese: "Phải mất vài tháng để ổn định." } },
      { word: "way of life", ipa: "/ˌweɪ əv ˈlaɪf/", partOfSpeech: "collocation", vietnamese: "lối sống", definition: "the typical habits and customs of a person or group", example: { english: "The village way of life is disappearing.", vietnamese: "Lối sống làng quê đang dần biến mất." } },
    ],
    grammar: [{
      title: "Used to vs be used to",
      pattern: "used to + base verb (a past habit, now finished) · be used to + noun / verb-ing (familiar, not strange)",
      explanation: {
        english: "Used to + base verb describes a past habit that has stopped: I used to live in a village. Be used to + noun or -ing means something is familiar and no longer strange: I'm used to living in a big city. In be used to, to is a preposition, so the verb takes -ing.",
        vietnamese: "Used to + động từ nguyên mẫu mô tả thói quen trong quá khứ nay đã chấm dứt: I used to live in a village. Be used to + danh từ hoặc -ing nghĩa là điều gì đó đã quen thuộc, không còn lạ: I'm used to living in a big city. Trong be used to, to là giới từ, nên động từ ở dạng -ing.",
      },
      examples: [
        { english: "My parents used to work on a farm.", vietnamese: "Bố mẹ tôi từng làm việc ở trang trại." },
        { english: "I'm not used to being told what to do.", vietnamese: "Tôi không quen bị người khác bảo phải làm gì." },
      ],
      mistake: {
        wrong: "I'm used to get up early.", right: "I'm used to getting up early.",
        why: { english: "After be used to, use -ing.", vietnamese: "Sau be used to, dùng -ing." },
      },
    }, {
      title: "Get used to",
      pattern: "get / become used to + noun / verb-ing (the process of adapting) · can't get used to",
      explanation: {
        english: "Get used to describes the process of something becoming familiar, and it works in any tense: I'm getting used to the noise. It took me a year to get used to driving on the left. You'll soon get used to it. Like be used to, it is followed by a noun or -ing.",
        vietnamese: "Get used to mô tả quá trình điều gì đó trở nên quen thuộc, và dùng được ở mọi thì: I'm getting used to the noise. It took me a year to get used to driving on the left. You'll soon get used to it. Giống be used to, nó đi với danh từ hoặc -ing.",
      },
      examples: [
        { english: "Migrants often struggle to get used to the climate.", vietnamese: "Người di cư thường chật vật để quen với khí hậu." },
        { english: "I still can't get used to eating dinner so early.", vietnamese: "Tôi vẫn chưa quen ăn tối sớm như vậy." },
      ],
      mistake: {
        wrong: "I'm getting used to speak English all day.", right: "I'm getting used to speaking English all day.",
        why: { english: "Get used to takes -ing.", vietnamese: "Get used to đi với -ing." },
      },
    }],
    examples: [
      { english: "Urbanisation has forced people to adapt to a new way of life.", vietnamese: "Đô thị hoá đã buộc mọi người thích nghi với lối sống mới." },
      { english: "She's accustomed to living alone now.", vietnamese: "Giờ cô ấy đã quen sống một mình." },
      { english: "After the culture shock, it took me months to settle in.", vietnamese: "Sau cú sốc văn hoá, tôi mất nhiều tháng mới ổn định được." },
      { english: "He used to feel homesick, but now he's used to it.", vietnamese: "Anh ấy từng nhớ nhà, nhưng giờ đã quen rồi." },
    ],
    dialogue: [
      { speaker: "Ben", english: "How long have you lived in London now?", vietnamese: "Bạn sống ở London bao lâu rồi?" },
      { speaker: "Thu", english: "Two years. I used to live in a small town in Vietnam.", vietnamese: "Hai năm. Trước đây mình sống ở một thị trấn nhỏ ở Việt Nam." },
      { speaker: "Ben", english: "Was there much culture shock?", vietnamese: "Có bị sốc văn hoá nhiều không?" },
      { speaker: "Thu", english: "At first. I wasn't used to queuing for everything!", vietnamese: "Lúc đầu thì có. Mình không quen xếp hàng cho mọi thứ!" },
      { speaker: "Ben", english: "And now?", vietnamese: "Còn bây giờ?" },
      { speaker: "Thu", english: "I've settled in, but I'm still getting used to the weather. I get homesick in winter.", vietnamese: "Mình đã ổn định rồi, nhưng vẫn đang làm quen với thời tiết. Mùa đông mình hay nhớ nhà." },
    ],
    practice: [
      q("Complete: I ___ smoke, but I stopped.", ["used to", "am used to", "get used to", "use to"], "used to", "Past habit."),
      q("Complete: I'm used to ___ in the dark.", ["working", "work", "worked", "works"], "working", "Be used to + -ing."),
      q("Complete: You'll soon get used ___ the food.", ["to", "with", "for", "at"], "to", "Get used to."),
      q("“Nhớ nhà” in English is…", ["homesick", "housesick", "homeless", "seasick"], "homesick", "Homesick."),
    ],
    challenge: [
      q("Complete: She isn't used to ___ criticised.", ["being", "be", "been", "have been"], "being", "Be used to + passive -ing."),
      q("Choose the correct sentence.", ["It took me months to get used to driving on the left.", "It took me months to get used to drive on the left.", "It took me months to used to driving on the left.", "It took me months to get use to drive on the left."], "It took me months to get used to driving on the left.", "Get used to + -ing."),
      q("Complete: It took a while to settle ___.", ["in", "on", "up", "at"], "in", "Settle in."),
      q("What is “urbanisation”?", ["more people moving to towns and cities", "building farms", "cleaning cities", "a type of tax"], "more people moving to towns and cities", "Urbanisation."),
      q("Complete: He is ___ to hard work.", ["accustomed", "custom", "accustoming", "customary"], "accustomed", "Accustomed to."),
    ],
  }, {
    key: "quantifiers", title: "The Vast Majority", titleVi: "Lượng từ nâng cao",
    objectives: [
      "I can describe proportions and amounts precisely.",
      "Use the vast majority of, a handful of, a tiny minority of and hardly any",
      "Tell few from a few, and a great deal of from a large number of",
    ],
    vocabulary: [
      { word: "the vast majority", ipa: "/ðə ˌvɑːst məˈdʒɒrəti/", partOfSpeech: "collocation", vietnamese: "phần lớn, đại đa số", definition: "almost all of a group", example: { english: "The vast majority of people support the plan.", vietnamese: "Đại đa số người dân ủng hộ kế hoạch." } },
      { word: "a tiny minority", ipa: "/ə ˌtaɪni maɪˈnɒrəti/", partOfSpeech: "collocation", vietnamese: "một thiểu số rất nhỏ", definition: "a very small part of a group", example: { english: "Only a tiny minority voted against it.", vietnamese: "Chỉ một thiểu số rất nhỏ bỏ phiếu chống." } },
      { word: "a handful of", ipa: "/ə ˈhændfʊl əv/", partOfSpeech: "phrase", vietnamese: "một nhúm, một vài", definition: "a small number of", example: { english: "Only a handful of villagers stayed.", vietnamese: "Chỉ một vài người dân làng ở lại." } },
      { word: "hardly any", ipa: "/ˈhɑːdli ˌeni/", partOfSpeech: "determiner", vietnamese: "hầu như không có", definition: "almost none", example: { english: "There are hardly any jobs in the area.", vietnamese: "Hầu như không có việc làm ở khu vực này." } },
      { word: "a great deal of", ipa: "/ə ˌɡreɪt ˈdiːl əv/", partOfSpeech: "phrase", vietnamese: "rất nhiều (không đếm được)", definition: "a large amount of (+ uncountable noun)", example: { english: "The change caused a great deal of anger.", vietnamese: "Sự thay đổi gây ra rất nhiều phẫn nộ." } },
      { word: "a significant proportion", ipa: "/ə sɪɡˌnɪfɪkənt prəˈpɔːʃn/", partOfSpeech: "collocation", vietnamese: "một tỷ lệ đáng kể", definition: "a large enough part to be important", example: { english: "A significant proportion of young people rent their homes.", vietnamese: "Một tỷ lệ đáng kể người trẻ đi thuê nhà." } },
      { word: "virtually", ipa: "/ˈvɜːtʃuəli/", partOfSpeech: "adverb", vietnamese: "gần như, hầu như", definition: "almost completely", example: { english: "Virtually every home now has internet.", vietnamese: "Hầu như mọi nhà giờ đều có internet." } },
      { word: "a fraction of", ipa: "/ə ˈfrækʃn əv/", partOfSpeech: "phrase", vietnamese: "một phần nhỏ", definition: "a very small part or amount of", example: { english: "Workers earn a fraction of what managers earn.", vietnamese: "Công nhân kiếm được chỉ một phần nhỏ so với quản lý." } },
    ],
    grammar: [{
      title: "Proportions",
      pattern: "the vast majority of / a tiny minority of / a significant proportion of + the / possessive + noun · the majority of people (not the most of)",
      explanation: {
        english: "Use these to report survey results precisely: The vast majority of residents agreed. A tiny minority complained. With a plural noun, the verb is usually plural: The majority of young people are worried. Say most people or the majority of people, never the most of people.",
        vietnamese: "Dùng các cụm này để báo cáo kết quả khảo sát chính xác: The vast majority of residents agreed. A tiny minority complained. Với danh từ số nhiều, động từ thường ở số nhiều: The majority of young people are worried. Hãy nói most people hoặc the majority of people, không bao giờ nói the most of people.",
      },
      examples: [
        { english: "A significant proportion of the population is over sixty.", vietnamese: "Một tỷ lệ đáng kể dân số trên sáu mươi tuổi." },
        { english: "Only a tiny minority of students are against the change.", vietnamese: "Chỉ một thiểu số rất nhỏ sinh viên phản đối sự thay đổi." },
      ],
      mistake: {
        wrong: "The most of people agree with the reform.", right: "Most people agree with the reform.",
        why: { english: "Say most people or the majority of people.", vietnamese: "Hãy nói most people hoặc the majority of people." },
      },
    }, {
      title: "Few vs a few, deal vs number",
      pattern: "a few / a little = some (positive) · few / little = almost none (negative) · a great deal of + uncountable · a large number of + plural",
      explanation: {
        english: "A few and a little are positive: A few people came, so it wasn't empty. Few and little are negative, close to hardly any: Few people came, so it was nearly empty. A great deal of goes with uncountable nouns (a great deal of money). With plural nouns use a large number of (a large number of problems).",
        vietnamese: "A few và a little mang nghĩa tích cực: A few people came, so it wasn't empty. Few và little mang nghĩa tiêu cực, gần với hardly any: Few people came, so it was nearly empty. A great deal of đi với danh từ không đếm được (a great deal of money). Với danh từ số nhiều dùng a large number of (a large number of problems).",
      },
      examples: [
        { english: "Few young people want to stay in the countryside.", vietnamese: "Rất ít người trẻ muốn ở lại nông thôn." },
        { english: "The policy has caused a large number of problems.", vietnamese: "Chính sách đã gây ra rất nhiều vấn đề." },
      ],
      mistake: {
        wrong: "The plan created a great deal of problems.", right: "The plan created a large number of problems.",
        why: { english: "A great deal of is for uncountable nouns.", vietnamese: "A great deal of dùng cho danh từ không đếm được." },
      },
    }],
    examples: [
      { english: "Virtually all of the shops have closed.", vietnamese: "Hầu như tất cả cửa hàng đã đóng cửa." },
      { english: "Only a handful of people turned up to the meeting.", vietnamese: "Chỉ một vài người đến dự cuộc họp." },
      { english: "The new homes cost a fraction of the old price.", vietnamese: "Những ngôi nhà mới có giá chỉ bằng một phần nhỏ giá cũ." },
      { english: "There is hardly any public transport after midnight.", vietnamese: "Hầu như không có phương tiện công cộng sau nửa đêm." },
    ],
    dialogue: [
      { speaker: "Researcher", english: "Here are the survey results on remote working.", vietnamese: "Đây là kết quả khảo sát về làm việc từ xa." },
      { speaker: "Manager", english: "What do most staff think?", vietnamese: "Phần lớn nhân viên nghĩ gì?" },
      { speaker: "Researcher", english: "The vast majority want to work from home at least twice a week.", vietnamese: "Đại đa số muốn làm việc tại nhà ít nhất hai lần một tuần." },
      { speaker: "Manager", english: "And those who don't?", vietnamese: "Còn những người không muốn?" },
      { speaker: "Researcher", english: "Only a tiny minority. A handful said they feel lonely.", vietnamese: "Chỉ một thiểu số rất nhỏ. Một vài người nói họ thấy cô đơn." },
      { speaker: "Manager", english: "So very few want to come back full-time. That will save a great deal of money.", vietnamese: "Vậy là rất ít người muốn quay lại làm toàn thời gian. Điều đó sẽ tiết kiệm được rất nhiều tiền." },
    ],
    practice: [
      q("Complete: ___ people agree with you.", ["Most", "The most of", "Most of", "The most"], "Most", "Most people."),
      q("Complete: There's ___ any milk left. Just a drop.", ["hardly", "few", "a little", "a handful"], "hardly", "Hardly any."),
      q("Complete: It caused a great deal of ___.", ["damage", "problems", "accidents", "cars"], "damage", "Uncountable noun."),
      q("“Đại đa số” in English is…", ["the vast majority", "the big minority", "the vast minority", "the large most"], "the vast majority", "The vast majority."),
    ],
    challenge: [
      q("Few people came. The room was…", ["nearly empty", "quite full", "very crowded", "completely full"], "nearly empty", "Few = almost none."),
      q("Complete: Only a ___ of students failed.", ["handful", "handle", "hand", "fistful of"], "handful", "A handful of."),
      q("Complete: A large ___ of complaints were received.", ["number", "deal", "amount", "much"], "number", "A large number of + plural."),
      q("Complete: She earns a ___ of what he earns.", ["fraction", "fragment", "friction", "faction"], "fraction", "A fraction of."),
      q("What does “virtually” mean here?", ["almost completely", "online", "never", "slightly"], "almost completely", "Virtually = almost."),
    ],
  }, {
    key: "persuasion", title: "Surely You'd Agree?", titleVi: "Nghệ thuật thuyết phục",
    objectives: [
      "I can persuade an audience in a speech or debate.",
      "Use rhetorical questions and surely to invite agreement",
      "Use the rule of three and direct appeals: imagine, let's be honest",
    ],
    vocabulary: [
      { word: "rhetorical question", ipa: "/rɪˌtɒrɪkl ˈkwestʃən/", partOfSpeech: "collocation", vietnamese: "câu hỏi tu từ", definition: "a question asked for effect, not for an answer", example: { english: "“Who wants to pay more tax?” is a rhetorical question.", vietnamese: "“Ai muốn đóng thuế nhiều hơn?” là một câu hỏi tu từ." } },
      { word: "surely", ipa: "/ˈʃʊəli/", partOfSpeech: "adverb", vietnamese: "chắc chắn là (để thuyết phục)", definition: "used to say you expect agreement or are surprised", example: { english: "Surely we can do better than this?", vietnamese: "Chắc chắn chúng ta có thể làm tốt hơn thế này chứ?" } },
      { word: "compelling", ipa: "/kəmˈpelɪŋ/", partOfSpeech: "adjective", vietnamese: "thuyết phục, hấp dẫn", definition: "so strong that you must accept it", example: { english: "She made a compelling case for change.", vietnamese: "Cô ấy đưa ra lập luận thuyết phục cho sự thay đổi." } },
      { word: "appeal to", ipa: "/əˈpiːl tə/", partOfSpeech: "phrasal verb", vietnamese: "kêu gọi, tác động đến", definition: "to try to persuade using people's feelings or reason", example: { english: "The speech appealed to people's sense of fairness.", vietnamese: "Bài phát biểu tác động đến ý thức công bằng của mọi người." } },
      { word: "convince", ipa: "/kənˈvɪns/", partOfSpeech: "verb", vietnamese: "thuyết phục", definition: "to make someone believe something is true", example: { english: "He convinced me that the plan would work.", vietnamese: "Anh ấy đã thuyết phục tôi rằng kế hoạch sẽ thành công." } },
      { word: "let's face it", ipa: "/ˌlets ˈfeɪs ɪt/", partOfSpeech: "idiom", vietnamese: "thẳng thắn mà nói", definition: "used before saying an unpleasant truth", example: { english: "Let's face it: the system isn't working.", vietnamese: "Thẳng thắn mà nói: hệ thống không hoạt động." } },
      { word: "audience", ipa: "/ˈɔːdiəns/", partOfSpeech: "noun", vietnamese: "khán giả, người nghe", definition: "the people listening to a speech or watching a show", example: { english: "Know your audience before you speak.", vietnamese: "Hãy hiểu người nghe trước khi phát biểu." } },
      { word: "call to action", ipa: "/ˌkɔːl tʊ ˈækʃn/", partOfSpeech: "collocation", vietnamese: "lời kêu gọi hành động", definition: "a final request for the audience to do something", example: { english: "End your speech with a clear call to action.", vietnamese: "Hãy kết thúc bài phát biểu bằng một lời kêu gọi hành động rõ ràng." } },
    ],
    grammar: [{
      title: "Rhetorical questions and surely",
      pattern: "Isn't it time we…? · Who wouldn't want…? · Surely + statement? (= I expect you agree)",
      explanation: {
        english: "A rhetorical question makes the audience think the answer for themselves: Isn't it time we acted? Who among us wants dirtier air? Surely at the start of a statement asks for agreement: Surely nobody believes this is fair? Note that surely is not the same as certainly; it shows you expect agreement or are surprised.",
        vietnamese: "Câu hỏi tu từ khiến người nghe tự nghĩ ra câu trả lời: Isn't it time we acted? Who among us wants dirtier air? Surely ở đầu câu khẳng định là để kêu gọi sự đồng tình: Surely nobody believes this is fair? Lưu ý surely không giống certainly; nó cho thấy bạn mong người nghe đồng ý hoặc bạn ngạc nhiên.",
      },
      examples: [
        { english: "Isn't it time we gave young people a real voice?", vietnamese: "Chẳng phải đã đến lúc cho người trẻ tiếng nói thực sự sao?" },
        { english: "Surely every child deserves a good school?", vietnamese: "Chắc chắn đứa trẻ nào cũng xứng đáng có một ngôi trường tốt chứ?" },
      ],
      mistake: {
        wrong: "Surely I will come to your party tomorrow.", right: "I'll certainly come to your party tomorrow.",
        why: { english: "For a simple promise, use certainly. Surely asks for agreement.", vietnamese: "Với lời hứa đơn giản, dùng certainly. Surely là để kêu gọi đồng tình." },
      },
    }, {
      title: "The rule of three and direct appeals",
      pattern: "three parallel items (cleaner, safer and fairer) · Imagine… · Let's be honest / Let's face it… · We must… (call to action)",
      explanation: {
        english: "Lists of three sound complete and memorable: We want cities that are cleaner, safer and fairer. Keep the three items in the same form. Speak directly to the audience: Imagine a city with no traffic. Let's be honest: the plan has failed. End with a call to action using we: We must act, and we must act now.",
        vietnamese: "Danh sách ba ý nghe trọn vẹn và dễ nhớ: We want cities that are cleaner, safer and fairer. Giữ ba ý ở cùng một dạng. Nói trực tiếp với người nghe: Imagine a city with no traffic. Let's be honest: the plan has failed. Kết thúc bằng lời kêu gọi hành động với we: We must act, and we must act now.",
      },
      examples: [
        { english: "Imagine a country where every worker is paid fairly.", vietnamese: "Hãy tưởng tượng một đất nước nơi mọi người lao động đều được trả lương công bằng." },
        { english: "This plan is cheaper, faster and greener.", vietnamese: "Kế hoạch này rẻ hơn, nhanh hơn và xanh hơn." },
      ],
      mistake: {
        wrong: "Our plan is cheaper, faster and it protects the environment more.", right: "Our plan is cheaper, faster and greener.",
        why: { english: "Keep the three items in the same form.", vietnamese: "Giữ ba ý ở cùng một dạng." },
      },
    }],
    examples: [
      { english: "Let's face it: the old system has let us down.", vietnamese: "Thẳng thắn mà nói: hệ thống cũ đã làm chúng ta thất vọng." },
      { english: "Her argument was compelling, and it convinced the audience.", vietnamese: "Lập luận của cô ấy rất thuyết phục, và nó đã thuyết phục được khán giả." },
      { english: "The speech appealed to both reason and emotion.", vietnamese: "Bài phát biểu tác động đến cả lý trí lẫn cảm xúc." },
      { english: "A rhetorical question can be a powerful opening.", vietnamese: "Một câu hỏi tu từ có thể là cách mở đầu mạnh mẽ." },
    ],
    dialogue: [
      { speaker: "Coach", english: "Read me the opening of your debate speech.", vietnamese: "Đọc cho tôi nghe phần mở đầu bài tranh biện của em." },
      { speaker: "Linh", english: "“Who wouldn't want cleaner air? Surely we all do?”", vietnamese: "“Ai lại không muốn không khí sạch hơn? Chắc chắn tất cả chúng ta đều muốn chứ?”" },
      { speaker: "Coach", english: "Good, two rhetorical questions. Now appeal to the audience directly.", vietnamese: "Tốt, hai câu hỏi tu từ. Giờ hãy nói trực tiếp với người nghe." },
      { speaker: "Linh", english: "“Imagine a city that is quieter, greener and healthier.”", vietnamese: "“Hãy tưởng tượng một thành phố yên tĩnh hơn, xanh hơn và khoẻ mạnh hơn.”" },
      { speaker: "Coach", english: "The rule of three. Very compelling. How do you end?", vietnamese: "Quy tắc ba. Rất thuyết phục. Em kết thúc thế nào?" },
      { speaker: "Linh", english: "With a call to action: “Let's face it: we must act, and we must act now.”", vietnamese: "Bằng lời kêu gọi hành động: “Thẳng thắn mà nói: chúng ta phải hành động, và phải hành động ngay.”" },
    ],
    practice: [
      q("Which is a rhetorical question?", ["Who wants to breathe dirty air?", "What time is it?", "Where is the station?", "How old are you?"], "Who wants to breathe dirty air?", "Asked for effect."),
      q("Complete: ___ you don't believe that?", ["Surely", "Certainly", "Sure", "Surety"], "Surely", "Surely = I expect agreement."),
      q("Choose the best rule-of-three list.", ["faster, cheaper and safer", "faster, cheaper and it is safe", "fast, cheaper and more safety", "faster, cheap and safety"], "faster, cheaper and safer", "Same form."),
      q("“Thuyết phục” (verb) in English is…", ["convince", "convict", "conceive", "convene"], "convince", "Convince."),
    ],
    challenge: [
      q("Complete: Let's ___ it: the plan has failed.", ["face", "look", "see", "meet"], "face", "Let's face it."),
      q("Complete: She made a ___ case for reform.", ["compelling", "compelled", "compulsory", "competing"], "compelling", "Compelling."),
      q("What should a speech end with?", ["a call to action", "a rhetorical apology", "a long list", "a joke only"], "a call to action", "Call to action."),
      q("Complete: The advert appeals ___ our emotions.", ["to", "for", "at", "on"], "to", "Appeal to."),
      q("Which sentence uses “surely” correctly?", ["Surely nobody thinks this is fair?", "Surely I will help you tomorrow.", "I surely am Vietnamese.", "Surely is it raining?"], "Surely nobody thinks this is fair?", "Surely asks for agreement."),
    ],
  }, {
    key: "social-issues", title: "Bridging the Gap", titleVi: "Các vấn đề xã hội",
    objectives: [
      "I can discuss social problems and solutions.",
      "Use social-issue vocabulary with the right word form: inequality, unequal, marginalised",
      "Use cause-and-solution phrases: stem from, tackle, bridge the gap",
    ],
    vocabulary: [
      { word: "inequality", ipa: "/ˌɪnɪˈkwɒləti/", partOfSpeech: "noun", vietnamese: "sự bất bình đẳng", definition: "an unfair difference between groups", example: { english: "Income inequality is growing.", vietnamese: "Bất bình đẳng thu nhập đang gia tăng." } },
      { word: "marginalised", ipa: "/ˈmɑːdʒɪnəlaɪzd/", partOfSpeech: "adjective", vietnamese: "bị gạt ra bên lề", definition: "treated as unimportant and without power", example: { english: "Marginalised groups are often ignored.", vietnamese: "Các nhóm bị gạt ra bên lề thường bị phớt lờ." } },
      { word: "bridge the gap", ipa: "/ˌbrɪdʒ ðə ˈɡæp/", partOfSpeech: "idiom", vietnamese: "thu hẹp khoảng cách", definition: "to reduce the difference between two groups or things", example: { english: "Free schools help bridge the gap between rich and poor.", vietnamese: "Trường miễn phí giúp thu hẹp khoảng cách giàu nghèo." } },
      { word: "tackle", ipa: "/ˈtækl/", partOfSpeech: "verb", vietnamese: "giải quyết, xử lý", definition: "to deal with a difficult problem", example: { english: "The government must tackle homelessness.", vietnamese: "Chính phủ phải giải quyết tình trạng vô gia cư." } },
      { word: "stem from", ipa: "/ˈstem frəm/", partOfSpeech: "phrasal verb", vietnamese: "bắt nguồn từ", definition: "to be caused by", example: { english: "Many problems stem from poverty.", vietnamese: "Nhiều vấn đề bắt nguồn từ nghèo đói." } },
      { word: "homelessness", ipa: "/ˈhəʊmləsnəs/", partOfSpeech: "noun", vietnamese: "tình trạng vô gia cư", definition: "the state of having no home", example: { english: "Homelessness has risen sharply.", vietnamese: "Tình trạng vô gia cư đã tăng mạnh." } },
      { word: "discrimination", ipa: "/dɪˌskrɪmɪˈneɪʃn/", partOfSpeech: "noun", vietnamese: "sự phân biệt đối xử", definition: "treating people unfairly because of who they are", example: { english: "Discrimination at work is illegal.", vietnamese: "Phân biệt đối xử nơi làm việc là bất hợp pháp." } },
      { word: "deprived", ipa: "/dɪˈpraɪvd/", partOfSpeech: "adjective", vietnamese: "thiếu thốn, nghèo khó", definition: "without enough money, food or opportunities", example: { english: "She grew up in a deprived area.", vietnamese: "Cô ấy lớn lên ở một khu vực nghèo khó." } },
    ],
    grammar: [{
      title: "Word forms for social issues",
      pattern: "noun: inequality / poverty / discrimination · adjective: unequal / poor / discriminatory · verb: discriminate against",
      explanation: {
        english: "Choose the right word form. Nouns are subjects and objects: Inequality is rising. Adjectives describe: an unequal society. Verbs need a tense: Employers must not discriminate against older workers. Note the preposition: discriminate against someone, and discrimination against someone.",
        vietnamese: "Hãy chọn đúng dạng từ. Danh từ làm chủ ngữ và tân ngữ: Inequality is rising. Tính từ để miêu tả: an unequal society. Động từ cần chia thì: Employers must not discriminate against older workers. Lưu ý giới từ: discriminate against someone, và discrimination against someone.",
      },
      examples: [
        { english: "Poverty is the root of many social problems.", vietnamese: "Nghèo đói là gốc rễ của nhiều vấn đề xã hội." },
        { english: "It is illegal to discriminate against people because of their age.", vietnamese: "Phân biệt đối xử với ai đó vì tuổi tác là bất hợp pháp." },
      ],
      mistake: {
        wrong: "The inequality is increase in our country.", right: "Inequality is increasing in our country.",
        why: { english: "Use the verb form and no the before a general noun.", vietnamese: "Dùng đúng dạng động từ và không dùng the trước danh từ chung." },
      },
    }, {
      title: "Causes and solutions",
      pattern: "X stems from / is rooted in Y · tackle / address + problem · bridge the gap between A and B",
      explanation: {
        english: "To discuss causes, say a problem stems from or is rooted in something: Crime often stems from a lack of opportunities. To discuss solutions, use tackle or address + the problem: We need to tackle homelessness. Bridge the gap between A and B means reduce the difference.",
        vietnamese: "Để bàn về nguyên nhân, nói vấn đề stems from hoặc is rooted in điều gì đó: Crime often stems from a lack of opportunities. Để bàn về giải pháp, dùng tackle hoặc address + vấn đề: We need to tackle homelessness. Bridge the gap between A and B nghĩa là thu hẹp khác biệt.",
      },
      examples: [
        { english: "Much of the anger is rooted in unemployment.", vietnamese: "Phần lớn sự giận dữ bắt nguồn từ thất nghiệp." },
        { english: "Training schemes can bridge the gap between school and work.", vietnamese: "Các chương trình đào tạo có thể thu hẹp khoảng cách giữa trường học và công việc." },
      ],
      mistake: {
        wrong: "The problem stems on poverty.", right: "The problem stems from poverty.",
        why: { english: "The phrasal verb is stem from.", vietnamese: "Cụm động từ là stem from." },
      },
    }],
    examples: [
      { english: "Children in deprived areas often leave school early.", vietnamese: "Trẻ em ở khu vực nghèo khó thường bỏ học sớm." },
      { english: "Marginalised communities need a stronger voice.", vietnamese: "Các cộng đồng bị gạt ra bên lề cần tiếng nói mạnh mẽ hơn." },
      { english: "The charity works to tackle homelessness.", vietnamese: "Tổ chức từ thiện hoạt động để giải quyết tình trạng vô gia cư." },
      { english: "Discrimination stems from fear and ignorance.", vietnamese: "Sự phân biệt đối xử bắt nguồn từ nỗi sợ và sự thiếu hiểu biết." },
    ],
    dialogue: [
      { speaker: "Host", english: "Today we're discussing inequality in our cities.", vietnamese: "Hôm nay chúng ta bàn về bất bình đẳng ở các thành phố." },
      { speaker: "Ms Patel", english: "The gap between rich and poor areas is widening.", vietnamese: "Khoảng cách giữa khu giàu và khu nghèo đang ngày càng lớn." },
      { speaker: "Host", english: "Where does the problem stem from?", vietnamese: "Vấn đề bắt nguồn từ đâu?" },
      { speaker: "Ms Patel", english: "Mostly from education. Children in deprived areas have fewer chances.", vietnamese: "Chủ yếu từ giáo dục. Trẻ em ở khu vực nghèo khó có ít cơ hội hơn." },
      { speaker: "Host", english: "How can we tackle it?", vietnamese: "Chúng ta có thể giải quyết nó thế nào?" },
      { speaker: "Ms Patel", english: "By investing in schools and fighting discrimination. That's how we bridge the gap.", vietnamese: "Bằng cách đầu tư vào trường học và chống phân biệt đối xử. Đó là cách chúng ta thu hẹp khoảng cách." },
    ],
    practice: [
      q("Complete: ___ is rising in many countries.", ["Inequality", "Unequal", "The unequally", "Inequal"], "Inequality", "Noun as subject."),
      q("Complete: Many problems stem ___ poverty.", ["from", "on", "of", "with"], "from", "Stem from."),
      q("Complete: We must ___ homelessness.", ["tackle", "tickle", "tackling", "tack"], "tackle", "Tackle a problem."),
      q("“Phân biệt đối xử” in English is…", ["discrimination", "distribution", "discretion", "disruption"], "discrimination", "Discrimination."),
    ],
    challenge: [
      q("Complete: Employers must not discriminate ___ women.", ["against", "to", "with", "for"], "against", "Discriminate against."),
      q("Complete: Education can ___ the gap between rich and poor.", ["bridge", "build", "close up", "cross"], "bridge", "Bridge the gap."),
      q("Which word means “treated as unimportant and without power”?", ["marginalised", "magnified", "maximised", "materialised"], "marginalised", "Marginalised."),
      q("Choose the correct sentence.", ["Poverty is increasing in rural areas.", "The poverty is increase in rural areas.", "Poor is increasing in rural areas.", "Poverty increase in rural areas."], "Poverty is increasing in rural areas.", "Noun + correct verb form."),
      q("What does “deprived” mean?", ["without enough money or opportunities", "very rich", "well educated", "crowded"], "without enough money or opportunities", "Deprived."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 5", isReview: true,
    objectives: [
      "I can discuss social change formally and persuasively.",
      "Check inverted conditionals, be / get used to, quantifiers, persuasion and social-issue words",
    ],
    vocabulary: [
      { word: "turning point", ipa: "/ˈtɜːnɪŋ pɔɪnt/", partOfSpeech: "noun", vietnamese: "bước ngoặt", definition: "a time when an important change happens", example: { english: "Moving abroad was a turning point for me.", vietnamese: "Ra nước ngoài là một bước ngoặt với tôi." } },
      { word: "adapt", ipa: "/əˈdæpt/", partOfSpeech: "verb", vietnamese: "thích nghi", definition: "to change to suit a new situation", example: { english: "Businesses must adapt or close.", vietnamese: "Doanh nghiệp phải thích nghi hoặc đóng cửa." } },
      { word: "the vast majority", ipa: "/ðə ˌvɑːst məˈdʒɒrəti/", partOfSpeech: "collocation", vietnamese: "phần lớn, đại đa số", definition: "almost all of a group", example: { english: "The vast majority voted yes.", vietnamese: "Đại đa số bỏ phiếu đồng ý." } },
      { word: "compelling", ipa: "/kəmˈpelɪŋ/", partOfSpeech: "adjective", vietnamese: "thuyết phục, hấp dẫn", definition: "so strong that you must accept it", example: { english: "The evidence is compelling.", vietnamese: "Bằng chứng rất thuyết phục." } },
      { word: "inequality", ipa: "/ˌɪnɪˈkwɒləti/", partOfSpeech: "noun", vietnamese: "sự bất bình đẳng", definition: "an unfair difference between groups", example: { english: "Gender inequality still exists.", vietnamese: "Bất bình đẳng giới vẫn còn tồn tại." } },
      { word: "tackle", ipa: "/ˈtækl/", partOfSpeech: "verb", vietnamese: "giải quyết, xử lý", definition: "to deal with a difficult problem", example: { english: "We need to tackle the causes, not the symptoms.", vietnamese: "Chúng ta cần giải quyết nguyên nhân, không phải triệu chứng." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "Had I known / Were it not for / Should you need · used to live / I'm used to living · most people / few vs a few · Surely…? / cleaner, safer and fairer · inequality is rising / stem from",
      explanation: {
        english: "Check these: when you invert a conditional, drop if and put not after the subject; used to + verb is a finished habit, but be and get used to take -ing; say most people, not the most of, and remember few means almost none; surely asks for agreement, and a list of three keeps the same form; use the right word form for social issues, and the right preposition in stem from and discriminate against.",
        vietnamese: "Hãy kiểm tra: khi đảo ngữ câu điều kiện, bỏ if và đặt not sau chủ ngữ; used to + động từ là thói quen đã chấm dứt, còn be và get used to đi với -ing; nói most people, không nói the most of, và nhớ few nghĩa là gần như không có; surely là để kêu gọi đồng tình, và danh sách ba ý giữ cùng một dạng; dùng đúng dạng từ cho các vấn đề xã hội, và đúng giới từ trong stem from và discriminate against.",
      },
      examples: [
        { english: "Had we tackled inequality sooner, fewer people would be struggling.", vietnamese: "Nếu chúng ta giải quyết bất bình đẳng sớm hơn, sẽ ít người chật vật hơn." },
        { english: "Most people are now used to paying by phone.", vietnamese: "Hầu hết mọi người giờ đã quen thanh toán bằng điện thoại." },
      ],
    }],
    examples: [
      { english: "The vast majority have adapted to the changes.", vietnamese: "Đại đa số đã thích nghi với những thay đổi." },
      { english: "Were it not for that turning point, we'd still be waiting.", vietnamese: "Nếu không có bước ngoặt đó, chúng ta vẫn còn đang chờ đợi." },
      { english: "She made a compelling argument for tackling inequality.", vietnamese: "Cô ấy đưa ra lập luận thuyết phục cho việc giải quyết bất bình đẳng." },
    ],
    dialogue: [
      { speaker: "Student", english: "Was the new law a turning point?", vietnamese: "Đạo luật mới có phải là một bước ngoặt không?" },
      { speaker: "Professor", english: "Definitely. Had it not passed, inequality would be far worse.", vietnamese: "Chắc chắn. Nếu nó không được thông qua, bất bình đẳng sẽ tệ hơn nhiều." },
      { speaker: "Student", english: "Did people adapt quickly?", vietnamese: "Mọi người có thích nghi nhanh không?" },
      { speaker: "Professor", english: "The vast majority did. Few people complain about it now.", vietnamese: "Đại đa số là có. Giờ rất ít người phàn nàn về nó." },
      { speaker: "Student", english: "So people got used to it.", vietnamese: "Vậy là mọi người đã quen với nó." },
      { speaker: "Professor", english: "Yes. Surely that shows how compelling the case for it was?", vietnamese: "Đúng vậy. Chắc chắn điều đó cho thấy lý lẽ ủng hộ nó thuyết phục đến mức nào chứ?" },
      { speaker: "Professor", english: "But we must keep tackling the causes, not just the symptoms.", vietnamese: "Nhưng chúng ta phải tiếp tục giải quyết nguyên nhân, không chỉ triệu chứng." },
    ],
    practice: [
      q("Complete: ___ I known, I'd have helped.", ["Had", "If had", "Should", "Were"], "Had", "Had I known."),
      q("Complete: I'm not used to ___ so early.", ["waking up", "wake up", "woke up", "be woken"], "waking up", "Be used to + -ing."),
      q("Complete: ___ people own a phone.", ["Most", "The most of", "The most", "Most of"], "Most", "Most people."),
      q("Complete: The problem stems ___ a lack of money.", ["from", "of", "on", "at"], "from", "Stem from."),
    ],
    challenge: [
      q("Complete: ___ you need help, call this number.", ["Should", "Would", "Had", "Were"], "Should", "Should you need."),
      q("Few students passed. The results were…", ["poor", "excellent", "average", "perfect"], "poor", "Few = almost none."),
      q("Complete: ___ nobody believes that?", ["Surely", "Certainly", "Sure", "Securely"], "Surely", "Surely asks for agreement."),
      q("Complete: I ___ live in Hanoi, but I moved.", ["used to", "am used to", "got used to", "use to"], "used to", "Past habit."),
      q("Complete: It's wrong to discriminate ___ anyone.", ["against", "to", "for", "with"], "against", "Discriminate against."),
    ],
  }],
  assessment: [
    { id: "had-i-known", prompt: "“Nếu tôi biết, tôi đã đến.” (formal) in English is…", options: ["Had I known, I would have come.", "If had I known, I would have come.", "Have I known, I would come.", "Had I knew, I would have come."], correct: "Had I known, I would have come.", explanation: "Had + subject + past participle." },
    { id: "were-it-not", prompt: "Complete: ___ it not for her, we'd be lost.", options: ["Were", "Was", "Had", "If"], correct: "Were", explanation: "Were it not for." },
    { id: "should-you", prompt: "Complete: ___ you have any questions, ask me.", options: ["Should", "Would", "Had", "Did"], correct: "Should", explanation: "Should you have." },
    { id: "but-for", prompt: "Complete: ___ for the traffic, we'd have arrived on time.", options: ["But", "Unless", "Without", "Except"], correct: "But", explanation: "But for + noun." },
    { id: "provided-that", prompt: "Complete: You can borrow it provided that you ___ it back.", options: ["bring", "will bring", "would bring", "brought"], correct: "bring", explanation: "Present simple after provided that." },
    { id: "used-to-habit", prompt: "Complete: We ___ live in the countryside.", options: ["used to", "are used to", "get used to", "use to"], correct: "used to", explanation: "Finished past habit." },
    { id: "be-used-to", prompt: "Complete: I'm used to ___ on the left.", options: ["driving", "drive", "drove", "be driving"], correct: "driving", explanation: "Be used to + -ing." },
    { id: "get-used-to", prompt: "Complete: She's getting used ___ the cold.", options: ["to", "with", "at", "for"], correct: "to", explanation: "Get used to." },
    { id: "most-people", prompt: "Choose the correct sentence.", options: ["Most people agree.", "The most of people agree.", "The most people agree.", "Most of people agree."], correct: "Most people agree.", explanation: "Most people." },
    { id: "few-vs-a-few", prompt: "“Few people came” means…", options: ["almost nobody came", "quite a lot came", "everyone came", "some came, it was fine"], correct: "almost nobody came", explanation: "Few = almost none." },
    { id: "great-deal", prompt: "Complete: It caused a great deal of ___.", options: ["stress", "problems", "people", "mistakes"], correct: "stress", explanation: "A great deal of + uncountable." },
    { id: "surely", prompt: "Complete: ___ you don't agree with him?", options: ["Surely", "Certainly", "Sure", "Securely"], correct: "Surely", explanation: "Surely asks for agreement." },
    { id: "rule-of-three", prompt: "Choose the best rule-of-three list.", options: ["safer, cleaner and greener", "safer, cleaner and it is green", "safe, cleaner and more green", "safety, clean and greener"], correct: "safer, cleaner and greener", explanation: "Same form." },
    { id: "stem-from", prompt: "Complete: Crime often stems ___ poverty.", options: ["from", "on", "of", "with"], correct: "from", explanation: "Stem from." },
    { id: "bridge-gap", prompt: "“Thu hẹp khoảng cách” in English is…", options: ["bridge the gap", "build the gap", "cross the gap", "open the gap"], correct: "bridge the gap", explanation: "Bridge the gap." },
  ],
};
