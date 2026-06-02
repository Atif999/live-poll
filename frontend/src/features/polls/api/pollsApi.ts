import { apiClient } from '@/src/lib/apiClient';
import type { CreatePollInput, Poll, PollResults, VoteInput } from '../types';

export function createPoll(input: CreatePollInput) {
  return apiClient<Poll>('/api/polls', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function getPoll(pollId: string) {
  return apiClient<Poll>(`/api/polls/${pollId}`);
}

export function submitVote(pollId: string, input: VoteInput) {
  return apiClient<{ success: true }>(`/api/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function getPollResults(pollId: string) {
  return apiClient<PollResults>(`/api/polls/${pollId}/results`);
}
