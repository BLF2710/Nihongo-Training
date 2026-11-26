// C1 Unit 1: Language & Communication. Advanced Vietnamese speakers often keep normal order after a negative adverb
// ("Never I have seen…"), pair "no sooner" with when, translate word-for-word without connotation ("You look so
// skinny!" as praise), carry Vietnamese collocations over ("strong rain", "strongly disappointed"), mix up "as far as
// I'm concerned" and "as far as I know", and sound too direct in English ("Your work is bad", "I want you to…"). This
// unit puts those right for precise, tactful communication.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "C1",
  number: 1,
  lessons: [{
    key: "negative-inversion", title: "Never Have I Seen…", titleVi: "Đảo ngữ với trạng từ phủ định",
    objectives: [
      "I can add drama and emphasis in formal speech and writing.",
      "Invert subject and auxiliary after never, rarely, seldom, little and under no circumstances",
      "Use No sooner… than, Hardly… when and Not only… but also",
    ],
    vocabulary: [
      { word: "rarely", ipa: "/ˈreəli/", partOfSpeech: "adverb", vietnamese: "hiếm khi", definition: "not often", example: { english: "Rarely do we see such talent in someone so young.", vietnamese: "Hiếm khi chúng ta thấy tài năng như vậy ở một người trẻ đến thế." } },
      { word: "seldom", ipa: "/ˈseldəm/", partOfSpeech: "adverb", vietnamese: "ít khi (trang trọng)", definition: "almost never (formal)", example: { english: "Seldom has a film caused so much debate.", vietnamese: "Ít khi một bộ phim gây ra nhiều tranh luận đến vậy." } },
      { word: "hardly", ipa: "/ˈhɑːdli/", partOfSpeech: "adverb", vietnamese: "hầu như không, vừa mới", definition: "almost not; only just", example: { english: "Hardly had we sat down when the fire alarm went off.", vietnamese: "Chúng tôi vừa mới ngồi xuống thì chuông báo cháy reo." } },
      { word: "scarcely", ipa: "/ˈskeəsli/", partOfSpeech: "adverb", vietnamese: "hầu như không, vừa mới (trang trọng)", definition: "almost not; only just (formal)", example: { english: "Scarcely had the meeting begun when the power failed.", vietnamese: "Cuộc họp vừa bắt đầu thì mất điện." } },
      { word: "no sooner", ipa: "/ˌnəʊ ˈsuːnə/", partOfSpeech: "phrase", vietnamese: "vừa mới… thì", definition: "used to say that one thing happened immediately after another (+ than)", example: { english: "No sooner had I paid than I saw it cheaper online.", vietnamese: "Tôi vừa trả tiền xong thì thấy trên mạng bán rẻ hơn." } },
      { word: "under no circumstances", ipa: "/ˌʌndə nəʊ ˈsɜːkəmstənsɪz/", partOfSpeech: "phrase", vietnamese: "trong bất kỳ trường hợp nào cũng không", definition: "never, whatever happens", example: { english: "Under no circumstances should you share your password.", vietnamese: "Trong bất kỳ trường hợp nào cũng không được chia sẻ mật khẩu." } },
      { word: "little", ipa: "/ˈlɪtl/", partOfSpeech: "adverb", vietnamese: "hầu như không, chẳng hề", definition: "not at all (used before know, realise, suspect)", example: { english: "Little did she know that her life was about to change.", vietnamese: "Cô ấy chẳng hề biết rằng cuộc đời mình sắp thay đổi." } },
      { word: "not only", ipa: "/ˌnɒt ˈəʊnli/", partOfSpeech: "phrase", vietnamese: "không những", definition: "used with but also to add a second, stronger point", example: { english: "Not only is the hotel cheap, but it's also beautiful.", vietnamese: "Khách sạn không những rẻ mà còn đẹp." } },
    ],
    grammar: [{
      title: "Negative adverb + inversion",
      pattern: "Never / Rarely / Seldom / Little / Under no circumstances + auxiliary + subject + verb",
      explanation: {
        english: "In formal or dramatic English, a negative or restrictive word can move to the front of the sentence. When it does, the auxiliary comes before the subject, as in a question: I have never seen… → Never have I seen… He rarely complains → Rarely does he complain. If there is no auxiliary, add do, does or did.",
        vietnamese: "Trong tiếng Anh trang trọng hoặc giàu kịch tính, từ phủ định hay hạn chế có thể đưa lên đầu câu. Khi đó, trợ động từ đứng trước chủ ngữ, giống câu hỏi: I have never seen… → Never have I seen… He rarely complains → Rarely does he complain. Nếu không có trợ động từ, thêm do, does hoặc did.",
      },
      examples: [
        { english: "Little did we realise how dangerous the climb would be.", vietnamese: "Chúng tôi chẳng hề nhận ra cuộc leo núi sẽ nguy hiểm đến mức nào." },
        { english: "Under no circumstances will refunds be given.", vietnamese: "Trong bất kỳ trường hợp nào cũng không hoàn tiền." },
      ],
      mistake: {
        wrong: "Never I have seen such a beautiful sunset.", right: "Never have I seen such a beautiful sunset.",
        why: { english: "After a fronted negative adverb, put the auxiliary before the subject.", vietnamese: "Sau trạng từ phủ định đặt đầu câu, đưa trợ động từ lên trước chủ ngữ." },
      },
    }, {
      title: "No sooner, hardly, not only",
      pattern: "No sooner + had + subject + past participle + than … · Hardly / Scarcely + had … when … · Not only + auxiliary + subject …, but (also) …",
      explanation: {
        english: "These pairs show that one event followed another immediately: No sooner had we arrived than it started to rain. Hardly had we arrived when it started to rain. Note the partner word: no sooner goes with than, hardly and scarcely go with when. Not only also inverts: Not only did he win, but he also broke the record.",
        vietnamese: "Các cặp này cho thấy một sự việc xảy ra ngay sau sự việc khác: No sooner had we arrived than it started to rain. Hardly had we arrived when it started to rain. Lưu ý từ đi kèm: no sooner đi với than, còn hardly và scarcely đi với when. Not only cũng đảo ngữ: Not only did he win, but he also broke the record.",
      },
      examples: [
        { english: "Scarcely had the plane landed when the passengers stood up.", vietnamese: "Máy bay vừa hạ cánh thì hành khách đứng dậy." },
        { english: "Not only does she speak French, but she also teaches it.", vietnamese: "Cô ấy không những nói tiếng Pháp mà còn dạy tiếng Pháp." },
      ],
      mistake: {
        wrong: "No sooner had I left when it started to snow.", right: "No sooner had I left than it started to snow.",
        why: { english: "No sooner is followed by than, not when.", vietnamese: "No sooner đi với than, không đi với when." },
      },
    }],
    examples: [
      { english: "Rarely does the city look as peaceful as it does at dawn.", vietnamese: "Hiếm khi thành phố trông yên bình như lúc bình minh." },
      { english: "Seldom have I met anyone so generous.", vietnamese: "Ít khi tôi gặp ai hào phóng đến vậy." },
      { english: "No sooner had he finished one project than he started another.", vietnamese: "Anh ấy vừa xong một dự án thì đã bắt đầu dự án khác." },
      { english: "Not only was the food cold, but the waiter was also rude.", vietnamese: "Đồ ăn không những nguội mà người phục vụ còn thô lỗ." },
    ],
    dialogue: [
      { speaker: "Presenter", english: "You've just come back from Antarctica. What was it like?", vietnamese: "Anh vừa trở về từ Nam Cực. Ở đó thế nào?" },
      { speaker: "Dr Minh", english: "Extraordinary. Never have I felt so small.", vietnamese: "Phi thường. Chưa bao giờ tôi thấy mình nhỏ bé đến vậy." },
      { speaker: "Presenter", english: "Was the journey difficult?", vietnamese: "Hành trình có khó khăn không?" },
      { speaker: "Dr Minh", english: "Very. No sooner had we landed than a storm hit the camp.", vietnamese: "Rất khó. Chúng tôi vừa hạ cánh thì một cơn bão ập vào trại." },
      { speaker: "Presenter", english: "And the research itself?", vietnamese: "Còn bản thân công trình nghiên cứu?" },
      { speaker: "Dr Minh", english: "Not only did we collect the samples, but we also found a new species of moss.", vietnamese: "Chúng tôi không những thu thập được mẫu mà còn phát hiện một loài rêu mới." },
    ],
    practice: [
      q("Complete: Never ___ such a mess!", ["have I seen", "I have seen", "I saw", "seen I have"], "have I seen", "Inversion after never."),
      q("Complete: Rarely ___ late for work.", ["is she", "she is", "she's", "does she is"], "is she", "Auxiliary before subject."),
      q("Complete: No sooner had I sat down ___ the phone rang.", ["than", "when", "then", "that"], "than", "No sooner… than."),
      q("“Trong bất kỳ trường hợp nào cũng không” in English is…", ["under no circumstances", "in no situations ever", "on no case", "by no means of"], "under no circumstances", "Under no circumstances."),
    ],
    challenge: [
      q("Complete: Little ___ that he was being watched.", ["did he know", "he knew", "he did know", "knew he did"], "did he know", "Little + did + subject + verb."),
      q("Complete: Hardly had we started ___ it began to rain.", ["when", "than", "then", "that"], "when", "Hardly… when."),
      q("Choose the correct sentence.", ["Not only did she pass, but she also got top marks.", "Not only she passed, but she also got top marks.", "Not only passed she, but she also got top marks.", "Not only she did pass, but also she got top marks."], "Not only did she pass, but she also got top marks.", "Not only + did + subject."),
      q("Complete: Under no circumstances ___ leave the building.", ["should you", "you should", "you must to", "should you to"], "should you", "Inversion: should you."),
      q("Which word is the most formal way to say “not often”?", ["seldom", "hardly ever", "not much", "once in a blue moon"], "seldom", "Seldom is formal."),
    ],
  }, {
    key: "connotation", title: "Slim, Skinny or Slender?", titleVi: "Sắc thái nghĩa của từ",
    objectives: [
      "I can choose words with the right positive or negative feeling.",
      "Tell near-synonyms apart by their connotation: slim / skinny, thrifty / stingy",
      "Use a bit and rather with negative words, and very with positive ones",
    ],
    vocabulary: [
      { word: "slim", ipa: "/slɪm/", partOfSpeech: "adjective", vietnamese: "thon thả", definition: "thin in an attractive way (positive)", example: { english: "She's tall and slim.", vietnamese: "Cô ấy cao và thon thả." } },
      { word: "skinny", ipa: "/ˈskɪni/", partOfSpeech: "adjective", vietnamese: "gầy nhom, gầy trơ xương", definition: "too thin (often negative)", example: { english: "He was a skinny teenager who ate nothing.", vietnamese: "Cậu ấy là một thiếu niên gầy nhom chẳng chịu ăn gì." } },
      { word: "thrifty", ipa: "/ˈθrɪfti/", partOfSpeech: "adjective", vietnamese: "tằn tiện, biết tiết kiệm", definition: "careful with money (positive)", example: { english: "My grandmother was thrifty and never wasted food.", vietnamese: "Bà tôi rất tằn tiện và không bao giờ lãng phí đồ ăn." } },
      { word: "stingy", ipa: "/ˈstɪndʒi/", partOfSpeech: "adjective", vietnamese: "keo kiệt", definition: "unwilling to spend or give money (negative)", example: { english: "He's so stingy he never buys a round of drinks.", vietnamese: "Anh ta keo kiệt đến mức chưa bao giờ mời ai một chầu." } },
      { word: "assertive", ipa: "/əˈsɜːtɪv/", partOfSpeech: "adjective", vietnamese: "quyết đoán, tự tin", definition: "confident and direct in a good way (positive)", example: { english: "You need to be more assertive in meetings.", vietnamese: "Bạn cần quyết đoán hơn trong các cuộc họp." } },
      { word: "pushy", ipa: "/ˈpʊʃi/", partOfSpeech: "adjective", vietnamese: "hay ép buộc, thúc ép người khác", definition: "too forceful in getting what you want (negative)", example: { english: "The salesman was so pushy that I left the shop.", vietnamese: "Người bán hàng ép quá nên tôi bỏ đi." } },
      { word: "inquisitive", ipa: "/ɪnˈkwɪzətɪv/", partOfSpeech: "adjective", vietnamese: "ham hiểu biết, hay tìm tòi", definition: "eager to learn and ask questions (positive)", example: { english: "Inquisitive children ask endless questions.", vietnamese: "Trẻ ham hiểu biết hỏi không ngớt." } },
      { word: "nosy", ipa: "/ˈnəʊzi/", partOfSpeech: "adjective", vietnamese: "tọc mạch, nhiều chuyện", definition: "too interested in other people's private lives (negative)", example: { english: "Our nosy neighbour reads our post.", vietnamese: "Bà hàng xóm tọc mạch đọc cả thư của chúng tôi." } },
    ],
    grammar: [{
      title: "Positive and negative pairs",
      pattern: "positive ↔ negative: slim / skinny · thrifty / stingy · assertive / pushy · inquisitive / nosy · confident / arrogant",
      explanation: {
        english: "Many words share a basic meaning but carry a different feeling. Slim and skinny both mean thin, but slim is a compliment and skinny usually isn't. A dictionary translation often gives the same Vietnamese word for both, so check the example sentences and choose by the impression you want to give.",
        vietnamese: "Nhiều từ có cùng nghĩa cơ bản nhưng mang sắc thái khác nhau. Slim và skinny đều nghĩa là gầy, nhưng slim là lời khen còn skinny thường thì không. Bản dịch trong từ điển hay cho cùng một từ tiếng Việt, nên hãy xem câu ví dụ và chọn theo ấn tượng bạn muốn tạo ra.",
      },
      examples: [
        { english: "She's very assertive, which makes her a good manager.", vietnamese: "Cô ấy rất quyết đoán, nên là một quản lý giỏi." },
        { english: "Don't be so nosy! It's none of your business.", vietnamese: "Đừng tọc mạch thế! Không phải việc của bạn." },
      ],
      mistake: {
        wrong: "You look so skinny in that dress. Lovely!", right: "You look so slim in that dress. Lovely!",
        why: { english: "For a compliment, choose the positive word slim. Skinny can sound rude.", vietnamese: "Để khen, chọn từ tích cực slim. Skinny có thể nghe bất lịch sự." },
      },
    }, {
      title: "A bit, rather and very",
      pattern: "a bit / a little / rather + negative adjective (a bit pushy) · very / really + positive adjective (very kind)",
      explanation: {
        english: "In British English, a bit, a little and rather usually soften negative qualities: He's a bit stingy. It's rather expensive. With positive adjectives, use very or really instead. Saying “a bit kind” sounds strange, because a bit suggests a problem.",
        vietnamese: "Trong tiếng Anh-Anh, a bit, a little và rather thường làm nhẹ đi tính chất tiêu cực: He's a bit stingy. It's rather expensive. Với tính từ tích cực, dùng very hoặc really. Nói “a bit kind” nghe rất lạ, vì a bit ngụ ý có vấn đề.",
      },
      examples: [
        { english: "The new manager is a bit pushy, to be honest.", vietnamese: "Thật lòng mà nói, quản lý mới hơi ép người." },
        { english: "She's really inquisitive. She'll make a great journalist.", vietnamese: "Cô ấy thật ham hiểu biết. Cô ấy sẽ là một nhà báo giỏi." },
      ],
      mistake: {
        wrong: "My teacher is a bit kind.", right: "My teacher is very kind.",
        why: { english: "A bit goes with negative adjectives. Use very with kind.", vietnamese: "A bit đi với tính từ tiêu cực. Với kind, dùng very." },
      },
    }],
    examples: [
      { english: "Being thrifty is a virtue; being stingy isn't.", vietnamese: "Tằn tiện là đức tính tốt; keo kiệt thì không." },
      { english: "There's a fine line between assertive and pushy.", vietnamese: "Ranh giới giữa quyết đoán và ép người rất mong manh." },
      { english: "An inquisitive mind is great, but a nosy one is annoying.", vietnamese: "Đầu óc ham hiểu biết thì tuyệt, nhưng tọc mạch thì phiền." },
      { english: "The model looked slim, but some said she was too skinny.", vietnamese: "Người mẫu trông thon thả, nhưng có người nói cô ấy quá gầy." },
    ],
    dialogue: [
      { speaker: "Grace", english: "How was your date with Vinh?", vietnamese: "Buổi hẹn với Vinh thế nào?" },
      { speaker: "Anh", english: "He's nice, but he's a bit stingy. He asked me to pay half for a coffee.", vietnamese: "Anh ấy tốt, nhưng hơi keo kiệt. Anh ấy bảo mình trả một nửa tiền cà phê." },
      { speaker: "Grace", english: "Maybe he's just thrifty. He's saving for a flat.", vietnamese: "Có lẽ anh ấy chỉ tằn tiện thôi. Anh ấy đang tiết kiệm mua căn hộ." },
      { speaker: "Anh", english: "Maybe. He was also rather nosy about my salary.", vietnamese: "Có thể. Anh ấy còn khá tọc mạch về lương của mình." },
      { speaker: "Grace", english: "Or inquisitive! He's very interested in people.", vietnamese: "Hoặc là ham tìm hiểu! Anh ấy rất quan tâm đến mọi người." },
      { speaker: "Anh", english: "You always choose the positive word, don't you?", vietnamese: "Bạn lúc nào cũng chọn từ tích cực, nhỉ?" },
    ],
    practice: [
      q("Which word is a compliment?", ["slim", "skinny", "bony", "scrawny"], "slim", "Slim = attractively thin."),
      q("Which word is negative?", ["stingy", "thrifty", "economical", "careful with money"], "stingy", "Stingy = unwilling to spend."),
      q("Complete: He's ___ pushy, but he gets results.", ["a bit", "very nice", "a bit kind", "really lovely"], "a bit", "A bit + negative adjective."),
      q("“Tọc mạch” in English is…", ["nosy", "inquisitive", "noisy", "curious kind"], "nosy", "Nosy = too interested in others' lives."),
    ],
    challenge: [
      q("Which is the positive word for someone who asks a lot of questions?", ["inquisitive", "nosy", "prying", "interfering"], "inquisitive", "Inquisitive = eager to learn."),
      q("Choose the most natural sentence.", ["She's very generous.", "She's a bit generous.", "She's rather generous kind.", "She's a little lovely."], "She's very generous.", "Very + positive adjective."),
      q("Which word describes a good manager who speaks up confidently?", ["assertive", "pushy", "bossy", "aggressive"], "assertive", "Assertive = positive."),
      q("Complete: My grandparents were ___ and saved every penny.", ["thrifty", "stingy", "mean", "tight-fisted"], "thrifty", "Thrifty = positive."),
      q("What is “connotation”?", ["the feeling a word carries beyond its basic meaning", "the spelling of a word", "the opposite of a word", "the pronunciation"], "the feeling a word carries beyond its basic meaning", "Connotation = extra feeling."),
    ],
  }, {
    key: "strong-collocations", title: "Heavy Rain, Strong Coffee", titleVi: "Cụm từ cố định nâng cao",
    objectives: [
      "I can sound natural by using the right word partners.",
      "Use adjective + noun collocations: heavy rain, strong coffee",
      "Use adverb + adjective collocations: bitterly disappointed, highly unlikely",
    ],
    vocabulary: [
      { word: "heavy traffic", ipa: "/ˌhevi ˈtræfɪk/", partOfSpeech: "collocation", vietnamese: "giao thông đông đúc", definition: "a lot of vehicles on the road", example: { english: "We were delayed by heavy traffic.", vietnamese: "Chúng tôi bị chậm vì giao thông đông đúc." } },
      { word: "strong coffee", ipa: "/ˌstrɒŋ ˈkɒfi/", partOfSpeech: "collocation", vietnamese: "cà phê đặc", definition: "coffee with a lot of flavour", example: { english: "Vietnamese iced coffee is very strong.", vietnamese: "Cà phê đá Việt Nam rất đặc." } },
      { word: "bitterly disappointed", ipa: "/ˌbɪtəli ˌdɪsəˈpɔɪntɪd/", partOfSpeech: "collocation", vietnamese: "vô cùng thất vọng", definition: "extremely disappointed", example: { english: "The fans were bitterly disappointed by the result.", vietnamese: "Người hâm mộ vô cùng thất vọng với kết quả." } },
      { word: "highly unlikely", ipa: "/ˌhaɪli ʌnˈlaɪkli/", partOfSpeech: "collocation", vietnamese: "rất khó xảy ra", definition: "very improbable", example: { english: "It's highly unlikely that it will snow in Saigon.", vietnamese: "Rất khó có chuyện tuyết rơi ở Sài Gòn." } },
      { word: "deeply concerned", ipa: "/ˌdiːpli kənˈsɜːnd/", partOfSpeech: "collocation", vietnamese: "vô cùng lo ngại", definition: "very worried", example: { english: "Doctors are deeply concerned about air quality.", vietnamese: "Các bác sĩ vô cùng lo ngại về chất lượng không khí." } },
      { word: "fully aware", ipa: "/ˌfʊli əˈweə/", partOfSpeech: "collocation", vietnamese: "hoàn toàn nhận thức được", definition: "knowing completely about something", example: { english: "I'm fully aware of the risks.", vietnamese: "Tôi hoàn toàn nhận thức được các rủi ro." } },
      { word: "a narrow escape", ipa: "/ə ˌnærəʊ ɪˈskeɪp/", partOfSpeech: "collocation", vietnamese: "thoát chết trong gang tấc", definition: "a situation where you only just avoid danger", example: { english: "The driver had a narrow escape when the tree fell.", vietnamese: "Tài xế thoát chết trong gang tấc khi cây đổ." } },
      { word: "take into account", ipa: "/ˌteɪk ˌɪntə əˈkaʊnt/", partOfSpeech: "collocation", vietnamese: "tính đến, xem xét", definition: "to consider something when making a decision", example: { english: "We need to take the cost into account.", vietnamese: "Chúng ta cần tính đến chi phí." } },
    ],
    grammar: [{
      title: "Adjective + noun",
      pattern: "heavy rain / traffic / smoker · strong wind / coffee / accent · high price / temperature · deep sleep",
      explanation: {
        english: "Collocations are word partners that native speakers expect. You can't always translate them: Vietnamese “mưa to” is heavy rain, not big or strong rain; “cà phê đặc” is strong coffee, not thick coffee. Learn the noun with its usual adjective, and notice which ones don't go together.",
        vietnamese: "Collocation là những cặp từ người bản ngữ quen dùng. Không phải lúc nào cũng dịch thẳng được: “mưa to” là heavy rain, không phải big hay strong rain; “cà phê đặc” là strong coffee, không phải thick coffee. Hãy học danh từ kèm tính từ hay đi với nó, và để ý những cặp không đi với nhau.",
      },
      examples: [
        { english: "He has a strong Scottish accent.", vietnamese: "Anh ấy nói giọng Scotland rất nặng." },
        { english: "My grandfather was a heavy smoker.", vietnamese: "Ông tôi từng là người hút thuốc nhiều." },
      ],
      mistake: {
        wrong: "There was strong rain all night.", right: "There was heavy rain all night.",
        why: { english: "Rain collocates with heavy, not strong.", vietnamese: "Rain đi với heavy, không đi với strong." },
      },
    }, {
      title: "Adverb + adjective",
      pattern: "bitterly disappointed · highly unlikely / successful · deeply concerned / moved · fully aware · utterly ridiculous",
      explanation: {
        english: "Instead of always using very, advanced speakers choose the adverb that naturally goes with each adjective: bitterly disappointed, highly unlikely, deeply moved, fully aware, seriously ill. Choosing the wrong adverb (strongly disappointed) sounds translated.",
        vietnamese: "Thay vì luôn dùng very, người nói trình độ cao chọn trạng từ tự nhiên đi với từng tính từ: bitterly disappointed, highly unlikely, deeply moved, fully aware, seriously ill. Chọn sai trạng từ (strongly disappointed) nghe như bản dịch.",
      },
      examples: [
        { english: "We were deeply moved by her speech.", vietnamese: "Chúng tôi vô cùng xúc động trước bài phát biểu của cô ấy." },
        { english: "The film was highly successful in Asia.", vietnamese: "Bộ phim rất thành công ở châu Á." },
      ],
      mistake: {
        wrong: "I was strongly disappointed with the hotel.", right: "I was bitterly disappointed with the hotel.",
        why: { english: "Disappointed collocates with bitterly or deeply, not strongly.", vietnamese: "Disappointed đi với bitterly hoặc deeply, không đi với strongly." },
      },
    }],
    examples: [
      { english: "Taking into account the heavy traffic, we should leave now.", vietnamese: "Tính đến chuyện giao thông đông đúc, chúng ta nên đi ngay." },
      { english: "It's highly unlikely that the shop will be open on Tet.", vietnamese: "Rất khó có chuyện cửa hàng mở cửa vào dịp Tết." },
      { english: "The government is deeply concerned about rising prices.", vietnamese: "Chính phủ vô cùng lo ngại về giá cả tăng cao." },
      { english: "He had a narrow escape when his motorbike skidded.", vietnamese: "Anh ấy thoát chết trong gang tấc khi xe máy bị trượt." },
    ],
    dialogue: [
      { speaker: "Ian", english: "You look shattered. Bad journey?", vietnamese: "Trông bạn mệt rã rời. Đi đường vất vả à?" },
      { speaker: "Thao", english: "Terrible. Heavy rain and heavy traffic the whole way.", vietnamese: "Kinh khủng. Mưa to và tắc đường suốt cả đoạn." },
      { speaker: "Ian", english: "Did you make it to the interview?", vietnamese: "Bạn có kịp buổi phỏng vấn không?" },
      { speaker: "Thao", english: "Just. But I'm bitterly disappointed. I don't think it went well.", vietnamese: "Vừa kịp. Nhưng mình vô cùng thất vọng. Mình nghĩ là không ổn." },
      { speaker: "Ian", english: "They'll take the weather into account, surely.", vietnamese: "Chắc chắn họ sẽ tính đến chuyện thời tiết mà." },
      { speaker: "Thao", english: "Maybe. Right now I just need a strong coffee.", vietnamese: "Có thể. Giờ mình chỉ cần một ly cà phê đặc." },
    ],
    practice: [
      q("Complete: There was ___ rain last night.", ["heavy", "strong", "big", "thick"], "heavy", "Heavy rain."),
      q("Complete: I'd like a ___ coffee, please.", ["strong", "heavy", "thick", "hard"], "strong", "Strong coffee."),
      q("Complete: It's ___ unlikely that he'll come.", ["highly", "strongly", "heavily", "deeply"], "highly", "Highly unlikely."),
      q("“Thoát chết trong gang tấc” in English is…", ["a narrow escape", "a thin escape", "a small escape", "a close run away"], "a narrow escape", "A narrow escape."),
    ],
    challenge: [
      q("Complete: The fans were ___ disappointed.", ["bitterly", "strongly", "highly", "heavily"], "bitterly", "Bitterly disappointed."),
      q("Complete: Are you ___ aware of the consequences?", ["fully", "highly", "heavily", "bitterly"], "fully", "Fully aware."),
      q("Complete: She was ___ moved by the letter.", ["deeply", "highly", "strongly", "heavily"], "deeply", "Deeply moved."),
      q("Complete: You must take the weather ___ account.", ["into", "in", "on", "to"], "into", "Take into account."),
      q("Which collocation is wrong?", ["strong rain", "heavy traffic", "strong wind", "heavy smoker"], "strong rain", "Rain is heavy."),
    ],
  }, {
    key: "discourse-markers", title: "Having Said That…", titleVi: "Từ dẫn dắt trong văn nói",
    objectives: [
      "I can sound natural in conversation by signalling how ideas connect.",
      "Add contrast or a second thought with having said that, mind you and admittedly",
      "Use as far as I'm concerned, as far as I know, come to think of it and as I was saying",
    ],
    vocabulary: [
      { word: "having said that", ipa: "/ˌhævɪŋ ˈsed ðæt/", partOfSpeech: "phrase", vietnamese: "dù vậy, nói thế thôi chứ", definition: "used to add an idea that contrasts with what you just said", example: { english: "The film was long. Having said that, I enjoyed it.", vietnamese: "Phim dài. Dù vậy, tôi vẫn thích." } },
      { word: "mind you", ipa: "/ˈmaɪnd juː/", partOfSpeech: "phrase", vietnamese: "nhưng mà, phải nói là", definition: "used to add something that makes the previous statement less strong (informal)", example: { english: "The hotel was expensive. Mind you, the view was incredible.", vietnamese: "Khách sạn đắt. Nhưng mà phải nói là cảnh đẹp không tưởng." } },
      { word: "admittedly", ipa: "/ədˈmɪtɪdli/", partOfSpeech: "adverb", vietnamese: "phải thừa nhận là", definition: "used when you accept that something is true", example: { english: "Admittedly, I should have checked the date.", vietnamese: "Phải thừa nhận là lẽ ra tôi nên kiểm tra ngày." } },
      { word: "as far as I'm concerned", ipa: "/əz ˌfɑːr əz aɪm kənˈsɜːnd/", partOfSpeech: "phrase", vietnamese: "theo quan điểm của tôi", definition: "in my personal opinion", example: { english: "As far as I'm concerned, the price is too high.", vietnamese: "Theo quan điểm của tôi, giá quá cao." } },
      { word: "as far as I know", ipa: "/əz ˌfɑːr əz aɪ ˈnəʊ/", partOfSpeech: "phrase", vietnamese: "theo như tôi biết", definition: "based on the information I have", example: { english: "As far as I know, the museum is closed on Mondays.", vietnamese: "Theo như tôi biết, bảo tàng đóng cửa vào thứ Hai." } },
      { word: "come to think of it", ipa: "/ˌkʌm tə ˈθɪŋk əv ɪt/", partOfSpeech: "idiom", vietnamese: "nghĩ lại thì", definition: "used when you suddenly remember or realise something", example: { english: "Come to think of it, I did see him yesterday.", vietnamese: "Nghĩ lại thì hôm qua tôi có gặp anh ấy." } },
      { word: "as I was saying", ipa: "/əz aɪ wəz ˈseɪɪŋ/", partOfSpeech: "phrase", vietnamese: "như tôi đang nói", definition: "used to return to a topic after an interruption", example: { english: "Anyway, as I was saying, the plan needs more work.", vietnamese: "Dù sao, như tôi đang nói, kế hoạch cần thêm thời gian." } },
      { word: "all in all", ipa: "/ˌɔːl ɪn ˈɔːl/", partOfSpeech: "phrase", vietnamese: "nhìn chung", definition: "considering everything", example: { english: "All in all, it was a great trip.", vietnamese: "Nhìn chung, đó là một chuyến đi tuyệt vời." } },
    ],
    grammar: [{
      title: "Opinion or fact?",
      pattern: "as far as I'm concerned (= my opinion) · as far as I know (= my information, which may be incomplete)",
      explanation: {
        english: "These two look similar but do different jobs. As far as I'm concerned introduces your personal opinion: As far as I'm concerned, the new law is unfair. As far as I know introduces a fact you believe but aren't sure of: As far as I know, the train leaves at six. Using the wrong one confuses your listener.",
        vietnamese: "Hai cụm này trông giống nhau nhưng có chức năng khác nhau. As far as I'm concerned dẫn vào ý kiến cá nhân: As far as I'm concerned, the new law is unfair. As far as I know dẫn vào một thông tin bạn tin nhưng không chắc: As far as I know, the train leaves at six. Dùng nhầm sẽ khiến người nghe bối rối.",
      },
      examples: [
        { english: "As far as I'm concerned, family comes first.", vietnamese: "Theo quan điểm của tôi, gia đình là trên hết." },
        { english: "As far as I know, nobody has complained.", vietnamese: "Theo như tôi biết, chưa ai phàn nàn cả." },
      ],
      mistake: {
        wrong: "As far as I'm concerned, the bank opens at eight.", right: "As far as I know, the bank opens at eight.",
        why: { english: "Opening times are facts, not opinions, so use as far as I know.", vietnamese: "Giờ mở cửa là thông tin, không phải ý kiến, nên dùng as far as I know." },
      },
    }, {
      title: "Second thoughts and returning",
      pattern: "Having said that, / Mind you, / Admittedly, (contrast) · Come to think of it, (a new thought) · As I was saying, / Anyway, (back to the topic)",
      explanation: {
        english: "Discourse markers show how your next sentence connects. Having said that and mind you add a contrast to what you just said; admittedly accepts a point against you. Come to think of it introduces something you've just remembered. As I was saying brings the conversation back after an interruption. Use the full fixed forms.",
        vietnamese: "Từ dẫn dắt cho thấy câu tiếp theo liên kết thế nào. Having said that và mind you thêm ý trái ngược với điều vừa nói; admittedly thừa nhận một ý bất lợi cho mình. Come to think of it dẫn vào điều bạn vừa nhớ ra. As I was saying đưa câu chuyện trở lại sau khi bị ngắt. Hãy dùng đúng dạng cố định đầy đủ.",
      },
      examples: [
        { english: "Admittedly, the rent is high. Having said that, the location is perfect.", vietnamese: "Phải thừa nhận tiền thuê cao. Dù vậy, vị trí thì hoàn hảo." },
        { english: "Sorry, where was I? Oh yes, as I was saying…", vietnamese: "Xin lỗi, tôi đang nói đến đâu nhỉ? À đúng rồi, như tôi đang nói…" },
      ],
      mistake: {
        wrong: "Come to think, I left my keys in the car.", right: "Come to think of it, I left my keys in the car.",
        why: { english: "The fixed phrase is come to think of it.", vietnamese: "Cụm cố định là come to think of it." },
      },
    }],
    examples: [
      { english: "The course is hard. Mind you, it's worth it.", vietnamese: "Khoá học khó. Nhưng mà rất đáng." },
      { english: "All in all, I'd say the project was a success.", vietnamese: "Nhìn chung, tôi cho rằng dự án đã thành công." },
      { english: "Come to think of it, I haven't heard from Lan for weeks.", vietnamese: "Nghĩ lại thì đã mấy tuần tôi không nghe tin gì từ Lan." },
      { english: "As far as I'm concerned, he can do what he likes.", vietnamese: "Theo quan điểm của tôi, anh ấy muốn làm gì thì làm." },
    ],
    dialogue: [
      { speaker: "Rob", english: "So, what did you think of Da Lat?", vietnamese: "Vậy bạn thấy Đà Lạt thế nào?" },
      { speaker: "Kim", english: "It's beautiful. Having said that, it's much busier than I expected.", vietnamese: "Đẹp lắm. Dù vậy, đông hơn mình nghĩ nhiều." },
      { speaker: "Rob", english: "Isn't it quieter in the rainy season?", vietnamese: "Mùa mưa không vắng hơn sao?" },
      { speaker: "Kim", english: "As far as I know, yes. Mind you, it rains every afternoon then.", vietnamese: "Theo mình biết thì có. Nhưng mà lúc đó chiều nào cũng mưa." },
      { speaker: "Rob", english: "Come to think of it, my cousin went in July and loved it.", vietnamese: "Nghĩ lại thì em họ mình đi hồi tháng Bảy và rất thích." },
      { speaker: "Kim", english: "All in all, I'd definitely go back.", vietnamese: "Nhìn chung, mình chắc chắn sẽ quay lại." },
    ],
    practice: [
      q("Complete: ___, I think the decision was wrong.", ["As far as I'm concerned", "As far as I know", "Come to think of it", "As I was saying"], "As far as I'm concerned", "Personal opinion."),
      q("Complete: ___, the shop closes at nine. But check.", ["As far as I know", "As far as I'm concerned", "Mind you", "All in all"], "As far as I know", "A fact you're not sure of."),
      q("Complete: The food was cold. ___, the service was great.", ["Having said that", "As I was saying", "As far as I know", "Come to think of it"], "Having said that", "Contrast."),
      q("“Nhìn chung” in English is…", ["all in all", "all of all", "in all all", "on all"], "all in all", "All in all = considering everything."),
    ],
    challenge: [
      q("Complete: ___, I did see her at the party.", ["Come to think of it", "Come to think", "Coming to think", "Came to think of it"], "Come to think of it", "Fixed phrase."),
      q("After an interruption, you say…", ["As I was saying, …", "As far as I know, …", "Admittedly, …", "Mind you, …"], "As I was saying, …", "Back to the topic."),
      q("Complete: ___, I made a few mistakes. But the result was good.", ["Admittedly", "As I was saying", "As far as I know", "All in all"], "Admittedly", "Accepting a point against you."),
      q("Which is the most informal?", ["Mind you", "Having said that", "Nevertheless", "Notwithstanding"], "Mind you", "Mind you = informal."),
      q("What does “admittedly” do?", ["accepts that something is true, even if it weakens your point", "adds a fact", "ends a conversation", "asks a question"], "accepts that something is true, even if it weakens your point", "Admittedly = I accept that."),
    ],
  }, {
    key: "tact", title: "Not Exactly Ideal", titleVi: "Nói giảm nói tránh",
    objectives: [
      "I can criticise, refuse and make requests tactfully.",
      "Soften criticism with not exactly, not very and not quite + a positive word",
      "Distance requests with past forms: I was wondering if…, I was hoping…",
    ],
    vocabulary: [
      { word: "tactful", ipa: "/ˈtæktfl/", partOfSpeech: "adjective", vietnamese: "khéo léo, tế nhị", definition: "careful not to upset people", example: { english: "It was very tactful of you not to mention his weight.", vietnamese: "Bạn thật tế nhị khi không nhắc đến cân nặng của anh ấy." } },
      { word: "blunt", ipa: "/blʌnt/", partOfSpeech: "adjective", vietnamese: "thẳng thừng, bộc trực", definition: "saying exactly what you think, without being polite", example: { english: "Sorry to be blunt, but your idea won't work.", vietnamese: "Xin lỗi vì nói thẳng, nhưng ý tưởng của bạn sẽ không hiệu quả." } },
      { word: "diplomatic", ipa: "/ˌdɪpləˈmætɪk/", partOfSpeech: "adjective", vietnamese: "khéo léo, ngoại giao", definition: "good at dealing with people without upsetting them", example: { english: "She gave a diplomatic answer.", vietnamese: "Cô ấy đưa ra một câu trả lời khéo léo." } },
      { word: "somewhat", ipa: "/ˈsʌmwɒt/", partOfSpeech: "adverb", vietnamese: "phần nào, hơi", definition: "to some degree; a little (formal)", example: { english: "The results were somewhat disappointing.", vietnamese: "Kết quả có phần đáng thất vọng." } },
      { word: "not exactly", ipa: "/ˌnɒt ɪɡˈzæktli/", partOfSpeech: "phrase", vietnamese: "không hẳn là", definition: "used to say politely that something is the opposite", example: { english: "The hotel was not exactly cheap.", vietnamese: "Khách sạn không hẳn là rẻ." } },
      { word: "I'm afraid", ipa: "/aɪm əˈfreɪd/", partOfSpeech: "phrase", vietnamese: "e rằng, rất tiếc", definition: "used politely before bad news or a refusal", example: { english: "I'm afraid we're fully booked tonight.", vietnamese: "Rất tiếc, tối nay chúng tôi đã kín chỗ." } },
      { word: "to be honest", ipa: "/tə bi ˈɒnɪst/", partOfSpeech: "phrase", vietnamese: "thật lòng mà nói", definition: "used before giving an honest, possibly unwelcome, opinion", example: { english: "To be honest, I'm not keen on the colour.", vietnamese: "Thật lòng mà nói, tôi không thích màu này lắm." } },
      { word: "constructive", ipa: "/kənˈstrʌktɪv/", partOfSpeech: "adjective", vietnamese: "mang tính xây dựng", definition: "helpful and intended to improve something", example: { english: "Thanks for the constructive feedback.", vietnamese: "Cảm ơn những nhận xét mang tính xây dựng." } },
    ],
    grammar: [{
      title: "Softening criticism",
      pattern: "not exactly / not very / not quite / not particularly + positive adjective · a little / slightly / somewhat + negative adjective",
      explanation: {
        english: "British English often criticises by understatement: instead of a negative word, use not + a positive word. It's bad → It's not very good. It was expensive → It wasn't exactly cheap. Or soften a negative word: a little late, slightly disappointing. Opening phrases like To be honest or I'm afraid prepare the listener.",
        vietnamese: "Tiếng Anh-Anh thường phê bình bằng cách nói giảm: thay vì dùng từ tiêu cực, dùng not + từ tích cực. It's bad → It's not very good. It was expensive → It wasn't exactly cheap. Hoặc làm nhẹ từ tiêu cực: a little late, slightly disappointing. Các cụm mở đầu như To be honest hay I'm afraid giúp người nghe chuẩn bị tinh thần.",
      },
      examples: [
        { english: "The presentation wasn't quite as clear as it could have been.", vietnamese: "Bài thuyết trình chưa thật sự rõ ràng như lẽ ra có thể." },
        { english: "I'm afraid the results are somewhat disappointing.", vietnamese: "E rằng kết quả có phần đáng thất vọng." },
      ],
      mistake: {
        wrong: "Your report is bad. Write it again.", right: "Your report isn't quite there yet. Could you have another look at it?",
        why: { english: "Direct criticism sounds rude in English. Use not quite + positive and a request.", vietnamese: "Phê bình trực tiếp nghe rất thô lỗ trong tiếng Anh. Dùng not quite + từ tích cực và một lời đề nghị." },
      },
    }, {
      title: "Distancing requests",
      pattern: "I was wondering if you could… · I was hoping you might… · Would it be possible to…? · I don't suppose you could…?",
      explanation: {
        english: "Past forms and modals create distance, which sounds more polite: I want you to send it today → I was hoping you could send it today. Can you help? → I was wondering if you could help. These don't refer to the past; the past tense simply makes the request softer.",
        vietnamese: "Dạng quá khứ và động từ khuyết thiếu tạo khoảng cách, nghe lịch sự hơn: I want you to send it today → I was hoping you could send it today. Can you help? → I was wondering if you could help. Chúng không nói về quá khứ; thì quá khứ chỉ làm lời đề nghị nhẹ nhàng hơn.",
      },
      examples: [
        { english: "Would it be possible to move the meeting to Thursday?", vietnamese: "Liệu có thể dời cuộc họp sang thứ Năm được không?" },
        { english: "I don't suppose you could lend me your car this weekend?", vietnamese: "Chắc bạn không thể cho tôi mượn xe cuối tuần này nhỉ?" },
      ],
      mistake: {
        wrong: "I want you to finish this today.", right: "I was hoping you could finish this today.",
        why: { english: "I want you to sounds like an order. A past form sounds polite.", vietnamese: "I want you to nghe như ra lệnh. Dạng quá khứ nghe lịch sự hơn." },
      },
    }],
    examples: [
      { english: "To be honest, the food wasn't exactly memorable.", vietnamese: "Thật lòng mà nói, đồ ăn không hẳn là đáng nhớ." },
      { english: "She's very diplomatic; she never sounds blunt.", vietnamese: "Cô ấy rất khéo léo; không bao giờ nghe thẳng thừng." },
      { english: "Thanks for the constructive comments. They were really tactful.", vietnamese: "Cảm ơn những góp ý mang tính xây dựng. Chúng rất tế nhị." },
      { english: "I'm afraid I won't be able to make it on Friday.", vietnamese: "E rằng tôi không thể đến vào thứ Sáu." },
    ],
    dialogue: [
      { speaker: "Manager", english: "Have you had a chance to read Duy's proposal?", vietnamese: "Chị đã có dịp đọc đề xuất của Duy chưa?" },
      { speaker: "Le", english: "Yes. To be honest, it's not quite ready yet.", vietnamese: "Rồi ạ. Thật lòng mà nói, nó chưa hoàn thiện lắm." },
      { speaker: "Manager", english: "Could you be a bit more specific?", vietnamese: "Chị có thể nói cụ thể hơn không?" },
      { speaker: "Le", english: "The budget section is somewhat unclear, and it's not exactly short.", vietnamese: "Phần ngân sách có phần chưa rõ, và nó không hẳn là ngắn." },
      { speaker: "Manager", english: "Fair enough. I was wondering if you could give him some feedback.", vietnamese: "Hợp lý. Không biết chị có thể góp ý cho cậu ấy không." },
      { speaker: "Le", english: "Of course. I'll keep it constructive.", vietnamese: "Tất nhiên ạ. Em sẽ góp ý mang tính xây dựng." },
    ],
    practice: [
      q("The most tactful way to say “It's ugly” is…", ["It's not exactly my style.", "It's terrible.", "It's ugly.", "I hate it."], "It's not exactly my style.", "Understatement."),
      q("Complete: I was ___ if you could help me.", ["wondering", "wonder", "wondered", "to wonder"], "wondering", "I was wondering if…"),
      q("Complete: I'm ___ we're closed today.", ["afraid", "fear", "scared", "afraiding"], "afraid", "I'm afraid = polite bad news."),
      q("“Thẳng thừng” in English is…", ["blunt", "tactful", "diplomatic", "sharp-witted"], "blunt", "Blunt = very direct."),
    ],
    challenge: [
      q("Which request is the most polite?", ["I don't suppose you could help me move?", "Help me move.", "You will help me move.", "I want you to help me move."], "I don't suppose you could help me move?", "Distanced request."),
      q("Complete: The results were ___ disappointing.", ["somewhat", "somehow", "something", "some"], "somewhat", "Somewhat = a little."),
      q("Choose the softest criticism.", ["It wasn't particularly well organised.", "It was badly organised.", "It was a disaster.", "Nobody organised it."], "It wasn't particularly well organised.", "Not + positive."),
      q("Complete: Would it be ___ to change my seat?", ["possible", "possibly", "possibility", "able"], "possible", "Would it be possible to…?"),
      q("What is “constructive” feedback?", ["helpful comments meant to improve something", "very negative comments", "comments about buildings", "no comments"], "helpful comments meant to improve something", "Constructive = helpful."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 1", isReview: true,
    objectives: [
      "I can communicate precisely, naturally and tactfully.",
      "Check inversion, connotation, collocations, discourse markers and softening",
    ],
    vocabulary: [
      { word: "seldom", ipa: "/ˈseldəm/", partOfSpeech: "adverb", vietnamese: "ít khi (trang trọng)", definition: "almost never (formal)", example: { english: "Seldom does he take a day off.", vietnamese: "Anh ấy ít khi nghỉ một ngày." } },
      { word: "thrifty", ipa: "/ˈθrɪfti/", partOfSpeech: "adjective", vietnamese: "tằn tiện, biết tiết kiệm", definition: "careful with money (positive)", example: { english: "Thrifty shoppers wait for the sales.", vietnamese: "Người mua sắm tằn tiện chờ mùa giảm giá." } },
      { word: "heavy traffic", ipa: "/ˌhevi ˈtræfɪk/", partOfSpeech: "collocation", vietnamese: "giao thông đông đúc", definition: "a lot of vehicles on the road", example: { english: "Expect heavy traffic before Tet.", vietnamese: "Trước Tết hãy chuẩn bị tinh thần đường đông." } },
      { word: "admittedly", ipa: "/ədˈmɪtɪdli/", partOfSpeech: "adverb", vietnamese: "phải thừa nhận là", definition: "used when you accept that something is true", example: { english: "Admittedly, it was my fault.", vietnamese: "Phải thừa nhận là lỗi của tôi." } },
      { word: "tactful", ipa: "/ˈtæktfl/", partOfSpeech: "adjective", vietnamese: "khéo léo, tế nhị", definition: "careful not to upset people", example: { english: "Try to be tactful when you tell her.", vietnamese: "Hãy cố gắng tế nhị khi nói với cô ấy." } },
      { word: "blunt", ipa: "/blʌnt/", partOfSpeech: "adjective", vietnamese: "thẳng thừng, bộc trực", definition: "saying exactly what you think, without being polite", example: { english: "His blunt comments upset the team.", vietnamese: "Những lời thẳng thừng của anh ấy làm cả nhóm phật lòng." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "Never have I… · No sooner… than / Hardly… when · slim not skinny (praise) · heavy rain / bitterly disappointed · as far as I know (fact) · not exactly cheap / I was wondering if…",
      explanation: {
        english: "Check these: after a fronted negative adverb, invert the auxiliary and subject, and match no sooner with than and hardly with when; choose words by connotation, and use a bit with negative words only; learn the natural partner words (heavy rain, highly unlikely); use as far as I'm concerned for opinions and as far as I know for facts; soften criticism with not + a positive word, and requests with past forms.",
        vietnamese: "Hãy kiểm tra: sau trạng từ phủ định đặt đầu câu, đảo trợ động từ và chủ ngữ, và ghép no sooner với than, hardly với when; chọn từ theo sắc thái, và chỉ dùng a bit với từ tiêu cực; học các cặp từ tự nhiên (heavy rain, highly unlikely); dùng as far as I'm concerned cho ý kiến và as far as I know cho thông tin; làm nhẹ lời phê bình bằng not + từ tích cực, và lời đề nghị bằng dạng quá khứ.",
      },
      examples: [
        { english: "Seldom have I heard such a tactful answer.", vietnamese: "Ít khi tôi nghe một câu trả lời tế nhị đến vậy." },
        { english: "Admittedly, the heavy traffic wasn't exactly ideal.", vietnamese: "Phải thừa nhận là việc tắc đường không hẳn là lý tưởng." },
      ],
    }],
    examples: [
      { english: "Being thrifty is sensible, but being blunt about it isn't always tactful.", vietnamese: "Tằn tiện là hợp lý, nhưng nói thẳng ra thì không phải lúc nào cũng tế nhị." },
      { english: "Seldom is there heavy traffic at this time of night.", vietnamese: "Ít khi giao thông đông đúc vào giờ này ban đêm." },
      { english: "Admittedly, I was a bit blunt yesterday.", vietnamese: "Phải thừa nhận là hôm qua tôi hơi thẳng thừng." },
    ],
    dialogue: [
      { speaker: "Ruth", english: "How did the client meeting go?", vietnamese: "Buổi gặp khách hàng thế nào?" },
      { speaker: "Bao", english: "Not exactly brilliant. No sooner had I started than they interrupted.", vietnamese: "Không hẳn là tuyệt vời. Tôi vừa bắt đầu thì họ ngắt lời." },
      { speaker: "Ruth", english: "Were they rude?", vietnamese: "Họ có thô lỗ không?" },
      { speaker: "Bao", english: "A bit blunt. Mind you, they had a point about the price.", vietnamese: "Hơi thẳng thừng. Nhưng mà họ cũng có lý về giá cả." },
      { speaker: "Ruth", english: "Admittedly, we are expensive.", vietnamese: "Phải thừa nhận là chúng ta đắt thật." },
      { speaker: "Bao", english: "I was wondering if we could offer a small discount.", vietnamese: "Không biết chúng ta có thể giảm giá một chút không." },
      { speaker: "Ruth", english: "Let me check. As far as I know, there's some flexibility.", vietnamese: "Để tôi kiểm tra. Theo tôi biết thì có thể linh hoạt được." },
    ],
    practice: [
      q("Complete: Seldom ___ such kindness.", ["have I seen", "I have seen", "I saw", "seen I"], "have I seen", "Inversion."),
      q("Which word is a compliment?", ["thrifty", "stingy", "mean", "tight"], "thrifty", "Positive connotation."),
      q("Complete: There's ___ traffic on the bridge.", ["heavy", "strong", "big", "thick"], "heavy", "Heavy traffic."),
      q("Complete: ___, the museum opens at nine.", ["As far as I know", "As far as I'm concerned", "Mind you", "All in all"], "As far as I know", "Fact."),
    ],
    challenge: [
      q("Complete: Hardly had the film started ___ the power went out.", ["when", "than", "then", "that"], "when", "Hardly… when."),
      q("Complete: I was ___ disappointed by the ending.", ["bitterly", "strongly", "heavily", "highly"], "bitterly", "Bitterly disappointed."),
      q("Choose the most tactful sentence.", ["The design isn't quite what we had in mind.", "The design is wrong.", "We hate the design.", "This design is a failure."], "The design isn't quite what we had in mind.", "Not quite + positive."),
      q("Complete: I was ___ you could check my CV.", ["hoping", "hope", "hoped", "to hope"], "hoping", "I was hoping…"),
      q("Choose the correct sentence.", ["Not only is it cheap, but it's also fast.", "Not only it is cheap, but it's also fast.", "Not only cheap it is, but also fast.", "Not only is cheap it, but fast."], "Not only is it cheap, but it's also fast.", "Not only + inversion."),
    ],
  }],
  assessment: [
    { id: "never-inversion", prompt: "Complete: Never ___ so nervous.", options: ["have I felt", "I have felt", "I felt", "felt I have"], correct: "have I felt", explanation: "Inversion after never." },
    { id: "rarely-do", prompt: "Complete: Rarely ___ his temper.", options: ["does he lose", "he loses", "he does lose", "loses he"], correct: "does he lose", explanation: "Rarely + does + subject + verb." },
    { id: "no-sooner-than", prompt: "Complete: No sooner had we left ___ it began to snow.", options: ["than", "when", "then", "that"], correct: "than", explanation: "No sooner… than." },
    { id: "little-did", prompt: "“Tôi chẳng hề biết rằng cô ấy là sếp mới.” in English is…", options: ["Little did I know that she was the new boss.", "Little I knew that she was the new boss.", "Little knew I that she was the new boss.", "Little I did know that she was the new boss."], correct: "Little did I know that she was the new boss.", explanation: "Little + did + subject + verb." },
    { id: "slim", prompt: "Which word is a compliment about someone's body?", options: ["slim", "skinny", "bony", "scrawny"], correct: "slim", explanation: "Positive connotation." },
    { id: "assertive", prompt: "Which word is positive?", options: ["assertive", "pushy", "bossy", "aggressive"], correct: "assertive", explanation: "Assertive = confident in a good way." },
    { id: "a-bit-negative", prompt: "Choose the most natural sentence.", options: ["He's a bit stingy.", "He's a bit generous.", "He's a bit lovely.", "He's a bit kind."], correct: "He's a bit stingy.", explanation: "A bit + negative adjective." },
    { id: "heavy-rain", prompt: "Complete: Flights were cancelled because of ___ rain.", options: ["heavy", "strong", "big", "hard"], correct: "heavy", explanation: "Heavy rain." },
    { id: "highly-unlikely", prompt: "Complete: It's ___ unlikely to happen.", options: ["highly", "strongly", "deeply", "heavily"], correct: "highly", explanation: "Highly unlikely." },
    { id: "into-account", prompt: "Complete: Please take my experience ___ account.", options: ["into", "in", "on", "to"], correct: "into", explanation: "Take into account." },
    { id: "far-as-concerned", prompt: "Complete: ___, money isn't everything.", options: ["As far as I'm concerned", "As far as I know", "As I was saying", "Come to think of it"], correct: "As far as I'm concerned", explanation: "Personal opinion." },
    { id: "come-to-think", prompt: "Complete: ___, I did lock the door.", options: ["Come to think of it", "Come to think", "Coming to think", "To think of it come"], correct: "Come to think of it", explanation: "Fixed phrase." },
    { id: "having-said-that", prompt: "Complete: It's expensive. ___, it's very good quality.", options: ["Having said that", "As far as I know", "As I was saying", "Under no circumstances"], correct: "Having said that", explanation: "Contrast." },
    { id: "understatement", prompt: "The most tactful way to say “The meal was awful” is…", options: ["The meal wasn't exactly memorable.", "The meal was awful.", "The meal was disgusting.", "Nobody liked the meal."], correct: "The meal wasn't exactly memorable.", explanation: "Not exactly + positive." },
    { id: "distanced-request", prompt: "Which request is the most polite?", options: ["I was wondering if you could call me back.", "Call me back.", "I want you to call me back.", "You must call me back."], correct: "I was wondering if you could call me back.", explanation: "Distanced past form." },
  ],
};
