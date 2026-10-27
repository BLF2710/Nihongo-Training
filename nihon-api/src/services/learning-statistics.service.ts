import { UNITS } from "../data/units";
import { listAssessmentProgress } from "../repositories/assessment.repository";
import { listKanjiProgress } from "../repositories/kanji.repository";
import * as learnerStatistics from "../repositories/learner-statistics.repository";
import { countMistakes } from "../repositories/mistake.repository";
import { listMockResults } from "../repositories/mock-exam-result.repository";
import { listDailyReviews } from "../repositories/srs.repository";
import { getDailyGoalMinutes, listDailySeconds } from "../repositories/study-time.repository";
import { characterProgress } from "./character-progress";
import { catalog } from "./kanji.service";
import { getSummary as getSrsSummary } from "./srs.service";

const STUDY_DAYS = 14;
const LESSON_WEEKS = 8;
const RECENT_MOCK_EXAMS = 10;
const SECONDS_PER_MINUTE = 60;

const levelOfUnit = (unitId: string) => /^japanese-(n[1-5])-/.exec(unitId)?.[1].toUpperCase() ?? "";

async function getAssessmentResults(userId: number) {
  const progress = new Map((await listAssessmentProgress(userId)).map(row => [row.assessment_id, row]));
  return UNITS.filter(unit => unit.assessmentId && progress.has(unit.assessmentId)).map(unit => {
    const row = progress.get(unit.assessmentId ?? "");
    return { unitId: unit.id, level: levelOfUnit(unit.id), number: unit.number, title: unit.title, bestScore: Number(row?.best_score ?? 0), isPassed: Boolean(row?.passed_at) };
  });
}

async function getKanjiMastery(userId: number) {
  const statuses = (await listKanjiProgress(userId)).map(row => characterProgress(row.correct_count, row.wrong_count).status);
  const mastered = statuses.filter(status => status === "mastered").length;
  const learning = statuses.filter(status => status === "learning").length;
  return { total: catalog.kanji.length, mastered, learning, untested: catalog.kanji.length - mastered - learning };
}

/** Everything the statistics page shows beyond Kana: study time, lessons, tests, Kanji, reviews, mistakes and practice. */
export async function getLearningOverview(userId: number) {
  const [studyDays, goalMinutes, lessonWeeks, lessonsCompleted, assessments, kanji, srs, srsDays, mistakes, mockExams, practice, speaking] = await Promise.all([
    listDailySeconds(userId, STUDY_DAYS), getDailyGoalMinutes(userId), learnerStatistics.listWeeklyLessons(userId, LESSON_WEEKS),
    learnerStatistics.countCompletedLessons(userId), getAssessmentResults(userId), getKanjiMastery(userId), getSrsSummary(userId),
    listDailyReviews(userId, STUDY_DAYS), countMistakes(userId), listMockResults(userId, RECENT_MOCK_EXAMS),
    learnerStatistics.summarizePracticeSessions(userId), learnerStatistics.summarizeSpeakingByLevel(userId),
  ]);
  return {
    studyTime: { days: studyDays, goalMinutes, totalSeconds: studyDays.reduce((sum, day) => sum + day.seconds, 0), daysGoalMet: studyDays.filter(day => day.seconds >= goalMinutes * SECONDS_PER_MINUTE).length },
    lessons: { completed: lessonsCompleted, weeks: lessonWeeks },
    assessments, kanji, srs: { ...srs, days: srsDays }, mistakes, mockExams, practice, speaking,
  };
}
