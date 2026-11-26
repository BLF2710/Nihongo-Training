// B2 Unit 3: Technology & Science. Vietnamese "đi sửa xe" hides who does the work, so learners say "I repaired my
// phone at the shop" or "I had repaired my car" instead of "I had my car repaired"; "người ta nói rằng" becomes
// "People are said that…"; phrasal verbs and nouns get mixed ("I need to backup my files"); remember to / remember
// -ing are swapped; word families are guessed ("an important discover", "a success experiment"); and "due to" takes a
// clause ("Due to it was raining"). This unit puts those right for services, science and debate.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B2",
  number: 3,
  lessons: [{
    key: "have-something-done", title: "I Had My Phone Repaired", titleVi: "Thể sai khiến",
    objectives: [
      "I can talk about services that other people do for me.",
      "Use have + object + past participle when someone else does the job",
      "Use get something done informally, and have something stolen for bad experiences",
    ],
    vocabulary: [
      { word: "repair", ipa: "/rɪˈpeə/", partOfSpeech: "verb", vietnamese: "sửa chữa", definition: "to fix something that is broken", example: { english: "How much will it cost to repair the screen?", vietnamese: "Sửa màn hình hết bao nhiêu tiền?" } },
      { word: "install", ipa: "/ɪnˈstɔːl/", partOfSpeech: "verb", vietnamese: "lắp đặt, cài đặt", definition: "to put equipment or software in place so it can be used", example: { english: "We're having solar panels installed next week.", vietnamese: "Tuần sau chúng tôi sẽ cho lắp tấm pin mặt trời." } },
      { word: "cracked", ipa: "/krækt/", partOfSpeech: "adjective", vietnamese: "bị nứt", definition: "broken with thin lines on the surface", example: { english: "I dropped my phone and now the screen is cracked.", vietnamese: "Tôi làm rơi điện thoại và giờ màn hình bị nứt." } },
      { word: "warranty", ipa: "/ˈwɒrənti/", partOfSpeech: "noun", vietnamese: "bảo hành", definition: "a promise to repair a product free for a time", example: { english: "Is the laptop still under warranty?", vietnamese: "Máy tính xách tay còn bảo hành không?" } },
      { word: "technician", ipa: "/tekˈnɪʃn/", partOfSpeech: "noun", vietnamese: "kỹ thuật viên", definition: "a person whose job is to fix or look after machines", example: { english: "A technician came to fix the internet.", vietnamese: "Một kỹ thuật viên đến sửa mạng." } },
      { word: "upgrade", ipa: "/ˌʌpˈɡreɪd/", partOfSpeech: "verb", vietnamese: "nâng cấp", definition: "to change something for a newer or better version", example: { english: "I had my computer's memory upgraded.", vietnamese: "Tôi đã cho nâng cấp bộ nhớ máy tính." } },
      { word: "replace", ipa: "/rɪˈpleɪs/", partOfSpeech: "verb", vietnamese: "thay thế", definition: "to put a new thing in the place of an old one", example: { english: "The battery needs to be replaced.", vietnamese: "Pin cần được thay." } },
      { word: "service", ipa: "/ˈsɜːvɪs/", partOfSpeech: "verb", vietnamese: "bảo dưỡng", definition: "to check and repair a car or machine regularly", example: { english: "You should get your motorbike serviced every six months.", vietnamese: "Bạn nên mang xe máy đi bảo dưỡng sáu tháng một lần." } },
    ],
    grammar: [{
      title: "Have something done",
      pattern: "have + object + past participle (someone else does it for you) · I repaired it (I did it myself)",
      explanation: {
        english: "When you pay or ask someone else to do a job, use have + the object + the past participle: I had my phone repaired. We're having the kitchen painted. Compare: I repaired my phone means you did it yourself. Vietnamese “đi sửa điện thoại” doesn't say who does the work, but English does. The tense goes on have.",
        vietnamese: "Khi bạn trả tiền hoặc nhờ người khác làm việc gì, dùng have + tân ngữ + quá khứ phân từ: I had my phone repaired. We're having the kitchen painted. So sánh: I repaired my phone nghĩa là bạn tự sửa. “Đi sửa điện thoại” trong tiếng Việt không nói ai làm, nhưng tiếng Anh thì có. Thì được chia ở động từ have.",
      },
      examples: [
        { english: "I'm having my hair cut this afternoon.", vietnamese: "Chiều nay tôi đi cắt tóc." },
        { english: "Have you had the air conditioning serviced?", vietnamese: "Bạn đã cho bảo dưỡng điều hoà chưa?" },
      ],
      mistake: {
        wrong: "I had repaired my car at the garage.", right: "I had my car repaired at the garage.",
        why: { english: "The object goes between have and the past participle.", vietnamese: "Tân ngữ đứng giữa have và quá khứ phân từ." },
      },
    }, {
      title: "Get something done, have something stolen",
      pattern: "get + object + past participle (informal) · have / get + object + past participle (something bad happened to you)",
      explanation: {
        english: "In everyday speech, get works like have: I need to get my screen replaced. The same pattern describes bad things other people did to you: I had my bag stolen on the bus. She had her account hacked. The subject didn't want it or do it; it just happened to them.",
        vietnamese: "Trong văn nói hằng ngày, get dùng giống have: I need to get my screen replaced. Cấu trúc này cũng dùng để kể điều xấu người khác gây ra cho bạn: I had my bag stolen on the bus. She had her account hacked. Chủ ngữ không muốn và không làm việc đó; nó chỉ xảy ra với họ.",
      },
      examples: [
        { english: "Where can I get my laptop fixed?", vietnamese: "Tôi có thể sửa máy tính xách tay ở đâu?" },
        { english: "He had his phone stolen at the market.", vietnamese: "Anh ấy bị trộm điện thoại ở chợ." },
      ],
      mistake: {
        wrong: "I was stolen my wallet.", right: "I had my wallet stolen.",
        why: { english: "The wallet was stolen, not you. Use have + object + past participle.", vietnamese: "Cái ví bị lấy cắp, không phải bạn. Dùng have + tân ngữ + quá khứ phân từ." },
      },
    }],
    examples: [
      { english: "My screen was cracked, so I had it replaced.", vietnamese: "Màn hình tôi bị nứt, nên tôi đã cho thay." },
      { english: "It's still under warranty, so the repair is free.", vietnamese: "Máy vẫn còn bảo hành, nên sửa miễn phí." },
      { english: "We're having a new router installed by a technician.", vietnamese: "Chúng tôi đang cho kỹ thuật viên lắp bộ định tuyến mới." },
      { english: "I should get my old laptop upgraded instead of buying a new one.", vietnamese: "Tôi nên nâng cấp máy cũ thay vì mua máy mới." },
    ],
    dialogue: [
      { speaker: "Jess", english: "What happened to your phone?", vietnamese: "Điện thoại bạn bị sao thế?" },
      { speaker: "Nam", english: "I dropped it. The screen's cracked.", vietnamese: "Mình làm rơi. Màn hình bị nứt rồi." },
      { speaker: "Jess", english: "Are you going to repair it yourself?", vietnamese: "Bạn định tự sửa à?" },
      { speaker: "Nam", english: "No way! I'm having it repaired at the shop on Hang Bai Street.", vietnamese: "Không đời nào! Mình mang ra cửa hàng ở phố Hàng Bài sửa." },
      { speaker: "Jess", english: "Isn't it under warranty?", vietnamese: "Không còn bảo hành à?" },
      { speaker: "Nam", english: "Not for accidents. Last year I had my bike stolen, and now this!", vietnamese: "Bảo hành không tính tai nạn. Năm ngoái mình bị trộm xe đạp, giờ lại thế này!" },
    ],
    practice: [
      q("Complete: I ___ my hair cut yesterday.", ["had", "did", "made", "was"], "had", "Have + object + past participle."),
      q("Choose the correct sentence.", ["We had the house painted.", "We had painted the house by a painter.", "We painted the house by someone.", "We had the house paint."], "We had the house painted.", "Object between have and past participle."),
      q("Complete: She had her purse ___ on the train.", ["stolen", "steal", "stole", "stealing"], "stolen", "Past participle."),
      q("“Bảo hành” in English is…", ["warranty", "warrant", "guarantee card time", "insurance"], "warranty", "Warranty = free repair promise."),
    ],
    challenge: [
      q("Complete: I need to get my car ___.", ["serviced", "service", "servicing", "to service"], "serviced", "Get + object + past participle."),
      q("Complete: We're ___ a new boiler installed next week.", ["having", "making", "doing", "getting to"], "having", "Present continuous of have."),
      q("Which sentence means someone else did the work?", ["I had my bike fixed.", "I fixed my bike.", "I was fixing my bike.", "I've fixed my bike."], "I had my bike fixed.", "Have something done."),
      q("Choose the correct sentence.", ["He had his account hacked.", "He was hacked his account.", "He hacked his account by someone.", "He had hacked his account."], "He had his account hacked.", "Bad experience: have + object + past participle."),
      q("Complete: The battery is old. It needs to be ___.", ["replaced", "repeated", "removed off", "replied"], "replaced", "Replace = put a new one in."),
    ],
  }, {
    key: "impersonal-passive", title: "It Is Believed That…", titleVi: "Bị động khách quan",
    objectives: [
      "I can report what people generally say or believe, as in science and the news.",
      "Use It is said / believed / thought that + clause",
      "Use subject + is believed + to be / to have + past participle",
    ],
    vocabulary: [
      { word: "scientist", ipa: "/ˈsaɪəntɪst/", partOfSpeech: "noun", vietnamese: "nhà khoa học", definition: "a person who studies science", example: { english: "Scientists have found water on the planet.", vietnamese: "Các nhà khoa học đã tìm thấy nước trên hành tinh này." } },
      { word: "theory", ipa: "/ˈθɪəri/", partOfSpeech: "noun", vietnamese: "giả thuyết, lý thuyết", definition: "an idea that tries to explain something", example: { english: "There are many theories about how the universe began.", vietnamese: "Có nhiều giả thuyết về sự khởi đầu của vũ trụ." } },
      { word: "experiment", ipa: "/ɪkˈsperɪmənt/", partOfSpeech: "noun", vietnamese: "thí nghiệm", definition: "a scientific test to find out something", example: { english: "The students did an experiment with plants and light.", vietnamese: "Học sinh làm thí nghiệm với cây và ánh sáng." } },
      { word: "estimate", ipa: "/ˈestɪmeɪt/", partOfSpeech: "verb", vietnamese: "ước tính", definition: "to guess a number or amount carefully", example: { english: "It is estimated that 2 billion people use the app.", vietnamese: "Ước tính có 2 tỷ người dùng ứng dụng này." } },
      { word: "prove", ipa: "/pruːv/", partOfSpeech: "verb", vietnamese: "chứng minh", definition: "to show that something is true", example: { english: "Nobody has proved that the drug works.", vietnamese: "Chưa ai chứng minh được loại thuốc đó có tác dụng." } },
      { word: "species", ipa: "/ˈspiːʃiːz/", partOfSpeech: "noun", vietnamese: "loài", definition: "a group of animals or plants of the same kind (same form for plural)", example: { english: "A new species of frog was found in Vietnam.", vietnamese: "Một loài ếch mới được phát hiện ở Việt Nam." } },
      { word: "widely", ipa: "/ˈwaɪdli/", partOfSpeech: "adverb", vietnamese: "rộng rãi", definition: "by many people or in many places", example: { english: "It is widely believed that green tea is healthy.", vietnamese: "Nhiều người tin rằng trà xanh tốt cho sức khoẻ." } },
      { word: "extinct", ipa: "/ɪkˈstɪŋkt/", partOfSpeech: "adjective", vietnamese: "tuyệt chủng", definition: "no longer existing", example: { english: "The Javan rhino is thought to be extinct in Vietnam.", vietnamese: "Tê giác Java được cho là đã tuyệt chủng ở Việt Nam." } },
    ],
    grammar: [{
      title: "It is said that…",
      pattern: "It is said / believed / thought / estimated / known + that + clause",
      explanation: {
        english: "To report a general belief without saying who holds it, use It + passive reporting verb + that: It is believed that the temple is 1,000 years old. It was thought that the Earth was flat. This is common in science writing and the news. Vietnamese “người ta nói rằng” is It is said that, not People are said that.",
        vietnamese: "Để thuật lại một niềm tin chung mà không nói ai tin, dùng It + động từ tường thuật ở bị động + that: It is believed that the temple is 1,000 years old. It was thought that the Earth was flat. Cách này phổ biến trong văn khoa học và tin tức. “Người ta nói rằng” là It is said that, không phải People are said that.",
      },
      examples: [
        { english: "It is estimated that the city has 8 million motorbikes.", vietnamese: "Ước tính thành phố có 8 triệu xe máy." },
        { english: "It is widely known that sugar is bad for your teeth.", vietnamese: "Ai cũng biết đường có hại cho răng." },
      ],
      mistake: {
        wrong: "People are said that coffee helps you think.", right: "It is said that coffee helps you think.",
        why: { english: "Use It is said that. People are said that is not English.", vietnamese: "Dùng It is said that. People are said that không đúng ngữ pháp." },
      },
    }, {
      title: "He is believed to…",
      pattern: "subject + is said / believed / thought + to + verb (now) · + to have + past participle (earlier)",
      explanation: {
        english: "You can also start with the person or thing: The temple is believed to be 1,000 years old. For something that happened earlier than the believing, use to have + past participle: The ship is thought to have sunk in 1890. The singer is said to have left the band.",
        vietnamese: "Bạn cũng có thể bắt đầu bằng người hoặc vật: The temple is believed to be 1,000 years old. Với việc xảy ra trước thời điểm tin, dùng to have + quá khứ phân từ: The ship is thought to have sunk in 1890. The singer is said to have left the band.",
      },
      examples: [
        { english: "The animal is thought to be extinct.", vietnamese: "Loài vật này được cho là đã tuyệt chủng." },
        { english: "The thieves are believed to have escaped by boat.", vietnamese: "Những tên trộm được cho là đã trốn thoát bằng thuyền." },
      ],
      mistake: {
        wrong: "The ship is believed to sink in 1912.", right: "The ship is believed to have sunk in 1912.",
        why: { english: "For an earlier event, use to have + past participle.", vietnamese: "Với sự việc xảy ra trước, dùng to have + quá khứ phân từ." },
      },
    }],
    examples: [
      { english: "It is estimated that a million species are in danger.", vietnamese: "Ước tính một triệu loài đang gặp nguy hiểm." },
      { english: "Scientists did an experiment to prove the theory.", vietnamese: "Các nhà khoa học làm thí nghiệm để chứng minh giả thuyết." },
      { english: "Dinosaurs are thought to have become extinct 66 million years ago.", vietnamese: "Khủng long được cho là đã tuyệt chủng cách đây 66 triệu năm." },
      { english: "The theory is widely accepted, but it hasn't been proved.", vietnamese: "Giả thuyết được chấp nhận rộng rãi, nhưng chưa được chứng minh." },
    ],
    dialogue: [
      { speaker: "Presenter", english: "Today we're in Phong Nha, home to one of the world's largest caves.", vietnamese: "Hôm nay chúng tôi ở Phong Nha, nơi có một trong những hang động lớn nhất thế giới." },
      { speaker: "Guide", english: "Yes. The cave is thought to be around three million years old.", vietnamese: "Đúng vậy. Hang được cho là khoảng ba triệu năm tuổi." },
      { speaker: "Presenter", english: "And it was only explored recently, wasn't it?", vietnamese: "Và nó chỉ mới được khám phá gần đây, đúng không?" },
      { speaker: "Guide", english: "That's right. A local man is said to have found the entrance in 1990.", vietnamese: "Đúng thế. Một người dân địa phương được cho là đã tìm thấy cửa hang năm 1990." },
      { speaker: "Presenter", english: "Are there animals living inside?", vietnamese: "Có động vật sống bên trong không?" },
      { speaker: "Guide", english: "Yes. It is believed that several species live nowhere else on Earth.", vietnamese: "Có. Người ta tin rằng một số loài chỉ sống ở đây." },
    ],
    practice: [
      q("Complete: It ___ that the castle is haunted.", ["is said", "says", "is saying", "said"], "is said", "It is said that…"),
      q("Complete: The bridge is believed ___ 500 years old.", ["to be", "being", "be", "that is"], "to be", "Subject + is believed to be."),
      q("Complete: It is ___ that 40% of people work from home.", ["estimated", "estimating", "estimate", "estimation"], "estimated", "It is estimated that."),
      q("“Tuyệt chủng” in English is…", ["extinct", "extinction animal", "distinct", "finished out"], "extinct", "Extinct = no longer existing."),
    ],
    challenge: [
      q("Complete: The painting is thought ___ in the 1600s.", ["to have been painted", "to be painted", "to paint", "painting"], "to have been painted", "Earlier event: to have + past participle."),
      q("Choose the correct sentence.", ["It is said that he is very rich.", "People are said that he is very rich.", "He is said that he is very rich.", "It says that he is very rich by people."], "It is said that he is very rich.", "It is said that…"),
      q("Complete: The suspect is believed to ___ the country.", ["have left", "leave", "left", "be leave"], "have left", "Earlier: to have + past participle."),
      q("The plural of “species” is…", ["species", "specieses", "specie", "speciess"], "species", "Same form."),
      q("What does “prove” mean?", ["to show that something is true", "to guess", "to hope", "to forget"], "to show that something is true", "Prove = show it's true."),
    ],
  }, {
    key: "tech-phrasal-verbs", title: "Back It Up", titleVi: "Cụm động từ về công nghệ",
    objectives: [
      "I can talk about using phones, computers and apps.",
      "Tell phrasal verbs (back up) from their nouns (a backup)",
      "Use remember, forget and stop with to + verb or -ing correctly",
    ],
    vocabulary: [
      { word: "back up", ipa: "/ˌbæk ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "sao lưu", definition: "to make a copy of files in case the originals are lost", example: { english: "Back up your photos before you update your phone.", vietnamese: "Hãy sao lưu ảnh trước khi cập nhật điện thoại." } },
      { word: "log in", ipa: "/ˌlɒɡ ˈɪn/", partOfSpeech: "phrasal verb", vietnamese: "đăng nhập", definition: "to enter your name and password to use a system", example: { english: "I can't log in. I've forgotten my password.", vietnamese: "Tôi không đăng nhập được. Tôi quên mật khẩu rồi." } },
      { word: "set up", ipa: "/ˌset ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "thiết lập, cài đặt", definition: "to prepare a machine or system so it is ready to use", example: { english: "Can you help me set up my new printer?", vietnamese: "Bạn giúp tôi cài đặt máy in mới được không?" } },
      { word: "sign up", ipa: "/ˌsaɪn ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "đăng ký", definition: "to join a service or course by giving your details", example: { english: "I signed up for a free trial.", vietnamese: "Tôi đã đăng ký dùng thử miễn phí." } },
      { word: "shut down", ipa: "/ˌʃʌt ˈdaʊn/", partOfSpeech: "phrasal verb", vietnamese: "tắt máy", definition: "to turn a computer off completely", example: { english: "Always shut down your laptop before a flight.", vietnamese: "Luôn tắt hẳn máy tính trước khi lên máy bay." } },
      { word: "plug in", ipa: "/ˌplʌɡ ˈɪn/", partOfSpeech: "phrasal verb", vietnamese: "cắm điện", definition: "to connect a machine to the electricity supply", example: { english: "Is the charger plugged in?", vietnamese: "Bộ sạc đã cắm điện chưa?" } },
      { word: "top up", ipa: "/ˌtɒp ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "nạp tiền", definition: "to add more money to a phone or card (British English)", example: { english: "I need to top up my phone credit.", vietnamese: "Tôi cần nạp tiền điện thoại." } },
      { word: "run out of", ipa: "/ˌrʌn ˈaʊt əv/", partOfSpeech: "phrasal verb", vietnamese: "hết, cạn", definition: "to use all of something so there is none left", example: { english: "My phone has run out of battery.", vietnamese: "Điện thoại tôi hết pin rồi." } },
    ],
    grammar: [{
      title: "Phrasal verb or noun?",
      pattern: "verb: back up, log in, set up (two words) · noun / adjective: a backup, your login, the setup (one word)",
      explanation: {
        english: "Many tech words exist as a phrasal verb and as a noun. The verb is two words: I back up my files every week. The noun or adjective is usually one word: Do you have a backup? Enter your login details. The setup was easy. If it comes after to, will, can or I, it's the verb, so write two words.",
        vietnamese: "Nhiều từ công nghệ vừa là cụm động từ vừa là danh từ. Động từ viết thành hai từ: I back up my files every week. Danh từ hoặc tính từ thường viết liền: Do you have a backup? Enter your login details. The setup was easy. Nếu từ đứng sau to, will, can hoặc I thì đó là động từ, nên viết hai từ.",
      },
      examples: [
        { english: "Keep a backup on an external drive.", vietnamese: "Hãy giữ một bản sao lưu trên ổ cứng ngoài." },
        { english: "Log in with your email address.", vietnamese: "Đăng nhập bằng địa chỉ email của bạn." },
      ],
      mistake: {
        wrong: "I need to backup my files.", right: "I need to back up my files.",
        why: { english: "After to, you need the verb, which is two words.", vietnamese: "Sau to cần động từ, mà động từ thì viết thành hai từ." },
      },
    }, {
      title: "Remember, forget, stop",
      pattern: "remember / forget + to + verb (a job to do) · remember / forget + -ing (a memory) · stop + -ing (quit) / stop + to + verb (pause to do)",
      explanation: {
        english: "Some verbs change meaning with to or -ing. Remember to back up = don't forget this job. I remember backing it up = I have a memory of doing it. Don't forget to log out. I'll never forget seeing my first computer. Stop using your phone = quit. He stopped to answer his phone = he paused in order to answer.",
        vietnamese: "Một số động từ đổi nghĩa khi đi với to hoặc -ing. Remember to back up = đừng quên việc này. I remember backing it up = tôi nhớ là đã làm việc đó. Don't forget to log out. I'll never forget seeing my first computer. Stop using your phone = thôi dùng. He stopped to answer his phone = anh ấy dừng lại để nghe máy.",
      },
      examples: [
        { english: "Remember to plug in your laptop tonight.", vietnamese: "Nhớ cắm sạc máy tính tối nay nhé." },
        { english: "I don't remember signing up for this newsletter.", vietnamese: "Tôi không nhớ là đã đăng ký nhận bản tin này." },
      ],
      mistake: {
        wrong: "Remember backing up your work before you leave.", right: "Remember to back up your work before you leave.",
        why: { english: "For a job you must do, use remember to + verb.", vietnamese: "Với việc cần làm, dùng remember to + động từ." },
      },
    }],
    examples: [
      { english: "My phone ran out of battery, so I couldn't log in.", vietnamese: "Điện thoại hết pin nên tôi không đăng nhập được." },
      { english: "It took an hour to set up the new system.", vietnamese: "Mất một tiếng để thiết lập hệ thống mới." },
      { english: "Don't forget to shut down the computer when you leave.", vietnamese: "Đừng quên tắt máy tính khi về." },
      { english: "I signed up and topped up my card online.", vietnamese: "Tôi đã đăng ký và nạp tiền vào thẻ trực tuyến." },
    ],
    dialogue: [
      { speaker: "Ruby", english: "Help! My laptop just shut down and I've lost my essay.", vietnamese: "Cứu với! Máy tính mình vừa tắt và mình mất bài luận rồi." },
      { speaker: "Viet", english: "Was it plugged in?", vietnamese: "Có cắm sạc không?" },
      { speaker: "Ruby", english: "No. It ran out of battery.", vietnamese: "Không. Nó hết pin." },
      { speaker: "Viet", english: "Did you back it up anywhere?", vietnamese: "Bạn có sao lưu ở đâu không?" },
      { speaker: "Ruby", english: "I remember saving it to the cloud yesterday, but not today.", vietnamese: "Mình nhớ là hôm qua có lưu lên đám mây, nhưng hôm nay thì không." },
      { speaker: "Viet", english: "Log in and check. And next time, remember to set up automatic backups!", vietnamese: "Đăng nhập và kiểm tra đi. Lần sau nhớ thiết lập sao lưu tự động nhé!" },
    ],
    practice: [
      q("Complete: Don't forget to ___ your files.", ["back up", "backup", "back-up", "backing up"], "back up", "After to: the verb, two words."),
      q("Complete: Enter your ___ details here.", ["login", "log in", "logging", "log-into"], "login", "Adjective / noun: one word."),
      q("Complete: Remember ___ the door when you leave.", ["to lock", "locking", "lock", "locked"], "to lock", "A job to do: remember to."),
      q("“Hết pin” in English is…", ["run out of battery", "run off battery", "out run battery", "finish of battery"], "run out of battery", "Run out of = none left."),
    ],
    challenge: [
      q("Complete: I'll never forget ___ the Northern Lights.", ["seeing", "to see", "see", "saw"], "seeing", "A memory: forget + -ing."),
      q("Complete: He stopped ___ a photo of the sunset.", ["to take", "taking", "take", "took"], "to take", "Paused in order to: stop to."),
      q("Complete: You should stop ___ your phone in bed.", ["using", "to use", "use", "used"], "using", "Quit: stop + -ing."),
      q("Complete: I need to ___ my phone. I've got no credit.", ["top up", "top on", "fill out", "plug up"], "top up", "Top up = add money."),
      q("Complete: Can you help me ___ my new tablet?", ["set up", "setup", "set on", "sit up"], "set up", "Verb: two words."),
    ],
  }, {
    key: "word-building", title: "Discover, Discovery", titleVi: "Cấu tạo từ",
    objectives: [
      "I can build new words from ones I already know.",
      "Make nouns with -tion, -ment, -ity, -ness and -y",
      "Make adjectives with -ful, -less, -ive, -al and -ic",
    ],
    vocabulary: [
      { word: "discovery", ipa: "/dɪˈskʌvəri/", partOfSpeech: "noun", vietnamese: "sự khám phá, phát hiện", definition: "finding something for the first time", example: { english: "The discovery of penicillin saved millions of lives.", vietnamese: "Việc phát hiện ra penicillin đã cứu sống hàng triệu người." } },
      { word: "development", ipa: "/dɪˈveləpmənt/", partOfSpeech: "noun", vietnamese: "sự phát triển", definition: "the process of growing or creating something new", example: { english: "The development of the vaccine took two years.", vietnamese: "Việc phát triển vắc-xin mất hai năm." } },
      { word: "improvement", ipa: "/ɪmˈpruːvmənt/", partOfSpeech: "noun", vietnamese: "sự cải thiện", definition: "a change that makes something better", example: { english: "There's been a big improvement in your English.", vietnamese: "Tiếng Anh của bạn đã cải thiện nhiều." } },
      { word: "innovation", ipa: "/ˌɪnəˈveɪʃn/", partOfSpeech: "noun", vietnamese: "sự đổi mới, sáng kiến", definition: "a new idea, method or invention", example: { english: "The company is famous for innovation.", vietnamese: "Công ty nổi tiếng về sự đổi mới." } },
      { word: "scientific", ipa: "/ˌsaɪənˈtɪfɪk/", partOfSpeech: "adjective", vietnamese: "thuộc khoa học, có tính khoa học", definition: "connected with science", example: { english: "There's no scientific evidence for it.", vietnamese: "Không có bằng chứng khoa học nào cho điều đó." } },
      { word: "accuracy", ipa: "/ˈækjərəsi/", partOfSpeech: "noun", vietnamese: "độ chính xác", definition: "being exactly correct", example: { english: "The accuracy of the weather forecast has improved.", vietnamese: "Độ chính xác của dự báo thời tiết đã được cải thiện." } },
      { word: "effective", ipa: "/ɪˈfektɪv/", partOfSpeech: "adjective", vietnamese: "hiệu quả", definition: "working well and producing the result you want", example: { english: "This is the most effective way to learn vocabulary.", vietnamese: "Đây là cách học từ vựng hiệu quả nhất." } },
      { word: "solution", ipa: "/səˈluːʃn/", partOfSpeech: "noun", vietnamese: "giải pháp", definition: "a way of solving a problem", example: { english: "Scientists are looking for a solution to plastic waste.", vietnamese: "Các nhà khoa học đang tìm giải pháp cho rác thải nhựa." } },
    ],
    grammar: [{
      title: "Noun suffixes",
      pattern: "verb → noun: -tion (invent → invention) · -ment (develop → development) · -y (discover → discovery) · adjective → noun: -ity (able → ability) · -ness (kind → kindness) · -cy (accurate → accuracy)",
      explanation: {
        english: "Suffixes change a word's class. To make nouns from verbs, add -tion / -sion, -ment or sometimes -y: solve → solution, improve → improvement, discover → discovery. From adjectives, add -ity, -ness or -cy: possible → possibility, aware → awareness, accurate → accuracy. After a, the or an adjective, you need the noun.",
        vietnamese: "Hậu tố thay đổi từ loại. Để tạo danh từ từ động từ, thêm -tion / -sion, -ment hoặc đôi khi -y: solve → solution, improve → improvement, discover → discovery. Từ tính từ, thêm -ity, -ness hoặc -cy: possible → possibility, aware → awareness, accurate → accuracy. Sau a, the hoặc một tính từ thì cần danh từ.",
      },
      examples: [
        { english: "Electricity was one of the greatest inventions.", vietnamese: "Điện là một trong những phát minh vĩ đại nhất." },
        { english: "Thank you for your kindness.", vietnamese: "Cảm ơn lòng tốt của bạn." },
      ],
      mistake: {
        wrong: "It was an important discover.", right: "It was an important discovery.",
        why: { english: "After an important, you need the noun discovery.", vietnamese: "Sau an important cần danh từ discovery." },
      },
    }, {
      title: "Adjective suffixes",
      pattern: "-ful (with: useful) · -less (without: useless) · -ive (effective) · -al (natural) · -ic (scientific)",
      explanation: {
        english: "To make adjectives, add -ful (having it) or -less (without it): useful / useless, careful / careless. Others take -ive, -al or -ic: effect → effective, nature → natural, science → scientific. Before a noun, or after be, you need the adjective, not the noun.",
        vietnamese: "Để tạo tính từ, thêm -ful (có) hoặc -less (không có): useful / useless, careful / careless. Một số khác thêm -ive, -al hoặc -ic: effect → effective, nature → natural, science → scientific. Trước danh từ, hoặc sau be, cần tính từ chứ không phải danh từ.",
      },
      examples: [
        { english: "The old charger is useless now.", vietnamese: "Bộ sạc cũ giờ vô dụng rồi." },
        { english: "It's a natural, effective cure for headaches.", vietnamese: "Đó là phương thuốc tự nhiên, hiệu quả cho chứng đau đầu." },
      ],
      mistake: {
        wrong: "It was a very success experiment.", right: "It was a very successful experiment.",
        why: { english: "Before a noun, use the adjective successful.", vietnamese: "Trước danh từ, dùng tính từ successful." },
      },
    }],
    examples: [
      { english: "The development of AI is changing every industry.", vietnamese: "Sự phát triển của AI đang thay đổi mọi ngành." },
      { english: "We need a more effective solution.", vietnamese: "Chúng ta cần một giải pháp hiệu quả hơn." },
      { english: "Scientific innovation needs money and time.", vietnamese: "Đổi mới khoa học cần tiền và thời gian." },
      { english: "There's been an improvement in the accuracy of the tests.", vietnamese: "Độ chính xác của các xét nghiệm đã được cải thiện." },
    ],
    dialogue: [
      { speaker: "Teacher", english: "What's the noun from “discover”?", vietnamese: "Danh từ của “discover” là gì?" },
      { speaker: "Hung", english: "Discovery. Like “a scientific discovery”.", vietnamese: "Discovery. Như trong “a scientific discovery”." },
      { speaker: "Teacher", english: "Good. And from “improve”?", vietnamese: "Tốt. Còn từ “improve”?" },
      { speaker: "Hung", english: "Improvement. And “develop” becomes “development”.", vietnamese: "Improvement. Và “develop” thành “development”." },
      { speaker: "Teacher", english: "Excellent. Now an adjective: something that has no use is…?", vietnamese: "Xuất sắc. Giờ đến tính từ: thứ không có tác dụng gì là…?" },
      { speaker: "Hung", english: "Useless! And one that works well is effective.", vietnamese: "Useless! Còn thứ hoạt động tốt là effective." },
    ],
    practice: [
      q("The noun from “improve” is…", ["improvement", "improvation", "improvity", "improveness"], "improvement", "-ment."),
      q("The noun from “solve” is…", ["solution", "solvement", "solvity", "solving-ness"], "solution", "-tion."),
      q("The adjective from “science” is…", ["scientific", "sciencey", "sciential", "scienceful"], "scientific", "-ic."),
      q("“Giải pháp” in English is…", ["solution", "solve", "solving", "resolver"], "solution", "Solution = way to solve."),
    ],
    challenge: [
      q("Complete: This old map is ___. It's completely wrong.", ["useless", "useful", "usage", "using"], "useless", "-less = without use."),
      q("Complete: Electricity was a great ___.", ["invention", "invent", "inventive", "inventment"], "invention", "Noun after a great."),
      q("Choose the correct sentence.", ["The results were very successful.", "The results were very success.", "The results were very succeed.", "The results were very successive."], "The results were very successful.", "Adjective after be."),
      q("The noun from “accurate” is…", ["accuracy", "accurateness only", "accuration", "accurity"], "accuracy", "-cy."),
      q("What is an “innovation”?", ["a new idea, method or invention", "an old tradition", "a mistake", "a type of science lesson"], "a new idea, method or invention", "Innovation = something new."),
    ],
  }, {
    key: "pros-and-cons", title: "Pros and Cons", titleVi: "Ưu và nhược điểm",
    objectives: [
      "I can discuss the advantages and disadvantages of technology.",
      "Add ideas with furthermore, what's more and in addition to + -ing",
      "Show results and causes with as a result, therefore and due to + noun",
    ],
    vocabulary: [
      { word: "benefit", ipa: "/ˈbenɪfɪt/", partOfSpeech: "noun", vietnamese: "lợi ích", definition: "a good result or advantage", example: { english: "One benefit of online shopping is the choice.", vietnamese: "Một lợi ích của mua sắm trực tuyến là có nhiều lựa chọn." } },
      { word: "drawback", ipa: "/ˈdrɔːbæk/", partOfSpeech: "noun", vietnamese: "nhược điểm", definition: "a disadvantage or problem", example: { english: "The main drawback is the price.", vietnamese: "Nhược điểm chính là giá cả." } },
      { word: "outweigh", ipa: "/ˌaʊtˈweɪ/", partOfSpeech: "verb", vietnamese: "lớn hơn, vượt trội hơn", definition: "to be more important than something else", example: { english: "The benefits outweigh the risks.", vietnamese: "Lợi ích lớn hơn rủi ro." } },
      { word: "furthermore", ipa: "/ˌfɜːðəˈmɔː/", partOfSpeech: "adverb", vietnamese: "hơn nữa", definition: "used to add another point (formal)", example: { english: "The app is free. Furthermore, it has no adverts.", vietnamese: "Ứng dụng miễn phí. Hơn nữa, nó không có quảng cáo." } },
      { word: "what's more", ipa: "/ˌwɒts ˈmɔː/", partOfSpeech: "phrase", vietnamese: "thêm vào đó, hơn nữa", definition: "used to add a stronger point (less formal)", example: { english: "It's cheap, and what's more, it's fast.", vietnamese: "Nó rẻ, và hơn nữa, nó nhanh." } },
      { word: "as a result", ipa: "/əz ə rɪˈzʌlt/", partOfSpeech: "phrase", vietnamese: "kết quả là, do đó", definition: "because of this", example: { english: "The road flooded. As a result, schools closed.", vietnamese: "Đường ngập. Kết quả là các trường đóng cửa." } },
      { word: "privacy", ipa: "/ˈprɪvəsi/", partOfSpeech: "noun", vietnamese: "quyền riêng tư", definition: "the right to keep your personal life secret", example: { english: "Social media can be a threat to privacy.", vietnamese: "Mạng xã hội có thể đe doạ quyền riêng tư." } },
      { word: "rely on", ipa: "/rɪˈlaɪ ɒn/", partOfSpeech: "phrasal verb", vietnamese: "phụ thuộc vào, dựa vào", definition: "to need something in order to work or live", example: { english: "We rely on our phones too much.", vietnamese: "Chúng ta phụ thuộc vào điện thoại quá nhiều." } },
    ],
    grammar: [{
      title: "Adding ideas",
      pattern: "Furthermore, / Moreover, / What's more, / In addition, + sentence · In addition to / As well as + noun or -ing",
      explanation: {
        english: "To add another point, start a new sentence with Furthermore, Moreover or In addition (formal), or What's more (less formal), followed by a comma. In addition to and as well as are prepositions, so they take a noun or -ing: In addition to saving time, it saves money.",
        vietnamese: "Để thêm một ý, bắt đầu câu mới bằng Furthermore, Moreover hoặc In addition (trang trọng), hay What's more (ít trang trọng hơn), kèm dấu phẩy. In addition to và as well as là giới từ, nên đi với danh từ hoặc -ing: In addition to saving time, it saves money.",
      },
      examples: [
        { english: "Electric bikes are quiet. Furthermore, they don't pollute.", vietnamese: "Xe đạp điện êm. Hơn nữa, chúng không gây ô nhiễm." },
        { english: "As well as being cheap, the course is very good.", vietnamese: "Ngoài giá rẻ, khoá học còn rất tốt." },
      ],
      mistake: {
        wrong: "In addition to save time, online banking is safe.", right: "In addition to saving time, online banking is safe.",
        why: { english: "To is a preposition here, so use -ing.", vietnamese: "To ở đây là giới từ, nên dùng -ing." },
      },
    }, {
      title: "Results and causes",
      pattern: "result: As a result, / Therefore, / Consequently, + sentence · cause: because + clause · due to / because of + noun",
      explanation: {
        english: "To give a result, use As a result, Therefore or Consequently at the start of a sentence. To give a cause, use because with a full clause, but due to or because of with a noun: because it was raining / due to the rain. Don't put a subject and verb after due to.",
        vietnamese: "Để nêu kết quả, dùng As a result, Therefore hoặc Consequently ở đầu câu. Để nêu nguyên nhân, dùng because với cả mệnh đề, nhưng due to hoặc because of với danh từ: because it was raining / due to the rain. Đừng đặt chủ ngữ và động từ sau due to.",
      },
      examples: [
        { english: "People shop online more. Therefore, many shops have closed.", vietnamese: "Người ta mua sắm trực tuyến nhiều hơn. Do đó, nhiều cửa hàng đã đóng cửa." },
        { english: "The flight was cancelled due to a technical problem.", vietnamese: "Chuyến bay bị huỷ do sự cố kỹ thuật." },
      ],
      mistake: {
        wrong: "Due to the internet was slow, I couldn't join the meeting.", right: "Because the internet was slow, I couldn't join the meeting.",
        why: { english: "Due to takes a noun. With a clause, use because.", vietnamese: "Due to đi với danh từ. Với mệnh đề, dùng because." },
      },
    }],
    examples: [
      { english: "The benefits of smartphones outweigh the drawbacks.", vietnamese: "Lợi ích của điện thoại thông minh lớn hơn nhược điểm." },
      { english: "We rely on apps for everything. As a result, we share a lot of data.", vietnamese: "Chúng ta dựa vào ứng dụng cho mọi thứ. Do đó, chúng ta chia sẻ rất nhiều dữ liệu." },
      { english: "Smart speakers are useful. What's more, they're cheap.", vietnamese: "Loa thông minh rất hữu ích. Hơn nữa, chúng rẻ." },
      { english: "Many people worry about privacy. Furthermore, apps can be addictive.", vietnamese: "Nhiều người lo về quyền riêng tư. Hơn nữa, ứng dụng có thể gây nghiện." },
    ],
    dialogue: [
      { speaker: "Host", english: "Should children have smartphones? What are the benefits?", vietnamese: "Trẻ em có nên có điện thoại thông minh không? Lợi ích là gì?" },
      { speaker: "Yen", english: "Parents can contact them easily. What's more, they can learn online.", vietnamese: "Bố mẹ có thể liên lạc dễ dàng. Hơn nữa, trẻ có thể học trực tuyến." },
      { speaker: "Paul", english: "But there are drawbacks. Children rely on them too much.", vietnamese: "Nhưng có những nhược điểm. Trẻ em phụ thuộc vào chúng quá nhiều." },
      { speaker: "Paul", english: "As a result, they sleep less and move less.", vietnamese: "Kết quả là trẻ ngủ ít hơn và vận động ít hơn." },
      { speaker: "Yen", english: "That's true. Furthermore, privacy is a real problem.", vietnamese: "Đúng vậy. Hơn nữa, quyền riêng tư là một vấn đề thực sự." },
      { speaker: "Host", english: "So, do the benefits outweigh the drawbacks?", vietnamese: "Vậy lợi ích có lớn hơn nhược điểm không?" },
    ],
    practice: [
      q("Complete: It's fast. ___, it's very cheap.", ["Furthermore", "Due to", "Because", "Although"], "Furthermore", "Adding a point."),
      q("Complete: The match was cancelled ___ the storm.", ["due to", "because", "as a result", "therefore"], "due to", "Due to + noun."),
      q("Complete: In addition to ___ money, it saves time.", ["saving", "save", "saved", "to save"], "saving", "In addition to + -ing."),
      q("“Nhược điểm” in English is…", ["drawback", "draw out", "backdraw", "lowpoint"], "drawback", "Drawback = disadvantage."),
    ],
    challenge: [
      q("Complete: He didn't study. ___, he failed the exam.", ["As a result", "Due to", "Furthermore", "In addition to"], "As a result", "Result."),
      q("Choose the correct sentence.", ["Because the road was closed, we were late.", "Due to the road was closed, we were late.", "Because of the road was closed, we were late.", "Due to closed road was, we were late."], "Because the road was closed, we were late.", "Because + clause."),
      q("Complete: As well as ___ fun, the game teaches maths.", ["being", "be", "is", "to be"], "being", "As well as + -ing."),
      q("Complete: The advantages ___ the disadvantages.", ["outweigh", "overweight", "outweight", "weigh out"], "outweigh", "Outweigh = are more important."),
      q("What is “privacy”?", ["the right to keep your personal life secret", "a private school", "a kind of password", "a computer virus"], "the right to keep your personal life secret", "Privacy = personal secrets."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 3", isReview: true,
    objectives: [
      "I can talk about technology and science accurately.",
      "Check have something done, the impersonal passive, tech phrasal verbs, word building and linkers",
    ],
    vocabulary: [
      { word: "warranty", ipa: "/ˈwɒrənti/", partOfSpeech: "noun", vietnamese: "bảo hành", definition: "a promise to repair a product free for a time", example: { english: "The warranty lasts for two years.", vietnamese: "Bảo hành kéo dài hai năm." } },
      { word: "theory", ipa: "/ˈθɪəri/", partOfSpeech: "noun", vietnamese: "giả thuyết, lý thuyết", definition: "an idea that tries to explain something", example: { english: "In theory it works, but in practice it doesn't.", vietnamese: "Về lý thuyết thì được, nhưng thực tế thì không." } },
      { word: "back up", ipa: "/ˌbæk ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "sao lưu", definition: "to make a copy of files in case the originals are lost", example: { english: "The system backs up automatically every night.", vietnamese: "Hệ thống tự động sao lưu mỗi đêm." } },
      { word: "discovery", ipa: "/dɪˈskʌvəri/", partOfSpeech: "noun", vietnamese: "sự khám phá, phát hiện", definition: "finding something for the first time", example: { english: "The discovery made her famous.", vietnamese: "Phát hiện đó khiến bà ấy nổi tiếng." } },
      { word: "benefit", ipa: "/ˈbenɪfɪt/", partOfSpeech: "noun", vietnamese: "lợi ích", definition: "a good result or advantage", example: { english: "Exercise has many health benefits.", vietnamese: "Tập thể dục có nhiều lợi ích cho sức khoẻ." } },
      { word: "drawback", ipa: "/ˈdrɔːbæk/", partOfSpeech: "noun", vietnamese: "nhược điểm", definition: "a disadvantage or problem", example: { english: "Every plan has its drawbacks.", vietnamese: "Kế hoạch nào cũng có nhược điểm." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "I had my phone repaired · It is said that… / is believed to have… · back up (verb) / a backup (noun) · remember to do · a discovery / successful · due to + noun",
      explanation: {
        english: "Check these: have + object + past participle when someone else does it, or when something bad happens to you; It is said that + clause, or subject + is believed to be / to have + past participle; phrasal verbs are two words, nouns one; remember to do a job, remember doing a memory; use the right word class after a or be; in addition to and due to take a noun or -ing, because takes a clause.",
        vietnamese: "Hãy kiểm tra: have + tân ngữ + quá khứ phân từ khi người khác làm giúp, hoặc khi điều xấu xảy ra với bạn; It is said that + mệnh đề, hoặc chủ ngữ + is believed to be / to have + quá khứ phân từ; cụm động từ viết hai từ, danh từ viết liền; remember to làm một việc, remember -ing là một kỷ niệm; dùng đúng từ loại sau a hoặc be; in addition to và due to đi với danh từ hoặc -ing, because đi với mệnh đề.",
      },
      examples: [
        { english: "I had the data backed up before the upgrade.", vietnamese: "Tôi đã cho sao lưu dữ liệu trước khi nâng cấp." },
        { english: "It is believed that the discovery will help millions.", vietnamese: "Người ta tin rằng phát hiện này sẽ giúp hàng triệu người." },
      ],
    }],
    examples: [
      { english: "One drawback is that the warranty only lasts a year.", vietnamese: "Một nhược điểm là bảo hành chỉ kéo dài một năm." },
      { english: "The theory led to an important discovery.", vietnamese: "Giả thuyết đó dẫn đến một phát hiện quan trọng." },
      { english: "The benefits are clear. As a result, more people back up their data.", vietnamese: "Lợi ích rất rõ ràng. Do đó, ngày càng nhiều người sao lưu dữ liệu." },
    ],
    dialogue: [
      { speaker: "Ian", english: "Did you get your laptop fixed?", vietnamese: "Bạn sửa máy tính xong chưa?" },
      { speaker: "Thu", english: "Yes, I had the hard drive replaced. It was still under warranty.", vietnamese: "Rồi, mình cho thay ổ cứng. Máy vẫn còn bảo hành." },
      { speaker: "Ian", english: "Lucky! Did you lose any files?", vietnamese: "May đấy! Bạn có mất tệp nào không?" },
      { speaker: "Thu", english: "No. I remembered to back everything up the day before.", vietnamese: "Không. Hôm trước mình đã nhớ sao lưu mọi thứ." },
      { speaker: "Ian", english: "Smart. It is said that most people never make a backup.", vietnamese: "Khôn đấy. Người ta nói rằng phần lớn mọi người chẳng bao giờ sao lưu." },
      { speaker: "Thu", english: "That's the drawback of cheap laptops: they break easily.", vietnamese: "Đó là nhược điểm của máy tính rẻ tiền: dễ hỏng." },
      { speaker: "Ian", english: "True, but the benefit is that they're cheap to repair!", vietnamese: "Đúng, nhưng lợi ích là sửa cũng rẻ!" },
    ],
    practice: [
      q("Complete: I ___ my eyes tested last week.", ["had", "did", "made", "was"], "had", "Have something done."),
      q("Complete: It ___ that the city was founded in 1010.", ["is said", "says", "is saying", "has said"], "is said", "It is said that."),
      q("Complete: Remember ___ your password.", ["to change", "changing", "change", "changed"], "to change", "A job to do."),
      q("The noun from “develop” is…", ["development", "develoption", "developity", "developness"], "development", "-ment."),
    ],
    challenge: [
      q("Complete: The temple is thought ___ in the 11th century.", ["to have been built", "to build", "to be build", "building"], "to have been built", "Earlier: to have + past participle."),
      q("Choose the correct sentence.", ["Do you have a backup of these files?", "Do you have a back up of these files?", "Do you have a backing up of these files?", "Do you have backup up these files?"], "Do you have a backup of these files?", "Noun: one word."),
      q("Complete: It was a ___ experiment.", ["successful", "success", "succeed", "successive"], "successful", "Adjective before the noun."),
      q("Complete: The trains stopped ___ the snow.", ["due to", "because", "therefore", "as a result"], "due to", "Due to + noun."),
      q("Choose the correct sentence.", ["I had my bag stolen.", "I was stolen my bag.", "I stole my bag by someone.", "My bag had stolen me."], "I had my bag stolen.", "Bad experience: have + object + past participle."),
    ],
  }],
  assessment: [
    { id: "causative", prompt: "“Tôi đi cắt tóc hôm qua.” in English is…", options: ["I had my hair cut yesterday.", "I cut my hair yesterday by a hairdresser.", "I had cut my hair yesterday.", "I was cut my hair yesterday."], correct: "I had my hair cut yesterday.", explanation: "Have + object + past participle." },
    { id: "causative-order", prompt: "Choose the correct sentence.", options: ["We're having the roof repaired.", "We're having repaired the roof.", "We're repairing the roof by a builder.", "We're had the roof repaired."], correct: "We're having the roof repaired.", explanation: "Object between have and past participle." },
    { id: "bad-experience", prompt: "Complete: She had her phone ___ at the station.", options: ["stolen", "steal", "stole", "stealing"], correct: "stolen", explanation: "Past participle." },
    { id: "it-is-said", prompt: "Complete: It ___ that the lake is very deep.", options: ["is said", "says", "is saying", "said"], correct: "is said", explanation: "It is said that." },
    { id: "believed-to-be", prompt: "Complete: The tree is believed ___ 300 years old.", options: ["to be", "being", "be", "that is"], correct: "to be", explanation: "Is believed to be." },
    { id: "to-have-pp", prompt: "Complete: The painter is said ___ blind in later life.", options: ["to have gone", "to go", "going", "to be go"], correct: "to have gone", explanation: "Earlier: to have + past participle." },
    { id: "phrasal-noun", prompt: "Choose the correct sentence.", options: ["I need to back up my phone.", "I need to backup my phone.", "I need to back-up my phone.", "I need to backing up my phone."], correct: "I need to back up my phone.", explanation: "Verb: two words." },
    { id: "remember-to", prompt: "Complete: Remember ___ the lights before you go.", options: ["to turn off", "turning off", "turn off", "turned off"], correct: "to turn off", explanation: "A job to do." },
    { id: "remember-ing", prompt: "Complete: I remember ___ my first email in 1998.", options: ["sending", "to send", "send", "sent"], correct: "sending", explanation: "A memory." },
    { id: "noun-suffix", prompt: "Complete: There has been a big ___ in air quality.", options: ["improvement", "improve", "improved", "improvation"], correct: "improvement", explanation: "Noun after a big." },
    { id: "adjective-suffix", prompt: "Complete: This app is really ___.", options: ["useful", "use", "usage", "usefully"], correct: "useful", explanation: "Adjective after be." },
    { id: "scientific", prompt: "The adjective from “science” is…", options: ["scientific", "sciencey", "sciential", "scienceful"], correct: "scientific", explanation: "-ic." },
    { id: "in-addition-to", prompt: "Complete: In addition to ___ cheap, it's very light.", options: ["being", "be", "is", "to be"], correct: "being", explanation: "In addition to + -ing." },
    { id: "due-to", prompt: "“Chuyến bay bị hoãn do thời tiết xấu.” in English is…", options: ["The flight was delayed due to bad weather.", "The flight was delayed due to the weather was bad.", "The flight was delayed because of the weather was bad.", "The flight was delayed therefore bad weather."], correct: "The flight was delayed due to bad weather.", explanation: "Due to + noun." },
    { id: "as-a-result", prompt: "Complete: Prices rose. ___, sales fell.", options: ["As a result", "Due to", "In addition to", "Because of"], correct: "As a result", explanation: "Result at the start of a sentence." },
  ],
};
