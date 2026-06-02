'use client';

import { useMemo, useState } from 'react';
import { createPoll } from '../api/pollsApi';
import type { Poll } from '../types';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

export function PollForm() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [createdPoll, setCreatedPoll] = useState<Poll | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const shareUrl = useMemo(() => {
    if (!createdPoll || typeof window === 'undefined') return '';
    return `${window.location.origin}/poll/${createdPoll.id}`;
  }, [createdPoll]);

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((option, optionIndex) => (optionIndex === index ? value : option)));
  }

  function addOption() {
    setOptions((current) => (current.length >= MAX_OPTIONS ? current : [...current, '']));
  }

  function removeOption(index: number) {
    setOptions((current) => (current.length <= MIN_OPTIONS ? current : current.filter((_, optionIndex) => optionIndex !== index)));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setCreatedPoll(null);
    setIsSubmitting(true);

    try {
      const poll = await createPoll({
        question,
        options: options.map((option) => option.trim()).filter(Boolean)
      });
      setCreatedPoll(poll);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create poll');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <label htmlFor="question">Question</label>
          <input id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What should we build next?" />
        </div>

        <div className="grid">
          {options.map((option, index) => (
            <div className="form-row" key={index}>
              <label htmlFor={`option-${index}`}>Option {index + 1}</label>
              <div className="actions">
                <input id={`option-${index}`} value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Answer option ${index + 1}`} />
                {options.length > MIN_OPTIONS && (
                  <button className="btn secondary" type="button" onClick={() => removeOption(index)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="actions">
          <button className="btn secondary" type="button" onClick={addOption} disabled={options.length >= MAX_OPTIONS}>
            Add option
          </button>
          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create poll'}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </form>

      {createdPoll && (
        <div style={{ marginTop: 24 }}>
          <h2>Poll created</h2>
          <p>Share this link with voters:</p>
          <div className="share-box">{shareUrl}</div>
          <div className="actions" style={{ marginTop: 14 }}>
            <a className="btn" href={`/poll/${createdPoll.id}`}>Open voting page</a>
            <a className="btn secondary" href={`/poll/${createdPoll.id}/results`}>View results</a>
          </div>
        </div>
      )}
    </div>
  );
}
