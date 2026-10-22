import { pool } from "../config/db";

// Learning analytics for administrators. Only learner accounts are counted; administrators are left out.
const LEARNERS = "SELECT id FROM users WHERE role = 'learner'";

/** Learners whose last learning day falls in each window, plus totals. */
export async function countActiveLearners() {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS learners,
            COUNT(*) FILTER (WHERE u.created_at > NOW() - INTERVAL '30 days')::int AS new_30d,
            COUNT(*) FILTER (WHERE g.last_activity_at > NOW() - INTERVAL '1 day')::int AS active_1d,
            COUNT(*) FILTER (WHERE g.last_activity_at > NOW() - INTERVAL '7 days')::int AS active_7d,
            COUNT(*) FILTER (WHERE g.last_activity_at > NOW() - INTERVAL '30 days')::int AS active_30d
       FROM users u LEFT JOIN user_gamification g ON g.user_id = u.id WHERE u.role = 'learner'`);
  return result.rows[0];
}

/** Distinct active learners per day (UTC) over the last `days` days, from every kind of graded learning work. */
export async function dailyActiveLearners(days: number) {
  const result = await pool.query(
    `WITH activity AS (
       SELECT user_id, created_at AS at FROM xp_events WHERE source NOT IN ('achievement', 'streak')
       UNION ALL SELECT user_id, created_at FROM quiz_answer_receipts
       UNION ALL SELECT user_id, answered_at FROM kanji_practice_questions WHERE answered_at IS NOT NULL
       UNION ALL SELECT user_id, updated_at FROM user_assessment_progress
       UNION ALL SELECT user_id, created_at FROM practice_sessions
     ), recent AS (SELECT * FROM activity WHERE at >= (CURRENT_DATE - ($1::int - 1)) AND user_id IN (${LEARNERS}))
     SELECT d::date AS day, COUNT(DISTINCT r.user_id)::int AS learners
       FROM generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, INTERVAL '1 day') d
       LEFT JOIN recent r ON (r.at AT TIME ZONE 'UTC')::date = d::date
      GROUP BY d ORDER BY d`, [days]);
  return result.rows.map(row => ({ day: (row.day as Date).toISOString().slice(0, 10), learners: row.learners as number }));
}

/** How many learners completed each lesson. */
export async function countLessonCompletions(): Promise<Map<string, number>> {
  const result = await pool.query(`SELECT lesson_id, COUNT(*)::int AS count FROM lesson_progress WHERE user_id IN (${LEARNERS}) GROUP BY lesson_id`);
  return new Map(result.rows.map(row => [row.lesson_id as string, row.count as number]));
}

/** Learners who completed at least one / every lesson of each unit (lesson ids passed per unit). */
export async function countUnitProgress(units: { id: string; lessonIds: string[] }[]) {
  const result = await pool.query(
    `SELECT u.unit_id,
            COUNT(*) FILTER (WHERE u.done > 0)::int AS started,
            COUNT(*) FILTER (WHERE u.done = u.total)::int AS finished_lessons
       FROM (SELECT x.unit_id, x.total, p.user_id, COUNT(p.lesson_id) AS done
               FROM jsonb_to_recordset($1::jsonb) AS x(unit_id text, lesson_ids text[], total int)
               JOIN lesson_progress p ON p.lesson_id = ANY(x.lesson_ids) AND p.user_id IN (${LEARNERS})
              GROUP BY x.unit_id, x.total, p.user_id) u
      GROUP BY u.unit_id`,
    [JSON.stringify(units.map(unit => ({ unit_id: unit.id, lesson_ids: unit.lessonIds, total: unit.lessonIds.length })))]);
  return new Map(result.rows.map(row => [row.unit_id as string, { started: row.started as number, finishedLessons: row.finished_lessons as number }]));
}

/** Per assessment: learners who attempted, learners who passed, and the average best score. */
export async function assessmentResults() {
  const result = await pool.query(
    `SELECT assessment_id, COUNT(*)::int AS attempted, COUNT(passed_at)::int AS passed, ROUND(AVG(best_score))::int AS average_best
       FROM user_assessment_progress WHERE user_id IN (${LEARNERS}) GROUP BY assessment_id`);
  return new Map(result.rows.map(row => [row.assessment_id as string, { attempted: row.attempted as number, passed: row.passed as number, averageBest: row.average_best as number }]));
}

/** Practice volume in the last 30 days, by kind. */
export async function practiceVolume() {
  const result = await pool.query(
    `SELECT kind, COUNT(*)::int AS sessions, COALESCE(ROUND(100.0 * SUM(correct) / NULLIF(SUM(answered), 0)), 0)::int AS accuracy
       FROM (
         SELECT kind, answered, correct, created_at, user_id FROM practice_sessions
         UNION ALL SELECT 'kana', 1, CASE WHEN (response->>'correct')::boolean THEN 1 ELSE 0 END, created_at, user_id FROM quiz_answer_receipts
         UNION ALL SELECT 'kanji', 1, CASE WHEN answer_index = correct_index THEN 1 ELSE 0 END, answered_at, user_id FROM kanji_practice_questions WHERE answered_at IS NOT NULL
       ) p
      WHERE created_at > NOW() - INTERVAL '30 days' AND user_id IN (${LEARNERS})
      GROUP BY kind`);
  return result.rows as { kind: string; sessions: number; accuracy: number }[];
}
