// B1: the English an improving learner needs to talk about their life and the world with some independence. Each
// unit takes one area of grammar Vietnamese speakers find hard at this level (the present perfect against "đã", -ed
// and -ing, conditionals, the passive and reported speech, deduction and contrast) and the vocabulary and functions
// that go with it: job interviews, formal emails, complaints, news, opinions. Five lessons and a review per unit,
// then a 15-question assessment.
import type { LevelBlueprint } from "../../../../scripts/english-course/source.ts";

const REVIEW = (titleVi: string) => ({ key: "review", title: "Unit Review", titleVi });

export const blueprint: LevelBlueprint = {
  level: "B1",
  units: [{
    number: 1, title: "Experiences & Achievements", titleVi: "Trải nghiệm và thành tựu",
    description: "Talk about your experiences and what you have achieved, choosing between the present perfect and the past simple.",
    lessons: [
      { key: "have-you-ever", title: "Have You Ever…?", titleVi: "Bạn đã bao giờ…?" },
      { key: "already-just-yet", title: "Already, Just and Yet", titleVi: "Already, just và yet" },
      { key: "perfect-or-past", title: "Present Perfect or Past Simple?", titleVi: "Hiện tại hoàn thành hay quá khứ đơn?" },
      { key: "how-long", title: "I've Been Learning for Years", titleVi: "Tôi học được nhiều năm rồi" },
      { key: "achievements", title: "Proud Moments", titleVi: "Những khoảnh khắc tự hào" },
      REVIEW("Ôn tập bài 1"),
    ],
  }, {
    number: 2, title: "Work & Study", titleVi: "Công việc và học tập",
    description: "Talk about how things used to be, describe feelings with -ed and -ing, and handle interviews and formal emails.",
    lessons: [
      { key: "used-to", title: "I Used to Live in Hue", titleVi: "Tôi từng sống ở Huế" },
      { key: "ed-and-ing", title: "Bored or Boring?", titleVi: "Bored hay boring?" },
      { key: "gerund-or-infinitive", title: "Enjoy Doing, Decide to Do", titleVi: "Danh động từ hay động từ nguyên mẫu" },
      { key: "job-interview", title: "At a Job Interview", titleVi: "Phỏng vấn xin việc" },
      { key: "formal-emails", title: "Writing a Formal Email", titleVi: "Viết email trang trọng" },
      REVIEW("Ôn tập bài 2"),
    ],
  }, {
    number: 3, title: "Travel & Culture", titleVi: "Du lịch và văn hoá",
    description: "Plan and tell the story of a trip, use the with place names, and deal politely with travel problems.",
    lessons: [
      { key: "travel-phrasal-verbs", title: "Set Off and Check In", titleVi: "Cụm động từ khi đi du lịch" },
      { key: "past-perfect", title: "By the Time We Arrived", titleVi: "Thì quá khứ hoàn thành" },
      { key: "the-with-places", title: "The Thames, the UK and Hanoi", titleVi: "The với tên địa danh" },
      { key: "travel-problems", title: "My Flight Was Delayed", titleVi: "Sự cố khi đi du lịch" },
      { key: "complaints", title: "Making a Complaint", titleVi: "Phàn nàn lịch sự" },
      REVIEW("Ôn tập bài 3"),
    ],
  }, {
    number: 4, title: "Possibilities & Wishes", titleVi: "Khả năng và mong ước",
    description: "Talk about real and imaginary situations with conditionals, time clauses and wishes, and give advice with If I were you.",
    lessons: [
      { key: "first-conditional", title: "If It Rains, We'll Stay In", titleVi: "Câu điều kiện loại 1" },
      { key: "time-clauses", title: "As Soon As and Unless", titleVi: "As soon as và unless" },
      { key: "second-conditional", title: "If I Won the Lottery", titleVi: "Câu điều kiện loại 2" },
      { key: "wishes", title: "I Wish I Had More Time", titleVi: "Câu ước" },
      { key: "if-i-were-you", title: "If I Were You…", titleVi: "Nếu tôi là bạn…" },
      REVIEW("Ôn tập bài 4"),
    ],
  }, {
    number: 5, title: "News & Media", titleVi: "Tin tức và truyền thông",
    description: "Understand and pass on the news: the passive, reported statements and questions, and relative clauses.",
    lessons: [
      { key: "the-passive", title: "It Was Built in 1890", titleVi: "Câu bị động" },
      { key: "reported-statements", title: "She Said She Was Tired", titleVi: "Câu tường thuật" },
      { key: "reported-questions", title: "He Asked Where I Lived", titleVi: "Câu hỏi tường thuật" },
      { key: "relative-clauses", title: "The Man Who Lives Next Door", titleVi: "Mệnh đề quan hệ" },
      { key: "the-news", title: "In the Headlines", titleVi: "Trên các tiêu đề báo" },
      REVIEW("Ôn tập bài 5"),
    ],
  }, {
    number: 6, title: "Society & the Environment", titleVi: "Xã hội và môi trường",
    description: "Discuss the environment and city life, guess with must and might, contrast ideas, and agree and disagree politely.",
    lessons: [
      { key: "the-environment", title: "Our Planet", titleVi: "Hành tinh của chúng ta" },
      { key: "too-and-enough", title: "Too Much, Not Enough", titleVi: "Too và enough" },
      { key: "deduction", title: "It Must Be Hers", titleVi: "Phỏng đoán với must, might, can't" },
      { key: "contrast", title: "Although and However", titleVi: "Although và however" },
      { key: "agreeing-and-disagreeing", title: "I See Your Point, But…", titleVi: "Đồng ý và phản đối" },
      REVIEW("Ôn tập bài 6"),
    ],
  }],
};
