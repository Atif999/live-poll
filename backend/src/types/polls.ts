export type PollOption = {
  id: string;
  text: string;
  position: number;
};

export type Poll = {
  id: string;
  question: string;
  created_at: string;
  options: PollOption[];
};

export type PollResultsOption = PollOption & {
  votes: number;
  percent: number;
};

export type PollResults = {
  id: string;
  question: string;
  totalVotes: number;
  options: PollResultsOption[];
};

export type CreatePollInput = {
  question: string;
  options: string[];
};

export type VoteInput = {
  optionId: string;
};

export type ResultRow = {
  id: string;
  text: string;
  position: number;
  votes: string;
  total_votes: string;
};
