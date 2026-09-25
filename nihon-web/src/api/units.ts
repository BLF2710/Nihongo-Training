import api from "./axios";

export type CourseUnit = {
  id: string; number: number; title: string; description: string; requiredLevel: number;
  previousUnitId?: string; allowed: boolean; reasons: string[];
  completedLessons: number; totalLessons: number; allLessonsCompleted: boolean;
  assessmentId?: string; assessmentUnlocked: boolean; assessmentPassed: boolean; isPlaceholder?: boolean;
  completed: boolean; bestScore: number | null; bestCorrect: number | null; questionCount: number; passPercent: number | null;
  lessons: { id: string; slug: string; title: string; description: string; isPlaceholder: boolean; allowed: boolean; reasons: string[]; completed: boolean }[];
};
export type Assessment = {
  assessmentId: string; unitId: string; unitNumber: number; title: string; passPercent: number; assessmentPassed: boolean;
  questions: { id: string; prompt: string; options: string[] }[];
};
export type AssessmentResult = {
  correct: number; wrong: number; total: number; accuracy: number; passed: boolean;
  passPercent: number; assessmentPassed: boolean; unitCompleted: boolean; bestScore: number;
};
export async function fetchUnits(signal?: AbortSignal) {
  const { data } = await api.get<{ units: CourseUnit[] }>("/units", { signal });
  return data.units;
}
