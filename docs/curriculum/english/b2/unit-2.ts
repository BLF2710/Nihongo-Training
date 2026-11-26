// B2 Unit 2: Work & Careers. Vietnamese "làm" covers both make and do, giving "do a mistake" and "make research";
// work nouns get a plural they don't have ("feedbacks", "researches"); emails mix registers ("Hi Mr Brown, I wanna
// ask…") and keep question order inside polite requests ("Could you tell me when does it start?"); the future tenses
// at work become simple will ("This time tomorrow I will fly"); and "nói về" turns into "say about". This unit puts
// those right for the office, meetings and presentations.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B2",
  number: 2,
  lessons: [{
    key: "make-or-do", title: "Make a Decision, Do Research", titleVi: "Make hay do?",
    objectives: [
      "I can use common work collocations with make and do.",
      "Choose make for creating and results, do for tasks and activities",
      "Keep work nouns like research, feedback and advice uncountable",
    ],
    vocabulary: [
      { word: "make a decision", ipa: "/ˌmeɪk ə dɪˈsɪʒn/", partOfSpeech: "collocation", vietnamese: "đưa ra quyết định", definition: "to decide something", example: { english: "We need to make a decision by Friday.", vietnamese: "Chúng ta cần đưa ra quyết định trước thứ Sáu." } },
      { word: "make progress", ipa: "/ˌmeɪk ˈprəʊɡres/", partOfSpeech: "collocation", vietnamese: "tiến bộ", definition: "to get better or move forward", example: { english: "The team is making good progress on the project.", vietnamese: "Nhóm đang tiến triển tốt với dự án." } },
      { word: "make an effort", ipa: "/ˌmeɪk ən ˈefət/", partOfSpeech: "collocation", vietnamese: "nỗ lực", definition: "to try hard", example: { english: "He made an effort to learn everyone's name.", vietnamese: "Anh ấy đã cố gắng nhớ tên mọi người." } },
      { word: "make a profit", ipa: "/ˌmeɪk ə ˈprɒfɪt/", partOfSpeech: "collocation", vietnamese: "có lãi", definition: "to earn more money than you spend", example: { english: "The café made a profit in its first year.", vietnamese: "Quán cà phê có lãi ngay năm đầu." } },
      { word: "do research", ipa: "/ˌduː rɪˈsɜːtʃ/", partOfSpeech: "collocation", vietnamese: "nghiên cứu", definition: "to study something carefully to find out facts", example: { english: "She's doing research into renewable energy.", vietnamese: "Cô ấy đang nghiên cứu về năng lượng tái tạo." } },
      { word: "do business", ipa: "/ˌduː ˈbɪznəs/", partOfSpeech: "collocation", vietnamese: "làm ăn, kinh doanh", definition: "to buy and sell, or work with another company", example: { english: "We've done business with them for years.", vietnamese: "Chúng tôi đã làm ăn với họ nhiều năm." } },
      { word: "do overtime", ipa: "/ˌduː ˈəʊvətaɪm/", partOfSpeech: "collocation", vietnamese: "làm thêm giờ", definition: "to work more hours than usual", example: { english: "I had to do overtime every night last week.", vietnamese: "Tuần trước tối nào tôi cũng phải làm thêm giờ." } },
      { word: "feedback", ipa: "/ˈfiːdbæk/", partOfSpeech: "noun", vietnamese: "nhận xét, phản hồi", definition: "comments about how well someone has done something", example: { english: "My manager gave me some useful feedback.", vietnamese: "Quản lý đã cho tôi vài nhận xét hữu ích." } },
    ],
    grammar: [{
      title: "Make or do?",
      pattern: "make = create, produce, cause a result (a decision, progress, a profit, a mistake) · do = tasks, work, activities (research, business, overtime, homework)",
      explanation: {
        english: "Vietnamese “làm” is both make and do. As a rough guide, make is for creating something or causing a result: make a plan, make a mistake, make a profit. Do is for tasks, jobs and activities: do the shopping, do research, do your best. Many are fixed, so learn them as pairs.",
        vietnamese: "“Làm” trong tiếng Việt vừa là make vừa là do. Đại khái, make dùng cho việc tạo ra cái gì hoặc gây ra kết quả: make a plan, make a mistake, make a profit. Do dùng cho nhiệm vụ, công việc và hoạt động: do the shopping, do research, do your best. Nhiều cụm là cố định, nên hãy học thành cặp.",
      },
      examples: [
        { english: "I made a few mistakes in the report.", vietnamese: "Tôi mắc vài lỗi trong bản báo cáo." },
        { english: "Could you do me a favour and check this?", vietnamese: "Bạn giúp tôi kiểm tra cái này được không?" },
      ],
      mistake: {
        wrong: "Don't worry. Everyone does mistakes.", right: "Don't worry. Everyone makes mistakes.",
        why: { english: "The collocation is make a mistake.", vietnamese: "Cụm từ cố định là make a mistake." },
      },
    }, {
      title: "Uncountable work nouns",
      pattern: "research, feedback, advice, information, equipment, work → no a / an, no -s · a piece of advice",
      explanation: {
        english: "Several common work nouns are uncountable in English, though they may be countable in Vietnamese: research, feedback, advice, information, equipment, work. Don't add -s or a / an. Use some, a lot of or a piece of: She gave me some advice. We need more information.",
        vietnamese: "Nhiều danh từ thông dụng trong công việc là không đếm được trong tiếng Anh, dù trong tiếng Việt có thể đếm được: research, feedback, advice, information, equipment, work. Không thêm -s hay a / an. Dùng some, a lot of hoặc a piece of: She gave me some advice. We need more information.",
      },
      examples: [
        { english: "Can I give you a piece of advice?", vietnamese: "Tôi cho bạn một lời khuyên nhé?" },
        { english: "The lab has a lot of expensive equipment.", vietnamese: "Phòng thí nghiệm có nhiều thiết bị đắt tiền." },
      ],
      mistake: {
        wrong: "Thanks for all your feedbacks.", right: "Thanks for all your feedback.",
        why: { english: "Feedback is uncountable, so it has no -s.", vietnamese: "Feedback không đếm được, nên không thêm -s." },
      },
    }],
    examples: [
      { english: "It's hard to make a decision without more information.", vietnamese: "Thật khó quyết định khi chưa có thêm thông tin." },
      { english: "If you make an effort, you'll make progress quickly.", vietnamese: "Nếu bạn nỗ lực, bạn sẽ tiến bộ nhanh." },
      { english: "The company didn't make a profit until its third year.", vietnamese: "Công ty không có lãi cho đến năm thứ ba." },
      { english: "Before we do business with them, let's do some research.", vietnamese: "Trước khi làm ăn với họ, hãy tìm hiểu một chút đã." },
    ],
    dialogue: [
      { speaker: "Sarah", english: "You look tired. Are you doing overtime again?", vietnamese: "Trông bạn mệt thế. Lại làm thêm giờ à?" },
      { speaker: "Thanh", english: "Yes. We have to make a decision on the new supplier.", vietnamese: "Ừ. Bọn mình phải quyết định chọn nhà cung cấp mới." },
      { speaker: "Sarah", english: "Have you done much research?", vietnamese: "Bạn đã tìm hiểu nhiều chưa?" },
      { speaker: "Thanh", english: "Loads. And we've had some good feedback from other clients.", vietnamese: "Rất nhiều. Và bọn mình đã nhận được phản hồi tốt từ các khách hàng khác." },
      { speaker: "Sarah", english: "So you're making progress.", vietnamese: "Vậy là đang tiến triển rồi." },
      { speaker: "Thanh", english: "Slowly! I just don't want to make a mistake.", vietnamese: "Chậm thôi! Mình chỉ không muốn mắc sai lầm." },
    ],
    practice: [
      q("Complete: I ___ a terrible mistake.", ["made", "did", "took", "had"], "made", "Make a mistake."),
      q("Complete: She's ___ research on sleep.", ["doing", "making", "taking", "having"], "doing", "Do research."),
      q("Complete: Thank you for the ___.", ["feedback", "feedbacks", "a feedback", "many feedback"], "feedback", "Feedback is uncountable."),
      q("“Làm thêm giờ” in English is…", ["do overtime", "make overtime", "do overhours", "make more time"], "do overtime", "Do overtime."),
    ],
    challenge: [
      q("Complete: The shop is finally ___ a profit.", ["making", "doing", "taking", "getting on"], "making", "Make a profit."),
      q("Complete: Could you ___ me a favour?", ["do", "make", "give", "take"], "do", "Do someone a favour."),
      q("Choose the correct sentence.", ["She gave me some useful advice.", "She gave me some useful advices.", "She gave me a useful advice.", "She gave me many useful advice."], "She gave me some useful advice.", "Advice is uncountable."),
      q("Complete: He's ___ a real effort to be on time.", ["making", "doing", "having", "taking"], "making", "Make an effort."),
      q("Complete: We've ___ business with them since 2015.", ["done", "made", "had", "worked"], "done", "Do business."),
    ],
  }, {
    key: "register", title: "Formal or Informal?", titleVi: "Văn phong trang trọng và thân mật",
    objectives: [
      "I can choose formal or informal English for emails and conversations.",
      "Swap everyday words for formal ones: ask → enquire, help → assist",
      "Make polite indirect requests with normal word order",
    ],
    vocabulary: [
      { word: "formal", ipa: "/ˈfɔːml/", partOfSpeech: "adjective", vietnamese: "trang trọng", definition: "used in serious or official situations", example: { english: "Use formal language in a job application.", vietnamese: "Hãy dùng ngôn ngữ trang trọng trong đơn xin việc." } },
      { word: "informal", ipa: "/ɪnˈfɔːml/", partOfSpeech: "adjective", vietnamese: "thân mật, không trang trọng", definition: "relaxed and friendly, used with people you know", example: { english: "Messages to colleagues can be informal.", vietnamese: "Tin nhắn cho đồng nghiệp có thể thân mật." } },
      { word: "enquire", ipa: "/ɪnˈkwaɪə/", partOfSpeech: "verb", vietnamese: "hỏi thông tin (trang trọng)", definition: "to ask for information (formal, British spelling)", example: { english: "I am writing to enquire about the course.", vietnamese: "Tôi viết thư để hỏi thông tin về khoá học." } },
      { word: "request", ipa: "/rɪˈkwest/", partOfSpeech: "verb", vietnamese: "yêu cầu, đề nghị (trang trọng)", definition: "to ask for something politely or officially", example: { english: "Guests are requested to leave their keys at reception.", vietnamese: "Quý khách vui lòng để lại chìa khoá ở lễ tân." } },
      { word: "regarding", ipa: "/rɪˈɡɑːdɪŋ/", partOfSpeech: "preposition", vietnamese: "về việc, liên quan đến", definition: "about (formal)", example: { english: "I have a question regarding my invoice.", vietnamese: "Tôi có một câu hỏi về hoá đơn của mình." } },
      { word: "assist", ipa: "/əˈsɪst/", partOfSpeech: "verb", vietnamese: "hỗ trợ, giúp đỡ (trang trọng)", definition: "to help (formal)", example: { english: "Our staff will be happy to assist you.", vietnamese: "Nhân viên của chúng tôi rất sẵn lòng hỗ trợ quý khách." } },
      { word: "inconvenience", ipa: "/ˌɪnkənˈviːniəns/", partOfSpeech: "noun", vietnamese: "sự bất tiện", definition: "a problem that causes difficulty", example: { english: "We apologise for any inconvenience.", vietnamese: "Chúng tôi xin lỗi vì mọi sự bất tiện." } },
      { word: "I look forward to", ipa: "/aɪ lʊk ˈfɔːwəd tə/", partOfSpeech: "phrase", vietnamese: "tôi mong chờ, mong nhận được", definition: "a formal way to end an email (+ -ing)", example: { english: "I look forward to hearing from you.", vietnamese: "Tôi mong sớm nhận được phản hồi của anh / chị." } },
    ],
    grammar: [{
      title: "Formal and informal words",
      pattern: "informal → formal: ask → enquire · help → assist · get → receive · about → regarding · Hi → Dear · I'm → I am",
      explanation: {
        english: "Formal English uses longer, often Latin-based words, full forms instead of contractions, and fewer phrasal verbs: I am writing to enquire about… / I would be grateful if you could assist me. Informal English uses short words, contractions and phrasal verbs: Just wanted to ask about… Don't mix the two in one message.",
        vietnamese: "Tiếng Anh trang trọng dùng từ dài hơn, thường gốc Latin, viết đầy đủ thay vì rút gọn, và ít cụm động từ: I am writing to enquire about… / I would be grateful if you could assist me. Tiếng Anh thân mật dùng từ ngắn, dạng rút gọn và cụm động từ: Just wanted to ask about… Đừng trộn hai kiểu trong cùng một tin nhắn.",
      },
      examples: [
        { english: "Formal: I would be grateful if you could send me further details.", vietnamese: "Trang trọng: Tôi rất biết ơn nếu anh / chị có thể gửi thêm thông tin chi tiết." },
        { english: "Informal: Can you send me a bit more info?", vietnamese: "Thân mật: Gửi mình thêm ít thông tin được không?" },
      ],
      mistake: {
        wrong: "Hi Mr Brown, I wanna ask about the job.", right: "Dear Mr Brown, I would like to enquire about the position.",
        why: { english: "A formal email needs formal words throughout: Dear, would like, enquire.", vietnamese: "Email trang trọng cần dùng từ trang trọng từ đầu đến cuối: Dear, would like, enquire." },
      },
    }, {
      title: "Polite indirect requests",
      pattern: "Could you tell me / Do you know / I was wondering + question word or if + subject + verb",
      explanation: {
        english: "Indirect questions are more polite than direct ones: Where is the office? → Could you tell me where the office is? After the opening phrase, use normal sentence order with no do, does or did. For yes / no questions, use if: I was wondering if you could help me.",
        vietnamese: "Câu hỏi gián tiếp lịch sự hơn câu hỏi trực tiếp: Where is the office? → Could you tell me where the office is? Sau cụm mở đầu, dùng trật tự câu bình thường, không có do, does hay did. Với câu hỏi có / không, dùng if: I was wondering if you could help me.",
      },
      examples: [
        { english: "Do you know what time the meeting finishes?", vietnamese: "Bạn có biết mấy giờ cuộc họp kết thúc không?" },
        { english: "I was wondering if I could leave early on Friday.", vietnamese: "Không biết tôi có thể về sớm vào thứ Sáu được không." },
      ],
      mistake: {
        wrong: "Could you tell me when does the course start?", right: "Could you tell me when the course starts?",
        why: { english: "Indirect questions use normal order, without does.", vietnamese: "Câu hỏi gián tiếp dùng trật tự bình thường, không có does." },
      },
    }],
    examples: [
      { english: "I am writing regarding the advertisement on your website.", vietnamese: "Tôi viết thư liên quan đến quảng cáo trên trang web của quý công ty." },
      { english: "Please let us know if we can assist you further.", vietnamese: "Vui lòng cho chúng tôi biết nếu cần hỗ trợ thêm." },
      { english: "We apologise for the inconvenience caused by the delay.", vietnamese: "Chúng tôi xin lỗi vì sự bất tiện do việc chậm trễ gây ra." },
      { english: "I look forward to meeting you on Monday.", vietnamese: "Tôi mong được gặp anh / chị vào thứ Hai." },
    ],
    dialogue: [
      { speaker: "Laura", english: "Can you check my email before I send it?", vietnamese: "Bạn xem giúp email của mình trước khi gửi nhé?" },
      { speaker: "Minh", english: "Sure. Oh, you've started with “Hey there”. Who's it to?", vietnamese: "Được. Ồ, bạn mở đầu bằng “Hey there”. Gửi cho ai vậy?" },
      { speaker: "Laura", english: "The head of a university department.", vietnamese: "Trưởng khoa của một trường đại học." },
      { speaker: "Minh", english: "Then it should be formal. Try “Dear Professor Jones”.", vietnamese: "Vậy thì phải trang trọng. Thử “Dear Professor Jones” đi." },
      { speaker: "Laura", english: "OK. And instead of “I want to ask about the course”?", vietnamese: "Được. Còn thay cho “I want to ask about the course” thì sao?" },
      { speaker: "Minh", english: "“I am writing to enquire about the course.” And end with “I look forward to hearing from you.”", vietnamese: "“I am writing to enquire about the course.” Và kết thúc bằng “I look forward to hearing from you.”" },
    ],
    practice: [
      q("The formal word for “help” is…", ["assist", "give a hand", "help out", "sort out"], "assist", "Assist = help (formal)."),
      q("The formal word for “about” in an email is…", ["regarding", "around", "on top of", "kind of"], "regarding", "Regarding = about."),
      q("Complete: Could you tell me where the station ___?", ["is", "is it", "does", "it's being"], "is", "Normal order: the station is."),
      q("“Sự bất tiện” in English is…", ["inconvenience", "unconvenience", "disconvenient", "incomfort"], "inconvenience", "Inconvenience = a problem."),
    ],
    challenge: [
      q("Which ending is right for a formal email?", ["I look forward to hearing from you.", "Speak soon!", "Cheers, mate.", "Text me back."], "I look forward to hearing from you.", "Formal ending."),
      q("Complete: I look forward to ___ from you.", ["hearing", "hear", "heard", "be hearing"], "hearing", "Look forward to + -ing."),
      q("Choose the correct sentence.", ["Do you know what time it opens?", "Do you know what time does it open?", "Do you know what time it does open?", "Do you know what time opens it?"], "Do you know what time it opens?", "Normal order after Do you know."),
      q("Complete: I was wondering ___ you could help me.", ["if", "that", "what", "do"], "if", "Yes / no: if."),
      q("Which sentence is formal?", ["I am writing to enquire about the vacancy.", "Just wanna ask about the job.", "What's up with the job?", "Got any jobs?"], "I am writing to enquire about the vacancy.", "Formal words and full forms."),
    ],
  }, {
    key: "future-perfect", title: "This Time Next Year", titleVi: "Tương lai tiếp diễn và tương lai hoàn thành",
    objectives: [
      "I can talk about my plans and goals at work.",
      "Use will be + -ing for an action in progress at a future time",
      "Use will have + past participle for something finished by a future time",
    ],
    vocabulary: [
      { word: "deadline", ipa: "/ˈdedlaɪn/", partOfSpeech: "noun", vietnamese: "hạn chót", definition: "the time by which something must be finished", example: { english: "The deadline for the report is next Monday.", vietnamese: "Hạn chót nộp báo cáo là thứ Hai tới." } },
      { word: "by", ipa: "/baɪ/", partOfSpeech: "preposition", vietnamese: "trước, chậm nhất là", definition: "not later than a time", example: { english: "Please reply by Friday.", vietnamese: "Vui lòng trả lời trước thứ Sáu." } },
      { word: "promotion", ipa: "/prəˈməʊʃn/", partOfSpeech: "noun", vietnamese: "sự thăng chức", definition: "a move to a more important job", example: { english: "She got a promotion after only a year.", vietnamese: "Cô ấy được thăng chức chỉ sau một năm." } },
      { word: "launch", ipa: "/lɔːntʃ/", partOfSpeech: "verb", vietnamese: "ra mắt", definition: "to start selling a new product or start a project", example: { english: "We're launching the new app in March.", vietnamese: "Chúng tôi sẽ ra mắt ứng dụng mới vào tháng Ba." } },
      { word: "career", ipa: "/kəˈrɪə/", partOfSpeech: "noun", vietnamese: "sự nghiệp", definition: "the jobs you do over your working life", example: { english: "He started his career as a waiter.", vietnamese: "Anh ấy bắt đầu sự nghiệp với vai trò bồi bàn." } },
      { word: "retire", ipa: "/rɪˈtaɪə/", partOfSpeech: "verb", vietnamese: "nghỉ hưu", definition: "to stop working because of your age", example: { english: "My father will retire next year.", vietnamese: "Bố tôi sẽ nghỉ hưu vào năm sau." } },
      { word: "target", ipa: "/ˈtɑːɡɪt/", partOfSpeech: "noun", vietnamese: "chỉ tiêu, mục tiêu", definition: "a result you are trying to achieve", example: { english: "We've already reached our sales target.", vietnamese: "Chúng tôi đã đạt chỉ tiêu doanh số rồi." } },
      { word: "on schedule", ipa: "/ɒn ˈʃedjuːl/", partOfSpeech: "phrase", vietnamese: "đúng tiến độ", definition: "happening at the planned time", example: { english: "The building work is on schedule.", vietnamese: "Công việc xây dựng đang đúng tiến độ." } },
    ],
    grammar: [{
      title: "Future continuous",
      pattern: "will be + verb-ing (in progress at a time in the future) · This time tomorrow / At 10 a.m. on Monday …",
      explanation: {
        english: "Use will be + -ing for an action that will be in progress at a particular moment in the future: This time next week I'll be lying on a beach. At 9 tomorrow, I'll be having my interview. It is also a polite way to ask about plans: Will you be using the meeting room this afternoon?",
        vietnamese: "Dùng will be + -ing cho hành động đang diễn ra tại một thời điểm cụ thể trong tương lai: This time next week I'll be lying on a beach. At 9 tomorrow, I'll be having my interview. Đây cũng là cách lịch sự để hỏi về kế hoạch: Will you be using the meeting room this afternoon?",
      },
      examples: [
        { english: "Don't call at two. I'll be presenting to the board.", vietnamese: "Đừng gọi lúc hai giờ. Lúc đó tôi đang thuyết trình trước ban giám đốc." },
        { english: "Will you be working from home tomorrow?", vietnamese: "Mai bạn có làm việc ở nhà không?" },
      ],
      mistake: {
        wrong: "This time tomorrow I will fly to London.", right: "This time tomorrow I'll be flying to London.",
        why: { english: "For an action in progress at a future moment, use will be + -ing.", vietnamese: "Với hành động đang diễn ra tại một thời điểm tương lai, dùng will be + -ing." },
      },
    }, {
      title: "Future perfect",
      pattern: "will have + past participle (finished before a time in the future) · by + time / by the time …",
      explanation: {
        english: "Use will have + past participle for something that will be complete before a point in the future, often with by: By 2030, I'll have finished my degree. By the time you arrive, we'll have eaten. With for, it shows how long by then: In June I'll have worked here for ten years.",
        vietnamese: "Dùng will have + quá khứ phân từ cho việc sẽ hoàn thành trước một thời điểm trong tương lai, thường đi với by: By 2030, I'll have finished my degree. By the time you arrive, we'll have eaten. Với for, nó cho biết kéo dài bao lâu tính đến lúc đó: In June I'll have worked here for ten years.",
      },
      examples: [
        { english: "We'll have launched the product by the end of the year.", vietnamese: "Chúng tôi sẽ ra mắt sản phẩm trước cuối năm." },
        { english: "Will you have finished the report by Friday?", vietnamese: "Bạn có hoàn thành báo cáo trước thứ Sáu không?" },
      ],
      mistake: {
        wrong: "By next March, I will have work here for five years.", right: "By next March, I will have worked here for five years.",
        why: { english: "The future perfect needs the past participle after will have.", vietnamese: "Thì tương lai hoàn thành cần quá khứ phân từ sau will have." },
      },
    }],
    examples: [
      { english: "We'll have reached our target by the end of the month.", vietnamese: "Chúng tôi sẽ đạt chỉ tiêu trước cuối tháng." },
      { english: "Is the project on schedule, or will we miss the deadline?", vietnamese: "Dự án có đúng tiến độ không, hay chúng ta sẽ trễ hạn?" },
      { english: "By the time she retires, she'll have taught for forty years.", vietnamese: "Đến khi nghỉ hưu, bà ấy sẽ đã dạy học được bốn mươi năm." },
      { english: "In five years' time I'll be running my own business.", vietnamese: "Năm năm nữa tôi sẽ đang điều hành công ty riêng." },
    ],
    dialogue: [
      { speaker: "Interviewer", english: "Where do you see your career in five years?", vietnamese: "Bạn thấy sự nghiệp của mình năm năm nữa sẽ ra sao?" },
      { speaker: "Phuong", english: "I hope I'll be managing a small team.", vietnamese: "Tôi hy vọng khi đó tôi sẽ đang quản lý một nhóm nhỏ." },
      { speaker: "Interviewer", english: "And what will you have achieved by then?", vietnamese: "Và đến lúc đó bạn sẽ đạt được những gì?" },
      { speaker: "Phuong", english: "I'll have finished my MBA, and I'll have launched at least two products.", vietnamese: "Tôi sẽ hoàn thành bằng MBA, và sẽ ra mắt ít nhất hai sản phẩm." },
      { speaker: "Interviewer", english: "Ambitious. Do you usually meet your deadlines?", vietnamese: "Đầy tham vọng. Bạn có thường hoàn thành đúng hạn không?" },
      { speaker: "Phuong", english: "Always. In my last job, every project I led was on schedule.", vietnamese: "Luôn luôn. Ở công việc trước, mọi dự án tôi phụ trách đều đúng tiến độ." },
    ],
    practice: [
      q("Complete: At 8 p.m. tonight, I'll ___ dinner.", ["be having", "have had", "having", "have"], "be having", "In progress: will be + -ing."),
      q("Complete: By Friday, I'll ___ the report.", ["have finished", "be finish", "finished", "have finish"], "have finished", "Finished by then: will have + past participle."),
      q("Complete: Please send it ___ Monday at the latest.", ["by", "until", "since", "for"], "by", "By = not later than."),
      q("“Hạn chót” in English is…", ["deadline", "dead time", "last line", "due line"], "deadline", "Deadline = latest time."),
    ],
    challenge: [
      q("Complete: This time next month we'll ___ in our new office.", ["be working", "have worked", "work", "working"], "be working", "In progress at a future time."),
      q("Complete: By 2030, they ___ the new metro line.", ["will have built", "will build", "will be build", "have built"], "will have built", "Complete before a future time."),
      q("Choose the correct sentence.", ["In July I'll have lived here for ten years.", "In July I'll live here for ten years.", "In July I'll have live here for ten years.", "In July I've lived here for ten years."], "In July I'll have lived here for ten years.", "Will have + past participle + for."),
      q("Complete: She got a ___ and now she's the manager.", ["promotion", "promise", "deadline", "target"], "promotion", "Promotion = a more important job."),
      q("What does “on schedule” mean?", ["happening at the planned time", "very late", "cancelled", "too early"], "happening at the planned time", "On schedule = on time."),
    ],
  }, {
    key: "meetings", title: "Shall We Get Started?", titleVi: "Họp hành",
    objectives: [
      "I can take part in a meeting in English.",
      "Make suggestions with Why don't we…?, How about + -ing and Shall we…?",
      "Interrupt and hold the floor politely",
    ],
    vocabulary: [
      { word: "agenda", ipa: "/əˈdʒendə/", partOfSpeech: "noun", vietnamese: "chương trình họp", definition: "a list of things to discuss at a meeting", example: { english: "There are four items on the agenda today.", vietnamese: "Hôm nay có bốn mục trong chương trình họp." } },
      { word: "chair", ipa: "/tʃeə/", partOfSpeech: "verb", vietnamese: "chủ trì", definition: "to be in charge of a meeting", example: { english: "Ms Hoa will chair the meeting.", vietnamese: "Chị Hoa sẽ chủ trì cuộc họp." } },
      { word: "minutes", ipa: "/ˈmɪnɪts/", partOfSpeech: "noun", vietnamese: "biên bản họp", definition: "a written record of what was said at a meeting", example: { english: "Could you take the minutes, please?", vietnamese: "Bạn ghi biên bản giúp nhé?" } },
      { word: "postpone", ipa: "/pəˈspəʊn/", partOfSpeech: "verb", vietnamese: "hoãn lại", definition: "to move an event to a later time", example: { english: "We've had to postpone the meeting until Thursday.", vietnamese: "Chúng tôi đã phải hoãn cuộc họp đến thứ Năm." } },
      { word: "sum up", ipa: "/ˌsʌm ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "tóm tắt", definition: "to give the main points again briefly", example: { english: "Let me sum up what we've agreed.", vietnamese: "Để tôi tóm tắt những gì chúng ta đã thống nhất." } },
      { word: "brainstorm", ipa: "/ˈbreɪnstɔːm/", partOfSpeech: "verb", vietnamese: "động não, cùng đưa ý tưởng", definition: "to share lots of ideas quickly as a group", example: { english: "Let's brainstorm some names for the product.", vietnamese: "Hãy cùng nghĩ vài cái tên cho sản phẩm." } },
      { word: "go over", ipa: "/ˌɡəʊ ˈəʊvə/", partOfSpeech: "phrasal verb", vietnamese: "xem lại, rà soát", definition: "to look at or explain something again carefully", example: { english: "Let's go over the figures one more time.", vietnamese: "Hãy rà soát các con số thêm một lần nữa." } },
      { word: "point of view", ipa: "/ˌpɔɪnt əv ˈvjuː/", partOfSpeech: "phrase", vietnamese: "quan điểm, góc nhìn", definition: "a way of thinking about something", example: { english: "From a customer's point of view, the price is too high.", vietnamese: "Từ góc nhìn của khách hàng, giá quá cao." } },
    ],
    grammar: [{
      title: "Making suggestions",
      pattern: "Why don't we + verb? · Shall we + verb? · Let's + verb · How about / What about + verb-ing?",
      explanation: {
        english: "Different phrases for suggestions take different verb forms. Why don't we, Shall we and Let's take the base verb: Why don't we take a break? Shall we start? Let's move on. How about and What about take -ing (or a noun): How about meeting on Friday? What about a video call?",
        vietnamese: "Các cụm đưa ra gợi ý đi với dạng động từ khác nhau. Why don't we, Shall we và Let's đi với động từ nguyên mẫu: Why don't we take a break? Shall we start? Let's move on. How about và What about đi với -ing (hoặc danh từ): How about meeting on Friday? What about a video call?",
      },
      examples: [
        { english: "Shall we go over the agenda first?", vietnamese: "Chúng ta xem qua chương trình họp trước nhé?" },
        { english: "What about asking the customers what they think?", vietnamese: "Hay là hỏi khách hàng xem họ nghĩ gì?" },
      ],
      mistake: {
        wrong: "How about postpone the meeting?", right: "How about postponing the meeting?",
        why: { english: "How about is followed by -ing.", vietnamese: "Sau How about là dạng -ing." },
      },
    }, {
      title: "Interrupting politely",
      pattern: "Sorry to interrupt, but… · Could I just come in here? · If I could just finish… · Going back to what you said…",
      explanation: {
        english: "In British meetings, people interrupt softly. Start with an apology or a request: Sorry to interrupt, but… / Could I just add something? To keep speaking when someone interrupts you, say: If I could just finish my point… To return to an earlier idea: Going back to what Lan said…",
        vietnamese: "Trong các cuộc họp ở Anh, người ta ngắt lời một cách nhẹ nhàng. Bắt đầu bằng lời xin lỗi hoặc lời đề nghị: Sorry to interrupt, but… / Could I just add something? Để tiếp tục nói khi bị ngắt lời, nói: If I could just finish my point… Để quay lại ý trước: Going back to what Lan said…",
      },
      examples: [
        { english: "Sorry to interrupt, but we only have five minutes left.", vietnamese: "Xin lỗi đã ngắt lời, nhưng chúng ta chỉ còn năm phút." },
        { english: "If I could just finish, I think the budget is the real problem.", vietnamese: "Cho tôi nói nốt, tôi nghĩ ngân sách mới là vấn đề thực sự." },
      ],
      mistake: {
        wrong: "Stop! I want to say something.", right: "Sorry, could I just come in here?",
        why: { english: "Direct orders sound rude in a meeting. Ask politely instead.", vietnamese: "Ra lệnh trực tiếp nghe rất bất lịch sự trong cuộc họp. Hãy hỏi một cách lịch sự." },
      },
    }],
    examples: [
      { english: "Let's brainstorm first and make a decision later.", vietnamese: "Hãy cùng đưa ý tưởng trước rồi quyết định sau." },
      { english: "Who's going to take the minutes today?", vietnamese: "Hôm nay ai sẽ ghi biên bản?" },
      { english: "I understand your point of view, but the cost is too high.", vietnamese: "Tôi hiểu quan điểm của bạn, nhưng chi phí quá cao." },
      { english: "To sum up, we'll postpone the launch until June.", vietnamese: "Tóm lại, chúng ta sẽ hoãn ra mắt đến tháng Sáu." },
    ],
    dialogue: [
      { speaker: "Chair", english: "Right, shall we get started? First item on the agenda: the summer campaign.", vietnamese: "Được rồi, chúng ta bắt đầu nhé? Mục đầu tiên: chiến dịch mùa hè." },
      { speaker: "Tung", english: "Why don't we use more video this year?", vietnamese: "Năm nay sao chúng ta không dùng nhiều video hơn?" },
      { speaker: "Rachel", english: "Good idea. How about working with local influencers too?", vietnamese: "Ý hay. Còn hợp tác thêm với người có ảnh hưởng ở địa phương thì sao?" },
      { speaker: "Tung", english: "Sorry to interrupt, but isn't that expensive?", vietnamese: "Xin lỗi đã ngắt lời, nhưng như thế có tốn kém không?" },
      { speaker: "Rachel", english: "If I could just finish, smaller ones are quite cheap.", vietnamese: "Cho tôi nói nốt, những người nhỏ hơn thì khá rẻ." },
      { speaker: "Chair", english: "Let me sum up: more video, and Rachel will look into influencers.", vietnamese: "Để tôi tóm tắt: thêm video, và Rachel sẽ tìm hiểu về người có ảnh hưởng." },
    ],
    practice: [
      q("Complete: Why don't we ___ a short break?", ["take", "taking", "to take", "took"], "take", "Why don't we + base verb."),
      q("Complete: How about ___ the meeting to Monday?", ["moving", "move", "to move", "moved"], "moving", "How about + -ing."),
      q("Which is the most polite way to interrupt?", ["Sorry to interrupt, but…", "Be quiet, I'm talking.", "No, listen to me.", "Wait!"], "Sorry to interrupt, but…", "Apologise first."),
      q("“Biên bản họp” in English is…", ["minutes", "hours", "notes paper", "agenda"], "minutes", "Minutes = record of a meeting."),
    ],
    challenge: [
      q("Complete: ___ we start? Everyone's here.", ["Shall", "How about", "What about", "Let's"], "Shall", "Shall we + base verb?"),
      q("Complete: We have to ___ the meeting because the boss is ill.", ["postpone", "post", "prepone", "go over"], "postpone", "Postpone = move to later."),
      q("Choose the correct sentence.", ["Let's go over the figures again.", "Let's going over the figures again.", "Let's to go over the figures again.", "Let go over the figures again."], "Let's go over the figures again.", "Let's + base verb."),
      q("Complete: If I could just ___ my point…", ["finish", "finishing", "to finish", "finished"], "finish", "If I could just + base verb."),
      q("What does it mean to “chair” a meeting?", ["to be in charge of it", "to sit down in it", "to cancel it", "to write the minutes"], "to be in charge of it", "Chair = lead."),
    ],
  }, {
    key: "presentations", title: "Giving a Presentation", titleVi: "Thuyết trình",
    objectives: [
      "I can give a clear, well-organised presentation.",
      "Guide the audience with signposting phrases, and talk about (not say about) a topic",
      "Describe trends with rise, fall and by",
    ],
    vocabulary: [
      { word: "audience", ipa: "/ˈɔːdiəns/", partOfSpeech: "noun", vietnamese: "khán giả, người nghe", definition: "the people listening to a talk or watching a show", example: { english: "The audience asked some difficult questions.", vietnamese: "Khán giả đặt vài câu hỏi khó." } },
      { word: "slide", ipa: "/slaɪd/", partOfSpeech: "noun", vietnamese: "trang trình chiếu", definition: "one page of a presentation shown on a screen", example: { english: "As you can see on this slide, sales are up.", vietnamese: "Như các bạn thấy trên trang chiếu này, doanh số đã tăng." } },
      { word: "outline", ipa: "/ˈaʊtlaɪn/", partOfSpeech: "verb", vietnamese: "trình bày khái quát", definition: "to give the main points without details", example: { english: "First, I'll outline the main problems.", vietnamese: "Đầu tiên, tôi sẽ trình bày khái quát các vấn đề chính." } },
      { word: "highlight", ipa: "/ˈhaɪlaɪt/", partOfSpeech: "verb", vietnamese: "nhấn mạnh, làm nổi bật", definition: "to draw attention to something important", example: { english: "I'd like to highlight three key results.", vietnamese: "Tôi muốn nhấn mạnh ba kết quả chính." } },
      { word: "point out", ipa: "/ˌpɔɪnt ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "chỉ ra", definition: "to tell someone a fact they may not have noticed", example: { english: "She pointed out a mistake in the figures.", vietnamese: "Cô ấy chỉ ra một lỗi trong các con số." } },
      { word: "move on to", ipa: "/ˌmuːv ˈɒn tə/", partOfSpeech: "phrasal verb", vietnamese: "chuyển sang", definition: "to start talking about the next subject", example: { english: "Let's move on to the budget.", vietnamese: "Chúng ta chuyển sang phần ngân sách." } },
      { word: "figure", ipa: "/ˈfɪɡə/", partOfSpeech: "noun", vietnamese: "con số, số liệu", definition: "a number, especially in official information", example: { english: "The latest figures show a sharp rise in sales.", vietnamese: "Số liệu mới nhất cho thấy doanh số tăng mạnh." } },
      { word: "sharply", ipa: "/ˈʃɑːpli/", partOfSpeech: "adverb", vietnamese: "mạnh, đột ngột", definition: "suddenly and by a large amount", example: { english: "Prices rose sharply in the spring.", vietnamese: "Giá cả tăng mạnh vào mùa xuân." } },
    ],
    grammar: [{
      title: "Signposting",
      pattern: "First of all, I'll talk about… · Moving on to… · Let's turn to… · As you can see… · To sum up / In conclusion…",
      explanation: {
        english: "Signposting phrases tell the audience where you are in the talk. Open with an outline: Today I'm going to talk about three things. Change sections with Moving on to… or Let's turn to… Close with To sum up… Remember: we talk about or speak about a topic, but we never say about it.",
        vietnamese: "Các cụm dẫn dắt cho người nghe biết bạn đang ở phần nào của bài nói. Mở đầu bằng dàn ý: Today I'm going to talk about three things. Chuyển phần bằng Moving on to… hoặc Let's turn to… Kết thúc bằng To sum up… Hãy nhớ: ta nói talk about hoặc speak about một chủ đề, không bao giờ nói say about.",
      },
      examples: [
        { english: "Moving on to my second point, let's look at costs.", vietnamese: "Chuyển sang ý thứ hai, chúng ta hãy xem xét chi phí." },
        { english: "To sum up, the results are very encouraging.", vietnamese: "Tóm lại, kết quả rất đáng khích lệ." },
      ],
      mistake: {
        wrong: "Today I will say about our new product.", right: "Today I'm going to talk about our new product.",
        why: { english: "Use talk about or speak about a topic. Say about is not used this way.", vietnamese: "Dùng talk about hoặc speak about cho một chủ đề. Say about không dùng như vậy." },
      },
    }, {
      title: "Describing trends",
      pattern: "rise / increase / fall / drop + adverb (sharply, slightly, steadily) · by (the change) · to (the new level) · a sharp rise in …",
      explanation: {
        english: "To describe numbers, use rise, increase, fall or drop with an adverb: Sales rose sharply. Use by for the size of the change and to for the final level: Profits fell by 10%, to £2 million. You can also use the noun with an adjective: There was a slight drop in prices.",
        vietnamese: "Để mô tả số liệu, dùng rise, increase, fall hoặc drop với trạng từ: Sales rose sharply. Dùng by cho mức thay đổi và to cho mức cuối cùng: Profits fell by 10%, to £2 million. Cũng có thể dùng danh từ với tính từ: There was a slight drop in prices.",
      },
      examples: [
        { english: "The number of users increased steadily throughout the year.", vietnamese: "Số người dùng tăng đều suốt cả năm." },
        { english: "There was a sharp fall in visitors during the storm.", vietnamese: "Lượng khách giảm mạnh trong thời gian có bão." },
      ],
      mistake: {
        wrong: "Sales rose with 20% last year.", right: "Sales rose by 20% last year.",
        why: { english: "For the size of a change, use by.", vietnamese: "Với mức độ thay đổi, dùng by." },
      },
    }],
    examples: [
      { english: "First, I'll outline the plan, and then I'll highlight the risks.", vietnamese: "Đầu tiên, tôi sẽ trình bày khái quát kế hoạch, sau đó nhấn mạnh các rủi ro." },
      { english: "As you can see on this slide, the figures rose sharply in May.", vietnamese: "Như các bạn thấy trên trang chiếu này, các con số tăng mạnh vào tháng Năm." },
      { english: "I'd like to point out that these are only early results.", vietnamese: "Tôi muốn chỉ ra rằng đây chỉ là kết quả ban đầu." },
      { english: "Now let's move on to your questions.", vietnamese: "Bây giờ chúng ta chuyển sang phần câu hỏi của các bạn." },
    ],
    dialogue: [
      { speaker: "Kien", english: "Good morning, everyone. Today I'm going to talk about our first year in the UK.", vietnamese: "Chào buổi sáng mọi người. Hôm nay tôi sẽ nói về năm đầu tiên của chúng ta ở Anh." },
      { speaker: "Kien", english: "First of all, I'll outline our main results.", vietnamese: "Trước hết, tôi sẽ trình bày khái quát các kết quả chính." },
      { speaker: "Kien", english: "As you can see on this slide, sales rose sharply in the second half.", vietnamese: "Như các bạn thấy trên trang chiếu này, doanh số tăng mạnh trong nửa cuối năm." },
      { speaker: "Audience member", english: "Sorry, could you repeat the figure for December?", vietnamese: "Xin lỗi, anh có thể nhắc lại con số của tháng Mười hai không?" },
      { speaker: "Kien", english: "Of course. Sales went up by 30%, to £50,000.", vietnamese: "Tất nhiên. Doanh số tăng 30%, lên 50.000 bảng." },
      { speaker: "Kien", english: "Moving on to next year, I'd like to highlight two opportunities.", vietnamese: "Chuyển sang năm tới, tôi muốn nhấn mạnh hai cơ hội." },
    ],
    practice: [
      q("Complete: Today I'm going to ___ about our results.", ["talk", "say", "tell", "speak to"], "talk", "Talk about a topic."),
      q("Complete: Prices increased ___ 5%.", ["by", "with", "of", "at"], "by", "By = the size of the change."),
      q("Which phrase starts a new section?", ["Moving on to…", "Thank you for listening.", "Any questions?", "Good morning."], "Moving on to…", "Signposting a new section."),
      q("“Khán giả” in English is…", ["audience", "audition", "viewers room", "listening"], "audience", "Audience = people listening."),
    ],
    challenge: [
      q("Complete: Sales fell from £80,000 ___ £60,000.", ["to", "by", "with", "at"], "to", "To = the final level."),
      q("Complete: There was a sharp ___ in prices last month.", ["rise", "rose", "rising up", "raise up"], "rise", "Noun: a sharp rise in."),
      q("Choose the correct sentence.", ["I'd like to point out one problem.", "I'd like to point one problem out of.", "I'd like to say about one problem.", "I'd like to point on one problem."], "I'd like to point out one problem.", "Point out = draw attention to."),
      q("Complete: The number of visitors grew ___ all year.", ["steadily", "steady", "steadiness", "steadied"], "steadily", "Verb + adverb."),
      q("What does it mean to “highlight” something?", ["to draw attention to it", "to hide it", "to delete it", "to repeat it"], "to draw attention to it", "Highlight = emphasise."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 2", isReview: true,
    objectives: [
      "I can communicate clearly at work, in writing, in meetings and in presentations.",
      "Check make and do, uncountable nouns, register, future forms, suggestions and trends",
    ],
    vocabulary: [
      { word: "make progress", ipa: "/ˌmeɪk ˈprəʊɡres/", partOfSpeech: "collocation", vietnamese: "tiến bộ", definition: "to get better or move forward", example: { english: "My English is making progress at last.", vietnamese: "Cuối cùng tiếng Anh của tôi cũng tiến bộ." } },
      { word: "do research", ipa: "/ˌduː rɪˈsɜːtʃ/", partOfSpeech: "collocation", vietnamese: "nghiên cứu", definition: "to study something carefully to find out facts", example: { english: "Do some research before you buy a laptop.", vietnamese: "Hãy tìm hiểu kỹ trước khi mua máy tính xách tay." } },
      { word: "formal", ipa: "/ˈfɔːml/", partOfSpeech: "adjective", vietnamese: "trang trọng", definition: "used in serious or official situations", example: { english: "A cover letter should be formal.", vietnamese: "Thư xin việc nên trang trọng." } },
      { word: "deadline", ipa: "/ˈdedlaɪn/", partOfSpeech: "noun", vietnamese: "hạn chót", definition: "the time by which something must be finished", example: { english: "I work best under a deadline.", vietnamese: "Tôi làm việc tốt nhất khi có hạn chót." } },
      { word: "agenda", ipa: "/əˈdʒendə/", partOfSpeech: "noun", vietnamese: "chương trình họp", definition: "a list of things to discuss at a meeting", example: { english: "Please send the agenda before the meeting.", vietnamese: "Vui lòng gửi chương trình họp trước cuộc họp." } },
      { word: "audience", ipa: "/ˈɔːdiəns/", partOfSpeech: "noun", vietnamese: "khán giả, người nghe", definition: "the people listening to a talk or watching a show", example: { english: "Make eye contact with your audience.", vietnamese: "Hãy giao tiếp bằng mắt với người nghe." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "make a mistake / do research · some feedback · Could you tell me where it is? · I'll be working / I'll have finished · How about meeting? · rose by 10%",
      explanation: {
        english: "Check these: make for results and creating, do for tasks; research, feedback and advice have no -s; keep a formal email formal, and use normal order in indirect questions; will be + -ing for an action in progress, will have + past participle for something done by a time; Why don't we / Shall we / Let's take the base verb, How about takes -ing; talk about a topic, and use by for the size of a change.",
        vietnamese: "Hãy kiểm tra: make cho kết quả và việc tạo ra, do cho nhiệm vụ; research, feedback và advice không có -s; giữ email trang trọng từ đầu đến cuối, và dùng trật tự bình thường trong câu hỏi gián tiếp; will be + -ing cho hành động đang diễn ra, will have + quá khứ phân từ cho việc xong trước một thời điểm; Why don't we / Shall we / Let's đi với động từ nguyên mẫu, How about đi với -ing; talk about một chủ đề, và dùng by cho mức thay đổi.",
      },
      examples: [
        { english: "By the deadline, we'll have done all the research.", vietnamese: "Đến hạn chót, chúng ta sẽ hoàn thành toàn bộ phần nghiên cứu." },
        { english: "How about adding the figures to the agenda?", vietnamese: "Hay là đưa các số liệu vào chương trình họp?" },
      ],
    }],
    examples: [
      { english: "We're making progress, but we'll need more time to do research.", vietnamese: "Chúng tôi đang tiến bộ, nhưng sẽ cần thêm thời gian để nghiên cứu." },
      { english: "The audience enjoyed the talk, although it was quite formal.", vietnamese: "Khán giả thích bài nói, dù nó khá trang trọng." },
      { english: "Item three on the agenda is the new deadline.", vietnamese: "Mục ba trong chương trình họp là hạn chót mới." },
    ],
    dialogue: [
      { speaker: "Manager", english: "Will you have finished the presentation by Thursday?", vietnamese: "Bạn có hoàn thành bài thuyết trình trước thứ Năm không?" },
      { speaker: "Lan", english: "Yes. I'm making good progress. I'll be practising it on Wednesday.", vietnamese: "Có ạ. Em đang làm tốt. Thứ Tư em sẽ tập dượt." },
      { speaker: "Manager", english: "Great. Who's the audience?", vietnamese: "Tốt. Người nghe là ai?" },
      { speaker: "Lan", english: "The board, so I've kept the language formal.", vietnamese: "Ban giám đốc, nên em đã giữ ngôn ngữ trang trọng." },
      { speaker: "Manager", english: "Good. How about adding last year's figures?", vietnamese: "Tốt. Hay là thêm số liệu năm ngoái vào?" },
      { speaker: "Lan", english: "Good idea. They show that sales rose by 15%.", vietnamese: "Ý hay ạ. Chúng cho thấy doanh số tăng 15%." },
      { speaker: "Manager", english: "Perfect. And please send me some feedback from the client meeting.", vietnamese: "Tuyệt. Và gửi tôi vài phản hồi từ buổi họp với khách hàng nhé." },
    ],
    practice: [
      q("Complete: We need to ___ a decision today.", ["make", "do", "take on", "have"], "make", "Make a decision."),
      q("Complete: Could you tell me what time it ___?", ["is", "is it", "does", "does it be"], "is", "Normal order."),
      q("Complete: At noon tomorrow I'll ___ on the train.", ["be sitting", "have sat", "sit", "sitting"], "be sitting", "In progress: will be + -ing."),
      q("Complete: How about ___ a video call?", ["having", "have", "to have", "had"], "having", "How about + -ing."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["They gave us a lot of useful information.", "They gave us a lot of useful informations.", "They gave us an useful information.", "They gave us many useful information."], "They gave us a lot of useful information.", "Information is uncountable."),
      q("Which is formal?", ["I would be grateful if you could assist me.", "Can you give me a hand?", "Help me out, yeah?", "Sort this for me?"], "I would be grateful if you could assist me.", "Formal words."),
      q("Complete: By June, I'll ___ here for a year.", ["have worked", "be work", "worked", "have work"], "have worked", "Will have + past participle."),
      q("Complete: Today I'd like to ___ about our plans.", ["talk", "say", "tell", "speak to"], "talk", "Talk about."),
      q("Complete: Costs dropped ___ 8%.", ["by", "with", "of", "on"], "by", "By = the size of the change."),
    ],
  }],
  assessment: [
    { id: "make-mistake", prompt: "Complete: I ___ a mistake in the email.", options: ["made", "did", "took", "had"], correct: "made", explanation: "Make a mistake." },
    { id: "do-research", prompt: "“Nghiên cứu về thị trường” in English is…", options: ["do research into the market", "make research into the market", "do researches of the market", "make a research to the market"], correct: "do research into the market", explanation: "Do research (uncountable)." },
    { id: "do-favour", prompt: "Complete: Could you ___ me a favour?", options: ["do", "make", "give", "have"], correct: "do", explanation: "Do someone a favour." },
    { id: "uncountable-advice", prompt: "Choose the correct sentence.", options: ["She gave me some good advice.", "She gave me some good advices.", "She gave me a good advice.", "She gave me many good advice."], correct: "She gave me some good advice.", explanation: "Advice is uncountable." },
    { id: "formal-enquire", prompt: "Which is the best opening for a formal email?", options: ["I am writing to enquire about the position.", "Just wanna ask about the job.", "Hey, about that job…", "What's the job like?"], correct: "I am writing to enquire about the position.", explanation: "Formal words and full forms." },
    { id: "look-forward-to", prompt: "Complete: I look forward to ___ you.", options: ["meeting", "meet", "met", "be meeting"], correct: "meeting", explanation: "Look forward to + -ing." },
    { id: "indirect-question", prompt: "Choose the correct sentence.", options: ["Could you tell me how much it costs?", "Could you tell me how much does it cost?", "Could you tell me how much it does cost?", "Could you tell me how much costs it?"], correct: "Could you tell me how much it costs?", explanation: "Normal order." },
    { id: "future-continuous", prompt: "Complete: This time next week I'll ___ on holiday.", options: ["be relaxing", "have relaxed", "relax", "relaxing"], correct: "be relaxing", explanation: "In progress: will be + -ing." },
    { id: "future-perfect", prompt: "Complete: By 2030, we ___ the factory.", options: ["will have built", "will build", "will be build", "have built"], correct: "will have built", explanation: "Complete before a future time." },
    { id: "by-deadline", prompt: "Complete: Please submit your work ___ Friday.", options: ["by", "until", "since", "for"], correct: "by", explanation: "By = not later than." },
    { id: "why-dont-we", prompt: "Complete: Why don't we ___ the meeting?", options: ["postpone", "postponing", "to postpone", "postponed"], correct: "postpone", explanation: "Why don't we + base verb." },
    { id: "how-about", prompt: "Complete: How about ___ a break?", options: ["taking", "take", "to take", "took"], correct: "taking", explanation: "How about + -ing." },
    { id: "talk-about", prompt: "“Hôm nay tôi sẽ nói về dự án.” in English is…", options: ["Today I'm going to talk about the project.", "Today I'm going to say about the project.", "Today I'm going to tell about the project.", "Today I'm going to speak the project."], correct: "Today I'm going to talk about the project.", explanation: "Talk about a topic." },
    { id: "rise-by", prompt: "Complete: Profits rose ___ 12% last year.", options: ["by", "with", "of", "at"], correct: "by", explanation: "By = the size of the change." },
    { id: "sharp-rise", prompt: "Complete: There was a ___ rise in prices.", options: ["sharp", "sharply", "sharpen", "sharpness"], correct: "sharp", explanation: "Adjective before the noun rise." },
  ],
};
