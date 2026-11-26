// B2: the English an improving learner needs to speak naturally and choose the right tone for work and study. Each
// unit takes the grammar Vietnamese speakers still get wrong at this level (habits with always and would, future
// perfect, the causative, third and mixed conditionals, narrative tenses, past deduction, reporting verbs) and pairs it
// with what makes English sound natural: phrasal verbs, collocations, register, idioms and discourse markers. Five
// lessons and a review per unit, then a 15-question assessment.
import type { LevelBlueprint } from "../../../../scripts/english-course/source.ts";

const REVIEW = (titleVi: string) => ({ key: "review", title: "Unit Review", titleVi });

export const blueprint: LevelBlueprint = {
  level: "B2",
  units: [{
    number: 1, title: "People & Relationships", titleVi: "Con người và các mối quan hệ",
    description: "Describe people, relationships and habits naturally, with phrasal verbs, personality words and small talk.",
    lessons: [
      { key: "relationship-phrasal-verbs", title: "We Get On Really Well", titleVi: "Cụm động từ về các mối quan hệ" },
      { key: "personality", title: "Easy-Going and Reliable", titleVi: "Tính cách" },
      { key: "habits", title: "She's Always Borrowing My Things", titleVi: "Nói về thói quen" },
      { key: "first-impressions", title: "He Looks As If He's Tired", titleVi: "Ấn tượng đầu tiên" },
      { key: "small-talk", title: "Breaking the Ice", titleVi: "Bắt chuyện" },
      REVIEW("Ôn tập bài 1"),
    ],
  }, {
    number: 2, title: "Work & Careers", titleVi: "Công việc và sự nghiệp",
    description: "Use work collocations, switch between formal and informal English, plan ahead, and take part in meetings and presentations.",
    lessons: [
      { key: "make-or-do", title: "Make a Decision, Do Research", titleVi: "Make hay do?" },
      { key: "register", title: "Formal or Informal?", titleVi: "Văn phong trang trọng và thân mật" },
      { key: "future-perfect", title: "This Time Next Year", titleVi: "Tương lai tiếp diễn và tương lai hoàn thành" },
      { key: "meetings", title: "Shall We Get Started?", titleVi: "Họp hành" },
      { key: "presentations", title: "Giving a Presentation", titleVi: "Thuyết trình" },
      REVIEW("Ôn tập bài 2"),
    ],
  }, {
    number: 3, title: "Technology & Science", titleVi: "Công nghệ và khoa học",
    description: "Talk about services and discoveries with the causative and the impersonal passive, build words, and weigh pros and cons.",
    lessons: [
      { key: "have-something-done", title: "I Had My Phone Repaired", titleVi: "Thể sai khiến" },
      { key: "impersonal-passive", title: "It Is Believed That…", titleVi: "Bị động khách quan" },
      { key: "tech-phrasal-verbs", title: "Back It Up", titleVi: "Cụm động từ về công nghệ" },
      { key: "word-building", title: "Discover, Discovery", titleVi: "Cấu tạo từ" },
      { key: "pros-and-cons", title: "Pros and Cons", titleVi: "Ưu và nhược điểm" },
      REVIEW("Ôn tập bài 3"),
    ],
  }, {
    number: 4, title: "Health & Lifestyle", titleVi: "Sức khoẻ và lối sống",
    description: "Imagine different pasts with third and mixed conditionals, talk about regrets, give strong advice and use health idioms.",
    lessons: [
      { key: "third-conditional", title: "If I Had Known…", titleVi: "Câu điều kiện loại 3" },
      { key: "mixed-conditionals", title: "If I Had Slept, I Wouldn't Be Tired", titleVi: "Câu điều kiện hỗn hợp" },
      { key: "regrets", title: "I Should Have Listened", titleVi: "Nói về sự hối tiếc" },
      { key: "had-better", title: "You'd Better See a Doctor", titleVi: "Lời khuyên mạnh" },
      { key: "health-idioms", title: "Under the Weather", titleVi: "Thành ngữ về sức khoẻ" },
      REVIEW("Ôn tập bài 4"),
    ],
  }, {
    number: 5, title: "Stories & Experiences", titleVi: "Câu chuyện và trải nghiệm",
    description: "Tell stories well with narrative tenses, time linkers, non-defining relative clauses and participle clauses.",
    lessons: [
      { key: "narrative-tenses", title: "It Had Been Raining All Day", titleVi: "Các thì kể chuyện" },
      { key: "time-linkers", title: "By the Time We Arrived", titleVi: "Từ nối chỉ thời gian" },
      { key: "non-defining-clauses", title: "My Uncle, Who Lives in Hue", titleVi: "Mệnh đề quan hệ không xác định" },
      { key: "participle-clauses", title: "Walking Home, I Saw…", titleVi: "Mệnh đề phân từ" },
      { key: "anecdotes", title: "You'll Never Guess What Happened", titleVi: "Kể giai thoại" },
      REVIEW("Ôn tập bài 5"),
    ],
  }, {
    number: 6, title: "Ideas & Opinions", titleVi: "Ý tưởng và quan điểm",
    description: "Report what people suggested, guess about the past, add emphasis, sound less certain and write a clear essay.",
    lessons: [
      { key: "reporting-verbs", title: "She Suggested Going", titleVi: "Động từ tường thuật" },
      { key: "past-deduction", title: "It Must Have Been Hard", titleVi: "Phỏng đoán về quá khứ" },
      { key: "emphasis", title: "What I Need Is a Holiday", titleVi: "Câu nhấn mạnh" },
      { key: "hedging", title: "It Seems That…", titleVi: "Nói giảm mức chắc chắn" },
      { key: "opinion-essays", title: "In Conclusion", titleVi: "Viết bài luận nêu quan điểm" },
      REVIEW("Ôn tập bài 6"),
    ],
  }],
};
