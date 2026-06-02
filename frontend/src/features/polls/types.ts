export type PollOption = {
  id: string;
  text: string;
  position: number;
};

export type Poll = {
  id: string;
  question: string;
  created_at?: string;
  options: PollOption[];
};

export type ResultOption = PollOption & {
  votes: number;
  percent: number;
};

export type PollResults = {
  id: string;
  question: string;
  totalVotes: number;
  options: ResultOption[];
};

export type CreatePollInput = {
  question: string;
  options: string[];
};

export type VoteInput = {
  optionId: string;
};
