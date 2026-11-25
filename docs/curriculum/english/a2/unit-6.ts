// A2 Unit 6: Health & Advice. Vietnamese "bị đau đầu", "uống thuốc" and "không phải / không được" lead to "I have
// headache", "drink medicine", "My head is hurt", "should to", and "don't have to" where English means "mustn't".
// "Hút thuốc không tốt" also gives "Smoke is bad" for "Smoking is bad".
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "A2",
  number: 6,
  lessons: [{
    key: "how-do-you-feel", title: "I've Got a Headache", titleVi: "Tôi bị đau đầu",
    objectives: [
      "I can say how I feel and what is wrong with me.",
      "Say I've got a headache, a cold, a sore throat",
      "Use hurt and ache for pain: My back hurts",
    ],
    vocabulary: [
      { word: "headache", ipa: "/ˈhedeɪk/", partOfSpeech: "noun", vietnamese: "đau đầu", definition: "a pain in your head", example: { english: "I've got a terrible headache.", vietnamese: "Tôi bị đau đầu kinh khủng." } },
      { word: "sore throat", ipa: "/ˌsɔː ˈθrəʊt/", partOfSpeech: "noun", vietnamese: "đau họng", definition: "a pain in your throat, often when you have a cold", example: { english: "She's got a sore throat and can't sing.", vietnamese: "Cô ấy bị đau họng nên không hát được." } },
      { word: "cold", ipa: "/kəʊld/", partOfSpeech: "noun", vietnamese: "cảm lạnh", definition: "a common illness that makes you sneeze and gives you a runny nose", example: { english: "My son has got a cold.", vietnamese: "Con trai tôi bị cảm." } },
      { word: "temperature", ipa: "/ˈtemprətʃə/", partOfSpeech: "noun", vietnamese: "sốt; nhiệt độ", definition: "a body heat that is higher than normal, as in “I've got a temperature”", example: { english: "You've got a temperature. Go to bed.", vietnamese: "Con bị sốt rồi. Đi nằm đi." } },
      { word: "cough", ipa: "/kɒf/", partOfSpeech: "noun", vietnamese: "ho", definition: "a noisy push of air from your throat when you are ill", example: { english: "I've had a cough for a week.", vietnamese: "Tôi bị ho một tuần nay." } },
      { word: "stomach ache", ipa: "/ˈstʌmək eɪk/", partOfSpeech: "noun", vietnamese: "đau bụng", definition: "a pain in your stomach", example: { english: "I ate too much and now I've got stomach ache.", vietnamese: "Tôi ăn nhiều quá giờ bị đau bụng." } },
      { word: "hurt", ipa: "/hɜːt/", partOfSpeech: "verb", vietnamese: "đau, làm đau", definition: "to feel pain in a part of your body; to cause pain", example: { english: "My knee hurts when I run.", vietnamese: "Đầu gối tôi đau khi chạy." } },
      { word: "feel sick", ipa: "/ˌfiːl ˈsɪk/", partOfSpeech: "collocation", vietnamese: "buồn nôn", definition: "to feel that you are going to vomit (British English)", example: { english: "I feel sick on long bus journeys.", vietnamese: "Tôi bị buồn nôn khi đi xe buýt đường dài." } },
    ],
    grammar: [{
      title: "I've got a headache",
      pattern: "I've got a cold / a headache / a sore throat / a temperature · I feel sick / tired / ill",
      explanation: {
        english: "Say what is wrong with I've got (British) or I have + a / an: I've got a headache, a cough, a temperature. Stomach ache and toothache can go without a. Use feel + adjective for how you feel: I feel ill. I feel better today.",
        vietnamese: "Nói mình bị gì bằng I've got (tiếng Anh Anh) hoặc I have + a / an: I've got a headache, a cough, a temperature. Stomach ache và toothache có thể không cần a. Dùng feel + tính từ để nói cảm giác: I feel ill. I feel better today.",
      },
      examples: [
        { english: "I've got a cold and a sore throat.", vietnamese: "Tôi bị cảm và đau họng." },
        { english: "How do you feel today? A bit better, thanks.", vietnamese: "Hôm nay bạn thấy thế nào? Đỡ hơn một chút, cảm ơn." },
      ],
      mistake: {
        wrong: "I have headache.", right: "I've got a headache.",
        why: { english: "“Tôi bị đau đầu” has no article, but English counts one headache, one cold, one cough: use a.", vietnamese: "“Tôi bị đau đầu” không có mạo từ, nhưng tiếng Anh đếm một cơn đau đầu, một lần cảm, một cơn ho: hãy dùng a." },
      },
    }, {
      title: "It hurts",
      pattern: "My back hurts · My feet hurt · I've hurt my arm",
      explanation: {
        english: "For pain, the part of the body is the subject of hurt: My head hurts (not My head is hurt). Add -s with one body part: My leg hurts. My legs hurt. When you injure yourself, you are the subject: I've hurt my wrist.",
        vietnamese: "Khi nói về cơn đau, bộ phận cơ thể là chủ ngữ của hurt: My head hurts (không nói My head is hurt). Thêm -s khi chỉ một bộ phận: My leg hurts. My legs hurt. Khi bạn bị chấn thương, chủ ngữ là bạn: I've hurt my wrist.",
      },
      examples: [
        { english: "My eyes hurt after a long day at the computer.", vietnamese: "Mắt tôi đau sau một ngày dài làm việc với máy tính." },
        { english: "Where does it hurt? Here, on the left.", vietnamese: "Đau ở đâu? Ở đây, bên trái." },
      ],
      mistake: {
        wrong: "My stomach is hurt.", right: "My stomach hurts.",
        why: { english: "Hurt is the verb here, like ache. You don't need is.", vietnamese: "Hurt ở đây là động từ, giống ache. Không cần is." },
      },
    }],
    examples: [
      { english: "I can't come to work today. I've got a temperature.", vietnamese: "Hôm nay tôi không đi làm được. Tôi bị sốt." },
      { english: "My back hurts because I sit at a desk all day.", vietnamese: "Tôi đau lưng vì ngồi bàn cả ngày." },
      { english: "She feels sick, so she isn't eating anything.", vietnamese: "Cô ấy buồn nôn nên không ăn gì cả." },
      { english: "Have you got a cough or just a sore throat?", vietnamese: "Bạn bị ho hay chỉ đau họng thôi?" },
    ],
    dialogue: [
      { speaker: "Manager", english: "You don't look well, Tam. Are you OK?", vietnamese: "Trông em không khoẻ lắm, Tâm. Em ổn không?" },
      { speaker: "Tam", english: "Not really. I've got a headache and a sore throat.", vietnamese: "Không ổn lắm ạ. Em bị đau đầu và đau họng." },
      { speaker: "Manager", english: "Have you got a temperature?", vietnamese: "Em có sốt không?" },
      { speaker: "Tam", english: "I think so. And my whole body hurts.", vietnamese: "Chắc là có ạ. Và em đau khắp người." },
      { speaker: "Manager", english: "It sounds like flu. Go home and rest.", vietnamese: "Nghe giống cúm rồi. Em về nhà nghỉ đi." },
      { speaker: "Tam", english: "Thank you. I feel terrible.", vietnamese: "Em cảm ơn. Em thấy mệt quá." },
    ],
    practice: [
      q("Choose the correct sentence.", ["I've got a headache.", "I've got headache.", "I have a head hurt.", "I'm headache."], "I've got a headache.", "I've got + a + illness."),
      q("Complete: My back ___.", ["hurts", "is hurt", "hurt", "hurting"], "hurts", "My back (one) + hurts."),
      q("“Đau họng” in English is…", ["a sore throat", "a cough", "a cold", "a headache"], "a sore throat", "A sore throat is a pain in your throat."),
      q("Complete: I ___ sick. I think I ate something bad.", ["feel", "have", "am got", "hurt"], "feel", "Feel sick = feel like you will vomit."),
    ],
    challenge: [
      q("Complete: My feet ___ after the long walk.", ["hurt", "hurts", "are hurt", "hurting"], "hurt", "Plural body part: hurt (no -s)."),
      q("Choose the correct sentence.", ["She's got a temperature.", "She's got temperature high.", "She has hot temperature.", "She's temperature."], "She's got a temperature.", "Have got a temperature = have a fever."),
      q("Choose the correct sentence.", ["My stomach hurts.", "My stomach is hurt.", "My stomach hurting.", "I hurt stomach."], "My stomach hurts.", "Hurt is the verb; no is."),
      q("“How do you feel today?” Choose the best answer.", ["Much better, thanks.", "I feel with my hands.", "I've got better.", "Yes, I do."], "Much better, thanks.", "Answer with how you feel."),
      q("What is a “cough”?", ["a noisy push of air from your throat", "a pain in your head", "a high body temperature", "a feeling that you will vomit"], "a noisy push of air from your throat", "You cough when you have a cold."),
    ],
  }, {
    key: "at-the-doctors", title: "At the Doctor's", titleVi: "Ở phòng khám",
    objectives: [
      "I can explain my problem to a doctor and understand simple instructions.",
      "Answer “How long have you had it?” with for and since",
      "Say take medicine, not drink medicine",
    ],
    vocabulary: [
      { word: "GP", ipa: "/ˌdʒiː ˈpiː/", partOfSpeech: "noun", vietnamese: "bác sĩ đa khoa (gia đình)", definition: "a family doctor who treats general illnesses (British English)", example: { english: "You should see your GP.", vietnamese: "Bạn nên đi khám bác sĩ gia đình." } },
      { word: "symptoms", ipa: "/ˈsɪmptəmz/", partOfSpeech: "noun", vietnamese: "triệu chứng", definition: "signs that show you have an illness", example: { english: "What are your symptoms?", vietnamese: "Bạn có những triệu chứng gì?" } },
      { word: "prescription", ipa: "/prɪˈskrɪpʃn/", partOfSpeech: "noun", vietnamese: "đơn thuốc", definition: "a doctor's note that lets you get medicine", example: { english: "Take this prescription to the chemist's.", vietnamese: "Mang đơn thuốc này đến hiệu thuốc." } },
      { word: "tablets", ipa: "/ˈtæbləts/", partOfSpeech: "noun", vietnamese: "viên thuốc", definition: "small hard pieces of medicine that you swallow", example: { english: "Take two tablets three times a day.", vietnamese: "Uống hai viên, ngày ba lần." } },
      { word: "take medicine", ipa: "/ˌteɪk ˈmedsn/", partOfSpeech: "collocation", vietnamese: "uống thuốc", definition: "to swallow medicine", example: { english: "Have you taken your medicine today?", vietnamese: "Hôm nay bạn uống thuốc chưa?" } },
      { word: "allergic to", ipa: "/əˈlɜːdʒɪk tə/", partOfSpeech: "adjective", vietnamese: "dị ứng với", definition: "becoming ill when you eat, touch or breathe something", example: { english: "I'm allergic to seafood.", vietnamese: "Tôi bị dị ứng hải sản." } },
      { word: "since", ipa: "/sɪns/", partOfSpeech: "preposition", vietnamese: "từ (một thời điểm)", definition: "from a point in the past until now", example: { english: "I've had this cough since Monday.", vietnamese: "Tôi bị ho từ hôm thứ Hai." } },
      { word: "get better", ipa: "/ˌɡet ˈbetə/", partOfSpeech: "collocation", vietnamese: "khỏi bệnh, đỡ hơn", definition: "to become healthy again after an illness", example: { english: "Get better soon!", vietnamese: "Mau khỏi bệnh nhé!" } },
    ],
    grammar: [{
      title: "How long have you had it?",
      pattern: "How long have you had …? · I've had it for three days / since Monday",
      explanation: {
        english: "Doctors ask How long have you had this cough? It means from the start until now. Answer with I've had it for + a length of time (for three days, for a week) or since + the starting point (since Monday, since last week). Don't use the present: not I have it since Monday.",
        vietnamese: "Bác sĩ hay hỏi How long have you had this cough? nghĩa là từ lúc bắt đầu đến bây giờ. Trả lời bằng I've had it for + khoảng thời gian (for three days, for a week) hoặc since + mốc bắt đầu (since Monday, since last week). Đừng dùng thì hiện tại: không nói I have it since Monday.",
      },
      examples: [
        { english: "I've had a sore throat for four days.", vietnamese: "Tôi bị đau họng bốn ngày nay." },
        { english: "She's had a temperature since yesterday.", vietnamese: "Cô ấy bị sốt từ hôm qua." },
      ],
      mistake: {
        wrong: "I have this headache since Friday.", right: "I've had this headache since Friday.",
        why: { english: "When something started in the past and is still true now, English uses have had (the present perfect), not the present.", vietnamese: "Khi một việc bắt đầu trong quá khứ và vẫn còn đến bây giờ, tiếng Anh dùng have had (thì hiện tại hoàn thành), không dùng thì hiện tại." },
      },
    }, {
      title: "Take medicine",
      pattern: "take medicine / tablets / painkillers · twice a day · after meals",
      explanation: {
        english: "In English you take medicine and take tablets; you don't drink them, even with water. Say how often with once, twice, three times + a day: Take one tablet twice a day after meals.",
        vietnamese: "Trong tiếng Anh, uống thuốc là take medicine, take tablets; không dùng drink, kể cả khi uống với nước. Nói tần suất bằng once, twice, three times + a day: Take one tablet twice a day after meals.",
      },
      examples: [
        { english: "Take these tablets three times a day.", vietnamese: "Uống thuốc này ngày ba lần." },
        { english: "Don't take this medicine on an empty stomach.", vietnamese: "Đừng uống thuốc này khi bụng đói." },
      ],
      mistake: {
        wrong: "I drink medicine every morning.", right: "I take medicine every morning.",
        why: { english: "Vietnamese “uống thuốc” uses “uống” (drink), but English uses take for medicine.", vietnamese: "Tiếng Việt “uống thuốc” dùng “uống”, nhưng tiếng Anh dùng take cho thuốc." },
      },
    }],
    examples: [
      { english: "I'd like to make an appointment with a GP, please.", vietnamese: "Tôi muốn đặt lịch khám với bác sĩ đa khoa." },
      { english: "What are your symptoms? I've got a cough and I feel tired.", vietnamese: "Bạn có triệu chứng gì? Tôi bị ho và thấy mệt." },
      { english: "Are you allergic to any medicine?", vietnamese: "Bạn có dị ứng với loại thuốc nào không?" },
      { english: "Take one tablet after breakfast and you'll get better soon.", vietnamese: "Uống một viên sau bữa sáng và bạn sẽ sớm khỏi." },
    ],
    dialogue: [
      { speaker: "Doctor", english: "Hello. What seems to be the problem?", vietnamese: "Xin chào. Anh bị làm sao thế?" },
      { speaker: "Viet", english: "I've got a bad cough and a sore throat.", vietnamese: "Tôi bị ho nặng và đau họng." },
      { speaker: "Doctor", english: "How long have you had these symptoms?", vietnamese: "Anh bị những triệu chứng này bao lâu rồi?" },
      { speaker: "Viet", english: "I've had the cough for a week, and the sore throat since Tuesday.", vietnamese: "Tôi bị ho một tuần rồi, còn đau họng thì từ thứ Ba." },
      { speaker: "Doctor", english: "Are you allergic to anything?", vietnamese: "Anh có dị ứng với gì không?" },
      { speaker: "Viet", english: "No. Do I need a prescription?", vietnamese: "Không. Tôi có cần đơn thuốc không?" },
      { speaker: "Doctor", english: "Yes. Take these tablets twice a day, and you'll get better soon.", vietnamese: "Có. Uống thuốc này ngày hai lần, anh sẽ sớm khỏi thôi." },
    ],
    practice: [
      q("Complete: I've had a cold ___ three days.", ["for", "since", "from", "during"], "for", "For + a length of time."),
      q("Complete: She's had a headache ___ this morning.", ["since", "for", "from", "ago"], "since", "Since + the starting point."),
      q("Choose the correct sentence.", ["Take one tablet twice a day.", "Drink one tablet twice a day.", "Eat one tablet two times in day.", "Take one tablet two a day."], "Take one tablet twice a day.", "Take tablets; twice a day."),
      q("What is a “prescription”?", ["a doctor's note to get medicine", "a kind of tablet", "a hospital bed", "a doctor's appointment"], "a doctor's note to get medicine", "Take the prescription to the chemist's."),
    ],
    challenge: [
      q("Choose the correct answer to “How long have you had it?”", ["I've had it since Sunday.", "I have it since Sunday.", "I had it since Sunday.", "I'm having it from Sunday."], "I've had it since Sunday.", "Started in the past, still true: have had."),
      q("Complete: I ___ my medicine every evening.", ["take", "drink", "eat", "have got"], "take", "Take medicine."),
      q("Complete: I'm allergic ___ peanuts.", ["to", "with", "of", "for"], "to", "Allergic to + thing."),
      q("A British family doctor is called a…", ["GP", "nurse", "chemist", "surgeon"], "GP", "GP = general practitioner."),
      q("Your friend is ill. Say…", ["Get better soon!", "Be better soon!", "Make better soon!", "Feel good fastly!"], "Get better soon!", "Get better = become healthy again."),
    ],
  }, {
    key: "should", title: "You Should Rest", titleVi: "Lời khuyên với should",
    objectives: [
      "I can give and ask for advice.",
      "Use should and shouldn't + the base verb",
      "Ask “What should I do?” and “Should I …?”",
    ],
    vocabulary: [
      { word: "advice", ipa: "/ədˈvaɪs/", partOfSpeech: "noun", vietnamese: "lời khuyên", definition: "an opinion about what someone should do (uncountable)", example: { english: "Can I give you some advice?", vietnamese: "Tôi cho bạn một lời khuyên được không?" } },
      { word: "advise", ipa: "/ədˈvaɪz/", partOfSpeech: "verb", vietnamese: "khuyên", definition: "to tell someone what you think they should do", example: { english: "The doctor advised me to rest.", vietnamese: "Bác sĩ khuyên tôi nghỉ ngơi." } },
      { word: "rest", ipa: "/rest/", partOfSpeech: "verb", vietnamese: "nghỉ ngơi", definition: "to stop working or moving and relax", example: { english: "You should rest for a few days.", vietnamese: "Bạn nên nghỉ ngơi vài ngày." } },
      { word: "stay up late", ipa: "/ˌsteɪ ʌp ˈleɪt/", partOfSpeech: "phrase", vietnamese: "thức khuya", definition: "to go to bed later than usual", example: { english: "You shouldn't stay up late before an exam.", vietnamese: "Bạn không nên thức khuya trước kỳ thi." } },
      { word: "drink plenty of water", ipa: "/ˌdrɪŋk ˌplenti əv ˈwɔːtə/", partOfSpeech: "collocation", vietnamese: "uống nhiều nước", definition: "to drink a lot of water", example: { english: "In hot weather, drink plenty of water.", vietnamese: "Khi trời nóng, hãy uống nhiều nước." } },
      { word: "stressed", ipa: "/strest/", partOfSpeech: "adjective", vietnamese: "căng thẳng", definition: "worried and not able to relax", example: { english: "I'm really stressed about work.", vietnamese: "Tôi rất căng thẳng vì công việc." } },
      { word: "if I were you", ipa: "/ɪf aɪ ˈwɜː juː/", partOfSpeech: "phrase", vietnamese: "nếu tôi là bạn", definition: "used to give advice", example: { english: "If I were you, I'd see a doctor.", vietnamese: "Nếu tôi là bạn, tôi sẽ đi khám bác sĩ." } },
      { word: "take a break", ipa: "/ˌteɪk ə ˈbreɪk/", partOfSpeech: "collocation", vietnamese: "nghỉ giải lao", definition: "to stop working for a short time", example: { english: "Let's take a break for ten minutes.", vietnamese: "Mình nghỉ giải lao mười phút nhé." } },
    ],
    grammar: [{
      title: "Should and shouldn't",
      pattern: "You should + verb · You shouldn't + verb",
      explanation: {
        english: "Should gives advice: it is a good idea. Shouldn't means it is a bad idea. After should, use the base verb with no to and no -s: She should rest (not should to rest, should rests). Should is the same for every person.",
        vietnamese: "Should dùng để khuyên: đó là ý hay. Shouldn't nghĩa là đó là ý không hay. Sau should dùng động từ nguyên mẫu, không có to, không thêm -s: She should rest (không nói should to rest, should rests). Should giống nhau với mọi ngôi.",
      },
      examples: [
        { english: "You should drink plenty of water and rest.", vietnamese: "Bạn nên uống nhiều nước và nghỉ ngơi." },
        { english: "He shouldn't stay up so late.", vietnamese: "Anh ấy không nên thức khuya như vậy." },
      ],
      mistake: {
        wrong: "You should to see a doctor.", right: "You should see a doctor.",
        why: { english: "“Bạn nên đi khám” has no extra word, and English doesn't either: no to after should.", vietnamese: "“Bạn nên đi khám” không có từ thừa nào, tiếng Anh cũng vậy: không có to sau should." },
      },
    }, {
      title: "Asking for advice",
      pattern: "What should I do? · Should I …? · Can you give me some advice?",
      explanation: {
        english: "Ask for advice with What should I do? or Should I + verb?: Should I call the doctor? Advice is uncountable: some advice, a piece of advice (not an advice, advices). If I were you, I'd … is another way to give advice.",
        vietnamese: "Hỏi xin lời khuyên bằng What should I do? hoặc Should I + động từ?: Should I call the doctor? Advice không đếm được: some advice, a piece of advice (không nói an advice, advices). If I were you, I'd … là một cách khác để khuyên.",
      },
      examples: [
        { english: "I can't sleep. What should I do?", vietnamese: "Tôi không ngủ được. Tôi nên làm gì?" },
        { english: "Should I take a day off? If I were you, I'd stay at home.", vietnamese: "Tôi có nên nghỉ một ngày không? Nếu tôi là bạn, tôi sẽ ở nhà." },
      ],
    }],
    examples: [
      { english: "You look stressed. You should take a break.", vietnamese: "Trông bạn căng thẳng quá. Bạn nên nghỉ một chút." },
      { english: "The doctor advised her to rest and drink plenty of water.", vietnamese: "Bác sĩ khuyên cô ấy nghỉ ngơi và uống nhiều nước." },
      { english: "Thanks for the advice. It really helped.", vietnamese: "Cảm ơn lời khuyên của bạn. Nó thật sự có ích." },
      { english: "You shouldn't look at your phone in bed.", vietnamese: "Bạn không nên xem điện thoại trên giường." },
    ],
    dialogue: [
      { speaker: "Mia", english: "You look tired. Are you OK?", vietnamese: "Trông bạn mệt thế. Bạn ổn chứ?" },
      { speaker: "Thanh", english: "I'm so stressed. I've got exams next week and I can't sleep.", vietnamese: "Mình căng thẳng quá. Tuần sau mình thi mà không ngủ được." },
      { speaker: "Mia", english: "Do you stay up late?", vietnamese: "Bạn có thức khuya không?" },
      { speaker: "Thanh", english: "Every night, until two. What should I do?", vietnamese: "Đêm nào cũng thức đến hai giờ. Mình nên làm gì đây?" },
      { speaker: "Mia", english: "You should go to bed earlier, and you shouldn't drink coffee after lunch.", vietnamese: "Bạn nên đi ngủ sớm hơn, và không nên uống cà phê sau bữa trưa." },
      { speaker: "Thanh", english: "That's good advice. Thanks!", vietnamese: "Lời khuyên hay đấy. Cảm ơn bạn!" },
    ],
    practice: [
      q("Complete: You should ___ a doctor.", ["see", "to see", "seeing", "sees"], "see", "Should + base verb."),
      q("Complete: You ___ eat so much sugar. It's bad for you.", ["shouldn't", "should", "don't should", "not should"], "shouldn't", "Shouldn't = a bad idea."),
      q("Choose the correct question.", ["What should I do?", "What I should do?", "What should I to do?", "What do I should do?"], "What should I do?", "Question word + should + subject + verb."),
      q("“Thức khuya” in English is…", ["stay up late", "get up late", "go to bed early", "sleep late in"], "stay up late", "Stay up late = go to bed late."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["Can you give me some advice?", "Can you give me an advice?", "Can you give me some advices?", "Can you give me advices?"], "Can you give me some advice?", "Advice is uncountable."),
      q("Complete: She should ___ more.", ["rest", "rests", "to rest", "resting"], "rest", "Should + base verb, no -s."),
      q("Complete: If I ___ you, I'd take a break.", ["were", "am", "be", "was being"], "were", "If I were you is a fixed phrase."),
      q("Which word is the verb?", ["advise", "advice", "advisory", "adviced"], "advise", "Advise (verb, with /z/); advice (noun, with /s/)."),
      q("Choose the correct question.", ["Should I call my boss?", "Do I should call my boss?", "Should I to call my boss?", "I should call my boss?"], "Should I call my boss?", "Should + I + base verb?"),
    ],
  }, {
    key: "have-to", title: "Rules: Have To and Mustn't", titleVi: "Quy định: have to và mustn't",
    objectives: [
      "I can talk about rules and things that are necessary.",
      "Use have to and has to for what is necessary",
      "Tell don't have to (not necessary) from mustn't (not allowed)",
    ],
    vocabulary: [
      { word: "have to", ipa: "/ˈhæv tə/", partOfSpeech: "phrase", vietnamese: "phải", definition: "used to say that something is necessary", example: { english: "I have to work on Saturday.", vietnamese: "Tôi phải làm việc vào thứ Bảy." } },
      { word: "mustn't", ipa: "/ˈmʌsnt/", partOfSpeech: "phrase", vietnamese: "không được (cấm)", definition: "used to say that something is not allowed", example: { english: "You mustn't smoke in the hospital.", vietnamese: "Bạn không được hút thuốc trong bệnh viện." } },
      { word: "allowed", ipa: "/əˈlaʊd/", partOfSpeech: "adjective", vietnamese: "được phép", definition: "permitted by the rules", example: { english: "Are we allowed to take photos here?", vietnamese: "Chúng tôi có được phép chụp ảnh ở đây không?" } },
      { word: "wear a helmet", ipa: "/ˌweər ə ˈhelmɪt/", partOfSpeech: "collocation", vietnamese: "đội mũ bảo hiểm", definition: "to have a hard hat on your head when you ride", example: { english: "You have to wear a helmet on a motorbike.", vietnamese: "Đi xe máy bạn phải đội mũ bảo hiểm." } },
      { word: "visiting hours", ipa: "/ˈvɪzɪtɪŋ ˌaʊəz/", partOfSpeech: "noun", vietnamese: "giờ thăm bệnh", definition: "the times when you can visit someone in hospital", example: { english: "Visiting hours are from two to eight.", vietnamese: "Giờ thăm bệnh là từ hai giờ đến tám giờ." } },
      { word: "switch off", ipa: "/ˌswɪtʃ ˈɒf/", partOfSpeech: "phrasal verb", vietnamese: "tắt (thiết bị)", definition: "to stop a machine or light working", example: { english: "You have to switch off your phone in the exam.", vietnamese: "Bạn phải tắt điện thoại trong phòng thi." } },
      { word: "necessary", ipa: "/ˈnesəsəri/", partOfSpeech: "adjective", vietnamese: "cần thiết", definition: "needed in order to do something", example: { english: "Is it necessary to book in advance?", vietnamese: "Có cần đặt trước không?" } },
      { word: "rule", ipa: "/ruːl/", partOfSpeech: "noun", vietnamese: "quy định, luật lệ", definition: "something that says what you must or mustn't do", example: { english: "The rules are on the wall.", vietnamese: "Các quy định được dán trên tường." } },
    ],
    grammar: [{
      title: "Have to",
      pattern: "I / you / we / they have to · he / she / it has to · Do you have to …?",
      explanation: {
        english: "Have to says that something is necessary, often because of a rule: Nurses have to work at night. Use has to after he, she and it. Questions and negatives use do / does: Does she have to wear a uniform? The past is had to: I had to wait an hour.",
        vietnamese: "Have to cho biết một việc là cần thiết, thường do quy định: Nurses have to work at night. Dùng has to sau he, she và it. Câu hỏi và phủ định dùng do / does: Does she have to wear a uniform? Quá khứ là had to: I had to wait an hour.",
      },
      examples: [
        { english: "My brother has to get up at five for work.", vietnamese: "Anh trai tôi phải dậy lúc năm giờ để đi làm." },
        { english: "Do we have to switch off our phones?", vietnamese: "Chúng ta có phải tắt điện thoại không?" },
      ],
    }, {
      title: "Don't have to or mustn't?",
      pattern: "don't have to = it isn't necessary · mustn't = it isn't allowed",
      explanation: {
        english: "These look similar but mean very different things. You don't have to come means you can choose: it isn't necessary. You mustn't come means don't come: it is against the rules. Can't also means not allowed: You can't park here.",
        vietnamese: "Hai cụm này trông giống nhau nhưng nghĩa khác hẳn. You don't have to come nghĩa là bạn được chọn: không bắt buộc. You mustn't come nghĩa là đừng đến: trái quy định. Can't cũng có nghĩa là không được phép: You can't park here.",
      },
      examples: [
        { english: "You don't have to pay. The museum is free.", vietnamese: "Bạn không phải trả tiền. Bảo tàng miễn phí." },
        { english: "You mustn't use your phone while you're driving.", vietnamese: "Bạn không được dùng điện thoại khi đang lái xe." },
      ],
      mistake: {
        wrong: "You don't have to smoke here. It's a hospital.", right: "You mustn't smoke here. It's a hospital.",
        why: { english: "Vietnamese “không phải” (not necessary) and “không được” (not allowed) are different, and so are don't have to and mustn't. For a ban, use mustn't.", vietnamese: "Tiếng Việt phân biệt “không phải” (không cần) và “không được” (bị cấm), tiếng Anh cũng vậy với don't have to và mustn't. Khi cấm, dùng mustn't." },
      },
    }],
    examples: [
      { english: "In Vietnam you have to wear a helmet on a motorbike.", vietnamese: "Ở Việt Nam bạn phải đội mũ bảo hiểm khi đi xe máy." },
      { english: "You mustn't visit outside visiting hours.", vietnamese: "Bạn không được vào thăm ngoài giờ thăm bệnh." },
      { english: "It's Sunday, so I don't have to get up early.", vietnamese: "Hôm nay Chủ nhật nên tôi không phải dậy sớm." },
      { english: "Are dogs allowed in the park? No, it's against the rules.", vietnamese: "Chó có được vào công viên không? Không, trái quy định." },
    ],
    dialogue: [
      { speaker: "Nurse", english: "Welcome to the ward. There are a few rules.", vietnamese: "Chào mừng anh đến khoa. Có vài quy định nhé." },
      { speaker: "Son", english: "Of course. What do I have to do?", vietnamese: "Vâng. Tôi phải làm gì ạ?" },
      { speaker: "Nurse", english: "Visiting hours are from two to eight. Visitors mustn't come in the morning.", vietnamese: "Giờ thăm bệnh từ hai giờ đến tám giờ. Người thăm không được đến vào buổi sáng." },
      { speaker: "Son", english: "Do I have to stay in bed all day?", vietnamese: "Tôi có phải nằm trên giường cả ngày không?" },
      { speaker: "Nurse", english: "No, you don't have to. You can walk in the garden.", vietnamese: "Không, không bắt buộc. Anh có thể đi dạo trong vườn." },
      { speaker: "Son", english: "And am I allowed to use my phone?", vietnamese: "Thế tôi có được dùng điện thoại không?" },
      { speaker: "Nurse", english: "Yes, but you have to switch it off at night.", vietnamese: "Có, nhưng anh phải tắt máy vào ban đêm." },
    ],
    practice: [
      q("Complete: She ___ wear a uniform at work.", ["has to", "have to", "has", "must to"], "has to", "She + has to."),
      q("It isn't necessary. You…", ["don't have to", "mustn't", "can't", "have to"], "don't have to", "Don't have to = not necessary."),
      q("It is against the rules. You…", ["mustn't", "don't have to", "have to", "should"], "mustn't", "Mustn't = not allowed."),
      q("Complete: Do you ___ to work on Sundays?", ["have", "has", "must", "should"], "have", "Do + you + have to?"),
    ],
    challenge: [
      q("Complete: The museum is free. You ___ pay.", ["don't have to", "mustn't", "have to", "has to"], "don't have to", "Free = paying isn't necessary."),
      q("Complete: You ___ talk during the exam.", ["mustn't", "don't have to", "have to", "don't must"], "mustn't", "A rule: talking isn't allowed."),
      q("Complete: Yesterday I ___ wait two hours at the hospital.", ["had to", "have to", "must", "has to"], "had to", "The past of have to is had to."),
      q("Choose the correct question.", ["Does he have to work late?", "Does he has to work late?", "Has he to work late?", "Do he have to work late?"], "Does he have to work late?", "Does + he + have to."),
      q("“Được phép” in English is…", ["allowed", "necessary", "rule", "free"], "allowed", "Allowed = permitted."),
    ],
  }, {
    key: "healthy-habits", title: "Healthy Habits", titleVi: "Thói quen lành mạnh",
    objectives: [
      "I can talk about healthy and unhealthy habits and give reasons.",
      "Use verb-ing as the subject: Swimming is good for you",
      "Give reasons and results with because and so",
    ],
    vocabulary: [
      { word: "healthy", ipa: "/ˈhelθi/", partOfSpeech: "adjective", vietnamese: "lành mạnh, khoẻ mạnh", definition: "good for your body; strong and well", example: { english: "She eats a very healthy diet.", vietnamese: "Cô ấy ăn uống rất lành mạnh." } },
      { word: "unhealthy", ipa: "/ʌnˈhelθi/", partOfSpeech: "adjective", vietnamese: "không lành mạnh, có hại cho sức khoẻ", definition: "bad for your body", example: { english: "Fast food is often unhealthy.", vietnamese: "Đồ ăn nhanh thường không tốt cho sức khoẻ." } },
      { word: "good for you", ipa: "/ˌɡʊd fə ˈjuː/", partOfSpeech: "phrase", vietnamese: "tốt cho sức khoẻ", definition: "helping your body or mind", example: { english: "Walking is good for you.", vietnamese: "Đi bộ tốt cho sức khoẻ." } },
      { word: "diet", ipa: "/ˈdaɪət/", partOfSpeech: "noun", vietnamese: "chế độ ăn uống", definition: "the food you usually eat", example: { english: "A good diet has lots of fruit and vegetables.", vietnamese: "Một chế độ ăn tốt có nhiều rau quả." } },
      { word: "exercise", ipa: "/ˈeksəsaɪz/", partOfSpeech: "noun", vietnamese: "sự tập thể dục", definition: "physical activity to keep your body healthy", example: { english: "Do you get much exercise?", vietnamese: "Bạn có tập thể dục nhiều không?" } },
      { word: "work out", ipa: "/ˌwɜːk ˈaʊt/", partOfSpeech: "phrasal verb", vietnamese: "tập luyện (thể hình)", definition: "to exercise, often in a gym", example: { english: "I work out three times a week.", vietnamese: "Tôi tập thể hình ba lần một tuần." } },
      { word: "cut down on", ipa: "/ˌkʌt ˈdaʊn ɒn/", partOfSpeech: "phrasal verb", vietnamese: "cắt giảm", definition: "to have or do less of something", example: { english: "I'm trying to cut down on sugar.", vietnamese: "Tôi đang cố cắt giảm đường." } },
      { word: "a good night's sleep", ipa: "/ə ˌɡʊd naɪts ˈsliːp/", partOfSpeech: "phrase", vietnamese: "một giấc ngủ ngon", definition: "enough sleep, without waking up", example: { english: "Nothing helps like a good night's sleep.", vietnamese: "Không gì bằng một giấc ngủ ngon." } },
    ],
    grammar: [{
      title: "Swimming is good for you",
      pattern: "Verb-ing as subject: Walking is … · Eating too much sugar is …",
      explanation: {
        english: "To talk about an activity as a subject, use the -ing form: Swimming is good for you. Smoking is bad for your health. The -ing subject is singular, so use is. Don't use the base verb or a noun for the person: not Smoke is bad, not Swim is good.",
        vietnamese: "Để nói về một hoạt động làm chủ ngữ, dùng dạng -ing: Swimming is good for you. Smoking is bad for your health. Chủ ngữ -ing là số ít, nên dùng is. Đừng dùng động từ nguyên mẫu: không nói Smoke is bad, không nói Swim is good.",
      },
      examples: [
        { english: "Working out in the morning gives me energy.", vietnamese: "Tập luyện vào buổi sáng cho tôi năng lượng." },
        { english: "Getting a good night's sleep is very important.", vietnamese: "Ngủ đủ giấc rất quan trọng." },
      ],
      mistake: {
        wrong: "Smoke is bad for your health.", right: "Smoking is bad for your health.",
        why: { english: "“Hút thuốc có hại” uses the verb as it is, but in English the activity as a subject takes -ing. (Smoke on its own is the grey cloud from a fire.)", vietnamese: "“Hút thuốc có hại” dùng nguyên động từ, nhưng trong tiếng Anh hoạt động làm chủ ngữ phải thêm -ing. (Smoke đứng riêng là khói từ đám cháy.)" },
      },
    }, {
      title: "Because and so",
      pattern: "result + because + reason · reason + so + result",
      explanation: {
        english: "Because gives the reason: I walk to work because it's healthy. So gives the result: Walking is healthy, so I walk to work. Use one, not both: not Because it's healthy, so I walk.",
        vietnamese: "Because nêu lý do: I walk to work because it's healthy. So nêu kết quả: Walking is healthy, so I walk to work. Chỉ dùng một trong hai, không dùng cả hai: không nói Because it's healthy, so I walk.",
      },
      examples: [
        { english: "I'm cutting down on coffee because I can't sleep.", vietnamese: "Tôi đang giảm cà phê vì không ngủ được." },
        { english: "He works out every day, so he's very fit.", vietnamese: "Anh ấy tập luyện mỗi ngày nên rất cân đối." },
      ],
      mistake: {
        wrong: "Because I was tired, so I went to bed.", right: "I was tired, so I went to bed.",
        why: { english: "Vietnamese often uses “vì … nên …” together, but English uses because or so, not both.", vietnamese: "Tiếng Việt hay dùng cặp “vì … nên …”, nhưng tiếng Anh chỉ dùng because hoặc so, không dùng cả hai." },
      },
    }],
    examples: [
      { english: "Eating lots of vegetables is good for you.", vietnamese: "Ăn nhiều rau tốt cho sức khoẻ." },
      { english: "I want a healthier diet, so I'm cutting down on fried food.", vietnamese: "Tôi muốn ăn uống lành mạnh hơn nên đang giảm đồ chiên rán." },
      { english: "She works out at the gym because she sits at a desk all day.", vietnamese: "Cô ấy tập ở phòng gym vì cả ngày ngồi bàn." },
      { english: "Staying up late is unhealthy. You need a good night's sleep.", vietnamese: "Thức khuya không tốt cho sức khoẻ. Bạn cần một giấc ngủ ngon." },
    ],
    dialogue: [
      { speaker: "Ethan", english: "You look great! What's your secret?", vietnamese: "Trông bạn khoẻ quá! Bí quyết là gì thế?" },
      { speaker: "Quynh", english: "I changed my diet. I'm cutting down on sugar.", vietnamese: "Mình thay đổi chế độ ăn. Mình đang giảm đường." },
      { speaker: "Ethan", english: "Do you get much exercise too?", vietnamese: "Bạn có tập thể dục nhiều không?" },
      { speaker: "Quynh", english: "Yes, I work out twice a week, and walking to work is good exercise.", vietnamese: "Có, mình tập hai buổi một tuần, và đi bộ đi làm cũng là cách tập tốt." },
      { speaker: "Ethan", english: "I'm always tired because I stay up late.", vietnamese: "Mình lúc nào cũng mệt vì thức khuya." },
      { speaker: "Quynh", english: "Then go to bed earlier! Sleeping well is the best medicine.", vietnamese: "Vậy thì đi ngủ sớm hơn đi! Ngủ ngon là liều thuốc tốt nhất." },
    ],
    practice: [
      q("Complete: ___ is good for your heart.", ["Swimming", "Swim", "To swimming", "Swims"], "Swimming", "An activity as the subject: -ing."),
      q("Choose the correct sentence.", ["Smoking is bad for you.", "Smoke is bad for you.", "Smokes is bad for you.", "To smoking is bad for you."], "Smoking is bad for you.", "Smoking (the activity) is the subject."),
      q("Complete: I was hungry, ___ I made a sandwich.", ["so", "because", "but because", "so because"], "so", "So gives the result."),
      q("“Cắt giảm” in English is…", ["cut down on", "work out", "give out", "cut up"], "cut down on", "Cut down on = have less of."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["I go to bed early because I get up at five.", "Because I get up at five, so I go to bed early.", "I go to bed early so because I get up at five.", "I go to bed early, because so I get up at five."], "I go to bed early because I get up at five.", "Because or so, not both."),
      q("Complete: Eating too much salt ___ unhealthy.", ["is", "are", "be", "have"], "is", "An -ing subject is singular: is."),
      q("Complete: I ___ out at the gym after work.", ["work", "make", "do", "take"], "work", "Work out = exercise."),
      q("What is your “diet”?", ["the food you usually eat", "a gym", "a kind of medicine", "a doctor's advice"], "the food you usually eat", "Diet = the food you usually eat."),
      q("Choose the opposite of “healthy”.", ["unhealthy", "dishealthy", "inhealthy", "nonhealth"], "unhealthy", "Un- + healthy."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 6", isReview: true,
    objectives: [
      "I can talk about health, see a doctor, and give advice and rules accurately.",
      "Check a + illness, take medicine, for / since, should, have to / mustn't and -ing subjects",
    ],
    vocabulary: [
      { word: "headache", ipa: "/ˈhedeɪk/", partOfSpeech: "noun", vietnamese: "đau đầu", definition: "a pain in your head", example: { english: "Loud music gives me a headache.", vietnamese: "Nhạc to làm tôi đau đầu." } },
      { word: "take medicine", ipa: "/ˌteɪk ˈmedsn/", partOfSpeech: "collocation", vietnamese: "uống thuốc", definition: "to swallow medicine", example: { english: "Remember to take your medicine after dinner.", vietnamese: "Nhớ uống thuốc sau bữa tối nhé." } },
      { word: "since", ipa: "/sɪns/", partOfSpeech: "preposition", vietnamese: "từ (một thời điểm)", definition: "from a point in the past until now", example: { english: "He's been ill since the weekend.", vietnamese: "Anh ấy bị ốm từ cuối tuần." } },
      { word: "advice", ipa: "/ədˈvaɪs/", partOfSpeech: "noun", vietnamese: "lời khuyên", definition: "an opinion about what someone should do (uncountable)", example: { english: "My mum always gives me good advice.", vietnamese: "Mẹ tôi luôn cho tôi những lời khuyên hay." } },
      { word: "mustn't", ipa: "/ˈmʌsnt/", partOfSpeech: "phrase", vietnamese: "không được (cấm)", definition: "used to say that something is not allowed", example: { english: "You mustn't swim here. It's dangerous.", vietnamese: "Bạn không được bơi ở đây. Nguy hiểm lắm." } },
      { word: "cut down on", ipa: "/ˌkʌt ˈdaʊn ɒn/", partOfSpeech: "phrasal verb", vietnamese: "cắt giảm", definition: "to have or do less of something", example: { english: "You should cut down on fried food.", vietnamese: "Bạn nên giảm đồ chiên rán." } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "a headache · take medicine · for / since · should + verb · don't have to ≠ mustn't",
      explanation: {
        english: "Check these: a or an with an illness (a cold, a headache); take, not drink, medicine; for + a length of time and since + a starting point, with have had; should + base verb, with no to; don't have to means not necessary, mustn't means not allowed. And an activity as a subject takes -ing.",
        vietnamese: "Hãy kiểm tra: a hoặc an trước bệnh (a cold, a headache); dùng take, không dùng drink, với thuốc; for + khoảng thời gian và since + mốc bắt đầu, với have had; should + động từ nguyên mẫu, không có to; don't have to là không cần, mustn't là bị cấm. Và hoạt động làm chủ ngữ thì thêm -ing.",
      },
      examples: [
        { english: "I've had a headache since lunch. Should I take something?", vietnamese: "Tôi bị đau đầu từ trưa. Tôi có nên uống thuốc gì không?" },
        { english: "You don't have to come, but you mustn't be late if you do.", vietnamese: "Bạn không bắt buộc phải đến, nhưng nếu đến thì không được muộn." },
      ],
    }],
    examples: [
      { english: "I've got a headache, so I'm going to take some medicine.", vietnamese: "Tôi bị đau đầu nên sẽ uống ít thuốc." },
      { english: "The doctor's advice was simple: cut down on salt.", vietnamese: "Lời khuyên của bác sĩ rất đơn giản: giảm muối." },
      { english: "You mustn't drive after taking these tablets.", vietnamese: "Bạn không được lái xe sau khi uống thuốc này." },
    ],
    dialogue: [
      { speaker: "Doctor", english: "What's the problem today?", vietnamese: "Hôm nay chị bị làm sao?" },
      { speaker: "Lien", english: "I've had a headache since Thursday, and I feel tired all the time.", vietnamese: "Tôi bị đau đầu từ thứ Năm, và lúc nào cũng thấy mệt." },
      { speaker: "Doctor", english: "Do you drink a lot of coffee?", vietnamese: "Chị có uống nhiều cà phê không?" },
      { speaker: "Lien", english: "About five cups a day, because I have to work late.", vietnamese: "Khoảng năm cốc một ngày, vì tôi phải làm việc muộn." },
      { speaker: "Doctor", english: "You should cut down on coffee, and you mustn't skip meals.", vietnamese: "Chị nên giảm cà phê, và không được bỏ bữa." },
      { speaker: "Lien", english: "Do I have to take any medicine?", vietnamese: "Tôi có phải uống thuốc gì không?" },
      { speaker: "Doctor", english: "No, you don't have to. Just rest and drink plenty of water.", vietnamese: "Không, không cần. Chỉ cần nghỉ ngơi và uống nhiều nước." },
    ],
    practice: [
      q("Choose the correct sentence.", ["I've got a cold.", "I've got cold.", "I'm cold sick.", "I have colds."], "I've got a cold.", "A + illness."),
      q("Complete: I ___ these tablets every morning.", ["take", "drink", "eat", "do"], "take", "Take medicine / tablets."),
      q("Complete: You should ___ more water.", ["drink", "to drink", "drinking", "drinks"], "drink", "Should + base verb."),
      q("Complete: She's had a cough ___ two weeks.", ["for", "since", "from", "ago"], "for", "For + a length of time."),
    ],
    challenge: [
      q("It's Saturday. Work isn't necessary. I…", ["don't have to work", "mustn't work", "have to work", "can't to work"], "don't have to work", "Not necessary: don't have to."),
      q("Complete: You ___ use your phone in the cinema.", ["mustn't", "don't have to", "have to", "should to"], "mustn't", "Not allowed: mustn't."),
      q("Complete: ___ too much is bad for you.", ["Eating", "Eat", "Eats", "To eating"], "Eating", "An activity as the subject: -ing."),
      q("Choose the correct sentence.", ["My arm hurts.", "My arm is hurt me.", "My arm hurting.", "I'm arm hurts."], "My arm hurts.", "Body part + hurts."),
      q("Choose the correct sentence.", ["Thanks for the advice.", "Thanks for the advices.", "Thanks for an advice.", "Thanks for the advise."], "Thanks for the advice.", "Advice is an uncountable noun."),
    ],
  }],
  assessment: [
    { id: "a-illness", prompt: "Choose the correct sentence.", options: ["I've got a sore throat.", "I've got sore throat.", "I'm sore throat.", "I have sore throats."], correct: "I've got a sore throat.", explanation: "A + illness." },
    { id: "hurts", prompt: "Complete: My head ___.", options: ["hurts", "is hurt", "hurting", "hurt me is"], correct: "hurts", explanation: "Body part + hurts." },
    { id: "feel", prompt: "Complete: I ___ sick after the boat trip.", options: ["felt", "had", "got a", "hurt"], correct: "felt", explanation: "Feel sick; past: felt." },
    { id: "for-duration", prompt: "Complete: I've had this cough ___ ten days.", options: ["for", "since", "ago", "from"], correct: "for", explanation: "For + a length of time." },
    { id: "since-start", prompt: "Complete: He's had a temperature ___ Monday.", options: ["since", "for", "ago", "during"], correct: "since", explanation: "Since + a starting point." },
    { id: "have-had", prompt: "Choose the correct sentence.", options: ["I've had a headache since this morning.", "I have a headache since this morning.", "I had a headache since this morning.", "I'm having a headache since this morning."], correct: "I've had a headache since this morning.", explanation: "Started in the past, still true: have had." },
    { id: "take-medicine", prompt: "Complete: Don't forget to ___ your medicine.", options: ["take", "drink", "eat", "make"], correct: "take", explanation: "Take medicine." },
    { id: "should-base", prompt: "Choose the correct sentence.", options: ["You should see a dentist.", "You should to see a dentist.", "You should seeing a dentist.", "You should sees a dentist."], correct: "You should see a dentist.", explanation: "Should + base verb." },
    { id: "should-question", prompt: "Choose the correct question.", options: ["What should I do?", "What I should do?", "What should I to do?", "What do I should do?"], correct: "What should I do?", explanation: "Question word + should + I + verb." },
    { id: "advice-uncountable", prompt: "Choose the correct sentence.", options: ["She gave me some good advice.", "She gave me a good advice.", "She gave me some good advices.", "She gave me good advise."], correct: "She gave me some good advice.", explanation: "Advice is uncountable." },
    { id: "has-to", prompt: "Complete: My mother ___ take tablets every day.", options: ["has to", "have to", "must to", "has"], correct: "has to", explanation: "She + has to." },
    { id: "dont-have-to", prompt: "Complete: The bus is free. You ___ buy a ticket.", options: ["don't have to", "mustn't", "have to", "has to"], correct: "don't have to", explanation: "Not necessary: don't have to." },
    { id: "mustnt", prompt: "Complete: You ___ park here. It's for ambulances.", options: ["mustn't", "don't have to", "have to", "should to"], correct: "mustn't", explanation: "Not allowed: mustn't." },
    { id: "ing-subject", prompt: "Complete: ___ is my favourite exercise.", options: ["Cycling", "Cycle", "Cycles", "To cycling"], correct: "Cycling", explanation: "An activity as the subject: -ing." },
    { id: "because-so", prompt: "Choose the correct sentence.", options: ["I was ill, so I stayed at home.", "Because I was ill, so I stayed at home.", "I was ill, because so I stayed at home.", "So I was ill, because I stayed at home."], correct: "I was ill, so I stayed at home.", explanation: "Because or so, not both." },
  ],
};
