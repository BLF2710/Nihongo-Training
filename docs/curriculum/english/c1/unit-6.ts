// C1 Unit 6: Mastering Style. Advanced Vietnamese speakers often say "very exhausted" or "absolutely tired"; place
// only and even where Vietnamese would put them, changing the meaning ("I only asked one question" vs "Only I asked");
// pick a euphemism in the wrong register ("My grandfather kicked the bucket" in a formal letter); copy the source when
// paraphrasing instead of changing words and structure; and use I, you and contractions in academic essays. This unit
// puts those right so learners can control tone and style.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "C1",
  number: 6,
  lessons: [{
    key: "euphemism", title: "Passed Away or Died?", titleVi: "Uyển ngữ và văn phong",
    objectives: [
      "I can talk about sensitive topics politely.",
      "Use common euphemisms: pass away, let go, between jobs, senior citizens",
      "Match a word to its register: formal, neutral or informal",
    ],
    vocabulary: [
      { word: "pass away", ipa: "/ˌpɑːs əˈweɪ/", partOfSpeech: "phrasal verb", vietnamese: "qua đời", definition: "to die (polite)", example: { english: "Her grandfather passed away last year.", vietnamese: "Ông của cô ấy qua đời năm ngoái." } },
      { word: "let go", ipa: "/ˌlet ˈɡəʊ/", partOfSpeech: "phrase", vietnamese: "cho nghỉ việc", definition: "to dismiss someone from a job (polite)", example: { english: "Fifty staff were let go in March.", vietnamese: "Năm mươi nhân viên bị cho nghỉ việc vào tháng Ba." } },
      { word: "between jobs", ipa: "/bɪˌtwiːn ˈdʒɒbz/", partOfSpeech: "phrase", vietnamese: "đang tìm việc mới", definition: "unemployed (polite)", example: { english: "He's between jobs at the moment.", vietnamese: "Hiện anh ấy đang tìm việc mới." } },
      { word: "senior citizen", ipa: "/ˌsiːniə ˈsɪtɪzn/", partOfSpeech: "noun", vietnamese: "người cao tuổi", definition: "an old person (polite)", example: { english: "Senior citizens travel free on buses.", vietnamese: "Người cao tuổi đi xe buýt miễn phí." } },
      { word: "economical with the truth", ipa: "/ˌiːkəˈnɒmɪkl wɪð ðə ˈtruːθ/", partOfSpeech: "idiom", vietnamese: "nói không thật lòng, giấu bớt sự thật", definition: "not telling the whole truth (polite for lying)", example: { english: "The minister was economical with the truth.", vietnamese: "Ông bộ trưởng đã giấu bớt sự thật." } },
      { word: "register", ipa: "/ˈredʒɪstə/", partOfSpeech: "noun", vietnamese: "văn phong, sắc thái ngôn ngữ", definition: "the level of formality of language", example: { english: "Choose a formal register for a cover letter.", vietnamese: "Hãy chọn văn phong trang trọng cho thư xin việc." } },
      { word: "sensitive", ipa: "/ˈsensətɪv/", partOfSpeech: "adjective", vietnamese: "nhạy cảm", definition: "needing to be dealt with carefully so people are not upset", example: { english: "Money is a sensitive subject for many families.", vietnamese: "Tiền bạc là chủ đề nhạy cảm với nhiều gia đình." } },
      { word: "blunt", ipa: "/blʌnt/", partOfSpeech: "adjective", vietnamese: "thẳng thừng", definition: "saying exactly what you think without trying to be polite", example: { english: "Sorry to be blunt, but your essay is too long.", vietnamese: "Xin lỗi vì nói thẳng, nhưng bài luận của bạn quá dài." } },
    ],
    grammar: [{
      title: "Euphemisms",
      pattern: "blunt word → polite euphemism: die → pass away · sack → let go · unemployed → between jobs · old → elderly / senior",
      explanation: {
        english: "A euphemism is a gentler word for something unpleasant. Use them when the topic is sensitive or the listener may be upset: I'm sorry to hear your father passed away. In factual or scientific writing, however, the plain word is clearer: Ten people died in the accident. Too many euphemisms can sound dishonest.",
        vietnamese: "Uyển ngữ là từ nhẹ nhàng hơn cho điều không dễ chịu. Dùng khi chủ đề nhạy cảm hoặc người nghe có thể buồn: I'm sorry to hear your father passed away. Tuy nhiên, trong văn bản thông tin hoặc khoa học, từ thông thường rõ ràng hơn: Ten people died in the accident. Quá nhiều uyển ngữ có thể nghe thiếu trung thực.",
      },
      examples: [
        { english: "The company let go of two hundred workers.", vietnamese: "Công ty đã cho hai trăm công nhân nghỉ việc." },
        { english: "The centre offers free classes for senior citizens.", vietnamese: "Trung tâm có lớp học miễn phí cho người cao tuổi." },
      ],
      mistake: {
        wrong: "I was so sorry to hear that your mother kicked the bucket.", right: "I was so sorry to hear that your mother passed away.",
        why: { english: "Kick the bucket is a joking idiom; use pass away for condolences.", vietnamese: "Kick the bucket là thành ngữ đùa cợt; dùng pass away khi chia buồn." },
      },
    }, {
      title: "Register",
      pattern: "formal (purchase, request, assist) · neutral (buy, ask, help) · informal (grab, pick up, give a hand)",
      explanation: {
        english: "English often has three words for one idea. Formal: We would like to request your assistance. Neutral: Can you help us? Informal: Can you give us a hand? Keep one register in a text. Mixing formal and informal words, such as Dear Sir, can you give me a hand, sounds odd.",
        vietnamese: "Tiếng Anh thường có ba từ cho một ý. Trang trọng: We would like to request your assistance. Trung tính: Can you help us? Thân mật: Can you give us a hand? Giữ một văn phong trong một văn bản. Trộn từ trang trọng và thân mật, như Dear Sir, can you give me a hand, nghe rất kỳ.",
      },
      examples: [
        { english: "Customers may purchase tickets online.", vietnamese: "Khách hàng có thể mua vé trực tuyến." },
        { english: "I'll grab some coffee on the way.", vietnamese: "Mình sẽ tạt mua cà phê trên đường." },
      ],
      mistake: {
        wrong: "Dear Sir, I wanna ask about the job.", right: "Dear Sir, I would like to enquire about the position.",
        why: { english: "A formal letter needs formal words throughout.", vietnamese: "Thư trang trọng cần từ ngữ trang trọng xuyên suốt." },
      },
    }],
    examples: [
      { english: "Death is a sensitive topic, so choose your words carefully.", vietnamese: "Cái chết là chủ đề nhạy cảm, nên hãy chọn từ cẩn thận." },
      { english: "He was being economical with the truth about the accident.", vietnamese: "Anh ta đã giấu bớt sự thật về vụ tai nạn." },
      { english: "My friend is between jobs and looking for work.", vietnamese: "Bạn tôi đang tìm việc mới." },
      { english: "She can be blunt, but she's always honest.", vietnamese: "Cô ấy có thể thẳng thừng, nhưng luôn trung thực." },
    ],
    dialogue: [
      { speaker: "Manager", english: "I need to tell the team about the job cuts. Any advice?", vietnamese: "Tôi cần báo cho nhóm về việc cắt giảm nhân sự. Có lời khuyên nào không?" },
      { speaker: "HR officer", english: "It's sensitive. Don't be too blunt.", vietnamese: "Chuyện này nhạy cảm. Đừng quá thẳng thừng." },
      { speaker: "Manager", english: "So I shouldn't say “ten people are being sacked”?", vietnamese: "Vậy tôi không nên nói “mười người sắp bị đuổi việc”?" },
      { speaker: "HR officer", english: "Better to say ten roles are being cut and some staff will be let go.", vietnamese: "Tốt hơn là nói mười vị trí bị cắt giảm và một số nhân viên sẽ được cho nghỉ việc." },
      { speaker: "Manager", english: "But I don't want to be economical with the truth.", vietnamese: "Nhưng tôi không muốn giấu bớt sự thật." },
      { speaker: "HR officer", english: "You won't be. Be honest, but choose a kind register.", vietnamese: "Anh sẽ không vậy đâu. Hãy trung thực, nhưng chọn văn phong tử tế." },
    ],
    practice: [
      q("A polite way to say “die” is…", ["pass away", "pass out", "pass by", "pass over to"], "pass away", "Pass away."),
      q("“He's between jobs” means he is…", ["unemployed", "very busy", "working two jobs", "retired"], "unemployed", "Polite for unemployed."),
      q("Which word is the most formal?", ["purchase", "buy", "grab", "pick up"], "purchase", "Formal register."),
      q("“Thẳng thừng” in English is…", ["blunt", "blind", "bland", "bold-faced"], "blunt", "Blunt."),
    ],
    challenge: [
      q("Choose the best sentence for a condolence card.", ["I'm so sorry your father passed away.", "I'm so sorry your father kicked the bucket.", "Sorry your dad croaked.", "I'm sorry your father was let go."], "I'm so sorry your father passed away.", "Pass away for condolences."),
      q("Complete: Twenty staff were ___ go.", ["let", "made", "sent", "got"], "let", "Let go."),
      q("What is “register”?", ["the level of formality of language", "a list of students only", "a cash machine", "a type of accent"], "the level of formality of language", "Register."),
      q("Complete: The politician was economical with the ___.", ["truth", "money", "time", "words"], "truth", "Economical with the truth."),
      q("Complete: Free travel is available for senior ___.", ["citizens", "people", "olds", "elders"], "citizens", "Senior citizens."),
    ],
  }, {
    key: "intensifiers", title: "Utterly Exhausted", titleVi: "Từ nhấn mạnh",
    objectives: [
      "I can make my descriptions stronger or softer accurately.",
      "Use very with gradable adjectives and absolutely with extreme ones",
      "Use strong collocating intensifiers: utterly, deeply, highly, bitterly",
    ],
    vocabulary: [
      { word: "exhausted", ipa: "/ɪɡˈzɔːstɪd/", partOfSpeech: "adjective", vietnamese: "kiệt sức", definition: "extremely tired", example: { english: "I was absolutely exhausted after the marathon.", vietnamese: "Tôi hoàn toàn kiệt sức sau cuộc chạy marathon." } },
      { word: "utterly", ipa: "/ˈʌtəli/", partOfSpeech: "adverb", vietnamese: "hoàn toàn, tuyệt đối", definition: "completely (usually with negative meanings)", example: { english: "The plan was utterly ridiculous.", vietnamese: "Kế hoạch hoàn toàn lố bịch." } },
      { word: "highly", ipa: "/ˈhaɪli/", partOfSpeech: "adverb", vietnamese: "rất, hết sức", definition: "very (with certain adjectives such as likely, unlikely, successful)", example: { english: "It's highly unlikely to rain today.", vietnamese: "Rất khó có khả năng hôm nay trời mưa." } },
      { word: "bitterly", ipa: "/ˈbɪtəli/", partOfSpeech: "adverb", vietnamese: "cay đắng, vô cùng", definition: "extremely (with disappointed, cold, regret)", example: { english: "The fans were bitterly disappointed.", vietnamese: "Người hâm mộ vô cùng thất vọng." } },
      { word: "furious", ipa: "/ˈfjʊəriəs/", partOfSpeech: "adjective", vietnamese: "giận dữ", definition: "extremely angry", example: { english: "She was absolutely furious about the delay.", vietnamese: "Cô ấy cực kỳ giận dữ vì sự chậm trễ." } },
      { word: "freezing", ipa: "/ˈfriːzɪŋ/", partOfSpeech: "adjective", vietnamese: "lạnh cóng", definition: "extremely cold", example: { english: "It's absolutely freezing outside.", vietnamese: "Bên ngoài lạnh cóng." } },
      { word: "fairly", ipa: "/ˈfeəli/", partOfSpeech: "adverb", vietnamese: "khá", definition: "to some degree, but not very", example: { english: "The test was fairly easy.", vietnamese: "Bài kiểm tra khá dễ." } },
      { word: "remarkably", ipa: "/rɪˈmɑːkəbli/", partOfSpeech: "adverb", vietnamese: "đáng chú ý, đặc biệt", definition: "unusually, in a way that surprises you", example: { english: "She stayed remarkably calm.", vietnamese: "Cô ấy giữ bình tĩnh một cách đáng chú ý." } },
    ],
    grammar: [{
      title: "Gradable and extreme adjectives",
      pattern: "very / extremely / fairly + gradable (tired, cold, angry) · absolutely / completely / utterly + extreme (exhausted, freezing, furious)",
      explanation: {
        english: "Gradable adjectives have degrees, so we use very, extremely or fairly: very tired, fairly cold. Extreme adjectives already mean very, so we use absolutely, completely or utterly: absolutely exhausted, completely furious. Don't say very exhausted or absolutely tired. Really works with both.",
        vietnamese: "Tính từ có mức độ có thể tăng giảm, nên dùng very, extremely hoặc fairly: very tired, fairly cold. Tính từ cực độ đã mang nghĩa rất, nên dùng absolutely, completely hoặc utterly: absolutely exhausted, completely furious. Đừng nói very exhausted hay absolutely tired. Really dùng được với cả hai.",
      },
      examples: [
        { english: "It was very cold in the morning and absolutely freezing at night.", vietnamese: "Buổi sáng rất lạnh và buổi tối thì lạnh cóng." },
        { english: "The film was fairly good, but the book is absolutely brilliant.", vietnamese: "Bộ phim khá hay, nhưng cuốn sách thì tuyệt vời." },
      ],
      mistake: {
        wrong: "After the trip, I was very exhausted.", right: "After the trip, I was absolutely exhausted.",
        why: { english: "Exhausted is extreme, so use absolutely, not very.", vietnamese: "Exhausted là tính từ cực độ, nên dùng absolutely, không dùng very." },
      },
    }, {
      title: "Intensifier collocations",
      pattern: "highly likely / unlikely / successful · bitterly disappointed / cold · deeply moved / concerned · utterly ridiculous / useless",
      explanation: {
        english: "Some intensifiers have fixed partners. Highly goes with likely, unlikely, successful and recommended. Bitterly goes with disappointed, cold and regret. Deeply goes with feelings: deeply concerned, deeply moved. Utterly often goes with negative words: utterly useless. Learn these pairs as chunks.",
        vietnamese: "Một số từ nhấn mạnh có cặp cố định. Highly đi với likely, unlikely, successful và recommended. Bitterly đi với disappointed, cold và regret. Deeply đi với cảm xúc: deeply concerned, deeply moved. Utterly thường đi với từ tiêu cực: utterly useless. Hãy học những cặp này như một cụm.",
      },
      examples: [
        { english: "The restaurant is highly recommended.", vietnamese: "Nhà hàng này rất được khuyên dùng." },
        { english: "We are deeply concerned about the results.", vietnamese: "Chúng tôi vô cùng lo ngại về kết quả." },
      ],
      mistake: {
        wrong: "It's strongly likely that prices will rise.", right: "It's highly likely that prices will rise.",
        why: { english: "Likely collocates with highly.", vietnamese: "Likely đi với highly." },
      },
    }],
    examples: [
      { english: "He was bitterly disappointed not to win.", vietnamese: "Anh ấy vô cùng thất vọng vì không thắng." },
      { english: "The new system is utterly useless.", vietnamese: "Hệ thống mới hoàn toàn vô dụng." },
      { english: "The team performed remarkably well under pressure.", vietnamese: "Đội đã thể hiện đặc biệt tốt dưới áp lực." },
      { english: "It's highly unlikely that they'll be on time.", vietnamese: "Rất khó có khả năng họ sẽ đến đúng giờ." },
    ],
    dialogue: [
      { speaker: "Sam", english: "How was the mountain hike?", vietnamese: "Chuyến leo núi thế nào?" },
      { speaker: "Hanh", english: "Amazing, but I was absolutely exhausted by the end.", vietnamese: "Tuyệt vời, nhưng cuối cùng mình hoàn toàn kiệt sức." },
      { speaker: "Sam", english: "Was it cold at the top?", vietnamese: "Trên đỉnh có lạnh không?" },
      { speaker: "Hanh", english: "Absolutely freezing! And the guide was utterly useless.", vietnamese: "Lạnh cóng luôn! Và người hướng dẫn hoàn toàn vô dụng." },
      { speaker: "Sam", english: "Oh no. Were you furious?", vietnamese: "Ôi không. Bạn có giận lắm không?" },
      { speaker: "Hanh", english: "A bit annoyed. But the view was remarkably beautiful, so I'd highly recommend it.", vietnamese: "Hơi bực thôi. Nhưng cảnh đẹp đặc biệt, nên mình rất khuyên đi." },
    ],
    practice: [
      q("Complete: I'm ___ exhausted.", ["absolutely", "very", "fairly", "a bit very"], "absolutely", "Extreme adjective."),
      q("Complete: It's ___ cold today.", ["very", "absolutely", "utterly", "completely"], "very", "Gradable adjective."),
      q("Complete: It's ___ likely to snow.", ["highly", "strongly", "bitterly", "deeply"], "highly", "Highly likely."),
      q("“Kiệt sức” in English is…", ["exhausted", "exhausting", "excited", "exhaust"], "exhausted", "Exhausted."),
    ],
    challenge: [
      q("Complete: The fans were ___ disappointed.", ["bitterly", "highly", "strongly", "absolutely likely"], "bitterly", "Bitterly disappointed."),
      q("Which is wrong?", ["very furious", "absolutely furious", "really furious", "utterly furious"], "very furious", "Furious is extreme."),
      q("Complete: We are ___ concerned about your health.", ["deeply", "highly", "bitterly", "utterly likely"], "deeply", "Deeply concerned."),
      q("Complete: The test was ___ easy, but not very.", ["fairly", "absolutely", "utterly", "completely"], "fairly", "Fairly = to some degree."),
      q("What does “freezing” mean?", ["extremely cold", "a little cold", "warm", "wet"], "extremely cold", "Freezing."),
    ],
  }, {
    key: "focus-adverbs", title: "I Only Asked", titleVi: "Vị trí trạng từ tiêu điểm",
    objectives: [
      "I can place only, even and just to say exactly what I mean.",
      "Put only and even next to the word they focus on",
      "Use not only… but also and even if / even though correctly",
    ],
    vocabulary: [
      { word: "merely", ipa: "/ˈmɪəli/", partOfSpeech: "adverb", vietnamese: "chỉ, chỉ là", definition: "only; nothing more than (formal)", example: { english: "I was merely trying to help.", vietnamese: "Tôi chỉ đang cố giúp thôi." } },
      { word: "solely", ipa: "/ˈsəʊlli/", partOfSpeech: "adverb", vietnamese: "duy nhất, chỉ", definition: "only, and nothing else", example: { english: "The decision was based solely on cost.", vietnamese: "Quyết định chỉ dựa trên chi phí." } },
      { word: "precisely", ipa: "/prɪˈsaɪsli/", partOfSpeech: "adverb", vietnamese: "chính xác", definition: "exactly", example: { english: "That's precisely what I meant.", vietnamese: "Đó chính xác là điều tôi muốn nói." } },
      { word: "ambiguous", ipa: "/æmˈbɪɡjuəs/", partOfSpeech: "adjective", vietnamese: "mơ hồ, nước đôi", definition: "having more than one possible meaning", example: { english: "The instructions were ambiguous.", vietnamese: "Hướng dẫn rất mơ hồ." } },
      { word: "clarify", ipa: "/ˈklærəfaɪ/", partOfSpeech: "verb", vietnamese: "làm rõ", definition: "to make something easier to understand", example: { english: "Could you clarify what you mean?", vietnamese: "Bạn có thể làm rõ ý bạn không?" } },
      { word: "emphasis", ipa: "/ˈemfəsɪs/", partOfSpeech: "noun", vietnamese: "sự nhấn mạnh", definition: "special importance given to something", example: { english: "Put the emphasis on the key word.", vietnamese: "Hãy nhấn mạnh vào từ khoá." } },
      { word: "even though", ipa: "/ˌiːvn ˈðəʊ/", partOfSpeech: "conjunction", vietnamese: "mặc dù (sự thật)", definition: "despite the fact that (for something true)", example: { english: "Even though it was late, she kept working.", vietnamese: "Mặc dù đã muộn, cô ấy vẫn tiếp tục làm việc." } },
      { word: "even if", ipa: "/ˌiːvn ˈɪf/", partOfSpeech: "conjunction", vietnamese: "ngay cả khi (giả định)", definition: "whether or not (for something possible)", example: { english: "Even if it rains, we'll go.", vietnamese: "Ngay cả khi trời mưa, chúng tôi vẫn đi." } },
    ],
    grammar: [{
      title: "Placing only and even",
      pattern: "only / even + the word or phrase you focus on · Only Lan passed (no one else) · Lan only passed (she didn't do well) · Lan passed only one test (not more)",
      explanation: {
        english: "In careful writing, put only and even directly before the word they focus on, because their position changes the meaning. Only I saw the email = nobody else saw it. I only saw the email = I didn't reply. I saw only the email = nothing else. Even works the same way: Even the teacher was confused.",
        vietnamese: "Trong văn viết cẩn thận, đặt only và even ngay trước từ chúng nhấn mạnh, vì vị trí thay đổi nghĩa. Only I saw the email = không ai khác thấy. I only saw the email = tôi không trả lời. I saw only the email = không gì khác. Even cũng vậy: Even the teacher was confused.",
      },
      examples: [
        { english: "Only the manager can clarify the rules.", vietnamese: "Chỉ có quản lý mới làm rõ được các quy định." },
        { english: "Even the experts found the question ambiguous.", vietnamese: "Ngay cả các chuyên gia cũng thấy câu hỏi mơ hồ." },
      ],
      mistake: {
        wrong: "I only have met him once. (meaning: once, not more)", right: "I have met him only once.",
        why: { english: "Put only right before the phrase it focuses on: once.", vietnamese: "Đặt only ngay trước cụm nó nhấn mạnh: once." },
      },
    }, {
      title: "Not only… but also, even if, even though",
      pattern: "not only A but also B · Not only + auxiliary + subject… (front) · even though + fact · even if + possibility",
      explanation: {
        english: "Not only A but also B adds a surprising second point: She speaks not only English but also Korean. At the front of a sentence, it takes inversion: Not only is it cheap, but it is also fast. Even though introduces a fact: Even though he's rich, he's unhappy. Even if introduces a possibility: Even if you apologise, she won't forgive you.",
        vietnamese: "Not only A but also B thêm một ý thứ hai bất ngờ: She speaks not only English but also Korean. Ở đầu câu, cần đảo ngữ: Not only is it cheap, but it is also fast. Even though dẫn ra một sự thật: Even though he's rich, he's unhappy. Even if dẫn ra một khả năng: Even if you apologise, she won't forgive you.",
      },
      examples: [
        { english: "Not only did the plan fail, but it also cost millions.", vietnamese: "Kế hoạch không chỉ thất bại mà còn tốn hàng triệu." },
        { english: "Even though the text was ambiguous, she understood it precisely.", vietnamese: "Mặc dù văn bản mơ hồ, cô ấy vẫn hiểu chính xác." },
      ],
      mistake: {
        wrong: "Not only it is cheap, but it is also fast.", right: "Not only is it cheap, but it is also fast.",
        why: { english: "At the front, not only needs inversion.", vietnamese: "Ở đầu câu, not only cần đảo ngữ." },
      },
    }],
    examples: [
      { english: "I was merely asking a question.", vietnamese: "Tôi chỉ đang hỏi một câu thôi." },
      { english: "The prize is awarded solely for originality.", vietnamese: "Giải thưởng chỉ được trao cho sự độc đáo." },
      { english: "Even if the data are wrong, the method is sound.", vietnamese: "Ngay cả khi dữ liệu sai, phương pháp vẫn vững chắc." },
      { english: "Place the emphasis precisely where you want it.", vietnamese: "Hãy đặt sự nhấn mạnh chính xác vào chỗ bạn muốn." },
    ],
    dialogue: [
      { speaker: "Editor", english: "Your sentence says “Only the students failed the test.” Is that right?", vietnamese: "Câu của bạn ghi “Chỉ có học sinh trượt bài kiểm tra.” Có đúng không?" },
      { speaker: "Phuong", english: "No! I meant they failed only one test.", vietnamese: "Không! Ý tôi là họ chỉ trượt một bài kiểm tra." },
      { speaker: "Editor", english: "Then it's ambiguous. Move only next to “one test”.", vietnamese: "Vậy thì câu đó mơ hồ. Hãy chuyển only đến cạnh “one test”." },
      { speaker: "Phuong", english: "I see. The position changes the emphasis.", vietnamese: "Tôi hiểu rồi. Vị trí làm thay đổi sự nhấn mạnh." },
      { speaker: "Editor", english: "Precisely. Even native speakers get this wrong.", vietnamese: "Chính xác. Ngay cả người bản xứ cũng hay sai chỗ này." },
      { speaker: "Phuong", english: "Thanks for helping me clarify it. I was merely guessing before.", vietnamese: "Cảm ơn đã giúp tôi làm rõ. Trước đây tôi chỉ đoán mò thôi." },
    ],
    practice: [
      q("“Nobody except me saw it.” Choose the sentence.", ["Only I saw it.", "I only saw it.", "I saw only it.", "I saw it only."], "Only I saw it.", "Only before I."),
      q("Complete: ___ the teacher didn't know the answer.", ["Even", "Even if", "Even though", "Only if"], "Even", "Even + noun."),
      q("Complete: ___ it rains tomorrow, we'll play.", ["Even if", "Even though", "Even", "Only"], "Even if", "A possibility."),
      q("“Làm rõ” in English is…", ["clarify", "classify", "clearify", "clear out"], "clarify", "Clarify."),
    ],
    challenge: [
      q("Complete: Not only ___ late, but he also forgot the tickets.", ["was he", "he was", "he is", "did he was"], "was he", "Inversion after not only."),
      q("Complete: ___ he's very rich, he lives simply.", ["Even though", "Even if", "Even", "Only"], "Even though", "A fact."),
      q("Which word means “having more than one possible meaning”?", ["ambiguous", "ambitious", "anonymous", "ambient"], "ambiguous", "Ambiguous."),
      q("Complete: The decision was based ___ on price.", ["solely", "solidly", "soully", "solo"], "solely", "Solely = only."),
      q("What does “merely” mean?", ["only; nothing more than", "very much", "never", "mostly"], "only; nothing more than", "Merely."),
    ],
  }, {
    key: "paraphrasing", title: "In a Nutshell", titleVi: "Tóm tắt và diễn giải",
    objectives: [
      "I can summarise and paraphrase what I read or hear.",
      "Paraphrase by changing words and structure, not just synonyms",
      "Use summary phrases: in a nutshell, in other words, the gist is",
    ],
    vocabulary: [
      { word: "paraphrase", ipa: "/ˈpærəfreɪz/", partOfSpeech: "verb", vietnamese: "diễn giải lại", definition: "to express the same meaning in different words", example: { english: "Paraphrase the passage in your own words.", vietnamese: "Hãy diễn giải đoạn văn bằng lời của bạn." } },
      { word: "summarise", ipa: "/ˈsʌməraɪz/", partOfSpeech: "verb", vietnamese: "tóm tắt", definition: "to give the main points briefly", example: { english: "Can you summarise the article in two sentences?", vietnamese: "Bạn có thể tóm tắt bài báo trong hai câu không?" } },
      { word: "in a nutshell", ipa: "/ɪn ə ˈnʌtʃel/", partOfSpeech: "idiom", vietnamese: "nói ngắn gọn", definition: "in very few words", example: { english: "In a nutshell, the project was a success.", vietnamese: "Nói ngắn gọn, dự án đã thành công." } },
      { word: "in other words", ipa: "/ɪn ˌʌðə ˈwɜːdz/", partOfSpeech: "phrase", vietnamese: "nói cách khác", definition: "used to say something again more simply", example: { english: "Sales fell by half. In other words, it was a disaster.", vietnamese: "Doanh số giảm một nửa. Nói cách khác, đó là một thảm hoạ." } },
      { word: "gist", ipa: "/dʒɪst/", partOfSpeech: "noun", vietnamese: "ý chính", definition: "the main idea of something", example: { english: "I didn't understand every word, but I got the gist.", vietnamese: "Tôi không hiểu từng từ, nhưng nắm được ý chính." } },
      { word: "plagiarism", ipa: "/ˈpleɪdʒərɪzəm/", partOfSpeech: "noun", vietnamese: "đạo văn", definition: "copying someone else's work and presenting it as your own", example: { english: "Copying sentences without credit is plagiarism.", vietnamese: "Chép câu mà không ghi nguồn là đạo văn." } },
      { word: "concise", ipa: "/kənˈsaɪs/", partOfSpeech: "adjective", vietnamese: "súc tích", definition: "short and clear", example: { english: "A good summary is concise.", vietnamese: "Một bản tóm tắt tốt thì súc tích." } },
      { word: "to put it simply", ipa: "/tə ˌpʊt ɪt ˈsɪmpli/", partOfSpeech: "phrase", vietnamese: "nói một cách đơn giản", definition: "used before explaining something in an easier way", example: { english: "To put it simply, we can't afford it.", vietnamese: "Nói một cách đơn giản, chúng ta không đủ tiền." } },
    ],
    grammar: [{
      title: "How to paraphrase",
      pattern: "change words (synonyms) + change structure (verb ↔ noun, active ↔ passive, clause order) + keep the meaning",
      explanation: {
        english: "Changing a few words is not enough, and it can count as plagiarism. Change the structure too. Original: The government increased taxes, which angered voters. Paraphrase: Voters were angry about the rise in taxes. Here a verb became a noun, the order changed, and the meaning stayed the same.",
        vietnamese: "Chỉ thay vài từ là chưa đủ, và có thể bị coi là đạo văn. Hãy thay cả cấu trúc. Bản gốc: The government increased taxes, which angered voters. Diễn giải: Voters were angry about the rise in taxes. Ở đây động từ thành danh từ, trật tự thay đổi, còn nghĩa giữ nguyên.",
      },
      examples: [
        { english: "Original: Many people lost their jobs. Paraphrase: There was a sharp rise in unemployment.", vietnamese: "Bản gốc: Nhiều người mất việc. Diễn giải: Tỷ lệ thất nghiệp tăng mạnh." },
        { english: "Original: Scientists discovered the virus in 2019. Paraphrase: The virus was first identified in 2019.", vietnamese: "Bản gốc: Các nhà khoa học phát hiện virus năm 2019. Diễn giải: Virus được xác định lần đầu năm 2019." },
      ],
      mistake: {
        wrong: "Original: The film was very popular. Paraphrase: The movie was very popular.", right: "Original: The film was very popular. Paraphrase: The film attracted huge audiences.",
        why: { english: "Change the structure as well as the words.", vietnamese: "Hãy thay cả cấu trúc lẫn từ ngữ." },
      },
    }, {
      title: "Summary phrases",
      pattern: "In a nutshell, … · In other words, … · To put it simply, … · The gist (of it) is that… · Overall, the writer argues that…",
      explanation: {
        english: "Signal a summary or a simpler version with a fixed phrase. In a nutshell and to put it simply are good in speech. In other words restates the last point. In writing, report the main idea neutrally: Overall, the writer argues that… The gist is that… is fine in speech but too informal for essays.",
        vietnamese: "Báo hiệu một bản tóm tắt hoặc cách nói đơn giản hơn bằng một cụm cố định. In a nutshell và to put it simply phù hợp khi nói. In other words nói lại ý vừa rồi. Trong văn viết, nêu ý chính một cách trung lập: Overall, the writer argues that… The gist is that… dùng khi nói được, nhưng quá thân mật cho bài luận.",
      },
      examples: [
        { english: "Overall, the writer argues that cities should ban cars.", vietnamese: "Nhìn chung, tác giả lập luận rằng các thành phố nên cấm ô tô." },
        { english: "The gist of his talk was that we need more sleep.", vietnamese: "Ý chính bài nói của anh ấy là chúng ta cần ngủ nhiều hơn." },
      ],
      mistake: {
        wrong: "In nutshell, the plan is too expensive.", right: "In a nutshell, the plan is too expensive.",
        why: { english: "The idiom is in a nutshell, with a.", vietnamese: "Thành ngữ là in a nutshell, có a." },
      },
    }],
    examples: [
      { english: "Please summarise the report in a concise paragraph.", vietnamese: "Hãy tóm tắt báo cáo trong một đoạn văn súc tích." },
      { english: "Paraphrasing carefully helps you avoid plagiarism.", vietnamese: "Diễn giải cẩn thận giúp bạn tránh đạo văn." },
      { english: "To put it simply, the cost is too high.", vietnamese: "Nói một cách đơn giản, chi phí quá cao." },
      { english: "In other words, we need to start again.", vietnamese: "Nói cách khác, chúng ta cần bắt đầu lại." },
    ],
    dialogue: [
      { speaker: "Tutor", english: "Did you read the article on sleep?", vietnamese: "Em đã đọc bài báo về giấc ngủ chưa?" },
      { speaker: "Khoa", english: "Yes. It was long, but I got the gist.", vietnamese: "Rồi ạ. Bài khá dài, nhưng em nắm được ý chính." },
      { speaker: "Tutor", english: "Summarise it for me in a nutshell.", vietnamese: "Hãy tóm tắt ngắn gọn cho tôi." },
      { speaker: "Khoa", english: "Teenagers need more sleep. In other words, school should start later.", vietnamese: "Thanh thiếu niên cần ngủ nhiều hơn. Nói cách khác, trường nên bắt đầu muộn hơn." },
      { speaker: "Tutor", english: "Good, and concise. In your essay, paraphrase rather than copy.", vietnamese: "Tốt, và súc tích. Trong bài luận, hãy diễn giải chứ đừng sao chép." },
      { speaker: "Khoa", english: "Of course. I'll change the structure, not just the words, to avoid plagiarism.", vietnamese: "Tất nhiên ạ. Em sẽ thay cả cấu trúc, không chỉ từ ngữ, để tránh đạo văn." },
    ],
    practice: [
      q("Complete: In a ___, it was a disaster.", ["nutshell", "shell", "nut", "nutcase"], "nutshell", "In a nutshell."),
      q("Which is the best paraphrase of “Prices rose sharply”?", ["There was a steep increase in prices.", "Prices rose sharply.", "Prices rised sharp.", "Sharply prices rose."], "There was a steep increase in prices.", "Change words and structure."),
      q("Complete: I didn't catch every word, but I got the ___.", ["gist", "gust", "guest", "jest"], "gist", "Gist = main idea."),
      q("“Đạo văn” in English is…", ["plagiarism", "paraphrase", "pluralism", "pragmatism"], "plagiarism", "Plagiarism."),
    ],
    challenge: [
      q("Complete: To put it ___, we're broke.", ["simply", "simple", "simplify", "simpler"], "simply", "To put it simply."),
      q("Which phrase is best for an academic summary?", ["Overall, the writer argues that…", "The gist is that…", "In a nutshell…", "Basically, like…"], "Overall, the writer argues that…", "Neutral and formal."),
      q("What does “concise” mean?", ["short and clear", "long and detailed", "confusing", "careless"], "short and clear", "Concise."),
      q("Complete: Sales halved. In ___ words, it failed.", ["other", "another", "others", "different"], "other", "In other words."),
      q("A good paraphrase…", ["keeps the meaning but changes words and structure", "copies the original", "changes the meaning", "only adds synonyms"], "keeps the meaning but changes words and structure", "Paraphrasing."),
    ],
  }, {
    key: "academic-style", title: "This Essay Will Examine…", titleVi: "Văn phong học thuật",
    objectives: [
      "I can write in a formal academic style.",
      "Use impersonal structures: This essay will examine, It can be argued that",
      "Avoid contractions, I / you and informal words in essays",
    ],
    vocabulary: [
      { word: "examine", ipa: "/ɪɡˈzæmɪn/", partOfSpeech: "verb", vietnamese: "xem xét, khảo sát", definition: "to look at or consider something carefully", example: { english: "This essay will examine the causes of poverty.", vietnamese: "Bài luận này sẽ xem xét nguyên nhân của nghèo đói." } },
      { word: "objective", ipa: "/əbˈdʒektɪv/", partOfSpeech: "adjective", vietnamese: "khách quan", definition: "based on facts, not personal feelings", example: { english: "Academic writing should be objective.", vietnamese: "Văn học thuật cần khách quan." } },
      { word: "evidence", ipa: "/ˈevɪdəns/", partOfSpeech: "noun", vietnamese: "bằng chứng", definition: "facts that show something is true", example: { english: "There is little evidence to support this claim.", vietnamese: "Có rất ít bằng chứng ủng hộ khẳng định này." } },
      { word: "it can be argued", ipa: "/ɪt kən bi ˈɑːɡjuːd/", partOfSpeech: "phrase", vietnamese: "có thể lập luận rằng", definition: "used to present an opinion impersonally", example: { english: "It can be argued that technology isolates people.", vietnamese: "Có thể lập luận rằng công nghệ khiến con người cô lập." } },
      { word: "furthermore", ipa: "/ˌfɜːðəˈmɔː/", partOfSpeech: "adverb", vietnamese: "hơn nữa", definition: "in addition (formal)", example: { english: "Furthermore, the costs are rising.", vietnamese: "Hơn nữa, chi phí đang tăng." } },
      { word: "cite", ipa: "/saɪt/", partOfSpeech: "verb", vietnamese: "trích dẫn", definition: "to mention a source as evidence", example: { english: "Always cite your sources.", vietnamese: "Luôn trích dẫn nguồn của bạn." } },
      { word: "conclude", ipa: "/kənˈkluːd/", partOfSpeech: "verb", vietnamese: "kết luận", definition: "to decide something after considering the facts", example: { english: "The study concludes that exercise improves memory.", vietnamese: "Nghiên cứu kết luận rằng tập thể dục cải thiện trí nhớ." } },
      { word: "subjective", ipa: "/səbˈdʒektɪv/", partOfSpeech: "adjective", vietnamese: "chủ quan", definition: "based on personal feelings, not facts", example: { english: "Beauty is a subjective judgement.", vietnamese: "Cái đẹp là một đánh giá chủ quan." } },
    ],
    grammar: [{
      title: "Impersonal structures",
      pattern: "This essay will examine / discuss… · It can be argued / It is widely believed that… · There is evidence that… · The data suggest that…",
      explanation: {
        english: "Academic writing focuses on ideas, not the writer. Instead of I think, use It can be argued that or There is evidence that. Instead of In this essay I will talk about, write This essay will examine. Let the evidence be the subject: The data suggest that…",
        vietnamese: "Văn học thuật tập trung vào ý tưởng, không phải người viết. Thay vì I think, dùng It can be argued that hoặc There is evidence that. Thay vì In this essay I will talk about, viết This essay will examine. Hãy để bằng chứng làm chủ ngữ: The data suggest that…",
      },
      examples: [
        { english: "It is widely believed that social media affects sleep.", vietnamese: "Nhiều người tin rằng mạng xã hội ảnh hưởng đến giấc ngủ." },
        { english: "There is strong evidence that early education reduces inequality.", vietnamese: "Có bằng chứng mạnh mẽ rằng giáo dục sớm làm giảm bất bình đẳng." },
      ],
      mistake: {
        wrong: "In this essay I'm going to talk about pollution.", right: "This essay will examine the causes of pollution.",
        why: { english: "Use an impersonal opening with a precise verb.", vietnamese: "Dùng câu mở đầu khách quan với động từ chính xác." },
      },
    }, {
      title: "Formal choices",
      pattern: "no contractions (do not, it is) · no you / I (one, people, it) · formal words (furthermore, numerous, obtain) · no lots of / a bit / get",
      explanation: {
        english: "In essays, write full forms: does not, it is. Avoid you for people in general; use people or one. Choose formal vocabulary: numerous instead of lots of, obtain instead of get, furthermore instead of plus. Don't start sentences with And or But. Use However or In addition instead.",
        vietnamese: "Trong bài luận, viết dạng đầy đủ: does not, it is. Tránh dùng you cho người nói chung; dùng people hoặc one. Chọn từ trang trọng: numerous thay cho lots of, obtain thay cho get, furthermore thay cho plus. Đừng bắt đầu câu bằng And hoặc But. Hãy dùng However hoặc In addition.",
      },
      examples: [
        { english: "Numerous studies have examined this issue.", vietnamese: "Nhiều nghiên cứu đã xem xét vấn đề này." },
        { english: "However, the evidence does not support this view.", vietnamese: "Tuy nhiên, bằng chứng không ủng hộ quan điểm này." },
      ],
      mistake: {
        wrong: "You can't get good results without lots of practice.", right: "Good results cannot be obtained without considerable practice.",
        why: { english: "Avoid you, contractions and informal words in essays.", vietnamese: "Tránh you, dạng rút gọn và từ thân mật trong bài luận." },
      },
    }],
    examples: [
      { english: "This essay will examine both sides of the debate.", vietnamese: "Bài luận này sẽ xem xét cả hai phía của cuộc tranh luận." },
      { english: "It can be argued that the evidence is incomplete.", vietnamese: "Có thể lập luận rằng bằng chứng chưa đầy đủ." },
      { english: "Furthermore, the writer fails to cite any sources.", vietnamese: "Hơn nữa, người viết không trích dẫn bất kỳ nguồn nào." },
      { english: "An objective essay avoids subjective language.", vietnamese: "Một bài luận khách quan tránh ngôn ngữ chủ quan." },
    ],
    dialogue: [
      { speaker: "Lecturer", english: "Your essay opens with “I think phones are bad for kids.”", vietnamese: "Bài luận của em mở đầu bằng “Em nghĩ điện thoại có hại cho trẻ con.”" },
      { speaker: "Yen", english: "Is that too informal?", vietnamese: "Như vậy có quá thân mật không ạ?" },
      { speaker: "Lecturer", english: "Yes. It's subjective. Try “This essay will examine the effects of phones on children.”", vietnamese: "Có. Nó chủ quan. Hãy thử “Bài luận này sẽ xem xét tác động của điện thoại đối với trẻ em.”" },
      { speaker: "Yen", english: "And instead of “I think”?", vietnamese: "Còn thay cho “I think” thì sao ạ?" },
      { speaker: "Lecturer", english: "“It can be argued that…”, and then cite your evidence.", vietnamese: "“Có thể lập luận rằng…”, rồi trích dẫn bằng chứng của em." },
      { speaker: "Yen", english: "So I should be objective, avoid contractions, and conclude with the data.", vietnamese: "Vậy em nên khách quan, tránh dạng rút gọn, và kết luận dựa trên dữ liệu." },
    ],
    practice: [
      q("Which is the best academic opening?", ["This essay will examine…", "In this essay I'm gonna talk about…", "Let me tell you about…", "So, basically…"], "This essay will examine…", "Impersonal and precise."),
      q("Complete: It can be ___ that cities are too crowded.", ["argued", "argue", "arguing", "argument"], "argued", "It can be argued."),
      q("Which is more formal than “lots of”?", ["numerous", "loads of", "a bunch of", "tons of"], "numerous", "Formal word."),
      q("“Khách quan” in English is…", ["objective", "subjective", "objection", "obedient"], "objective", "Objective."),
    ],
    challenge: [
      q("Choose the most academic sentence.", ["The results do not support this view.", "The results don't support this view.", "You can see the results don't back this up.", "And the results don't agree."], "The results do not support this view.", "Full forms, impersonal."),
      q("Complete: ___, the costs are rising. (formal: in addition)", ["Furthermore", "Plus", "Also and", "Besides that also"], "Furthermore", "Formal linker."),
      q("Complete: Always ___ your sources.", ["cite", "site", "sight", "side"], "cite", "Cite = mention a source."),
      q("Complete: The study ___ that sleep improves memory.", ["concludes", "concluding", "conclusion", "conclusive"], "concludes", "Conclude."),
      q("What does “subjective” mean?", ["based on personal feelings", "based on facts", "very formal", "very short"], "based on personal feelings", "Subjective."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 6", isReview: true,
    objectives: [
      "I can control register, emphasis and style with confidence.",
      "Check euphemism and register, intensifiers, focus adverbs, paraphrasing and academic style",
    ],
    vocabulary: [
      { word: "register", ipa: "/ˈredʒɪstə/", partOfSpeech: "noun", vietnamese: "văn phong, sắc thái ngôn ngữ", definition: "the level of formality of language", example: { english: "Match your register to your reader.", vietnamese: "Hãy chọn văn phong phù hợp với người đọc." } },
      { word: "exhausted", ipa: "/ɪɡˈzɔːstɪd/", partOfSpeech: "adjective", vietnamese: "kiệt sức", definition: "extremely tired", example: { english: "We were utterly exhausted after the exam.", vietnamese: "Chúng tôi hoàn toàn kiệt sức sau kỳ thi." } },
      { word: "ambiguous", ipa: "/æmˈbɪɡjuəs/", partOfSpeech: "adjective", vietnamese: "mơ hồ, nước đôi", definition: "having more than one possible meaning", example: { english: "Avoid ambiguous sentences in a contract.", vietnamese: "Tránh những câu mơ hồ trong hợp đồng." } },
      { word: "paraphrase", ipa: "/ˈpærəfreɪz/", partOfSpeech: "verb", vietnamese: "diễn giải lại", definition: "to express the same meaning in different words", example: { english: "Paraphrase the quote instead of copying it.", vietnamese: "Hãy diễn giải câu trích dẫn thay vì sao chép." } },
      { word: "objective", ipa: "/əbˈdʒektɪv/", partOfSpeech: "adjective", vietnamese: "khách quan", definition: "based on facts, not personal feelings", example: { english: "Try to give an objective account.", vietnamese: "Hãy cố gắng trình bày một cách khách quan." } },
      { word: "evidence", ipa: "/ˈevɪdəns/", partOfSpeech: "noun", vietnamese: "bằng chứng", definition: "facts that show something is true", example: { english: "The evidence is overwhelming.", vietnamese: "Bằng chứng là quá rõ ràng." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "passed away / let go · very tired but absolutely exhausted · Only I saw it / I saw it only once · paraphrase words and structure · This essay will examine / It can be argued that",
      explanation: {
        english: "Check these: use euphemisms for sensitive topics and keep one register throughout; use very with gradable adjectives, absolutely with extreme ones, and learn pairs like highly likely; put only and even right before the word they focus on, and invert after a fronted not only; paraphrase by changing structure as well as words; and in essays, write impersonally with no contractions or you.",
        vietnamese: "Hãy kiểm tra: dùng uyển ngữ cho chủ đề nhạy cảm và giữ một văn phong xuyên suốt; dùng very với tính từ có mức độ, absolutely với tính từ cực độ, và học các cặp như highly likely; đặt only và even ngay trước từ chúng nhấn mạnh, và đảo ngữ sau not only ở đầu câu; diễn giải bằng cách thay cả cấu trúc lẫn từ ngữ; và trong bài luận, viết khách quan, không dùng dạng rút gọn hay you.",
      },
      examples: [
        { english: "Not only is the evidence objective, but it is also highly convincing.", vietnamese: "Bằng chứng không chỉ khách quan mà còn rất thuyết phục." },
        { english: "It can be argued that the original text is ambiguous.", vietnamese: "Có thể lập luận rằng văn bản gốc mơ hồ." },
      ],
    }],
    examples: [
      { english: "Choose the right register, and your writing will sound natural.", vietnamese: "Chọn đúng văn phong, bài viết của bạn sẽ nghe tự nhiên." },
      { english: "The evidence suggests the question was ambiguous.", vietnamese: "Bằng chứng cho thấy câu hỏi mơ hồ." },
      { english: "After paraphrasing the whole article, I was absolutely exhausted.", vietnamese: "Sau khi diễn giải cả bài báo, tôi hoàn toàn kiệt sức." },
    ],
    dialogue: [
      { speaker: "Examiner", english: "Let's look at your final essay.", vietnamese: "Chúng ta cùng xem bài luận cuối của em." },
      { speaker: "Vy", english: "I tried to keep a formal register throughout.", vietnamese: "Em đã cố giữ văn phong trang trọng xuyên suốt." },
      { speaker: "Examiner", english: "You did. It's objective, and you cite strong evidence.", vietnamese: "Em làm được rồi. Bài khách quan, và em trích dẫn bằng chứng vững chắc." },
      { speaker: "Vy", english: "Was anything ambiguous?", vietnamese: "Có chỗ nào mơ hồ không ạ?" },
      { speaker: "Examiner", english: "Just one line: move only before “one study” to make it clear.", vietnamese: "Chỉ một dòng: chuyển only lên trước “one study” cho rõ nghĩa." },
      { speaker: "Vy", english: "And did I paraphrase the sources well?", vietnamese: "Còn em diễn giải các nguồn có tốt không ạ?" },
      { speaker: "Examiner", english: "Very well. In a nutshell, it's a highly impressive piece of work.", vietnamese: "Rất tốt. Nói ngắn gọn, đó là một bài làm rất ấn tượng." },
    ],
    practice: [
      q("A polite way to say “sacked” is…", ["let go", "let down", "let off", "let out"], "let go", "Let go."),
      q("Complete: I'm ___ exhausted.", ["absolutely", "very", "fairly", "slightly"], "absolutely", "Extreme adjective."),
      q("“Nobody else came.” Choose the sentence.", ["Only Tom came.", "Tom only came.", "Tom came only.", "Tom came, only."], "Only Tom came.", "Only before Tom."),
      q("Which is the best academic phrase?", ["It can be argued that…", "I reckon…", "You know, …", "Basically…"], "It can be argued that…", "Impersonal."),
    ],
    challenge: [
      q("Complete: It's ___ unlikely that he'll agree.", ["highly", "strongly", "bitterly", "deeply"], "highly", "Highly unlikely."),
      q("Complete: Not only ___ cheap, but it's also reliable.", ["is it", "it is", "it's", "does it"], "is it", "Inversion after not only."),
      q("Complete: ___ if you're tired, finish the essay.", ["Even", "Only", "Even though", "Just"], "Even", "Even if = a possibility."),
      q("A good paraphrase changes…", ["words and structure", "only one word", "the meaning", "nothing"], "words and structure", "Paraphrasing."),
      q("Which is wrong in an academic essay?", ["You can't ignore this.", "This cannot be ignored.", "This issue must be addressed.", "The evidence is clear."], "You can't ignore this.", "Avoid you and contractions."),
    ],
  }],
  assessment: [
    { id: "pass-away", prompt: "“Qua đời” (polite) in English is…", options: ["pass away", "pass out", "pass by", "pass off"], correct: "pass away", explanation: "Pass away." },
    { id: "let-go", prompt: "Complete: Thirty workers were ___ go.", options: ["let", "made", "sent", "got"], correct: "let", explanation: "Let go." },
    { id: "register", prompt: "Which fits a formal letter?", options: ["I would like to enquire about the position.", "I wanna ask about the job.", "Just checking about the job, mate.", "Gimme info on the job."], correct: "I would like to enquire about the position.", explanation: "Formal register." },
    { id: "extreme-adjective", prompt: "Complete: The food was ___ delicious.", options: ["absolutely", "very very", "fairly", "slightly"], correct: "absolutely", explanation: "Delicious is extreme." },
    { id: "gradable-adjective", prompt: "Which is wrong?", options: ["very exhausted", "absolutely exhausted", "really exhausted", "utterly exhausted"], correct: "very exhausted", explanation: "Exhausted is extreme." },
    { id: "highly-likely", prompt: "Complete: It's ___ likely to rain.", options: ["highly", "strongly", "deeply", "bitterly"], correct: "highly", explanation: "Highly likely." },
    { id: "bitterly", prompt: "Complete: She was ___ disappointed.", options: ["bitterly", "highly", "strongly", "utterly likely"], correct: "bitterly", explanation: "Bitterly disappointed." },
    { id: "only-position", prompt: "“I met him once, not more.” Choose the sentence.", options: ["I have met him only once.", "Only I have met him once.", "I only have met him once.", "Only have I met him once."], correct: "I have met him only once.", explanation: "Only before once." },
    { id: "not-only", prompt: "Complete: Not only ___ fast, but it's also cheap.", options: ["is it", "it is", "it's", "does it be"], correct: "is it", explanation: "Inversion after not only." },
    { id: "even-though", prompt: "Complete: ___ she was tired, she kept going.", options: ["Even though", "Even if", "Even", "Only if"], correct: "Even though", explanation: "A fact." },
    { id: "nutshell", prompt: "Complete: In a ___, we need more money.", options: ["nutshell", "shell", "nut", "nutcase"], correct: "nutshell", explanation: "In a nutshell." },
    { id: "paraphrase", prompt: "Best paraphrase of “Many people lost their jobs”:", options: ["There was a sharp rise in unemployment.", "Many people lost their jobs.", "Many persons lost their works.", "Lost their jobs many people."], correct: "There was a sharp rise in unemployment.", explanation: "Change words and structure." },
    { id: "plagiarism", prompt: "“Đạo văn” in English is…", options: ["plagiarism", "paraphrase", "pluralism", "prejudice"], correct: "plagiarism", explanation: "Plagiarism." },
    { id: "essay-opening", prompt: "Which is the best academic opening?", options: ["This essay will examine…", "I'm going to talk about…", "Let me tell you…", "So, first of all, guys…"], correct: "This essay will examine…", explanation: "Impersonal." },
    { id: "no-contractions", prompt: "Choose the most academic sentence.", options: ["The data do not support this claim.", "The data don't support this claim.", "You can see the data don't back it up.", "But the data don't agree."], correct: "The data do not support this claim.", explanation: "Full forms, impersonal." },
  ],
};
