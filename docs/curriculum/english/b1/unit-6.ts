// B1 Unit 6: Society & the Environment. Vietnamese speakers often say "many pollutions" and "We should to recycle";
// "quá nhiều" becomes "too much people", and "đủ lớn" becomes "enough big"; "chắc là không" turns into "She mustn't be
// at home" instead of "can't be"; "Mặc dù… nhưng…" gives "Although it rained, but we went out"; and "Tôi đồng ý"
// becomes "I'm agree". This unit puts those right for talking about the world and the city we live in.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B1",
  number: 6,
  lessons: [{
    key: "the-environment", title: "Our Planet", titleVi: "Hành tinh của chúng ta",
    objectives: [
      "I can talk about environmental problems and what we can do about them.",
      "Use uncountable nouns like pollution, waste and rubbish correctly",
      "Give advice and duties with should, need to and have to",
    ],
    vocabulary: [
      { word: "pollution", ipa: "/pəˈluːʃn/", partOfSpeech: "noun", vietnamese: "sự ô nhiễm", definition: "dirty or harmful substances in the air, water or land", example: { english: "Air pollution in big cities is getting worse.", vietnamese: "Ô nhiễm không khí ở các thành phố lớn ngày càng tệ hơn." } },
      { word: "climate change", ipa: "/ˈklaɪmət tʃeɪndʒ/", partOfSpeech: "noun", vietnamese: "biến đổi khí hậu", definition: "changes in the Earth's weather, caused mainly by people", example: { english: "Climate change is causing more storms in the region.", vietnamese: "Biến đổi khí hậu đang gây ra nhiều cơn bão hơn trong khu vực." } },
      { word: "recycle", ipa: "/ˌriːˈsaɪkl/", partOfSpeech: "verb", vietnamese: "tái chế", definition: "to treat used things so that they can be used again", example: { english: "We recycle all our bottles and paper.", vietnamese: "Chúng tôi tái chế toàn bộ chai lọ và giấy." } },
      { word: "rubbish", ipa: "/ˈrʌbɪʃ/", partOfSpeech: "noun", vietnamese: "rác", definition: "things that you throw away (British English)", example: { english: "Please don't leave your rubbish on the beach.", vietnamese: "Xin đừng để rác lại trên bãi biển." } },
      { word: "waste", ipa: "/weɪst/", partOfSpeech: "noun", vietnamese: "chất thải, sự lãng phí", definition: "material that is no longer wanted, or using something badly", example: { english: "Factories must not put waste into the river.", vietnamese: "Các nhà máy không được xả chất thải ra sông." } },
      { word: "protect", ipa: "/prəˈtekt/", partOfSpeech: "verb", vietnamese: "bảo vệ", definition: "to keep someone or something safe from harm", example: { english: "We need laws to protect the forests.", vietnamese: "Chúng ta cần luật để bảo vệ rừng." } },
      { word: "renewable energy", ipa: "/rɪˌnjuːəbl ˈenədʒi/", partOfSpeech: "noun", vietnamese: "năng lượng tái tạo", definition: "power from the sun, wind or water, which never runs out", example: { english: "Vietnam is building more renewable energy farms.", vietnamese: "Việt Nam đang xây thêm nhiều trang trại năng lượng tái tạo." } },
      { word: "cut down on", ipa: "/ˌkʌt ˈdaʊn ɒn/", partOfSpeech: "phrasal verb", vietnamese: "cắt giảm", definition: "to use or do less of something", example: { english: "I'm trying to cut down on plastic bags.", vietnamese: "Tôi đang cố cắt giảm túi ni-lông." } },
    ],
    grammar: [{
      title: "Uncountable nouns",
      pattern: "pollution, waste, rubbish, energy, information → no a / an, no -s · much / a lot of / less",
      explanation: {
        english: "Many environment words are uncountable: pollution, rubbish, waste, energy, traffic. They have no plural and no a / an. Use a lot of, much, little or less with them: There's a lot of pollution. We should use less energy. To count them, use a word like a bag of or a piece of: a bag of rubbish.",
        vietnamese: "Nhiều từ về môi trường là danh từ không đếm được: pollution, rubbish, waste, energy, traffic. Chúng không có số nhiều và không đi với a / an. Dùng a lot of, much, little hoặc less: There's a lot of pollution. We should use less energy. Muốn đếm thì dùng từ như a bag of hoặc a piece of: a bag of rubbish.",
      },
      examples: [
        { english: "There's too much rubbish in the canal.", vietnamese: "Có quá nhiều rác trong kênh." },
        { english: "We collected twenty bags of rubbish on Sunday.", vietnamese: "Chủ nhật chúng tôi đã nhặt được hai mươi túi rác." },
      ],
      mistake: {
        wrong: "Hanoi has many pollutions.", right: "Hanoi has a lot of pollution.",
        why: { english: "Pollution is uncountable: no -s, and use a lot of or much, not many.", vietnamese: "Pollution không đếm được: không thêm -s, và dùng a lot of hoặc much, không dùng many." },
      },
    }, {
      title: "Should, need to, have to",
      pattern: "should + verb (advice) · need to / have to + verb (necessary) · shouldn't / don't have to",
      explanation: {
        english: "Should gives advice or says what is right: We should recycle more. Need to and have to say something is necessary: We have to act now. Should is followed by the base verb with no to. Don't have to means it isn't necessary; shouldn't means it's a bad idea.",
        vietnamese: "Should dùng để khuyên hoặc nói điều nên làm: We should recycle more. Need to và have to nói điều cần thiết: We have to act now. Sau should là động từ nguyên mẫu, không có to. Don't have to nghĩa là không cần thiết; shouldn't nghĩa là không nên.",
      },
      examples: [
        { english: "You shouldn't throw plastic into the sea.", vietnamese: "Bạn không nên vứt nhựa xuống biển." },
        { english: "Governments need to invest in clean transport.", vietnamese: "Các chính phủ cần đầu tư vào giao thông sạch." },
      ],
      mistake: {
        wrong: "We should to recycle more.", right: "We should recycle more.",
        why: { english: "Should is followed by the base verb, without to.", vietnamese: "Sau should là động từ nguyên mẫu, không có to." },
      },
    }],
    examples: [
      { english: "Climate change affects poor countries the most.", vietnamese: "Biến đổi khí hậu ảnh hưởng nặng nhất đến các nước nghèo." },
      { english: "Our school recycles paper and has cut down on plastic.", vietnamese: "Trường tôi tái chế giấy và đã cắt giảm đồ nhựa." },
      { english: "Solar panels are a cheap form of renewable energy.", vietnamese: "Tấm pin mặt trời là một dạng năng lượng tái tạo rẻ." },
      { english: "We have to protect the coral reefs before it's too late.", vietnamese: "Chúng ta phải bảo vệ các rạn san hô trước khi quá muộn." },
    ],
    dialogue: [
      { speaker: "Anna", english: "Look at all this rubbish on the beach!", vietnamese: "Nhìn đống rác trên bãi biển kìa!" },
      { speaker: "Khanh", english: "I know. Most of it is plastic bottles.", vietnamese: "Mình biết. Phần lớn là chai nhựa." },
      { speaker: "Anna", english: "People should take their waste home with them.", vietnamese: "Mọi người nên mang rác về nhà." },
      { speaker: "Khanh", english: "And shops need to cut down on plastic bags.", vietnamese: "Và các cửa hàng cần cắt giảm túi ni-lông." },
      { speaker: "Anna", english: "There's a clean-up here on Saturday. Shall we join?", vietnamese: "Thứ Bảy có buổi dọn rác ở đây. Mình tham gia nhé?" },
      { speaker: "Khanh", english: "Good idea. We have to protect places like this.", vietnamese: "Ý hay đấy. Chúng ta phải bảo vệ những nơi như thế này." },
    ],
    practice: [
      q("Complete: There is a lot of ___ in the river.", ["pollution", "pollutions", "a pollution", "many pollution"], "pollution", "Pollution is uncountable."),
      q("Complete: We should ___ our bottles.", ["recycle", "to recycle", "recycling", "recycles"], "recycle", "Should + base verb."),
      q("Complete: I've filled three ___ rubbish.", ["bags of", "rubbishes of", "many", "a"], "bags of", "Count uncountable nouns with bags of."),
      q("“Năng lượng tái tạo” in English is…", ["renewable energy", "recycle energy", "new power again", "repeated energy"], "renewable energy", "Renewable energy = sun, wind, water power."),
    ],
    challenge: [
      q("Complete: We ___ use less energy at home.", ["should", "should to", "have", "need"], "should", "Should + base verb."),
      q("Choose the correct sentence.", ["There isn't much waste in this town.", "There aren't many wastes in this town.", "There isn't a waste in this town.", "There aren't much waste in this town."], "There isn't much waste in this town.", "Uncountable: much, singular verb."),
      q("Complete: You ___ bring a bag. We've got lots.", ["don't have to", "mustn't to", "shouldn't to", "don't should"], "don't have to", "Don't have to = not necessary."),
      q("Complete: I want to ___ sugar. I eat too much.", ["cut down on", "cut off", "cut up on", "cut in"], "cut down on", "Cut down on = use less."),
      q("What is “climate change”?", ["changes in the Earth's weather, caused mainly by people", "a change of clothes for the weather", "a weather report", "a new season"], "changes in the Earth's weather, caused mainly by people", "Climate change = long-term weather change."),
    ],
  }, {
    key: "too-and-enough", title: "Too Much, Not Enough", titleVi: "Too và enough",
    objectives: [
      "I can describe problems in my town or city.",
      "Use too + adjective, too much + uncountable and too many + plural",
      "Put enough after adjectives and before nouns",
    ],
    vocabulary: [
      { word: "crowded", ipa: "/ˈkraʊdɪd/", partOfSpeech: "adjective", vietnamese: "đông đúc", definition: "full of people", example: { english: "The buses are too crowded in the rush hour.", vietnamese: "Xe buýt quá đông vào giờ cao điểm." } },
      { word: "traffic jam", ipa: "/ˈtræfɪk dʒæm/", partOfSpeech: "noun", vietnamese: "tắc đường", definition: "a long line of vehicles that can't move", example: { english: "I was stuck in a traffic jam for an hour.", vietnamese: "Tôi bị kẹt xe suốt một tiếng." } },
      { word: "public transport", ipa: "/ˌpʌblɪk ˈtrænspɔːt/", partOfSpeech: "noun", vietnamese: "phương tiện công cộng", definition: "buses, trains and metro that everyone can use", example: { english: "The city needs better public transport.", vietnamese: "Thành phố cần phương tiện công cộng tốt hơn." } },
      { word: "affordable", ipa: "/əˈfɔːdəbl/", partOfSpeech: "adjective", vietnamese: "giá cả phải chăng", definition: "cheap enough for ordinary people to pay", example: { english: "There isn't enough affordable housing for young people.", vietnamese: "Không có đủ nhà ở giá phải chăng cho người trẻ." } },
      { word: "rent", ipa: "/rent/", partOfSpeech: "noun", vietnamese: "tiền thuê nhà", definition: "money you pay every month to live in someone's home", example: { english: "The rent in the city centre is too high.", vietnamese: "Tiền thuê nhà ở trung tâm thành phố quá cao." } },
      { word: "noise", ipa: "/nɔɪz/", partOfSpeech: "noun", vietnamese: "tiếng ồn", definition: "loud or unpleasant sound", example: { english: "There's too much noise from the building site.", vietnamese: "Có quá nhiều tiếng ồn từ công trường." } },
      { word: "green space", ipa: "/ˌɡriːn ˈspeɪs/", partOfSpeech: "noun", vietnamese: "không gian xanh", definition: "an area of grass and trees in a town, such as a park", example: { english: "Our neighbourhood doesn't have enough green space.", vietnamese: "Khu phố chúng tôi không có đủ không gian xanh." } },
      { word: "population", ipa: "/ˌpɒpjuˈleɪʃn/", partOfSpeech: "noun", vietnamese: "dân số", definition: "the number of people who live in a place", example: { english: "The population of Ho Chi Minh City is over nine million.", vietnamese: "Dân số Thành phố Hồ Chí Minh hơn chín triệu người." } },
    ],
    grammar: [{
      title: "Too, too much, too many",
      pattern: "too + adjective · too much + uncountable noun · too many + plural noun (= more than is good)",
      explanation: {
        english: "Too means more than is good or acceptable. Use too before an adjective: It's too hot. Use too much with uncountable nouns: too much traffic. Use too many with plural nouns: too many cars. Vietnamese “quá nhiều” can be too much or too many, so check whether the noun is countable.",
        vietnamese: "Too nghĩa là nhiều hơn mức tốt hoặc chấp nhận được. Dùng too trước tính từ: It's too hot. Dùng too much với danh từ không đếm được: too much traffic. Dùng too many với danh từ số nhiều: too many cars. “Quá nhiều” trong tiếng Việt có thể là too much hoặc too many, nên hãy xem danh từ có đếm được không.",
      },
      examples: [
        { english: "There are too many motorbikes on the pavements.", vietnamese: "Có quá nhiều xe máy trên vỉa hè." },
        { english: "This flat is too small for a family of five.", vietnamese: "Căn hộ này quá nhỏ cho gia đình năm người." },
      ],
      mistake: {
        wrong: "There are too much people in the market.", right: "There are too many people in the market.",
        why: { english: "People is plural, so use too many, not too much.", vietnamese: "People là số nhiều, nên dùng too many, không dùng too much." },
      },
    }, {
      title: "Enough",
      pattern: "adjective + enough · enough + noun · not … enough (+ to + verb / for + person)",
      explanation: {
        english: "Enough means as much as you need. It goes after an adjective: big enough, warm enough. But it goes before a noun: enough money, enough space. Add to + verb or for + someone: The flat isn't big enough for us. I'm not old enough to vote.",
        vietnamese: "Enough nghĩa là đủ như mức cần. Nó đứng sau tính từ: big enough, warm enough. Nhưng đứng trước danh từ: enough money, enough space. Có thể thêm to + động từ hoặc for + người: The flat isn't big enough for us. I'm not old enough to vote.",
      },
      examples: [
        { english: "Is the bus fast enough to get you to work on time?", vietnamese: "Xe buýt có đủ nhanh để đưa bạn đến chỗ làm đúng giờ không?" },
        { english: "We don't have enough parks in the city.", vietnamese: "Thành phố chúng ta không có đủ công viên." },
      ],
      mistake: {
        wrong: "The room isn't enough big.", right: "The room isn't big enough.",
        why: { english: "Enough comes after an adjective.", vietnamese: "Enough đứng sau tính từ." },
      },
    }],
    examples: [
      { english: "The rent is too high and the flats are too small.", vietnamese: "Tiền thuê nhà quá cao mà căn hộ lại quá nhỏ." },
      { english: "There are too many traffic jams because public transport isn't good enough.", vietnamese: "Tắc đường nhiều quá vì phương tiện công cộng chưa đủ tốt." },
      { english: "As the population grows, we need more green space.", vietnamese: "Khi dân số tăng, chúng ta cần thêm không gian xanh." },
      { english: "Housing in the suburbs is more affordable, but the journey is too long.", vietnamese: "Nhà ở ngoại ô giá phải chăng hơn, nhưng đường đi quá xa." },
    ],
    dialogue: [
      { speaker: "Ben", english: "How's your new flat?", vietnamese: "Căn hộ mới của bạn thế nào?" },
      { speaker: "Thao", english: "It's nice, but the rent is too high.", vietnamese: "Đẹp, nhưng tiền thuê cao quá." },
      { speaker: "Ben", english: "Is it near public transport?", vietnamese: "Có gần phương tiện công cộng không?" },
      { speaker: "Thao", english: "Yes, but the buses are too crowded in the morning.", vietnamese: "Có, nhưng buổi sáng xe buýt đông quá." },
      { speaker: "Ben", english: "And is it quiet enough?", vietnamese: "Thế có đủ yên tĩnh không?" },
      { speaker: "Thao", english: "Not really. There's too much noise from the street.", vietnamese: "Không hẳn. Ngoài đường ồn quá." },
    ],
    practice: [
      q("Complete: There are ___ cars in the city centre.", ["too many", "too much", "too", "enough of"], "too many", "Plural noun: too many."),
      q("Complete: There's ___ noise. I can't sleep.", ["too much", "too many", "enough", "too"], "too much", "Uncountable noun: too much."),
      q("Complete: This bag isn't ___.", ["big enough", "enough big", "too enough", "enough"], "big enough", "Adjective + enough."),
      q("“Tắc đường” in English is…", ["traffic jam", "road stop", "car block", "traffic jelly"], "traffic jam", "Traffic jam = vehicles that can't move."),
    ],
    challenge: [
      q("Complete: We don't have ___ for a sofa.", ["enough space", "space enough", "enough of space", "too space"], "enough space", "Enough + noun."),
      q("Complete: She's ___ to drive. She's only 15.", ["too young", "young enough", "too much young", "enough young"], "too young", "Too + adjective."),
      q("Choose the correct sentence.", ["There are too many people and not enough jobs.", "There are too much people and not jobs enough.", "There are too many people and not jobs enough.", "There is too many people and enough not jobs."], "There are too many people and not enough jobs.", "Too many + plural; enough + noun."),
      q("What does “affordable” mean?", ["cheap enough for ordinary people", "very expensive", "free", "very big"], "cheap enough for ordinary people", "Affordable = not too expensive."),
      q("Complete: The ___ of Vietnam is about 100 million.", ["population", "people number", "polulation", "crowd"], "population", "Population = number of people."),
    ],
  }, {
    key: "deduction", title: "It Must Be Hers", titleVi: "Phỏng đoán với must, might, can't",
    objectives: [
      "I can make guesses about the present from what I can see.",
      "Use must for near certainty and can't for something impossible",
      "Use might, may and could for things that are possible",
    ],
    vocabulary: [
      { word: "evidence", ipa: "/ˈevɪdəns/", partOfSpeech: "noun", vietnamese: "bằng chứng", definition: "facts or signs that show something is true", example: { english: "There's no evidence that he took the money.", vietnamese: "Không có bằng chứng anh ta đã lấy tiền." } },
      { word: "clue", ipa: "/kluː/", partOfSpeech: "noun", vietnamese: "manh mối", definition: "something that helps you find the answer", example: { english: "The police found an important clue.", vietnamese: "Cảnh sát tìm thấy một manh mối quan trọng." } },
      { word: "mystery", ipa: "/ˈmɪstri/", partOfSpeech: "noun", vietnamese: "điều bí ẩn", definition: "something strange that nobody can explain", example: { english: "How the cat got onto the roof is a mystery.", vietnamese: "Con mèo lên mái nhà bằng cách nào vẫn là điều bí ẩn." } },
      { word: "belong to", ipa: "/bɪˈlɒŋ tə/", partOfSpeech: "phrasal verb", vietnamese: "thuộc về", definition: "to be owned by someone", example: { english: "This umbrella must belong to the teacher.", vietnamese: "Chiếc ô này chắc là của cô giáo." } },
      { word: "obviously", ipa: "/ˈɒbviəsli/", partOfSpeech: "adverb", vietnamese: "rõ ràng là", definition: "in a way that is easy to see or understand", example: { english: "She's obviously tired. She keeps yawning.", vietnamese: "Rõ ràng là cô ấy mệt. Cô ấy cứ ngáp mãi." } },
      { word: "definitely", ipa: "/ˈdefɪnətli/", partOfSpeech: "adverb", vietnamese: "chắc chắn", definition: "without any doubt", example: { english: "It's definitely going to rain. Look at those clouds.", vietnamese: "Chắc chắn trời sẽ mưa. Nhìn mây kìa." } },
      { word: "exhausted", ipa: "/ɪɡˈzɔːstɪd/", partOfSpeech: "adjective", vietnamese: "kiệt sức", definition: "extremely tired", example: { english: "You must be exhausted after the long flight.", vietnamese: "Chắc bạn kiệt sức sau chuyến bay dài." } },
      { word: "joke", ipa: "/dʒəʊk/", partOfSpeech: "verb", vietnamese: "nói đùa", definition: "to say something to make people laugh, not seriously", example: { english: "You won the lottery? You must be joking!", vietnamese: "Bạn trúng xổ số á? Chắc bạn đùa!" } },
    ],
    grammar: [{
      title: "Must and can't",
      pattern: "must + verb = I'm almost sure it's true · can't + verb = I'm almost sure it's not true",
      explanation: {
        english: "Use must when the evidence makes you almost sure: The lights are on. They must be at home. The opposite is can't, not mustn't: The lights are off. They can't be at home. Mustn't means “it is not allowed”, so it is never used for guesses.",
        vietnamese: "Dùng must khi bằng chứng khiến bạn gần như chắc chắn: The lights are on. They must be at home. Ngược lại là can't, không phải mustn't: The lights are off. They can't be at home. Mustn't nghĩa là “không được phép”, nên không bao giờ dùng để phỏng đoán.",
      },
      examples: [
        { english: "He's been working for twelve hours. He must be exhausted.", vietnamese: "Anh ấy đã làm việc mười hai tiếng. Chắc anh ấy kiệt sức rồi." },
        { english: "That can't be Minh. He's in Australia this week.", vietnamese: "Đó không thể là Minh được. Tuần này anh ấy ở Úc." },
      ],
      mistake: {
        wrong: "Her car isn't here, so she mustn't be at work.", right: "Her car isn't here, so she can't be at work.",
        why: { english: "For a negative guess, use can't. Mustn't means “not allowed”.", vietnamese: "Phỏng đoán phủ định dùng can't. Mustn't nghĩa là “không được phép”." },
      },
    }, {
      title: "Might, may, could",
      pattern: "might / may / could + base verb = perhaps it's true · might not / may not = perhaps it isn't",
      explanation: {
        english: "When you are not sure, use might, may or could with the base verb: She might be at the gym. It could be his phone. For a negative, use might not or may not: He may not know about it. After these words the verb never takes -s, and you don't add maybe as well.",
        vietnamese: "Khi không chắc, dùng might, may hoặc could với động từ nguyên mẫu: She might be at the gym. It could be his phone. Phủ định dùng might not hoặc may not: He may not know about it. Sau các từ này, động từ không bao giờ thêm -s, và không cần thêm maybe nữa.",
      },
      examples: [
        { english: "Take a coat. It might get cold later.", vietnamese: "Mang áo khoác đi. Lát nữa có thể trời lạnh." },
        { english: "I'm not sure whose key this is. It could belong to Lan.", vietnamese: "Mình không chắc chìa khoá này của ai. Có thể là của Lan." },
      ],
      mistake: {
        wrong: "He might is in a meeting.", right: "He might be in a meeting.",
        why: { english: "After might, use the base verb: be, not is.", vietnamese: "Sau might dùng động từ nguyên mẫu: be, không phải is." },
      },
    }],
    examples: [
      { english: "These footprints are huge. They must belong to a big dog.", vietnamese: "Dấu chân này to quá. Chắc là của một con chó lớn." },
      { english: "There's no evidence, so the story might not be true.", vietnamese: "Không có bằng chứng, nên câu chuyện có thể không đúng." },
      { english: "He's obviously upset. Something must have happened.", vietnamese: "Rõ ràng là anh ấy buồn. Chắc có chuyện gì đó đã xảy ra." },
      { english: "It's a mystery, but there might be a clue in the letter.", vietnamese: "Đó là một điều bí ẩn, nhưng có thể có manh mối trong lá thư." },
    ],
    dialogue: [
      { speaker: "Sam", english: "Whose phone is this? It was on my desk.", vietnamese: "Điện thoại này của ai thế? Nó nằm trên bàn mình." },
      { speaker: "Hien", english: "It can't be Long's. He has an old one.", vietnamese: "Không thể là của Long. Anh ấy dùng máy cũ." },
      { speaker: "Sam", english: "It's got a pink case. It might be Mai's.", vietnamese: "Nó có ốp màu hồng. Có thể là của Mai." },
      { speaker: "Hien", english: "Look, there's a photo of a cat on the screen.", vietnamese: "Nhìn này, màn hình có ảnh một con mèo." },
      { speaker: "Sam", english: "Mai's got three cats. It must be hers!", vietnamese: "Mai có ba con mèo. Chắc chắn là của cô ấy rồi!" },
      { speaker: "Hien", english: "She must be looking for it everywhere.", vietnamese: "Chắc cô ấy đang tìm khắp nơi." },
    ],
    practice: [
      q("He's been running for two hours. He ___ be tired.", ["must", "can't", "mustn't", "might not"], "must", "Almost sure it's true: must."),
      q("She's in Paris today. That ___ be her in the café.", ["can't", "mustn't", "must", "might"], "can't", "Almost sure it's not true: can't."),
      q("Complete: I'm not sure. It ___ be in your bag.", ["might", "must to", "can't", "might is"], "might", "Not sure: might."),
      q("“Manh mối” in English is…", ["clue", "glue", "evidence road", "mystery"], "clue", "Clue = something that helps find the answer."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["She may not know the answer.", "She may not knows the answer.", "She mays not know the answer.", "Maybe she may not know the answer."], "She may not know the answer.", "May not + base verb."),
      q("Choose the correct sentence.", ["The shop's dark. It can't be open.", "The shop's dark. It mustn't be open.", "The shop's dark. It must not open be.", "The shop's dark. It can't is open."], "The shop's dark. It can't be open.", "Negative guess: can't."),
      q("Complete: You've just finished a marathon? You ___ be exhausted!", ["must", "can't", "mustn't", "might not"], "must", "Almost sure: must."),
      q("Complete: Whose bike is this? It might ___ to my neighbour.", ["belong", "belongs", "belonging", "be belong"], "belong", "Might + base verb."),
      q("What does “obviously” mean?", ["in a way that is easy to see", "secretly", "maybe", "slowly"], "in a way that is easy to see", "Obviously = clearly."),
    ],
  }, {
    key: "contrast", title: "Although and However", titleVi: "Although và however",
    objectives: [
      "I can show contrast between two ideas in speaking and writing.",
      "Use although and even though without but",
      "Use however, despite and in spite of correctly",
    ],
    vocabulary: [
      { word: "although", ipa: "/ɔːlˈðəʊ/", partOfSpeech: "conjunction", vietnamese: "mặc dù", definition: "used to join two ideas that are surprising together", example: { english: "Although it was raining, we went for a walk.", vietnamese: "Mặc dù trời mưa, chúng tôi vẫn đi dạo." } },
      { word: "even though", ipa: "/ˌiːvn ˈðəʊ/", partOfSpeech: "conjunction", vietnamese: "mặc dù (nhấn mạnh)", definition: "a stronger way of saying although", example: { english: "He went to work even though he was ill.", vietnamese: "Anh ấy vẫn đi làm dù đang ốm." } },
      { word: "however", ipa: "/haʊˈevə/", partOfSpeech: "adverb", vietnamese: "tuy nhiên", definition: "used to add a fact that is different from what you just said", example: { english: "The hotel was cheap. However, it was very noisy.", vietnamese: "Khách sạn rẻ. Tuy nhiên, nó rất ồn." } },
      { word: "despite", ipa: "/dɪˈspaɪt/", partOfSpeech: "preposition", vietnamese: "bất chấp, mặc dù", definition: "without being stopped by something; followed by a noun or -ing", example: { english: "Despite the heat, the market was full of people.", vietnamese: "Bất chấp cái nóng, chợ vẫn đông nghịt người." } },
      { word: "in spite of", ipa: "/ɪn ˈspaɪt əv/", partOfSpeech: "preposition", vietnamese: "mặc dù, bất chấp", definition: "the same as despite", example: { english: "In spite of the traffic, we arrived on time.", vietnamese: "Mặc dù tắc đường, chúng tôi vẫn đến đúng giờ." } },
      { word: "whereas", ipa: "/ˌweərˈæz/", partOfSpeech: "conjunction", vietnamese: "trong khi (đó)", definition: "used to compare two different facts", example: { english: "The north has four seasons, whereas the south has two.", vietnamese: "Miền Bắc có bốn mùa, trong khi miền Nam có hai mùa." } },
      { word: "on the other hand", ipa: "/ɒn ði ˈʌðə hænd/", partOfSpeech: "phrase", vietnamese: "mặt khác", definition: "used to give the opposite side of an argument", example: { english: "City life is exciting. On the other hand, it's stressful.", vietnamese: "Cuộc sống thành phố sôi động. Mặt khác, nó căng thẳng." } },
      { word: "advantage", ipa: "/ədˈvɑːntɪdʒ/", partOfSpeech: "noun", vietnamese: "ưu điểm, lợi thế", definition: "something good that helps you", example: { english: "One advantage of the countryside is the fresh air.", vietnamese: "Một ưu điểm của nông thôn là không khí trong lành." } },
    ],
    grammar: [{
      title: "Although and even though",
      pattern: "Although / Even though + subject + verb, + main clause (no but)",
      explanation: {
        english: "Although and even though join two clauses that seem to go against each other. Vietnamese says “Mặc dù… nhưng…”, but English uses only one linking word: although or but, never both. Although it was late, we kept working. Or: It was late, but we kept working. Even though is stronger.",
        vietnamese: "Although và even though nối hai mệnh đề có vẻ trái ngược nhau. Tiếng Việt nói “Mặc dù… nhưng…”, còn tiếng Anh chỉ dùng một từ nối: although hoặc but, không bao giờ dùng cả hai. Although it was late, we kept working. Hoặc: It was late, but we kept working. Even though mang nghĩa mạnh hơn.",
      },
      examples: [
        { english: "Although the flat is small, it's very bright.", vietnamese: "Mặc dù căn hộ nhỏ, nó rất sáng sủa." },
        { english: "She didn't get the job even though she had the best results.", vietnamese: "Cô ấy không được nhận dù có kết quả tốt nhất." },
      ],
      mistake: {
        wrong: "Although it rained, but we went to the beach.", right: "Although it rained, we went to the beach.",
        why: { english: "Use although or but, not both.", vietnamese: "Dùng although hoặc but, không dùng cả hai." },
      },
    }, {
      title: "However, despite, in spite of",
      pattern: "Sentence. However, sentence. · Despite / In spite of + noun or -ing (not + subject + verb)",
      explanation: {
        english: "However usually starts a new sentence and has a comma after it: The food was good. However, the service was slow. Despite and in spite of are followed by a noun or an -ing form, not a full clause: despite the rain, despite being tired. To use a clause, choose although instead.",
        vietnamese: "However thường đứng đầu câu mới và có dấu phẩy phía sau: The food was good. However, the service was slow. Despite và in spite of đi với danh từ hoặc dạng -ing, không đi với cả mệnh đề: despite the rain, despite being tired. Muốn dùng mệnh đề, hãy chọn although.",
      },
      examples: [
        { english: "Despite being tired, he finished the report.", vietnamese: "Dù mệt, anh ấy vẫn hoàn thành bản báo cáo." },
        { english: "The plan is good. However, it's too expensive.", vietnamese: "Kế hoạch hay. Tuy nhiên, nó quá tốn kém." },
      ],
      mistake: {
        wrong: "Despite it was cold, we swam in the sea.", right: "Despite the cold, we swam in the sea.",
        why: { english: "Despite takes a noun or -ing, not subject + verb.", vietnamese: "Despite đi với danh từ hoặc -ing, không đi với chủ ngữ + động từ." },
      },
    }],
    examples: [
      { english: "One advantage of the bus is the price. On the other hand, it's slow.", vietnamese: "Một ưu điểm của xe buýt là giá rẻ. Mặt khác, nó chậm." },
      { english: "My brother loves the city, whereas I prefer the countryside.", vietnamese: "Anh trai tôi thích thành phố, trong khi tôi thích nông thôn hơn." },
      { english: "In spite of the storm, the ferry left on time.", vietnamese: "Mặc dù có bão, phà vẫn khởi hành đúng giờ." },
      { english: "Even though I've lived here for years, I still get lost.", vietnamese: "Dù đã sống ở đây nhiều năm, tôi vẫn bị lạc." },
    ],
    dialogue: [
      { speaker: "Kate", english: "Would you rather live in the city or the countryside?", vietnamese: "Bạn thích sống ở thành phố hay nông thôn hơn?" },
      { speaker: "Vinh", english: "The city, although it's noisy and crowded.", vietnamese: "Thành phố, dù nó ồn và đông." },
      { speaker: "Kate", english: "Really? The countryside has so many advantages.", vietnamese: "Thật sao? Nông thôn có biết bao ưu điểm." },
      { speaker: "Vinh", english: "That's true. However, there aren't many jobs there.", vietnamese: "Đúng vậy. Tuy nhiên, ở đó không có nhiều việc làm." },
      { speaker: "Kate", english: "My parents moved to a village despite having jobs in Hanoi.", vietnamese: "Bố mẹ mình chuyển về quê dù đang có việc ở Hà Nội." },
      { speaker: "Vinh", english: "Lucky them! On the other hand, I'd miss the street food.", vietnamese: "Họ sướng thật! Mặt khác, mình sẽ nhớ đồ ăn đường phố lắm." },
    ],
    practice: [
      q("Choose the correct sentence.", ["Although he was tired, he kept walking.", "Although he was tired, but he kept walking.", "Although tired he was, but he kept walking.", "Although he was tired, however he kept walking."], "Although he was tired, he kept walking.", "Although without but."),
      q("Complete: ___ the rain, we enjoyed the trip.", ["Despite", "Although", "However", "Even though"], "Despite", "Despite + noun."),
      q("Complete: The phone is cheap. ___, the battery is terrible.", ["However", "Although", "Despite", "Whereas"], "However", "However starts a new sentence."),
      q("“Mặt khác” in English is…", ["on the other hand", "on another side", "other face", "in other hand"], "on the other hand", "On the other hand = the opposite side."),
    ],
    challenge: [
      q("Complete: In spite of ___ ill, she came to the party.", ["being", "she was", "be", "she is"], "being", "In spite of + -ing."),
      q("Complete: I like tea, ___ my sister prefers coffee.", ["whereas", "despite", "however", "in spite of"], "whereas", "Whereas compares two facts."),
      q("Choose the correct sentence.", ["Even though it was expensive, we bought it.", "Even it was expensive, we bought it.", "Even though it was expensive, but we bought it.", "Despite it was expensive, we bought it."], "Even though it was expensive, we bought it.", "Even though + clause, no but."),
      q("Choose the correct sentence.", ["Despite the noise, I slept well.", "Despite there was noise, I slept well.", "Despite of the noise, I slept well.", "In spite the noise, I slept well."], "Despite the noise, I slept well.", "Despite + noun, no of."),
      q("What is an “advantage”?", ["something good that helps you", "a problem", "a price", "an argument"], "something good that helps you", "Advantage = a good point."),
    ],
  }, {
    key: "agreeing-and-disagreeing", title: "I See Your Point, But…", titleVi: "Đồng ý và phản đối",
    objectives: [
      "I can agree and disagree politely in a discussion.",
      "Use agree as a verb: I agree, I don't agree",
      "Answer with So do I, Me neither and polite phrases for disagreeing",
    ],
    vocabulary: [
      { word: "agree", ipa: "/əˈɡriː/", partOfSpeech: "verb", vietnamese: "đồng ý", definition: "to have the same opinion as someone", example: { english: "I agree with you about the new park.", vietnamese: "Tôi đồng ý với bạn về công viên mới." } },
      { word: "disagree", ipa: "/ˌdɪsəˈɡriː/", partOfSpeech: "verb", vietnamese: "không đồng ý", definition: "to have a different opinion from someone", example: { english: "My parents often disagree about money.", vietnamese: "Bố mẹ tôi thường bất đồng về chuyện tiền bạc." } },
      { word: "point", ipa: "/pɔɪnt/", partOfSpeech: "noun", vietnamese: "ý, luận điểm", definition: "an idea or opinion in a discussion", example: { english: "That's a good point. I hadn't thought of that.", vietnamese: "Đó là một ý hay. Tôi chưa nghĩ đến điều đó." } },
      { word: "argument", ipa: "/ˈɑːɡjumənt/", partOfSpeech: "noun", vietnamese: "lập luận; cuộc cãi nhau", definition: "a reason for an opinion, or an angry discussion", example: { english: "There are strong arguments for banning cars from the old town.", vietnamese: "Có những lập luận mạnh mẽ cho việc cấm ô tô vào phố cổ." } },
      { word: "convince", ipa: "/kənˈvɪns/", partOfSpeech: "verb", vietnamese: "thuyết phục", definition: "to make someone believe something", example: { english: "She convinced me to try the vegetarian menu.", vietnamese: "Cô ấy thuyết phục tôi thử thực đơn chay." } },
      { word: "compromise", ipa: "/ˈkɒmprəmaɪz/", partOfSpeech: "noun", vietnamese: "sự thoả hiệp", definition: "an agreement where each side gets part of what it wants", example: { english: "After a long discussion, we reached a compromise.", vietnamese: "Sau một cuộc thảo luận dài, chúng tôi đạt được thoả hiệp." } },
      { word: "debate", ipa: "/dɪˈbeɪt/", partOfSpeech: "noun", vietnamese: "cuộc tranh luận", definition: "a formal discussion where people give different opinions", example: { english: "Our class had a debate about school uniforms.", vietnamese: "Lớp tôi có một cuộc tranh luận về đồng phục học sinh." } },
      { word: "fair", ipa: "/feə/", partOfSpeech: "adjective", vietnamese: "công bằng; hợp lý", definition: "treating people equally; reasonable", example: { english: "That's fair. You paid last time, so I'll pay today.", vietnamese: "Thế là công bằng. Lần trước bạn trả rồi, hôm nay để tôi." } },
    ],
    grammar: [{
      title: "Agree is a verb",
      pattern: "I agree (with you / that …) · I don't agree · I disagree (not I'm agree / I'm not agree)",
      explanation: {
        english: "Agree is a verb, not an adjective, so there is no am or is before it: I agree with you. The negative uses don't: I don't agree. To disagree politely, soften it first: I see your point, but… / I'm not sure about that. / That's true, but…",
        vietnamese: "Agree là động từ, không phải tính từ, nên không có am hay is đứng trước: I agree with you. Phủ định dùng don't: I don't agree. Để phản đối lịch sự, hãy nói nhẹ nhàng trước: I see your point, but… / I'm not sure about that. / That's true, but…",
      },
      examples: [
        { english: "I agree that we need more cycle lanes.", vietnamese: "Tôi đồng ý rằng chúng ta cần thêm làn đường cho xe đạp." },
        { english: "I see your point, but I don't think it will work.", vietnamese: "Tôi hiểu ý bạn, nhưng tôi không nghĩ nó sẽ hiệu quả." },
      ],
      mistake: {
        wrong: "I'm agree with you.", right: "I agree with you.",
        why: { english: "Agree is a verb, so don't add am.", vietnamese: "Agree là động từ, nên không thêm am." },
      },
    }, {
      title: "So do I, me neither",
      pattern: "positive: So do I / Me too · negative: Neither do I / Me neither",
      explanation: {
        english: "To agree with a positive sentence, say So do I or Me too: “I love this city.” “So do I.” To agree with a negative sentence, say Neither do I or Me neither: “I don't like the heat.” “Me neither.” Me too after a negative sounds wrong. Change do to the verb in the sentence: “I'm tired.” “So am I.”",
        vietnamese: "Để đồng tình với câu khẳng định, nói So do I hoặc Me too: “I love this city.” “So do I.” Để đồng tình với câu phủ định, nói Neither do I hoặc Me neither: “I don't like the heat.” “Me neither.” Nói Me too sau câu phủ định là sai. Đổi do theo động từ trong câu: “I'm tired.” “So am I.”",
      },
      examples: [
        { english: "“I can't stand traffic jams.” “Neither can I.”", vietnamese: "“Tôi không chịu nổi tắc đường.” “Tôi cũng vậy.”" },
        { english: "“I've been to Sa Pa.” “So have I!”", vietnamese: "“Tôi đã đến Sa Pa rồi.” “Tôi cũng thế!”" },
      ],
      mistake: {
        wrong: "“I don't eat meat.” “Me too.”", right: "“I don't eat meat.” “Me neither.”",
        why: { english: "After a negative sentence, agree with Me neither or Neither do I.", vietnamese: "Sau câu phủ định, đồng tình bằng Me neither hoặc Neither do I." },
      },
    }],
    examples: [
      { english: "That's a fair point, but the argument against it is stronger.", vietnamese: "Ý đó hợp lý, nhưng lập luận phản đối mạnh hơn." },
      { english: "You haven't convinced me, but I'm happy to listen.", vietnamese: "Bạn chưa thuyết phục được tôi, nhưng tôi sẵn lòng lắng nghe." },
      { english: "We disagreed at first, but we found a compromise.", vietnamese: "Lúc đầu chúng tôi bất đồng, nhưng đã tìm được thoả hiệp." },
      { english: "The debate about plastic bags went on for two hours.", vietnamese: "Cuộc tranh luận về túi ni-lông kéo dài hai tiếng." },
    ],
    dialogue: [
      { speaker: "Lucy", english: "I think the city should ban motorbikes from the centre.", vietnamese: "Mình nghĩ thành phố nên cấm xe máy vào trung tâm." },
      { speaker: "Tuan", english: "I see your point, but how would people get to work?", vietnamese: "Mình hiểu ý bạn, nhưng mọi người sẽ đi làm bằng gì?" },
      { speaker: "Lucy", english: "By metro and bus. The air would be much cleaner.", vietnamese: "Bằng tàu điện và xe buýt. Không khí sẽ sạch hơn nhiều." },
      { speaker: "Tuan", english: "That's true. I don't like the pollution either.", vietnamese: "Đúng vậy. Mình cũng không thích ô nhiễm." },
      { speaker: "Lucy", english: "So maybe a ban at weekends first? That's a fair compromise.", vietnamese: "Vậy có lẽ cấm vào cuối tuần trước? Đó là một thoả hiệp hợp lý." },
      { speaker: "Tuan", english: "OK, I agree with that. You've convinced me!", vietnamese: "Được, mình đồng ý. Bạn thuyết phục được mình rồi!" },
    ],
    practice: [
      q("Choose the correct sentence.", ["I agree with you.", "I'm agree with you.", "I am agreeing you.", "I agree you with."], "I agree with you.", "Agree is a verb."),
      q("“I love spicy food.” “___.”", ["So do I", "Neither do I", "Me neither", "So am I"], "So do I", "Positive: So do I."),
      q("“I don't like horror films.” “___.”", ["Me neither", "Me too", "So do I", "So don't I"], "Me neither", "Negative: Me neither."),
      q("“Sự thoả hiệp” in English is…", ["compromise", "promise", "agreement paper", "convince"], "compromise", "Compromise = each side gets part."),
    ],
    challenge: [
      q("Choose the most polite way to disagree.", ["I see your point, but I'm not sure.", "You're wrong.", "That's stupid.", "No."], "I see your point, but I'm not sure.", "Soften before disagreeing."),
      q("Choose the correct sentence.", ["I don't agree with the new rule.", "I'm not agree with the new rule.", "I not agree with the new rule.", "I don't agreeing the new rule."], "I don't agree with the new rule.", "Negative: don't agree."),
      q("“I'm hungry.” “___.”", ["So am I", "So do I", "Neither am I", "Me neither"], "So am I", "Match the verb: am."),
      q("Complete: She finally ___ me to join the club.", ["convinced", "agreed", "disagreed", "debated"], "convinced", "Convince someone to do something."),
      q("What is a “debate”?", ["a formal discussion with different opinions", "a kind of exam", "a party", "a news headline"], "a formal discussion with different opinions", "Debate = formal discussion."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 6", isReview: true,
    objectives: [
      "I can discuss problems in society and the environment, guess, contrast and give my view politely.",
      "Check uncountable nouns, too and enough, must and can't, although and despite, and agree",
    ],
    vocabulary: [
      { word: "pollution", ipa: "/pəˈluːʃn/", partOfSpeech: "noun", vietnamese: "sự ô nhiễm", definition: "dirty or harmful substances in the air, water or land", example: { english: "Noise is a kind of pollution too.", vietnamese: "Tiếng ồn cũng là một dạng ô nhiễm." } },
      { word: "crowded", ipa: "/ˈkraʊdɪd/", partOfSpeech: "adjective", vietnamese: "đông đúc", definition: "full of people", example: { english: "The beach gets very crowded in summer.", vietnamese: "Bãi biển rất đông vào mùa hè." } },
      { word: "evidence", ipa: "/ˈevɪdəns/", partOfSpeech: "noun", vietnamese: "bằng chứng", definition: "facts or signs that show something is true", example: { english: "Scientists have strong evidence of climate change.", vietnamese: "Các nhà khoa học có bằng chứng rõ ràng về biến đổi khí hậu." } },
      { word: "however", ipa: "/haʊˈevə/", partOfSpeech: "adverb", vietnamese: "tuy nhiên", definition: "used to add a fact that is different from what you just said", example: { english: "Electric cars are clean. However, they are expensive.", vietnamese: "Ô tô điện sạch. Tuy nhiên, chúng đắt." } },
      { word: "compromise", ipa: "/ˈkɒmprəmaɪz/", partOfSpeech: "noun", vietnamese: "sự thoả hiệp", definition: "an agreement where each side gets part of what it wants", example: { english: "A good compromise makes everyone a little happy.", vietnamese: "Một sự thoả hiệp tốt khiến ai cũng vui một chút." } },
      { word: "protect", ipa: "/prəˈtekt/", partOfSpeech: "verb", vietnamese: "bảo vệ", definition: "to keep someone or something safe from harm", example: { english: "Sun cream protects your skin.", vietnamese: "Kem chống nắng bảo vệ làn da của bạn." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "a lot of pollution · too many people / big enough · can't be (not mustn't be) · Although …, (no but) · I agree (not I'm agree)",
      explanation: {
        english: "Check these: pollution, waste and rubbish are uncountable, and should takes the base verb; too many goes with plurals, too much with uncountables, and enough goes after adjectives but before nouns; must is for near certainty, can't for the opposite, and might for maybe; although never pairs with but, and despite takes a noun or -ing; agree is a verb, and after a negative say Me neither.",
        vietnamese: "Hãy kiểm tra: pollution, waste và rubbish không đếm được, và sau should là động từ nguyên mẫu; too many đi với số nhiều, too much với danh từ không đếm được, còn enough đứng sau tính từ nhưng trước danh từ; must dùng khi gần như chắc chắn, can't cho điều ngược lại, might cho điều có thể; although không đi với but, và despite đi với danh từ hoặc -ing; agree là động từ, và sau câu phủ định thì nói Me neither.",
      },
      examples: [
        { english: "Although the city is crowded, there isn't enough public transport.", vietnamese: "Mặc dù thành phố đông đúc, lại không có đủ phương tiện công cộng." },
        { english: "The river smells terrible. There must be a lot of pollution.", vietnamese: "Con sông bốc mùi kinh khủng. Chắc hẳn ô nhiễm nặng lắm." },
      ],
    }],
    examples: [
      { english: "There's evidence that green spaces protect us from heat.", vietnamese: "Có bằng chứng rằng không gian xanh bảo vệ chúng ta khỏi cái nóng." },
      { english: "The market is crowded. However, the prices are good.", vietnamese: "Chợ đông đúc. Tuy nhiên, giá cả hợp lý." },
      { english: "Despite the pollution, I agree that the city has a lot to offer.", vietnamese: "Bất chấp ô nhiễm, tôi đồng ý rằng thành phố có nhiều điều tuyệt vời." },
    ],
    dialogue: [
      { speaker: "Jack", english: "Our town council wants to build a car park on the old field.", vietnamese: "Hội đồng thị trấn muốn xây bãi đỗ xe trên bãi đất cũ." },
      { speaker: "Ngoc", english: "That can't be a good idea. We don't have enough green space.", vietnamese: "Đó không thể là ý hay được. Chúng ta không có đủ không gian xanh." },
      { speaker: "Jack", english: "I agree. However, the streets are too crowded with cars.", vietnamese: "Mình đồng ý. Tuy nhiên, đường phố đầy ắp ô tô." },
      { speaker: "Ngoc", english: "Although that's true, a car park won't reduce pollution.", vietnamese: "Dù điều đó đúng, bãi đỗ xe sẽ không giảm ô nhiễm." },
      { speaker: "Jack", english: "We should protect the field and improve the buses.", vietnamese: "Chúng ta nên bảo vệ bãi đất và cải thiện xe buýt." },
      { speaker: "Ngoc", english: "Or build a small car park and keep half as a park. A compromise!", vietnamese: "Hoặc xây bãi đỗ nhỏ và giữ một nửa làm công viên. Một sự thoả hiệp!" },
      { speaker: "Jack", english: "Good point. Let's suggest it at the meeting.", vietnamese: "Ý hay. Mình đề xuất ở cuộc họp nhé." },
    ],
    practice: [
      q("Complete: There's too ___ rubbish in the streets.", ["much", "many", "enough", "lot"], "much", "Uncountable: too much."),
      q("Complete: The bus isn't ___ for all of us.", ["big enough", "enough big", "too big", "big too"], "big enough", "Adjective + enough."),
      q("Her bag's still here. She ___ be in the building.", ["must", "can't", "mustn't", "might not"], "must", "Almost sure: must."),
      q("Complete: ___ the traffic, we arrived early.", ["Despite", "Although", "However", "Even though"], "Despite", "Despite + noun."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["We should protect our rivers.", "We should to protect our rivers.", "We should protecting our rivers.", "We should protects our rivers."], "We should protect our rivers.", "Should + base verb."),
      q("Choose the correct sentence.", ["Although it was expensive, I bought it.", "Although it was expensive, but I bought it.", "Despite it was expensive, I bought it.", "However it was expensive, but I bought it."], "Although it was expensive, I bought it.", "Although without but."),
      q("He's in Hanoi today. That ___ be him in Da Lat.", ["can't", "mustn't", "must", "should"], "can't", "Negative guess: can't."),
      q("“I can't swim.” “___.”", ["Neither can I", "So can I", "Me too", "Neither do I"], "Neither can I", "Negative, match can."),
      q("Choose the correct sentence.", ["I don't agree, but I see your point.", "I'm not agree, but I see your point.", "I not agree, but I see your point.", "I'm disagree, but I see your point."], "I don't agree, but I see your point.", "Agree is a verb."),
    ],
  }],
  assessment: [
    { id: "uncountable", prompt: "Complete: There's a lot of ___ in the air.", options: ["pollution", "pollutions", "a pollution", "many pollution"], correct: "pollution", explanation: "Pollution is uncountable." },
    { id: "should-base", prompt: "Complete: We should ___ less plastic.", options: ["use", "to use", "using", "uses"], correct: "use", explanation: "Should + base verb." },
    { id: "dont-have-to", prompt: "“Không cần phải mang theo túi.” in English is…", options: ["You don't have to bring a bag.", "You mustn't bring a bag.", "You shouldn't to bring a bag.", "You haven't bring a bag."], correct: "You don't have to bring a bag.", explanation: "Don't have to = not necessary." },
    { id: "too-many", prompt: "Complete: There are too ___ tourists in the old town.", options: ["many", "much", "enough", "lot"], correct: "many", explanation: "Plural: too many." },
    { id: "too-much", prompt: "Complete: There's too ___ traffic.", options: ["much", "many", "enough", "lots"], correct: "much", explanation: "Uncountable: too much." },
    { id: "adjective-enough", prompt: "Choose the correct sentence.", options: ["He isn't old enough to drive.", "He isn't enough old to drive.", "He isn't old to enough drive.", "He isn't too old enough to drive."], correct: "He isn't old enough to drive.", explanation: "Adjective + enough." },
    { id: "enough-noun", prompt: "Complete: We haven't got ___.", options: ["enough time", "time enough of", "enough of time", "too time"], correct: "enough time", explanation: "Enough + noun." },
    { id: "must", prompt: "You've worked all night. You ___ be exhausted.", options: ["must", "can't", "mustn't", "might not"], correct: "must", explanation: "Almost sure: must." },
    { id: "cant", prompt: "The shop's closed on Sundays. It ___ be open now.", options: ["can't", "mustn't", "must", "might"], correct: "can't", explanation: "Negative guess: can't." },
    { id: "might-base", prompt: "Choose the correct sentence.", options: ["She might be at the library.", "She might is at the library.", "She mights be at the library.", "She might to be at the library."], correct: "She might be at the library.", explanation: "Might + base verb." },
    { id: "although-no-but", prompt: "“Mặc dù mệt, nhưng anh ấy vẫn làm việc.” in English is…", options: ["Although he was tired, he kept working.", "Although he was tired, but he kept working.", "Despite he was tired, he kept working.", "However he was tired, he kept working."], correct: "Although he was tired, he kept working.", explanation: "Although without but." },
    { id: "despite-noun", prompt: "Complete: ___ the rain, the match continued.", options: ["Despite", "Although", "Even though", "However"], correct: "Despite", explanation: "Despite + noun." },
    { id: "however", prompt: "Complete: The room was nice. ___, it was too small.", options: ["However", "Although", "Despite", "Even though"], correct: "However", explanation: "However starts a new sentence." },
    { id: "agree-verb", prompt: "“Tôi đồng ý với bạn.” in English is…", options: ["I agree with you.", "I'm agree with you.", "I am agree you.", "I agreeing with you."], correct: "I agree with you.", explanation: "Agree is a verb." },
    { id: "me-neither", prompt: "“I don't like crowded places.” “___.”", options: ["Me neither", "Me too", "So do I", "So don't I"], correct: "Me neither", explanation: "Negative: Me neither." },
  ],
};
