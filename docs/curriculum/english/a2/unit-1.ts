// A2 Unit 1: People & Everyday Life. Each lesson fixes one mistake Vietnamese speakers often make at this level:
// a missing "a" before jobs, the missing -s after he/she/it, a bare verb after like, "the house of my brother", and a
// missing "be" before adjectives (Vietnamese "Cô ấy rất cao" has no verb).
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "A2",
  number: 1,
  lessons: [{
    key: "introductions", title: "Nice to Meet You", titleVi: "Rất vui được gặp bạn",
    objectives: [
      "I can introduce myself and others, and say where I am from and what I do.",
      "Use am, is and are with I, you, he, she, we and they",
      "Put a or an before a job: I'm an engineer",
    ],
    vocabulary: [
      { word: "introduce", ipa: "/ˌɪntrəˈdjuːs/", partOfSpeech: "verb", vietnamese: "giới thiệu", definition: "to tell someone another person's name when they first meet", example: { english: "Can I introduce my colleague, Minh?", vietnamese: "Tôi xin giới thiệu đồng nghiệp của tôi, Minh." } },
      { word: "surname", ipa: "/ˈsɜːneɪm/", partOfSpeech: "noun", vietnamese: "họ", definition: "your family name", example: { english: "My surname is Nguyen.", vietnamese: "Họ của tôi là Nguyễn." } },
      { word: "nationality", ipa: "/ˌnæʃəˈnæləti/", partOfSpeech: "noun", vietnamese: "quốc tịch", definition: "the country you legally belong to", example: { english: "What nationality are you? I'm Vietnamese.", vietnamese: "Bạn mang quốc tịch gì? Tôi là người Việt Nam." } },
      { word: "engineer", ipa: "/ˌendʒɪˈnɪə/", partOfSpeech: "noun", vietnamese: "kỹ sư", definition: "a person who designs or builds machines, roads or systems", example: { english: "She's an engineer at a software company.", vietnamese: "Cô ấy là kỹ sư ở một công ty phần mềm." } },
      { word: "colleague", ipa: "/ˈkɒliːɡ/", partOfSpeech: "noun", vietnamese: "đồng nghiệp", definition: "a person you work with", example: { english: "My colleagues are very friendly.", vietnamese: "Các đồng nghiệp của tôi rất thân thiện." } },
      { word: "neighbour", ipa: "/ˈneɪbə/", partOfSpeech: "noun", vietnamese: "hàng xóm", definition: "a person who lives near you", example: { english: "Our neighbours are from Da Nang.", vietnamese: "Hàng xóm của chúng tôi đến từ Đà Nẵng." } },
      { word: "pleased to meet you", ipa: "/ˌpliːzd tə ˈmiːt juː/", partOfSpeech: "phrase", vietnamese: "rất vui được gặp bạn", definition: "a polite thing to say when you meet someone for the first time", example: { english: "Hello, I'm Lan. Pleased to meet you.", vietnamese: "Xin chào, tôi là Lan. Rất vui được gặp bạn." } },
      { word: "originally", ipa: "/əˈrɪdʒənəli/", partOfSpeech: "adverb", vietnamese: "vốn là, gốc là", definition: "at first, before you moved or changed", example: { english: "I live in Hanoi, but I'm originally from Hue.", vietnamese: "Tôi sống ở Hà Nội nhưng quê gốc ở Huế." } },
    ],
    grammar: [{
      title: "Am, is, are",
      pattern: "I am · you / we / they are · he / she / it is",
      explanation: {
        english: "Use be to say who someone is, where they are from and what they do. In speech we usually shorten it: I'm, you're, he's, she's, we're, they're. Questions put be first: Are you a student? Where is he from?",
        vietnamese: "Dùng động từ be để nói ai đó là ai, đến từ đâu và làm nghề gì. Khi nói, ta thường viết tắt: I'm, you're, he's, she's, we're, they're. Câu hỏi đưa be lên đầu: Are you a student? Where is he from?",
      },
      examples: [
        { english: "I'm from Vietnam. My friends are from Japan.", vietnamese: "Tôi đến từ Việt Nam. Các bạn tôi đến từ Nhật Bản." },
        { english: "Where is your colleague from?", vietnamese: "Đồng nghiệp của bạn đến từ đâu?" },
      ],
    }, {
      title: "A or an before a job",
      pattern: "I'm a teacher · She's an engineer",
      explanation: {
        english: "A job after be needs a or an. Use an before a vowel sound (an engineer, an artist) and a before other sounds (a doctor, a nurse). With more than one person, use the plural and no article: They're nurses.",
        vietnamese: "Danh từ chỉ nghề nghiệp sau be cần có a hoặc an. Dùng an trước nguyên âm (an engineer, an artist) và a trước các âm khác (a doctor, a nurse). Khi nói về nhiều người, dùng số nhiều và không có mạo từ: They're nurses.",
      },
      examples: [
        { english: "My brother is a doctor.", vietnamese: "Anh trai tôi là bác sĩ." },
        { english: "Minh and Hoa are students.", vietnamese: "Minh và Hoa là sinh viên." },
      ],
      mistake: {
        wrong: "I am engineer.", right: "I am an engineer.",
        why: { english: "Vietnamese says “Tôi là kỹ sư” with no article, but English needs a or an before one job.", vietnamese: "Tiếng Việt nói “Tôi là kỹ sư” không có mạo từ, nhưng tiếng Anh cần a hoặc an trước danh từ chỉ một nghề." },
      },
    }],
    examples: [
      { english: "Hi, I'm Tuan. I'm a nurse at a hospital in Ho Chi Minh City.", vietnamese: "Chào bạn, tôi là Tuấn. Tôi là y tá ở một bệnh viện tại Thành phố Hồ Chí Minh." },
      { english: "This is my neighbour, Mai. She's an artist.", vietnamese: "Đây là hàng xóm của tôi, Mai. Cô ấy là hoạ sĩ." },
      { english: "Are you originally from Hanoi?", vietnamese: "Bạn có phải gốc Hà Nội không?" },
      { english: "We aren't colleagues. We're old friends.", vietnamese: "Chúng tôi không phải đồng nghiệp. Chúng tôi là bạn cũ." },
    ],
    dialogue: [
      { speaker: "Emma", english: "Hello, I'm Emma. I'm the new manager.", vietnamese: "Xin chào, tôi là Emma. Tôi là quản lý mới." },
      { speaker: "Linh", english: "Pleased to meet you, Emma. I'm Linh. I'm an engineer here.", vietnamese: "Rất vui được gặp chị, Emma. Em là Linh. Em là kỹ sư ở đây." },
      { speaker: "Emma", english: "Nice to meet you, Linh. Are you from Hanoi?", vietnamese: "Rất vui được gặp em, Linh. Em là người Hà Nội à?" },
      { speaker: "Linh", english: "I live here now, but I'm originally from Can Tho.", vietnamese: "Bây giờ em sống ở đây, nhưng quê gốc em ở Cần Thơ." },
    ],
    practice: [
      q("Complete: She ___ an engineer.", ["is", "are", "am", "be"], "is", "Use is with he, she and it."),
      q("Choose the correct sentence.", ["I'm a teacher.", "I'm teacher.", "I a teacher.", "I'm an teacher."], "I'm a teacher.", "A job after be needs a or an; teacher starts with a consonant sound, so a."),
      q("What does “surname” mean?", ["your family name", "your first name", "your nickname", "your job"], "your family name", "Your surname is your family name, like Nguyen or Tran."),
      q("Complete: They ___ my colleagues.", ["are", "is", "am", "be"], "are", "Use are with you, we and they."),
    ],
    challenge: [
      q("Choose: My sister is ___ artist.", ["an", "a", "the", "—"], "an", "Artist starts with a vowel sound, so an."),
      q("Someone says “Pleased to meet you.” What is a natural reply?", ["Nice to meet you too.", "Yes, I am.", "I'm fine, thanks.", "See you later."], "Nice to meet you too.", "Answer a first greeting with Nice to meet you (too)."),
      q("Which question asks about someone's country?", ["What nationality are you?", "What do you do?", "How old are you?", "What's your surname?"], "What nationality are you?", "Nationality is the country you belong to."),
      q("Choose the correct sentence.", ["Minh and Hoa are nurses.", "Minh and Hoa are a nurses.", "Minh and Hoa is nurses.", "Minh and Hoa are nurse."], "Minh and Hoa are nurses.", "Two people: are, a plural job and no article."),
      q("“I live in Hanoi, but I'm ___ from Hue.”", ["originally", "really", "usually", "finally"], "originally", "Originally says where you were from before you moved."),
    ],
  }, {
    key: "daily-routines", title: "My Daily Routine", titleVi: "Thói quen hằng ngày",
    objectives: [
      "I can describe my daily routine and how often I do things.",
      "Add -s or -es to the verb after he, she and it",
      "Put usually, often and never before the main verb",
    ],
    vocabulary: [
      { word: "get up", ipa: "/ˌɡet ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "thức dậy, ra khỏi giường", definition: "to get out of bed in the morning", example: { english: "I get up at half past six.", vietnamese: "Tôi dậy lúc sáu giờ rưỡi." } },
      { word: "commute", ipa: "/kəˈmjuːt/", partOfSpeech: "verb", vietnamese: "đi làm (quãng đường đi lại hằng ngày)", definition: "to travel to and from work every day", example: { english: "He commutes to work by motorbike.", vietnamese: "Anh ấy đi làm bằng xe máy." } },
      { word: "have breakfast", ipa: "/ˌhæv ˈbrekfəst/", partOfSpeech: "collocation", vietnamese: "ăn sáng", definition: "to eat your morning meal", example: { english: "We have breakfast together on Sundays.", vietnamese: "Chúng tôi ăn sáng cùng nhau vào Chủ nhật." } },
      { word: "usually", ipa: "/ˈjuːʒuəli/", partOfSpeech: "adverb", vietnamese: "thường thường", definition: "on most days or in most situations", example: { english: "She usually walks to the office.", vietnamese: "Cô ấy thường đi bộ đến văn phòng." } },
      { word: "rarely", ipa: "/ˈreəli/", partOfSpeech: "adverb", vietnamese: "hiếm khi", definition: "not often", example: { english: "I rarely watch TV in the evening.", vietnamese: "Tôi hiếm khi xem TV vào buổi tối." } },
      { word: "on weekdays", ipa: "/ɒn ˈwiːkdeɪz/", partOfSpeech: "phrase", vietnamese: "vào các ngày trong tuần", definition: "from Monday to Friday", example: { english: "On weekdays I finish work at five.", vietnamese: "Các ngày trong tuần tôi tan làm lúc năm giờ." } },
      { word: "finish work", ipa: "/ˌfɪnɪʃ ˈwɜːk/", partOfSpeech: "collocation", vietnamese: "tan làm", definition: "to stop working at the end of the day", example: { english: "What time does your husband finish work?", vietnamese: "Chồng chị tan làm lúc mấy giờ?" } },
      { word: "go to bed", ipa: "/ˌɡəʊ tə ˈbed/", partOfSpeech: "phrase", vietnamese: "đi ngủ", definition: "to lie down in bed to sleep", example: { english: "The children go to bed at nine.", vietnamese: "Bọn trẻ đi ngủ lúc chín giờ." } },
    ],
    grammar: [{
      title: "He works, she watches",
      pattern: "I / you / we / they work · he / she / it works",
      explanation: {
        english: "In the present simple, add -s to the verb after he, she, it or one person's name. Add -es after -ch, -sh, -s, -x and -o (watches, goes), and change consonant + y to -ies (studies). Have becomes has. Questions and negatives use does / doesn't, and then the verb has no -s: Does she work? She doesn't work.",
        vietnamese: "Ở thì hiện tại đơn, thêm -s vào động từ sau he, she, it hoặc tên một người. Thêm -es sau -ch, -sh, -s, -x và -o (watches, goes), và đổi phụ âm + y thành -ies (studies). Have đổi thành has. Câu hỏi và câu phủ định dùng does / doesn't, khi đó động từ không thêm -s: Does she work? She doesn't work.",
      },
      examples: [
        { english: "My mother gets up at five and goes to the market.", vietnamese: "Mẹ tôi dậy lúc năm giờ và đi chợ." },
        { english: "Does your brother commute by bus? No, he doesn't.", vietnamese: "Anh trai bạn đi làm bằng xe buýt à? Không, anh ấy không đi xe buýt." },
      ],
      mistake: {
        wrong: "She work in a bank.", right: "She works in a bank.",
        why: { english: "Vietnamese verbs never change, so the -s is easy to forget. After he, she and it, say the -s clearly.", vietnamese: "Động từ tiếng Việt không bao giờ thay đổi, nên rất dễ quên -s. Sau he, she và it, hãy phát âm rõ âm -s." },
      },
    }, {
      title: "How often: always, usually, never",
      pattern: "subject + always / usually / often / sometimes / rarely / never + verb",
      explanation: {
        english: "Words for how often go before the main verb (I usually walk), but after be (I'm usually tired). Sometimes can also start the sentence.",
        vietnamese: "Các trạng từ chỉ tần suất đứng trước động từ chính (I usually walk), nhưng đứng sau be (I'm usually tired). Sometimes cũng có thể đứng đầu câu.",
      },
      examples: [
        { english: "I never have breakfast on weekdays.", vietnamese: "Tôi không bao giờ ăn sáng vào các ngày trong tuần." },
        { english: "He's always late on Mondays.", vietnamese: "Anh ấy luôn đến muộn vào thứ Hai." },
      ],
    }],
    examples: [
      { english: "I usually get up at six and have breakfast at home.", vietnamese: "Tôi thường dậy lúc sáu giờ và ăn sáng ở nhà." },
      { english: "My sister studies English every evening.", vietnamese: "Chị gái tôi học tiếng Anh mỗi buổi tối." },
      { english: "He rarely finishes work before seven.", vietnamese: "Anh ấy hiếm khi tan làm trước bảy giờ." },
      { english: "Does she go to bed late? Yes, she does.", vietnamese: "Cô ấy có đi ngủ muộn không? Có." },
    ],
    dialogue: [
      { speaker: "Oliver", english: "What time do you get up on weekdays?", vietnamese: "Các ngày trong tuần bạn dậy lúc mấy giờ?" },
      { speaker: "Huong", english: "At six. I commute for an hour, so I usually have breakfast on the bus.", vietnamese: "Lúc sáu giờ. Mình đi làm mất một tiếng, nên mình thường ăn sáng trên xe buýt." },
      { speaker: "Oliver", english: "That's early! Does your husband get up early too?", vietnamese: "Sớm thật! Chồng bạn cũng dậy sớm à?" },
      { speaker: "Huong", english: "No, he doesn't. He works from home, so he gets up at eight.", vietnamese: "Không. Anh ấy làm việc ở nhà, nên anh ấy dậy lúc tám giờ." },
    ],
    practice: [
      q("Complete: My father ___ to work by car.", ["goes", "go", "gos", "going"], "goes", "After he / she / it, go becomes goes."),
      q("Complete: She ___ English at university.", ["studies", "studys", "study", "studyes"], "studies", "Consonant + y becomes -ies: study → studies."),
      q("Choose the sentence with usually in the right place.", ["I usually walk to work.", "I walk usually to work.", "I walk to usually work.", "I walk to work usually always."], "I usually walk to work.", "How-often words go before the main verb."),
      q("Choose the correct question.", ["Does he finish work at six?", "Does he finishes work at six?", "Do he finish work at six?", "He finish work at six?"], "Does he finish work at six?", "After does, the verb has no -s."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["She has breakfast at seven.", "She have breakfast at seven.", "She haves breakfast at seven.", "She having breakfast at seven."], "She has breakfast at seven.", "Have becomes has after he, she and it."),
      q("Complete: He's ___ tired after work.", ["always", "always is", "is always", "be always"], "always", "After be, the how-often word comes after: He's always tired."),
      q("What does “commute” mean?", ["travel to and from work every day", "work from home", "get up early", "finish work"], "travel to and from work every day", "To commute is to make the daily journey to work and back."),
      q("Choose: My brother ___ watch TV in the morning.", ["doesn't", "don't", "isn't", "not"], "doesn't", "Negatives with he / she / it use doesn't + verb."),
      q("Which sentence is correct?", ["My son watches cartoons every morning.", "My son watch cartoons every morning.", "My son watchs cartoons every morning.", "My son is watch cartoons every morning."], "My son watches cartoons every morning.", "Watch ends in -ch, so it takes -es: watches."),
    ],
  }, {
    key: "likes-and-dislikes", title: "Likes and Dislikes", titleVi: "Sở thích và điều không thích",
    objectives: [
      "I can talk about what I like and don't like doing in my spare time.",
      "Use the -ing form after like, love, enjoy, hate and can't stand",
      "Say what you prefer, and ask others about their hobbies",
    ],
    vocabulary: [
      { word: "enjoy", ipa: "/ɪnˈdʒɔɪ/", partOfSpeech: "verb", vietnamese: "thích, tận hưởng", definition: "to get pleasure from something", example: { english: "I really enjoy cooking for my friends.", vietnamese: "Tôi rất thích nấu ăn cho bạn bè." } },
      { word: "can't stand", ipa: "/ˌkɑːnt ˈstænd/", partOfSpeech: "phrase", vietnamese: "không chịu nổi", definition: "to dislike something very much", example: { english: "She can't stand waiting in traffic.", vietnamese: "Cô ấy không chịu nổi việc chờ tắc đường." } },
      { word: "keen on", ipa: "/ˈkiːn ɒn/", partOfSpeech: "phrase", vietnamese: "say mê, thích", definition: "very interested in something (often used in British English)", example: { english: "My son is keen on football.", vietnamese: "Con trai tôi rất mê bóng đá." } },
      { word: "hobby", ipa: "/ˈhɒbi/", partOfSpeech: "noun", vietnamese: "sở thích", definition: "something you enjoy doing in your free time", example: { english: "Photography is my favourite hobby.", vietnamese: "Chụp ảnh là sở thích tôi yêu nhất." } },
      { word: "spare time", ipa: "/ˌspeə ˈtaɪm/", partOfSpeech: "noun", vietnamese: "thời gian rảnh", definition: "time when you are not working or studying", example: { english: "What do you do in your spare time?", vietnamese: "Bạn làm gì vào thời gian rảnh?" } },
      { word: "go jogging", ipa: "/ˌɡəʊ ˈdʒɒɡɪŋ/", partOfSpeech: "collocation", vietnamese: "chạy bộ", definition: "to run slowly for exercise", example: { english: "We go jogging by the lake every morning.", vietnamese: "Chúng tôi chạy bộ bên hồ mỗi sáng." } },
      { word: "prefer", ipa: "/prɪˈfɜː/", partOfSpeech: "verb", vietnamese: "thích hơn", definition: "to like one thing more than another", example: { english: "I prefer tea to coffee.", vietnamese: "Tôi thích trà hơn cà phê." } },
      { word: "favourite", ipa: "/ˈfeɪvərɪt/", partOfSpeech: "adjective", vietnamese: "yêu thích nhất", definition: "liked more than all the others", example: { english: "Who is your favourite singer?", vietnamese: "Ca sĩ bạn yêu thích nhất là ai?" } },
    ],
    grammar: [{
      title: "Like doing",
      pattern: "like / love / enjoy / hate / can't stand + verb-ing",
      explanation: {
        english: "After like, love, enjoy, hate and can't stand, the next verb takes -ing: I love reading. After enjoy and can't stand, only -ing is correct. With prefer, use to between the two things: I prefer swimming to running.",
        vietnamese: "Sau like, love, enjoy, hate và can't stand, động từ theo sau thêm -ing: I love reading. Sau enjoy và can't stand, chỉ dạng -ing là đúng. Với prefer, dùng to giữa hai thứ: I prefer swimming to running.",
      },
      examples: [
        { english: "They enjoy playing badminton after work.", vietnamese: "Họ thích chơi cầu lông sau giờ làm." },
        { english: "I can't stand getting up early at the weekend.", vietnamese: "Tôi không chịu nổi việc dậy sớm vào cuối tuần." },
      ],
      mistake: {
        wrong: "I like watch films.", right: "I like watching films.",
        why: { english: "In Vietnamese two verbs sit side by side (“thích xem phim”). In English the second verb after like needs -ing.", vietnamese: "Trong tiếng Việt hai động từ đứng cạnh nhau (“thích xem phim”). Trong tiếng Anh, động từ thứ hai sau like cần thêm -ing." },
      },
    }, {
      title: "Asking about likes",
      pattern: "Do you like …? · Yes, I do. / No, I don't. · What do you like doing?",
      explanation: {
        english: "Answer Do you like …? questions with a short answer, not just Yes or No: Yes, I do. / No, I don't. Keen on also takes -ing or a noun: I'm keen on hiking.",
        vietnamese: "Trả lời câu hỏi Do you like …? bằng câu trả lời ngắn, không chỉ Yes hoặc No: Yes, I do. / No, I don't. Keen on cũng đi với -ing hoặc danh từ: I'm keen on hiking.",
      },
      examples: [
        { english: "Do you like karaoke? Yes, I do. I love singing.", vietnamese: "Bạn có thích karaoke không? Có, mình rất thích hát." },
        { english: "What does your sister like doing at the weekend?", vietnamese: "Chị gái bạn thích làm gì vào cuối tuần?" },
      ],
    }],
    examples: [
      { english: "In my spare time I enjoy going jogging and reading.", vietnamese: "Lúc rảnh tôi thích chạy bộ và đọc sách." },
      { english: "My favourite hobby is cooking Vietnamese food.", vietnamese: "Sở thích yêu nhất của tôi là nấu món Việt." },
      { english: "He isn't keen on shopping. He prefers staying at home.", vietnamese: "Anh ấy không thích đi mua sắm. Anh ấy thích ở nhà hơn." },
      { english: "Do you like dancing? No, I don't. I hate it!", vietnamese: "Bạn có thích nhảy không? Không, mình ghét lắm!" },
    ],
    dialogue: [
      { speaker: "Sophie", english: "What do you like doing in your spare time, Khoa?", vietnamese: "Khoa, lúc rảnh bạn thích làm gì?" },
      { speaker: "Khoa", english: "I'm really keen on photography. I love taking photos of old buildings.", vietnamese: "Mình rất mê chụp ảnh. Mình thích chụp những toà nhà cổ." },
      { speaker: "Sophie", english: "Nice! Do you like going jogging too?", vietnamese: "Hay quá! Bạn có thích chạy bộ nữa không?" },
      { speaker: "Khoa", english: "No, I don't. I can't stand running. I prefer swimming.", vietnamese: "Không. Mình không chịu nổi chạy bộ. Mình thích bơi hơn." },
    ],
    practice: [
      q("Complete: I enjoy ___ to music.", ["listening", "listen", "to listen", "listens"], "listening", "Enjoy is followed by verb-ing."),
      q("Choose the correct sentence.", ["She loves dancing.", "She loves dance.", "She love dancing.", "She loving dance."], "She loves dancing.", "Love + -ing, and loves after she."),
      q("“Do you like coffee?” Choose the best short answer.", ["Yes, I do.", "Yes, I like.", "Yes, I am.", "Yes, like."], "Yes, I do.", "Short answers to Do you …? use do / don't."),
      q("What does “spare time” mean?", ["time when you are not working", "a short break at work", "time to get up", "a busy day"], "time when you are not working", "Spare time is free time."),
    ],
    challenge: [
      q("Complete: I prefer tea ___ coffee.", ["to", "than", "from", "of"], "to", "Prefer A to B."),
      q("Choose the correct sentence.", ["He can't stand waiting.", "He can't stand wait.", "He can't stands waiting.", "He can't stand to waiting."], "He can't stand waiting.", "Can't stand + verb-ing, and no -s after can't."),
      q("Which word means “very interested in”?", ["keen on", "tired of", "afraid of", "bored with"], "keen on", "Keen on means very interested in or enthusiastic about."),
      q("Complete: My mother is keen on ___.", ["gardening", "garden", "to garden", "gardens"], "gardening", "Keen on is followed by a noun or verb-ing."),
      q("Choose the British spelling.", ["favourite", "favorite", "favrite", "favourit"], "favourite", "British English writes favourite, with -our-."),
    ],
  }, {
    key: "family", title: "My Family", titleVi: "Gia đình tôi",
    objectives: [
      "I can talk about my family and the people I am close to.",
      "Use have got and has got, as British speakers often do",
      "Show who something belongs to with 's: my brother's flat",
    ],
    vocabulary: [
      { word: "sibling", ipa: "/ˈsɪblɪŋ/", partOfSpeech: "noun", vietnamese: "anh chị em ruột", definition: "a brother or sister", example: { english: "Have you got any siblings?", vietnamese: "Bạn có anh chị em ruột không?" } },
      { word: "only child", ipa: "/ˌəʊnli ˈtʃaɪld/", partOfSpeech: "noun", vietnamese: "con một", definition: "a person with no brothers or sisters", example: { english: "I'm an only child.", vietnamese: "Tôi là con một." } },
      { word: "cousin", ipa: "/ˈkʌzn/", partOfSpeech: "noun", vietnamese: "anh chị em họ", definition: "the child of your aunt or uncle", example: { english: "My cousin lives in Australia.", vietnamese: "Anh họ tôi sống ở Úc." } },
      { word: "grandparents", ipa: "/ˈɡrænpeərənts/", partOfSpeech: "noun", vietnamese: "ông bà", definition: "the parents of your mother or father", example: { english: "We visit our grandparents every Tet.", vietnamese: "Tết nào chúng tôi cũng về thăm ông bà." } },
      { word: "niece", ipa: "/niːs/", partOfSpeech: "noun", vietnamese: "cháu gái (con của anh chị em)", definition: "the daughter of your brother or sister", example: { english: "My niece is starting school this year.", vietnamese: "Cháu gái tôi năm nay bắt đầu đi học." } },
      { word: "get on with", ipa: "/ˌɡet ˈɒn wɪð/", partOfSpeech: "phrasal verb", vietnamese: "hợp tính, hoà thuận với", definition: "to have a friendly relationship with someone", example: { english: "I get on well with my sister.", vietnamese: "Tôi rất hợp với chị gái." } },
      { word: "look after", ipa: "/ˌlʊk ˈɑːftə/", partOfSpeech: "phrasal verb", vietnamese: "chăm sóc", definition: "to take care of someone", example: { english: "My grandmother looks after my son on weekdays.", vietnamese: "Bà tôi trông con trai tôi vào các ngày trong tuần." } },
      { word: "flat", ipa: "/flæt/", partOfSpeech: "noun", vietnamese: "căn hộ", definition: "a set of rooms to live in, on one floor of a building (American: apartment)", example: { english: "My brother's flat is near the river.", vietnamese: "Căn hộ của anh trai tôi ở gần sông." } },
    ],
    grammar: [{
      title: "Have got",
      pattern: "I / you / we / they have got ('ve got) · he / she / it has got ('s got)",
      explanation: {
        english: "British speakers often say have got for family and things you own: I've got two sisters. Questions put have or has first: Have you got any children? Negatives: I haven't got a car. Have and have got mean the same here; only have got changes in questions (Have you got …? not Do you got …?).",
        vietnamese: "Người Anh thường dùng have got khi nói về gia đình và đồ mình sở hữu: I've got two sisters. Câu hỏi đưa have hoặc has lên đầu: Have you got any children? Phủ định: I haven't got a car. Ở đây have và have got cùng nghĩa; chỉ có have got đổi trật tự trong câu hỏi (Have you got …? chứ không phải Do you got …?).",
      },
      examples: [
        { english: "She's got three cousins in Hue.", vietnamese: "Cô ấy có ba người anh chị em họ ở Huế." },
        { english: "Have you got any siblings? No, I haven't. I'm an only child.", vietnamese: "Bạn có anh chị em ruột không? Không, mình là con một." },
      ],
    }, {
      title: "My brother's flat",
      pattern: "owner + 's + thing · parents' (plural owner ending in -s)",
      explanation: {
        english: "To show who something belongs to, add 's to the owner and put the owner first: my sister's car, Nam's phone. With a plural that ends in -s, add only the apostrophe: my parents' house.",
        vietnamese: "Để nói vật gì thuộc về ai, thêm 's vào người sở hữu và đặt người sở hữu lên trước: my sister's car, Nam's phone. Với danh từ số nhiều tận cùng bằng -s, chỉ thêm dấu phẩy trên: my parents' house.",
      },
      examples: [
        { english: "This is my mother's favourite photo.", vietnamese: "Đây là bức ảnh mẹ tôi thích nhất." },
        { english: "My grandparents' house has got a big garden.", vietnamese: "Nhà của ông bà tôi có một khu vườn lớn." },
      ],
      mistake: {
        wrong: "the flat of my brother", right: "my brother's flat",
        why: { english: "Vietnamese puts the owner last (“căn hộ của anh tôi”). For people, English usually puts the owner first with 's.", vietnamese: "Tiếng Việt đặt người sở hữu ở sau (“căn hộ của anh tôi”). Với người, tiếng Anh thường đặt người sở hữu lên trước và thêm 's." },
      },
    }],
    examples: [
      { english: "I've got one brother and two sisters.", vietnamese: "Tôi có một anh trai và hai chị gái." },
      { english: "My niece's name is Bao Anh.", vietnamese: "Tên cháu gái tôi là Bảo Anh." },
      { english: "Has your husband got any siblings?", vietnamese: "Chồng chị có anh chị em ruột không?" },
      { english: "I get on with my cousins, but I rarely see them.", vietnamese: "Tôi hợp với các anh chị em họ, nhưng hiếm khi gặp họ." },
    ],
    dialogue: [
      { speaker: "James", english: "Have you got a big family, Thao?", vietnamese: "Thảo, gia đình bạn có đông không?" },
      { speaker: "Thao", english: "Quite big. I've got two brothers, and my grandparents live with us.", vietnamese: "Khá đông. Mình có hai anh trai, và ông bà sống cùng nhà." },
      { speaker: "James", english: "Do you get on with your brothers?", vietnamese: "Bạn có hợp với các anh không?" },
      { speaker: "Thao", english: "Yes, I do. My older brother's flat is next to my office, so we often have lunch together.", vietnamese: "Có chứ. Căn hộ của anh cả mình ở cạnh văn phòng mình, nên bọn mình hay ăn trưa cùng nhau." },
    ],
    practice: [
      q("Complete: She ___ got two children.", ["has", "have", "is", "does"], "has", "With he / she / it: has got."),
      q("Choose the correct question.", ["Have you got any cousins?", "Do you got any cousins?", "Are you got any cousins?", "Have you any got cousins?"], "Have you got any cousins?", "Have got questions start with Have / Has."),
      q("Choose the natural English.", ["my sister's phone", "the phone of my sister", "my sister phone", "phone my sister's"], "my sister's phone", "For people, put the owner first with 's."),
      q("What is an “only child”?", ["someone with no brothers or sisters", "the youngest child", "a child who lives alone", "the oldest child"], "someone with no brothers or sisters", "An only child has no siblings."),
    ],
    challenge: [
      q("Complete: This is my ___ house. (My parents own it.)", ["parents'", "parent's", "parents's", "parents"], "parents'", "A plural owner ending in -s takes only the apostrophe."),
      q("Choose: I ___ got a car.", ["haven't", "don't", "hasn't", "am not"], "haven't", "The negative of I've got is I haven't got."),
      q("Which phrasal verb means “take care of”?", ["look after", "get on with", "get up", "look for"], "look after", "Look after someone = take care of them."),
      q("The daughter of your brother is your…", ["niece", "nephew", "cousin", "aunt"], "niece", "Your brother's or sister's daughter is your niece."),
      q("Which word is British English for “apartment”?", ["flat", "block", "room", "house"], "flat", "In British English an apartment is usually called a flat."),
    ],
  }, {
    key: "describing-people", title: "Describing People", titleVi: "Miêu tả người",
    objectives: [
      "I can describe what people look like and what they are like.",
      "Never leave out be before an adjective: She is very kind",
      "Tell apart What does she look like? and What is she like?",
    ],
    vocabulary: [
      { word: "curly", ipa: "/ˈkɜːli/", partOfSpeech: "adjective", vietnamese: "xoăn", definition: "with many curves, not straight (about hair)", example: { english: "My daughter has got curly hair.", vietnamese: "Con gái tôi có mái tóc xoăn." } },
      { word: "slim", ipa: "/slɪm/", partOfSpeech: "adjective", vietnamese: "mảnh mai, thon thả", definition: "thin in an attractive way", example: { english: "He's tall and slim.", vietnamese: "Anh ấy cao và mảnh khảnh." } },
      { word: "friendly", ipa: "/ˈfrendli/", partOfSpeech: "adjective", vietnamese: "thân thiện", definition: "kind and pleasant to other people", example: { english: "Our new neighbour is very friendly.", vietnamese: "Người hàng xóm mới của chúng tôi rất thân thiện." } },
      { word: "shy", ipa: "/ʃaɪ/", partOfSpeech: "adjective", vietnamese: "nhút nhát, ngại ngùng", definition: "nervous about talking to people you do not know", example: { english: "She's a bit shy at first.", vietnamese: "Lúc đầu cô ấy hơi ngại." } },
      { word: "generous", ipa: "/ˈdʒenərəs/", partOfSpeech: "adjective", vietnamese: "hào phóng", definition: "happy to give money, time or help to others", example: { english: "My uncle is very generous with his time.", vietnamese: "Chú tôi rất sẵn lòng dành thời gian cho người khác." } },
      { word: "hard-working", ipa: "/ˌhɑːdˈwɜːkɪŋ/", partOfSpeech: "adjective", vietnamese: "chăm chỉ", definition: "putting a lot of effort into your work", example: { english: "The students in this class are hard-working.", vietnamese: "Sinh viên lớp này rất chăm chỉ." } },
      { word: "in her twenties", ipa: "/ɪn hɜː ˈtwentiz/", partOfSpeech: "phrase", vietnamese: "ở độ tuổi hai mươi", definition: "between 20 and 29 years old", example: { english: "Our teacher is in her twenties.", vietnamese: "Cô giáo của chúng tôi khoảng hai mươi mấy tuổi." } },
      { word: "look like", ipa: "/ˈlʊk laɪk/", partOfSpeech: "phrasal verb", vietnamese: "trông giống, có ngoại hình như", definition: "to have a similar appearance to someone", example: { english: "You look like your father.", vietnamese: "Bạn trông giống bố bạn." } },
    ],
    grammar: [{
      title: "Be + adjective",
      pattern: "subject + am / is / are + (very / quite / a bit) + adjective",
      explanation: {
        english: "An adjective after the subject always needs be: She is tall. They are friendly. Very, quite and a bit go between be and the adjective. Before a noun there is no be: a tall woman, friendly neighbours.",
        vietnamese: "Tính từ đứng sau chủ ngữ luôn cần động từ be: She is tall. They are friendly. Very, quite và a bit đứng giữa be và tính từ. Khi tính từ đứng trước danh từ thì không có be: a tall woman, friendly neighbours.",
      },
      examples: [
        { english: "My grandfather is quite shy, but he's very generous.", vietnamese: "Ông tôi khá nhút nhát, nhưng ông rất hào phóng." },
        { english: "She's a hard-working nurse.", vietnamese: "Cô ấy là một y tá chăm chỉ." },
      ],
      mistake: {
        wrong: "She very kind.", right: "She is very kind.",
        why: { english: "Vietnamese says “Cô ấy rất tốt” with no verb. English needs is, am or are before an adjective.", vietnamese: "Tiếng Việt nói “Cô ấy rất tốt” mà không cần động từ. Tiếng Anh cần is, am hoặc are trước tính từ." },
      },
    }, {
      title: "Looks or character?",
      pattern: "What does she look like? (appearance) · What is she like? (character)",
      explanation: {
        english: "What does he look like? asks about appearance: He's tall with short hair. What is he like? asks about character: He's friendly and funny. Use have got for hair and eyes: She's got long, curly hair.",
        vietnamese: "What does he look like? hỏi về ngoại hình: He's tall with short hair. What is he like? hỏi về tính cách: He's friendly and funny. Dùng have got khi nói về tóc và mắt: She's got long, curly hair.",
      },
      examples: [
        { english: "What does your cousin look like? She's slim and she's got curly hair.", vietnamese: "Chị họ bạn trông thế nào? Chị ấy mảnh mai và tóc xoăn." },
        { english: "What is your boss like? He's very hard-working.", vietnamese: "Sếp bạn là người thế nào? Anh ấy rất chăm chỉ." },
      ],
    }],
    examples: [
      { english: "My best friend is in her twenties. She's tall and slim.", vietnamese: "Bạn thân tôi khoảng hai mươi mấy tuổi. Cô ấy cao và mảnh mai." },
      { english: "Our neighbours are friendly, but their son is a bit shy.", vietnamese: "Hàng xóm của chúng tôi thân thiện, nhưng con trai họ hơi nhút nhát." },
      { english: "Everyone says I look like my mother.", vietnamese: "Ai cũng nói tôi trông giống mẹ." },
      { english: "Is your manager generous? Yes, she is.", vietnamese: "Quản lý của bạn có hào phóng không? Có." },
    ],
    dialogue: [
      { speaker: "Grace", english: "Who's picking you up from the airport?", vietnamese: "Ai sẽ đón bạn ở sân bay?" },
      { speaker: "Duc", english: "My cousin, Vy. You can't miss her. She's got long, curly hair.", vietnamese: "Chị họ mình, Vy. Bạn không thể nhầm được. Chị ấy có mái tóc dài và xoăn." },
      { speaker: "Grace", english: "And what's she like?", vietnamese: "Thế chị ấy là người thế nào?" },
      { speaker: "Duc", english: "She's really friendly and generous. You'll like her.", vietnamese: "Chị ấy rất thân thiện và hào phóng. Bạn sẽ quý chị ấy." },
    ],
    practice: [
      q("Choose the correct sentence.", ["My teacher is very friendly.", "My teacher very friendly.", "My teacher friendly very.", "My teacher are very friendly."], "My teacher is very friendly.", "Be + very + adjective."),
      q("“What is he like?” asks about his…", ["character", "appearance", "job", "age"], "character", "What is he like? = what kind of person is he."),
      q("Complete: She's ___ long, curly hair.", ["got", "have", "with", "has"], "got", "She's got = she has got."),
      q("What does “shy” mean?", ["nervous about talking to new people", "very friendly", "always tired", "very clever"], "nervous about talking to new people", "A shy person feels nervous with people they don't know."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["They are hard-working.", "They hard-working.", "They is hard-working.", "They are hard-workings."], "They are hard-working.", "They + are + adjective; adjectives never take -s."),
      q("“What does your sister look like?” Choose the best answer.", ["She's tall with short hair.", "She's very generous.", "She likes reading.", "She's a doctor."], "She's tall with short hair.", "Look like asks about appearance."),
      q("A person who is 25 is…", ["in his twenties", "in his twenty", "on his twenties", "at his twenties"], "in his twenties", "Say in + his / her + twenties, thirties…"),
      q("Choose the correct phrase.", ["a friendly neighbour", "a neighbour friendly", "a is friendly neighbour", "a neighbour is friendly one"], "a friendly neighbour", "Before a noun, the adjective comes first and there is no be."),
      q("Which word means “happy to give to others”?", ["generous", "shy", "slim", "curly"], "generous", "A generous person gives money, time or help freely."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 1", isReview: true,
    objectives: [
      "I can introduce people, describe routines, likes, family and people without the usual mistakes.",
      "Check a / an with jobs, -s after he / she / it, -ing after like, 's and be + adjective",
    ],
    vocabulary: [
      { word: "colleague", ipa: "/ˈkɒliːɡ/", partOfSpeech: "noun", vietnamese: "đồng nghiệp", definition: "a person you work with", example: { english: "Her colleague is an engineer.", vietnamese: "Đồng nghiệp của cô ấy là kỹ sư." } },
      { word: "commute", ipa: "/kəˈmjuːt/", partOfSpeech: "verb", vietnamese: "đi làm (quãng đường đi lại hằng ngày)", definition: "to travel to and from work every day", example: { english: "She commutes for an hour every day.", vietnamese: "Cô ấy mất một tiếng đi làm mỗi ngày." } },
      { word: "can't stand", ipa: "/ˌkɑːnt ˈstænd/", partOfSpeech: "phrase", vietnamese: "không chịu nổi", definition: "to dislike something very much", example: { english: "I can't stand cold weather.", vietnamese: "Tôi không chịu nổi thời tiết lạnh." } },
      { word: "get on with", ipa: "/ˌɡet ˈɒn wɪð/", partOfSpeech: "phrasal verb", vietnamese: "hợp tính, hoà thuận với", definition: "to have a friendly relationship with someone", example: { english: "Do you get on with your neighbours?", vietnamese: "Bạn có hoà thuận với hàng xóm không?" } },
      { word: "generous", ipa: "/ˈdʒenərəs/", partOfSpeech: "adjective", vietnamese: "hào phóng", definition: "happy to give money, time or help to others", example: { english: "My grandparents are very generous.", vietnamese: "Ông bà tôi rất hào phóng." } },
      { word: "favourite", ipa: "/ˈfeɪvərɪt/", partOfSpeech: "adjective", vietnamese: "yêu thích nhất", definition: "liked more than all the others", example: { english: "What's your favourite hobby?", vietnamese: "Sở thích bạn yêu nhất là gì?" } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "an engineer · she works · like reading · my brother's flat · she is kind",
      explanation: {
        english: "Before you speak or write, check these: a or an before one job; -s on the verb after he, she and it; -ing after like, love, enjoy and can't stand; the owner first with 's; and be before an adjective.",
        vietnamese: "Trước khi nói hoặc viết, hãy kiểm tra: a hoặc an trước một nghề; -s ở động từ sau he, she và it; -ing sau like, love, enjoy và can't stand; người sở hữu đứng trước với 's; và be trước tính từ.",
      },
      examples: [
        { english: "My sister's an engineer. She works in Da Nang and she enjoys surfing.", vietnamese: "Chị gái tôi là kỹ sư. Chị ấy làm việc ở Đà Nẵng và thích lướt sóng." },
        { english: "My brother's wife is very friendly.", vietnamese: "Vợ của anh trai tôi rất thân thiện." },
      ],
    }],
    examples: [
      { english: "This is my colleague, Phuong. She's a designer and she's very hard-working.", vietnamese: "Đây là đồng nghiệp của tôi, Phương. Cô ấy là nhà thiết kế và rất chăm chỉ." },
      { english: "He usually commutes by bus, but he can't stand the traffic.", vietnamese: "Anh ấy thường đi làm bằng xe buýt, nhưng không chịu nổi cảnh tắc đường." },
      { english: "I've got two cousins and I get on well with both of them.", vietnamese: "Tôi có hai người anh chị em họ và tôi hợp với cả hai." },
    ],
    dialogue: [
      { speaker: "Ben", english: "Tell me about your best friend.", vietnamese: "Kể cho mình nghe về bạn thân của bạn đi." },
      { speaker: "Ngoc", english: "Her name's Ha. She's a nurse and she works at night.", vietnamese: "Tên cô ấy là Hà. Cô ấy là y tá và làm ca đêm." },
      { speaker: "Ben", english: "What's she like?", vietnamese: "Cô ấy là người thế nào?" },
      { speaker: "Ngoc", english: "She's very generous, and she loves cooking. Her favourite dish is bún chả.", vietnamese: "Cô ấy rất hào phóng và rất thích nấu ăn. Món cô ấy thích nhất là bún chả." },
    ],
    practice: [
      q("Find the correct sentence.", ["He's a doctor and he works at night.", "He's doctor and he work at night.", "He a doctor and works at night.", "He's a doctor and he working at night."], "He's a doctor and he works at night.", "a + job, and -s after he."),
      q("Complete: We enjoy ___ by the lake.", ["walking", "walk", "to walk", "walks"], "walking", "Enjoy + verb-ing."),
      q("Choose the natural English.", ["my friend's flat", "the flat of my friend", "my friend flat", "flat's my friend"], "my friend's flat", "Owner first with 's."),
      q("Choose the correct sentence.", ["Our neighbours are very friendly.", "Our neighbours very friendly.", "Our neighbours is very friendly.", "Our neighbours are very friendlys."], "Our neighbours are very friendly.", "Plural subject + are + adjective."),
    ],
    challenge: [
      q("Choose the correct question.", ["Does your sister get on with her colleagues?", "Do your sister get on with her colleagues?", "Does your sister gets on with her colleagues?", "Is your sister get on with her colleagues?"], "Does your sister get on with her colleagues?", "Does + subject + verb without -s."),
      q("Complete: My uncle ___ very generous.", ["is", "are", "has", "does"], "is", "Be before an adjective: my uncle is."),
      q("Complete: She's ___ only child.", ["an", "a", "the", "—"], "an", "Only starts with a vowel sound, so an."),
      q("Choose the sentence with the right spelling for British English.", ["My favourite colour is blue.", "My favorite color is blue.", "My favourite color is blue.", "My favorite colour is blue."], "My favourite colour is blue.", "British English: favourite, colour."),
      q("Which sentence asks about character?", ["What's your boss like?", "What does your boss look like?", "Where is your boss from?", "What does your boss do?"], "What's your boss like?", "What is … like? asks about character."),
    ],
  }],
  assessment: [
    { id: "job-article", prompt: "Choose the correct sentence.", options: ["My mother is a teacher.", "My mother is teacher.", "My mother teacher.", "My mother is an teacher."], correct: "My mother is a teacher.", explanation: "One job after be needs a or an." },
    { id: "an-engineer", prompt: "Complete: He's ___ engineer.", options: ["an", "a", "the", "—"], correct: "an", explanation: "Engineer starts with a vowel sound, so an." },
    { id: "be-plural", prompt: "Complete: Lan and Huy ___ my colleagues.", options: ["are", "is", "am", "be"], correct: "are", explanation: "Two people: are." },
    { id: "third-person-s", prompt: "Choose the correct sentence.", options: ["She lives near the river.", "She live near the river.", "She living near the river.", "She is live near the river."], correct: "She lives near the river.", explanation: "Add -s after he / she / it." },
    { id: "es-ending", prompt: "Complete: My son ___ TV after school.", options: ["watches", "watchs", "watch", "watching"], correct: "watches", explanation: "Watch ends in -ch, so it takes -es." },
    { id: "does-question", prompt: "Choose the correct question.", options: ["Does he commute by train?", "Does he commutes by train?", "Do he commute by train?", "Is he commute by train?"], correct: "Does he commute by train?", explanation: "Does + verb without -s." },
    { id: "frequency-position", prompt: "Choose the correct sentence.", options: ["I rarely have breakfast.", "I have rarely breakfast.", "Rarely I have breakfast rarely.", "I have breakfast rarely always."], correct: "I rarely have breakfast.", explanation: "How-often words go before the main verb." },
    { id: "like-ing", prompt: "Complete: They love ___ karaoke.", options: ["singing", "sing", "sings", "to singing"], correct: "singing", explanation: "Love + verb-ing." },
    { id: "prefer-to", prompt: "Complete: I prefer swimming ___ running.", options: ["to", "than", "from", "with"], correct: "to", explanation: "Prefer A to B." },
    { id: "short-answer", prompt: "“Do you like shopping?” Choose the best answer.", options: ["No, I don't.", "No, I not.", "No, I'm not like.", "No, don't."], correct: "No, I don't.", explanation: "Short answers to Do you …? use do / don't." },
    { id: "have-got-question", prompt: "Choose the correct question.", options: ["Have you got any siblings?", "Do you got any siblings?", "Are you got any siblings?", "Got you any siblings?"], correct: "Have you got any siblings?", explanation: "Have got questions start with Have / Has." },
    { id: "possessive", prompt: "Choose the natural English.", options: ["my cousin's car", "the car of my cousin", "my cousin car", "car my cousin's"], correct: "my cousin's car", explanation: "Owner first with 's." },
    { id: "plural-possessive", prompt: "Complete: Both my ___ jobs are in Hanoi. (I have two sisters.)", options: ["sisters'", "sister's", "sisters's", "sisters"], correct: "sisters'", explanation: "A plural owner ending in -s takes only the apostrophe." },
    { id: "be-adjective", prompt: "Choose the correct sentence.", options: ["My grandmother is very kind.", "My grandmother very kind.", "My grandmother kind very.", "My grandmother does very kind."], correct: "My grandmother is very kind.", explanation: "Be before an adjective." },
    { id: "look-like", prompt: "“What does your brother look like?” Choose the best answer.", options: ["He's tall and slim.", "He's very hard-working.", "He enjoys football.", "He's an engineer."], correct: "He's tall and slim.", explanation: "Look like asks about appearance." },
  ],
};
