import { pool } from "../config/db";

export type BankQuestionType = "multiple_choice" | "word_match" | "word_scramble";
export type BankQuestion = { id: number; unitId: string; type: BankQuestionType; content: unknown; enabled: boolean; createdAt: Date; updatedAt: Date };
export type BankQuestionInput = { unitId: string; type: BankQuestionType; content: unknown; enabled: boolean };

const COLUMNS = "id, unit_id, type, content, enabled, created_at, updated_at";
type Row = { id: number; unit_id: string; type: BankQuestionType; content: unknown; enabled: boolean; created_at: Date; updated_at: Date };
const toQuestion = (row: Row): BankQuestion => ({
  id: row.id, unitId: row.unit_id, type: row.type, content: row.content, enabled: row.enabled, createdAt: row.created_at, updatedAt: row.updated_at,
});

export async function listQuestions(): Promise<BankQuestion[]> {
  const result = await pool.query(`SELECT ${COLUMNS} FROM review_questions ORDER BY unit_id, id`);
  return result.rows.map(toQuestion);
}

export async function listEnabledQuestions(unitId: string): Promise<BankQuestion[]> {
  const result = await pool.query(`SELECT ${COLUMNS} FROM review_questions WHERE unit_id=$1 AND enabled ORDER BY id`, [unitId]);
  return result.rows.map(toQuestion);
}

export async function findEnabledQuestion(id: number, unitId: string): Promise<BankQuestion | undefined> {
  const result = await pool.query(`SELECT ${COLUMNS} FROM review_questions WHERE id=$1 AND unit_id=$2 AND enabled`, [id, unitId]);
  return result.rows[0] && toQuestion(result.rows[0]);
}

export async function insertQuestion(question: BankQuestionInput, createdBy: number): Promise<BankQuestion> {
  const result = await pool.query(
    `INSERT INTO review_questions (unit_id, type, content, enabled, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING ${COLUMNS}`,
    [question.unitId, question.type, JSON.stringify(question.content), question.enabled, createdBy]
  );
  return toQuestion(result.rows[0]);
}

export async function updateQuestion(id: number, question: BankQuestionInput): Promise<BankQuestion | undefined> {
  const result = await pool.query(
    `UPDATE review_questions SET unit_id=$1, type=$2, content=$3, enabled=$4, updated_at=NOW() WHERE id=$5 RETURNING ${COLUMNS}`,
    [question.unitId, question.type, JSON.stringify(question.content), question.enabled, id]
  );
  return result.rows[0] && toQuestion(result.rows[0]);
}

export async function deleteQuestion(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM review_questions WHERE id=$1", [id]);
  return Boolean(result.rowCount);
}
