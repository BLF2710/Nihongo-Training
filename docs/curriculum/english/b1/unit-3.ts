// B1 Unit 3: Travel & Culture. Vietnamese has no articles and marks "bị" for bad things that happen, so learners say
// "I live in the Vietnam" but "Mekong River", "My flight delayed" and "My room has problem"; phrasal verbs bring "pick
// up me"; the sequence of past events, with no past perfect in Vietnamese, gives "When we arrived, the film already
// started"; and "complain the noise" and "You must change my room" sound rude. This unit fixes those for travel.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B1",
  number: 3,
  lessons: [{
    key: "travel-phrasal-verbs", title: "Set Off and Check In", titleVi: "Cụm động từ khi đi du lịch",
    objectives: [
      "I can talk about a journey from start to finish with common phrasal verbs.",
      "Put a pronoun in the middle of a separable phrasal verb: pick me up",
      "Use three-part phrasal verbs with their preposition: run out of",
    ],
    vocabulary: [
      { word: "set off", ipa: "/ˌset ˈɒf/", partOfSpeech: "phrasal verb", vietnamese: "khởi hành, lên đường", definition: "to start a journey", example: { english: "We set off at five to avoid the traffic.", vietnamese: "Chúng tôi khởi hành lúc năm giờ để tránh tắc đường." } },
      { word: "check in", ipa: "/ˌtʃek ˈɪn/", partOfSpeech: "phrasal verb", vietnamese: "làm thủ tục nhận phòng / lên máy bay", definition: "to arrive and register at a hotel or airport", example: { english: "You can check in two hours before the flight.", vietnamese: "Bạn có thể làm thủ tục hai tiếng trước chuyến bay." } },
      { word: "check out", ipa: "/ˌtʃek ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "trả phòng", definition: "to pay and leave a hotel", example: { english: "We have to check out by eleven.", vietnamese: "Chúng tôi phải trả phòng trước mười một giờ." } },
      { word: "pick up", ipa: "/ˌpɪk ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "đón (ai đó)", definition: "to collect someone in a car", example: { english: "My cousin will pick us up at the station.", vietnamese: "Em họ tôi sẽ đón chúng tôi ở ga." } },
      { word: "drop off", ipa: "/ˌdrɒp ˈɒf/", partOfSpeech: "phrasal verb", vietnamese: "thả (ai đó) xuống, đưa đến", definition: "to take someone somewhere in a car and leave them there", example: { english: "Can you drop me off at the airport?", vietnamese: "Bạn đưa tôi ra sân bay được không?" } },
      { word: "look around", ipa: "/ˌlʊk əˈraʊnd/", partOfSpeech: "phrasal verb", vietnamese: "đi tham quan, ngó quanh", definition: "to walk around a place to see what is there", example: { english: "We spent the afternoon looking around the old town.", vietnamese: "Chúng tôi dành cả buổi chiều đi dạo quanh phố cổ." } },
      { word: "get back", ipa: "/ˌɡet ˈbæk/", partOfSpeech: "phrasal verb", vietnamese: "trở về", definition: "to return to a place", example: { english: "What time did you get back last night?", vietnamese: "Tối qua mấy giờ bạn về?" } },
      { word: "run out of", ipa: "/ˌrʌn ˈaʊt əv/", partOfSpeech: "phrasal verb", vietnamese: "hết, cạn", definition: "to use all of something so there is none left", example: { english: "We ran out of petrol on the motorway.", vietnamese: "Chúng tôi hết xăng giữa đường cao tốc." } },
    ],
    grammar: [{
      title: "Pick me up",
      pattern: "pick up the children / pick the children up · pick them up (not pick up them)",
      explanation: {
        english: "Many phrasal verbs can be separated: pick up the children or pick the children up. But when the object is a pronoun (me, you, him, her, it, us, them), it must go in the middle: pick them up, drop me off. Some phrasal verbs, like set off and get back, have no object at all.",
        vietnamese: "Nhiều cụm động từ có thể tách ra: pick up the children hoặc pick the children up. Nhưng khi tân ngữ là đại từ (me, you, him, her, it, us, them), nó phải đứng ở giữa: pick them up, drop me off. Một số cụm như set off và get back không có tân ngữ.",
      },
      examples: [
        { english: "I'll drop you off on my way to work.", vietnamese: "Tôi sẽ đưa bạn đi trên đường đến chỗ làm." },
        { english: "Can you pick my mum up from the airport?", vietnamese: "Bạn đón mẹ tôi ở sân bay được không?" },
      ],
      mistake: {
        wrong: "Can you pick up me at the hotel?", right: "Can you pick me up at the hotel?",
        why: { english: "A pronoun object goes between the verb and the particle: pick me up.", vietnamese: "Tân ngữ là đại từ phải đứng giữa động từ và tiểu từ: pick me up." },
      },
    }, {
      title: "Run out of",
      pattern: "run out of + noun · check in at / check into + place · get back to + place",
      explanation: {
        english: "Some phrasal verbs need a preposition before their object. Run out of always has of: We ran out of money. You check in at the airport or check into a hotel, and you get back to the hotel. Learn the whole phrase, including the preposition.",
        vietnamese: "Một số cụm động từ cần giới từ trước tân ngữ. Run out of luôn có of: We ran out of money. Bạn check in at sân bay hoặc check into khách sạn, và get back to khách sạn. Hãy học cả cụm, kể cả giới từ.",
      },
      examples: [
        { english: "My phone has run out of battery.", vietnamese: "Điện thoại tôi hết pin rồi." },
        { english: "We checked into a small guest house by the beach.", vietnamese: "Chúng tôi nhận phòng ở một nhà nghỉ nhỏ gần biển." },
      ],
      mistake: {
        wrong: "We ran out money on the second day.", right: "We ran out of money on the second day.",
        why: { english: "Run out needs of before the thing that is finished.", vietnamese: "Run out cần có of trước thứ bị hết." },
      },
    }],
    examples: [
      { english: "We set off early and got back after midnight.", vietnamese: "Chúng tôi xuất phát sớm và về sau nửa đêm." },
      { english: "After we checked in, we went out to look around.", vietnamese: "Sau khi nhận phòng, chúng tôi ra ngoài dạo quanh." },
      { english: "The taxi dropped us off right outside the hotel.", vietnamese: "Taxi thả chúng tôi ngay trước cửa khách sạn." },
      { english: "Don't forget to check out before the bus picks us up.", vietnamese: "Đừng quên trả phòng trước khi xe buýt đến đón chúng ta." },
    ],
    dialogue: [
      { speaker: "Ha", english: "What time should we set off tomorrow?", vietnamese: "Mai mình nên xuất phát lúc mấy giờ?" },
      { speaker: "Jack", english: "The flight's at nine, so we need to check in by seven.", vietnamese: "Chuyến bay lúc chín giờ, nên mình phải làm thủ tục trước bảy giờ." },
      { speaker: "Ha", english: "Can your brother drop us off at the airport?", vietnamese: "Anh trai bạn đưa mình ra sân bay được không?" },
      { speaker: "Jack", english: "Yes, and he'll pick us up when we get back on Sunday.", vietnamese: "Được, và anh ấy sẽ đón mình khi về vào Chủ nhật." },
      { speaker: "Ha", english: "Perfect. Have we got any euros?", vietnamese: "Tuyệt. Mình có đồng euro nào không?" },
      { speaker: "Jack", english: "A few. Let's not run out of cash this time!", vietnamese: "Một ít. Lần này đừng để hết tiền mặt nhé!" },
    ],
    practice: [
      q("Complete: We ___ at dawn to climb the mountain.", ["set off", "set up", "got off", "checked in"], "set off", "Set off = start a journey."),
      q("Choose the correct sentence.", ["Can you pick me up at six?", "Can you pick up me at six?", "Can you up pick me at six?", "Can you pick me at six up?"], "Can you pick me up at six?", "Pronoun in the middle: pick me up."),
      q("“Trả phòng” in English is…", ["check out", "check in", "get off", "set off"], "check out", "Check out = pay and leave a hotel."),
      q("Complete: We've run ___ milk.", ["out of", "out", "off", "of out"], "out of", "Run out of + noun."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["I'll drop them off at school.", "I'll drop off them at school.", "I'll drop them at school off.", "I'll off drop them at school."], "I'll drop them off at school.", "Pronoun in the middle."),
      q("Complete: What time did you ___ to the hotel last night?", ["get back", "get off", "set back", "check back"], "get back", "Get back to = return to."),
      q("Complete: We checked ___ a hotel near the station.", ["into", "out", "on", "up"], "into", "Check into a hotel."),
      q("What does “look around” mean?", ["walk around a place to see it", "search for something you lost", "turn your head", "look after someone"], "walk around a place to see it", "Look around = explore a place."),
      q("Complete: My laptop has run out of ___.", ["battery", "batteries off", "the charge out", "power off"], "battery", "Run out of + noun."),
    ],
  }, {
    key: "past-perfect", title: "By the Time We Arrived", titleVi: "Thì quá khứ hoàn thành",
    objectives: [
      "I can tell a travel story and make clear which event happened first.",
      "Use had + past participle for the earlier of two past events",
      "Give reasons in the past: I was tired because I hadn't slept",
    ],
    vocabulary: [
      { word: "by the time", ipa: "/baɪ ðə ˈtaɪm/", partOfSpeech: "conjunction", vietnamese: "vào lúc, trước khi (việc gì xảy ra)", definition: "not later than the moment when something happened", example: { english: "By the time we arrived, the shops had closed.", vietnamese: "Lúc chúng tôi đến thì cửa hàng đã đóng cửa." } },
      { word: "realise", ipa: "/ˈriːəlaɪz/", partOfSpeech: "verb", vietnamese: "nhận ra", definition: "to understand something you did not notice before (British spelling)", example: { english: "I realised I had left my passport at home.", vietnamese: "Tôi nhận ra mình đã để quên hộ chiếu ở nhà." } },
      { word: "miss", ipa: "/mɪs/", partOfSpeech: "verb", vietnamese: "lỡ, nhỡ (chuyến xe, máy bay)", definition: "to arrive too late to get on a bus, train or plane", example: { english: "We missed the last train.", vietnamese: "Chúng tôi lỡ chuyến tàu cuối." } },
      { word: "leave behind", ipa: "/ˌliːv bɪˈhaɪnd/", partOfSpeech: "phrasal verb", vietnamese: "để quên, bỏ lại", definition: "to forget to take something with you", example: { english: "She'd left her phone behind in the taxi.", vietnamese: "Cô ấy đã để quên điện thoại trên taxi." } },
      { word: "luggage", ipa: "/ˈlʌɡɪdʒ/", partOfSpeech: "noun", vietnamese: "hành lý", definition: "the bags and cases you take on a journey (uncountable)", example: { english: "How much luggage are you taking?", vietnamese: "Bạn mang bao nhiêu hành lý?" } },
      { word: "boarding pass", ipa: "/ˈbɔːdɪŋ pɑːs/", partOfSpeech: "noun", vietnamese: "thẻ lên máy bay", definition: "a card you must show to get on a plane", example: { english: "Have your boarding pass ready at the gate.", vietnamese: "Hãy chuẩn bị sẵn thẻ lên máy bay ở cửa ra." } },
      { word: "discover", ipa: "/dɪˈskʌvə/", partOfSpeech: "verb", vietnamese: "phát hiện ra", definition: "to find or learn something for the first time", example: { english: "We discovered a lovely café near the beach.", vietnamese: "Chúng tôi phát hiện một quán cà phê xinh xắn gần biển." } },
      { word: "exhausting", ipa: "/ɪɡˈzɔːstɪŋ/", partOfSpeech: "adjective", vietnamese: "làm kiệt sức", definition: "making you extremely tired", example: { english: "The overnight bus was exhausting.", vietnamese: "Chuyến xe đêm khiến tôi kiệt sức." } },
    ],
    grammar: [{
      title: "The earlier past",
      pattern: "had + past participle (the first event) · past simple (the later event)",
      explanation: {
        english: "When you tell a story in the past and want to show that one thing happened before another, use the past perfect (had + past participle) for the earlier event: When we got to the cinema, the film had started. Compare: When we got there, the film started (we arrived, then it started).",
        vietnamese: "Khi kể chuyện trong quá khứ và muốn cho thấy việc này xảy ra trước việc kia, dùng thì quá khứ hoàn thành (had + quá khứ phân từ) cho việc xảy ra trước: When we got to the cinema, the film had started. So sánh: When we got there, the film started (chúng tôi đến rồi phim mới bắt đầu).",
      },
      examples: [
        { english: "By the time I found the gate, they had closed it.", vietnamese: "Lúc tôi tìm được cửa ra máy bay thì họ đã đóng rồi." },
        { english: "I had never seen the sea before that trip.", vietnamese: "Trước chuyến đi đó tôi chưa từng nhìn thấy biển." },
      ],
      mistake: {
        wrong: "When we arrived, the film already started.", right: "When we arrived, the film had already started.",
        why: { english: "Vietnamese uses “đã” for both events; English shows the earlier one with had + past participle.", vietnamese: "Tiếng Việt dùng “đã” cho cả hai việc; tiếng Anh đánh dấu việc xảy ra trước bằng had + quá khứ phân từ." },
      },
    }, {
      title: "Reasons in the past",
      pattern: "past simple + because + had (not) + past participle",
      explanation: {
        english: "The past perfect also explains a situation in the past: the reason happened earlier. I was exhausted because I hadn't slept on the plane. She was nervous because she had never flown before.",
        vietnamese: "Thì quá khứ hoàn thành còn dùng để giải thích một tình huống trong quá khứ: nguyên nhân xảy ra trước. I was exhausted because I hadn't slept on the plane. She was nervous because she had never flown before.",
      },
      examples: [
        { english: "We were hungry because we hadn't eaten since breakfast.", vietnamese: "Chúng tôi đói vì chưa ăn gì từ bữa sáng." },
        { english: "He couldn't get on the plane because he had lost his boarding pass.", vietnamese: "Anh ấy không lên được máy bay vì đã làm mất thẻ lên máy bay." },
      ],
      mistake: {
        wrong: "I was tired because I didn't sleep all night.", right: "I was tired because I hadn't slept all night.",
        why: { english: "Not sleeping came before being tired: use the past perfect for the earlier reason.", vietnamese: "Việc không ngủ xảy ra trước việc mệt: dùng quá khứ hoàn thành cho nguyên nhân xảy ra trước." },
      },
    }],
    examples: [
      { english: "I realised I had left my luggage behind at the station.", vietnamese: "Tôi nhận ra mình đã để quên hành lý ở ga." },
      { english: "By the time we got to the airport, we had missed our flight.", vietnamese: "Lúc chúng tôi đến sân bay thì đã lỡ chuyến bay." },
      { english: "The trip was exhausting because we had walked twenty kilometres.", vietnamese: "Chuyến đi mệt rã rời vì chúng tôi đã đi bộ hai mươi cây số." },
      { english: "They discovered that the hotel had given their room to someone else.", vietnamese: "Họ phát hiện khách sạn đã giao phòng của họ cho người khác." },
    ],
    dialogue: [
      { speaker: "Oliver", english: "How was your trip to Sapa?", vietnamese: "Chuyến đi Sa Pa của bạn thế nào?" },
      { speaker: "Nhung", english: "It started badly. When we got to the bus station, the bus had left.", vietnamese: "Mở đầu tệ lắm. Lúc tụi mình đến bến xe thì xe đã chạy rồi." },
      { speaker: "Oliver", english: "Oh no! Had you booked tickets?", vietnamese: "Ôi không! Các bạn đã đặt vé chưa?" },
      { speaker: "Nhung", english: "Yes, but we'd written down the wrong time.", vietnamese: "Đặt rồi, nhưng tụi mình đã ghi nhầm giờ." },
      { speaker: "Oliver", english: "So what did you do?", vietnamese: "Thế các bạn làm sao?" },
      { speaker: "Nhung", english: "We took the night bus. It was exhausting, but the view was worth it.", vietnamese: "Tụi mình đi xe đêm. Mệt rã rời, nhưng cảnh đẹp đáng công." },
    ],
    practice: [
      q("Complete: When I got home, my family ___ dinner.", ["had eaten", "has eaten", "eats", "have eaten"], "had eaten", "They ate first: had + past participle."),
      q("Complete: By the time we arrived, the concert ___.", ["had finished", "finishes", "has finished", "is finishing"], "had finished", "The earlier event: past perfect."),
      q("“Hành lý” in English is…", ["luggage", "luggages", "a luggage", "baggages"], "luggage", "Luggage is uncountable."),
      q("Complete: I ___ that I had forgotten my wallet.", ["realised", "realized", "realising", "realise to"], "realised", "British spelling: realised."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["She was nervous because she had never flown before.", "She was nervous because she never flew before.", "She was nervous because she has never flown before.", "She was nervous because she had never fly before."], "She was nervous because she had never flown before.", "Reason before the past: had + past participle."),
      q("Complete: We ___ the train because we'd got up late.", ["missed", "had missed", "miss", "have missed"], "missed", "The later event: past simple."),
      q("Complete: He'd left his passport ___ in the hotel.", ["behind", "back", "after", "out"], "behind", "Leave behind = forget to take."),
      q("“When we arrived, the party started.” What does it mean?", ["The party started after we arrived.", "The party started before we arrived.", "We missed the party.", "There was no party."], "The party started after we arrived.", "Two past simples: one after the other."),
      q("Complete: I couldn't check in because I ___ my booking number.", ["had lost", "have lost", "lose", "was lose"], "had lost", "The earlier reason: past perfect."),
    ],
  }, {
    key: "the-with-places", title: "The Thames, the UK and Hanoi", titleVi: "The với tên địa danh",
    objectives: [
      "I can talk about countries, cities and natural places with or without the.",
      "Say Vietnam and Hanoi, but the UK and the Philippines",
      "Use the with rivers, seas, oceans and mountain ranges, but not with lakes or single mountains",
    ],
    vocabulary: [
      { word: "capital", ipa: "/ˈkæpɪtl/", partOfSpeech: "noun", vietnamese: "thủ đô", definition: "the city where a country's government is", example: { english: "Edinburgh is the capital of Scotland.", vietnamese: "Edinburgh là thủ đô của Scotland." } },
      { word: "coast", ipa: "/kəʊst/", partOfSpeech: "noun", vietnamese: "bờ biển, vùng ven biển", definition: "the land next to the sea", example: { english: "We drove along the coast to Nha Trang.", vietnamese: "Chúng tôi lái xe dọc bờ biển đến Nha Trang." } },
      { word: "island", ipa: "/ˈaɪlənd/", partOfSpeech: "noun", vietnamese: "hòn đảo", definition: "a piece of land with water all around it", example: { english: "Phu Quoc is Vietnam's largest island.", vietnamese: "Phú Quốc là hòn đảo lớn nhất Việt Nam." } },
      { word: "ocean", ipa: "/ˈəʊʃn/", partOfSpeech: "noun", vietnamese: "đại dương", definition: "one of the very large areas of sea on the Earth", example: { english: "The Pacific is the biggest ocean in the world.", vietnamese: "Thái Bình Dương là đại dương lớn nhất thế giới." } },
      { word: "mountain range", ipa: "/ˈmaʊntən reɪndʒ/", partOfSpeech: "noun", vietnamese: "dãy núi", definition: "a line of mountains", example: { english: "The Alps are a mountain range in Europe.", vietnamese: "Dãy Alps là một dãy núi ở châu Âu." } },
      { word: "border", ipa: "/ˈbɔːdə/", partOfSpeech: "noun", vietnamese: "biên giới", definition: "the line between two countries", example: { english: "Lao Cai is on the border with China.", vietnamese: "Lào Cai nằm ở biên giới với Trung Quốc." } },
      { word: "landmark", ipa: "/ˈlændmɑːk/", partOfSpeech: "noun", vietnamese: "địa danh nổi tiếng, công trình biểu tượng", definition: "a famous building or place that is easy to recognise", example: { english: "Big Ben is London's most famous landmark.", vietnamese: "Tháp Big Ben là công trình biểu tượng nổi tiếng nhất London." } },
      { word: "sightseeing", ipa: "/ˈsaɪtsiːɪŋ/", partOfSpeech: "noun", vietnamese: "việc đi tham quan", definition: "visiting famous places as a tourist", example: { english: "We did some sightseeing in the morning.", vietnamese: "Buổi sáng chúng tôi đi tham quan một chút." } },
    ],
    grammar: [{
      title: "Countries and cities",
      pattern: "no the: Vietnam, France, Hanoi, London, Asia · the: the UK, the USA, the Philippines, the Netherlands",
      explanation: {
        english: "Most countries, cities and continents have no article: I live in Vietnam. She works in London. Use the when the name has a word like kingdom, states or republic (the United Kingdom, the USA, the Czech Republic) or is plural (the Philippines, the Netherlands).",
        vietnamese: "Hầu hết tên nước, thành phố và châu lục không có mạo từ: I live in Vietnam. She works in London. Dùng the khi tên có các từ như kingdom, states hay republic (the United Kingdom, the USA, the Czech Republic) hoặc ở dạng số nhiều (the Philippines, the Netherlands).",
      },
      examples: [
        { english: "My aunt moved from Vietnam to the USA in 2010.", vietnamese: "Dì tôi chuyển từ Việt Nam sang Mỹ năm 2010." },
        { english: "Manila is the capital of the Philippines.", vietnamese: "Manila là thủ đô của Philippines." },
      ],
      mistake: {
        wrong: "I come from the Vietnam.", right: "I come from Vietnam.",
        why: { english: "Most country names, including Vietnam, take no article.", vietnamese: "Hầu hết tên nước, kể cả Vietnam, không có mạo từ." },
      },
    }, {
      title: "Natural places",
      pattern: "the: the Mekong, the Thames, the Pacific, the Alps · no the: Lake Windermere, Mount Everest, Ha Long Bay",
      explanation: {
        english: "Use the with rivers, seas, oceans, deserts and mountain ranges: the Mekong, the Red Sea, the Atlantic, the Himalayas. Don't use the with single mountains, lakes and most bays: Mount Fuji, Lake Geneva, Ha Long Bay. With rivers, the word river is often left out: the Thames.",
        vietnamese: "Dùng the với sông, biển, đại dương, sa mạc và dãy núi: the Mekong, the Red Sea, the Atlantic, the Himalayas. Không dùng the với từng ngọn núi riêng lẻ, hồ và hầu hết các vịnh: Mount Fuji, Lake Geneva, Ha Long Bay. Với sông, từ river thường được lược bỏ: the Thames.",
      },
      examples: [
        { english: "We took a boat trip on the Mekong.", vietnamese: "Chúng tôi đi thuyền trên sông Mê Kông." },
        { english: "Fansipan is the highest mountain in the Hoang Lien Son range.", vietnamese: "Fansipan là ngọn núi cao nhất dãy Hoàng Liên Sơn." },
      ],
      mistake: {
        wrong: "We swam in Atlantic and climbed the Mount Snowdon.", right: "We swam in the Atlantic and climbed Mount Snowdon.",
        why: { english: "Oceans take the; a single mountain does not.", vietnamese: "Đại dương có the; một ngọn núi riêng lẻ thì không." },
      },
    }],
    examples: [
      { english: "London is on the Thames, and Hanoi is on the Red River.", vietnamese: "London nằm bên sông Thames, còn Hà Nội nằm bên sông Hồng." },
      { english: "We went sightseeing in Edinburgh and then drove to the coast.", vietnamese: "Chúng tôi đi tham quan Edinburgh rồi lái xe ra biển." },
      { english: "The Netherlands is famous for its flat land and bicycles.", vietnamese: "Hà Lan nổi tiếng với vùng đất bằng phẳng và xe đạp." },
      { english: "There are thousands of islands in Ha Long Bay.", vietnamese: "Có hàng nghìn hòn đảo ở vịnh Hạ Long." },
    ],
    dialogue: [
      { speaker: "Guide", english: "Welcome to the UK! Is this your first visit?", vietnamese: "Chào mừng đến Vương quốc Anh! Đây là lần đầu bạn đến à?" },
      { speaker: "Tuan", english: "Yes. I've been to France, but never to Britain.", vietnamese: "Vâng. Tôi đã đến Pháp, nhưng chưa bao giờ đến nước Anh." },
      { speaker: "Guide", english: "Today we'll walk along the Thames and see the main landmarks.", vietnamese: "Hôm nay chúng ta sẽ đi dọc sông Thames và xem các công trình nổi tiếng." },
      { speaker: "Tuan", english: "Great. And tomorrow we're going to the Lake District, right?", vietnamese: "Tuyệt. Và ngày mai chúng ta đi vùng Lake District phải không?" },
      { speaker: "Guide", english: "That's right. We'll take a boat on Lake Windermere.", vietnamese: "Đúng vậy. Chúng ta sẽ đi thuyền trên hồ Windermere." },
      { speaker: "Tuan", english: "It sounds like Ha Long Bay without the islands!", vietnamese: "Nghe giống vịnh Hạ Long mà không có đảo!" },
    ],
    practice: [
      q("Complete: My brother lives in ___ Australia.", ["(no article)", "the", "a", "an"], "(no article)", "Most countries: no the."),
      q("Complete: She's working in ___ USA this year.", ["the", "(no article)", "a", "an"], "the", "The United States: the."),
      q("Complete: We took a cruise on ___ Danube.", ["the", "(no article)", "a", "an"], "the", "Rivers take the."),
      q("“Thủ đô” in English is…", ["capital", "capitol city", "main town", "head city"], "capital", "Capital = the government's city."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["Have you climbed Mount Fuji?", "Have you climbed the Mount Fuji?", "Have you climbed a Mount Fuji?", "Have you climbed Mount the Fuji?"], "Have you climbed Mount Fuji?", "Single mountains: no the."),
      q("Complete: ___ Himalayas are the highest mountains in the world.", ["The", "(no article)", "A", "An"], "The", "Mountain ranges take the."),
      q("Choose the correct sentence.", ["The Philippines has over 7,000 islands.", "Philippines has over 7,000 islands.", "A Philippines has over 7,000 islands.", "The Philippine have over 7,000 islands."], "The Philippines has over 7,000 islands.", "Plural country names take the."),
      q("Complete: We went swimming in ___ Lake Geneva.", ["(no article)", "the", "a", "an"], "(no article)", "Lakes: no the."),
      q("What is a “border”?", ["the line between two countries", "the edge of the sea", "a famous building", "a mountain range"], "the line between two countries", "Border = line between countries."),
    ],
  }, {
    key: "travel-problems", title: "My Flight Was Delayed", titleVi: "Sự cố khi đi du lịch",
    objectives: [
      "I can explain what went wrong on a journey and ask for help.",
      "Say what happened to me with was / were + past participle: My bag was stolen",
      "Report a problem with There's a problem with…",
    ],
    vocabulary: [
      { word: "delayed", ipa: "/dɪˈleɪd/", partOfSpeech: "adjective", vietnamese: "bị trễ, bị hoãn", definition: "late because of a problem", example: { english: "Our flight was delayed by three hours.", vietnamese: "Chuyến bay của chúng tôi bị trễ ba tiếng." } },
      { word: "cancelled", ipa: "/ˈkænsld/", partOfSpeech: "adjective", vietnamese: "bị huỷ", definition: "stopped, so it will not happen (British spelling)", example: { english: "All trains were cancelled because of the storm.", vietnamese: "Tất cả chuyến tàu bị huỷ vì bão." } },
      { word: "stolen", ipa: "/ˈstəʊlən/", partOfSpeech: "adjective", vietnamese: "bị lấy cắp", definition: "taken by a thief", example: { english: "My wallet was stolen on the underground.", vietnamese: "Ví của tôi bị lấy cắp trên tàu điện ngầm." } },
      { word: "overbooked", ipa: "/ˌəʊvəˈbʊkt/", partOfSpeech: "adjective", vietnamese: "bị đặt quá số chỗ", definition: "having more bookings than seats or rooms", example: { english: "The hotel was overbooked, so they sent us to another one.", vietnamese: "Khách sạn bị đặt quá chỗ, nên họ đưa chúng tôi sang khách sạn khác." } },
      { word: "lost property", ipa: "/ˌlɒst ˈprɒpəti/", partOfSpeech: "noun", vietnamese: "đồ thất lạc; quầy đồ thất lạc", definition: "things people have lost, or the office that keeps them (British English)", example: { english: "Try asking at lost property.", vietnamese: "Thử hỏi ở quầy đồ thất lạc xem." } },
      { word: "travel insurance", ipa: "/ˈtrævl ɪnˌʃʊərəns/", partOfSpeech: "noun", vietnamese: "bảo hiểm du lịch", definition: "an agreement that pays you if something goes wrong on a trip", example: { english: "Never travel without travel insurance.", vietnamese: "Đừng bao giờ đi du lịch mà không có bảo hiểm." } },
      { word: "refund", ipa: "/ˈriːfʌnd/", partOfSpeech: "noun", vietnamese: "khoản hoàn tiền", definition: "money that is given back to you", example: { english: "Can I get a refund for the cancelled tour?", vietnamese: "Tôi có được hoàn tiền tour bị huỷ không?" } },
      { word: "turn out", ipa: "/ˌtɜːn ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "hoá ra", definition: "to happen in a way you did not expect", example: { english: "It turned out that the museum was closed on Mondays.", vietnamese: "Hoá ra bảo tàng đóng cửa vào thứ Hai." } },
    ],
    grammar: [{
      title: "What happened to me",
      pattern: "was / were + past participle: My flight was delayed. Our bags were lost.",
      explanation: {
        english: "When something bad happens to you and it doesn't matter who did it, English often uses was / were + past participle: My phone was stolen. The tour was cancelled. Vietnamese uses “bị”, but English needs was / were, and the verb must be the past participle (stolen, not stole).",
        vietnamese: "Khi điều không may xảy ra với bạn và không quan trọng ai gây ra, tiếng Anh thường dùng was / were + quá khứ phân từ: My phone was stolen. The tour was cancelled. Tiếng Việt dùng “bị”, còn tiếng Anh cần was / were, và động từ phải ở dạng quá khứ phân từ (stolen, không phải stole).",
      },
      examples: [
        { english: "Our train was cancelled, so we took a coach.", vietnamese: "Tàu của chúng tôi bị huỷ, nên chúng tôi đi xe khách." },
        { english: "Two of our suitcases were damaged.", vietnamese: "Hai chiếc vali của chúng tôi bị hỏng." },
      ],
      mistake: {
        wrong: "My flight delayed for two hours.", right: "My flight was delayed for two hours.",
        why: { english: "The flight didn't delay anything; something delayed it. Use was + past participle, like “bị” in Vietnamese.", vietnamese: "Chuyến bay không tự làm trễ cái gì; nó bị làm trễ. Dùng was + quá khứ phân từ, giống “bị” trong tiếng Việt." },
      },
    }, {
      title: "Reporting a problem",
      pattern: "There's a problem with + noun · Something's wrong with … · The … isn't working / doesn't work",
      explanation: {
        english: "To report a problem politely, say There's a problem with my room / my booking, or The air conditioning isn't working. Then ask for help: Could you send someone to look at it? Could you help me, please?",
        vietnamese: "Để báo sự cố một cách lịch sự, hãy nói There's a problem with my room / my booking, hoặc The air conditioning isn't working. Rồi nhờ giúp đỡ: Could you send someone to look at it? Could you help me, please?",
      },
      examples: [
        { english: "Excuse me, there's a problem with my bill.", vietnamese: "Xin lỗi, hoá đơn của tôi có vấn đề." },
        { english: "Something's wrong with the shower. There's no hot water.", vietnamese: "Vòi sen bị làm sao ấy. Không có nước nóng." },
      ],
      mistake: {
        wrong: "My room has problem.", right: "There's a problem with my room.",
        why: { english: "English says There's a problem with… and problem needs a. “Phòng tôi có vấn đề” does not translate word for word.", vietnamese: "Tiếng Anh nói There's a problem with… và problem cần có a. “Phòng tôi có vấn đề” không dịch từng chữ được." },
      },
    }],
    examples: [
      { english: "It turned out that our flight had been cancelled.", vietnamese: "Hoá ra chuyến bay của chúng tôi đã bị huỷ." },
      { english: "Luckily, my travel insurance paid for a new phone.", vietnamese: "May là bảo hiểm du lịch trả tiền điện thoại mới cho tôi." },
      { english: "The flight was overbooked, so I was given a seat on the next one.", vietnamese: "Chuyến bay bị đặt quá chỗ, nên tôi được xếp ghế trên chuyến sau." },
      { english: "My bag wasn't stolen after all. Someone had handed it in to lost property.", vietnamese: "Hoá ra túi của tôi không bị lấy cắp. Có người đã nộp nó cho quầy đồ thất lạc." },
    ],
    dialogue: [
      { speaker: "Agent", english: "Good morning. How can I help?", vietnamese: "Chào buổi sáng. Tôi giúp gì được ạ?" },
      { speaker: "Hieu", english: "My flight to Manchester was cancelled. What can I do?", vietnamese: "Chuyến bay đi Manchester của tôi bị huỷ. Tôi phải làm gì?" },
      { speaker: "Agent", english: "I'm sorry. I can put you on the next flight at four.", vietnamese: "Tôi rất tiếc. Tôi có thể xếp anh lên chuyến tiếp theo lúc bốn giờ." },
      { speaker: "Hieu", english: "And there's a problem with my bag. It wasn't on the belt.", vietnamese: "Và hành lý của tôi cũng có vấn đề. Nó không có trên băng chuyền." },
      { speaker: "Agent", english: "It was probably sent to the wrong airport. Please fill in this form.", vietnamese: "Có lẽ nó bị gửi nhầm sân bay. Anh vui lòng điền vào mẫu này." },
      { speaker: "Hieu", english: "Thank you. Can I get a refund for the hotel I've missed?", vietnamese: "Cảm ơn. Tôi có được hoàn tiền khách sạn mà tôi đã lỡ không?" },
    ],
    practice: [
      q("Complete: Our flight ___ because of fog.", ["was delayed", "delayed", "was delay", "has delay"], "was delayed", "Was + past participle."),
      q("Complete: My camera ___ at the beach.", ["was stolen", "was stole", "stolen", "stole"], "was stolen", "Was + past participle (stolen)."),
      q("Choose the correct sentence.", ["There's a problem with my room.", "My room has problem.", "My room is problem.", "Have problem with my room."], "There's a problem with my room.", "There's a problem with…"),
      q("“Hoàn tiền” in English is…", ["refund", "return money back", "payback card", "repay ticket"], "refund", "Refund = money given back."),
    ],
    challenge: [
      q("Complete: All the ferries ___ because of the storm.", ["were cancelled", "was cancelled", "cancelled", "were cancel"], "were cancelled", "Plural: were + past participle."),
      q("Complete: It ___ that the hotel had no record of our booking.", ["turned out", "turned up", "turned off", "found out it"], "turned out", "It turned out that… = hoá ra."),
      q("Where do you ask about a bag you left on a train in the UK?", ["lost property", "lost and find", "missing room", "forget office"], "lost property", "British English: lost property."),
      q("Complete: The air conditioning ___. Could you send someone?", ["isn't working", "is broken working", "doesn't works", "not work"], "isn't working", "Report a fault: isn't working."),
      q("What does “overbooked” mean?", ["having more bookings than places", "very expensive", "closed for repairs", "booked too early"], "having more bookings than places", "Overbooked = too many bookings."),
    ],
  }, {
    key: "complaints", title: "Making a Complaint", titleVi: "Phàn nàn lịch sự",
    objectives: [
      "I can make a polite complaint in a hotel, a restaurant or a shop.",
      "Use complain about and make a complaint correctly",
      "Soften requests: I'm afraid…, Would it be possible to…?",
    ],
    vocabulary: [
      { word: "complain", ipa: "/kəmˈpleɪn/", partOfSpeech: "verb", vietnamese: "phàn nàn, khiếu nại", definition: "to say that something is wrong or not good enough", example: { english: "Several guests complained about the noise.", vietnamese: "Một vài khách phàn nàn về tiếng ồn." } },
      { word: "complaint", ipa: "/kəmˈpleɪnt/", partOfSpeech: "noun", vietnamese: "lời phàn nàn, đơn khiếu nại", definition: "a statement that something is wrong", example: { english: "I'd like to make a complaint.", vietnamese: "Tôi muốn khiếu nại." } },
      { word: "faulty", ipa: "/ˈfɔːlti/", partOfSpeech: "adjective", vietnamese: "bị lỗi", definition: "not working properly", example: { english: "The kettle in our room is faulty.", vietnamese: "Ấm đun nước trong phòng chúng tôi bị lỗi." } },
      { word: "replace", ipa: "/rɪˈpleɪs/", partOfSpeech: "verb", vietnamese: "thay thế, đổi", definition: "to give someone a new thing instead of a damaged one", example: { english: "Can you replace these headphones? They don't work.", vietnamese: "Bạn đổi giúp tôi tai nghe này được không? Nó không chạy." } },
      { word: "unacceptable", ipa: "/ˌʌnəkˈseptəbl/", partOfSpeech: "adjective", vietnamese: "không thể chấp nhận được", definition: "too bad to be allowed to continue", example: { english: "Waiting two hours for food is unacceptable.", vietnamese: "Chờ đồ ăn hai tiếng là không thể chấp nhận được." } },
      { word: "deal with", ipa: "/ˈdiːl wɪð/", partOfSpeech: "phrasal verb", vietnamese: "xử lý, giải quyết", definition: "to take action to solve a problem", example: { english: "The manager will deal with your complaint.", vietnamese: "Quản lý sẽ xử lý khiếu nại của bạn." } },
      { word: "compensation", ipa: "/ˌkɒmpenˈseɪʃn/", partOfSpeech: "noun", vietnamese: "tiền bồi thường", definition: "money paid to someone because something bad happened to them", example: { english: "Passengers can claim compensation for long delays.", vietnamese: "Hành khách có thể đòi bồi thường khi bị trễ lâu." } },
      { word: "I'm afraid", ipa: "/aɪm əˈfreɪd/", partOfSpeech: "phrase", vietnamese: "tôi e rằng", definition: "a polite way to introduce bad news or a complaint", example: { english: "I'm afraid this isn't what I ordered.", vietnamese: "Tôi e rằng đây không phải món tôi gọi." } },
    ],
    grammar: [{
      title: "Complain about",
      pattern: "complain (to someone) about + noun / -ing · make a complaint (about …)",
      explanation: {
        english: "Complain is followed by about before the problem, and to before the person: She complained to the manager about the noise. The noun is complaint, and you make a complaint. Don't put the problem straight after complain.",
        vietnamese: "Complain đi với about trước vấn đề, và với to trước người nghe: She complained to the manager about the noise. Danh từ là complaint, và ta nói make a complaint. Đừng đặt vấn đề ngay sau complain.",
      },
      examples: [
        { english: "We complained about the dirty towels.", vietnamese: "Chúng tôi phàn nàn về khăn tắm bẩn." },
        { english: "I'd like to make a complaint about my meal.", vietnamese: "Tôi muốn phàn nàn về bữa ăn của mình." },
      ],
      mistake: {
        wrong: "I want to complain the noise.", right: "I want to complain about the noise.",
        why: { english: "Complain needs about before the problem.", vietnamese: "Complain cần có about trước vấn đề." },
      },
    }, {
      title: "Softening a complaint",
      pattern: "I'm afraid … · I'm sorry, but … · Would it be possible to + verb? · I was wondering if you could …",
      explanation: {
        english: "British English softens complaints so they don't sound rude. Start with I'm afraid… or I'm sorry, but…, then ask with Would it be possible to…? or I was wondering if you could… Direct orders like You must change my room sound very rude.",
        vietnamese: "Tiếng Anh Anh thường làm nhẹ lời phàn nàn để không bị thô lỗ. Mở đầu bằng I'm afraid… hoặc I'm sorry, but…, rồi đề nghị bằng Would it be possible to…? hoặc I was wondering if you could… Câu ra lệnh trực tiếp như You must change my room nghe rất thô lỗ.",
      },
      examples: [
        { english: "I'm sorry, but this soup is cold.", vietnamese: "Xin lỗi, nhưng món súp này nguội rồi." },
        { english: "I was wondering if you could move us to a quieter table.", vietnamese: "Không biết anh / chị có thể đổi cho chúng tôi sang bàn yên tĩnh hơn không." },
      ],
      mistake: {
        wrong: "You must give me another room.", right: "Would it be possible to have another room?",
        why: { english: "Must sounds like an order. A polite question gets a better result.", vietnamese: "Must nghe như ra lệnh. Một câu hỏi lịch sự sẽ hiệu quả hơn." },
      },
    }],
    examples: [
      { english: "I'm afraid the TV in our room is faulty.", vietnamese: "Tôi e rằng tivi trong phòng chúng tôi bị lỗi." },
      { english: "Would it be possible to replace it today?", vietnamese: "Có thể đổi nó ngay hôm nay được không?" },
      { english: "The service was unacceptable, so I complained to the manager.", vietnamese: "Dịch vụ quá tệ nên tôi đã phàn nàn với quản lý." },
      { english: "The airline dealt with my complaint quickly and offered compensation.", vietnamese: "Hãng bay xử lý khiếu nại của tôi nhanh chóng và đề nghị bồi thường." },
    ],
    dialogue: [
      { speaker: "Thao", english: "Excuse me. I'm afraid I'd like to make a complaint.", vietnamese: "Xin lỗi. Tôi e là tôi muốn khiếu nại một chút." },
      { speaker: "Receptionist", english: "I'm sorry to hear that. What's the problem?", vietnamese: "Tôi rất tiếc khi nghe vậy. Có vấn đề gì ạ?" },
      { speaker: "Thao", english: "The room next to ours was very noisy until 2 a.m.", vietnamese: "Phòng bên cạnh rất ồn đến tận hai giờ sáng." },
      { speaker: "Receptionist", english: "I do apologise. I'll deal with it right away.", vietnamese: "Tôi thành thật xin lỗi. Tôi sẽ xử lý ngay." },
      { speaker: "Thao", english: "Would it be possible to move to a quieter room tonight?", vietnamese: "Tối nay có thể chuyển chúng tôi sang phòng yên tĩnh hơn không?" },
      { speaker: "Receptionist", english: "Of course. And breakfast is free for you tomorrow.", vietnamese: "Tất nhiên rồi. Và bữa sáng ngày mai miễn phí cho chị." },
    ],
    practice: [
      q("Complete: We complained ___ the cold food.", ["about", "for", "with", "on"], "about", "Complain about."),
      q("Complete: I'd like to ___ a complaint.", ["make", "do", "say", "give"], "make", "Make a complaint."),
      q("Choose the most polite request.", ["Would it be possible to change my seat?", "Change my seat.", "You must change my seat.", "I want change seat."], "Would it be possible to change my seat?", "Soft: Would it be possible to…?"),
      q("“Bị lỗi” (for a machine) in English is…", ["faulty", "fault", "mistaken", "wronged"], "faulty", "Faulty = not working properly."),
    ],
    challenge: [
      q("Complete: She complained ___ the manager about the bill.", ["to", "at", "with", "for"], "to", "Complain to a person."),
      q("Complete: ___, but there's a hair in my salad.", ["I'm sorry", "I'm afraid of", "Sorry for", "Excuse"], "I'm sorry", "I'm sorry, but… softens a complaint."),
      q("Choose the correct sentence.", ["I was wondering if you could help me.", "I was wondering if could you help me.", "I was wondering you could help me if.", "I wondered could you help me."], "I was wondering if you could help me.", "If + subject + verb."),
      q("What is “compensation”?", ["money paid because something bad happened", "a free meal", "a kind of complaint", "a hotel room"], "money paid because something bad happened", "Compensation = money for a problem."),
      q("Complete: The manager promised to ___ the problem.", ["deal with", "deal", "deal on", "deal about"], "deal with", "Deal with a problem."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 3", isReview: true,
    objectives: [
      "I can plan a trip, tell its story and deal with problems on the way.",
      "Check phrasal verb objects, the past perfect, the with places, was + past participle and polite complaints",
    ],
    vocabulary: [
      { word: "set off", ipa: "/ˌset ˈɒf/", partOfSpeech: "phrasal verb", vietnamese: "khởi hành, lên đường", definition: "to start a journey", example: { english: "If we set off now, we'll be there by lunch.", vietnamese: "Nếu xuất phát bây giờ, chúng ta sẽ đến nơi trước bữa trưa." } },
      { word: "luggage", ipa: "/ˈlʌɡɪdʒ/", partOfSpeech: "noun", vietnamese: "hành lý", definition: "the bags and cases you take on a journey (uncountable)", example: { english: "Don't leave your luggage unattended.", vietnamese: "Đừng để hành lý của bạn không có người trông." } },
      { word: "coast", ipa: "/kəʊst/", partOfSpeech: "noun", vietnamese: "bờ biển, vùng ven biển", definition: "the land next to the sea", example: { english: "Cornwall has a beautiful coast.", vietnamese: "Cornwall có bờ biển rất đẹp." } },
      { word: "delayed", ipa: "/dɪˈleɪd/", partOfSpeech: "adjective", vietnamese: "bị trễ, bị hoãn", definition: "late because of a problem", example: { english: "The 8.15 to London is delayed.", vietnamese: "Chuyến 8 giờ 15 đi London bị trễ." } },
      { word: "complain", ipa: "/kəmˈpleɪn/", partOfSpeech: "verb", vietnamese: "phàn nàn, khiếu nại", definition: "to say that something is wrong or not good enough", example: { english: "He never complains about anything.", vietnamese: "Anh ấy chẳng bao giờ phàn nàn điều gì." } },
      { word: "refund", ipa: "/ˈriːfʌnd/", partOfSpeech: "noun", vietnamese: "khoản hoàn tiền", definition: "money that is given back to you", example: { english: "They gave me a full refund.", vietnamese: "Họ hoàn lại cho tôi toàn bộ tiền." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "pick me up · had + past participle · Vietnam but the UK, the Mekong · was delayed / stolen · complain about, Would it be possible…?",
      explanation: {
        english: "Check these: a pronoun goes in the middle of a phrasal verb (pick me up), and run out needs of; the earlier of two past events takes had + past participle; most countries take no the, but the UK, the Philippines, rivers, seas and mountain ranges do; things that happen to you take was / were + past participle; complain about something, and soften complaints with I'm afraid and Would it be possible…?",
        vietnamese: "Hãy kiểm tra: đại từ đứng giữa cụm động từ (pick me up), và run out cần có of; việc xảy ra trước trong hai việc quá khứ dùng had + quá khứ phân từ; hầu hết tên nước không có the, nhưng the UK, the Philippines, sông, biển và dãy núi thì có; điều xảy ra với bạn dùng was / were + quá khứ phân từ; complain about một vấn đề, và làm nhẹ lời phàn nàn bằng I'm afraid và Would it be possible…?",
      },
      examples: [
        { english: "By the time the taxi picked us up, the ferry had left.", vietnamese: "Lúc taxi đến đón thì phà đã rời bến." },
        { english: "I'm afraid our flight to the UK was cancelled.", vietnamese: "Tôi e rằng chuyến bay sang Anh của chúng tôi đã bị huỷ." },
      ],
    }],
    examples: [
      { english: "We set off for the coast, but our train was delayed.", vietnamese: "Chúng tôi lên đường ra biển, nhưng tàu bị trễ." },
      { english: "When I got to the hotel, I realised I'd left my luggage on the train.", vietnamese: "Khi đến khách sạn, tôi nhận ra đã để quên hành lý trên tàu." },
      { english: "I complained, and they gave me a refund.", vietnamese: "Tôi đã khiếu nại, và họ hoàn tiền cho tôi." },
    ],
    dialogue: [
      { speaker: "Amy", english: "How was your holiday in the Philippines?", vietnamese: "Kỳ nghỉ ở Philippines của bạn thế nào?" },
      { speaker: "Son", english: "Amazing in the end, but the start was a disaster.", vietnamese: "Cuối cùng thì tuyệt vời, nhưng lúc đầu là một thảm hoạ." },
      { speaker: "Amy", english: "Why? What happened?", vietnamese: "Sao thế? Có chuyện gì vậy?" },
      { speaker: "Son", english: "Our flight was delayed, and by the time we landed, the last ferry had gone.", vietnamese: "Chuyến bay bị trễ, và lúc hạ cánh thì chuyến phà cuối đã đi mất." },
      { speaker: "Amy", english: "Did you complain to the airline?", vietnamese: "Bạn có khiếu nại với hãng bay không?" },
      { speaker: "Son", english: "Yes, politely. They paid for a hotel and picked us up in the morning.", vietnamese: "Có, một cách lịch sự. Họ trả tiền khách sạn và sáng hôm sau đến đón chúng tôi." },
      { speaker: "Amy", english: "So it turned out fine!", vietnamese: "Vậy là hoá ra mọi chuyện ổn cả!" },
    ],
    practice: [
      q("Choose the correct sentence.", ["My uncle will pick us up.", "My uncle will pick up us.", "My uncle will us pick up.", "My uncle will pick us at up."], "My uncle will pick us up.", "Pronoun in the middle."),
      q("Complete: When we arrived, everyone ___ home.", ["had gone", "has gone", "goes", "have gone"], "had gone", "The earlier event: past perfect."),
      q("Complete: I'd love to visit ___ Netherlands.", ["the", "(no article)", "a", "an"], "the", "Plural country names take the."),
      q("Complete: Our bags ___ at the airport.", ["were lost", "lost", "was lose", "were lose"], "were lost", "Were + past participle."),
    ],
    challenge: [
      q("Complete: We had to stop because we'd run ___ petrol.", ["out of", "out", "off", "over"], "out of", "Run out of + noun."),
      q("Choose the correct sentence.", ["We sailed across the Pacific.", "We sailed across Pacific.", "We sailed across a Pacific.", "We sailed across the Pacific Ocean the."], "We sailed across the Pacific.", "Oceans take the."),
      q("Complete: I'd like to complain ___ the service.", ["about", "for", "on", "with"], "about", "Complain about."),
      q("Choose the most polite sentence.", ["I'm afraid there's a mistake on the bill.", "The bill is wrong. Fix it.", "You made the bill wrong.", "Bill wrong!"], "I'm afraid there's a mistake on the bill.", "Soften with I'm afraid."),
      q("Complete: I was hungry because I ___ all day.", ["hadn't eaten", "didn't eat", "haven't eaten", "don't eat"], "hadn't eaten", "The earlier reason: past perfect."),
    ],
  }],
  assessment: [
    { id: "pronoun-middle", prompt: "Choose the correct sentence.", options: ["Can you drop me off here?", "Can you drop off me here?", "Can you me drop off here?", "Can you drop me here off?"], correct: "Can you drop me off here?", explanation: "Pronoun in the middle of the phrasal verb." },
    { id: "run-out-of", prompt: "Complete: We've run ___ coffee. Can you buy some?", options: ["out of", "out", "off", "of"], correct: "out of", explanation: "Run out of + noun." },
    { id: "check-out", prompt: "Complete: We have to ___ of the hotel by 11 a.m.", options: ["check out", "check in", "set off", "get off"], correct: "check out", explanation: "Check out = pay and leave." },
    { id: "past-perfect", prompt: "Complete: When I got to the station, the train ___.", options: ["had left", "has left", "leaves", "have left"], correct: "had left", explanation: "The earlier event: had + past participle." },
    { id: "by-the-time", prompt: "Complete: By the time the police arrived, the thief ___.", options: ["had escaped", "escapes", "has escaped", "is escaping"], correct: "had escaped", explanation: "By the time + past perfect for the earlier event." },
    { id: "pp-reason", prompt: "Choose the correct sentence.", options: ["He was nervous because he had never given a speech.", "He was nervous because he never gave a speech.", "He was nervous because he has never given a speech.", "He was nervous because he hadn't never given a speech."], correct: "He was nervous because he had never given a speech.", explanation: "Reason before the past: had + past participle." },
    { id: "no-the-country", prompt: "Complete: My cousin is studying in ___ Canada.", options: ["(no article)", "the", "a", "an"], correct: "(no article)", explanation: "Most countries: no the." },
    { id: "the-uk", prompt: "Complete: She moved to ___ UK last year.", options: ["the", "(no article)", "a", "an"], correct: "the", explanation: "The United Kingdom: the." },
    { id: "the-river", prompt: "Choose the correct sentence.", options: ["Hanoi is on the Red River.", "Hanoi is on Red River.", "Hanoi is on a Red River.", "Hanoi is on the Red the River."], correct: "Hanoi is on the Red River.", explanation: "Rivers take the." },
    { id: "no-the-mountain", prompt: "Complete: We climbed ___ Mount Kinabalu.", options: ["(no article)", "the", "a", "an"], correct: "(no article)", explanation: "Single mountains: no the." },
    { id: "was-delayed", prompt: "“Chuyến tàu bị huỷ.” in English is…", options: ["The train was cancelled.", "The train cancelled.", "The train was cancel.", "The train has cancel."], correct: "The train was cancelled.", explanation: "Was + past participle." },
    { id: "was-stolen", prompt: "Complete: Her purse ___ on the bus.", options: ["was stolen", "was stole", "stolen", "stole"], correct: "was stolen", explanation: "Was + past participle (stolen)." },
    { id: "problem-with", prompt: "Choose the correct sentence.", options: ["There's a problem with the heating.", "The heating has problem.", "Have problem with the heating.", "The heating is problem."], correct: "There's a problem with the heating.", explanation: "There's a problem with…" },
    { id: "complain-about", prompt: "Complete: Lots of people complained ___ the long queues.", options: ["about", "for", "with", "at"], correct: "about", explanation: "Complain about." },
    { id: "polite-request", prompt: "Choose the most polite request.", options: ["Would it be possible to speak to the manager?", "I must speak to the manager.", "Give me the manager.", "Manager, now."], correct: "Would it be possible to speak to the manager?", explanation: "Soft: Would it be possible to…?" },
  ],
};
