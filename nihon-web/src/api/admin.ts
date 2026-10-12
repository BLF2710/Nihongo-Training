import api from "./axios";

export type Settings = { registration_enabled: boolean; announcement: string; updated_at: string };
export type UserEdit = { username: string; email: string; role: "learner" | "admin"; status: "active" | "suspended" };

/** Reads any admin resource; `path` starts with /admin. */
export async function fetchAdmin<T>(path: string, signal?: AbortSignal) {
  return (await api.get<T>(path, { signal })).data;
}

export async function updateUser(userId: number, edit: UserEdit) {
  await api.patch(`/admin/users/${userId}`, edit);
}

export async function saveSettings(settings: Pick<Settings, "registration_enabled" | "announcement">) {
  return (await api.put<Settings>("/admin/settings", settings)).data;
}

export type BankQuestionType = "multiple_choice" | "word_match" | "word_scramble";
export type MultipleChoiceContent = { prompt: string; options: string[]; correctIndex: number; explanation?: string };
export type WordMatchContent = { prompt?: string; pairs: { left: string; right: string }[] };
export type WordScrambleContent = { answer: string; hint: string };
export type QuestionContent = MultipleChoiceContent | WordMatchContent | WordScrambleContent;
export type BankQuestionDraft = { unitId: string; type: BankQuestionType; content: QuestionContent; enabled: boolean };
export type BankQuestion = BankQuestionDraft & { id: number; createdAt: string; updatedAt: string };
export type QuestionBank = { units: { id: string; number: number; title: string }[]; questions: BankQuestion[] };

/** Creates the question, or replaces the one with `id` when given. */
export async function saveQuestion({ unitId, type, content, enabled }: BankQuestionDraft, id?: number) {
  const draft = { unitId, type, content, enabled };
  return (id ? await api.put<BankQuestion>(`/admin/questions/${id}`, draft) : await api.post<BankQuestion>("/admin/questions", draft)).data;
}

export async function deleteQuestion(id: number) {
  await api.delete(`/admin/questions/${id}`);
}

export async function setContentEnabled(key: string, enabled: boolean) {
  await api.put(`/admin/content/${encodeURIComponent(key)}`, { enabled });
}
