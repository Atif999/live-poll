import type pg from 'pg';
import { pool } from '../db/client.js';
import type { CreatePollInput, Poll, PollOption, ResultRow } from '../types/polls.js';

type DbClient = pg.Pool | pg.PoolClient;

export async function insertPoll(input: Pick<CreatePollInput, 'question'>, client: DbClient = pool) {
  const result = await client.query('INSERT INTO polls (question) VALUES ($1) RETURNING id, question, created_at', [input.question]);
  return result.rows[0];
}

export async function insertOption(pollId: string, text: string, position: number, client: DbClient = pool): Promise<PollOption> {
  const result = await client.query(
    'INSERT INTO options (poll_id, text, position) VALUES ($1, $2, $3) RETURNING id, text, position',
    [pollId, text, position]
  );

  return result.rows[0];
}

export async function findPollById(pollId: string): Promise<Omit<Poll, 'options'> | null> {
  const result = await pool.query('SELECT id, question, created_at FROM polls WHERE id = $1', [pollId]);
  return result.rowCount === 0 ? null : result.rows[0];
}

export async function findOptionsByPollId(pollId: string): Promise<PollOption[]> {
  const result = await pool.query('SELECT id, text, position FROM options WHERE poll_id = $1 ORDER BY position ASC', [pollId]);
  return result.rows;
}

export async function optionBelongsToPoll(optionId: string, pollId: string) {
  const result = await pool.query('SELECT id FROM options WHERE id = $1 AND poll_id = $2', [optionId, pollId]);
  return result.rowCount > 0;
}

export async function insertVote(pollId: string, optionId: string, voterFp: string | null) {
  await pool.query('INSERT INTO votes (poll_id, option_id, voter_fp) VALUES ($1, $2, $3)', [pollId, optionId, voterFp]);
}

export async function getResultRows(pollId: string): Promise<ResultRow[]> {
  const result = await pool.query<ResultRow>(
    `
    SELECT
      o.id,
      o.text,
      o.position,
      COUNT(v.id) AS votes,
      SUM(COUNT(v.id)) OVER () AS total_votes
    FROM options o
    LEFT JOIN votes v ON v.option_id = o.id
    WHERE o.poll_id = $1
    GROUP BY o.id, o.text, o.position
    ORDER BY o.position ASC
    `,
    [pollId]
  );

  return result.rows;
}
