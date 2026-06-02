import crypto from 'node:crypto';
import type { Request, Response, Router } from 'express';
import express from 'express';
import { z } from 'zod';
import { pool, withTransaction } from '../db/client.js';

export const pollsRouter: Router = express.Router();

const createPollSchema = z.object({
  question: z.string().trim().min(5).max(240),
  options: z
    .array(z.string().trim().min(1).max(120))
    .min(2)
    .max(5)
    .superRefine((options, ctx) => {
      const normalized = options.map((option) => option.toLowerCase());
      if (new Set(normalized).size !== normalized.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Options must be unique' });
      }
    })
});

const voteSchema = z.object({
  optionId: z.string().uuid()
});

type ResultRow = {
  id: string;
  text: string;
  position: number;
  votes: string;
  total_votes: string;
};

function getVoterFingerprint(req: Request) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0] ?? req.ip;
  const ua = req.headers['user-agent'] ?? 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex');
}

async function fetchPoll(pollId: string) {
  const pollResult = await pool.query('SELECT id, question, created_at FROM polls WHERE id = $1', [pollId]);
  if (pollResult.rowCount === 0) return null;

  const optionsResult = await pool.query(
    'SELECT id, text, position FROM options WHERE poll_id = $1 ORDER BY position ASC',
    [pollId]
  );

  return {
    ...pollResult.rows[0],
    options: optionsResult.rows
  };
}

async function fetchResults(pollId: string) {
  const poll = await pool.query('SELECT id, question FROM polls WHERE id = $1', [pollId]);
  if (poll.rowCount === 0) return null;

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

  const totalVotes = Number(result.rows[0]?.total_votes ?? 0);

  return {
    id: poll.rows[0].id,
    question: poll.rows[0].question,
    totalVotes,
    options: result.rows.map((row) => {
      const votes = Number(row.votes);
      return {
        id: row.id,
        text: row.text,
        position: row.position,
        votes,
        percent: totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100)
      };
    })
  };
}

pollsRouter.post('/', async (req, res, next) => {
  try {
    const input = createPollSchema.parse(req.body);

    const poll = await withTransaction(async (client) => {
      const pollResult = await client.query('INSERT INTO polls (question) VALUES ($1) RETURNING id, question, created_at', [
        input.question
      ]);
      const createdPoll = pollResult.rows[0];

      const createdOptions = [];
      for (const [index, text] of input.options.entries()) {
        const optionResult = await client.query(
          'INSERT INTO options (poll_id, text, position) VALUES ($1, $2, $3) RETURNING id, text, position',
          [createdPoll.id, text, index]
        );
        createdOptions.push(optionResult.rows[0]);
      }

      return { ...createdPoll, options: createdOptions };
    });

    res.status(201).json(poll);
  } catch (error) {
    next(error);
  }
});

pollsRouter.get('/:id', async (req, res, next) => {
  try {
    const poll = await fetchPoll(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    res.json(poll);
  } catch (error) {
    next(error);
  }
});

pollsRouter.post('/:id/vote', async (req, res, next) => {
  try {
    const input = voteSchema.parse(req.body);
    const voterFp = getVoterFingerprint(req);

    const optionResult = await pool.query('SELECT id FROM options WHERE id = $1 AND poll_id = $2', [input.optionId, req.params.id]);
    if (optionResult.rowCount === 0) return res.status(400).json({ message: 'Option does not belong to this poll' });

    await pool.query('INSERT INTO votes (poll_id, option_id, voter_fp) VALUES ($1, $2, $3)', [req.params.id, input.optionId, voterFp]);
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

pollsRouter.get('/:id/results', async (req, res, next) => {
  try {
    const results = await fetchResults(req.params.id);
    if (!results) return res.status(404).json({ message: 'Poll not found' });
    res.json(results);
  } catch (error) {
    next(error);
  }
});

pollsRouter.get('/:id/stream', async (req: Request, res: Response, next) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendResults = async () => {
      const results = await fetchResults(req.params.id);
      if (!results) {
        res.write('event: error\n');
        res.write(`data: ${JSON.stringify({ message: 'Poll not found' })}\n\n`);
        return;
      }
      res.write('event: results\n');
      res.write(`data: ${JSON.stringify(results)}\n\n`);
    };

    await sendResults();
    const interval = setInterval(sendResults, 2000);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  } catch (error) {
    next(error);
  }
});
