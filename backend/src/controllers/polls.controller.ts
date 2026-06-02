import type { NextFunction, Request, Response } from 'express';
import { createPollSchema, voteSchema } from '../validators/polls.schema.js';
import { castVote, createPoll, getPoll, getPollResults } from '../services/polls.service.js';
import { getVoterFingerprint } from '../utils/voterFingerprint.js';
import { streamPollResults } from '../realtime/pollResultsStream.js';

export async function createPollController(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createPollSchema.parse(req.body);
    const poll = await createPoll(input);

    res.status(201).json(poll);
  } catch (error) {
    next(error);
  }
}

export async function getPollController(req: Request, res: Response, next: NextFunction) {
  try {
    const poll = await getPoll(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    next(error);
  }
}

export async function voteController(req: Request, res: Response, next: NextFunction) {
  try {
    const input = voteSchema.parse(req.body);
    const voterFp = getVoterFingerprint(req);
    const result = await castVote(req.params.id, input, voterFp);

    if (!result.ok) {
      return res.status(400).json({ message: result.reason });
    }

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function getResultsController(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await getPollResults(req.params.id);

    if (!results) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
}

export async function streamResultsController(req: Request, res: Response, next: NextFunction) {
  try {
    await streamPollResults(req, res);
  } catch (error) {
    next(error);
  }
}
