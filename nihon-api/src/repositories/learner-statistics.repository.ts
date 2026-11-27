import { pool } from "../config/db";

// A learner's weeks start on Monday in their own time zone.
const zone = "COALESCE((SELECT time_zone FROM user_profiles WHERE user_id = $1), 'UTC')";
const thisWeek = `date_trunc('week', NOW() AT TIME ZONE ${zone})::date`;

/** Lessons completed per week for the last `weeks` weeks, oldest first, including empty weeks. */
export async function listWeeklyLessons(userId: number, weeks: number): Promise<{ week: string; lessons: number; averageScore: number | null }[]> {
  const result = await pool.query(
    `SELECT to_char(w.week, 'YYYY-MM-DD') AS week, COUNT(lp.lesson_id)::int AS lessons, ROUND(AVG(lp.challenge_score))::int AS average_score
       FROM generate_series(0, $2::int - 1) AS offsets(n)
       CROSS JOIN LATERAL (SELECT ${thisWeek} - offsets.n * 7 AS week) w
       LEFT JOIN lesson_progress lp ON lp.user_id = $1 AND date_trunc('week', lp.completed_at AT TIME ZONE ${zone})::date = w.week
      GROUP BY w.week ORDER BY w.week`, [userId, weeks]);
  return result.rows.map(row => ({ week: row.week, lessons: row.lessons, averageScore: row.average_score }));
}

export async function countCompletedLessons(userId: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM lesson_progress WHERE user_id = $1", [userId]);
  return result.rows[0].count;
}

/** The Japanese course's listening, speaking, reading, mock-exam and game sessions, per kind (English ones are
 *  summarized by `summarizeEnglishPractice`). */
export async function summarizePracticeSessions(userId: number): Promise<{ kind: string; sessions: number; answered: number; correct: number }[]> {
  const result = await pool.query(
    `SELECT kind, COUNT(*)::int AS sessions, SUM(answered)::int AS answered, SUM(correct)::int AS correct
       FROM practice_sessions WHERE user_id = $1 AND scope NOT LIKE 'english-%' GROUP BY kind ORDER BY kind`, [userId]);
  return result.rows;
}

export type EnglishPracticeRow = { kind: string; level: string; sessions: number; answered: number; correct: number; lastPractisedAt: Date };

/** The English course's practice sessions (listening, speaking, review rounds) per kind and level (A2–C1). */
export async function summarizeEnglishPractice(userId: number): Promise<EnglishPracticeRow[]> {
  const result = await pool.query(
    `SELECT kind, UPPER(SUBSTRING(scope FROM '^english-(a2|b1|b2|c1)')) AS level, COUNT(*)::int AS sessions,
            SUM(answered)::int AS answered, SUM(correct)::int AS correct, MAX(created_at) AS last_practised_at
       FROM practice_sessions WHERE user_id = $1 AND scope ~ '^english-(a2|b1|b2|c1)'
      GROUP BY kind, level ORDER BY level, kind`, [userId]);
  return result.rows.map(row => ({ kind: row.kind, level: row.level, sessions: row.sessions, answered: row.answered, correct: row.correct, lastPractisedAt: row.last_practised_at }));
}

/** Speaking test attempts per level: how many, the best score and how many tasks reached their target. */
export async function summarizeSpeakingByLevel(userId: number): Promise<{ level: string; attempts: number; bestScore: number; tasksMet: number }[]> {
  const result = await pool.query(
    `SELECT course_level AS level, COUNT(*)::int AS attempts, MAX(score)::int AS best_score, COUNT(DISTINCT task_id) FILTER (WHERE met)::int AS tasks_met
       FROM speaking_attempts WHERE user_id = $1 GROUP BY course_level ORDER BY course_level DESC`, [userId]);
  return result.rows.map(row => ({ level: row.level, attempts: row.attempts, bestScore: row.best_score, tasksMet: row.tasks_met }));
}
