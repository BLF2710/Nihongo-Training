import { findSpeakingTask, SPEAKING_TASKS } from "../../data/speaking-tasks";
import type { SpeakingTask } from "../../data/speaking-tasks";
import { withTransaction } from "../../db/transaction";
import { BANDS, bandForSpeechScore, gradeFromCriteria, JF_LEVEL_FOR_COURSE_LEVEL, speechThresholds } from "../../grading/jfGrading";
import type { Band, CourseLevel, JfLevel } from "../../grading/jfGrading";
import { CONTENT_CRITERIA, criteriaFor, SPEAKING_CRITERIA } from "../../grading/speakingCriteria";
import type { DeliverySource, SpeakingCriterionId } from "../../grading/speakingCriteria";
import { measureAnswer } from "../../grading/speakingMeasurements";
import type { SpeakingMeasurements } from "../../grading/speakingMeasurements";
import { similarityScore } from "../../grading/textSimilarity";
import { createConversation, insertMessage } from "../../repositories/conversation.repository";
import {
  countSpeakingAttemptsSince, findSpeakingAttempt, insertSpeakingAttempt, listSpeakingAttempts, summarizeSpeakingTasks,
} from "../../repositories/speaking-attempt.repository";
import type { SpeakingAttemptRow } from "../../repositories/speaking-attempt.repository";
import { recordActivity } from "../../repositories/streak.repository";
import { HttpError } from "../../utils/http-error";
import { idParam } from "../conversation-format";
import { rewardActivity } from "../gamification.service";
import type { Reward } from "../gamification.service";
import { hasReachedCourseLevel } from "../unit.service";
import type { ContentGrade, Correction, SpeakingContentGrader } from "./content-grader";
import type { PronunciationAssessor, WordScore } from "./pronunciation-assessor";
import { readWav } from "./wav";

/** Course levels with a speaking test; N5 and N4 keep the read-aloud practice (GRADING.md section 2). */
export const SPEAKING_TEST_LEVELS: readonly CourseLevel[] = ["N3", "N2", "N1"];
export const DAILY_GRADED_ANSWERS = 30;
const DAY_SECONDS = 24 * 60 * 60;
const HISTORY_LENGTH = 10;
const MAX_TRANSCRIPT_LENGTH = 2000;

export type SpeakingTestDependencies = {
  assessor: PronunciationAssessor | null;
  grader: SpeakingContentGrader | null;
  hasReachedLevel?: (userId: number, level: CourseLevel) => Promise<boolean>;
  rewardAttempt?: (userId: number, attemptId: number) => Promise<Reward | null>;
};

const rewardSpeakingAttempt = (userId: number, attemptId: number) => rewardActivity(userId, "speaking_test", `attempt:${attemptId}`);

type CriterionResult = { id: SpeakingCriterionId; name: string; japanese: string; source: string; weight: number; band: Band | null; bandLabel: string | null; comment: string; rawScore: number | null };
type PositionedCorrection = Correction & { start: number; end: number };
export type SpeakingResult = {
  status: "graded"; id: number; taskId: string; level: CourseLevel; jfLevel: JfLevel; kind: SpeakingTask["kind"]; createdAt: Date;
  score: number; band: Band; bandLabel: string; met: boolean; delivery: DeliverySource;
  criteria: CriterionResult[]; notAssessed: SpeakingCriterionId[]; transcript: string; words: WordScore[];
  corrections: PositionedCorrection[]; summary: string; strengths: string[]; nextSteps: string[]; estimatedLevel: JfLevel | null;
  measurements: SpeakingMeasurements; reward?: Reward | null;
};
export type SubmitOutcome = SpeakingResult | { status: "no_answer"; message: string };

const NO_ANSWER = { status: "no_answer" as const, message: "No answer was recognised. Check your microphone, speak in Japanese and try again." };

// ---- Pure helpers

/** Adds each excerpt's position in the transcript; excerpts that aren't in it are dropped. */
export function positionCorrections(transcript: string, corrections: readonly Correction[]): PositionedCorrection[] {
  const taken: [number, number][] = [];
  return corrections.flatMap(correction => {
    let start = transcript.indexOf(correction.excerpt);
    while (start >= 0 && taken.some(([from, to]) => start < to && start + correction.excerpt.length > from)) start = transcript.indexOf(correction.excerpt, start + 1);
    if (start < 0) return [];
    const end = start + correction.excerpt.length;
    taken.push([start, end]);
    return [{ ...correction, start, end }];
  }).sort((a, b) => a.start - b.start);
}

function deliveryComment(id: SpeakingCriterionId, score: number, level: JfLevel): string {
  const { band3 } = speechThresholds(level);
  const what = id === "completeness" ? "of the passage was read" : id === "recognised" ? "match with the passage" : "from the pronunciation assessment";
  return `${Math.round(score)}/100 ${what}. ${level} needs ${band3} or more to meet the target.`;
}

function criterionResult(id: SpeakingCriterionId, weight: number, band: Band | null, comment: string, rawScore: number | null = null): CriterionResult {
  const meta = SPEAKING_CRITERIA[id];
  return { id, name: meta.name, japanese: meta.japanese, source: meta.source, weight, band, bandLabel: band ? BANDS[band].label : null, comment, rawScore };
}

/** The passage of a read-aloud task, as plain text and as its kana reading. */
function passageOf(task: SpeakingTask): { plain: string; reading: string } {
  if (!task.passage) throw new Error(`Read-aloud task ${task.id} has no passage.`);
  return { plain: task.passage.plain, reading: task.passage.ruby.replace(/<ruby>[^<]*<rt>([^<]*)<\/rt><\/ruby>/g, "$1") };
}

/** A stored result with the id and date it was saved under. */
const toResult = (row: SpeakingAttemptRow) => ({ ...row.result, status: "graded", id: row.id, createdAt: row.created_at });

// ---- Service

export function createSpeakingTestService(dependencies: SpeakingTestDependencies) {
  const { assessor, grader } = dependencies;
  const hasReachedLevel = dependencies.hasReachedLevel ?? hasReachedCourseLevel;
  const delivery: DeliverySource = assessor ? "azure" : "browser";

  async function requireTest(userId: number, level: unknown): Promise<CourseLevel> {
    const testLevel = SPEAKING_TEST_LEVELS.find(item => item === level);
    if (!testLevel) throw new HttpError(404, "The speaking test starts at N3. N5 and N4 have speaking practice.");
    if (!(await hasReachedLevel(userId, testLevel))) throw new HttpError(403, `The ${testLevel} speaking test opens when you reach ${testLevel}.`);
    return testLevel;
  }

  async function requireTask(userId: number, taskId: unknown): Promise<SpeakingTask> {
    const task = typeof taskId === "string" ? findSpeakingTask(taskId) : undefined;
    if (!task) throw new HttpError(404, "Speaking task not found.");
    await requireTest(userId, task.level);
    return task;
  }

  /** The level's tasks with the learner's best result, and what this server can grade. */
  async function listTasks(userId: number, level: unknown) {
    const testLevel = SPEAKING_TEST_LEVELS.find(item => item === level);
    if (!testLevel) throw new HttpError(404, "The speaking test starts at N3. N5 and N4 have speaking practice.");
    const open = await hasReachedLevel(userId, testLevel);
    const [summaries, usedToday] = open ? await Promise.all([summarizeSpeakingTasks(userId, testLevel), countSpeakingAttemptsSince(userId, DAY_SECONDS)]) : [[], 0];
    return {
      level: testLevel, jfLevel: JF_LEVEL_FOR_COURSE_LEVEL[testLevel], open,
      lockedReason: open ? null : `Opens when you reach ${testLevel}: complete every unit of the levels before it.`,
      delivery, contentGrading: grader !== null, dailyLimit: DAILY_GRADED_ANSWERS, usedToday,
      tasks: SPEAKING_TASKS.filter(task => task.level === testLevel).map(task => {
        const summary = summaries.find(row => row.task_id === task.id);
        return {
          ...task, available: task.kind === "read_aloud" || grader !== null,
          best: summary ? { score: summary.best_score, band: summary.best_band, met: summary.met, attempts: summary.attempts } : null,
        };
      }),
    };
  }

  async function listAttempts(userId: number, taskId: unknown) {
    const task = await requireTask(userId, taskId);
    return { attempts: (await listSpeakingAttempts(userId, task.id, HISTORY_LENGTH)).map(toResult) };
  }

  async function getAttempt(userId: number, attemptId: unknown) {
    const row = await findSpeakingAttempt(userId, idParam(attemptId, "Speaking result"));
    if (!row) throw new HttpError(404, "Speaking result not found.");
    return toResult(row);
  }

  /** What was said and how it sounded: from Azure when configured, otherwise from the browser's transcript. */
  async function deliveryFor(task: SpeakingTask, input: { audio?: unknown; transcript?: unknown; durationSeconds?: unknown }) {
    if (assessor) {
      const { wav, seconds } = readWav(input.audio);
      const outcome = task.kind === "read_aloud" ? await assessor.assessReading(wav, passageOf(task).plain) : await assessor.assessFreeAnswer(wav);
      if (outcome.status === "no_speech") return null;
      return { ...outcome.assessment, durationSeconds: outcome.assessment.durationSeconds || seconds };
    }
    const transcript = typeof input.transcript === "string" ? input.transcript.trim().slice(0, MAX_TRANSCRIPT_LENGTH) : "";
    const duration = Number(input.durationSeconds);
    if (!(duration > 0 && duration <= task.maxSeconds + 1)) throw new HttpError(400, "Send how long the answer was, up to 30 seconds.");
    if (!transcript) return null;
    return { transcript, accuracy: null, fluency: null, completeness: null, words: [] as WordScore[], durationSeconds: duration };
  }

  function readAloudCriteria(task: SpeakingTask, level: JfLevel, heard: NonNullable<Awaited<ReturnType<typeof deliveryFor>>>): CriterionResult[] {
    return criteriaFor("read_aloud", delivery).map(({ id, weight }) => {
      const raw = id === "pronunciation" ? heard.accuracy : id === "fluency" ? heard.fluency : id === "completeness" ? heard.completeness
        : similarityScore(Object.values(passageOf(task)), heard.transcript);
      if (raw === null) return criterionResult(id, weight, null, "Not assessed.");
      return criterionResult(id, weight, bandForSpeechScore(raw, level), deliveryComment(id, raw, level), Math.round(raw));
    });
  }

  function freeAnswerCriteria(level: JfLevel, heard: NonNullable<Awaited<ReturnType<typeof deliveryFor>>>, content: ContentGrade): CriterionResult[] {
    return criteriaFor("production", delivery).map(({ id, weight }) => {
      if ((CONTENT_CRITERIA as readonly string[]).includes(id)) {
        const graded = content.criteria[id as (typeof CONTENT_CRITERIA)[number]];
        return criterionResult(id, weight, graded.band, graded.comment);
      }
      const raw = id === "pronunciation" ? heard.accuracy : heard.fluency;
      if (raw === null) return criterionResult(id, weight, null, "Not assessed: pronunciation scoring isn't set up on this server.");
      return criterionResult(id, weight, bandForSpeechScore(raw, level), deliveryComment(id, raw, level), Math.round(raw));
    });
  }

  /** Grades one spoken answer, saves it, and counts today toward the streak. */
  async function submitAnswer(userId: number, taskId: unknown, input: { audio?: unknown; transcript?: unknown; durationSeconds?: unknown }): Promise<SubmitOutcome> {
    const task = await requireTask(userId, taskId);
    const contentGrader = task.kind === "read_aloud" ? null : grader;
    if (task.kind !== "read_aloud" && !contentGrader) throw new HttpError(503, "Grading of free answers isn't available on this server right now. Read-aloud tasks still work.");
    if (await countSpeakingAttemptsSince(userId, DAY_SECONDS) >= DAILY_GRADED_ANSWERS) throw new HttpError(429, `You can have ${DAILY_GRADED_ANSWERS} answers graded a day. Try again tomorrow.`);
    const jfLevel = JF_LEVEL_FOR_COURSE_LEVEL[task.level];
    const heard = await deliveryFor(task, input);
    if (!heard) return NO_ANSWER;
    const measurements = measureAnswer(heard.transcript, heard.durationSeconds, task.minSeconds);
    let content: ContentGrade | null = null;
    if (contentGrader) {
      content = await contentGrader.grade({ task, level: jfLevel, transcript: heard.transcript, measurements });
      if (content.offTask) return NO_ANSWER;
    }
    const criteria = content ? freeAnswerCriteria(jfLevel, heard, content) : readAloudCriteria(task, jfLevel, heard);
    const grade = gradeFromCriteria(criteria.map(({ id, weight, band }) => ({ id, weight, band })));
    const result = {
      taskId: task.id, level: task.level, jfLevel, kind: task.kind, score: grade.score, band: grade.band, bandLabel: BANDS[grade.band].label, met: grade.met, delivery,
      criteria, notAssessed: grade.notAssessed as SpeakingCriterionId[], transcript: heard.transcript, words: heard.words,
      corrections: content ? positionCorrections(heard.transcript, content.corrections) : [],
      summary: content?.summary ?? "", strengths: content?.strengths ?? [], nextSteps: content?.nextSteps ?? [], estimatedLevel: content?.estimatedLevel ?? null, measurements,
    };
    const saved = await withTransaction(async client => {
      const attempt = await insertSpeakingAttempt(client, { userId, taskId: task.id, level: task.level, score: grade.score, band: grade.band, met: grade.met, deliverySource: delivery, transcript: heard.transcript, result });
      await recordActivity(client, userId);
      return attempt;
    });
    const reward = await (dependencies.rewardAttempt ?? rewardSpeakingAttempt)(userId, saved.id);
    return { ...result, status: "graded", id: saved.id, createdAt: saved.createdAt, reward };
  }

  /** Disputes a grade: sends the result to Help & support as a new request (GRADING.md section 10). */
  async function reportAttempt(userId: number, attemptId: unknown, note: unknown) {
    const row = await findSpeakingAttempt(userId, idParam(attemptId, "Speaking result"));
    if (!row) throw new HttpError(404, "Speaking result not found.");
    const task = findSpeakingTask(row.task_id);
    const reason = typeof note === "string" ? note.trim().slice(0, 1000) : "";
    const body = `Speaking test result #${row.id} (${row.course_level}, ${task?.title ?? row.task_id}): ${row.score}/100, band ${row.band}${row.met ? ", target met" : ""}.\n\nTranscript: “${String(row.result.transcript ?? "")}”${reason ? `\n\nWhy I think the grade is wrong: ${reason}` : ""}`;
    const supportId = await withTransaction(async client => {
      const id = await createConversation(client, { kind: "support", subject: `Speaking grade #${row.id}`, createdBy: userId, memberIds: [userId] });
      await insertMessage(client, { conversationId: id, senderId: userId, senderRole: "learner", body });
      return id;
    });
    return { supportConversationId: supportId };
  }

  return { listTasks, listAttempts, getAttempt, submitAnswer, reportAttempt };
}

export type SpeakingTestService = ReturnType<typeof createSpeakingTestService>;
