// C1 Unit 3: Science & Ethics. Advanced Vietnamese speakers often use will for plans that didn't happen ("I will call
// you yesterday") or after a past verb ("I knew she will win"); add -s or should where the subjunctive needs the base
// verb ("It's essential that every patient gives consent"); use the present after "it's high time"; put the wrong
// form after "opposed to"; say "needn't to have"; and treat albeit like although ("albeit it was slow"). This unit puts
// those right for discussing science and its ethical questions.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "C1",
  number: 3,
  lessons: [{
    key: "future-in-the-past", title: "I Was Going to Call You", titleVi: "Tương lai trong quá khứ",
    objectives: [
      "I can talk about past plans, including ones that didn't happen.",
      "Use was going to + verb for plans that changed",
      "Use would, was about to and was on the verge of to look forward from the past",
    ],
    vocabulary: [
      { word: "intend", ipa: "/ɪnˈtend/", partOfSpeech: "verb", vietnamese: "dự định", definition: "to plan to do something", example: { english: "I intended to finish the experiment, but I ran out of time.", vietnamese: "Tôi đã dự định hoàn thành thí nghiệm, nhưng hết thời gian." } },
      { word: "be about to", ipa: "/bi əˈbaʊt tə/", partOfSpeech: "phrase", vietnamese: "sắp sửa", definition: "to be going to do something very soon", example: { english: "We were about to leave when the results arrived.", vietnamese: "Chúng tôi sắp đi thì kết quả đến." } },
      { word: "on the verge of", ipa: "/ɒn ðə ˈvɜːdʒ əv/", partOfSpeech: "phrase", vietnamese: "trên bờ vực, sắp", definition: "very close to doing or experiencing something", example: { english: "Scientists were on the verge of a breakthrough.", vietnamese: "Các nhà khoa học sắp có một bước đột phá." } },
      { word: "breakthrough", ipa: "/ˈbreɪkθruː/", partOfSpeech: "noun", vietnamese: "bước đột phá", definition: "an important new discovery", example: { english: "The vaccine was a major breakthrough.", vietnamese: "Vắc-xin là một bước đột phá lớn." } },
      { word: "abandon", ipa: "/əˈbændən/", partOfSpeech: "verb", vietnamese: "từ bỏ", definition: "to stop doing something before it is finished", example: { english: "The project was abandoned due to lack of funding.", vietnamese: "Dự án bị từ bỏ do thiếu kinh phí." } },
      { word: "foresee", ipa: "/fɔːˈsiː/", partOfSpeech: "verb", vietnamese: "thấy trước, lường trước", definition: "to know that something will happen before it does", example: { english: "Nobody could have foreseen the side effects.", vietnamese: "Không ai có thể lường trước các tác dụng phụ." } },
      { word: "call off", ipa: "/ˌkɔːl ˈɒf/", partOfSpeech: "phrasal verb", vietnamese: "huỷ bỏ", definition: "to cancel an event or plan", example: { english: "They called off the trial after two patients fell ill.", vietnamese: "Họ huỷ thử nghiệm sau khi hai bệnh nhân bị ốm." } },
      { word: "prototype", ipa: "/ˈprəʊtətaɪp/", partOfSpeech: "noun", vietnamese: "nguyên mẫu, mẫu thử", definition: "the first model of a new machine or product", example: { english: "The prototype was going to be tested in May.", vietnamese: "Nguyên mẫu dự kiến được thử nghiệm vào tháng Năm." } },
    ],
    grammar: [{
      title: "Was going to",
      pattern: "was / were going to + base verb (a plan in the past, often one that didn't happen)",
      explanation: {
        english: "To talk about a past plan, use was or were going to + base verb. Often the plan changed, so a but clause follows: I was going to call you, but my phone died. We were going to launch in May, but the prototype failed. Will cannot look back like this.",
        vietnamese: "Để nói về một kế hoạch trong quá khứ, dùng was hoặc were going to + động từ nguyên mẫu. Thường kế hoạch đó đã thay đổi, nên theo sau là mệnh đề but: I was going to call you, but my phone died. We were going to launch in May, but the prototype failed. Will không dùng để nhìn lại quá khứ như vậy.",
      },
      examples: [
        { english: "She was going to study medicine, but she chose physics.", vietnamese: "Cô ấy định học y, nhưng lại chọn vật lý." },
        { english: "They were going to publish the results, but they found an error.", vietnamese: "Họ định công bố kết quả, nhưng phát hiện một lỗi." },
      ],
      mistake: {
        wrong: "I will call you yesterday, but I forgot.", right: "I was going to call you yesterday, but I forgot.",
        why: { english: "For a past plan, use was going to, not will.", vietnamese: "Với kế hoạch trong quá khứ, dùng was going to, không dùng will." },
      },
    }, {
      title: "Would and was about to",
      pattern: "past verb + that + subject + would + verb · was about to / was on the verge of + -ing (very soon after)",
      explanation: {
        english: "After a past verb like knew, thought or said, use would for what was in the future at that time: I knew she would succeed. For something that was just going to happen, use was about to + verb, or was on the verge of + -ing / noun: We were on the verge of giving up when the data came in.",
        vietnamese: "Sau động từ quá khứ như knew, thought hoặc said, dùng would cho điều là tương lai tại thời điểm đó: I knew she would succeed. Với điều sắp xảy ra ngay, dùng was about to + động từ, hoặc was on the verge of + -ing / danh từ: We were on the verge of giving up when the data came in.",
      },
      examples: [
        { english: "Nobody foresaw that the discovery would change medicine.", vietnamese: "Không ai lường trước được phát hiện đó sẽ thay đổi y học." },
        { english: "I was about to call off the experiment when it worked.", vietnamese: "Tôi sắp huỷ thí nghiệm thì nó thành công." },
      ],
      mistake: {
        wrong: "I knew that she will win the prize.", right: "I knew that she would win the prize.",
        why: { english: "After a past verb, will becomes would.", vietnamese: "Sau động từ quá khứ, will đổi thành would." },
      },
    }],
    examples: [
      { english: "We intended to test the prototype, but the funding was cut.", vietnamese: "Chúng tôi định thử nghiệm nguyên mẫu, nhưng kinh phí bị cắt." },
      { english: "They were on the verge of a breakthrough when the lab closed.", vietnamese: "Họ sắp có bước đột phá thì phòng thí nghiệm đóng cửa." },
      { english: "Few people foresaw that the project would be abandoned.", vietnamese: "Ít ai lường trước được dự án sẽ bị từ bỏ." },
      { english: "The launch was going to be in June, but it was called off.", vietnamese: "Đợt ra mắt dự kiến vào tháng Sáu, nhưng đã bị huỷ." },
    ],
    dialogue: [
      { speaker: "Journalist", english: "Your team was close to a cure. What happened?", vietnamese: "Nhóm của bà đã gần tìm ra cách chữa. Chuyện gì đã xảy ra?" },
      { speaker: "Prof. Lan", english: "We were going to start human trials last spring.", vietnamese: "Chúng tôi định bắt đầu thử nghiệm trên người vào mùa xuân năm ngoái." },
      { speaker: "Prof. Lan", english: "We were on the verge of a breakthrough, but our funding was withdrawn.", vietnamese: "Chúng tôi sắp có bước đột phá, nhưng kinh phí bị rút." },
      { speaker: "Journalist", english: "Did you foresee that?", vietnamese: "Bà có lường trước điều đó không?" },
      { speaker: "Prof. Lan", english: "No. We knew the research would be expensive, but not that it would be abandoned.", vietnamese: "Không. Chúng tôi biết nghiên cứu sẽ tốn kém, nhưng không nghĩ nó sẽ bị từ bỏ." },
      { speaker: "Prof. Lan", english: "Luckily, a new sponsor came forward just as we were about to give up.", vietnamese: "May mắn là một nhà tài trợ mới xuất hiện ngay lúc chúng tôi sắp bỏ cuộc." },
    ],
    practice: [
      q("Complete: I ___ email you, but I forgot.", ["was going to", "will", "am going to", "would have"], "was going to", "Past plan."),
      q("Complete: I thought it ___ rain, so I took an umbrella.", ["would", "will", "is going", "shall"], "would", "After a past verb: would."),
      q("Complete: We were ___ to leave when he arrived.", ["about", "going about", "on", "verge"], "about", "Was about to."),
      q("“Bước đột phá” in English is…", ["breakthrough", "breakout", "breakdown", "through-break"], "breakthrough", "Breakthrough = important discovery."),
    ],
    challenge: [
      q("Complete: She was on the verge ___ giving up.", ["of", "to", "for", "at"], "of", "On the verge of + -ing."),
      q("Choose the correct sentence.", ["He said he would finish it by Friday.", "He said he will finish it by Friday last week.", "He said he finishes it by Friday.", "He said he would finished it by Friday."], "He said he would finish it by Friday.", "Would after a past verb."),
      q("Complete: The match was ___ off because of the storm.", ["called", "put", "taken", "turned"], "called", "Call off = cancel."),
      q("Complete: Nobody could have ___ such a result.", ["foreseen", "foresaw", "forseen", "forsaw"], "foreseen", "Past participle of foresee."),
      q("What is a “prototype”?", ["the first model of a new product", "a final product", "a type of scientist", "a laboratory"], "the first model of a new product", "Prototype."),
    ],
  }, {
    key: "subjunctive", title: "It's Vital That She Be Told", titleVi: "Thức giả định",
    objectives: [
      "I can express urgent requirements formally.",
      "Use the subjunctive (base verb) after vital, essential, insist, recommend + that",
      "Use It's (high) time + past simple and would rather + subject + past simple",
    ],
    vocabulary: [
      { word: "vital", ipa: "/ˈvaɪtl/", partOfSpeech: "adjective", vietnamese: "sống còn, cực kỳ quan trọng", definition: "extremely important or necessary", example: { english: "It's vital that the samples be kept cold.", vietnamese: "Điều sống còn là mẫu phải được giữ lạnh." } },
      { word: "imperative", ipa: "/ɪmˈperətɪv/", partOfSpeech: "adjective", vietnamese: "bắt buộc, khẩn thiết", definition: "extremely important and urgent (formal)", example: { english: "It is imperative that we act now.", vietnamese: "Chúng ta bắt buộc phải hành động ngay." } },
      { word: "urge", ipa: "/ɜːdʒ/", partOfSpeech: "verb", vietnamese: "kêu gọi, thúc giục", definition: "to strongly advise someone to do something", example: { english: "Doctors urge that the public be vaccinated.", vietnamese: "Các bác sĩ kêu gọi người dân tiêm phòng." } },
      { word: "require", ipa: "/rɪˈkwaɪə/", partOfSpeech: "verb", vietnamese: "yêu cầu, đòi hỏi", definition: "to make something necessary, often by law or rule", example: { english: "The law requires that every patient give written consent.", vietnamese: "Luật yêu cầu mỗi bệnh nhân phải đồng ý bằng văn bản." } },
      { word: "mandatory", ipa: "/ˈmændətəri/", partOfSpeech: "adjective", vietnamese: "bắt buộc", definition: "required by a law or rule", example: { english: "Safety training is mandatory for all lab staff.", vietnamese: "Đào tạo an toàn là bắt buộc với mọi nhân viên phòng thí nghiệm." } },
      { word: "consent", ipa: "/kənˈsent/", partOfSpeech: "noun", vietnamese: "sự đồng ý, chấp thuận", definition: "permission for something to happen", example: { english: "No test can be done without the patient's consent.", vietnamese: "Không xét nghiệm nào được thực hiện nếu không có sự đồng ý của bệnh nhân." } },
      { word: "it's high time", ipa: "/ɪts ˌhaɪ ˈtaɪm/", partOfSpeech: "phrase", vietnamese: "đã đến lúc (lẽ ra phải làm từ lâu)", definition: "used to say something should have happened already (+ past simple)", example: { english: "It's high time we changed the rules.", vietnamese: "Đã đến lúc chúng ta phải thay đổi quy định." } },
      { word: "would rather", ipa: "/wʊd ˈrɑːðə/", partOfSpeech: "phrase", vietnamese: "thà, muốn… hơn", definition: "to prefer (+ base verb, or + someone + past simple)", example: { english: "I'd rather you didn't tell anyone yet.", vietnamese: "Tôi muốn bạn chưa nói với ai cả." } },
    ],
    grammar: [{
      title: "The subjunctive",
      pattern: "vital / essential / important / imperative + that + subject + base verb · insist / demand / recommend / require / urge + that + subject + base verb",
      explanation: {
        english: "After words of necessity and demand, formal English uses the base verb for every subject, with no -s and no past form: It's vital that she be told. The committee insisted that he resign. The negative is not + base verb: We recommend that it not be used. British English also often uses should: It's vital that she should be told.",
        vietnamese: "Sau các từ chỉ sự cần thiết và yêu cầu, tiếng Anh trang trọng dùng động từ nguyên mẫu cho mọi chủ ngữ, không thêm -s và không chia quá khứ: It's vital that she be told. The committee insisted that he resign. Phủ định là not + động từ nguyên mẫu: We recommend that it not be used. Tiếng Anh-Anh cũng hay dùng should: It's vital that she should be told.",
      },
      examples: [
        { english: "The ethics board demanded that the trial be stopped.", vietnamese: "Hội đồng đạo đức yêu cầu dừng thử nghiệm." },
        { english: "It is essential that every participant understand the risks.", vietnamese: "Điều cốt yếu là mọi người tham gia phải hiểu rõ rủi ro." },
      ],
      mistake: {
        wrong: "It's essential that every patient gives consent.", right: "It's essential that every patient give consent.",
        why: { english: "After essential that, use the base verb with no -s.", vietnamese: "Sau essential that, dùng động từ nguyên mẫu, không thêm -s." },
      },
    }, {
      title: "It's time and would rather",
      pattern: "It's (high / about) time + subject + past simple · would rather + subject + past simple (present meaning)",
      explanation: {
        english: "It's time and it's high time are followed by the past simple with a present meaning, showing that something should already be happening: It's high time we invested in clean energy. Would rather + another person also takes the past simple: I'd rather you didn't smoke here. With no new subject, would rather takes the base verb: I'd rather stay.",
        vietnamese: "It's time và it's high time đi với quá khứ đơn nhưng mang nghĩa hiện tại, cho thấy lẽ ra việc đó phải diễn ra rồi: It's high time we invested in clean energy. Would rather + một người khác cũng đi với quá khứ đơn: I'd rather you didn't smoke here. Nếu không có chủ ngữ mới, would rather đi với động từ nguyên mẫu: I'd rather stay.",
      },
      examples: [
        { english: "It's about time the government regulated this industry.", vietnamese: "Đã đến lúc chính phủ phải quản lý ngành này." },
        { english: "I'd rather they published the full data.", vietnamese: "Tôi muốn họ công bố toàn bộ dữ liệu hơn." },
      ],
      mistake: {
        wrong: "It's high time we start taking this seriously.", right: "It's high time we started taking this seriously.",
        why: { english: "It's high time is followed by the past simple.", vietnamese: "It's high time đi với quá khứ đơn." },
      },
    }],
    examples: [
      { english: "It is imperative that the data be checked independently.", vietnamese: "Bắt buộc dữ liệu phải được kiểm tra độc lập." },
      { english: "Scientists urge that the experiment not be repeated.", vietnamese: "Các nhà khoa học kêu gọi không lặp lại thí nghiệm." },
      { english: "Written consent is mandatory for all participants.", vietnamese: "Sự đồng ý bằng văn bản là bắt buộc với mọi người tham gia." },
      { english: "It's high time we had a proper debate about AI.", vietnamese: "Đã đến lúc chúng ta có một cuộc tranh luận nghiêm túc về AI." },
    ],
    dialogue: [
      { speaker: "Dr Hall", english: "The new drug looks promising, but we need to be careful.", vietnamese: "Thuốc mới có vẻ đầy hứa hẹn, nhưng chúng ta cần thận trọng." },
      { speaker: "Dr Quang", english: "Agreed. It's vital that every volunteer understand the risks.", vietnamese: "Đồng ý. Điều sống còn là mọi tình nguyện viên phải hiểu rủi ro." },
      { speaker: "Dr Hall", english: "The board requires that consent be given in writing.", vietnamese: "Hội đồng yêu cầu sự đồng ý phải bằng văn bản." },
      { speaker: "Dr Quang", english: "Good. And I'd recommend that the first group be small.", vietnamese: "Tốt. Và tôi đề nghị nhóm đầu tiên nên nhỏ." },
      { speaker: "Dr Hall", english: "The press keep calling. I'd rather we didn't say anything yet.", vietnamese: "Báo chí cứ gọi liên tục. Tôi muốn chúng ta chưa nói gì cả." },
      { speaker: "Dr Quang", english: "Fair enough. But it's high time we had a press officer!", vietnamese: "Hợp lý. Nhưng đã đến lúc chúng ta cần một người phụ trách báo chí!" },
    ],
    practice: [
      q("Complete: It's vital that he ___ on time.", ["be", "is", "will be", "was"], "be", "Subjunctive: base verb."),
      q("Complete: They insisted that she ___ the form.", ["sign", "signs", "signed", "will sign"], "sign", "Insist that + base verb."),
      q("Complete: It's high time you ___ a job.", ["found", "find", "will find", "have found"], "found", "It's high time + past simple."),
      q("“Bắt buộc” (by law) in English is…", ["mandatory", "voluntary", "manual", "mandate-ful"], "mandatory", "Mandatory = required."),
    ],
    challenge: [
      q("Complete: The doctor recommended that he ___ smoking.", ["give up", "gives up", "gave up", "to give up"], "give up", "Recommend that + base verb."),
      q("Complete: I'd rather you ___ me the truth.", ["told", "tell", "will tell", "telling"], "told", "Would rather + subject + past simple."),
      q("Choose the correct sentence.", ["It is essential that the results not be shared.", "It is essential that the results are not be shared.", "It is essential that the results don't be shared.", "It is essential the results not shared."], "It is essential that the results not be shared.", "Negative subjunctive."),
      q("Complete: No treatment can begin without the patient's ___.", ["consent", "consensus", "concern", "consult"], "consent", "Consent = permission."),
      q("What does “imperative” mean here?", ["extremely important and urgent", "a type of verb only", "optional", "impossible"], "extremely important and urgent", "Imperative = urgent."),
    ],
  }, {
    key: "ethics", title: "Right or Wrong?", titleVi: "Đạo đức trong khoa học",
    objectives: [
      "I can discuss ethical questions in science and technology.",
      "Use opposed to, object to and in favour of + -ing",
      "Frame a debate with The question is whether… and It is debatable whether…",
    ],
    vocabulary: [
      { word: "ethical", ipa: "/ˈeθɪkl/", partOfSpeech: "adjective", vietnamese: "có đạo đức, hợp đạo lý", definition: "morally right", example: { english: "Is it ethical to test products on animals?", vietnamese: "Thử nghiệm sản phẩm trên động vật có hợp đạo đức không?" } },
      { word: "controversial", ipa: "/ˌkɒntrəˈvɜːʃl/", partOfSpeech: "adjective", vietnamese: "gây tranh cãi", definition: "causing a lot of disagreement", example: { english: "Gene editing is highly controversial.", vietnamese: "Chỉnh sửa gen gây tranh cãi rất lớn." } },
      { word: "dilemma", ipa: "/dɪˈlemə/", partOfSpeech: "noun", vietnamese: "tình thế khó xử", definition: "a situation where you must choose between two difficult options", example: { english: "Doctors face a moral dilemma.", vietnamese: "Các bác sĩ đối mặt với một tình thế khó xử về đạo đức." } },
      { word: "cloning", ipa: "/ˈkləʊnɪŋ/", partOfSpeech: "noun", vietnamese: "nhân bản vô tính", definition: "making an exact genetic copy of a plant or animal", example: { english: "Human cloning is banned in most countries.", vietnamese: "Nhân bản vô tính người bị cấm ở hầu hết các nước." } },
      { word: "genetically modified", ipa: "/dʒəˌnetɪkli ˈmɒdɪfaɪd/", partOfSpeech: "adjective", vietnamese: "biến đổi gen", definition: "having had its genes changed by scientists", example: { english: "Genetically modified crops can resist disease.", vietnamese: "Cây trồng biến đổi gen có thể kháng bệnh." } },
      { word: "regulate", ipa: "/ˈreɡjuleɪt/", partOfSpeech: "verb", vietnamese: "quản lý, điều tiết", definition: "to control something with rules", example: { english: "AI needs to be regulated carefully.", vietnamese: "AI cần được quản lý cẩn trọng." } },
      { word: "guinea pig", ipa: "/ˈɡɪni pɪɡ/", partOfSpeech: "idiom", vietnamese: "chuột bạch (người bị thử nghiệm)", definition: "a person used to test something new", example: { english: "I don't want to be a guinea pig for a new drug.", vietnamese: "Tôi không muốn làm chuột bạch cho một loại thuốc mới." } },
      { word: "play God", ipa: "/ˌpleɪ ˈɡɒd/", partOfSpeech: "idiom", vietnamese: "đóng vai Thượng đế", definition: "to make decisions people feel only nature or God should make", example: { english: "Critics say scientists are playing God.", vietnamese: "Các nhà phê bình nói rằng các nhà khoa học đang đóng vai Thượng đế." } },
    ],
    grammar: [{
      title: "Opposed to and object to + -ing",
      pattern: "be opposed to / object to / be in favour of / be against + noun or verb-ing",
      explanation: {
        english: "In these phrases, to and of are prepositions, so a verb after them takes -ing: Many people are opposed to cloning animals. I object to being used as a guinea pig. She's in favour of regulating AI. Don't use the base verb after opposed to or object to.",
        vietnamese: "Trong các cụm này, to và of là giới từ, nên động từ đứng sau phải ở dạng -ing: Many people are opposed to cloning animals. I object to being used as a guinea pig. She's in favour of regulating AI. Đừng dùng động từ nguyên mẫu sau opposed to hay object to.",
      },
      examples: [
        { english: "Most of the public are in favour of banning human cloning.", vietnamese: "Phần lớn công chúng ủng hộ việc cấm nhân bản vô tính người." },
        { english: "Some farmers object to growing genetically modified crops.", vietnamese: "Một số nông dân phản đối việc trồng cây biến đổi gen." },
      ],
      mistake: {
        wrong: "Many people are opposed to clone animals.", right: "Many people are opposed to cloning animals.",
        why: { english: "To is a preposition here, so use -ing.", vietnamese: "To ở đây là giới từ, nên dùng -ing." },
      },
    }, {
      title: "Framing the debate",
      pattern: "The question is whether… · It is debatable whether… · There is no consensus on whether…",
      explanation: {
        english: "To present an ethical question without taking sides, use whether: The question is whether the benefits justify the risks. It is debatable whether animal testing is necessary. Don't add that before whether.",
        vietnamese: "Để nêu một câu hỏi đạo đức mà không đứng về phía nào, dùng whether: The question is whether the benefits justify the risks. It is debatable whether animal testing is necessary. Đừng thêm that trước whether.",
      },
      examples: [
        { english: "The real question is whether we should edit human genes at all.", vietnamese: "Câu hỏi thực sự là liệu chúng ta có nên chỉnh sửa gen người hay không." },
        { english: "There is no consensus on whether the technology is safe.", vietnamese: "Chưa có sự đồng thuận về việc công nghệ này có an toàn hay không." },
      ],
      mistake: {
        wrong: "The question is that whether it is ethical.", right: "The question is whether it is ethical.",
        why: { english: "Use whether alone, without that.", vietnamese: "Dùng whether một mình, không có that." },
      },
    }],
    examples: [
      { english: "Cloning raises a serious ethical dilemma.", vietnamese: "Nhân bản vô tính đặt ra một tình thế khó xử nghiêm trọng về đạo đức." },
      { english: "It is debatable whether genetically modified food is harmful.", vietnamese: "Việc thực phẩm biến đổi gen có hại hay không vẫn còn gây tranh cãi." },
      { english: "The government plans to regulate this controversial research.", vietnamese: "Chính phủ dự định quản lý nghiên cứu gây tranh cãi này." },
      { english: "Patients should never be treated as guinea pigs.", vietnamese: "Bệnh nhân không bao giờ nên bị coi như chuột bạch." },
    ],
    dialogue: [
      { speaker: "Host", english: "Tonight's topic is gene editing. Is it ethical?", vietnamese: "Chủ đề tối nay là chỉnh sửa gen. Nó có hợp đạo đức không?" },
      { speaker: "Dr Bich", english: "I'm in favour of using it to prevent serious diseases.", vietnamese: "Tôi ủng hộ việc dùng nó để phòng các bệnh nghiêm trọng." },
      { speaker: "Mr Grant", english: "I'm opposed to changing human genes. Scientists are playing God.", vietnamese: "Tôi phản đối việc thay đổi gen người. Các nhà khoa học đang đóng vai Thượng đế." },
      { speaker: "Dr Bich", english: "But the question is whether we can ignore the suffering it could prevent.", vietnamese: "Nhưng câu hỏi là liệu chúng ta có thể làm ngơ trước những đau khổ mà nó có thể ngăn chặn không." },
      { speaker: "Mr Grant", english: "It's a real dilemma. At the very least, it must be strictly regulated.", vietnamese: "Đó thực sự là một tình thế khó xử. Ít nhất, nó phải được quản lý chặt chẽ." },
      { speaker: "Host", english: "So it remains controversial. Thank you both.", vietnamese: "Vậy là vấn đề vẫn còn gây tranh cãi. Cảm ơn cả hai vị." },
    ],
    practice: [
      q("Complete: I'm opposed to ___ animals for tests.", ["using", "use", "used", "uses"], "using", "Opposed to + -ing."),
      q("Complete: She's in favour ___ the new law.", ["of", "to", "for", "with"], "of", "In favour of."),
      q("Complete: The question is ___ it is safe.", ["whether", "that whether", "if that", "what"], "whether", "The question is whether."),
      q("“Tình thế khó xử” in English is…", ["dilemma", "problem-ma", "diploma", "dramatic"], "dilemma", "Dilemma = hard choice."),
    ],
    challenge: [
      q("Complete: I object to ___ like a child.", ["being treated", "treat", "be treated", "treating by"], "being treated", "Object to + passive -ing."),
      q("Complete: It is ___ whether the plan will work.", ["debatable", "debate", "debating", "debated on"], "debatable", "It is debatable whether."),
      q("Which word means “causing a lot of disagreement”?", ["controversial", "convenient", "conventional", "conversational"], "controversial", "Controversial."),
      q("Complete: Critics accuse scientists of ___ God.", ["playing", "acting", "being play", "doing"], "playing", "Play God."),
      q("What does “regulate” mean?", ["to control something with rules", "to forget", "to repeat", "to celebrate"], "to control something with rules", "Regulate."),
    ],
  }, {
    key: "neednt-have", title: "You Needn't Have Worried", titleVi: "Needn't have và didn't need to",
    objectives: [
      "I can talk about things that turned out to be unnecessary.",
      "Use needn't have + past participle versus didn't need to + verb",
      "Use be bound to and there's no point in + -ing",
    ],
    vocabulary: [
      { word: "unnecessary", ipa: "/ʌnˈnesəsəri/", partOfSpeech: "adjective", vietnamese: "không cần thiết", definition: "not needed", example: { english: "The extra test turned out to be unnecessary.", vietnamese: "Xét nghiệm bổ sung hoá ra không cần thiết." } },
      { word: "precaution", ipa: "/prɪˈkɔːʃn/", partOfSpeech: "noun", vietnamese: "biện pháp phòng ngừa", definition: "something done to prevent a problem", example: { english: "We wore masks as a precaution.", vietnamese: "Chúng tôi đeo khẩu trang để phòng ngừa." } },
      { word: "overreact", ipa: "/ˌəʊvəriˈækt/", partOfSpeech: "verb", vietnamese: "phản ứng thái quá", definition: "to react more strongly than is necessary", example: { english: "I think the media overreacted to the report.", vietnamese: "Tôi nghĩ truyền thông đã phản ứng thái quá với bản báo cáo." } },
      { word: "panic", ipa: "/ˈpænɪk/", partOfSpeech: "verb", vietnamese: "hoảng loạn", definition: "to suddenly feel so afraid that you can't think clearly", example: { english: "Don't panic. It's only a small leak.", vietnamese: "Đừng hoảng. Chỉ là một chỗ rò nhỏ thôi." } },
      { word: "double-check", ipa: "/ˌdʌbl ˈtʃek/", partOfSpeech: "verb", vietnamese: "kiểm tra lại", definition: "to check something again to be sure", example: { english: "I double-checked the results before publishing.", vietnamese: "Tôi đã kiểm tra lại kết quả trước khi công bố." } },
      { word: "needlessly", ipa: "/ˈniːdləsli/", partOfSpeech: "adverb", vietnamese: "một cách không cần thiết", definition: "without any good reason", example: { english: "Thousands of people were needlessly frightened.", vietnamese: "Hàng nghìn người đã hoảng sợ một cách không cần thiết." } },
      { word: "in vain", ipa: "/ɪn ˈveɪn/", partOfSpeech: "phrase", vietnamese: "vô ích, uổng công", definition: "without success", example: { english: "They searched in vain for the missing file.", vietnamese: "Họ tìm tập tin bị mất trong vô vọng." } },
      { word: "reassure", ipa: "/ˌriːəˈʃʊə/", partOfSpeech: "verb", vietnamese: "trấn an", definition: "to make someone feel less worried", example: { english: "The doctor reassured me that it wasn't serious.", vietnamese: "Bác sĩ trấn an tôi rằng không có gì nghiêm trọng." } },
    ],
    grammar: [{
      title: "Needn't have vs didn't need to",
      pattern: "needn't have + past participle (you did it, but it wasn't necessary) · didn't need to + verb (it wasn't necessary; usually you didn't do it)",
      explanation: {
        english: "Both say something wasn't necessary in the past, but they tell different stories. You needn't have worried means you did worry, and it was a waste. I didn't need to wait means waiting wasn't necessary, and usually I didn't wait. Needn't have has no to.",
        vietnamese: "Cả hai đều nói điều gì đó không cần thiết trong quá khứ, nhưng kể những câu chuyện khác nhau. You needn't have worried nghĩa là bạn đã lo, và điều đó là thừa. I didn't need to wait nghĩa là không cần đợi, và thường thì tôi đã không đợi. Needn't have không có to.",
      },
      examples: [
        { english: "I needn't have brought so much food. Nobody was hungry.", vietnamese: "Lẽ ra tôi không cần mang nhiều đồ ăn thế. Chẳng ai đói cả." },
        { english: "We didn't need to book. The restaurant was empty.", vietnamese: "Chúng tôi không cần đặt bàn. Nhà hàng vắng tanh." },
      ],
      mistake: {
        wrong: "You needn't to have panicked.", right: "You needn't have panicked.",
        why: { english: "Needn't have + past participle has no to.", vietnamese: "Needn't have + quá khứ phân từ không có to." },
      },
    }, {
      title: "Bound to and no point in",
      pattern: "be bound to + verb (= certain to) · There's no point (in) + verb-ing (= it's useless)",
      explanation: {
        english: "Be bound to says something is certain to happen: The results are bound to cause debate. There's no point in + -ing says an action is useless: There's no point in worrying about it now. In can be left out, but the verb is always -ing.",
        vietnamese: "Be bound to nói điều gì đó chắc chắn sẽ xảy ra: The results are bound to cause debate. There's no point in + -ing nói một hành động là vô ích: There's no point in worrying about it now. Có thể bỏ in, nhưng động từ luôn ở dạng -ing.",
      },
      examples: [
        { english: "If you don't double-check, you're bound to make a mistake.", vietnamese: "Nếu bạn không kiểm tra lại, bạn chắc chắn sẽ mắc lỗi." },
        { english: "There's no point arguing. The decision has been made.", vietnamese: "Tranh cãi cũng vô ích. Quyết định đã được đưa ra." },
      ],
      mistake: {
        wrong: "There's no point to complain now.", right: "There's no point (in) complaining now.",
        why: { english: "No point is followed by (in) + -ing.", vietnamese: "No point đi với (in) + -ing." },
      },
    }],
    examples: [
      { english: "You needn't have double-checked everything. It was all correct.", vietnamese: "Lẽ ra bạn không cần kiểm tra lại mọi thứ. Tất cả đều đúng." },
      { english: "We took precautions, but they turned out to be unnecessary.", vietnamese: "Chúng tôi đã đề phòng, nhưng hoá ra không cần thiết." },
      { english: "The headline needlessly made people panic.", vietnamese: "Tiêu đề đó khiến mọi người hoảng loạn một cách không cần thiết." },
      { english: "The scientists tried in vain to reassure the public.", vietnamese: "Các nhà khoa học cố gắng trấn an công chúng trong vô vọng." },
    ],
    dialogue: [
      { speaker: "Lucy", english: "I was up all night worrying about the lab inspection.", vietnamese: "Mình thức trắng đêm lo về đợt kiểm tra phòng thí nghiệm." },
      { speaker: "Kien", english: "You needn't have worried. The inspector was very happy.", vietnamese: "Lẽ ra bạn không cần lo. Thanh tra viên rất hài lòng." },
      { speaker: "Lucy", english: "Really? I double-checked every safety log.", vietnamese: "Thật à? Mình đã kiểm tra lại mọi sổ an toàn." },
      { speaker: "Kien", english: "That was a good precaution, but you didn't need to stay late.", vietnamese: "Đó là biện pháp phòng ngừa tốt, nhưng bạn không cần phải ở lại muộn." },
      { speaker: "Lucy", english: "I always overreact before inspections.", vietnamese: "Mình lúc nào cũng phản ứng thái quá trước các đợt kiểm tra." },
      { speaker: "Kien", english: "Well, there's no point in panicking. You're bound to pass next time too.", vietnamese: "Thôi, hoảng loạn cũng vô ích. Lần sau bạn chắc chắn cũng sẽ qua thôi." },
    ],
    practice: [
      q("I took a coat, but it was warm. I ___ a coat.", ["needn't have taken", "didn't need take", "needn't to take", "mustn't have taken"], "needn't have taken", "Did it, but unnecessary."),
      q("The shop was empty, so we ___ queue.", ["didn't need to", "needn't have", "mustn't", "needn't to have"], "didn't need to", "Not necessary; didn't do it."),
      q("Complete: There's no point ___ about it.", ["worrying", "to worry", "worry", "worried"], "worrying", "No point + -ing."),
      q("“Biện pháp phòng ngừa” in English is…", ["precaution", "prediction", "procession", "caution-pre"], "precaution", "Precaution."),
    ],
    challenge: [
      q("Complete: It's bound ___ rain tomorrow.", ["to", "for", "on", "of"], "to", "Bound to + verb."),
      q("Choose the correct sentence.", ["You needn't have bought me a present.", "You needn't to have bought me a present.", "You needn't have buy me a present.", "You didn't need have bought me a present."], "You needn't have bought me a present.", "Needn't have + past participle."),
      q("Complete: They searched in ___ for survivors.", ["vain", "vein", "vane", "vanity"], "vain", "In vain."),
      q("Complete: The doctor ___ me that it was nothing serious.", ["reassured", "insured", "assured to", "ensured"], "reassured", "Reassure = make less worried."),
      q("What does “overreact” mean?", ["react more strongly than necessary", "not react at all", "react slowly", "react twice"], "react more strongly than necessary", "Overreact."),
    ],
  }, {
    key: "concession", title: "Albeit Slowly", titleVi: "Từ nối nhượng bộ trong văn học thuật",
    objectives: [
      "I can concede a point and still argue my case in academic writing.",
      "Use albeit with an adjective, adverb or noun phrase, not a clause",
      "Use despite the fact that, nonetheless, granted and be that as it may",
    ],
    vocabulary: [
      { word: "albeit", ipa: "/ˌɔːlˈbiːɪt/", partOfSpeech: "conjunction", vietnamese: "mặc dù (trang trọng)", definition: "although (formal; + adjective, adverb or noun phrase)", example: { english: "The treatment worked, albeit slowly.", vietnamese: "Phương pháp điều trị có hiệu quả, dù chậm." } },
      { word: "nonetheless", ipa: "/ˌnʌnðəˈles/", partOfSpeech: "adverb", vietnamese: "tuy vậy, dù sao", definition: "despite what has just been said (formal)", example: { english: "The sample was small. Nonetheless, the results are important.", vietnamese: "Mẫu khá nhỏ. Tuy vậy, kết quả vẫn quan trọng." } },
      { word: "notwithstanding", ipa: "/ˌnɒtwɪθˈstændɪŋ/", partOfSpeech: "preposition", vietnamese: "bất chấp, mặc dù (rất trang trọng)", definition: "despite (very formal)", example: { english: "Notwithstanding the risks, the trial continued.", vietnamese: "Bất chấp rủi ro, thử nghiệm vẫn tiếp tục." } },
      { word: "granted", ipa: "/ˈɡrɑːntɪd/", partOfSpeech: "adverb", vietnamese: "đành rằng, công nhận là", definition: "used to admit that something is true before arguing against it", example: { english: "Granted, the technology is expensive, but it saves lives.", vietnamese: "Đành rằng công nghệ này đắt, nhưng nó cứu sống con người." } },
      { word: "even so", ipa: "/ˈiːvn səʊ/", partOfSpeech: "phrase", vietnamese: "dù vậy", definition: "despite that", example: { english: "The risks are low. Even so, we must be careful.", vietnamese: "Rủi ro thấp. Dù vậy, chúng ta phải cẩn thận." } },
      { word: "be that as it may", ipa: "/bi ˌðæt əz ɪt ˈmeɪ/", partOfSpeech: "idiom", vietnamese: "dù có thế nào đi nữa", definition: "used to accept a point but say it doesn't change your opinion (formal)", example: { english: "Be that as it may, the law must be obeyed.", vietnamese: "Dù có thế nào đi nữa, luật vẫn phải được tuân thủ." } },
      { word: "in spite of the fact that", ipa: "/ɪn ˌspaɪt əv ðə ˈfækt ðæt/", partOfSpeech: "phrase", vietnamese: "mặc dù thực tế là", definition: "despite the fact that (+ clause)", example: { english: "In spite of the fact that it was raining, the launch went ahead.", vietnamese: "Mặc dù trời mưa, buổi phóng vẫn diễn ra." } },
      { word: "conversely", ipa: "/ˈkɒnvɜːsli/", partOfSpeech: "adverb", vietnamese: "ngược lại", definition: "in an opposite way", example: { english: "Some patients improved; conversely, others got worse.", vietnamese: "Một số bệnh nhân cải thiện; ngược lại, những người khác lại tệ hơn." } },
    ],
    grammar: [{
      title: "Albeit",
      pattern: "clause, albeit + adjective / adverb / noun phrase (no subject + verb after albeit)",
      explanation: {
        english: "Albeit means although, but it is followed by a short phrase, not a full clause: The results were positive, albeit limited. The economy grew, albeit slowly. It was a success, albeit a small one. For a full clause, use although instead.",
        vietnamese: "Albeit nghĩa là although, nhưng theo sau là một cụm ngắn, không phải mệnh đề đầy đủ: The results were positive, albeit limited. The economy grew, albeit slowly. It was a success, albeit a small one. Với mệnh đề đầy đủ, hãy dùng although.",
      },
      examples: [
        { english: "The vaccine was effective, albeit only for a few months.", vietnamese: "Vắc-xin có hiệu quả, dù chỉ trong vài tháng." },
        { english: "She accepted the offer, albeit reluctantly.", vietnamese: "Cô ấy nhận lời, dù miễn cưỡng." },
      ],
      mistake: {
        wrong: "The experiment worked, albeit it was very slow.", right: "The experiment worked, albeit very slowly.",
        why: { english: "Albeit takes a phrase, not subject + verb. Use although for a clause.", vietnamese: "Albeit đi với một cụm, không đi với chủ ngữ + động từ. Với mệnh đề, dùng although." },
      },
    }, {
      title: "Despite the fact that, nonetheless, granted",
      pattern: "Despite / In spite of the fact that + clause, … · Sentence. Nonetheless / Even so, … · Granted, …, but …",
      explanation: {
        english: "Despite and in spite of take a noun, but add the fact that to use a full clause: Despite the fact that the trial was small, the results were clear. Nonetheless and even so begin a new sentence. Granted concedes a point before a but clause. Don't add but after a despite clause: one linking word is enough.",
        vietnamese: "Despite và in spite of đi với danh từ, nhưng thêm the fact that để dùng mệnh đề đầy đủ: Despite the fact that the trial was small, the results were clear. Nonetheless và even so đứng đầu câu mới. Granted thừa nhận một ý trước mệnh đề but. Đừng thêm but sau mệnh đề despite: một từ nối là đủ.",
      },
      examples: [
        { english: "Granted, the study has limits, but its conclusions are sound.", vietnamese: "Đành rằng nghiên cứu có những giới hạn, nhưng kết luận của nó vững chắc." },
        { english: "The data are incomplete. Nonetheless, a pattern is emerging.", vietnamese: "Dữ liệu chưa đầy đủ. Tuy vậy, một xu hướng đang dần lộ ra." },
      ],
      mistake: {
        wrong: "Despite the fact the trial was small, but the results were clear.", right: "Despite the fact that the trial was small, the results were clear.",
        why: { english: "Use despite the fact that + clause, and no but.", vietnamese: "Dùng despite the fact that + mệnh đề, và không có but." },
      },
    }],
    examples: [
      { english: "Notwithstanding the cost, the project offers real benefits.", vietnamese: "Bất chấp chi phí, dự án mang lại lợi ích thực sự." },
      { english: "Be that as it may, more research is needed.", vietnamese: "Dù có thế nào đi nữa, vẫn cần nghiên cứu thêm." },
      { english: "Some species adapted; conversely, others died out.", vietnamese: "Một số loài thích nghi; ngược lại, những loài khác bị tuyệt chủng." },
      { english: "In spite of the fact that it is controversial, the research continues.", vietnamese: "Mặc dù gây tranh cãi, nghiên cứu vẫn tiếp tục." },
    ],
    dialogue: [
      { speaker: "Supervisor", english: "Your conclusion says the drug is effective. Is that fair?", vietnamese: "Kết luận của em nói thuốc có hiệu quả. Điều đó có công bằng không?" },
      { speaker: "Thanh", english: "I think so, albeit only for younger patients.", vietnamese: "Em nghĩ vậy, dù chỉ với bệnh nhân trẻ tuổi." },
      { speaker: "Supervisor", english: "But your sample was very small.", vietnamese: "Nhưng mẫu của em rất nhỏ." },
      { speaker: "Thanh", english: "Granted, it was small, but the effect was very clear.", vietnamese: "Đành rằng mẫu nhỏ, nhưng tác dụng rất rõ ràng." },
      { speaker: "Supervisor", english: "Be that as it may, you need to mention the limits.", vietnamese: "Dù có thế nào đi nữa, em cần nêu các giới hạn." },
      { speaker: "Thanh", english: "I'll add: “Despite the fact that the sample was small, the results are promising. Nonetheless, further research is required.”", vietnamese: "Em sẽ thêm: “Mặc dù mẫu nhỏ, kết quả vẫn đầy hứa hẹn. Tuy vậy, cần nghiên cứu thêm.”" },
    ],
    practice: [
      q("Complete: The plan worked, albeit ___.", ["slowly", "it was slow", "was slowly", "slowing it"], "slowly", "Albeit + adverb."),
      q("Complete: Despite the fact ___ it was late, we continued.", ["that", "of", "which", "what"], "that", "Despite the fact that."),
      q("Complete: The risk is small. ___, we must be careful.", ["Nonetheless", "Albeit", "Despite", "Notwithstanding of"], "Nonetheless", "New sentence: nonetheless."),
      q("“Ngược lại” in English is…", ["conversely", "conversationally", "contrarily of", "reversely"], "conversely", "Conversely."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["It was a victory, albeit a narrow one.", "It was a victory, albeit it was narrow.", "It was a victory, albeit narrow it was.", "Albeit it was a victory, narrow."], "It was a victory, albeit a narrow one.", "Albeit + noun phrase."),
      q("Complete: ___, it's expensive, but it's worth it.", ["Granted", "Albeit", "Despite", "Notwithstanding"], "Granted", "Granted…, but…"),
      q("Complete: ___ the bad weather, the event was a success.", ["Notwithstanding", "Albeit", "Nonetheless", "Granted"], "Notwithstanding", "Notwithstanding + noun."),
      q("Choose the correct sentence.", ["In spite of the fact that he was ill, he finished the race.", "In spite of he was ill, he finished the race.", "In spite of the fact he was ill, but he finished.", "In spite the fact that he was ill, he finished."], "In spite of the fact that he was ill, he finished the race.", "In spite of the fact that + clause."),
      q("When do we say “be that as it may”?", ["to accept a point but keep our opinion", "to agree completely", "to end a meeting", "to ask a question"], "to accept a point but keep our opinion", "Concession."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 3", isReview: true,
    objectives: [
      "I can discuss science, plans and ethics precisely and formally.",
      "Check future in the past, the subjunctive, opposed to + -ing, needn't have and concession",
    ],
    vocabulary: [
      { word: "breakthrough", ipa: "/ˈbreɪkθruː/", partOfSpeech: "noun", vietnamese: "bước đột phá", definition: "an important new discovery", example: { english: "The team made a breakthrough in battery design.", vietnamese: "Nhóm đã có bước đột phá trong thiết kế pin." } },
      { word: "vital", ipa: "/ˈvaɪtl/", partOfSpeech: "adjective", vietnamese: "sống còn, cực kỳ quan trọng", definition: "extremely important or necessary", example: { english: "Clean water is vital for health.", vietnamese: "Nước sạch là sống còn đối với sức khoẻ." } },
      { word: "controversial", ipa: "/ˌkɒntrəˈvɜːʃl/", partOfSpeech: "adjective", vietnamese: "gây tranh cãi", definition: "causing a lot of disagreement", example: { english: "The decision proved controversial.", vietnamese: "Quyết định đó hoá ra gây tranh cãi." } },
      { word: "dilemma", ipa: "/dɪˈlemə/", partOfSpeech: "noun", vietnamese: "tình thế khó xử", definition: "a situation where you must choose between two difficult options", example: { english: "It's a classic ethical dilemma.", vietnamese: "Đó là một tình thế khó xử kinh điển về đạo đức." } },
      { word: "precaution", ipa: "/prɪˈkɔːʃn/", partOfSpeech: "noun", vietnamese: "biện pháp phòng ngừa", definition: "something done to prevent a problem", example: { english: "Take every precaution in the lab.", vietnamese: "Hãy thực hiện mọi biện pháp phòng ngừa trong phòng thí nghiệm." } },
      { word: "albeit", ipa: "/ˌɔːlˈbiːɪt/", partOfSpeech: "conjunction", vietnamese: "mặc dù (trang trọng)", definition: "although (formal; + adjective, adverb or noun phrase)", example: { english: "Prices fell, albeit slightly.", vietnamese: "Giá giảm, dù chỉ một chút." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "was going to (a changed plan) / knew she would · vital that she be · It's high time we went · opposed to cloning / The question is whether · needn't have worried / didn't need to · albeit slowly / despite the fact that",
      explanation: {
        english: "Check these: use was going to for a past plan and would after a past verb; after vital, essential, insist and recommend that, use the base verb for every subject, and the past simple after it's high time and would rather + subject; opposed to and object to take -ing, and whether stands alone; needn't have + past participle means you did it unnecessarily, didn't need to usually means you didn't; albeit takes a phrase, and despite the fact that takes a clause without but.",
        vietnamese: "Hãy kiểm tra: dùng was going to cho kế hoạch trong quá khứ và would sau động từ quá khứ; sau vital, essential, insist và recommend that, dùng động từ nguyên mẫu cho mọi chủ ngữ, và quá khứ đơn sau it's high time và would rather + chủ ngữ; opposed to và object to đi với -ing, và whether đứng một mình; needn't have + quá khứ phân từ nghĩa là đã làm một cách không cần thiết, didn't need to thường nghĩa là đã không làm; albeit đi với một cụm, và despite the fact that đi với mệnh đề không có but.",
      },
      examples: [
        { english: "It was vital that the breakthrough be confirmed, albeit quietly at first.", vietnamese: "Điều sống còn là bước đột phá phải được xác nhận, dù ban đầu chỉ âm thầm." },
        { english: "We needn't have taken so many precautions.", vietnamese: "Lẽ ra chúng tôi không cần đề phòng nhiều đến thế." },
      ],
    }],
    examples: [
      { english: "The breakthrough was controversial, albeit widely praised.", vietnamese: "Bước đột phá đó gây tranh cãi, dù được ca ngợi rộng rãi." },
      { english: "It's vital that every precaution be taken.", vietnamese: "Điều sống còn là phải thực hiện mọi biện pháp phòng ngừa." },
      { english: "Doctors face a dilemma: treat now or wait for more data.", vietnamese: "Các bác sĩ đối mặt với tình thế khó xử: điều trị ngay hay chờ thêm dữ liệu." },
    ],
    dialogue: [
      { speaker: "Reporter", english: "Is it true your lab was going to stop the project?", vietnamese: "Có đúng là phòng thí nghiệm của ông định dừng dự án không?" },
      { speaker: "Dr Vu", english: "Yes. We were about to give up when we made the breakthrough.", vietnamese: "Đúng vậy. Chúng tôi sắp bỏ cuộc thì có được bước đột phá." },
      { speaker: "Reporter", english: "Some say the research is controversial.", vietnamese: "Có người nói nghiên cứu này gây tranh cãi." },
      { speaker: "Dr Vu", english: "Granted, it raises a dilemma. But many people are in favour of continuing it.", vietnamese: "Đành rằng nó đặt ra một tình thế khó xử. Nhưng nhiều người ủng hộ việc tiếp tục." },
      { speaker: "Reporter", english: "What happens next?", vietnamese: "Bước tiếp theo là gì?" },
      { speaker: "Dr Vu", english: "It's vital that the results be checked by an independent team.", vietnamese: "Điều sống còn là kết quả phải được một nhóm độc lập kiểm tra." },
      { speaker: "Dr Vu", english: "We've taken every precaution, albeit at great cost.", vietnamese: "Chúng tôi đã thực hiện mọi biện pháp phòng ngừa, dù rất tốn kém." },
    ],
    practice: [
      q("Complete: I ___ phone you, but the battery died.", ["was going to", "will", "would have", "am going to"], "was going to", "Past plan."),
      q("Complete: It's vital that she ___ informed.", ["be", "is", "will be", "was"], "be", "Subjunctive."),
      q("Complete: I'm opposed to ___ animals.", ["testing on", "test on", "tested on", "tests on"], "testing on", "Opposed to + -ing."),
      q("Complete: You needn't ___ so early.", ["have come", "to have come", "came", "come have"], "have come", "Needn't have + past participle."),
    ],
    challenge: [
      q("Complete: It's high time we ___ action.", ["took", "take", "will take", "have taken"], "took", "It's high time + past simple."),
      q("Complete: The question is ___ it is worth the risk.", ["whether", "that whether", "what", "that"], "whether", "Whether alone."),
      q("Complete: The plan succeeded, albeit ___.", ["only partly", "it was partly", "was partly", "partly it did"], "only partly", "Albeit + phrase."),
      q("Choose the correct sentence.", ["Despite the fact that it was risky, they continued.", "Despite it was risky, they continued.", "Despite the fact it was risky, but they continued.", "Despite of the fact that it was risky, they continued."], "Despite the fact that it was risky, they continued.", "Despite the fact that + clause."),
      q("Complete: I knew the test ___ difficult.", ["would be", "will be", "is", "has been"], "would be", "Would after a past verb."),
    ],
  }],
  assessment: [
    { id: "was-going-to", prompt: "“Tôi định gọi cho bạn nhưng lại quên.” in English is…", options: ["I was going to call you, but I forgot.", "I will call you, but I forgot.", "I am going to call you, but I forgot.", "I would call you, but I forget."], correct: "I was going to call you, but I forgot.", explanation: "Past plan: was going to." },
    { id: "would-after-past", prompt: "Complete: She said she ___ help us.", options: ["would", "will", "shall", "is going"], correct: "would", explanation: "Would after a past verb." },
    { id: "on-the-verge", prompt: "Complete: They were on the verge ___ a discovery.", options: ["of", "to", "for", "at"], correct: "of", explanation: "On the verge of." },
    { id: "subjunctive-base", prompt: "Complete: It's essential that he ___ the truth.", options: ["know", "knows", "knew", "will know"], correct: "know", explanation: "Subjunctive: base verb." },
    { id: "insist-that", prompt: "Complete: The board insisted that the trial ___ stopped.", options: ["be", "is", "was being", "will be"], correct: "be", explanation: "Insist that + base verb." },
    { id: "high-time", prompt: "Complete: It's high time you ___ to bed.", options: ["went", "go", "will go", "have gone"], correct: "went", explanation: "It's high time + past simple." },
    { id: "would-rather", prompt: "Complete: I'd rather you ___ here.", options: ["didn't smoke", "don't smoke", "not smoke", "won't smoke"], correct: "didn't smoke", explanation: "Would rather + subject + past simple." },
    { id: "opposed-to", prompt: "Complete: Many people are opposed to ___ humans.", options: ["cloning", "clone", "cloned", "be cloned to"], correct: "cloning", explanation: "Opposed to + -ing." },
    { id: "whether", prompt: "Complete: The question is ___ it is ethical.", options: ["whether", "that whether", "that if", "what"], correct: "whether", explanation: "The question is whether." },
    { id: "neednt-have", prompt: "I cooked for ten, but only four came. I ___ so much.", options: ["needn't have cooked", "didn't need cook", "needn't to cook", "mustn't have cooked"], correct: "needn't have cooked", explanation: "Did it unnecessarily." },
    { id: "didnt-need-to", prompt: "The test was cancelled, so I ___ study.", options: ["didn't need to", "needn't have", "mustn't", "needn't to have"], correct: "didn't need to", explanation: "Not necessary; didn't do it." },
    { id: "no-point", prompt: "Complete: There's no point ___ now.", options: ["complaining", "to complain", "complain", "complained"], correct: "complaining", explanation: "No point + -ing." },
    { id: "albeit", prompt: "Choose the correct sentence.", options: ["The project succeeded, albeit slowly.", "The project succeeded, albeit it was slow.", "The project succeeded, albeit was slowly.", "Albeit slow it was, the project succeeded."], correct: "The project succeeded, albeit slowly.", explanation: "Albeit + adverb." },
    { id: "despite-fact-that", prompt: "Complete: Despite the fact ___ it rained, the match went ahead.", options: ["that", "of", "which", "what"], correct: "that", explanation: "Despite the fact that." },
    { id: "granted", prompt: "Complete: ___, it's risky, but the benefits are huge.", options: ["Granted", "Albeit", "Notwithstanding", "Despite"], correct: "Granted", explanation: "Granted…, but…" },
  ],
};
