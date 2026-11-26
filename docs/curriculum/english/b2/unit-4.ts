// B2 Unit 4: Health & Lifestyle. Vietnamese has no tense change in "nếu… thì…", so learners say "If I would have
// known" and "If I had went"; mixed conditionals come out all in the past ("I wouldn't have been hungry now"); regrets
// lose the perfect ("I should went", "I wish I listened"); strong advice takes an extra to ("You had better to rest",
// "You ought see"); idioms get changed ("below the weather"); and "feel like" takes to. This unit puts those right for
// talking about health, choices and regrets.
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "B2",
  number: 4,
  lessons: [{
    key: "third-conditional", title: "If I Had Known…", titleVi: "Câu điều kiện loại 3",
    objectives: [
      "I can imagine how the past could have been different.",
      "Use If + had + past participle, would have + past participle",
      "Use could have and might have for less certain results",
    ],
    vocabulary: [
      { word: "injury", ipa: "/ˈɪndʒəri/", partOfSpeech: "noun", vietnamese: "chấn thương", definition: "damage to the body, for example in an accident", example: { english: "He missed the match because of a knee injury.", vietnamese: "Anh ấy lỡ trận đấu vì chấn thương đầu gối." } },
      { word: "recover", ipa: "/rɪˈkʌvə/", partOfSpeech: "verb", vietnamese: "hồi phục", definition: "to get better after an illness or injury", example: { english: "It took her six weeks to recover from the operation.", vietnamese: "Cô ấy mất sáu tuần để hồi phục sau ca phẫu thuật." } },
      { word: "sprain", ipa: "/spreɪn/", partOfSpeech: "verb", vietnamese: "bong gân, trật", definition: "to hurt a joint by twisting it", example: { english: "I sprained my ankle playing football.", vietnamese: "Tôi bị trật mắt cá chân khi chơi bóng đá." } },
      { word: "check-up", ipa: "/ˈtʃek ʌp/", partOfSpeech: "noun", vietnamese: "khám sức khoẻ định kỳ", definition: "a general examination by a doctor or dentist", example: { english: "You should have a check-up once a year.", vietnamese: "Bạn nên khám sức khoẻ định kỳ mỗi năm một lần." } },
      { word: "catch a cold", ipa: "/ˌkætʃ ə ˈkəʊld/", partOfSpeech: "collocation", vietnamese: "bị cảm lạnh", definition: "to become ill with a cold", example: { english: "Put a coat on or you'll catch a cold.", vietnamese: "Mặc áo khoác vào không thì bị cảm đấy." } },
      { word: "avoid", ipa: "/əˈvɔɪd/", partOfSpeech: "verb", vietnamese: "tránh", definition: "to stay away from something or stop it happening", example: { english: "Try to avoid sugary drinks.", vietnamese: "Cố gắng tránh đồ uống có đường." } },
      { word: "treatment", ipa: "/ˈtriːtmənt/", partOfSpeech: "noun", vietnamese: "sự điều trị", definition: "medical care for an illness or injury", example: { english: "The treatment worked, and he's fine now.", vietnamese: "Việc điều trị có hiệu quả, và giờ anh ấy ổn rồi." } },
      { word: "slip", ipa: "/slɪp/", partOfSpeech: "verb", vietnamese: "trượt chân", definition: "to slide by accident and fall or nearly fall", example: { english: "She slipped on the wet floor.", vietnamese: "Cô ấy trượt chân trên sàn ướt." } },
    ],
    grammar: [{
      title: "The third conditional",
      pattern: "If + had + past participle, would have + past participle (an imagined past that didn't happen)",
      explanation: {
        english: "Use the third conditional to imagine a different past and its result: If I had warmed up, I wouldn't have hurt my back. (I didn't warm up, so I hurt it.) Would never goes in the if part. Both parts can be contracted: If I'd known, I'd have come.",
        vietnamese: "Dùng câu điều kiện loại 3 để tưởng tượng một quá khứ khác và kết quả của nó: If I had warmed up, I wouldn't have hurt my back. (Tôi đã không khởi động, nên bị đau lưng.) Không bao giờ dùng would trong mệnh đề if. Cả hai vế đều có thể rút gọn: If I'd known, I'd have come.",
      },
      examples: [
        { english: "If she hadn't slipped, she wouldn't have broken her arm.", vietnamese: "Nếu cô ấy không trượt chân thì đã không gãy tay." },
        { english: "If we'd left earlier, we'd have caught the train.", vietnamese: "Nếu chúng ta đi sớm hơn thì đã kịp chuyến tàu." },
      ],
      mistake: {
        wrong: "If I would have known, I would have helped.", right: "If I had known, I would have helped.",
        why: { english: "The if part uses had + past participle, never would.", vietnamese: "Vế if dùng had + quá khứ phân từ, không bao giờ dùng would." },
      },
    }, {
      title: "Could have, might have",
      pattern: "If + had + past participle, could have / might have + past participle (possible, not certain)",
      explanation: {
        english: "Replace would have with could have (it was possible) or might have (perhaps) when you are less sure of the result: If he'd had treatment sooner, he might have recovered faster. Keep have + past participle after these modals, not has or the past simple.",
        vietnamese: "Thay would have bằng could have (đã có thể) hoặc might have (có lẽ) khi bạn ít chắc chắn hơn về kết quả: If he'd had treatment sooner, he might have recovered faster. Sau các động từ khuyết thiếu này luôn là have + quá khứ phân từ, không dùng has hay quá khứ đơn.",
      },
      examples: [
        { english: "If you'd asked me, I could have driven you there.", vietnamese: "Nếu bạn nhờ thì tôi đã có thể chở bạn đến đó." },
        { english: "If it hadn't rained, we might have won.", vietnamese: "Nếu trời không mưa, có lẽ chúng tôi đã thắng." },
      ],
      mistake: {
        wrong: "If she'd taken the medicine, she might has felt better.", right: "If she'd taken the medicine, she might have felt better.",
        why: { english: "After might, use have, never has.", vietnamese: "Sau might luôn dùng have, không bao giờ dùng has." },
      },
    }],
    examples: [
      { english: "If I'd had a check-up, the doctor would have found the problem earlier.", vietnamese: "Nếu tôi đi khám định kỳ, bác sĩ đã phát hiện vấn đề sớm hơn." },
      { english: "He wouldn't have sprained his ankle if he'd worn proper shoes.", vietnamese: "Anh ấy đã không bị trật mắt cá nếu đi giày phù hợp." },
      { english: "If I'd avoided the rain, I wouldn't have caught a cold.", vietnamese: "Nếu tôi tránh được cơn mưa thì đã không bị cảm." },
      { english: "With the right treatment, she could have recovered sooner.", vietnamese: "Với cách điều trị đúng, cô ấy đã có thể hồi phục sớm hơn." },
    ],
    dialogue: [
      { speaker: "Matt", english: "What happened to your arm?", vietnamese: "Tay bạn bị sao thế?" },
      { speaker: "Thuy", english: "I slipped on the stairs at work. It's a bad injury.", vietnamese: "Mình trượt chân ở cầu thang chỗ làm. Chấn thương khá nặng." },
      { speaker: "Matt", english: "Oh no! Were the stairs wet?", vietnamese: "Ôi không! Cầu thang bị ướt à?" },
      { speaker: "Thuy", english: "Yes. If someone had put up a sign, I'd have been more careful.", vietnamese: "Ừ. Nếu có ai đặt biển báo thì mình đã cẩn thận hơn." },
      { speaker: "Matt", english: "And if you hadn't been looking at your phone…", vietnamese: "Và nếu bạn không nhìn điện thoại…" },
      { speaker: "Thuy", english: "OK, OK! I might have seen the water. Lesson learnt.", vietnamese: "Được rồi, được rồi! Có lẽ mình đã thấy vũng nước. Rút kinh nghiệm rồi." },
    ],
    practice: [
      q("Complete: If I ___ the bus, I wouldn't have been late.", ["had caught", "would catch", "caught", "have caught"], "had caught", "If + had + past participle."),
      q("Complete: If you'd told me, I ___ you.", ["would have helped", "would help", "had helped", "will help"], "would have helped", "Would have + past participle."),
      q("Complete: If she had trained more, she ___ won.", ["might have", "might has", "might", "might had"], "might have", "Might have + past participle."),
      q("“Chấn thương” in English is…", ["injury", "injure", "wound up", "hurting"], "injury", "Injury = damage to the body."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["If we had known, we would have come.", "If we would have known, we would have come.", "If we knew, we would have came.", "If we had knew, we would come."], "If we had known, we would have come.", "No would in the if part."),
      q("Complete: If he ___ his ankle, he would have finished the race.", ["hadn't sprained", "didn't sprain", "wouldn't sprain", "hasn't sprained"], "hadn't sprained", "Negative third conditional."),
      q("“I didn't study, so I failed.” Which sentence means the same?", ["If I had studied, I wouldn't have failed.", "If I studied, I wouldn't fail.", "If I study, I won't fail.", "If I had studied, I would fail."], "If I had studied, I wouldn't have failed.", "Third conditional."),
      q("Complete: It took months to ___ from the accident.", ["recover", "recovery", "cover", "discover"], "recover", "Recover = get better."),
      q("What is a “check-up”?", ["a general examination by a doctor", "a type of medicine", "a hospital bed", "an injury"], "a general examination by a doctor", "Check-up = routine exam."),
    ],
  }, {
    key: "mixed-conditionals", title: "If I Had Slept, I Wouldn't Be Tired", titleVi: "Câu điều kiện hỗn hợp",
    objectives: [
      "I can link past choices to how things are now, and the other way round.",
      "Use If + had + past participle, would + verb for a present result",
      "Use If + past simple, would have + past participle for a past result",
    ],
    vocabulary: [
      { word: "lifestyle", ipa: "/ˈlaɪfstaɪl/", partOfSpeech: "noun", vietnamese: "lối sống", definition: "the way a person lives", example: { english: "A healthy lifestyle includes sleep and exercise.", vietnamese: "Một lối sống lành mạnh bao gồm ngủ đủ và tập thể dục." } },
      { word: "unfit", ipa: "/ʌnˈfɪt/", partOfSpeech: "adjective", vietnamese: "không khoẻ, thể lực kém", definition: "not in good physical condition", example: { english: "I'm so unfit. I get tired climbing the stairs.", vietnamese: "Thể lực tôi kém quá. Leo cầu thang cũng mệt." } },
      { word: "junk food", ipa: "/ˈdʒʌŋk fuːd/", partOfSpeech: "noun", vietnamese: "đồ ăn vặt, đồ ăn nhanh không tốt", definition: "food that is unhealthy, often fast food or snacks", example: { english: "Students often live on junk food.", vietnamese: "Sinh viên thường sống nhờ đồ ăn nhanh." } },
      { word: "diet", ipa: "/ˈdaɪət/", partOfSpeech: "noun", vietnamese: "chế độ ăn", definition: "the food you usually eat", example: { english: "The Vietnamese diet includes lots of vegetables.", vietnamese: "Chế độ ăn của người Việt có rất nhiều rau." } },
      { word: "overweight", ipa: "/ˌəʊvəˈweɪt/", partOfSpeech: "adjective", vietnamese: "thừa cân", definition: "heavier than is healthy", example: { english: "The doctor said I was slightly overweight.", vietnamese: "Bác sĩ nói tôi hơi thừa cân." } },
      { word: "active", ipa: "/ˈæktɪv/", partOfSpeech: "adjective", vietnamese: "năng động, hoạt động nhiều", definition: "moving around and doing a lot", example: { english: "My grandmother is still very active at 80.", vietnamese: "Bà tôi 80 tuổi mà vẫn rất năng động." } },
      { word: "give up", ipa: "/ˌɡɪv ˈʌp/", partOfSpeech: "phrasal verb", vietnamese: "từ bỏ", definition: "to stop doing or having something", example: { english: "He gave up smoking ten years ago.", vietnamese: "Anh ấy bỏ thuốc lá mười năm trước." } },
      { word: "energetic", ipa: "/ˌenəˈdʒetɪk/", partOfSpeech: "adjective", vietnamese: "tràn đầy năng lượng", definition: "having a lot of energy", example: { english: "I feel more energetic since I started cycling.", vietnamese: "Tôi thấy khoẻ khoắn hơn từ khi đạp xe." } },
    ],
    grammar: [{
      title: "Past condition, present result",
      pattern: "If + had + past participle, would / wouldn't + base verb (now)",
      explanation: {
        english: "A mixed conditional joins two times. When an imagined past would change the present, use the past perfect in the if part and would + base verb in the result: If I had slept properly, I wouldn't be tired now. If she'd taken the job, she'd be living in London. Words like now and today show the result is present.",
        vietnamese: "Câu điều kiện hỗn hợp nối hai mốc thời gian. Khi một quá khứ tưởng tượng sẽ thay đổi hiện tại, dùng quá khứ hoàn thành ở vế if và would + động từ nguyên mẫu ở vế kết quả: If I had slept properly, I wouldn't be tired now. If she'd taken the job, she'd be living in London. Các từ như now và today cho thấy kết quả ở hiện tại.",
      },
      examples: [
        { english: "If he hadn't given up sport, he wouldn't be so unfit.", vietnamese: "Nếu anh ấy không bỏ thể thao thì giờ đã không yếu như vậy." },
        { english: "If I'd eaten breakfast, I wouldn't be hungry now.", vietnamese: "Nếu tôi ăn sáng thì giờ đã không đói." },
      ],
      mistake: {
        wrong: "If I had gone to bed early, I wouldn't have been tired now.", right: "If I had gone to bed early, I wouldn't be tired now.",
        why: { english: "The result is now, so use would + base verb.", vietnamese: "Kết quả ở hiện tại, nên dùng would + động từ nguyên mẫu." },
      },
    }, {
      title: "Present condition, past result",
      pattern: "If + past simple (a general truth now), would have + past participle (a past result)",
      explanation: {
        english: "The other mix uses a present or general fact to explain a past result: If I were fitter, I would have finished the race. (I'm not fit, so I didn't finish.) If she didn't love dancing, she wouldn't have trained so hard. Use were for all persons in formal English.",
        vietnamese: "Kiểu hỗn hợp còn lại dùng một sự thật hiện tại hoặc chung để giải thích kết quả trong quá khứ: If I were fitter, I would have finished the race. (Tôi không khoẻ, nên đã không về đích.) If she didn't love dancing, she wouldn't have trained so hard. Dùng were cho mọi ngôi trong tiếng Anh trang trọng.",
      },
      examples: [
        { english: "If I weren't allergic to nuts, I'd have tried the cake.", vietnamese: "Nếu tôi không dị ứng hạt thì đã ăn thử bánh rồi." },
        { english: "If he were more active, he wouldn't have put on weight.", vietnamese: "Nếu anh ấy năng động hơn thì đã không tăng cân." },
      ],
      mistake: {
        wrong: "If I am more energetic, I would have gone to the gym.", right: "If I were more energetic, I would have gone to the gym.",
        why: { english: "The if part of an unreal condition uses the past: were.", vietnamese: "Vế if của điều kiện không có thật dùng quá khứ: were." },
      },
    }],
    examples: [
      { english: "If I'd changed my diet years ago, I wouldn't be overweight now.", vietnamese: "Nếu tôi thay đổi chế độ ăn từ nhiều năm trước thì giờ đã không thừa cân." },
      { english: "If junk food weren't so cheap, students wouldn't have eaten so much of it.", vietnamese: "Nếu đồ ăn nhanh không rẻ như vậy thì sinh viên đã không ăn nhiều đến thế." },
      { english: "A more active lifestyle would make you feel more energetic.", vietnamese: "Một lối sống năng động hơn sẽ giúp bạn thấy khoẻ khoắn hơn." },
      { english: "If she hadn't given up running, she'd still be in the team.", vietnamese: "Nếu cô ấy không bỏ chạy bộ thì giờ vẫn còn trong đội." },
    ],
    dialogue: [
      { speaker: "Coach", english: "You look exhausted. What time did you go to bed?", vietnamese: "Trông em kiệt sức. Tối qua mấy giờ em đi ngủ?" },
      { speaker: "Long", english: "About two. I was gaming.", vietnamese: "Khoảng hai giờ. Em chơi điện tử." },
      { speaker: "Coach", english: "If you'd gone to bed earlier, you wouldn't be so tired now.", vietnamese: "Nếu em đi ngủ sớm hơn thì giờ đã không mệt như vậy." },
      { speaker: "Long", english: "I know. And if I weren't so unfit, I'd have finished the run yesterday.", vietnamese: "Em biết. Và nếu em không yếu như vậy thì hôm qua đã chạy hết bài." },
      { speaker: "Coach", english: "Then change your lifestyle. Less junk food, more sleep.", vietnamese: "Vậy thì thay đổi lối sống đi. Bớt đồ ăn nhanh, ngủ nhiều hơn." },
      { speaker: "Long", english: "OK. I'll give up gaming at night, I promise.", vietnamese: "Vâng. Em hứa sẽ bỏ chơi điện tử ban đêm." },
    ],
    practice: [
      q("Complete: If I had saved money, I ___ rich now.", ["would be", "would have been", "will be", "had been"], "would be", "Present result: would + base verb."),
      q("Complete: If I ___ fitter, I would have won.", ["were", "am", "had been being", "would be"], "were", "Present condition: past simple."),
      q("Complete: If she hadn't moved, she ___ here now.", ["would live", "would have lived", "lives", "had lived"], "would live", "Past condition, present result."),
      q("“Lối sống” in English is…", ["lifestyle", "lifeway", "living style", "life road"], "lifestyle", "Lifestyle = the way you live."),
    ],
    challenge: [
      q("Complete: If he weren't so lazy, he ___ the exam last week.", ["would have passed", "would pass", "passed", "had passed"], "would have passed", "Past result: would have + past participle."),
      q("Choose the correct sentence.", ["If I'd learnt to swim, I wouldn't be afraid of water now.", "If I'd learnt to swim, I wouldn't have been afraid of water now.", "If I learnt to swim, I wouldn't be afraid of water now.", "If I would learn to swim, I wouldn't be afraid now."], "If I'd learnt to swim, I wouldn't be afraid of water now.", "Past condition, present result."),
      q("Complete: He ___ smoking last year and feels great.", ["gave up", "gave in", "gave out", "gave off"], "gave up", "Give up = stop."),
      q("Complete: If she ___ allergic to cats, she would have adopted one.", ["weren't", "isn't", "hadn't", "wouldn't be"], "weren't", "Present condition: weren't."),
      q("What is “junk food”?", ["unhealthy food like fast food and snacks", "food from a market", "expensive food", "vegetables"], "unhealthy food like fast food and snacks", "Junk food = unhealthy."),
    ],
  }, {
    key: "regrets", title: "I Should Have Listened", titleVi: "Nói về sự hối tiếc",
    objectives: [
      "I can talk about things I regret doing or not doing.",
      "Use should have / shouldn't have + past participle",
      "Use I wish / If only + past perfect for past regrets",
    ],
    vocabulary: [
      { word: "regret", ipa: "/rɪˈɡret/", partOfSpeech: "verb", vietnamese: "hối tiếc", definition: "to feel sorry about something you did or didn't do", example: { english: "I regret not going to university.", vietnamese: "Tôi hối tiếc vì đã không học đại học." } },
      { word: "warn", ipa: "/wɔːn/", partOfSpeech: "verb", vietnamese: "cảnh báo", definition: "to tell someone about a possible danger", example: { english: "The doctor warned me about my blood pressure.", vietnamese: "Bác sĩ đã cảnh báo tôi về huyết áp." } },
      { word: "ignore", ipa: "/ɪɡˈnɔː/", partOfSpeech: "verb", vietnamese: "phớt lờ", definition: "to pay no attention to something", example: { english: "Don't ignore the pain in your chest.", vietnamese: "Đừng phớt lờ cơn đau ở ngực." } },
      { word: "take someone's advice", ipa: "/ˌteɪk ˈsʌmwʌnz ədˈvaɪs/", partOfSpeech: "collocation", vietnamese: "nghe theo lời khuyên của ai", definition: "to do what someone suggests", example: { english: "I took my mum's advice and drank more water.", vietnamese: "Tôi nghe lời mẹ và uống nhiều nước hơn." } },
      { word: "oversleep", ipa: "/ˌəʊvəˈsliːp/", partOfSpeech: "verb", vietnamese: "ngủ quên", definition: "to sleep longer than you planned", example: { english: "I overslept and missed my flight.", vietnamese: "Tôi ngủ quên và lỡ chuyến bay." } },
      { word: "skip", ipa: "/skɪp/", partOfSpeech: "verb", vietnamese: "bỏ qua, bỏ bữa", definition: "to not do something you normally do", example: { english: "You shouldn't skip breakfast.", vietnamese: "Bạn không nên bỏ bữa sáng." } },
      { word: "wake-up call", ipa: "/ˈweɪk ʌp kɔːl/", partOfSpeech: "noun", vietnamese: "hồi chuông cảnh tỉnh", definition: "an event that makes you realise you must change", example: { english: "The heart attack was a wake-up call.", vietnamese: "Cơn đau tim là một hồi chuông cảnh tỉnh." } },
      { word: "burn out", ipa: "/ˌbɜːn ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "kiệt sức (vì làm việc quá sức)", definition: "to become ill or exhausted from working too hard", example: { english: "If you keep working weekends, you'll burn out.", vietnamese: "Nếu cứ làm cả cuối tuần, bạn sẽ kiệt sức." } },
    ],
    grammar: [{
      title: "Should have, shouldn't have",
      pattern: "should have + past participle (it was a good idea, but you didn't) · shouldn't have + past participle (you did, but it was a mistake)",
      explanation: {
        english: "To criticise a past action, or to talk about your own regrets, use should have or shouldn't have + past participle: I should have gone to the doctor sooner. You shouldn't have skipped lunch. In speech, should have sounds like “should've”, but never write should of.",
        vietnamese: "Để phê bình một hành động trong quá khứ, hoặc nói về sự hối tiếc của bản thân, dùng should have hoặc shouldn't have + quá khứ phân từ: I should have gone to the doctor sooner. You shouldn't have skipped lunch. Khi nói, should have nghe như “should've”, nhưng không bao giờ viết should of.",
      },
      examples: [
        { english: "I shouldn't have eaten so much last night.", vietnamese: "Lẽ ra tối qua tôi không nên ăn nhiều như vậy." },
        { english: "You should have warned me about the spicy sauce!", vietnamese: "Lẽ ra bạn phải báo trước cho tôi về nước sốt cay chứ!" },
      ],
      mistake: {
        wrong: "I should went to bed earlier.", right: "I should have gone to bed earlier.",
        why: { english: "For the past, use should have + past participle.", vietnamese: "Với quá khứ, dùng should have + quá khứ phân từ." },
      },
    }, {
      title: "I wish / If only + past perfect",
      pattern: "I wish / If only + subject + had + past participle (I'm sorry it happened, or didn't happen)",
      explanation: {
        english: "For regrets about the past, use wish or if only with the past perfect: I wish I had listened to you. If only I hadn't ignored the warning! Compare: I wish I was fitter (now) with I wish I had exercised (in the past). If only is stronger and more emotional.",
        vietnamese: "Với sự hối tiếc về quá khứ, dùng wish hoặc if only với quá khứ hoàn thành: I wish I had listened to you. If only I hadn't ignored the warning! So sánh: I wish I was fitter (hiện tại) với I wish I had exercised (quá khứ). If only mạnh hơn và giàu cảm xúc hơn.",
      },
      examples: [
        { english: "I wish I hadn't overslept this morning.", vietnamese: "Ước gì sáng nay tôi không ngủ quên." },
        { english: "If only I'd taken your advice!", vietnamese: "Giá mà tôi nghe lời khuyên của bạn!" },
      ],
      mistake: {
        wrong: "I wish I listened to my mum when I was young.", right: "I wish I had listened to my mum when I was young.",
        why: { english: "A regret about the past needs the past perfect.", vietnamese: "Hối tiếc về quá khứ cần thì quá khứ hoàn thành." },
      },
    }],
    examples: [
      { english: "I regret ignoring the doctor's advice.", vietnamese: "Tôi hối hận vì đã phớt lờ lời khuyên của bác sĩ." },
      { english: "Burning out was a wake-up call for me.", vietnamese: "Việc kiệt sức là hồi chuông cảnh tỉnh đối với tôi." },
      { english: "If only someone had warned me about the side effects.", vietnamese: "Giá mà có ai cảnh báo tôi về tác dụng phụ." },
      { english: "You shouldn't have skipped the warm-up.", vietnamese: "Lẽ ra bạn không nên bỏ phần khởi động." },
    ],
    dialogue: [
      { speaker: "Kate", english: "You don't look well. What's wrong?", vietnamese: "Trông bạn không khoẻ. Có chuyện gì vậy?" },
      { speaker: "Son", english: "I've been working twelve hours a day. I think I've burnt out.", vietnamese: "Mình làm mười hai tiếng mỗi ngày. Chắc mình kiệt sức rồi." },
      { speaker: "Kate", english: "I warned you last month! You should have taken a break.", vietnamese: "Mình đã cảnh báo bạn tháng trước mà! Lẽ ra bạn nên nghỉ ngơi." },
      { speaker: "Son", english: "I know. I wish I'd taken your advice.", vietnamese: "Mình biết. Ước gì mình nghe lời khuyên của bạn." },
      { speaker: "Kate", english: "And you shouldn't have skipped all those meals.", vietnamese: "Và lẽ ra bạn không nên bỏ bữa nhiều như vậy." },
      { speaker: "Son", english: "True. This is a wake-up call. I won't ignore it.", vietnamese: "Đúng. Đây là hồi chuông cảnh tỉnh. Mình sẽ không phớt lờ nó." },
    ],
    practice: [
      q("Complete: I should ___ a coat. It's freezing!", ["have brought", "brought", "bring", "had brought"], "have brought", "Should have + past participle."),
      q("Complete: You ___ eaten that. Now you feel sick.", ["shouldn't have", "should have", "shouldn't", "should had"], "shouldn't have", "A past mistake."),
      q("Complete: I wish I ___ harder at school.", ["had studied", "studied", "study", "would study"], "had studied", "Past regret: past perfect."),
      q("“Ngủ quên” in English is…", ["oversleep", "sleep over", "upsleep", "outsleep"], "oversleep", "Oversleep = sleep too long."),
    ],
    challenge: [
      q("Complete: If only I ___ the warning!", ["hadn't ignored", "didn't ignore", "don't ignore", "wouldn't ignore"], "hadn't ignored", "If only + past perfect."),
      q("Choose the correct sentence.", ["We should have left earlier.", "We should of left earlier.", "We should left earlier.", "We should had left earlier."], "We should have left earlier.", "Never should of."),
      q("Complete: I regret ___ to the party. It was boring.", ["going", "to go", "go", "went"], "going", "Regret + -ing for the past."),
      q("Complete: If you keep doing overtime, you'll ___.", ["burn out", "burn up", "burn down", "burn off"], "burn out", "Burn out = become exhausted."),
      q("What is a “wake-up call”?", ["an event that makes you realise you must change", "an alarm clock", "a phone call in the morning", "a doctor's visit"], "an event that makes you realise you must change", "Wake-up call = warning."),
    ],
  }, {
    key: "had-better", title: "You'd Better See a Doctor", titleVi: "Lời khuyên mạnh",
    objectives: [
      "I can give strong advice and warnings about health.",
      "Use had better / had better not + base verb",
      "Use ought to and should, and know how strong each one is",
    ],
    vocabulary: [
      { word: "GP", ipa: "/ˌdʒiː ˈpiː/", partOfSpeech: "noun", vietnamese: "bác sĩ đa khoa", definition: "a family doctor who treats general health problems (British English)", example: { english: "Make an appointment with your GP.", vietnamese: "Hãy đặt lịch hẹn với bác sĩ đa khoa của bạn." } },
      { word: "prescription", ipa: "/prɪˈskrɪpʃn/", partOfSpeech: "noun", vietnamese: "đơn thuốc", definition: "a doctor's written order for medicine", example: { english: "You can't buy these tablets without a prescription.", vietnamese: "Bạn không thể mua loại thuốc này nếu không có đơn." } },
      { word: "chemist's", ipa: "/ˈkemɪsts/", partOfSpeech: "noun", vietnamese: "hiệu thuốc", definition: "a shop that sells medicine (British English)", example: { english: "Is there a chemist's near here?", vietnamese: "Gần đây có hiệu thuốc không?" } },
      { word: "painkiller", ipa: "/ˈpeɪnkɪlə/", partOfSpeech: "noun", vietnamese: "thuốc giảm đau", definition: "medicine that reduces pain", example: { english: "Take a painkiller and lie down.", vietnamese: "Uống một viên giảm đau rồi nằm nghỉ đi." } },
      { word: "side effect", ipa: "/ˈsaɪd ɪfekt/", partOfSpeech: "noun", vietnamese: "tác dụng phụ", definition: "an unwanted effect of a medicine", example: { english: "A common side effect is feeling sleepy.", vietnamese: "Tác dụng phụ thường gặp là buồn ngủ." } },
      { word: "allergic", ipa: "/əˈlɜːdʒɪk/", partOfSpeech: "adjective", vietnamese: "dị ứng", definition: "becoming ill from touching or eating something (+ to)", example: { english: "I'm allergic to seafood.", vietnamese: "Tôi bị dị ứng hải sản." } },
      { word: "symptom", ipa: "/ˈsɪmptəm/", partOfSpeech: "noun", vietnamese: "triệu chứng", definition: "a sign of an illness", example: { english: "A high temperature is a symptom of flu.", vietnamese: "Sốt cao là một triệu chứng của cúm." } },
      { word: "get some rest", ipa: "/ˌɡet səm ˈrest/", partOfSpeech: "collocation", vietnamese: "nghỉ ngơi", definition: "to relax or sleep so your body can recover", example: { english: "Go home and get some rest.", vietnamese: "Về nhà và nghỉ ngơi đi." } },
    ],
    grammar: [{
      title: "Had better",
      pattern: "had better ('d better) + base verb · had better not + base verb (strong advice; or something bad will happen)",
      explanation: {
        english: "Had better gives strong advice about a particular situation, often with a warning: You'd better see a doctor about that cough. We'd better not be late, or they'll start without us. It refers to now or the future, not the past, even though it uses had. It takes the base verb with no to.",
        vietnamese: "Had better dùng để khuyên mạnh trong một tình huống cụ thể, thường kèm cảnh báo: You'd better see a doctor about that cough. We'd better not be late, or they'll start without us. Nó nói về hiện tại hoặc tương lai, không phải quá khứ, dù dùng had. Theo sau là động từ nguyên mẫu, không có to.",
      },
      examples: [
        { english: "You'd better take the painkillers with food.", vietnamese: "Bạn nên uống thuốc giảm đau cùng đồ ăn." },
        { english: "I'd better not have another coffee. I won't sleep.", vietnamese: "Tôi không nên uống thêm cà phê. Sẽ không ngủ được." },
      ],
      mistake: {
        wrong: "You had better to stay in bed.", right: "You'd better stay in bed.",
        why: { english: "Had better takes the base verb, with no to.", vietnamese: "Had better đi với động từ nguyên mẫu, không có to." },
      },
    }, {
      title: "Ought to and should",
      pattern: "should / ought to + base verb (advice) · had better (stronger, urgent) · must / have to (necessary)",
      explanation: {
        english: "Should and ought to mean the same: it's a good idea. Ought always needs to: You ought to drink more water. Had better is stronger and more urgent. Must and have to say it's necessary, not just a good idea: You must take all the tablets. Choose the strength that fits the situation.",
        vietnamese: "Should và ought to có cùng nghĩa: đó là ý hay. Ought luôn cần có to: You ought to drink more water. Had better mạnh hơn và khẩn cấp hơn. Must và have to nói rằng điều đó cần thiết, không chỉ là ý hay: You must take all the tablets. Hãy chọn mức độ phù hợp với tình huống.",
      },
      examples: [
        { english: "You ought to get some rest this weekend.", vietnamese: "Cuối tuần này bạn nên nghỉ ngơi." },
        { english: "You must finish the antibiotics, even if you feel better.", vietnamese: "Bạn phải uống hết kháng sinh, dù đã thấy đỡ." },
      ],
      mistake: {
        wrong: "You ought see a doctor.", right: "You ought to see a doctor.",
        why: { english: "Ought always needs to before the verb.", vietnamese: "Ought luôn cần to trước động từ." },
      },
    }],
    examples: [
      { english: "If the symptoms get worse, you'd better call your GP.", vietnamese: "Nếu triệu chứng nặng hơn, bạn nên gọi bác sĩ đa khoa." },
      { english: "Take the prescription to the chemist's.", vietnamese: "Mang đơn thuốc đến hiệu thuốc." },
      { english: "You ought to tell the doctor that you're allergic to penicillin.", vietnamese: "Bạn nên nói với bác sĩ là bạn dị ứng penicillin." },
      { english: "Read the side effects before you take any painkiller.", vietnamese: "Hãy đọc tác dụng phụ trước khi uống bất kỳ thuốc giảm đau nào." },
    ],
    dialogue: [
      { speaker: "Dr Evans", english: "So what are your symptoms?", vietnamese: "Vậy anh có những triệu chứng gì?" },
      { speaker: "Huy", english: "A sore throat, a temperature, and I feel weak.", vietnamese: "Đau họng, sốt, và tôi thấy mệt mỏi." },
      { speaker: "Dr Evans", english: "It sounds like flu. Are you allergic to anything?", vietnamese: "Nghe như bị cúm. Anh có dị ứng gì không?" },
      { speaker: "Huy", english: "Not that I know of.", vietnamese: "Theo tôi biết thì không." },
      { speaker: "Dr Evans", english: "Here's a prescription. You'd better stay at home for a few days.", vietnamese: "Đây là đơn thuốc. Anh nên ở nhà vài ngày." },
      { speaker: "Huy", english: "Thank you. I'll get it from the chemist's and get some rest.", vietnamese: "Cảm ơn bác sĩ. Tôi sẽ mua thuốc ở hiệu thuốc và nghỉ ngơi." },
    ],
    practice: [
      q("Complete: You'd better ___ a coat. It's cold.", ["take", "to take", "taking", "took"], "take", "Had better + base verb."),
      q("Complete: We'd better ___ late.", ["not be", "not to be", "don't be", "be not"], "not be", "Had better not + base verb."),
      q("Complete: You ought ___ more vegetables.", ["to eat", "eat", "eating", "ate"], "to eat", "Ought to + base verb."),
      q("“Đơn thuốc” in English is…", ["prescription", "description", "recipe", "medicine paper"], "prescription", "Prescription = doctor's order for medicine."),
    ],
    challenge: [
      q("Which is the strongest advice?", ["You'd better go to hospital now.", "You could go to hospital.", "Maybe you might go to hospital.", "How about going to hospital?"], "You'd better go to hospital now.", "Had better = strong, urgent."),
      q("Choose the correct sentence.", ["She'd better see a dentist.", "She'd better to see a dentist.", "She'd better seeing a dentist.", "She had better saw a dentist."], "She'd better see a dentist.", "Had better + base verb."),
      q("Complete: I'm ___ to cats, so I can't visit her.", ["allergic", "allergy", "allergies", "allergical"], "allergic", "Allergic to."),
      q("In British English, you buy medicine at a…", ["chemist's", "drugstore", "doctor's", "medicine house"], "chemist's", "Chemist's = British pharmacy."),
      q("What is a “side effect”?", ["an unwanted effect of a medicine", "a medicine for pain", "a kind of doctor", "a symptom of flu"], "an unwanted effect of a medicine", "Side effect = unwanted result."),
    ],
  }, {
    key: "health-idioms", title: "Under the Weather", titleVi: "Thành ngữ về sức khoẻ",
    objectives: [
      "I can talk about health in a natural, idiomatic way.",
      "Use health idioms exactly as they are, without changing words",
      "Use feel + adjective and feel like + noun or -ing",
    ],
    vocabulary: [
      { word: "under the weather", ipa: "/ˌʌndə ðə ˈweðə/", partOfSpeech: "idiom", vietnamese: "hơi mệt, không khoẻ", definition: "slightly ill", example: { english: "I'm feeling a bit under the weather today.", vietnamese: "Hôm nay tôi thấy hơi mệt." } },
      { word: "on the mend", ipa: "/ɒn ðə ˈmend/", partOfSpeech: "idiom", vietnamese: "đang hồi phục", definition: "getting better after an illness", example: { english: "Grandad had a bad fall, but he's on the mend now.", vietnamese: "Ông bị ngã nặng, nhưng giờ đang hồi phục." } },
      { word: "back on your feet", ipa: "/ˌbæk ɒn jə ˈfiːt/", partOfSpeech: "idiom", vietnamese: "khoẻ lại, đứng dậy được", definition: "healthy again after an illness", example: { english: "Rest for a week and you'll be back on your feet.", vietnamese: "Nghỉ một tuần là bạn sẽ khoẻ lại." } },
      { word: "a clean bill of health", ipa: "/ə ˌkliːn bɪl əv ˈhelθ/", partOfSpeech: "idiom", vietnamese: "giấy xác nhận sức khoẻ tốt", definition: "a doctor's statement that you are healthy", example: { english: "The doctor gave me a clean bill of health.", vietnamese: "Bác sĩ xác nhận tôi hoàn toàn khoẻ mạnh." } },
      { word: "run-down", ipa: "/ˌrʌn ˈdaʊn/", partOfSpeech: "adjective", vietnamese: "mệt mỏi, suy nhược", definition: "tired and slightly ill, often from working too hard", example: { english: "I've been feeling run-down since the exams.", vietnamese: "Từ sau kỳ thi tôi thấy suy nhược." } },
      { word: "as fit as a fiddle", ipa: "/əz ˌfɪt əz ə ˈfɪdl/", partOfSpeech: "idiom", vietnamese: "khoẻ như vâm", definition: "very healthy and strong", example: { english: "My grandmother is 85 and as fit as a fiddle.", vietnamese: "Bà tôi 85 tuổi mà vẫn khoẻ như vâm." } },
      { word: "splitting headache", ipa: "/ˌsplɪtɪŋ ˈhedeɪk/", partOfSpeech: "collocation", vietnamese: "đau đầu như búa bổ", definition: "a very bad headache", example: { english: "I woke up with a splitting headache.", vietnamese: "Tôi thức dậy với cơn đau đầu như búa bổ." } },
      { word: "in good shape", ipa: "/ɪn ˌɡʊd ˈʃeɪp/", partOfSpeech: "idiom", vietnamese: "có thể lực tốt", definition: "physically fit", example: { english: "You have to be in good shape to climb Fansipan.", vietnamese: "Bạn phải có thể lực tốt mới leo được Fansipan." } },
    ],
    grammar: [{
      title: "Idioms are fixed",
      pattern: "under the weather (not below / in bad weather) · on the mend · back on your feet · as fit as a fiddle",
      explanation: {
        english: "An idiom's meaning is not the sum of its words, and its words can't be changed. Say under the weather, not below the weather; back on my feet, not back on my legs. You can usually change the verb tense or the pronoun: She's been under the weather. I'll be back on my feet soon. Idioms are mostly informal, so avoid them in formal writing.",
        vietnamese: "Nghĩa của thành ngữ không phải tổng nghĩa các từ, và không thể thay đổi từ trong đó. Nói under the weather, không nói below the weather; back on my feet, không nói back on my legs. Thường có thể đổi thì của động từ hoặc đại từ: She's been under the weather. I'll be back on my feet soon. Thành ngữ phần lớn là thân mật, nên tránh dùng trong văn viết trang trọng.",
      },
      examples: [
        { english: "He's been under the weather all week.", vietnamese: "Cả tuần nay anh ấy không được khoẻ." },
        { english: "Don't worry, she'll be back on her feet in no time.", vietnamese: "Đừng lo, cô ấy sẽ khoẻ lại nhanh thôi." },
      ],
      mistake: {
        wrong: "I feel a bit below the weather.", right: "I feel a bit under the weather.",
        why: { english: "The idiom is fixed: under the weather.", vietnamese: "Thành ngữ là cố định: under the weather." },
      },
    }, {
      title: "Feel and feel like",
      pattern: "feel + adjective (feel sick) · feel like + noun (feel like a new person) · feel like + -ing (= want to)",
      explanation: {
        english: "Feel + adjective describes your state: I feel run-down. Feel like + noun compares: After the holiday, I feel like a new person. Feel like + -ing means “want to”: I don't feel like going out tonight. Don't use to after feel like.",
        vietnamese: "Feel + tính từ mô tả trạng thái: I feel run-down. Feel like + danh từ để so sánh: After the holiday, I feel like a new person. Feel like + -ing nghĩa là “muốn”: I don't feel like going out tonight. Không dùng to sau feel like.",
      },
      examples: [
        { english: "I feel much better today, thanks.", vietnamese: "Hôm nay tôi thấy khoẻ hơn nhiều rồi, cảm ơn." },
        { english: "Do you feel like getting some fresh air?", vietnamese: "Bạn có muốn ra ngoài hít thở không khí trong lành không?" },
      ],
      mistake: {
        wrong: "I don't feel like to go to work today.", right: "I don't feel like going to work today.",
        why: { english: "Feel like (= want) is followed by -ing.", vietnamese: "Feel like (= muốn) theo sau là -ing." },
      },
    }],
    examples: [
      { english: "After a week of rest, I'm finally on the mend.", vietnamese: "Sau một tuần nghỉ ngơi, cuối cùng tôi đang hồi phục." },
      { english: "I've got a splitting headache. I don't feel like cooking.", vietnamese: "Tôi đau đầu như búa bổ. Không muốn nấu ăn chút nào." },
      { english: "She's run-down because she's been working too hard.", vietnamese: "Cô ấy suy nhược vì làm việc quá sức." },
      { english: "The doctor gave him a clean bill of health, so he can play again.", vietnamese: "Bác sĩ xác nhận anh ấy hoàn toàn khoẻ, nên anh ấy có thể thi đấu lại." },
    ],
    dialogue: [
      { speaker: "Lisa", english: "Are you coming to the cinema tonight?", vietnamese: "Tối nay bạn có đi xem phim không?" },
      { speaker: "Hoang", english: "I don't think so. I'm a bit under the weather.", vietnamese: "Chắc không. Mình hơi mệt." },
      { speaker: "Lisa", english: "Oh no. What's wrong?", vietnamese: "Ôi không. Bạn bị sao thế?" },
      { speaker: "Hoang", english: "I've got a splitting headache and I feel run-down.", vietnamese: "Mình đau đầu như búa bổ và thấy suy nhược." },
      { speaker: "Lisa", english: "You've been working too hard. Get some sleep.", vietnamese: "Bạn làm việc quá sức rồi. Ngủ một giấc đi." },
      { speaker: "Hoang", english: "I will. I'll be back on my feet by the weekend.", vietnamese: "Mình sẽ ngủ. Đến cuối tuần mình sẽ khoẻ lại." },
    ],
    practice: [
      q("Complete: I'm a bit ___ the weather today.", ["under", "below", "in", "over"], "under", "Under the weather."),
      q("Complete: She's been ill, but she's on the ___ now.", ["mend", "fix", "repair", "heal"], "mend", "On the mend."),
      q("Complete: I don't feel like ___ out tonight.", ["going", "to go", "go", "went"], "going", "Feel like + -ing."),
      q("“Khoẻ như vâm” in English is…", ["as fit as a fiddle", "as strong as a fiddle", "as fit as a horse", "fit like a fiddle"], "as fit as a fiddle", "Fixed idiom."),
    ],
    challenge: [
      q("Complete: After the operation, it took him a month to get back on his ___.", ["feet", "legs", "knees", "foot"], "feet", "Back on your feet."),
      q("Complete: The doctor gave me a clean ___ of health.", ["bill", "paper", "card", "note"], "bill", "A clean bill of health."),
      q("Choose the correct sentence.", ["I feel like a new person.", "I feel like new person.", "I feel a new person like.", "I feel as a new person."], "I feel like a new person.", "Feel like + noun."),
      q("Complete: She's been working nights and feels ___.", ["run-down", "run-out", "run-up", "run-over"], "run-down", "Run-down = tired and slightly ill."),
      q("What does “in good shape” mean?", ["physically fit", "well dressed", "round", "in a good mood"], "physically fit", "In good shape = fit."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 4", isReview: true,
    objectives: [
      "I can talk about health, lifestyle choices and regrets naturally.",
      "Check third and mixed conditionals, should have, wish + past perfect, had better and health idioms",
    ],
    vocabulary: [
      { word: "recover", ipa: "/rɪˈkʌvə/", partOfSpeech: "verb", vietnamese: "hồi phục", definition: "to get better after an illness or injury", example: { english: "Has he recovered from his cold?", vietnamese: "Anh ấy đã khỏi cảm chưa?" } },
      { word: "injury", ipa: "/ˈɪndʒəri/", partOfSpeech: "noun", vietnamese: "chấn thương", definition: "damage to the body, for example in an accident", example: { english: "Warming up helps prevent injury.", vietnamese: "Khởi động giúp phòng tránh chấn thương." } },
      { word: "lifestyle", ipa: "/ˈlaɪfstaɪl/", partOfSpeech: "noun", vietnamese: "lối sống", definition: "the way a person lives", example: { english: "City life can be an unhealthy lifestyle.", vietnamese: "Cuộc sống thành phố có thể là một lối sống không lành mạnh." } },
      { word: "regret", ipa: "/rɪˈɡret/", partOfSpeech: "verb", vietnamese: "hối tiếc", definition: "to feel sorry about something you did or didn't do", example: { english: "You won't regret joining the gym.", vietnamese: "Bạn sẽ không hối tiếc khi tham gia phòng tập." } },
      { word: "prescription", ipa: "/prɪˈskrɪpʃn/", partOfSpeech: "noun", vietnamese: "đơn thuốc", definition: "a doctor's written order for medicine", example: { english: "The doctor wrote me a prescription.", vietnamese: "Bác sĩ kê cho tôi một đơn thuốc." } },
      { word: "under the weather", ipa: "/ˌʌndə ðə ˈweðə/", partOfSpeech: "idiom", vietnamese: "hơi mệt, không khoẻ", definition: "slightly ill", example: { english: "Sorry, I can't come. I'm under the weather.", vietnamese: "Xin lỗi, tôi không đến được. Tôi hơi mệt." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "If I had known, I would have… · If I'd slept, I wouldn't be tired now · should have gone · I wish I had… · You'd better rest · under the weather",
      explanation: {
        english: "Check these: in the third conditional, the if part has had + past participle and never would; a mixed conditional uses would + verb for a present result; regrets use should have / shouldn't have + past participle, and wish or if only + past perfect; had better takes the base verb without to, and ought always needs to; idioms are fixed, and feel like (want) takes -ing.",
        vietnamese: "Hãy kiểm tra: trong câu điều kiện loại 3, vế if dùng had + quá khứ phân từ và không bao giờ có would; câu điều kiện hỗn hợp dùng would + động từ cho kết quả ở hiện tại; sự hối tiếc dùng should have / shouldn't have + quá khứ phân từ, và wish hoặc if only + quá khứ hoàn thành; had better đi với động từ nguyên mẫu không có to, còn ought luôn cần to; thành ngữ là cố định, và feel like (muốn) đi với -ing.",
      },
      examples: [
        { english: "If I'd warmed up, I wouldn't have got this injury.", vietnamese: "Nếu tôi khởi động thì đã không bị chấn thương này." },
        { english: "You'd better get that prescription before the chemist's closes.", vietnamese: "Bạn nên mua thuốc theo đơn trước khi hiệu thuốc đóng cửa." },
      ],
    }],
    examples: [
      { english: "I regret my old lifestyle. I wish I'd changed it sooner.", vietnamese: "Tôi hối tiếc lối sống cũ. Ước gì tôi thay đổi sớm hơn." },
      { english: "It took months to recover from the injury.", vietnamese: "Mất nhiều tháng để hồi phục sau chấn thương." },
      { english: "If you're under the weather, you'd better stay at home.", vietnamese: "Nếu bạn thấy không khoẻ thì nên ở nhà." },
    ],
    dialogue: [
      { speaker: "Ben", english: "How's your knee? Have you recovered?", vietnamese: "Đầu gối bạn thế nào? Khỏi chưa?" },
      { speaker: "Mai", english: "Almost. It was a bad injury. I should have stopped running when it hurt.", vietnamese: "Gần khỏi rồi. Chấn thương khá nặng. Lẽ ra mình nên dừng chạy khi thấy đau." },
      { speaker: "Ben", english: "If you'd seen a doctor sooner, you'd be running again now.", vietnamese: "Nếu bạn đi khám sớm hơn thì giờ đã chạy lại được rồi." },
      { speaker: "Mai", english: "I know. I regret ignoring it.", vietnamese: "Mình biết. Mình hối hận vì đã phớt lờ nó." },
      { speaker: "Ben", english: "Did they give you a prescription?", vietnamese: "Họ có kê đơn thuốc cho bạn không?" },
      { speaker: "Mai", english: "Just painkillers. And a new lifestyle: more stretching!", vietnamese: "Chỉ thuốc giảm đau thôi. Và một lối sống mới: giãn cơ nhiều hơn!" },
      { speaker: "Ben", english: "Well, you'd better follow it. I want my running partner back!", vietnamese: "Vậy thì bạn nên làm theo. Mình muốn bạn chạy cùng mình trở lại!" },
    ],
    practice: [
      q("Complete: If I ___ the map, I wouldn't have got lost.", ["had checked", "would check", "checked", "have checked"], "had checked", "Third conditional: had + past participle."),
      q("Complete: If I'd eaten lunch, I ___ hungry now.", ["wouldn't be", "wouldn't have been", "won't be", "hadn't been"], "wouldn't be", "Present result."),
      q("Complete: I should ___ you earlier.", ["have called", "called", "call", "had called"], "have called", "Should have + past participle."),
      q("Complete: You'd better ___ some rest.", ["get", "to get", "getting", "got"], "get", "Had better + base verb."),
    ],
    challenge: [
      q("Complete: I wish I ___ that cake. I feel sick.", ["hadn't eaten", "didn't eat", "don't eat", "wouldn't eat"], "hadn't eaten", "Past regret: past perfect."),
      q("Choose the correct sentence.", ["You ought to see a doctor.", "You ought see a doctor.", "You ought seeing a doctor.", "You ought to seeing a doctor."], "You ought to see a doctor.", "Ought to + base verb."),
      q("Complete: If he were taller, he ___ chosen for the team.", ["would have been", "would be", "had been", "will be"], "would have been", "Present condition, past result."),
      q("Complete: She's ill, but she's ___ the mend.", ["on", "in", "at", "under"], "on", "On the mend."),
      q("Complete: I don't feel like ___ anything.", ["eating", "to eat", "eat", "ate"], "eating", "Feel like + -ing."),
    ],
  }],
  assessment: [
    { id: "third-if", prompt: "Choose the correct sentence.", options: ["If I had known, I would have told you.", "If I would have known, I would have told you.", "If I knew, I would have told you yesterday.", "If I had knew, I would tell you."], correct: "If I had known, I would have told you.", explanation: "No would in the if part." },
    { id: "third-result", prompt: "Complete: If she'd left on time, she ___ the bus.", options: ["would have caught", "would catch", "had caught", "will catch"], correct: "would have caught", explanation: "Would have + past participle." },
    { id: "might-have", prompt: "Complete: If we'd played better, we ___ won.", options: ["might have", "might has", "might", "might had"], correct: "might have", explanation: "Might have + past participle." },
    { id: "mixed-present", prompt: "Complete: If I hadn't stayed up late, I ___ so tired now.", options: ["wouldn't be", "wouldn't have been", "won't be", "hadn't been"], correct: "wouldn't be", explanation: "Present result." },
    { id: "mixed-past", prompt: "Complete: If he ___ so shy, he would have spoken to her.", options: ["weren't", "isn't", "hadn't", "wouldn't be"], correct: "weren't", explanation: "Present condition." },
    { id: "should-have", prompt: "“Lẽ ra tôi nên đi ngủ sớm hơn.” in English is…", options: ["I should have gone to bed earlier.", "I should go to bed earlier yesterday.", "I should went to bed earlier.", "I should of gone to bed earlier."], correct: "I should have gone to bed earlier.", explanation: "Should have + past participle." },
    { id: "shouldnt-have", prompt: "Complete: You ___ told him. He's upset now.", options: ["shouldn't have", "should have", "shouldn't", "should had"], correct: "shouldn't have", explanation: "A past mistake." },
    { id: "wish-past", prompt: "Complete: I wish I ___ to your advice.", options: ["had listened", "listened", "listen", "would listen"], correct: "had listened", explanation: "Past regret: past perfect." },
    { id: "regret-ing", prompt: "Complete: I regret ___ my old job.", options: ["leaving", "to leave", "leave", "left"], correct: "leaving", explanation: "Regret + -ing." },
    { id: "had-better", prompt: "Complete: You'd better ___ a doctor.", options: ["see", "to see", "seeing", "saw"], correct: "see", explanation: "Had better + base verb." },
    { id: "had-better-not", prompt: "Complete: We'd better ___ too much noise.", options: ["not make", "not to make", "don't make", "make not"], correct: "not make", explanation: "Had better not + base verb." },
    { id: "ought-to", prompt: "Complete: You ought ___ more water.", options: ["to drink", "drink", "drinking", "drank"], correct: "to drink", explanation: "Ought to." },
    { id: "idiom-weather", prompt: "“Hôm nay tôi hơi mệt.” in natural English is…", options: ["I'm a bit under the weather today.", "I'm a bit below the weather today.", "I'm a bit in the weather today.", "I'm a bit bad weather today."], correct: "I'm a bit under the weather today.", explanation: "Fixed idiom." },
    { id: "idiom-feet", prompt: "Complete: She'll be back on her ___ soon.", options: ["feet", "legs", "foot", "toes"], correct: "feet", explanation: "Back on your feet." },
    { id: "feel-like", prompt: "Complete: Do you feel like ___ a walk?", options: ["going for", "to go for", "go for", "went for"], correct: "going for", explanation: "Feel like + -ing." },
  ],
};
