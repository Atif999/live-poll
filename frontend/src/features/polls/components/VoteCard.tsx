'use client';

import { useState } from 'react';
import { submitVote } from '../api/pollsApi';
import type { Poll } from '../types';

export function VoteCard({ poll }: { poll: Poll }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleVoteSubmit() {
    if (!selectedOption) return;
    setError('');
    setIsSubmitting(true);

    try {
      await submitVote(poll.id, { optionId: selectedOption });
      window.location.href = `/poll/${poll.id}/results`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit vote');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <p className="eyebrow">Cast your vote</p>
      <h1>{poll.question}</h1>
      <div className="grid">
        {poll.options.map((option) => (
          <button
            key={option.id}
            className={`option-button ${selectedOption === option.id ? 'selected' : ''}`}
            onClick={() => setSelectedOption(option.id)}
            type="button"
          >
            {option.text}
          </button>
        ))}
      </div>
      <div className="actions" style={{ marginTop: 20 }}>
        <button className="btn" onClick={handleVoteSubmit} disabled={!selectedOption || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit vote'}
        </button>
        <a className="btn secondary" href={`/poll/${poll.id}/results`}>See results</a>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
