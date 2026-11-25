// A2 Unit 3: Places & Directions. Vietnamese "Có một ngân hàng gần đây" leads to "Have a bank near here"; Vietnamese
// puts the place word after the thing ("bên cạnh ngân hàng" is fine, but "in the street" is not English for an
// address), and comparisons with "hơn" lead to "more cheaper" and a missing than.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "A2",
  number: 3,
  lessons: [{
    key: "my-town", title: "There Is, There Are", titleVi: "Có cái gì ở đâu",
    objectives: [
      "I can describe what there is in my town or neighbourhood.",
      "Use there is with one thing and there are with more than one",
      "Use some in positive sentences and any in questions and negatives",
    ],
    vocabulary: [
      { word: "chemist's", ipa: "/ˈkemɪsts/", partOfSpeech: "noun", vietnamese: "hiệu thuốc", definition: "a shop that sells medicine and things for washing and make-up (British English)", example: { english: "Is there a chemist's near here?", vietnamese: "Gần đây có hiệu thuốc nào không?" } },
      { word: "post office", ipa: "/ˈpəʊst ˌɒfɪs/", partOfSpeech: "noun", vietnamese: "bưu điện", definition: "a place where you send letters and parcels", example: { english: "The post office opens at eight.", vietnamese: "Bưu điện mở cửa lúc tám giờ." } },
      { word: "car park", ipa: "/ˈkɑː pɑːk/", partOfSpeech: "noun", vietnamese: "bãi đỗ xe", definition: "an area or building where people leave their cars (British English)", example: { english: "There's a big car park behind the cinema.", vietnamese: "Có một bãi đỗ xe lớn phía sau rạp chiếu phim." } },
      { word: "high street", ipa: "/ˈhaɪ striːt/", partOfSpeech: "noun", vietnamese: "phố chính, phố mua sắm", definition: "the main street of a British town, with shops and banks", example: { english: "There are lots of cafés on the high street.", vietnamese: "Có rất nhiều quán cà phê trên phố chính." } },
      { word: "library", ipa: "/ˈlaɪbrəri/", partOfSpeech: "noun", vietnamese: "thư viện", definition: "a building where you can read or borrow books", example: { english: "The library is quiet in the mornings.", vietnamese: "Thư viện yên tĩnh vào buổi sáng." } },
      { word: "pedestrian crossing", ipa: "/pəˌdestriən ˈkrɒsɪŋ/", partOfSpeech: "noun", vietnamese: "vạch qua đường cho người đi bộ", definition: "a place where people can cross the road safely", example: { english: "Cross at the pedestrian crossing.", vietnamese: "Hãy qua đường ở vạch dành cho người đi bộ." } },
      { word: "quiet", ipa: "/ˈkwaɪət/", partOfSpeech: "adjective", vietnamese: "yên tĩnh", definition: "with little noise or few people", example: { english: "My street is quiet at night.", vietnamese: "Phố tôi yên tĩnh vào ban đêm." } },
      { word: "crowded", ipa: "/ˈkraʊdɪd/", partOfSpeech: "adjective", vietnamese: "đông đúc", definition: "full of people", example: { english: "The market is always crowded at the weekend.", vietnamese: "Chợ lúc nào cũng đông vào cuối tuần." } },
    ],
    grammar: [{
      title: "There is, there are",
      pattern: "There is (There's) a bank · There are two parks · Is there …? Are there …?",
      explanation: {
        english: "To say that something exists in a place, use there is with one thing and there are with more than one. Questions swap the words: Is there a bank near here? Are there any shops? Negatives: There isn't a cinema. There aren't any parks.",
        vietnamese: "Để nói một vật có ở đâu đó, dùng there is với một vật và there are với nhiều vật. Câu hỏi thì đảo từ: Is there a bank near here? Are there any shops? Phủ định: There isn't a cinema. There aren't any parks.",
      },
      examples: [
        { english: "There's a post office on the high street.", vietnamese: "Có một bưu điện trên phố chính." },
        { english: "Are there any good restaurants near your flat?", vietnamese: "Gần căn hộ của bạn có nhà hàng nào ngon không?" },
      ],
      mistake: {
        wrong: "Have a chemist's near here?", right: "Is there a chemist's near here?",
        why: { english: "Vietnamese uses “có” for both “have” and “there is”. To say something exists in a place, English uses there is / there are, not have.", vietnamese: "Tiếng Việt dùng “có” cho cả “have” và “there is”. Để nói một vật tồn tại ở đâu đó, tiếng Anh dùng there is / there are, không dùng have." },
      },
    }, {
      title: "Some and any",
      pattern: "There are some shops · Are there any shops? · There aren't any shops",
      explanation: {
        english: "Use some in positive sentences with plural or uncountable nouns, and any in questions and negatives. With one thing, use a or an instead: There's a library, but there aren't any museums.",
        vietnamese: "Dùng some trong câu khẳng định với danh từ số nhiều hoặc không đếm được, và any trong câu hỏi và câu phủ định. Với một vật, dùng a hoặc an: There's a library, but there aren't any museums.",
      },
      examples: [
        { english: "There are some nice cafés near the lake.", vietnamese: "Gần hồ có vài quán cà phê đẹp." },
        { english: "There aren't any car parks in the old town.", vietnamese: "Trong phố cổ không có bãi đỗ xe nào." },
      ],
    }],
    examples: [
      { english: "I live in a quiet street. There's a library at the end of it.", vietnamese: "Tôi sống ở một con phố yên tĩnh. Có một thư viện ở cuối phố." },
      { english: "There are three chemists on the high street.", vietnamese: "Có ba hiệu thuốc trên phố chính." },
      { english: "Is there a car park near the station?", vietnamese: "Gần nhà ga có bãi đỗ xe không?" },
      { english: "The night market is very crowded, but there aren't any cars.", vietnamese: "Chợ đêm rất đông, nhưng không có ô tô nào." },
    ],
    dialogue: [
      { speaker: "Lucy", english: "What's your neighbourhood like?", vietnamese: "Khu bạn sống thế nào?" },
      { speaker: "Duc", english: "It's quite quiet. There's a park and there are some small shops.", vietnamese: "Khá yên tĩnh. Có một công viên và vài cửa hàng nhỏ." },
      { speaker: "Lucy", english: "Is there a supermarket?", vietnamese: "Có siêu thị không?" },
      { speaker: "Duc", english: "No, there isn't, but there's a big market. It's always crowded.", vietnamese: "Không có, nhưng có một cái chợ lớn. Lúc nào cũng đông." },
      { speaker: "Lucy", english: "Are there any good cafés?", vietnamese: "Có quán cà phê nào ngon không?" },
      { speaker: "Duc", english: "Loads! This is Vietnam!", vietnamese: "Nhiều lắm! Đây là Việt Nam mà!" },
    ],
    practice: [
      q("Complete: There ___ a library near my house.", ["is", "are", "have", "has"], "is", "One thing: there is."),
      q("Complete: There ___ two banks on this street.", ["are", "is", "have", "be"], "are", "More than one: there are."),
      q("Choose the correct question.", ["Is there a post office near here?", "Have a post office near here?", "There is a post office near here?", "Has there a post office near here?"], "Is there a post office near here?", "Is there + one thing?"),
      q("What is a “car park”?", ["a place to leave cars", "a park for children", "a car shop", "a road for cars"], "a place to leave cars", "A car park is where you park your car."),
    ],
    challenge: [
      q("Complete: Are there ___ cinemas in your town?", ["any", "some", "a", "an"], "any", "Any in questions."),
      q("Complete: There are ___ nice restaurants by the river.", ["some", "any", "a", "an"], "some", "Some in positive sentences."),
      q("Choose the correct sentence.", ["There aren't any parks here.", "There isn't any parks here.", "There aren't some parks here.", "Haven't any parks here."], "There aren't any parks here.", "Plural: there aren't any."),
      q("Where do you buy medicine in Britain?", ["at the chemist's", "at the post office", "at the library", "at the car park"], "at the chemist's", "The chemist's sells medicine."),
      q("“The market is full of people.” It is…", ["crowded", "quiet", "empty", "high"], "crowded", "Crowded = full of people."),
    ],
  }, {
    key: "prepositions-of-place", title: "Next To, Opposite, Between", titleVi: "Giới từ chỉ nơi chốn",
    objectives: [
      "I can say exactly where a place or thing is.",
      "Use next to, opposite, between, behind, in front of and on the corner",
      "Use in, on and at with towns, streets and addresses",
    ],
    vocabulary: [
      { word: "next to", ipa: "/ˈnekst tə/", partOfSpeech: "preposition", vietnamese: "bên cạnh", definition: "very close, at the side of something", example: { english: "The bakery is next to the bank.", vietnamese: "Tiệm bánh ở bên cạnh ngân hàng." } },
      { word: "opposite", ipa: "/ˈɒpəzɪt/", partOfSpeech: "preposition", vietnamese: "đối diện", definition: "on the other side of the street or room, facing something", example: { english: "My school is opposite the hospital.", vietnamese: "Trường tôi ở đối diện bệnh viện." } },
      { word: "between", ipa: "/bɪˈtwiːn/", partOfSpeech: "preposition", vietnamese: "ở giữa (hai thứ)", definition: "with one thing on one side and another thing on the other", example: { english: "The café is between the bookshop and the bank.", vietnamese: "Quán cà phê nằm giữa hiệu sách và ngân hàng." } },
      { word: "behind", ipa: "/bɪˈhaɪnd/", partOfSpeech: "preposition", vietnamese: "phía sau", definition: "at the back of something", example: { english: "There's a garden behind the house.", vietnamese: "Có một khu vườn phía sau ngôi nhà." } },
      { word: "in front of", ipa: "/ɪn ˈfrʌnt əv/", partOfSpeech: "preposition", vietnamese: "phía trước", definition: "close to the front of something", example: { english: "I'll meet you in front of the cinema.", vietnamese: "Tôi sẽ gặp bạn trước cửa rạp chiếu phim." } },
      { word: "on the corner", ipa: "/ɒn ðə ˈkɔːnə/", partOfSpeech: "phrase", vietnamese: "ở góc phố", definition: "where two streets meet", example: { english: "The shop is on the corner of Hang Bai Street.", vietnamese: "Cửa hàng nằm ở góc phố Hàng Bài." } },
      { word: "near", ipa: "/nɪə/", partOfSpeech: "preposition", vietnamese: "gần", definition: "a short distance from something", example: { english: "Do you live near the lake?", vietnamese: "Bạn có sống gần hồ không?" } },
      { word: "floor", ipa: "/flɔː/", partOfSpeech: "noun", vietnamese: "tầng (nhà)", definition: "one level of a building", example: { english: "Our office is on the third floor.", vietnamese: "Văn phòng chúng tôi ở tầng ba." } },
    ],
    grammar: [{
      title: "Where is it?",
      pattern: "next to / opposite / behind / in front of / near + the place · between A and B",
      explanation: {
        english: "These prepositions come before the place they describe: next to the bank, opposite the station. Between needs two places joined by and. Say near the lake, not near to the lake or nearby the lake.",
        vietnamese: "Các giới từ này đứng trước nơi chốn mà chúng mô tả: next to the bank, opposite the station. Between cần hai nơi nối với nhau bằng and. Nói near the lake, không nói near to the lake hay nearby the lake.",
      },
      examples: [
        { english: "The bus stop is in front of the library.", vietnamese: "Bến xe buýt ở trước thư viện." },
        { english: "The pharmacy is between a bakery and a bookshop.", vietnamese: "Hiệu thuốc nằm giữa một tiệm bánh và một hiệu sách." },
      ],
      mistake: {
        wrong: "The bank is opposite of the hotel.", right: "The bank is opposite the hotel.",
        why: { english: "Opposite needs no of before the place. (In front of does have of.)", vietnamese: "Opposite không cần of trước nơi chốn. (In front of thì có of.)" },
      },
    }, {
      title: "In, on, at for places",
      pattern: "in Hanoi · on Tran Phu Street · at 25 Tran Phu Street · on the second floor",
      explanation: {
        english: "Use in with cities and countries (in Hanoi, in England), on with streets and floors (on Tran Phu Street, on the second floor), and at with an exact address or a point (at 25 Tran Phu Street, at the station).",
        vietnamese: "Dùng in với thành phố và quốc gia (in Hanoi, in England), on với tên đường và tầng (on Tran Phu Street, on the second floor), và at với địa chỉ cụ thể hoặc một điểm (at 25 Tran Phu Street, at the station).",
      },
      examples: [
        { english: "She lives in Hai Phong, on a quiet street near the sea.", vietnamese: "Cô ấy sống ở Hải Phòng, trên một con phố yên tĩnh gần biển." },
        { english: "Our flat is on the fifth floor.", vietnamese: "Căn hộ chúng tôi ở tầng năm." },
      ],
      mistake: {
        wrong: "I live in Le Loi Street.", right: "I live on Le Loi Street.",
        why: { english: "British English uses on for the name of a street (in is also heard, but on is safest). Use at with the house number.", vietnamese: "Tiếng Anh Anh dùng on với tên đường (đôi khi người ta nói in, nhưng on là an toàn nhất). Dùng at khi có số nhà." },
      },
    }],
    examples: [
      { english: "The hotel is opposite the station, next to a big supermarket.", vietnamese: "Khách sạn ở đối diện nhà ga, cạnh một siêu thị lớn." },
      { english: "There's a small car park behind the post office.", vietnamese: "Có một bãi đỗ xe nhỏ phía sau bưu điện." },
      { english: "The bookshop is on the corner, between the bank and the café.", vietnamese: "Hiệu sách ở góc phố, giữa ngân hàng và quán cà phê." },
      { english: "My office is on the ninth floor of that tall building.", vietnamese: "Văn phòng tôi ở tầng chín của toà nhà cao kia." },
    ],
    dialogue: [
      { speaker: "Ella", english: "I can't find the new bakery. Where is it exactly?", vietnamese: "Mình không tìm được tiệm bánh mới. Chính xác nó ở đâu thế?" },
      { speaker: "Minh", english: "It's on Hang Gai Street, opposite the bookshop.", vietnamese: "Nó ở phố Hàng Gai, đối diện hiệu sách." },
      { speaker: "Ella", english: "Next to the bank?", vietnamese: "Cạnh ngân hàng à?" },
      { speaker: "Minh", english: "No, between the bank and a small café. It's got a red door.", vietnamese: "Không, nằm giữa ngân hàng và một quán cà phê nhỏ. Nó có cửa màu đỏ." },
      { speaker: "Ella", english: "Oh, I know! It's on the corner, near the lake.", vietnamese: "À, mình biết rồi! Nó ở góc phố, gần hồ." },
    ],
    practice: [
      q("Complete: The café is ___ the bank and the library.", ["between", "next", "opposite", "behind of"], "between", "Between A and B."),
      q("Choose the correct phrase.", ["opposite the station", "opposite of the station", "opposite to the station of", "in opposite the station"], "opposite the station", "Opposite needs no of."),
      q("Complete: I live ___ Hanoi.", ["in", "on", "at", "to"], "in", "In with cities."),
      q("“Phía sau” in English is…", ["behind", "in front of", "next to", "between"], "behind", "Behind = at the back of."),
    ],
    challenge: [
      q("Complete: Our office is ___ the seventh floor.", ["on", "in", "at", "to"], "on", "On with floors."),
      q("Complete: She lives ___ 12 Ba Trieu Street.", ["at", "on", "in", "to"], "at", "At with an exact address."),
      q("Choose the correct phrase.", ["in front of the hotel", "in front the hotel", "front of the hotel", "in the front the hotel"], "in front of the hotel", "In front of + place."),
      q("Choose the correct sentence.", ["Do you live near the park?", "Do you live near to of the park?", "Do you live nearby the park?", "Do you live near of the park?"], "Do you live near the park?", "Near + place, no of."),
      q("Two streets meet here. The shop is…", ["on the corner", "on the floor", "between", "behind"], "on the corner", "Where two streets meet is the corner."),
    ],
  }, {
    key: "directions", title: "Asking the Way", titleVi: "Hỏi đường",
    objectives: [
      "I can ask for directions politely and understand the answer.",
      "Give directions with go, turn and take",
      "Ask “Could you tell me where … is?” in the right word order",
    ],
    vocabulary: [
      { word: "excuse me", ipa: "/ɪkˈskjuːz miː/", partOfSpeech: "phrase", vietnamese: "xin lỗi (để gây chú ý, hỏi han)", definition: "a polite way to get a stranger's attention", example: { english: "Excuse me, is this the way to the museum?", vietnamese: "Xin lỗi, đây có phải đường đến bảo tàng không?" } },
      { word: "go straight on", ipa: "/ˌɡəʊ ˌstreɪt ˈɒn/", partOfSpeech: "phrase", vietnamese: "đi thẳng", definition: "to continue in the same direction without turning", example: { english: "Go straight on for about two hundred metres.", vietnamese: "Đi thẳng khoảng hai trăm mét." } },
      { word: "turn left", ipa: "/ˌtɜːn ˈleft/", partOfSpeech: "collocation", vietnamese: "rẽ trái", definition: "to change direction to the left", example: { english: "Turn left at the traffic lights.", vietnamese: "Rẽ trái ở chỗ đèn giao thông." } },
      { word: "take the second right", ipa: "/ˌteɪk ðə ˌsekənd ˈraɪt/", partOfSpeech: "phrase", vietnamese: "rẽ vào đường thứ hai bên phải", definition: "to turn into the second road on your right", example: { english: "Take the second right and the hotel is on your left.", vietnamese: "Rẽ vào đường thứ hai bên phải và khách sạn ở bên tay trái bạn." } },
      { word: "traffic lights", ipa: "/ˈtræfɪk laɪts/", partOfSpeech: "noun", vietnamese: "đèn giao thông", definition: "red, amber and green lights that control traffic", example: { english: "Stop at the traffic lights.", vietnamese: "Dừng lại ở đèn giao thông." } },
      { word: "roundabout", ipa: "/ˈraʊndəbaʊt/", partOfSpeech: "noun", vietnamese: "vòng xuyến, bùng binh", definition: "a round place where several roads meet and cars go round", example: { english: "At the roundabout, take the third exit.", vietnamese: "Đến vòng xuyến, đi theo lối ra thứ ba." } },
      { word: "on your left", ipa: "/ɒn jɔː ˈleft/", partOfSpeech: "phrase", vietnamese: "ở bên tay trái bạn", definition: "on the left side as you walk or drive", example: { english: "The museum is on your left.", vietnamese: "Bảo tàng ở bên tay trái bạn." } },
      { word: "get to", ipa: "/ˈɡet tə/", partOfSpeech: "phrasal verb", vietnamese: "đến, tới (một nơi)", definition: "to arrive at a place", example: { english: "How do I get to the station?", vietnamese: "Làm sao để tôi đến được nhà ga?" } },
    ],
    grammar: [{
      title: "Giving directions",
      pattern: "Go straight on · Turn left / right · Take the first / second left · It's on your right",
      explanation: {
        english: "Give directions with the base form of the verb and no subject (this is called the imperative): Go straight on. Turn right at the roundabout. Don't turn left. Add when you finish: It's on your left / right, or You can't miss it.",
        vietnamese: "Chỉ đường bằng động từ nguyên mẫu, không có chủ ngữ (gọi là câu mệnh lệnh): Go straight on. Turn right at the roundabout. Don't turn left. Khi kết thúc, thêm: It's on your left / right, hoặc You can't miss it (bạn không thể không thấy đâu).",
      },
      examples: [
        { english: "Go past the bank and turn right at the traffic lights.", vietnamese: "Đi qua ngân hàng rồi rẽ phải ở đèn giao thông." },
        { english: "Take the first left. The library is on your right.", vietnamese: "Rẽ vào đường đầu tiên bên trái. Thư viện ở bên tay phải bạn." },
      ],
    }, {
      title: "Polite questions",
      pattern: "Could you tell me where the station is? · How do I get to …?",
      explanation: {
        english: "To a stranger, a polite question is better than Where is…?. After Could you tell me where…, the words go in the normal order: subject, then verb. Say Could you tell me where the station is? (not where is the station).",
        vietnamese: "Với người lạ, một câu hỏi lịch sự tốt hơn Where is…?. Sau Could you tell me where…, các từ theo trật tự bình thường: chủ ngữ rồi động từ. Nói Could you tell me where the station is? (không nói where is the station).",
      },
      examples: [
        { english: "Excuse me, could you tell me where the post office is?", vietnamese: "Xin lỗi, anh có thể chỉ cho tôi bưu điện ở đâu không?" },
        { english: "Excuse me, how do I get to the Old Quarter?", vietnamese: "Xin lỗi, làm sao để tôi đến được khu phố cổ?" },
      ],
      mistake: {
        wrong: "Could you tell me where is the bank?", right: "Could you tell me where the bank is?",
        why: { english: "Inside a polite question, the verb goes after the subject, as in a normal sentence.", vietnamese: "Trong câu hỏi lịch sự, động từ đứng sau chủ ngữ, giống câu bình thường." },
      },
    }],
    examples: [
      { english: "Go straight on until you get to the roundabout.", vietnamese: "Đi thẳng cho đến khi gặp vòng xuyến." },
      { english: "Turn left at the traffic lights and it's on your right.", vietnamese: "Rẽ trái ở đèn giao thông và nó ở bên tay phải bạn." },
      { english: "Excuse me, how do I get to the cathedral?", vietnamese: "Xin lỗi, làm sao để tôi đến nhà thờ lớn?" },
      { english: "Take the second right. You can't miss it.", vietnamese: "Rẽ vào đường thứ hai bên phải. Chắc chắn bạn sẽ thấy." },
    ],
    dialogue: [
      { speaker: "Lan", english: "Excuse me, could you tell me where the British Museum is?", vietnamese: "Xin lỗi, ông có thể chỉ cho tôi Bảo tàng Anh ở đâu không ạ?" },
      { speaker: "Man", english: "Of course. Go straight on to the traffic lights.", vietnamese: "Tất nhiên rồi. Cô đi thẳng đến chỗ đèn giao thông." },
      { speaker: "Lan", english: "To the traffic lights. And then?", vietnamese: "Đến đèn giao thông. Rồi sao nữa ạ?" },
      { speaker: "Man", english: "Turn left, then take the second right. It's on your left.", vietnamese: "Rẽ trái, rồi rẽ vào đường thứ hai bên phải. Nó ở bên tay trái cô." },
      { speaker: "Lan", english: "Is it far?", vietnamese: "Có xa không ạ?" },
      { speaker: "Man", english: "No, about ten minutes on foot. You can't miss it.", vietnamese: "Không, đi bộ khoảng mười phút. Cô chắc chắn sẽ thấy." },
    ],
    practice: [
      q("“Đi thẳng” in English is…", ["go straight on", "turn straight", "go right on", "take straight"], "go straight on", "Go straight on = don't turn."),
      q("Choose the polite question.", ["Could you tell me where the station is?", "Could you tell me where is the station?", "Where the station is?", "Tell me where is station."], "Could you tell me where the station is?", "Subject before verb after where."),
      q("Complete: ___ left at the roundabout.", ["Turn", "Turns", "You turning", "To turn"], "Turn", "Directions use the base verb (imperative)."),
      q("What is a “roundabout”?", ["a round place where roads meet", "a bus that goes round the town", "a walk round a park", "traffic lights"], "a round place where roads meet", "Cars go round a roundabout."),
    ],
    challenge: [
      q("Complete: How do I ___ the museum?", ["get to", "get", "arrive", "go at"], "get to", "Get to + place = arrive at it."),
      q("Choose the correct direction.", ["Take the first left.", "Take the left first.", "Take first the left.", "Take the one left."], "Take the first left.", "Take the first / second left / right."),
      q("Complete: The bank is ___ your right.", ["on", "in", "at", "to"], "on", "On your right / left."),
      q("Choose the correct question.", ["Could you tell me where the library is?", "Could you tell me where is the library?", "Could you tell me where does the library?", "Could you tell me the library where is?"], "Could you tell me where the library is?", "Where + subject + verb."),
      q("How do you start talking to a stranger politely?", ["Excuse me, …", "Sorry for you, …", "Hey you, …", "Please me, …"], "Excuse me, …", "Excuse me gets someone's attention politely."),
    ],
  }, {
    key: "comparing-places", title: "Bigger and Busier", titleVi: "So sánh hơn",
    objectives: [
      "I can compare two towns, cities or places.",
      "Add -er to short adjectives and use more with long ones",
      "Join the two things with than",
    ],
    vocabulary: [
      { word: "noisy", ipa: "/ˈnɔɪzi/", partOfSpeech: "adjective", vietnamese: "ồn ào", definition: "making or full of a lot of noise", example: { english: "Hanoi is noisier than Hue.", vietnamese: "Hà Nội ồn ào hơn Huế." } },
      { word: "polluted", ipa: "/pəˈluːtɪd/", partOfSpeech: "adjective", vietnamese: "ô nhiễm", definition: "with dirty air, water or land", example: { english: "The air is more polluted in winter.", vietnamese: "Không khí ô nhiễm hơn vào mùa đông." } },
      { word: "expensive", ipa: "/ɪkˈspensɪv/", partOfSpeech: "adjective", vietnamese: "đắt", definition: "costing a lot of money", example: { english: "London is more expensive than Manchester.", vietnamese: "London đắt đỏ hơn Manchester." } },
      { word: "cheap", ipa: "/tʃiːp/", partOfSpeech: "adjective", vietnamese: "rẻ", definition: "costing little money", example: { english: "Street food is cheaper than restaurant food.", vietnamese: "Đồ ăn đường phố rẻ hơn đồ ăn nhà hàng." } },
      { word: "safe", ipa: "/seɪf/", partOfSpeech: "adjective", vietnamese: "an toàn", definition: "not dangerous", example: { english: "This area is safer at night.", vietnamese: "Khu này an toàn hơn vào ban đêm." } },
      { word: "countryside", ipa: "/ˈkʌntrisaɪd/", partOfSpeech: "noun", vietnamese: "nông thôn, vùng quê", definition: "land away from towns, with fields and farms", example: { english: "Life in the countryside is slower.", vietnamese: "Cuộc sống ở nông thôn chậm rãi hơn." } },
      { word: "convenient", ipa: "/kənˈviːniənt/", partOfSpeech: "adjective", vietnamese: "thuận tiện", definition: "easy to use or near what you need", example: { english: "My new flat is more convenient for work.", vietnamese: "Căn hộ mới của tôi thuận tiện hơn cho việc đi làm." } },
      { word: "much", ipa: "/mʌtʃ/", partOfSpeech: "adverb", vietnamese: "hơn nhiều (đứng trước so sánh hơn)", definition: "used before a comparative to mean “a lot”", example: { english: "The countryside is much quieter than the city.", vietnamese: "Nông thôn yên tĩnh hơn thành phố nhiều." } },
    ],
    grammar: [{
      title: "-er or more",
      pattern: "cheap → cheaper · big → bigger · busy → busier · expensive → more expensive",
      explanation: {
        english: "With one-syllable adjectives, add -er (cheap – cheaper). Double the last letter after one vowel + one consonant (big – bigger, hot – hotter). Change -y to -ier (busy – busier, noisy – noisier). With longer adjectives, put more before them (more expensive, more polluted). Irregular: good – better, bad – worse, far – further.",
        vietnamese: "Với tính từ một âm tiết, thêm -er (cheap – cheaper). Gấp đôi phụ âm cuối nếu trước nó là một nguyên âm (big – bigger, hot – hotter). Đổi -y thành -ier (busy – busier, noisy – noisier). Với tính từ dài, thêm more phía trước (more expensive, more polluted). Bất quy tắc: good – better, bad – worse, far – further.",
      },
      examples: [
        { english: "Da Nang is hotter than Da Lat.", vietnamese: "Đà Nẵng nóng hơn Đà Lạt." },
        { english: "The bus is more convenient than the train.", vietnamese: "Xe buýt thuận tiện hơn tàu hoả." },
      ],
      mistake: {
        wrong: "Hanoi is more cheaper than London.", right: "Hanoi is cheaper than London.",
        why: { english: "Vietnamese adds “hơn” to every adjective, so learners add more too. Use -er or more, never both.", vietnamese: "Tiếng Việt thêm “hơn” sau mọi tính từ, nên người học hay thêm cả more. Chỉ dùng -er hoặc more, không dùng cả hai." },
      },
    }, {
      title: "Than, and much",
      pattern: "A is bigger than B · A is much bigger than B",
      explanation: {
        english: "Use than (not that or with) to name the second thing. To say the difference is big, put much or a lot before the comparative: much cheaper, a lot more expensive. For a small difference, use a bit: a bit colder.",
        vietnamese: "Dùng than (không dùng that hay with) để nêu vật thứ hai. Để nói khác biệt lớn, đặt much hoặc a lot trước dạng so sánh hơn: much cheaper, a lot more expensive. Với khác biệt nhỏ, dùng a bit: a bit colder.",
      },
      examples: [
        { english: "My hometown is much quieter than Ho Chi Minh City.", vietnamese: "Quê tôi yên tĩnh hơn Thành phố Hồ Chí Minh nhiều." },
        { english: "Today is a bit warmer than yesterday.", vietnamese: "Hôm nay ấm hơn hôm qua một chút." },
      ],
    }],
    examples: [
      { english: "The countryside is safer and cleaner than the city.", vietnamese: "Nông thôn an toàn và sạch sẽ hơn thành phố." },
      { english: "Cities are noisier, but they're more convenient.", vietnamese: "Thành phố ồn ào hơn, nhưng thuận tiện hơn." },
      { english: "Is Hanoi more polluted than Bangkok?", vietnamese: "Hà Nội có ô nhiễm hơn Bangkok không?" },
      { english: "Food in England is a lot more expensive than in Vietnam.", vietnamese: "Đồ ăn ở Anh đắt hơn ở Việt Nam rất nhiều." },
    ],
    dialogue: [
      { speaker: "Tom", english: "Do you prefer living in Hanoi or in your hometown?", vietnamese: "Bạn thích sống ở Hà Nội hay ở quê hơn?" },
      { speaker: "Hoa", english: "My hometown is much quieter and the air is cleaner.", vietnamese: "Quê mình yên tĩnh hơn nhiều và không khí sạch hơn." },
      { speaker: "Tom", english: "So why do you live in Hanoi?", vietnamese: "Vậy sao bạn lại sống ở Hà Nội?" },
      { speaker: "Hoa", english: "It's more convenient for work, and there are better jobs.", vietnamese: "Thuận tiện hơn cho công việc, và có nhiều việc tốt hơn." },
      { speaker: "Tom", english: "Is it more expensive?", vietnamese: "Ở đó có đắt đỏ hơn không?" },
      { speaker: "Hoa", english: "Yes, a lot more expensive, and a bit more polluted too.", vietnamese: "Có, đắt hơn nhiều, và cũng ô nhiễm hơn một chút." },
    ],
    practice: [
      q("Complete: Hue is ___ than Hanoi.", ["quieter", "more quiet than", "quietter", "more quieter"], "quieter", "Quiet + -er (more quiet is also heard, but quieter is the usual form)."),
      q("Complete: London is more ___ than Manchester.", ["expensive", "expensiver", "expensives", "expensively"], "expensive", "Long adjective: more expensive."),
      q("Complete: The city is busier ___ the countryside.", ["than", "that", "with", "from"], "than", "Comparisons use than."),
      q("What is the comparative of “big”?", ["bigger", "biger", "more big", "biggest"], "bigger", "One vowel + one consonant: double it, bigger."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["This street is noisier than mine.", "This street is more noisier than mine.", "This street is noisyer than mine.", "This street is noisier that mine."], "This street is noisier than mine.", "-y becomes -ier; then than."),
      q("Complete: My new job is ___ than my old one. (good)", ["better", "gooder", "more good", "best"], "better", "Good – better."),
      q("Complete: Da Lat is ___ cooler than Ho Chi Minh City.", ["much", "more", "very", "many"], "much", "Much + comparative = a lot."),
      q("“Thuận tiện” in English is…", ["convenient", "comfortable", "conversation", "crowded"], "convenient", "Convenient = easy and near what you need."),
      q("Choose the correct sentence.", ["The air here is more polluted than in the countryside.", "The air here is pollutier than in the countryside.", "The air here is polluteder than in the countryside.", "The air here is more polluted that in the countryside."], "The air here is more polluted than in the countryside.", "Long adjective: more polluted, then than."),
    ],
  }, {
    key: "the-best-places", title: "The Best Place in Town", titleVi: "So sánh nhất",
    objectives: [
      "I can say which place is the best, biggest or most beautiful.",
      "Use the + -est and the most",
      "Say “the best … in the town” and “the best … I've ever …”",
    ],
    vocabulary: [
      { word: "famous", ipa: "/ˈfeɪməs/", partOfSpeech: "adjective", vietnamese: "nổi tiếng", definition: "known by many people", example: { english: "It's the most famous street in the city.", vietnamese: "Đó là con phố nổi tiếng nhất thành phố." } },
      { word: "ancient", ipa: "/ˈeɪnʃənt/", partOfSpeech: "adjective", vietnamese: "cổ, cổ kính", definition: "very, very old", example: { english: "This is the most ancient temple in the region.", vietnamese: "Đây là ngôi đền cổ nhất trong vùng." } },
      { word: "view", ipa: "/vjuː/", partOfSpeech: "noun", vietnamese: "quang cảnh, tầm nhìn", definition: "what you can see from a place", example: { english: "The best view is from the top of the hill.", vietnamese: "Quang cảnh đẹp nhất là từ đỉnh đồi." } },
      { word: "tourist attraction", ipa: "/ˈtʊərɪst əˌtrækʃn/", partOfSpeech: "noun", vietnamese: "điểm tham quan du lịch", definition: "a place that many visitors go to see", example: { english: "The castle is the biggest tourist attraction in the town.", vietnamese: "Lâu đài là điểm du lịch lớn nhất thị trấn." } },
      { word: "worth visiting", ipa: "/ˌwɜːθ ˈvɪzɪtɪŋ/", partOfSpeech: "phrase", vietnamese: "đáng ghé thăm", definition: "good enough to make a visit a good idea", example: { english: "The night market is worth visiting.", vietnamese: "Chợ đêm rất đáng ghé thăm." } },
      { word: "the oldest", ipa: "/ði ˈəʊldɪst/", partOfSpeech: "phrase", vietnamese: "lâu đời nhất, già nhất", definition: "older than all the others", example: { english: "It's the oldest university in Vietnam.", vietnamese: "Đó là trường đại học lâu đời nhất Việt Nam." } },
      { word: "the worst", ipa: "/ðə ˈwɜːst/", partOfSpeech: "phrase", vietnamese: "tệ nhất", definition: "worse than all the others", example: { english: "Rush hour is the worst time to drive.", vietnamese: "Giờ cao điểm là lúc lái xe tệ nhất." } },
      { word: "ever", ipa: "/ˈevə/", partOfSpeech: "adverb", vietnamese: "từng (trong đời)", definition: "at any time in your life", example: { english: "It's the best pizza I've ever eaten.", vietnamese: "Đó là chiếc pizza ngon nhất tôi từng ăn." } },
    ],
    grammar: [{
      title: "The -est, the most",
      pattern: "the cheapest · the biggest · the busiest · the most beautiful · the best / the worst",
      explanation: {
        english: "To compare one thing with all the others in a group, use the + -est with short adjectives (the cheapest, the biggest, the busiest) and the most with long ones (the most famous). Irregular: good – the best, bad – the worst, far – the furthest. Don't forget the.",
        vietnamese: "Để so sánh một vật với tất cả các vật khác trong nhóm, dùng the + -est với tính từ ngắn (the cheapest, the biggest, the busiest) và the most với tính từ dài (the most famous). Bất quy tắc: good – the best, bad – the worst, far – the furthest. Đừng quên the.",
      },
      examples: [
        { english: "Ho Chi Minh City is the biggest city in Vietnam.", vietnamese: "Thành phố Hồ Chí Minh là thành phố lớn nhất Việt Nam." },
        { english: "This is the most famous tourist attraction in Hue.", vietnamese: "Đây là điểm du lịch nổi tiếng nhất ở Huế." },
      ],
      mistake: {
        wrong: "It's the most cheapest hotel.", right: "It's the cheapest hotel.",
        why: { english: "Like -er and more, use -est or most, never both.", vietnamese: "Giống -er và more, chỉ dùng -est hoặc most, không dùng cả hai." },
      },
    }, {
      title: "In the town, I've ever seen",
      pattern: "the best café in Hanoi · the most beautiful place I've ever seen",
      explanation: {
        english: "After a superlative, name the group with in for places (the tallest building in London, not of London) and of for a time or a number of things (the best day of my life, the cheapest of the three). Or add a phrase with ever: the best film I've ever seen.",
        vietnamese: "Sau so sánh nhất, nêu nhóm bằng in với nơi chốn (the tallest building in London, không dùng of London) và of với khoảng thời gian hoặc số lượng (the best day of my life, the cheapest of the three). Hoặc thêm cụm với ever: the best film I've ever seen.",
      },
      examples: [
        { english: "It's the oldest café in the Old Quarter.", vietnamese: "Đó là quán cà phê lâu đời nhất phố cổ." },
        { english: "Ha Long Bay is the most beautiful place I've ever visited.", vietnamese: "Vịnh Hạ Long là nơi đẹp nhất tôi từng đến." },
      ],
    }],
    examples: [
      { english: "The best view of the city is from that bridge.", vietnamese: "Quang cảnh thành phố đẹp nhất là từ cây cầu đó." },
      { english: "The Temple of Literature is worth visiting. It's very ancient.", vietnamese: "Văn Miếu rất đáng ghé thăm. Nó rất cổ kính." },
      { english: "Friday evening is the worst time to go shopping.", vietnamese: "Tối thứ Sáu là lúc đi mua sắm tệ nhất." },
      { english: "That was the busiest market I've ever seen.", vietnamese: "Đó là khu chợ đông nhất tôi từng thấy." },
    ],
    dialogue: [
      { speaker: "James", english: "I've got one day in Hanoi. What's the best thing to see?", vietnamese: "Tôi có một ngày ở Hà Nội. Thứ gì đáng xem nhất?" },
      { speaker: "Mai", english: "The Temple of Literature. It's the oldest university in Vietnam.", vietnamese: "Văn Miếu. Đó là trường đại học đầu tiên của Việt Nam." },
      { speaker: "James", english: "Is it worth visiting?", vietnamese: "Có đáng ghé thăm không?" },
      { speaker: "Mai", english: "Definitely. And for the best view, go to a rooftop café by the lake.", vietnamese: "Chắc chắn rồi. Còn muốn ngắm cảnh đẹp nhất thì lên một quán cà phê trên sân thượng cạnh hồ." },
      { speaker: "James", english: "And the best food?", vietnamese: "Còn món ăn ngon nhất?" },
      { speaker: "Mai", english: "Bún chả. It's the best lunch you'll ever have!", vietnamese: "Bún chả. Đó sẽ là bữa trưa ngon nhất anh từng ăn!" },
    ],
    practice: [
      q("Complete: It's ___ hotel in the town.", ["the cheapest", "cheapest", "the most cheap", "the cheaper"], "the cheapest", "The + -est."),
      q("Complete: This is the most ___ temple in Hue.", ["famous", "famousest", "famouser", "fame"], "famous", "Long adjective: the most famous."),
      q("What is the superlative of “bad”?", ["the worst", "the baddest", "the most bad", "the worse"], "the worst", "Bad – worse – the worst."),
      q("“Worth visiting” means…", ["good enough to visit", "too expensive to visit", "closed to visitors", "far away"], "good enough to visit", "If it's worth visiting, you should go."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["It's the tallest building in London.", "It's the tallest building of London.", "It's tallest building in London.", "It's the most tallest building in London."], "It's the tallest building in London.", "The + -est + in + place."),
      q("Complete: It was the best day ___ my life.", ["of", "in", "at", "on"], "of", "Of with a period of time: of my life."),
      q("Complete: It's the most beautiful beach I've ___ seen.", ["ever", "never", "already", "yet"], "ever", "The best … I've ever + past participle."),
      q("Choose the correct sentence.", ["This is the busiest street in the city.", "This is the busyest street in the city.", "This is the most busiest street in the city.", "This is the busier street in the city."], "This is the busiest street in the city.", "-y becomes -iest; one form only."),
      q("“Cổ kính” in English is…", ["ancient", "famous", "polluted", "convenient"], "ancient", "Ancient = very, very old."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 3", isReview: true,
    objectives: [
      "I can describe a town, say where things are, give directions and compare places.",
      "Check there is / are, place prepositions, polite questions, -er / more and -est / most",
    ],
    vocabulary: [
      { word: "crowded", ipa: "/ˈkraʊdɪd/", partOfSpeech: "adjective", vietnamese: "đông đúc", definition: "full of people", example: { english: "The beach was crowded on Sunday.", vietnamese: "Bãi biển đông nghịt hôm Chủ nhật." } },
      { word: "opposite", ipa: "/ˈɒpəzɪt/", partOfSpeech: "preposition", vietnamese: "đối diện", definition: "on the other side of the street or room, facing something", example: { english: "There's a chemist's opposite my flat.", vietnamese: "Có một hiệu thuốc đối diện căn hộ của tôi." } },
      { word: "between", ipa: "/bɪˈtwiːn/", partOfSpeech: "preposition", vietnamese: "ở giữa (hai thứ)", definition: "with one thing on one side and another thing on the other", example: { english: "Sit between your brother and your sister.", vietnamese: "Ngồi giữa anh trai và chị gái con nhé." } },
      { word: "get to", ipa: "/ˈɡet tə/", partOfSpeech: "phrasal verb", vietnamese: "đến, tới (một nơi)", definition: "to arrive at a place", example: { english: "What's the best way to get to the airport?", vietnamese: "Cách tốt nhất để đến sân bay là gì?" } },
      { word: "convenient", ipa: "/kənˈviːniənt/", partOfSpeech: "adjective", vietnamese: "thuận tiện", definition: "easy to use or near what you need", example: { english: "Is Monday convenient for you?", vietnamese: "Thứ Hai có tiện cho bạn không?" } },
      { word: "worth visiting", ipa: "/ˌwɜːθ ˈvɪzɪtɪŋ/", partOfSpeech: "phrase", vietnamese: "đáng ghé thăm", definition: "good enough to make a visit a good idea", example: { english: "Which museums are worth visiting?", vietnamese: "Bảo tàng nào đáng ghé thăm?" } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "there is a bank · opposite the hotel · where the station is · cheaper than · the most famous",
      explanation: {
        english: "Check these: there is / there are (not have) for what exists in a place; opposite and near with no of; subject before verb in Could you tell me where … is?; -er or more, then than; and the + -est or the most, with in + the place.",
        vietnamese: "Hãy kiểm tra: dùng there is / there are (không dùng have) để nói cái gì có ở đâu; opposite và near không có of; chủ ngữ đứng trước động từ trong Could you tell me where … is?; dùng -er hoặc more, rồi than; và the + -est hoặc the most, với in + nơi chốn.",
      },
      examples: [
        { english: "There's a great café opposite the station. It's the best in town.", vietnamese: "Có một quán cà phê tuyệt vời đối diện nhà ga. Nó ngon nhất thị trấn." },
        { english: "Could you tell me where the library is?", vietnamese: "Bạn có thể chỉ cho tôi thư viện ở đâu không?" },
      ],
    }],
    examples: [
      { english: "My neighbourhood is quieter than the city centre, but less convenient.", vietnamese: "Khu tôi ở yên tĩnh hơn trung tâm thành phố, nhưng kém thuận tiện hơn." },
      { english: "Turn right and the museum is between the bank and the park.", vietnamese: "Rẽ phải và bảo tàng nằm giữa ngân hàng và công viên." },
      { english: "The old castle is the most famous place in the town, and it's worth visiting.", vietnamese: "Lâu đài cổ là nơi nổi tiếng nhất thị trấn, và rất đáng ghé thăm." },
    ],
    dialogue: [
      { speaker: "Chloe", english: "Excuse me, could you tell me where the castle is?", vietnamese: "Xin lỗi, bạn có thể chỉ cho tôi lâu đài ở đâu không?" },
      { speaker: "Bao", english: "Sure. Go straight on and take the first left. It's opposite the church.", vietnamese: "Được chứ. Đi thẳng rồi rẽ vào đường đầu tiên bên trái. Nó ở đối diện nhà thờ." },
      { speaker: "Chloe", english: "Thanks. Is it worth visiting?", vietnamese: "Cảm ơn. Nó có đáng ghé thăm không?" },
      { speaker: "Bao", english: "Yes, it's the oldest building in the town. But it's crowded today.", vietnamese: "Có, đó là toà nhà cổ nhất thị trấn. Nhưng hôm nay đông lắm." },
      { speaker: "Chloe", english: "Is there a quieter place to visit?", vietnamese: "Có chỗ nào yên tĩnh hơn để ghé không?" },
      { speaker: "Bao", english: "The gardens behind the castle are much quieter.", vietnamese: "Khu vườn phía sau lâu đài yên tĩnh hơn nhiều." },
    ],
    practice: [
      q("Choose the correct sentence.", ["There are two cafés on my street.", "Have two cafés on my street.", "There is two cafés on my street.", "It has two cafés on my street."], "There are two cafés on my street.", "More than one: there are."),
      q("Complete: The bank is ___ the hotel.", ["opposite", "opposite of", "in opposite", "opposite to of"], "opposite", "Opposite + place, no of."),
      q("Complete: The countryside is ___ than the city.", ["safer", "more safer", "safest", "more safe than"], "safer", "Short adjective + -er."),
      q("Complete: It's the ___ restaurant in Hanoi.", ["best", "better", "most good", "goodest"], "best", "Good – the best."),
    ],
    challenge: [
      q("Choose the polite question.", ["Could you tell me where the bus stop is?", "Could you tell me where is the bus stop?", "Where the bus stop is, please?", "Tell me where is the bus stop."], "Could you tell me where the bus stop is?", "Subject before verb."),
      q("Complete: We live ___ the second floor.", ["on", "in", "at", "to"], "on", "On with floors."),
      q("Complete: Are there ___ museums near here?", ["any", "some", "a", "an"], "any", "Any in questions."),
      q("Choose the correct sentence.", ["It's the most famous building in London.", "It's the most famous building of London.", "It's the famousest building in London.", "It's most famous building in London."], "It's the most famous building in London.", "The most + long adjective, in + place."),
      q("Complete: Take the second right. The post office is ___ your left.", ["on", "in", "at", "to"], "on", "On your left / right."),
    ],
  }],
  assessment: [
    { id: "there-is", prompt: "Complete: There ___ a big park in my town.", options: ["is", "are", "has", "have"], correct: "is", explanation: "One thing: there is." },
    { id: "there-are", prompt: "Choose the correct sentence.", options: ["There are some good shops here.", "Have some good shops here.", "There is some good shops here.", "There are any good shops here."], correct: "There are some good shops here.", explanation: "Plural: there are; some in positive sentences." },
    { id: "is-there", prompt: "Choose the correct question.", options: ["Is there a bank near here?", "Have a bank near here?", "Has it a bank near here?", "There is a bank near here?"], correct: "Is there a bank near here?", explanation: "Is there + one thing?" },
    { id: "any-negative", prompt: "Complete: There aren't ___ cinemas in my village.", options: ["any", "some", "a", "no"], correct: "any", explanation: "Any in negatives." },
    { id: "between", prompt: "Complete: The café is between the bank ___ the post office.", options: ["and", "or", "with", "to"], correct: "and", explanation: "Between A and B." },
    { id: "opposite-no-of", prompt: "Choose the correct phrase.", options: ["opposite the school", "opposite of the school", "in opposite the school", "opposite to of the school"], correct: "opposite the school", explanation: "Opposite needs no of." },
    { id: "on-street", prompt: "Complete: I live ___ Nguyen Hue Street.", options: ["on", "at", "to", "of"], correct: "on", explanation: "On with street names." },
    { id: "at-address", prompt: "Complete: The shop is ___ 45 Hang Bac Street.", options: ["at", "on", "in", "to"], correct: "at", explanation: "At with an exact address." },
    { id: "imperative", prompt: "Choose the correct direction.", options: ["Turn left at the roundabout.", "You turning left at the roundabout.", "To turn left at the roundabout.", "Turns left at the roundabout."], correct: "Turn left at the roundabout.", explanation: "Directions use the base verb." },
    { id: "polite-question", prompt: "Choose the correct question.", options: ["Could you tell me where the museum is?", "Could you tell me where is the museum?", "Could you tell me the museum where is?", "Could you tell me where does the museum?"], correct: "Could you tell me where the museum is?", explanation: "After where, subject then verb." },
    { id: "comparative-er", prompt: "Complete: My village is ___ than Hanoi.", options: ["smaller", "more small", "more smaller", "smallest"], correct: "smaller", explanation: "Short adjective + -er." },
    { id: "comparative-more", prompt: "Complete: Taxis are ___ than buses.", options: ["more expensive", "expensiver", "more expensiver", "most expensive"], correct: "more expensive", explanation: "Long adjective: more." },
    { id: "than", prompt: "Complete: Today is hotter ___ yesterday.", options: ["than", "that", "as", "from"], correct: "than", explanation: "Comparisons use than." },
    { id: "superlative-irregular", prompt: "Complete: It's the ___ film I've ever seen. (good)", options: ["best", "better", "goodest", "most good"], correct: "best", explanation: "Good – better – the best." },
    { id: "superlative-in", prompt: "Choose the correct sentence.", options: ["It's the busiest market in the city.", "It's the busiest market of the city.", "It's the most busiest market in the city.", "It's busiest market in the city."], correct: "It's the busiest market in the city.", explanation: "The + -iest, in + place." },
  ],
};
