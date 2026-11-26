// C1 Unit 4: Culture & the Arts. Advanced Vietnamese speakers often say "I was boring by the film" for bored; write
// "Although strange it may seem" instead of "Strange as it may seem"; say "However I try hard" for "However hard I
// try"; mix up mis- and dis- or over- and out- ("disunderstand", "overnumber"); say "I don't hope so" for "I hope
// not" and repeat whole verb phrases instead of using so, do so or one; and translate images word for word ("as
// busy as a bee" becomes "as busy as an ant"). This unit puts those right for talking and writing about the arts.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "C1",
  number: 4,
  lessons: [{
    key: "reviews", title: "A Gripping Read", titleVi: "Viết bài bình luận",
    objectives: [
      "I can write a lively review of a book, film or exhibition.",
      "Use precise evaluative adjectives instead of good, bad and interesting",
      "Soften or sharpen a judgement with adverbs: hugely, mildly, somewhat, utterly",
    ],
    vocabulary: [
      { word: "gripping", ipa: "/ˈɡrɪpɪŋ/", partOfSpeech: "adjective", vietnamese: "cuốn hút, hấp dẫn", definition: "so exciting that you want to keep reading or watching", example: { english: "It's a gripping thriller from start to finish.", vietnamese: "Đó là một phim ly kỳ cuốn hút từ đầu đến cuối." } },
      { word: "thought-provoking", ipa: "/ˈθɔːt prəvəʊkɪŋ/", partOfSpeech: "adjective", vietnamese: "gợi suy ngẫm", definition: "making you think seriously about something", example: { english: "The documentary is thought-provoking.", vietnamese: "Bộ phim tài liệu đó gợi nhiều suy ngẫm." } },
      { word: "far-fetched", ipa: "/ˌfɑː ˈfetʃt/", partOfSpeech: "adjective", vietnamese: "khó tin, phi lý", definition: "very unlikely to be true", example: { english: "The plot is rather far-fetched.", vietnamese: "Cốt truyện khá khó tin." } },
      { word: "predictable", ipa: "/prɪˈdɪktəbl/", partOfSpeech: "adjective", vietnamese: "dễ đoán", definition: "happening in the way you expect, so not exciting", example: { english: "The ending was disappointingly predictable.", vietnamese: "Cái kết dễ đoán đến mức đáng thất vọng." } },
      { word: "moving", ipa: "/ˈmuːvɪŋ/", partOfSpeech: "adjective", vietnamese: "cảm động", definition: "causing strong feelings of sadness or sympathy", example: { english: "Her performance was deeply moving.", vietnamese: "Màn trình diễn của cô ấy vô cùng cảm động." } },
      { word: "plot", ipa: "/plɒt/", partOfSpeech: "noun", vietnamese: "cốt truyện", definition: "the series of events in a story", example: { english: "The plot has too many twists.", vietnamese: "Cốt truyện có quá nhiều tình tiết bất ngờ." } },
      { word: "acclaimed", ipa: "/əˈkleɪmd/", partOfSpeech: "adjective", vietnamese: "được ca ngợi", definition: "publicly praised by critics", example: { english: "It's the director's most acclaimed film.", vietnamese: "Đó là bộ phim được ca ngợi nhất của đạo diễn." } },
      { word: "fall flat", ipa: "/ˌfɔːl ˈflæt/", partOfSpeech: "idiom", vietnamese: "thất bại, không gây được hiệu ứng", definition: "to fail to have the effect that was intended", example: { english: "Most of the jokes fell flat.", vietnamese: "Hầu hết các câu đùa đều không gây cười." } },
    ],
    grammar: [{
      title: "-ed and -ing adjectives in reviews",
      pattern: "-ing = what causes the feeling (a gripping plot) · -ed = how a person feels (I was gripped)",
      explanation: {
        english: "Reviews describe both the work and your reaction. Use -ing for the thing that causes a feeling: The ending is disappointing. Use -ed for the person who feels it: I was disappointed by the ending. Saying I was boring means you were the boring one!",
        vietnamese: "Bài bình luận mô tả cả tác phẩm lẫn cảm xúc của bạn. Dùng -ing cho thứ gây ra cảm xúc: The ending is disappointing. Dùng -ed cho người cảm nhận: I was disappointed by the ending. Nói I was boring nghĩa là chính bạn mới là người nhàm chán!",
      },
      examples: [
        { english: "The second half was confusing, and I was confused.", vietnamese: "Nửa sau rất khó hiểu, và tôi đã bị rối." },
        { english: "Audiences were moved by the final scene.", vietnamese: "Khán giả xúc động trước cảnh cuối." },
      ],
      mistake: {
        wrong: "I was boring by the second half.", right: "I was bored by the second half.",
        why: { english: "For how a person feels, use -ed.", vietnamese: "Với cảm xúc của người, dùng -ed." },
      },
    }, {
      title: "Grading a judgement",
      pattern: "mildly / somewhat / rather + adjective (softer) · hugely / deeply / thoroughly + adjective (stronger)",
      explanation: {
        english: "A good review weighs its praise and criticism. Soften with mildly, somewhat or rather: The plot is somewhat far-fetched. Sharpen with hugely, deeply or thoroughly: a thoroughly enjoyable evening. Use a balanced structure: While the acting is superb, the plot is predictable.",
        vietnamese: "Một bài bình luận hay cân nhắc lời khen và lời chê. Làm nhẹ đi bằng mildly, somewhat hoặc rather: The plot is somewhat far-fetched. Làm mạnh lên bằng hugely, deeply hoặc thoroughly: a thoroughly enjoyable evening. Dùng cấu trúc cân bằng: While the acting is superb, the plot is predictable.",
      },
      examples: [
        { english: "While the cast is superb, the script is mildly disappointing.", vietnamese: "Dù dàn diễn viên tuyệt vời, kịch bản lại hơi đáng thất vọng." },
        { english: "It's a hugely ambitious and deeply moving novel.", vietnamese: "Đó là một cuốn tiểu thuyết vô cùng tham vọng và cực kỳ cảm động." },
      ],
      mistake: {
        wrong: "The film is very very good and very interesting.", right: "The film is thoroughly enjoyable and genuinely thought-provoking.",
        why: { english: "Choose precise adverbs and adjectives instead of repeating very.", vietnamese: "Hãy chọn trạng từ và tính từ chính xác thay vì lặp lại very." },
      },
    }],
    examples: [
      { english: "The plot is gripping, if a little far-fetched.", vietnamese: "Cốt truyện cuốn hút, dù hơi khó tin." },
      { english: "The critically acclaimed play is moving and thought-provoking.", vietnamese: "Vở kịch được giới phê bình ca ngợi vừa cảm động vừa gợi suy ngẫm." },
      { english: "Sadly, the comedy fell flat with the audience.", vietnamese: "Đáng tiếc, vở hài kịch không gây được hiệu ứng với khán giả." },
      { english: "The twist was so predictable that I guessed it in minutes.", vietnamese: "Tình tiết bất ngờ dễ đoán đến mức tôi đoán ra chỉ sau vài phút." },
    ],
    dialogue: [
      { speaker: "Editor", english: "How's your review of the new crime novel going?", vietnamese: "Bài bình luận về cuốn tiểu thuyết trinh thám mới của bạn thế nào rồi?" },
      { speaker: "Hoa", english: "Nearly done. The first half is absolutely gripping.", vietnamese: "Gần xong rồi. Nửa đầu thực sự cuốn hút." },
      { speaker: "Editor", english: "And the second half?", vietnamese: "Còn nửa sau?" },
      { speaker: "Hoa", english: "Somewhat far-fetched, and the ending is predictable. I was a bit disappointed.", vietnamese: "Hơi khó tin, và cái kết dễ đoán. Tôi hơi thất vọng." },
      { speaker: "Editor", english: "But it's her most acclaimed book so far.", vietnamese: "Nhưng đó là cuốn sách được ca ngợi nhất của cô ấy cho đến nay." },
      { speaker: "Hoa", english: "I know. I'll say that while the plot falls flat, the characters are deeply moving.", vietnamese: "Tôi biết. Tôi sẽ viết rằng dù cốt truyện không gây được hiệu ứng, các nhân vật lại vô cùng cảm động." },
    ],
    practice: [
      q("Complete: I was ___ by the film. I nearly fell asleep.", ["bored", "boring", "bore", "boredom"], "bored", "-ed for the person."),
      q("Which word means “very unlikely to be true”?", ["far-fetched", "far-reaching", "well-fetched", "far-gone"], "far-fetched", "Far-fetched."),
      q("Complete: It's a ___ thriller. I couldn't put it down.", ["gripping", "gripped", "grip", "gripful"], "gripping", "Gripping = exciting."),
      q("“Cốt truyện” in English is…", ["plot", "plan", "plate", "plight"], "plot", "Plot = events of a story."),
    ],
    challenge: [
      q("Complete: The jokes fell ___.", ["flat", "down", "off", "short of"], "flat", "Fall flat = fail."),
      q("Which adverb softens a criticism?", ["somewhat", "hugely", "thoroughly", "deeply"], "somewhat", "Somewhat = a little."),
      q("Choose the best review sentence.", ["While the acting is superb, the plot is predictable.", "The acting is very very good but the plot is very bad.", "The acting superb, while plot predictable.", "While the acting is superb, but the plot is predictable."], "While the acting is superb, the plot is predictable.", "Balanced structure, no extra but."),
      q("Complete: Audiences were deeply ___ by her story.", ["moved", "moving", "move", "movement"], "moved", "-ed for people."),
      q("What does “acclaimed” mean?", ["publicly praised by critics", "unknown", "badly reviewed", "very expensive"], "publicly praised by critics", "Acclaimed."),
    ],
  }, {
    key: "fronting", title: "Strange As It May Seem", titleVi: "Đảo cấu trúc để nhấn mạnh",
    objectives: [
      "I can move ideas to the front of a sentence for effect.",
      "Use adjective + as / though + subject + verb and Try as I might",
      "Use However + adjective / adverb + subject + verb and fronted adverbials of place",
    ],
    vocabulary: [
      { word: "masterpiece", ipa: "/ˈmɑːstəpiːs/", partOfSpeech: "noun", vietnamese: "kiệt tác", definition: "a work of art of the highest quality", example: { english: "Many consider it his masterpiece.", vietnamese: "Nhiều người coi đó là kiệt tác của ông." } },
      { word: "canvas", ipa: "/ˈkænvəs/", partOfSpeech: "noun", vietnamese: "vải vẽ, bức tranh sơn dầu", definition: "strong cloth used for painting on; an oil painting", example: { english: "The huge canvas covers a whole wall.", vietnamese: "Bức tranh khổng lồ phủ kín cả một bức tường." } },
      { word: "sculpture", ipa: "/ˈskʌlptʃə/", partOfSpeech: "noun", vietnamese: "tác phẩm điêu khắc", definition: "a work of art made by shaping stone, wood or metal", example: { english: "In the centre of the hall stands a bronze sculpture.", vietnamese: "Ở giữa sảnh là một tác phẩm điêu khắc bằng đồng." } },
      { word: "admire", ipa: "/ədˈmaɪə/", partOfSpeech: "verb", vietnamese: "ngưỡng mộ, chiêm ngưỡng", definition: "to look at something with pleasure and respect", example: { english: "Visitors stop to admire the painting.", vietnamese: "Du khách dừng lại để chiêm ngưỡng bức tranh." } },
      { word: "comprehend", ipa: "/ˌkɒmprɪˈhend/", partOfSpeech: "verb", vietnamese: "thấu hiểu, lĩnh hội", definition: "to understand something complicated (formal)", example: { english: "Try as I might, I couldn't comprehend the poem.", vietnamese: "Dù cố mấy, tôi cũng không hiểu nổi bài thơ." } },
      { word: "eccentric", ipa: "/ɪkˈsentrɪk/", partOfSpeech: "adjective", vietnamese: "lập dị", definition: "strange or unusual in an interesting way", example: { english: "The artist was famously eccentric.", vietnamese: "Người nghệ sĩ nổi tiếng là lập dị." } },
      { word: "abstract", ipa: "/ˈæbstrækt/", partOfSpeech: "adjective", vietnamese: "trừu tượng", definition: "showing ideas or feelings, not real objects", example: { english: "I find abstract art hard to understand.", vietnamese: "Tôi thấy nghệ thuật trừu tượng khó hiểu." } },
      { word: "exhibit", ipa: "/ɪɡˈzɪbɪt/", partOfSpeech: "verb", vietnamese: "trưng bày, triển lãm", definition: "to show works of art in public", example: { english: "Her work has been exhibited in Paris.", vietnamese: "Tác phẩm của cô ấy đã được triển lãm ở Paris." } },
    ],
    grammar: [{
      title: "Adjective + as + clause",
      pattern: "Adjective / adverb + as / though + subject + verb, … (= although) · Try as I might, …",
      explanation: {
        english: "For a strong concession, put the adjective first, then as or though: Strange as it may seem, the painting sold for millions. (= Although it may seem strange.) Try as I might means however hard I tried: Try as I might, I couldn't finish the book. Don't put although before the adjective.",
        vietnamese: "Để nhượng bộ mạnh, đặt tính từ lên đầu, rồi as hoặc though: Strange as it may seem, the painting sold for millions. (= Although it may seem strange.) Try as I might nghĩa là dù có cố đến mấy: Try as I might, I couldn't finish the book. Đừng đặt although trước tính từ.",
      },
      examples: [
        { english: "Talented as she is, she has never exhibited her work.", vietnamese: "Dù tài năng như vậy, cô ấy chưa bao giờ triển lãm tác phẩm của mình." },
        { english: "Try as he might, he couldn't comprehend abstract art.", vietnamese: "Dù cố đến mấy, anh ấy cũng không hiểu nổi nghệ thuật trừu tượng." },
      ],
      mistake: {
        wrong: "Although strange it may seem, it's true.", right: "Strange as it may seem, it's true.",
        why: { english: "Put the adjective first and use as, not although.", vietnamese: "Đặt tính từ lên đầu và dùng as, không dùng although." },
      },
    }, {
      title: "However + adjective and fronted place",
      pattern: "However + adjective / adverb + subject + verb · Place phrase + verb + subject (In the centre stands a statue)",
      explanation: {
        english: "However + adjective or adverb comes first, then subject + verb: However hard I try, I can't paint. However eccentric he seems, he's a genius. In descriptive writing, a place phrase can come first with the verb before the subject: On the wall hangs a huge canvas.",
        vietnamese: "However + tính từ hoặc trạng từ đứng trước, rồi đến chủ ngữ + động từ: However hard I try, I can't paint. However eccentric he seems, he's a genius. Trong văn miêu tả, cụm chỉ nơi chốn có thể đứng đầu với động từ trước chủ ngữ: On the wall hangs a huge canvas.",
      },
      examples: [
        { english: "However often I see it, the painting still moves me.", vietnamese: "Dù xem bao nhiêu lần, bức tranh vẫn làm tôi xúc động." },
        { english: "At the end of the gallery stands a marble sculpture.", vietnamese: "Ở cuối phòng trưng bày là một tác phẩm điêu khắc bằng đá cẩm thạch." },
      ],
      mistake: {
        wrong: "However I try hard, I can't draw faces.", right: "However hard I try, I can't draw faces.",
        why: { english: "Keep the adjective or adverb straight after however.", vietnamese: "Đặt tính từ hoặc trạng từ ngay sau however." },
      },
    }],
    examples: [
      { english: "Eccentric as he was, he produced a masterpiece.", vietnamese: "Dù lập dị như vậy, ông ấy đã tạo ra một kiệt tác." },
      { english: "However abstract it is, the canvas has real emotion.", vietnamese: "Dù trừu tượng đến đâu, bức tranh vẫn có cảm xúc thật." },
      { english: "In the main hall hangs her most famous work.", vietnamese: "Ở sảnh chính treo tác phẩm nổi tiếng nhất của cô ấy." },
      { english: "Crowds gather every day to admire the sculpture.", vietnamese: "Đám đông tụ tập mỗi ngày để chiêm ngưỡng tác phẩm điêu khắc." },
    ],
    dialogue: [
      { speaker: "Guide", english: "Welcome. In this room hangs the gallery's greatest masterpiece.", vietnamese: "Xin chào. Trong phòng này treo kiệt tác vĩ đại nhất của phòng tranh." },
      { speaker: "Visitor", english: "It's just three red squares. Strange as it may seem, I don't get it.", vietnamese: "Chỉ có ba hình vuông đỏ. Nghe có vẻ lạ, nhưng tôi không hiểu." },
      { speaker: "Guide", english: "Abstract art can be hard to comprehend at first.", vietnamese: "Nghệ thuật trừu tượng ban đầu có thể khó hiểu." },
      { speaker: "Visitor", english: "Try as I might, I can't see any meaning.", vietnamese: "Dù cố đến mấy, tôi cũng không thấy ý nghĩa gì." },
      { speaker: "Guide", english: "However simple it looks, the artist spent ten years on it.", vietnamese: "Dù trông đơn giản, người nghệ sĩ đã mất mười năm cho nó." },
      { speaker: "Visitor", english: "Ten years? Eccentric as that sounds, I'm starting to admire it.", vietnamese: "Mười năm ư? Nghe thì lập dị, nhưng tôi bắt đầu thấy ngưỡng mộ rồi." },
    ],
    practice: [
      q("Complete: ___ as it may seem, he never had a lesson.", ["Strange", "Although strange", "Strangely", "However strange as"], "Strange", "Adjective + as."),
      q("Complete: However ___ I try, I can't sing.", ["hard", "I hard", "much hard", "hardly"], "hard", "However + adverb + subject."),
      q("Complete: Try as I ___, I couldn't open the door.", ["might", "may", "could", "tried"], "might", "Try as I might."),
      q("“Kiệt tác” in English is…", ["masterpiece", "masterclass", "mastermind", "artpiece"], "masterpiece", "Masterpiece."),
    ],
    challenge: [
      q("Complete: In the corner ___ an old piano.", ["stands", "it stands", "standing", "is standing it"], "stands", "Fronted place + verb + subject."),
      q("Choose the correct sentence.", ["Talented though she is, she lacks confidence.", "Although talented she is, she lacks confidence.", "Talented as is she, she lacks confidence.", "Though she talented, she lacks confidence."], "Talented though she is, she lacks confidence.", "Adjective + though + clause."),
      q("Which word means “strange in an interesting way”?", ["eccentric", "electric", "ethnic", "eclectic"], "eccentric", "Eccentric."),
      q("Complete: Her paintings will be ___ in London next year.", ["exhibited", "exhausted", "exhaled", "expected"], "exhibited", "Exhibit = show in public."),
      q("What is “abstract” art?", ["art that shows ideas, not real objects", "art of real places", "photography", "very old art"], "art that shows ideas, not real objects", "Abstract."),
    ],
  }, {
    key: "prefixes", title: "Overrated and Underestimated", titleVi: "Tiền tố nâng cao",
    objectives: [
      "I can build and understand words with prefixes.",
      "Use over-, under- and out- to show too much, too little and more than",
      "Use mis-, re- and counter- correctly",
    ],
    vocabulary: [
      { word: "overrated", ipa: "/ˌəʊvəˈreɪtɪd/", partOfSpeech: "adjective", vietnamese: "được đánh giá quá cao", definition: "thought to be better than it really is", example: { english: "In my view, the film is overrated.", vietnamese: "Theo tôi, bộ phim được đánh giá quá cao." } },
      { word: "underestimate", ipa: "/ˌʌndərˈestɪmeɪt/", partOfSpeech: "verb", vietnamese: "đánh giá thấp", definition: "to think something is smaller or less good than it is", example: { english: "Never underestimate a young writer.", vietnamese: "Đừng bao giờ đánh giá thấp một nhà văn trẻ." } },
      { word: "outshine", ipa: "/ˌaʊtˈʃaɪn/", partOfSpeech: "verb", vietnamese: "lấn át, vượt trội hơn", definition: "to be much better than others", example: { english: "The young actor outshone the star.", vietnamese: "Diễn viên trẻ đã lấn át ngôi sao." } },
      { word: "outnumber", ipa: "/ˌaʊtˈnʌmbə/", partOfSpeech: "verb", vietnamese: "đông hơn, nhiều hơn", definition: "to be more in number than another group", example: { english: "Women outnumber men in the choir.", vietnamese: "Nữ đông hơn nam trong dàn hợp xướng." } },
      { word: "misinterpret", ipa: "/ˌmɪsɪnˈtɜːprɪt/", partOfSpeech: "verb", vietnamese: "hiểu sai", definition: "to understand something wrongly", example: { english: "Critics misinterpreted the ending.", vietnamese: "Các nhà phê bình đã hiểu sai cái kết." } },
      { word: "reissue", ipa: "/ˌriːˈɪʃuː/", partOfSpeech: "verb", vietnamese: "phát hành lại", definition: "to publish or release something again", example: { english: "The album was reissued on vinyl.", vietnamese: "Album đã được phát hành lại trên đĩa than." } },
      { word: "counterpart", ipa: "/ˈkaʊntəpɑːt/", partOfSpeech: "noun", vietnamese: "người/vật tương ứng", definition: "a person or thing with the same role in a different place", example: { english: "British artists earn less than their American counterparts.", vietnamese: "Nghệ sĩ Anh kiếm ít hơn các đồng nghiệp người Mỹ." } },
      { word: "overshadow", ipa: "/ˌəʊvəˈʃædəʊ/", partOfSpeech: "verb", vietnamese: "làm lu mờ", definition: "to make something seem less important", example: { english: "Her early work is overshadowed by her later novels.", vietnamese: "Tác phẩm đầu tay của bà bị các tiểu thuyết sau làm lu mờ." } },
    ],
    grammar: [{
      title: "Over-, under- and out-",
      pattern: "over- (too much) · under- (too little) · out- + verb (do more or better than someone)",
      explanation: {
        english: "Over- means too much: overrated, overcooked, overpriced. Under- means not enough: underpaid, underestimate, underrated. Out- makes a verb meaning to do better or more than someone: outshine, outnumber, outlive, outsell. Out- verbs take a direct object: The book outsold all its rivals.",
        vietnamese: "Over- nghĩa là quá mức: overrated, overcooked, overpriced. Under- nghĩa là chưa đủ: underpaid, underestimate, underrated. Out- tạo động từ nghĩa là làm tốt hơn hoặc nhiều hơn ai đó: outshine, outnumber, outlive, outsell. Động từ với out- có tân ngữ trực tiếp: The book outsold all its rivals.",
      },
      examples: [
        { english: "The tickets were overpriced, and the musicians were underpaid.", vietnamese: "Vé thì quá đắt, còn nhạc công thì bị trả lương thấp." },
        { english: "Her debut novel outsold her famous father's books.", vietnamese: "Cuốn tiểu thuyết đầu tay của cô bán chạy hơn sách của người cha nổi tiếng." },
      ],
      mistake: {
        wrong: "Fans overnumber the seats in the theatre.", right: "Fans outnumber the seats in the theatre.",
        why: { english: "For more in number, use out-, not over-.", vietnamese: "Với nghĩa đông hơn, dùng out-, không dùng over-." },
      },
    }, {
      title: "Mis-, re- and counter-",
      pattern: "mis- (wrongly) · re- (again) · counter- (against or matching)",
      explanation: {
        english: "Mis- means wrongly: misunderstand, misinterpret, mispronounce. Re- means again: reissue, rewrite, reconsider. Counter- means against or matching: counterargument, counterpart. Don't confuse mis- with dis-, which means not or the opposite: dislike, disagree. We say misunderstand, never disunderstand.",
        vietnamese: "Mis- nghĩa là sai: misunderstand, misinterpret, mispronounce. Re- nghĩa là lại: reissue, rewrite, reconsider. Counter- nghĩa là chống lại hoặc tương ứng: counterargument, counterpart. Đừng nhầm mis- với dis-, nghĩa là không hoặc ngược lại: dislike, disagree. Ta nói misunderstand, không bao giờ nói disunderstand.",
      },
      examples: [
        { english: "The actor mispronounced the director's name.", vietnamese: "Nam diễn viên phát âm sai tên đạo diễn." },
        { english: "She decided to rewrite the final chapter.", vietnamese: "Cô ấy quyết định viết lại chương cuối." },
      ],
      mistake: {
        wrong: "I think you disunderstood the poem.", right: "I think you misunderstood the poem.",
        why: { english: "Mis- means wrongly; disunderstand is not a word.", vietnamese: "Mis- nghĩa là sai; disunderstand không phải là một từ." },
      },
    }],
    examples: [
      { english: "Many critics feel the series is overrated.", vietnamese: "Nhiều nhà phê bình cảm thấy bộ phim truyền hình được đánh giá quá cao." },
      { english: "Don't underestimate how hard it is to write a song.", vietnamese: "Đừng đánh giá thấp việc viết một bài hát khó đến mức nào." },
      { english: "The sequel was overshadowed by the original.", vietnamese: "Phần tiếp theo bị phần gốc làm lu mờ." },
      { english: "Readers often misinterpret the poem's message.", vietnamese: "Người đọc thường hiểu sai thông điệp của bài thơ." },
    ],
    dialogue: [
      { speaker: "Presenter", english: "Your first album is being reissued. How does that feel?", vietnamese: "Album đầu tiên của anh đang được phát hành lại. Anh cảm thấy thế nào?" },
      { speaker: "Singer", english: "Strange. Back then, critics said it was overrated.", vietnamese: "Lạ lắm. Hồi đó, giới phê bình nói nó được đánh giá quá cao." },
      { speaker: "Presenter", english: "And now it's called a classic.", vietnamese: "Và giờ nó được gọi là kinh điển." },
      { speaker: "Singer", english: "I think people misinterpreted the lyrics at first.", vietnamese: "Tôi nghĩ lúc đầu mọi người đã hiểu sai lời bài hát." },
      { speaker: "Presenter", english: "Some say it outshines your later work.", vietnamese: "Có người nói nó lấn át các sáng tác sau này của anh." },
      { speaker: "Singer", english: "Maybe. But I'd never want it to overshadow the new songs!", vietnamese: "Có thể. Nhưng tôi không bao giờ muốn nó làm lu mờ các bài hát mới!" },
    ],
    practice: [
      q("Complete: The meal was too expensive. It was ___.", ["overpriced", "underpriced", "outpriced", "mispriced"], "overpriced", "Over- = too much."),
      q("Complete: Students ___ teachers ten to one.", ["outnumber", "overnumber", "renumber", "misnumber"], "outnumber", "Out- = more than."),
      q("Complete: Sorry, I ___ your question.", ["misunderstood", "disunderstood", "ununderstood", "reunderstood"], "misunderstood", "Mis- = wrongly."),
      q("“Đánh giá thấp” in English is…", ["underestimate", "overestimate", "misestimate", "outestimate"], "underestimate", "Under- = too little."),
    ],
    challenge: [
      q("Which prefix means “again”?", ["re-", "mis-", "out-", "under-"], "re-", "Re- = again."),
      q("Complete: The film's success was ___ by a scandal.", ["overshadowed", "outshadowed", "undershadowed", "reshadowed"], "overshadowed", "Overshadow."),
      q("Complete: The French minister met her British ___.", ["counterpart", "counterfeit", "counteract", "counterattack"], "counterpart", "Counterpart = same role elsewhere."),
      q("Complete: The young violinist ___ everyone else on stage.", ["outshone", "overshone", "mis-shone", "undershone"], "outshone", "Outshine."),
      q("What does “overrated” mean?", ["thought to be better than it is", "not famous", "very cheap", "too long"], "thought to be better than it is", "Overrated."),
    ],
  }, {
    key: "ellipsis", title: "I Hope So, I'd Rather Not", titleVi: "Tỉnh lược và thay thế",
    objectives: [
      "I can avoid repetition naturally in speech and writing.",
      "Use so and not after hope, think, expect and afraid",
      "Replace or drop words with do so, one / ones and to",
    ],
    vocabulary: [
      { word: "rehearsal", ipa: "/rɪˈhɜːsl/", partOfSpeech: "noun", vietnamese: "buổi diễn tập", definition: "a practice before a public performance", example: { english: "The final rehearsal is on Friday.", vietnamese: "Buổi diễn tập cuối cùng vào thứ Sáu." } },
      { word: "audition", ipa: "/ɔːˈdɪʃn/", partOfSpeech: "noun", vietnamese: "buổi thử vai", definition: "a short performance to test whether someone is suitable for a role", example: { english: "She's got an audition for the lead role.", vietnamese: "Cô ấy có buổi thử vai cho vai chính." } },
      { word: "understudy", ipa: "/ˈʌndəstʌdi/", partOfSpeech: "noun", vietnamese: "diễn viên dự bị", definition: "an actor who learns a role in order to replace the main actor if necessary", example: { english: "The understudy went on when the star fell ill.", vietnamese: "Diễn viên dự bị lên sân khấu khi ngôi sao bị ốm." } },
      { word: "encore", ipa: "/ˈɒŋkɔː/", partOfSpeech: "noun", vietnamese: "tiết mục biểu diễn thêm", definition: "an extra song or piece at the end because the audience asks for it", example: { english: "The band came back for an encore.", vietnamese: "Ban nhạc quay lại để biểu diễn thêm một tiết mục." } },
      { word: "standing ovation", ipa: "/ˌstændɪŋ əʊˈveɪʃn/", partOfSpeech: "collocation", vietnamese: "tràng vỗ tay đứng dậy", definition: "when an audience stands up to clap", example: { english: "The cast received a standing ovation.", vietnamese: "Dàn diễn viên nhận được tràng vỗ tay đứng dậy." } },
      { word: "stage fright", ipa: "/ˈsteɪdʒ fraɪt/", partOfSpeech: "noun", vietnamese: "chứng sợ sân khấu", definition: "nervousness before performing in public", example: { english: "Even famous actors get stage fright.", vietnamese: "Ngay cả diễn viên nổi tiếng cũng sợ sân khấu." } },
      { word: "venue", ipa: "/ˈvenjuː/", partOfSpeech: "noun", vietnamese: "địa điểm tổ chức", definition: "the place where an event happens", example: { english: "The venue holds two thousand people.", vietnamese: "Địa điểm này chứa được hai nghìn người." } },
      { word: "sold out", ipa: "/ˌsəʊld ˈaʊt/", partOfSpeech: "adjective", vietnamese: "bán hết vé", definition: "with no tickets left to buy", example: { english: "Every show this week is sold out.", vietnamese: "Mọi buổi diễn tuần này đều đã bán hết vé." } },
    ],
    grammar: [{
      title: "So and not",
      pattern: "I think / hope / expect / suppose so · I hope not / I'm afraid not · I don't think so",
      explanation: {
        english: "To avoid repeating a clause, use so after think, hope, expect, suppose and I'm afraid: Will it be sold out? I expect so. For the negative, hope and afraid take not: I hope not. I'm afraid not. With think and expect, we usually make the verb negative: I don't think so. Never say I don't hope so.",
        vietnamese: "Để tránh lặp lại mệnh đề, dùng so sau think, hope, expect, suppose và I'm afraid: Will it be sold out? I expect so. Với phủ định, hope và afraid đi với not: I hope not. I'm afraid not. Với think và expect, ta thường phủ định động từ: I don't think so. Không bao giờ nói I don't hope so.",
      },
      examples: [
        { english: "“Is the venue far?” “I'm afraid so. It's an hour away.”", vietnamese: "“Địa điểm có xa không?” “Tiếc là có. Mất một tiếng đi đường.”" },
        { english: "“Will it rain during the concert?” “I hope not!”", vietnamese: "“Trời có mưa trong buổi hoà nhạc không?” “Mong là không!”" },
      ],
      mistake: {
        wrong: "“Will you get stage fright?” “I don't hope so.”", right: "“Will you get stage fright?” “I hope not.”",
        why: { english: "With hope, the negative is I hope not.", vietnamese: "Với hope, dạng phủ định là I hope not." },
      },
    }, {
      title: "Do so, one and to",
      pattern: "do so (= repeat the action) · one / ones (= repeat a countable noun) · want / like / hope + to (drop the verb)",
      explanation: {
        english: "Do so replaces a verb phrase in formal English: Audiences may leave, but few did so. One and ones replace a countable noun: The old theatre is nicer than the new one. After want, like, would love, hope and try, you can keep to and drop the rest: I'd love to. I didn't mean to.",
        vietnamese: "Do so thay cho một cụm động từ trong văn trang trọng: Audiences may leave, but few did so. One và ones thay cho danh từ đếm được: The old theatre is nicer than the new one. Sau want, like, would love, hope và try, có thể giữ to và bỏ phần còn lại: I'd love to. I didn't mean to.",
      },
      examples: [
        { english: "“Will you come to the audition?” “I'd love to.”", vietnamese: "“Bạn sẽ đến buổi thử vai chứ?” “Mình rất muốn.”" },
        { english: "I prefer the cheap seats to the expensive ones.", vietnamese: "Tôi thích ghế rẻ hơn ghế đắt." },
      ],
      mistake: {
        wrong: "The new venue is bigger than the old venue, and the new venue is cheaper.", right: "The new venue is bigger and cheaper than the old one.",
        why: { english: "Use one to avoid repeating the noun.", vietnamese: "Dùng one để tránh lặp lại danh từ." },
      },
    }],
    examples: [
      { english: "“Is the show sold out?” “I'm afraid so.”", vietnamese: "“Buổi diễn bán hết vé rồi à?” “Tiếc là vậy.”" },
      { english: "The understudy was asked to perform and did so brilliantly.", vietnamese: "Diễn viên dự bị được yêu cầu biểu diễn và đã làm điều đó xuất sắc." },
      { english: "“Will they do an encore?” “I expect so.”", vietnamese: "“Họ sẽ biểu diễn thêm chứ?” “Mình nghĩ là có.”" },
      { english: "This rehearsal went better than the last one.", vietnamese: "Buổi diễn tập này tốt hơn buổi trước." },
    ],
    dialogue: [
      { speaker: "Director", english: "Are you nervous about tonight?", vietnamese: "Bạn có hồi hộp về tối nay không?" },
      { speaker: "Mai", english: "A little. Will I get stage fright again?", vietnamese: "Một chút. Liệu mình có lại sợ sân khấu không?" },
      { speaker: "Director", english: "I hope not! You were brilliant in the last rehearsal.", vietnamese: "Mong là không! Bạn diễn xuất sắc ở buổi diễn tập vừa rồi." },
      { speaker: "Mai", english: "Is the venue full?", vietnamese: "Khán phòng có kín chỗ không?" },
      { speaker: "Director", english: "I'm afraid so. Every seat is sold out, even the cheap ones.", vietnamese: "Tiếc là có. Mọi ghế đều bán hết, kể cả ghế rẻ." },
      { speaker: "Mai", english: "Then let's give them a show they'll want to see again!", vietnamese: "Vậy hãy cho họ một buổi diễn mà họ muốn xem lại!" },
    ],
    practice: [
      q("“Will it rain?” “I ___.”", ["hope not", "don't hope so", "hope no", "not hope"], "hope not", "Hope not."),
      q("“Is she coming?” “I ___ so.”", ["think", "think it", "think that", "am thinking"], "think", "I think so."),
      q("Complete: I like this jacket more than the blue ___.", ["one", "it", "ones", "jacket one"], "one", "One replaces a noun."),
      q("“Diễn viên dự bị” in English is…", ["understudy", "understand", "substudent", "overstudy"], "understudy", "Understudy."),
    ],
    challenge: [
      q("“Have we missed the start?” “I'm afraid ___.”", ["so", "it", "yes", "that"], "so", "I'm afraid so."),
      q("“Would you like to join us?” “I'd love ___.”", ["to", "it", "so", "that"], "to", "Keep to."),
      q("Complete: Guests may leave early, but few ___ so.", ["did", "made", "went", "had"], "did", "Do so."),
      q("Complete: The cast received a standing ___.", ["ovation", "ovulation", "operation", "oration"], "ovation", "Standing ovation."),
      q("What is an “encore”?", ["an extra piece at the end", "the first song", "a ticket", "a rehearsal"], "an extra piece at the end", "Encore."),
    ],
  }, {
    key: "figurative-language", title: "A Sea of Faces", titleVi: "Ngôn ngữ hình ảnh",
    objectives: [
      "I can use and understand images in descriptive writing.",
      "Tell metaphors from similes: a sea of faces vs as busy as a bee",
      "Use common English images rather than translating Vietnamese ones",
    ],
    vocabulary: [
      { word: "metaphor", ipa: "/ˈmetəfə/", partOfSpeech: "noun", vietnamese: "phép ẩn dụ", definition: "describing something as if it were something else", example: { english: "“Time is money” is a metaphor.", vietnamese: "“Thời gian là tiền bạc” là một phép ẩn dụ." } },
      { word: "simile", ipa: "/ˈsɪməli/", partOfSpeech: "noun", vietnamese: "phép so sánh", definition: "comparing two things using like or as", example: { english: "“As cold as ice” is a simile.", vietnamese: "“Lạnh như băng” là một phép so sánh." } },
      { word: "vivid", ipa: "/ˈvɪvɪd/", partOfSpeech: "adjective", vietnamese: "sống động", definition: "producing very clear pictures in your mind", example: { english: "The author gives a vivid description of the city.", vietnamese: "Tác giả miêu tả thành phố rất sống động." } },
      { word: "a sea of", ipa: "/ə ˈsiː əv/", partOfSpeech: "phrase", vietnamese: "một biển (rất nhiều)", definition: "a very large number or amount of something", example: { english: "She looked out at a sea of faces.", vietnamese: "Cô ấy nhìn ra một biển người." } },
      { word: "as busy as a bee", ipa: "/əz ˌbɪzi əz ə ˈbiː/", partOfSpeech: "idiom", vietnamese: "bận tối mắt", definition: "very busy", example: { english: "Before opening night, he was as busy as a bee.", vietnamese: "Trước đêm khai mạc, anh ấy bận tối mắt." } },
      { word: "heart of gold", ipa: "/ˌhɑːt əv ˈɡəʊld/", partOfSpeech: "idiom", vietnamese: "tấm lòng vàng", definition: "a very kind nature", example: { english: "The old painter had a heart of gold.", vietnamese: "Người hoạ sĩ già có một tấm lòng vàng." } },
      { word: "a flood of", ipa: "/ə ˈflʌd əv/", partOfSpeech: "phrase", vietnamese: "một làn sóng, cơn lũ", definition: "a very large number arriving at the same time", example: { english: "The book received a flood of letters from readers.", vietnamese: "Cuốn sách nhận được hàng loạt thư từ độc giả." } },
      { word: "imagery", ipa: "/ˈɪmɪdʒəri/", partOfSpeech: "noun", vietnamese: "hình ảnh (trong văn chương)", definition: "language that creates pictures in the reader's mind", example: { english: "The poem is full of nature imagery.", vietnamese: "Bài thơ đầy hình ảnh thiên nhiên." } },
    ],
    grammar: [{
      title: "Metaphor and simile",
      pattern: "simile: as + adjective + as + noun / like + noun · metaphor: noun is noun / a sea of + noun",
      explanation: {
        english: "A simile compares with as or like: as light as a feather, he sings like an angel. A metaphor says one thing is another: Her voice is honey. Many metaphors use a + noun + of: a sea of faces, a flood of complaints, a mountain of paperwork. Use the article: a sea of faces, not sea of faces.",
        vietnamese: "Phép so sánh dùng as hoặc like: as light as a feather, he sings like an angel. Phép ẩn dụ nói vật này là vật kia: Her voice is honey. Nhiều phép ẩn dụ dùng a + danh từ + of: a sea of faces, a flood of complaints, a mountain of paperwork. Nhớ dùng mạo từ: a sea of faces, không phải sea of faces.",
      },
      examples: [
        { english: "The stage lights were as bright as the sun.", vietnamese: "Ánh đèn sân khấu sáng như mặt trời." },
        { english: "The theatre received a mountain of complaints.", vietnamese: "Nhà hát nhận được hàng núi lời phàn nàn." },
      ],
      mistake: {
        wrong: "She looked out at sea of faces.", right: "She looked out at a sea of faces.",
        why: { english: "These metaphors need the article a.", vietnamese: "Các phép ẩn dụ này cần mạo từ a." },
      },
    }, {
      title: "English images, not translations",
      pattern: "Use the English image: as busy as a bee · as quiet as a mouse · as cool as a cucumber · as good as gold",
      explanation: {
        english: "Every language has its own images, and translating them word for word sounds strange. Vietnamese may compare a busy person to an ant, but English says as busy as a bee. A calm person is as cool as a cucumber, a quiet one is as quiet as a mouse, and a well-behaved child is as good as gold.",
        vietnamese: "Mỗi ngôn ngữ có hình ảnh riêng, và dịch từng chữ sẽ nghe rất lạ. Tiếng Việt có thể so người bận rộn với con kiến, nhưng tiếng Anh nói as busy as a bee. Người bình tĩnh là as cool as a cucumber, người im lặng là as quiet as a mouse, và đứa trẻ ngoan là as good as gold.",
      },
      examples: [
        { english: "Despite the pressure, the conductor stayed as cool as a cucumber.", vietnamese: "Dù chịu áp lực, nhạc trưởng vẫn bình tĩnh như không." },
        { english: "The children were as good as gold during the play.", vietnamese: "Bọn trẻ ngoan ngoãn suốt buổi diễn kịch." },
      ],
      mistake: {
        wrong: "During the festival, I was as busy as an ant.", right: "During the festival, I was as busy as a bee.",
        why: { english: "Use the English image: a bee, not an ant.", vietnamese: "Dùng hình ảnh tiếng Anh: con ong, không phải con kiến." },
      },
    }],
    examples: [
      { english: "The writer uses vivid imagery to describe the war.", vietnamese: "Nhà văn dùng hình ảnh sống động để miêu tả chiến tranh." },
      { english: "“Life is a journey” is a common metaphor.", vietnamese: "“Cuộc đời là một chuyến đi” là phép ẩn dụ phổ biến." },
      { english: "After the review, there was a flood of ticket sales.", vietnamese: "Sau bài bình luận, vé bán ra ồ ạt." },
      { english: "Beneath his rough manner, he has a heart of gold.", vietnamese: "Bên dưới vẻ thô ráp, anh ấy có một tấm lòng vàng." },
    ],
    dialogue: [
      { speaker: "Teacher", english: "Look at the first line: “The city was a sea of lights.” What is it?", vietnamese: "Hãy nhìn dòng đầu tiên: “Thành phố là một biển ánh đèn.” Đó là gì?" },
      { speaker: "Duc", english: "It's a metaphor. It doesn't use like or as.", vietnamese: "Đó là phép ẩn dụ. Nó không dùng like hay as." },
      { speaker: "Teacher", english: "Right. And “her voice was as soft as silk”?", vietnamese: "Đúng. Còn “giọng cô ấy mềm như lụa” thì sao?" },
      { speaker: "Duc", english: "That's a simile. The imagery is very vivid.", vietnamese: "Đó là phép so sánh. Hình ảnh rất sống động." },
      { speaker: "Teacher", english: "Now write one about a busy market.", vietnamese: "Giờ hãy viết một câu về một khu chợ đông đúc." },
      { speaker: "Duc", english: "“The traders were as busy as bees, shouting over a flood of customers.”", vietnamese: "“Những người bán hàng bận tối mắt, hò hét giữa dòng khách đông nghịt.”" },
    ],
    practice: [
      q("“As cold as ice” is a…", ["simile", "metaphor", "prefix", "review"], "simile", "Uses as… as."),
      q("Complete: He was as busy as a ___.", ["bee", "ant", "cat", "fish"], "bee", "English image: bee."),
      q("Complete: She stared at ___ sea of faces.", ["a", "the many", "an", "—"], "a", "A sea of."),
      q("“Sống động” in English is…", ["vivid", "valid", "vital", "livid"], "vivid", "Vivid."),
    ],
    challenge: [
      q("Which is a metaphor?", ["Her smile is sunshine.", "Her smile is like sunshine.", "Her smile is as warm as the sun.", "She smiles warmly."], "Her smile is sunshine.", "No like or as."),
      q("Complete: Stay as cool as a ___.", ["cucumber", "tomato", "fridge", "lemon"], "cucumber", "Cool as a cucumber."),
      q("Complete: The company received a ___ of complaints.", ["flood", "river", "rain", "lake"], "flood", "A flood of."),
      q("What does “a heart of gold” mean?", ["a very kind nature", "a lot of money", "a strong heart", "a gold medal"], "a very kind nature", "Heart of gold."),
      q("What is “imagery”?", ["language that creates pictures in the mind", "a set of photos", "a kind of camera", "an art gallery"], "language that creates pictures in the mind", "Imagery."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 4", isReview: true,
    objectives: [
      "I can review, describe and discuss the arts with style.",
      "Check -ed / -ing adjectives, fronting, prefixes, ellipsis and figurative language",
    ],
    vocabulary: [
      { word: "gripping", ipa: "/ˈɡrɪpɪŋ/", partOfSpeech: "adjective", vietnamese: "cuốn hút, hấp dẫn", definition: "so exciting that you want to keep reading or watching", example: { english: "The final episode was gripping.", vietnamese: "Tập cuối rất cuốn hút." } },
      { word: "masterpiece", ipa: "/ˈmɑːstəpiːs/", partOfSpeech: "noun", vietnamese: "kiệt tác", definition: "a work of art of the highest quality", example: { english: "The novel is a modern masterpiece.", vietnamese: "Cuốn tiểu thuyết là một kiệt tác hiện đại." } },
      { word: "overrated", ipa: "/ˌəʊvəˈreɪtɪd/", partOfSpeech: "adjective", vietnamese: "được đánh giá quá cao", definition: "thought to be better than it really is", example: { english: "Some say the band is overrated.", vietnamese: "Có người nói ban nhạc được đánh giá quá cao." } },
      { word: "sold out", ipa: "/ˌsəʊld ˈaʊt/", partOfSpeech: "adjective", vietnamese: "bán hết vé", definition: "with no tickets left to buy", example: { english: "The tour was sold out in an hour.", vietnamese: "Chuyến lưu diễn bán hết vé trong một giờ." } },
      { word: "vivid", ipa: "/ˈvɪvɪd/", partOfSpeech: "adjective", vietnamese: "sống động", definition: "producing very clear pictures in your mind", example: { english: "I have vivid memories of that concert.", vietnamese: "Tôi có những ký ức sống động về buổi hoà nhạc đó." } },
      { word: "acclaimed", ipa: "/əˈkleɪmd/", partOfSpeech: "adjective", vietnamese: "được ca ngợi", definition: "publicly praised by critics", example: { english: "She is an acclaimed poet.", vietnamese: "Bà là một nhà thơ được ca ngợi." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "I was bored by a boring plot · Strange as it may seem / However hard I try · overrated, outnumber, misunderstand · I hope not / the old one / do so · a sea of faces / as busy as a bee",
      explanation: {
        english: "Check these: use -ing for what causes a feeling and -ed for the person who feels it; front the adjective with as or though, and keep the adjective straight after however; over- means too much, out- means more than, and mis- means wrongly; say I hope not and I'm afraid not, and use one, ones and do so to avoid repeating; metaphors like a sea of need the article, and similes should use English images.",
        vietnamese: "Hãy kiểm tra: dùng -ing cho thứ gây ra cảm xúc và -ed cho người cảm nhận; đưa tính từ lên đầu với as hoặc though, và đặt tính từ ngay sau however; over- nghĩa là quá mức, out- nghĩa là hơn, và mis- nghĩa là sai; nói I hope not và I'm afraid not, và dùng one, ones và do so để tránh lặp; ẩn dụ như a sea of cần mạo từ, và phép so sánh nên dùng hình ảnh tiếng Anh.",
      },
      examples: [
        { english: "Overrated as it may be, the film is still gripping.", vietnamese: "Dù có thể được đánh giá quá cao, bộ phim vẫn cuốn hút." },
        { english: "“Is it sold out?” “I'm afraid so.”", vietnamese: "“Hết vé rồi à?” “Tiếc là vậy.”" },
      ],
    }],
    examples: [
      { english: "Strange as it may seem, the acclaimed novel left me cold.", vietnamese: "Nghe có vẻ lạ, nhưng cuốn tiểu thuyết được ca ngợi đó không làm tôi rung động." },
      { english: "The concert was sold out, so we watched a smaller one.", vietnamese: "Buổi hoà nhạc đã hết vé, nên chúng tôi xem một buổi nhỏ hơn." },
      { english: "Her vivid descriptions turn the book into a masterpiece.", vietnamese: "Những miêu tả sống động của bà biến cuốn sách thành một kiệt tác." },
    ],
    dialogue: [
      { speaker: "Kate", english: "Did you see the acclaimed new musical?", vietnamese: "Bạn đã xem vở nhạc kịch mới được ca ngợi chưa?" },
      { speaker: "Nam", english: "I tried, but it was sold out. Was it good?", vietnamese: "Mình đã thử, nhưng hết vé. Nó có hay không?" },
      { speaker: "Kate", english: "Honestly, I think it's overrated. I was bored in the second act.", vietnamese: "Thật lòng, mình nghĩ nó được đánh giá quá cao. Mình thấy chán ở màn hai." },
      { speaker: "Nam", english: "Really? Everyone calls it a masterpiece.", vietnamese: "Thật à? Ai cũng gọi nó là kiệt tác." },
      { speaker: "Kate", english: "Gripping as the first act is, the rest falls flat.", vietnamese: "Dù màn một cuốn hút, phần còn lại không gây được hiệu ứng." },
      { speaker: "Nam", english: "Will they extend the run?", vietnamese: "Họ có kéo dài thời gian công diễn không?" },
      { speaker: "Kate", english: "I expect so. The audience gave it a standing ovation, even if I didn't!", vietnamese: "Mình nghĩ là có. Khán giả đã đứng dậy vỗ tay, dù mình thì không!" },
    ],
    practice: [
      q("Complete: The lecture was so ___ that I left.", ["boring", "bored", "bore", "boredly"], "boring", "-ing for the cause."),
      q("Complete: ___ as it may seem, it's true.", ["Odd", "Although odd", "Oddly", "However odd as"], "Odd", "Adjective + as."),
      q("Complete: Fans ___ the police at the stadium.", ["outnumbered", "overnumbered", "misnumbered", "renumbered"], "outnumbered", "Out- = more than."),
      q("“Will the show be cancelled?” “I ___.”", ["hope not", "don't hope so", "hope no", "not hope so"], "hope not", "Hope not."),
    ],
    challenge: [
      q("Complete: However ___ she practises, she can't hit the high note.", ["much", "she much", "many", "more"], "much", "However + adverb + subject."),
      q("Choose the correct word: I ___ the instructions.", ["misread", "disread", "overread", "outread"], "misread", "Mis- = wrongly."),
      q("Complete: This theatre is older than the new ___.", ["one", "it", "theatre one", "ones"], "one", "One replaces a noun."),
      q("Which is a simile?", ["He fought like a lion.", "He is a lion.", "A sea of lions.", "The lion fought."], "He fought like a lion.", "Uses like."),
      q("Complete: She was as quiet as a ___.", ["mouse", "bee", "cucumber", "lion"], "mouse", "Quiet as a mouse."),
    ],
  }],
  assessment: [
    { id: "ed-ing", prompt: "Complete: I was ___ by the ending.", options: ["disappointed", "disappointing", "disappoint", "disappointment"], correct: "disappointed", explanation: "-ed for the person." },
    { id: "far-fetched", prompt: "Which word means “very unlikely to be true”?", options: ["far-fetched", "far-reaching", "far-flung", "far-sighted"], correct: "far-fetched", explanation: "Far-fetched." },
    { id: "fall-flat", prompt: "Complete: All his jokes fell ___.", options: ["flat", "down", "short", "off"], correct: "flat", explanation: "Fall flat." },
    { id: "adjective-as", prompt: "Complete: ___ as it may sound, I enjoyed it.", options: ["Strange", "Although strange", "Strangely", "However strange as"], correct: "Strange", explanation: "Adjective + as." },
    { id: "however-hard", prompt: "Choose the correct sentence.", options: ["However hard I try, I can't paint.", "However I try hard, I can't paint.", "However I hard try, I can't paint.", "However hardly I try, I can't paint."], correct: "However hard I try, I can't paint.", explanation: "However + adverb + subject + verb." },
    { id: "try-as-i-might", prompt: "Complete: Try as I ___, I couldn't finish it.", options: ["might", "may", "tried", "would"], correct: "might", explanation: "Try as I might." },
    { id: "fronted-place", prompt: "Complete: In the centre of the square ___ a statue.", options: ["stands", "it stands", "standing", "stand"], correct: "stands", explanation: "Fronted place + verb + subject." },
    { id: "out-prefix", prompt: "Complete: Women ___ men in the orchestra.", options: ["outnumber", "overnumber", "undernumber", "misnumber"], correct: "outnumber", explanation: "Out- = more than." },
    { id: "mis-prefix", prompt: "Complete: Sorry, I ___ what you said.", options: ["misheard", "disheard", "overheard wrongly", "unheard"], correct: "misheard", explanation: "Mis- = wrongly." },
    { id: "overrated", prompt: "“Được đánh giá quá cao” in English is…", options: ["overrated", "underrated", "outrated", "misrated"], correct: "overrated", explanation: "Over- = too much." },
    { id: "hope-not", prompt: "“Will it rain tomorrow?” “I ___.”", options: ["hope not", "don't hope so", "hope no", "not hope"], correct: "hope not", explanation: "Hope not." },
    { id: "afraid-so", prompt: "“Is the show cancelled?” “I'm afraid ___.”", options: ["so", "it", "that", "yes"], correct: "so", explanation: "I'm afraid so." },
    { id: "one-ones", prompt: "Complete: I prefer the red shoes to the black ___.", options: ["ones", "one", "it", "them ones"], correct: "ones", explanation: "Ones for a plural noun." },
    { id: "a-sea-of", prompt: "Complete: The singer looked out at ___ sea of faces.", options: ["a", "the many", "an", "—"], correct: "a", explanation: "A sea of." },
    { id: "busy-as-a-bee", prompt: "Choose the natural English simile.", options: ["as busy as a bee", "as busy as an ant", "as busy as a horse", "as busy as a fish"], correct: "as busy as a bee", explanation: "English image." },
  ],
};
