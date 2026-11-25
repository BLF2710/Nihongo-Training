// A2 Unit 4: Food & Shopping. Vietnamese nouns have no plural form and no countable / uncountable split, so the usual
// mistakes are "breads", "a rice", "How many money?"; "Give me a coffee" sounds rude in English, and "too" is used
// where English means "very".
import type { Question } from "../../../../shared/course/english/schema.ts";
import type { UnitSource } from "../../../../scripts/english-course/source.ts";

const q = (prompt: string, options: string[], correct: string, explanation: string): Question => ({ prompt, options, correct, explanation });

export const unit: UnitSource = {
  level: "A2",
  number: 4,
  lessons: [{
    key: "countable-and-uncountable", title: "Some Bread, Two Apples", titleVi: "Danh từ đếm được và không đếm được",
    objectives: [
      "I can talk about food and drink with the right a, an, some and plural forms.",
      "Tell countable nouns (an apple, two apples) from uncountable ones (rice, bread)",
      "Count uncountable things with a bottle of, a loaf of, a piece of",
    ],
    vocabulary: [
      { word: "rice", ipa: "/raɪs/", partOfSpeech: "noun", vietnamese: "gạo, cơm", definition: "small white or brown grains that are cooked and eaten (uncountable)", example: { english: "We eat rice with almost every meal.", vietnamese: "Chúng tôi ăn cơm gần như mọi bữa." } },
      { word: "bread", ipa: "/bred/", partOfSpeech: "noun", vietnamese: "bánh mì", definition: "a food made from flour, water and yeast and baked (uncountable)", example: { english: "Could you buy some bread on your way home?", vietnamese: "Trên đường về bạn mua ít bánh mì được không?" } },
      { word: "a loaf of", ipa: "/ə ˈləʊf əv/", partOfSpeech: "phrase", vietnamese: "một ổ (bánh mì)", definition: "one whole piece of bread, baked in one shape", example: { english: "I'd like a loaf of brown bread, please.", vietnamese: "Cho tôi một ổ bánh mì đen." } },
      { word: "a piece of", ipa: "/ə ˈpiːs əv/", partOfSpeech: "phrase", vietnamese: "một miếng, một mẩu", definition: "one part of something uncountable", example: { english: "Would you like a piece of cake?", vietnamese: "Bạn có muốn một miếng bánh không?" } },
      { word: "a bottle of", ipa: "/ə ˈbɒtl əv/", partOfSpeech: "phrase", vietnamese: "một chai", definition: "the amount a bottle holds", example: { english: "Can we have a bottle of water?", vietnamese: "Cho chúng tôi một chai nước nhé?" } },
      { word: "vegetables", ipa: "/ˈvedʒtəblz/", partOfSpeech: "noun", vietnamese: "rau củ", definition: "plants or parts of plants that you eat, like carrots and cabbage", example: { english: "Children should eat more vegetables.", vietnamese: "Trẻ em nên ăn nhiều rau hơn." } },
      { word: "fruit", ipa: "/fruːt/", partOfSpeech: "noun", vietnamese: "hoa quả, trái cây", definition: "the sweet part of a plant that you eat, like apples and mangoes (usually uncountable)", example: { english: "There's some fruit in the fridge.", vietnamese: "Có ít hoa quả trong tủ lạnh." } },
      { word: "meat", ipa: "/miːt/", partOfSpeech: "noun", vietnamese: "thịt", definition: "the flesh of an animal that you eat (uncountable)", example: { english: "My sister doesn't eat meat.", vietnamese: "Em gái tôi không ăn thịt." } },
    ],
    grammar: [{
      title: "Countable and uncountable",
      pattern: "an apple · two apples · some rice · some bread (not a bread, breads)",
      explanation: {
        english: "Countable nouns can be one or many: an egg, three eggs. Uncountable nouns are things we see as a mass, like rice, bread, water, meat, milk and money: they have no plural and no a or an. Use some with both plural and uncountable nouns: some eggs, some milk.",
        vietnamese: "Danh từ đếm được có thể là một hoặc nhiều: an egg, three eggs. Danh từ không đếm được là những thứ ta xem như một khối, như rice, bread, water, meat, milk và money: chúng không có số nhiều và không dùng a hay an. Dùng some với cả danh từ số nhiều và danh từ không đếm được: some eggs, some milk.",
      },
      examples: [
        { english: "I had an egg and some bread for breakfast.", vietnamese: "Bữa sáng tôi ăn một quả trứng và ít bánh mì." },
        { english: "We need some vegetables and two onions.", vietnamese: "Chúng ta cần ít rau và hai củ hành." },
      ],
      mistake: {
        wrong: "I bought two breads.", right: "I bought two loaves of bread.",
        why: { english: "Vietnamese counts “hai ổ bánh mì” with a counting word, and English does the same: bread is uncountable, so count the loaves.", vietnamese: "Tiếng Việt đếm “hai ổ bánh mì” với từ chỉ đơn vị, tiếng Anh cũng vậy: bread không đếm được, nên đếm loaves (ổ)." },
      },
    }, {
      title: "Counting uncountable things",
      pattern: "a bottle of water · a loaf of bread · a piece of cake · a cup of tea · a kilo of rice",
      explanation: {
        english: "To count something uncountable, count its container or a piece of it: a bottle of water, two cups of coffee, a piece of cheese, a kilo of rice. The counting word takes the plural: two bottles of water (not two waters, except when ordering drinks in a café).",
        vietnamese: "Để đếm thứ không đếm được, hãy đếm vật chứa hoặc một phần của nó: a bottle of water, two cups of coffee, a piece of cheese, a kilo of rice. Từ chỉ đơn vị mới chia số nhiều: two bottles of water (không nói two waters, trừ khi gọi đồ uống ở quán).",
      },
      examples: [
        { english: "Could I have a cup of tea and a piece of cake?", vietnamese: "Cho tôi một tách trà và một miếng bánh được không?" },
        { english: "She bought two kilos of rice and a bottle of fish sauce.", vietnamese: "Cô ấy mua hai cân gạo và một chai nước mắm." },
      ],
    }],
    examples: [
      { english: "There isn't any meat, but there are some eggs.", vietnamese: "Không còn thịt, nhưng có vài quả trứng." },
      { english: "Fruit is cheaper at the market than in the supermarket.", vietnamese: "Hoa quả ở chợ rẻ hơn ở siêu thị." },
      { english: "I'll get a loaf of bread and a bottle of milk.", vietnamese: "Tôi sẽ mua một ổ bánh mì và một chai sữa." },
      { english: "Would you like some rice with your vegetables?", vietnamese: "Bạn có muốn ăn rau với cơm không?" },
    ],
    dialogue: [
      { speaker: "Mum", english: "We need some things for dinner. Can you write a list?", vietnamese: "Mình cần mua vài thứ cho bữa tối. Con viết danh sách được không?" },
      { speaker: "Kim", english: "OK. Some rice, some meat, and what else?", vietnamese: "Vâng. Ít gạo, ít thịt, còn gì nữa ạ?" },
      { speaker: "Mum", english: "A loaf of bread and some vegetables. Have we got any fruit?", vietnamese: "Một ổ bánh mì và ít rau. Nhà mình còn hoa quả không?" },
      { speaker: "Kim", english: "There are two bananas, but there isn't any milk.", vietnamese: "Còn hai quả chuối, nhưng hết sữa rồi ạ." },
      { speaker: "Mum", english: "Then add a bottle of milk, please.", vietnamese: "Vậy thêm một chai sữa nhé." },
    ],
    practice: [
      q("Which noun is uncountable?", ["rice", "apple", "egg", "onion"], "rice", "Rice is a mass: some rice, not a rice."),
      q("Complete: I'd like ___ bread, please.", ["some", "a", "an", "two"], "some", "Bread is uncountable: some bread."),
      q("Choose the correct phrase.", ["a loaf of bread", "a bread", "a breads", "one bread loaf of"], "a loaf of bread", "Count bread with a loaf of."),
      q("Complete: There are ___ eggs in the fridge.", ["some", "a", "an", "much"], "some", "Plural countable: some eggs."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["We need some vegetables.", "We need a vegetables.", "We need some vegetable.", "We need an vegetables."], "We need some vegetables.", "Vegetables is plural: some vegetables."),
      q("Complete: Could I have a ___ of water?", ["bottle", "loaf", "piece", "slice"], "bottle", "Water comes in a bottle."),
      q("Choose the correct sentence.", ["She doesn't eat meat.", "She doesn't eat a meat.", "She doesn't eat meats any.", "She doesn't eat an meat."], "She doesn't eat meat.", "Meat is uncountable: no a."),
      q("Complete: Would you like a ___ of cake?", ["piece", "bottle", "loaf", "kilo"], "piece", "A piece of cake."),
      q("Choose the correct sentence.", ["I bought two kilos of rice.", "I bought two rices.", "I bought two kilo of rices.", "I bought a two rice."], "I bought two kilos of rice.", "Count the kilos; rice stays singular."),
    ],
  }, {
    key: "how-much-how-many", title: "How Much? How Many?", titleVi: "Bao nhiêu?",
    objectives: [
      "I can ask about and say amounts of food and other things.",
      "Ask How many with countable nouns and How much with uncountable ones",
      "Use a lot of, a few, a little, not much and not many",
    ],
    vocabulary: [
      { word: "how many", ipa: "/ˌhaʊ ˈmeni/", partOfSpeech: "phrase", vietnamese: "bao nhiêu (đếm được)", definition: "used to ask about a number of countable things", example: { english: "How many eggs do we need?", vietnamese: "Chúng ta cần bao nhiêu quả trứng?" } },
      { word: "how much", ipa: "/ˌhaʊ ˈmʌtʃ/", partOfSpeech: "phrase", vietnamese: "bao nhiêu (không đếm được); giá bao nhiêu", definition: "used to ask about an amount of something uncountable, or a price", example: { english: "How much sugar do you take?", vietnamese: "Bạn cho bao nhiêu đường?" } },
      { word: "a lot of", ipa: "/ə ˈlɒt əv/", partOfSpeech: "determiner", vietnamese: "nhiều", definition: "a large number or amount of", example: { english: "There's a lot of traffic today.", vietnamese: "Hôm nay xe cộ đông quá." } },
      { word: "a few", ipa: "/ə ˈfjuː/", partOfSpeech: "determiner", vietnamese: "một vài (đếm được)", definition: "a small number of", example: { english: "I've got a few friends in London.", vietnamese: "Tôi có vài người bạn ở London." } },
      { word: "a little", ipa: "/ə ˈlɪtl/", partOfSpeech: "determiner", vietnamese: "một ít (không đếm được)", definition: "a small amount of", example: { english: "Add a little salt.", vietnamese: "Thêm một chút muối." } },
      { word: "sugar", ipa: "/ˈʃʊɡə/", partOfSpeech: "noun", vietnamese: "đường", definition: "a sweet white or brown substance added to food and drinks", example: { english: "No sugar for me, thanks.", vietnamese: "Không đường cho tôi nhé, cảm ơn." } },
      { word: "salt", ipa: "/sɔːlt/", partOfSpeech: "noun", vietnamese: "muối", definition: "white grains that give food a salty taste", example: { english: "This soup needs more salt.", vietnamese: "Món canh này cần thêm muối." } },
      { word: "enough", ipa: "/ɪˈnʌf/", partOfSpeech: "determiner", vietnamese: "đủ", definition: "as much or as many as you need", example: { english: "Have we got enough rice for six people?", vietnamese: "Mình có đủ gạo cho sáu người không?" } },
    ],
    grammar: [{
      title: "How many, how much",
      pattern: "How many + plural noun? · How much + uncountable noun?",
      explanation: {
        english: "Ask How many with plural countable nouns (How many apples?) and How much with uncountable nouns (How much water?). How much? on its own also asks about a price: How much is this? How much are these shoes?",
        vietnamese: "Hỏi How many với danh từ đếm được số nhiều (How many apples?) và How much với danh từ không đếm được (How much water?). How much? đứng một mình cũng dùng để hỏi giá: How much is this? How much are these shoes?",
      },
      examples: [
        { english: "How many people are coming to dinner?", vietnamese: "Có bao nhiêu người đến ăn tối?" },
        { english: "How much milk is there in the fridge?", vietnamese: "Trong tủ lạnh còn bao nhiêu sữa?" },
      ],
      mistake: {
        wrong: "How many money have you got?", right: "How much money have you got?",
        why: { english: "Money is uncountable in English (you count the pounds or dong, not the money), so use how much.", vietnamese: "Money không đếm được trong tiếng Anh (ta đếm bảng Anh hoặc đồng, không đếm money), nên dùng how much." },
      },
    }, {
      title: "A lot of, a few, a little",
      pattern: "a lot of + both · a few / not many + countable · a little / not much + uncountable",
      explanation: {
        english: "A lot of works with both kinds of noun. For small amounts, use a few with countable nouns (a few eggs) and a little with uncountable ones (a little milk). In negatives and questions, use many and much: There aren't many tomatoes. There isn't much time.",
        vietnamese: "A lot of dùng được với cả hai loại danh từ. Với số lượng nhỏ, dùng a few với danh từ đếm được (a few eggs) và a little với danh từ không đếm được (a little milk). Trong câu phủ định và câu hỏi, dùng many và much: There aren't many tomatoes. There isn't much time.",
      },
      examples: [
        { english: "There are a lot of mangoes, but there isn't much rice.", vietnamese: "Có nhiều xoài, nhưng không còn nhiều gạo." },
        { english: "Just a little sugar and a few ice cubes, please.", vietnamese: "Cho tôi một chút đường và vài viên đá thôi." },
      ],
    }],
    examples: [
      { english: "How much salt do I need? Just a little.", vietnamese: "Tôi cần bao nhiêu muối? Chỉ một ít thôi." },
      { english: "There aren't many people in the market today.", vietnamese: "Hôm nay chợ không đông người lắm." },
      { english: "We haven't got enough chairs. We need a few more.", vietnamese: "Chúng ta không đủ ghế. Cần thêm vài cái nữa." },
      { english: "He drinks a lot of coffee and he takes three sugars!", vietnamese: "Anh ấy uống nhiều cà phê và còn cho ba thìa đường!" },
    ],
    dialogue: [
      { speaker: "Ruby", english: "I'm making pancakes. How many eggs have we got?", vietnamese: "Mình đang làm bánh kếp. Nhà mình còn bao nhiêu quả trứng?" },
      { speaker: "Quan", english: "Only a few. Three, I think.", vietnamese: "Chỉ còn vài quả. Ba quả thì phải." },
      { speaker: "Ruby", english: "That's enough. And how much milk is there?", vietnamese: "Thế là đủ. Còn sữa còn bao nhiêu?" },
      { speaker: "Quan", english: "Not much. Just a little in the bottle.", vietnamese: "Không nhiều. Chỉ còn một ít trong chai." },
      { speaker: "Ruby", english: "Hmm. Is there a lot of sugar?", vietnamese: "Hừm. Còn nhiều đường không?" },
      { speaker: "Quan", english: "Yes, loads. But maybe we should just buy pancakes!", vietnamese: "Còn, nhiều lắm. Nhưng có lẽ mình nên đi mua bánh kếp cho xong!" },
    ],
    practice: [
      q("Complete: How ___ apples do you want?", ["many", "much", "lot", "few"], "many", "Apples are countable: how many."),
      q("Complete: How ___ water do you drink a day?", ["much", "many", "lot", "few"], "much", "Water is uncountable: how much."),
      q("Complete: Add ___ salt.", ["a little", "a few", "many", "a lot"], "a little", "Salt is uncountable: a little."),
      q("What does “enough” mean?", ["as much as you need", "too much", "not any", "a little more than you need"], "as much as you need", "Enough = the amount you need."),
    ],
    challenge: [
      q("Choose the correct question.", ["How much money do you need?", "How many money do you need?", "How many moneys do you need?", "How much moneys do you need?"], "How much money do you need?", "Money is uncountable."),
      q("Complete: I've got ___ friends in Da Nang.", ["a few", "a little", "much", "a lot"], "a few", "Friends are countable: a few."),
      q("Complete: There isn't ___ time. Hurry up!", ["much", "many", "a few", "lots"], "much", "Negative + uncountable: not much."),
      q("Complete: There are ___ of tourists in the old town.", ["a lot", "much", "many", "a little"], "a lot", "A lot of works with countable nouns too."),
      q("Choose the correct sentence.", ["There aren't many tomatoes left.", "There isn't many tomatoes left.", "There aren't much tomatoes left.", "There aren't a little tomatoes left."], "There aren't many tomatoes left.", "Plural countable: aren't many."),
    ],
  }, {
    key: "in-a-cafe", title: "Ordering in a Café", titleVi: "Gọi món ở quán cà phê",
    objectives: [
      "I can order food and drink politely in a café or restaurant.",
      "Order with I'd like … and Could I have …?",
      "Offer and answer with Would you like …?",
    ],
    vocabulary: [
      { word: "I'd like", ipa: "/aɪd ˈlaɪk/", partOfSpeech: "phrase", vietnamese: "tôi muốn (lịch sự)", definition: "a polite way to say what you want", example: { english: "I'd like a latte, please.", vietnamese: "Cho tôi một ly latte." } },
      { word: "could I have", ipa: "/ˈkʊd aɪ ˌhæv/", partOfSpeech: "phrase", vietnamese: "cho tôi … được không", definition: "a polite way to ask for something", example: { english: "Could I have the menu, please?", vietnamese: "Cho tôi xem thực đơn được không?" } },
      { word: "would you like", ipa: "/ˈwʊd ju ˌlaɪk/", partOfSpeech: "phrase", vietnamese: "bạn có muốn … không", definition: "a polite way to offer something", example: { english: "Would you like anything to drink?", vietnamese: "Anh có muốn uống gì không?" } },
      { word: "eat in", ipa: "/ˌiːt ˈɪn/", partOfSpeech: "phrasal verb", vietnamese: "ăn tại chỗ", definition: "to eat your food in the café, not take it away", example: { english: "Is that to eat in or take away?", vietnamese: "Ăn tại chỗ hay mang đi ạ?" } },
      { word: "takeaway", ipa: "/ˈteɪkəweɪ/", partOfSpeech: "noun", vietnamese: "đồ ăn mang đi", definition: "food you buy to eat somewhere else (British English)", example: { english: "Let's get a takeaway tonight.", vietnamese: "Tối nay mình mua đồ ăn mang về đi." } },
      { word: "the bill", ipa: "/ðə ˈbɪl/", partOfSpeech: "noun", vietnamese: "hoá đơn (tính tiền)", definition: "the piece of paper that shows how much you must pay in a restaurant", example: { english: "Could we have the bill, please?", vietnamese: "Cho chúng tôi xin hoá đơn." } },
      { word: "still or sparkling", ipa: "/ˌstɪl ɔː ˈspɑːklɪŋ/", partOfSpeech: "phrase", vietnamese: "nước lọc hay nước có ga", definition: "water without bubbles or with bubbles", example: { english: "Still or sparkling water?", vietnamese: "Nước lọc hay nước có ga ạ?" } },
      { word: "anything else", ipa: "/ˌeniθɪŋ ˈels/", partOfSpeech: "phrase", vietnamese: "còn gì nữa không", definition: "any other thing", example: { english: "Anything else? No, that's all, thanks.", vietnamese: "Còn gì nữa không ạ? Không, thế thôi, cảm ơn." } },
    ],
    grammar: [{
      title: "Ordering politely",
      pattern: "I'd like + noun · Could I have + noun? · Can I get + noun?",
      explanation: {
        english: "I'd like is short for I would like. It is softer than I want, which can sound rude to a waiter. Could I have …? is also polite. Always add please, and say thank you or thanks when it comes.",
        vietnamese: "I'd like là dạng rút gọn của I would like. Câu này nhẹ nhàng hơn I want, vốn có thể nghe bất lịch sự với người phục vụ. Could I have …? cũng lịch sự. Luôn thêm please, và nói thank you hoặc thanks khi được mang đồ ra.",
      },
      examples: [
        { english: "I'd like the chicken soup and a glass of orange juice, please.", vietnamese: "Cho tôi món súp gà và một ly nước cam." },
        { english: "Could I have some more water, please?", vietnamese: "Cho tôi thêm ít nước được không?" },
      ],
      mistake: {
        wrong: "Give me a coffee.", right: "Could I have a coffee, please?",
        why: { english: "“Cho tôi một cà phê” is polite in Vietnamese, but “Give me…” sounds like an order in English. Use I'd like or Could I have, and please.", vietnamese: "“Cho tôi một cà phê” là lịch sự trong tiếng Việt, nhưng “Give me…” nghe như ra lệnh trong tiếng Anh. Hãy dùng I'd like hoặc Could I have, kèm please." },
      },
    }, {
      title: "Would you like …?",
      pattern: "Would you like + noun? · Would you like to + verb? → Yes, please. / No, thank you.",
      explanation: {
        english: "Waiters and hosts offer things with Would you like …? Answer Yes, please or No, thank you (not Yes, I would like). Would you like is an offer; Do you like asks about what you enjoy in general.",
        vietnamese: "Người phục vụ và chủ nhà mời bằng Would you like …? Trả lời Yes, please hoặc No, thank you (không nói Yes, I would like). Would you like là lời mời; Do you like hỏi về sở thích nói chung.",
      },
      examples: [
        { english: "Would you like some dessert? No, thank you. I'm full.", vietnamese: "Bạn có muốn ăn tráng miệng không? Không, cảm ơn. Tôi no rồi." },
        { english: "Would you like to see the menu? Yes, please.", vietnamese: "Anh có muốn xem thực đơn không? Có, cảm ơn." },
      ],
    }],
    examples: [
      { english: "Two coffees to take away, please.", vietnamese: "Cho hai cà phê mang đi." },
      { english: "Could we have the bill, please? We're in a hurry.", vietnamese: "Cho chúng tôi tính tiền với. Chúng tôi đang vội." },
      { english: "Would you like still or sparkling water?", vietnamese: "Anh muốn nước lọc hay nước có ga?" },
      { english: "I'd like a cheese sandwich and a cup of tea.", vietnamese: "Cho tôi một bánh mì kẹp phô mai và một tách trà." },
    ],
    dialogue: [
      { speaker: "Waiter", english: "Hi there. Are you eating in?", vietnamese: "Xin chào. Anh chị ăn tại chỗ ạ?" },
      { speaker: "Phong", english: "Yes, please. Could I have a flat white and a croissant?", vietnamese: "Vâng. Cho tôi một ly flat white và một bánh sừng bò được không?" },
      { speaker: "Waiter", english: "Of course. Anything else?", vietnamese: "Tất nhiên ạ. Anh có gọi gì nữa không?" },
      { speaker: "Phong", english: "I'd like a glass of water too, please.", vietnamese: "Cho tôi thêm một cốc nước nữa." },
      { speaker: "Waiter", english: "Still or sparkling?", vietnamese: "Nước lọc hay nước có ga ạ?" },
      { speaker: "Phong", english: "Still, please. And could I have the bill when you've got a moment?", vietnamese: "Nước lọc nhé. Và lúc nào rảnh thì mang hoá đơn cho tôi được không?" },
    ],
    practice: [
      q("Choose the most polite order.", ["Could I have a tea, please?", "Give me a tea.", "I want tea.", "Tea. Now."], "Could I have a tea, please?", "Could I have …, please? is polite."),
      q("“Would you like some cake?” Choose the best answer.", ["Yes, please.", "Yes, I like.", "Yes, I would like.", "Yes, I do."], "Yes, please.", "Answer an offer with Yes, please or No, thank you."),
      q("What is “the bill”?", ["what you must pay in a restaurant", "the menu", "a tip for the waiter", "a table for two"], "what you must pay in a restaurant", "Ask for the bill at the end of a meal."),
      q("Complete: ___ like a hot chocolate, please.", ["I'd", "I", "I'm", "I do"], "I'd", "I'd like = I would like."),
    ],
    challenge: [
      q("“Eat in or take away?” means…", ["Will you eat here or somewhere else?", "Do you want a big or small meal?", "Do you want to eat now or later?", "Is the food hot or cold?"], "Will you eat here or somewhere else?", "Eat in = here; take away = somewhere else."),
      q("Choose the offer.", ["Would you like a drink?", "Do you like drinks?", "Did you like a drink?", "Are you like a drink?"], "Would you like a drink?", "Would you like …? offers something."),
      q("“Sparkling water” has…", ["bubbles", "ice", "sugar", "lemon"], "bubbles", "Sparkling = with bubbles; still = without."),
      q("Complete: Could ___ have the menu, please?", ["I", "you", "me", "my"], "I", "Could I have …?"),
      q("The waiter asks “Anything else?” You don't want more. Say…", ["No, that's all, thanks.", "No, I don't.", "Nothing else, give me.", "Yes, please."], "No, that's all, thanks.", "That's all = nothing more."),
    ],
  }, {
    key: "at-the-shops", title: "At the Shops", titleVi: "Ở cửa hàng",
    objectives: [
      "I can ask about prices, sizes and colours, and pay in a shop.",
      "Ask How much is …? and How much are …?",
      "Say what is wrong with too and not … enough",
    ],
    vocabulary: [
      { word: "try on", ipa: "/ˌtraɪ ˈɒn/", partOfSpeech: "phrasal verb", vietnamese: "mặc thử", definition: "to put on clothes to see if they fit", example: { english: "Can I try on this jacket?", vietnamese: "Tôi mặc thử chiếc áo khoác này được không?" } },
      { word: "size", ipa: "/saɪz/", partOfSpeech: "noun", vietnamese: "cỡ, kích thước", definition: "how big or small clothes or shoes are", example: { english: "Have you got this in a smaller size?", vietnamese: "Cái này có cỡ nhỏ hơn không?" } },
      { word: "fit", ipa: "/fɪt/", partOfSpeech: "verb", vietnamese: "vừa (kích cỡ)", definition: "to be the right size for someone", example: { english: "These shoes don't fit. They're too small.", vietnamese: "Đôi giày này không vừa. Nó chật quá." } },
      { word: "changing room", ipa: "/ˈtʃeɪndʒɪŋ ruːm/", partOfSpeech: "noun", vietnamese: "phòng thử đồ", definition: "a small room in a shop where you try on clothes", example: { english: "The changing rooms are at the back.", vietnamese: "Phòng thử đồ ở phía sau." } },
      { word: "on sale", ipa: "/ɒn ˈseɪl/", partOfSpeech: "phrase", vietnamese: "đang giảm giá", definition: "sold at a lower price than usual", example: { english: "These trainers are on sale this week.", vietnamese: "Đôi giày thể thao này đang giảm giá tuần này." } },
      { word: "pay by card", ipa: "/ˌpeɪ baɪ ˈkɑːd/", partOfSpeech: "collocation", vietnamese: "trả bằng thẻ", definition: "to use a bank card, not cash", example: { english: "Can I pay by card?", vietnamese: "Tôi trả bằng thẻ được không?" } },
      { word: "receipt", ipa: "/rɪˈsiːt/", partOfSpeech: "noun", vietnamese: "biên lai, hoá đơn mua hàng", definition: "a piece of paper that shows what you paid", example: { english: "Keep the receipt in case you want to return it.", vietnamese: "Hãy giữ biên lai phòng khi bạn muốn trả lại hàng." } },
      { word: "just looking", ipa: "/ˌdʒʌst ˈlʊkɪŋ/", partOfSpeech: "phrase", vietnamese: "chỉ xem thôi", definition: "what you say in a shop when you don't need help yet", example: { english: "Can I help you? I'm just looking, thanks.", vietnamese: "Tôi giúp gì được ạ? Tôi chỉ xem thôi, cảm ơn." } },
    ],
    grammar: [{
      title: "How much is it?",
      pattern: "How much is this shirt? · How much are these jeans? · It's £20. / They're £20.",
      explanation: {
        english: "Ask How much is with one thing and How much are with plural things (including jeans, trousers and shoes, which are always plural). Answer with It's or They're. Say prices like this: £4.50 is four pounds fifty.",
        vietnamese: "Hỏi How much is với một món và How much are với nhiều món (kể cả jeans, trousers và shoes, vốn luôn ở dạng số nhiều). Trả lời bằng It's hoặc They're. Đọc giá như sau: £4.50 là four pounds fifty.",
      },
      examples: [
        { english: "How much are these trainers? They're forty-five pounds.", vietnamese: "Đôi giày thể thao này bao nhiêu tiền? Bốn mươi lăm bảng." },
        { english: "How much is this scarf? It's twelve pounds fifty.", vietnamese: "Chiếc khăn này bao nhiêu? Mười hai bảng rưỡi." },
      ],
    }, {
      title: "Too big, not big enough",
      pattern: "too + adjective · not + adjective + enough",
      explanation: {
        english: "Too means more than you want, so it is a problem: It's too expensive (I can't buy it). Not … enough means less than you need: It isn't big enough. Enough comes after the adjective. Use very, not too, when there is no problem: It's very nice.",
        vietnamese: "Too nghĩa là nhiều hơn mức bạn muốn, nên đó là vấn đề: It's too expensive (tôi không mua được). Not … enough nghĩa là ít hơn mức cần: It isn't big enough. Enough đứng sau tính từ. Dùng very, không dùng too, khi không có vấn đề gì: It's very nice.",
      },
      examples: [
        { english: "This shirt is too small. Have you got a bigger size?", vietnamese: "Cái áo này chật quá. Có cỡ to hơn không?" },
        { english: "The jacket isn't warm enough for an English winter.", vietnamese: "Chiếc áo khoác này không đủ ấm cho mùa đông nước Anh." },
      ],
      mistake: {
        wrong: "This dress is too beautiful! I'll buy it.", right: "This dress is very beautiful! I'll buy it.",
        why: { english: "Vietnamese “quá” can be praise (đẹp quá!), but English too always means a problem. Use very or really to praise.", vietnamese: "“Quá” trong tiếng Việt có thể là lời khen (đẹp quá!), nhưng too trong tiếng Anh luôn chỉ một vấn đề. Dùng very hoặc really để khen." },
      },
    }],
    examples: [
      { english: "Excuse me, can I try these jeans on? The changing room is over there.", vietnamese: "Xin lỗi, tôi mặc thử chiếc quần bò này được không? Phòng thử đồ ở đằng kia." },
      { english: "They don't fit. They're too long.", vietnamese: "Chúng không vừa. Dài quá." },
      { english: "Everything in the window is on sale.", vietnamese: "Mọi thứ trong tủ kính đều đang giảm giá." },
      { english: "Can I pay by card? And could I have a receipt, please?", vietnamese: "Tôi trả bằng thẻ được không? Và cho tôi xin biên lai." },
    ],
    dialogue: [
      { speaker: "Assistant", english: "Hello, can I help you?", vietnamese: "Xin chào, tôi giúp gì được cho chị ạ?" },
      { speaker: "Trang", english: "Yes, please. How much is this coat?", vietnamese: "Vâng. Cái áo khoác này bao nhiêu tiền ạ?" },
      { speaker: "Assistant", english: "It's on sale. It's sixty pounds.", vietnamese: "Nó đang giảm giá. Sáu mươi bảng ạ." },
      { speaker: "Trang", english: "Can I try it on?", vietnamese: "Tôi mặc thử được không?" },
      { speaker: "Assistant", english: "Of course. What size are you?", vietnamese: "Tất nhiên ạ. Chị mặc cỡ nào?" },
      { speaker: "Trang", english: "Small, I think. Oh, it doesn't fit. It's too big. Have you got an extra small?", vietnamese: "Cỡ S thì phải. Ôi, không vừa rồi. Rộng quá. Có cỡ XS không ạ?" },
    ],
    practice: [
      q("Complete: How much ___ these shoes?", ["are", "is", "do", "does"], "are", "Plural: How much are …?"),
      q("Complete: Can I ___ this dress on?", ["try", "wear", "fit", "test"], "try", "Try on = put on to see if it fits."),
      q("Complete: These trousers don't fit. They're ___ short.", ["too", "very", "enough", "much"], "too", "Too = a problem."),
      q("What is a “receipt”?", ["paper that shows what you paid", "a bank card", "a shopping bag", "a price label"], "paper that shows what you paid", "Keep the receipt to return things."),
    ],
    challenge: [
      q("Choose the correct sentence.", ["This bag isn't big enough.", "This bag isn't enough big.", "This bag is too much big.", "This bag is not big too."], "This bag isn't big enough.", "Enough goes after the adjective."),
      q("You love the shirt and want it. Say…", ["It's really nice. I'll take it.", "It's too nice. I'll take it.", "It's nice enough too.", "It's too much nice."], "It's really nice. I'll take it.", "Too means a problem; use really or very to praise."),
      q("A shop assistant asks “Can I help you?” You don't need help yet. Say…", ["I'm just looking, thanks.", "No, you can't.", "I'm only watching.", "Not help."], "I'm just looking, thanks.", "Just looking = browsing."),
      q("Complete: Can I pay ___ card?", ["by", "with the", "on", "in"], "by", "Pay by card; pay in cash."),
      q("Complete: How much is ___? It's £15.", ["this T-shirt", "these jeans", "these socks", "those shoes"], "this T-shirt", "How much is + one thing."),
    ],
  }, {
    key: "recipes", title: "First, Then, Finally", titleVi: "Công thức nấu ăn",
    objectives: [
      "I can follow and give simple cooking instructions.",
      "Use cooking verbs: chop, boil, fry, stir, add",
      "Give steps with first, next, then and finally",
    ],
    vocabulary: [
      { word: "chop", ipa: "/tʃɒp/", partOfSpeech: "verb", vietnamese: "thái, băm", definition: "to cut food into small pieces", example: { english: "Chop the onions finely.", vietnamese: "Thái nhỏ hành." } },
      { word: "boil", ipa: "/bɔɪl/", partOfSpeech: "verb", vietnamese: "đun sôi, luộc", definition: "to heat water until it bubbles; to cook food in very hot water", example: { english: "Boil the noodles for three minutes.", vietnamese: "Luộc mì trong ba phút." } },
      { word: "fry", ipa: "/fraɪ/", partOfSpeech: "verb", vietnamese: "chiên, rán", definition: "to cook food in hot oil", example: { english: "Fry the garlic until it's golden.", vietnamese: "Phi tỏi cho đến khi vàng." } },
      { word: "stir", ipa: "/stɜː/", partOfSpeech: "verb", vietnamese: "khuấy, đảo", definition: "to move a spoon round and round in food or a drink", example: { english: "Stir the soup so it doesn't burn.", vietnamese: "Khuấy nồi canh để không bị cháy." } },
      { word: "add", ipa: "/æd/", partOfSpeech: "verb", vietnamese: "thêm, cho vào", definition: "to put something with something else", example: { english: "Add the fish sauce and the sugar.", vietnamese: "Cho nước mắm và đường vào." } },
      { word: "ingredients", ipa: "/ɪnˈɡriːdiənts/", partOfSpeech: "noun", vietnamese: "nguyên liệu", definition: "the foods you need to make a dish", example: { english: "You only need four ingredients.", vietnamese: "Bạn chỉ cần bốn nguyên liệu." } },
      { word: "frying pan", ipa: "/ˈfraɪɪŋ pæn/", partOfSpeech: "noun", vietnamese: "chảo rán", definition: "a flat pan for frying food", example: { english: "Heat some oil in a frying pan.", vietnamese: "Đun nóng ít dầu trong chảo." } },
      { word: "serve", ipa: "/sɜːv/", partOfSpeech: "verb", vietnamese: "dọn ra, bày ra (món ăn)", definition: "to give food to people to eat", example: { english: "Serve hot with fresh herbs.", vietnamese: "Dọn ra khi còn nóng, ăn kèm rau thơm." } },
    ],
    grammar: [{
      title: "Instructions",
      pattern: "Chop the onions. · Don't add too much salt.",
      explanation: {
        english: "Recipes use the imperative, the base form of the verb with no subject: Boil the water. Fry the eggs. For something not to do, use Don't + verb: Don't stir it. Recipes often leave out the in short notes, but say it when you speak.",
        vietnamese: "Công thức nấu ăn dùng câu mệnh lệnh, tức động từ nguyên mẫu không có chủ ngữ: Boil the water. Fry the eggs. Để nói điều không nên làm, dùng Don't + động từ: Don't stir it. Công thức viết tắt thường bỏ the, nhưng khi nói thì hãy dùng the.",
      },
      examples: [
        { english: "Chop the garlic and fry it in a little oil.", vietnamese: "Băm tỏi rồi phi với một ít dầu." },
        { english: "Don't boil the eggs for too long.", vietnamese: "Đừng luộc trứng quá lâu." },
      ],
    }, {
      title: "Steps in order",
      pattern: "First, … · Next, … · Then … · Finally, …",
      explanation: {
        english: "Number the steps with first, next, then and finally. Put a comma after first, next and finally at the start of a sentence. Until says when to stop: Fry it until it's golden. For can say how long: Boil it for ten minutes.",
        vietnamese: "Đánh dấu các bước bằng first, next, then và finally. Đặt dấu phẩy sau first, next và finally khi chúng đứng đầu câu. Until cho biết khi nào dừng: Fry it until it's golden. For cho biết thời gian bao lâu: Boil it for ten minutes.",
      },
      examples: [
        { english: "First, boil the water. Next, add the noodles.", vietnamese: "Đầu tiên, đun sôi nước. Tiếp theo, cho mì vào." },
        { english: "Then stir for two minutes. Finally, serve with lime.", vietnamese: "Rồi khuấy trong hai phút. Cuối cùng, dọn ra ăn kèm chanh." },
      ],
      mistake: {
        wrong: "Fry the onions during five minutes.", right: "Fry the onions for five minutes.",
        why: { english: "Use for with a length of time (for five minutes). During goes before a noun for an event: during the meal.", vietnamese: "Dùng for với khoảng thời gian (for five minutes). During đứng trước danh từ chỉ sự việc: during the meal." },
      },
    }],
    examples: [
      { english: "First, get all the ingredients ready.", vietnamese: "Đầu tiên, chuẩn bị sẵn mọi nguyên liệu." },
      { english: "Heat the frying pan and fry the beef until it's brown.", vietnamese: "Làm nóng chảo và xào thịt bò cho đến khi chín vàng." },
      { english: "Add the vegetables and stir for a minute.", vietnamese: "Cho rau vào và đảo trong một phút." },
      { english: "Finally, serve it with rice.", vietnamese: "Cuối cùng, dọn ra ăn với cơm." },
    ],
    dialogue: [
      { speaker: "Olivia", english: "Your fried rice is delicious! How do you make it?", vietnamese: "Cơm rang của bạn ngon quá! Bạn làm thế nào vậy?" },
      { speaker: "Thao", english: "It's easy. First, chop some garlic and an onion.", vietnamese: "Dễ lắm. Đầu tiên, băm ít tỏi và một củ hành." },
      { speaker: "Olivia", english: "OK. And then?", vietnamese: "Ừ. Rồi sao nữa?" },
      { speaker: "Thao", english: "Fry them in a frying pan for a minute, then add the rice and two eggs.", vietnamese: "Phi chúng trong chảo một phút, rồi cho cơm và hai quả trứng vào." },
      { speaker: "Olivia", english: "Do I stir it all the time?", vietnamese: "Mình có phải đảo liên tục không?" },
      { speaker: "Thao", english: "Yes. Finally, add a little fish sauce and serve it hot.", vietnamese: "Có. Cuối cùng, thêm chút nước mắm và dọn ra khi còn nóng." },
    ],
    practice: [
      q("“Thái, băm” in English is…", ["chop", "boil", "stir", "serve"], "chop", "Chop = cut into small pieces."),
      q("Complete: ___ the water, then add the pasta.", ["Boil", "Boils", "Boiling", "You boiling"], "Boil", "Instructions use the base verb."),
      q("Complete: Fry the chicken ___ ten minutes.", ["for", "during", "since", "in during"], "for", "For + a length of time."),
      q("What are “ingredients”?", ["the foods you need for a dish", "the steps of a recipe", "kitchen tools", "the cook"], "the foods you need for a dish", "Ingredients are what you cook with."),
    ],
    challenge: [
      q("Which word comes last in a recipe?", ["Finally", "First", "Next", "Then"], "Finally", "Finally introduces the last step."),
      q("Complete: ___ add too much salt.", ["Don't", "Not", "No", "Doesn't"], "Don't", "Negative instruction: Don't + verb."),
      q("Complete: Fry the garlic ___ it's golden.", ["until", "for", "during", "since"], "until", "Until says when to stop."),
      q("You cook food in hot oil. You…", ["fry it", "boil it", "chop it", "stir it"], "fry it", "Fry = cook in hot oil."),
      q("Choose the correct instruction.", ["Stir the sauce slowly.", "You stirs the sauce slowly.", "Stirring the sauce slowly.", "To stir slowly the sauce."], "Stir the sauce slowly.", "Imperative: base verb first."),
    ],
  }, {
    key: "review", title: "Unit Review", titleVi: "Ôn tập bài 4", isReview: true,
    objectives: [
      "I can buy, order and cook food and talk about amounts correctly.",
      "Check uncountable nouns, how much / how many, polite orders, too / enough, and instructions",
    ],
    vocabulary: [
      { word: "a loaf of", ipa: "/ə ˈləʊf əv/", partOfSpeech: "phrase", vietnamese: "một ổ (bánh mì)", definition: "one whole piece of bread, baked in one shape", example: { english: "Two loaves of bread, please.", vietnamese: "Cho tôi hai ổ bánh mì." } },
      { word: "how much", ipa: "/ˌhaʊ ˈmʌtʃ/", partOfSpeech: "phrase", vietnamese: "bao nhiêu (không đếm được); giá bao nhiêu", definition: "used to ask about an amount of something uncountable, or a price", example: { english: "How much is a ticket?", vietnamese: "Một vé bao nhiêu tiền?" } },
      { word: "a few", ipa: "/ə ˈfjuː/", partOfSpeech: "determiner", vietnamese: "một vài (đếm được)", definition: "a small number of", example: { english: "I'll buy a few oranges.", vietnamese: "Tôi sẽ mua vài quả cam." } },
      { word: "could I have", ipa: "/ˈkʊd aɪ ˌhæv/", partOfSpeech: "phrase", vietnamese: "cho tôi … được không", definition: "a polite way to ask for something", example: { english: "Could I have a spoon, please?", vietnamese: "Cho tôi xin một cái thìa được không?" } },
      { word: "try on", ipa: "/ˌtraɪ ˈɒn/", partOfSpeech: "phrasal verb", vietnamese: "mặc thử", definition: "to put on clothes to see if they fit", example: { english: "Why don't you try on the blue one?", vietnamese: "Sao bạn không thử cái màu xanh?" } },
      { word: "ingredients", ipa: "/ɪnˈɡriːdiənts/", partOfSpeech: "noun", vietnamese: "nguyên liệu", definition: "the foods you need to make a dish", example: { english: "Have we got all the ingredients?", vietnamese: "Mình có đủ nguyên liệu chưa?" } },
    ],
    grammar: [{
      title: "Five things to check",
      pattern: "some bread · how much money · Could I have …? · too small / not big enough · Boil it for …",
      explanation: {
        english: "Check these: uncountable nouns (bread, rice, money) have no a and no plural; how much with uncountable nouns and how many with plurals; order with I'd like or Could I have …, please; too means a problem and enough comes after the adjective; and instructions start with the base verb.",
        vietnamese: "Hãy kiểm tra: danh từ không đếm được (bread, rice, money) không có a và không có số nhiều; how much với danh từ không đếm được và how many với số nhiều; gọi món bằng I'd like hoặc Could I have …, please; too chỉ vấn đề và enough đứng sau tính từ; câu hướng dẫn bắt đầu bằng động từ nguyên mẫu.",
      },
      examples: [
        { english: "How many eggs and how much flour do we need?", vietnamese: "Chúng ta cần bao nhiêu trứng và bao nhiêu bột?" },
        { english: "These shoes are too tight. They aren't big enough.", vietnamese: "Đôi giày này chật quá. Không đủ rộng." },
      ],
    }],
    examples: [
      { english: "Could I have a loaf of bread and a few apples, please?", vietnamese: "Cho tôi một ổ bánh mì và vài quả táo." },
      { english: "How much are these? They're on sale.", vietnamese: "Mấy cái này bao nhiêu tiền? Chúng đang giảm giá." },
      { english: "First, put all the ingredients in a bowl. Then stir.", vietnamese: "Đầu tiên, cho tất cả nguyên liệu vào bát. Rồi khuấy đều." },
    ],
    dialogue: [
      { speaker: "Waiter", english: "Are you ready to order?", vietnamese: "Anh chị gọi món được chưa ạ?" },
      { speaker: "Hung", english: "Yes. Could I have the fish and some rice, please?", vietnamese: "Rồi. Cho tôi món cá và ít cơm." },
      { speaker: "Waiter", english: "Would you like a drink?", vietnamese: "Anh có muốn uống gì không?" },
      { speaker: "Hung", english: "Just a bottle of water, please. How much is the fish?", vietnamese: "Một chai nước thôi. Món cá bao nhiêu tiền?" },
      { speaker: "Waiter", english: "It's fourteen pounds. It's very popular.", vietnamese: "Mười bốn bảng ạ. Món này được ưa chuộng lắm." },
      { speaker: "Hung", english: "Great. Not too spicy, please. I can't eat much chilli.", vietnamese: "Tuyệt. Đừng cay quá nhé. Tôi không ăn được nhiều ớt." },
    ],
    practice: [
      q("Choose the correct sentence.", ["I need some bread.", "I need a bread.", "I need some breads.", "I need two bread."], "I need some bread.", "Bread is uncountable."),
      q("Complete: How ___ people are coming?", ["many", "much", "lot", "little"], "many", "People is plural: how many."),
      q("Choose the polite order.", ["I'd like the soup, please.", "Give me the soup.", "I want soup.", "Soup for me now."], "I'd like the soup, please.", "I'd like …, please."),
      q("Complete: This room isn't warm ___.", ["enough", "too", "very", "much"], "enough", "Adjective + enough."),
    ],
    challenge: [
      q("Complete: There isn't ___ milk left.", ["much", "many", "a few", "some"], "much", "Negative + uncountable: much."),
      q("Choose the correct sentence.", ["Boil the rice for twenty minutes.", "Boil the rice during twenty minutes.", "You boils the rice twenty minutes.", "Boiling the rice for twenty minutes."], "Boil the rice for twenty minutes.", "Imperative + for + time."),
      q("Complete: How much ___ these socks?", ["are", "is", "does", "do"], "are", "Plural: are."),
      q("“Would you like some tea?” You don't want any. Say…", ["No, thank you.", "No, I don't like.", "No, I wouldn't like.", "Not, thanks."], "No, thank you.", "Answer an offer with No, thank you."),
      q("Complete: Add ___ sugar, but not too much.", ["a little", "a few", "many", "an"], "a little", "Sugar is uncountable: a little."),
    ],
  }],
  assessment: [
    { id: "uncountable-a", prompt: "Choose the correct sentence.", options: ["Would you like some rice?", "Would you like a rice?", "Would you like some rices?", "Would you like an rice?"], correct: "Would you like some rice?", explanation: "Rice is uncountable." },
    { id: "loaf", prompt: "Complete: Could I have two ___ of bread?", options: ["loaves", "loafs", "breads", "pieces bread"], correct: "loaves", explanation: "Loaf – loaves." },
    { id: "bottle-of", prompt: "Choose the correct phrase.", options: ["a bottle of water", "a water bottle of", "a waters", "one bottle water of"], correct: "a bottle of water", explanation: "Container + of + uncountable noun." },
    { id: "how-much-money", prompt: "Choose the correct question.", options: ["How much money have you got?", "How many money have you got?", "How many moneys have you got?", "How much moneys have you got?"], correct: "How much money have you got?", explanation: "Money is uncountable." },
    { id: "how-many", prompt: "Complete: How ___ brothers have you got?", options: ["many", "much", "lot", "few"], correct: "many", explanation: "Countable plural: how many." },
    { id: "a-few", prompt: "Complete: I bought ___ oranges at the market.", options: ["a few", "a little", "much", "an"], correct: "a few", explanation: "Countable: a few." },
    { id: "a-little", prompt: "Complete: Just ___ milk in my tea, please.", options: ["a little", "a few", "many", "a"], correct: "a little", explanation: "Uncountable: a little." },
    { id: "polite-order", prompt: "Choose the most polite order.", options: ["Could I have a lemonade, please?", "Give me a lemonade.", "I want a lemonade.", "Lemonade, quickly."], correct: "Could I have a lemonade, please?", explanation: "Could I have …, please?" },
    { id: "offer-answer", prompt: "“Would you like some dessert?” Choose the best answer.", options: ["Yes, please.", "Yes, I like.", "Yes, I do.", "Yes, I would like."], correct: "Yes, please.", explanation: "Answer an offer with Yes, please." },
    { id: "how-much-are", prompt: "Complete: How much ___ these trousers?", options: ["are", "is", "do", "does"], correct: "are", explanation: "Trousers is plural." },
    { id: "too-problem", prompt: "Complete: I can't buy it. It's ___ expensive.", options: ["too", "very much", "enough", "so much"], correct: "too", explanation: "Too = more than you want, a problem." },
    { id: "enough-position", prompt: "Choose the correct sentence.", options: ["The bag isn't big enough.", "The bag isn't enough big.", "The bag is enough not big.", "The bag isn't big too."], correct: "The bag isn't big enough.", explanation: "Adjective + enough." },
    { id: "try-on", prompt: "Complete: Can I ___ these shoes on?", options: ["try", "test", "fit", "wear"], correct: "try", explanation: "Try something on." },
    { id: "imperative-recipe", prompt: "Choose the correct instruction.", options: ["Chop the onions.", "You chops the onions.", "Chopping the onions.", "To chop onions you."], correct: "Chop the onions.", explanation: "Instructions use the base verb." },
    { id: "for-time", prompt: "Complete: Boil the eggs ___ eight minutes.", options: ["for", "during", "since", "until"], correct: "for", explanation: "For + a length of time." },
  ],
};
