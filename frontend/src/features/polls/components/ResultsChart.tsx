'use client';

import { usePollResultsStream } from '../hooks/usePollResultsStream';
import type { PollResults } from '../types';

export function ResultsChart({ initialResults }: { initialResults: PollResults }) {
  const { results, isLive } = usePollResultsStream(initialResults);

  return (
    <div className="card">
      <p className="eyebrow">Live results {isLive ? '●' : ''}</p>
      <h1>{results.question}</h1>
      <p>{results.totalVotes} total vote{results.totalVotes === 1 ? '' : 's'}</p>

      {results.options.map((option) => (
        <div className="result-row" key={option.id}>
          <div className="result-head">
            <strong>{option.text}</strong>
            <span>{option.votes} vote{option.votes === 1 ? '' : 's'} · {option.percent}%</span>
          </div>
          <div className="bar" aria-label={`${option.text}: ${option.percent}%`}>
            <div className="fill" style={{ width: `${option.percent}%` }} />
          </div>
        </div>
      ))}

      <div className="actions" style={{ marginTop: 22 }}>
        <a className="btn secondary" href={`/poll/${results.id}`}>Back to voting page</a>
      </div>
    </div>
  );
}
