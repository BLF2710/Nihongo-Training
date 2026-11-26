// C1: the English an advanced learner needs to read and write demanding texts and express fine shades of meaning.
// Each unit takes the structures that still separate fluent Vietnamese speakers from expert users (inversion,
// nominalisation, the subjunctive, needn't have, fronting, inverted conditionals, focus adverbs) and pairs them with
// the vocabulary of nuance: connotation, collocation strength, idioms, figurative language, euphemism and academic
// style. Five lessons and a review per unit, then a 15-question assessment.
import type { LevelBlueprint } from "../../../../scripts/english-course/source.ts";

const REVIEW = (titleVi: string) => ({ key: "review", title: "Unit Review", titleVi });

export const blueprint: LevelBlueprint = {
  level: "C1",
  units: [{
    number: 1, title: "Language & Communication", titleVi: "Ngôn ngữ và giao tiếp",
    description: "Add emphasis with inversion, choose words by connotation and collocation, and speak with tact and natural discourse markers.",
    lessons: [
      { key: "negative-inversion", title: "Never Have I Seen…", titleVi: "Đảo ngữ với trạng từ phủ định" },
      { key: "connotation", title: "Slim, Skinny or Slender?", titleVi: "Sắc thái nghĩa của từ" },
      { key: "strong-collocations", title: "Heavy Rain, Strong Coffee", titleVi: "Cụm từ cố định nâng cao" },
      { key: "discourse-markers", title: "Having Said That…", titleVi: "Từ dẫn dắt trong văn nói" },
      { key: "tact", title: "Not Exactly Ideal", titleVi: "Nói giảm nói tránh" },
      REVIEW("Ôn tập bài 1"),
    ],
  }, {
    number: 2, title: "Work & the Economy", titleVi: "Công việc và kinh tế",
    description: "Use advanced passive forms and nominalisation, negotiate, use business idioms and write formal reports.",
    lessons: [
      { key: "advanced-passive", title: "I Hate Being Interrupted", titleVi: "Bị động nâng cao" },
      { key: "nominalisation", title: "The Rapid Growth of…", titleVi: "Danh từ hoá" },
      { key: "negotiating", title: "Meet Me Halfway", titleVi: "Đàm phán" },
      { key: "business-idioms", title: "Back to the Drawing Board", titleVi: "Thành ngữ trong kinh doanh" },
      { key: "reports", title: "The Findings Suggest…", titleVi: "Viết báo cáo" },
      REVIEW("Ôn tập bài 2"),
    ],
  }, {
    number: 3, title: "Science & Ethics", titleVi: "Khoa học và đạo đức",
    description: "Talk about plans that changed, use the subjunctive, discuss ethics, distinguish needn't have from didn't need to, and link academic ideas.",
    lessons: [
      { key: "future-in-the-past", title: "I Was Going to Call You", titleVi: "Tương lai trong quá khứ" },
      { key: "subjunctive", title: "It's Vital That She Be Told", titleVi: "Thức giả định" },
      { key: "ethics", title: "Right or Wrong?", titleVi: "Đạo đức trong khoa học" },
      { key: "neednt-have", title: "You Needn't Have Worried", titleVi: "Needn't have và didn't need to" },
      { key: "concession", title: "Albeit Slowly", titleVi: "Từ nối nhượng bộ trong văn học thuật" },
      REVIEW("Ôn tập bài 3"),
    ],
  }, {
    number: 4, title: "Culture & the Arts", titleVi: "Văn hoá và nghệ thuật",
    description: "Write reviews, front ideas for effect, build words with prefixes, avoid repetition and use figurative language.",
    lessons: [
      { key: "reviews", title: "A Gripping Read", titleVi: "Viết bài bình luận" },
      { key: "fronting", title: "Strange As It May Seem", titleVi: "Đảo cấu trúc để nhấn mạnh" },
      { key: "prefixes", title: "Overrated and Underestimated", titleVi: "Tiền tố nâng cao" },
      { key: "ellipsis", title: "I Hope So, I'd Rather Not", titleVi: "Tỉnh lược và thay thế" },
      { key: "figurative-language", title: "A Sea of Faces", titleVi: "Ngôn ngữ hình ảnh" },
      REVIEW("Ôn tập bài 4"),
    ],
  }, {
    number: 5, title: "Society & Change", titleVi: "Xã hội và sự thay đổi",
    description: "Use inverted and alternative conditionals, tricky verb patterns and quantifiers, persuade an audience and discuss social issues.",
    lessons: [
      { key: "inverted-conditionals", title: "Were It Not for…", titleVi: "Đảo ngữ câu điều kiện" },
      { key: "used-to-doing", title: "I'm Not Used to Being Told", titleVi: "Be used to và get used to" },
      { key: "quantifiers", title: "The Vast Majority", titleVi: "Lượng từ nâng cao" },
      { key: "persuasion", title: "Surely You'd Agree?", titleVi: "Nghệ thuật thuyết phục" },
      { key: "social-issues", title: "Bridging the Gap", titleVi: "Các vấn đề xã hội" },
      REVIEW("Ôn tập bài 5"),
    ],
  }, {
    number: 6, title: "Mastering Style", titleVi: "Làm chủ văn phong",
    description: "Choose the right register and intensifier, place focus adverbs precisely, summarise and paraphrase, and write in academic style.",
    lessons: [
      { key: "euphemism", title: "Passed Away or Died?", titleVi: "Uyển ngữ và văn phong" },
      { key: "intensifiers", title: "Utterly Exhausted", titleVi: "Từ nhấn mạnh" },
      { key: "focus-adverbs", title: "I Only Asked", titleVi: "Vị trí trạng từ tiêu điểm" },
      { key: "paraphrasing", title: "In a Nutshell", titleVi: "Tóm tắt và diễn giải" },
      { key: "academic-style", title: "This Essay Will Examine…", titleVi: "Văn phong học thuật" },
      REVIEW("Ôn tập bài 6"),
    ],
  }],
};
