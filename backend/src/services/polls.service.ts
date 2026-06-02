import { withTransaction } from '../db/client.js';
import {
  findOptionsByPollId,
  findPollById,
  getResultRows,
  insertOption,
  insertPoll,
  insertVote,
  optionBelongsToPoll
} from '../repositories/polls.repository.js';
import type { CreatePollInput, Poll, PollResults, VoteInput } from '../types/polls.js';

export async function createPoll(input: CreatePollInput): Promise<Poll> {
  return withTransaction(async (client) => {
    const createdPoll = await insertPoll({ question: input.question }, client);
    const createdOptions = [];

    for (const [index, text] of input.options.entries()) {
      const option = await insertOption(createdPoll.id, text, index, client);
      createdOptions.push(option);
    }

    return { ...createdPoll, options: createdOptions };
  });
}

export async function getPoll(pollId: string): Promise<Poll | null> {
  const poll = await findPollById(pollId);
  if (!poll) return null;

  const options = await findOptionsByPollId(pollId);
  return { ...poll, options };
}

export async function castVote(pollId: string, input: VoteInput, voterFp: string) {
  const isValidOption = await optionBelongsToPoll(input.optionId, pollId);

  if (!isValidOption) {
    return { ok: false as const, reason: 'Option does not belong to this poll' };
  }

  await insertVote(pollId, input.optionId, voterFp);
  return { ok: true as const };
}

export async function getPollResults(pollId: string): Promise<PollResults | null> {
  const poll = await findPollById(pollId);
  if (!poll) return null;

  const rows = await getResultRows(pollId);
  const totalVotes = Number(rows[0]?.total_votes ?? 0);

  return {
    id: poll.id,
    question: poll.question,
    totalVotes,
    options: rows.map((row) => {
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
