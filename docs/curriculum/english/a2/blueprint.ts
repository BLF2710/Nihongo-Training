// A2 refresher: the everyday English a learner has met before, made accurate. Each unit fixes the mistakes Vietnamese
// speakers most often make at this level (missing -s endings, articles, tenses, final sounds), and teaches the
// British forms (have got, flat, mobile). Five lessons and a review per unit, then a 15-question assessment.
import type { LevelBlueprint } from "../../../../scripts/english-course/source.ts";

const REVIEW = (titleVi: string) => ({ key: "review", title: "Unit Review", titleVi });

export const blueprint: LevelBlueprint = {
  level: "A2",
  units: [{
    number: 1, title: "People & Everyday Life", titleVi: "Con người và cuộc sống hằng ngày",
    description: "Introduce yourself and others, talk about routines, likes and family, and describe people, getting the -s endings right.",
    lessons: [
      { key: "introductions", title: "Nice to Meet You", titleVi: "Rất vui được gặp bạn" },
      { key: "daily-routines", title: "My Daily Routine", titleVi: "Thói quen hằng ngày" },
      { key: "likes-and-dislikes", title: "Likes and Dislikes", titleVi: "Sở thích và điều không thích" },
      { key: "family", title: "My Family", titleVi: "Gia đình tôi" },
      { key: "describing-people", title: "Describing People", titleVi: "Miêu tả người" },
      REVIEW("Ôn tập bài 1"),
    ],
  }, {
    number: 2, title: "Past Experiences", titleVi: "Những trải nghiệm đã qua",
    description: "Tell stories about the past with regular and irregular verbs, say when things happened, and pronounce -ed endings.",
    lessons: [
      { key: "last-weekend", title: "Last Weekend", titleVi: "Cuối tuần trước" },
      { key: "irregular-verbs", title: "Common Irregular Verbs", titleVi: "Động từ bất quy tắc thường gặp" },
      { key: "time-expressions", title: "Ago, Last and Yesterday", titleVi: "Ago, last và yesterday" },
      { key: "past-continuous", title: "What Were You Doing?", titleVi: "Lúc đó bạn đang làm gì?" },
      { key: "telling-a-story", title: "Telling a Story", titleVi: "Kể một câu chuyện" },
      REVIEW("Ôn tập bài 2"),
    ],
  }, {
    number: 3, title: "Places & Directions", titleVi: "Địa điểm và chỉ đường",
    description: "Describe your town, say where things are, ask for and give directions, and compare places.",
    lessons: [
      { key: "my-town", title: "There Is, There Are", titleVi: "Có cái gì ở đâu" },
      { key: "prepositions-of-place", title: "Next To, Opposite, Between", titleVi: "Giới từ chỉ nơi chốn" },
      { key: "directions", title: "Asking the Way", titleVi: "Hỏi đường" },
      { key: "comparing-places", title: "Bigger and Busier", titleVi: "So sánh hơn" },
      { key: "the-best-places", title: "The Best Place in Town", titleVi: "So sánh nhất" },
      REVIEW("Ôn tập bài 3"),
    ],
  }, {
    number: 4, title: "Food & Shopping", titleVi: "Đồ ăn và mua sắm",
    description: "Count what can and cannot be counted, order politely in a café, and shop for what you need.",
    lessons: [
      { key: "countable-and-uncountable", title: "Some Bread, Two Apples", titleVi: "Danh từ đếm được và không đếm được" },
      { key: "how-much-how-many", title: "How Much? How Many?", titleVi: "Bao nhiêu?" },
      { key: "in-a-cafe", title: "Ordering in a Café", titleVi: "Gọi món ở quán cà phê" },
      { key: "at-the-shops", title: "At the Shops", titleVi: "Ở cửa hàng" },
      { key: "recipes", title: "First, Then, Finally", titleVi: "Công thức nấu ăn" },
      REVIEW("Ôn tập bài 4"),
    ],
  }, {
    number: 5, title: "Plans & the Future", titleVi: "Kế hoạch và tương lai",
    description: "Talk about plans, arrangements and quick decisions, and make and answer invitations.",
    lessons: [
      { key: "going-to", title: "What Are You Going to Do?", titleVi: "Dự định với going to" },
      { key: "arrangements", title: "I'm Meeting Lan on Friday", titleVi: "Lịch hẹn đã sắp xếp" },
      { key: "will-for-decisions", title: "I'll Help You", titleVi: "Quyết định tức thì với will" },
      { key: "invitations", title: "Would You Like to Come?", titleVi: "Lời mời" },
      { key: "making-plans", title: "Making Plans Together", titleVi: "Cùng lên kế hoạch" },
      REVIEW("Ôn tập bài 5"),
    ],
  }, {
    number: 6, title: "Health & Advice", titleVi: "Sức khoẻ và lời khuyên",
    description: "Say how you feel, see a doctor, and give and ask for advice with should and have to.",
    lessons: [
      { key: "how-do-you-feel", title: "I've Got a Headache", titleVi: "Tôi bị đau đầu" },
      { key: "at-the-doctors", title: "At the Doctor's", titleVi: "Ở phòng khám" },
      { key: "should", title: "You Should Rest", titleVi: "Lời khuyên với should" },
      { key: "have-to", title: "Rules: Have To and Mustn't", titleVi: "Quy định: have to và mustn't" },
      { key: "healthy-habits", title: "Healthy Habits", titleVi: "Thói quen lành mạnh" },
      REVIEW("Ôn tập bài 6"),
    ],
  }],
};
