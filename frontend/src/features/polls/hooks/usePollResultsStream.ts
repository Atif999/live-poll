'use client';
import { useEffect, useState } from 'react';
import { API_URL } from '@/src/lib/apiClient';
import type { PollResults } from '../types';

export function usePollResultsStream(initialResults: PollResults) {
  const [results, setResults] = useState(initialResults);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const events = new EventSource(`${API_URL}/api/polls/${initialResults.id}/stream`);

    events.onopen = () => {
      setIsLive(true);
    };

    events.addEventListener('results', (event) => {
      setResults(JSON.parse(event.data));
    });

    events.onerror = () => {
      setIsLive(false);
      events.close();
    };

    return () => {
      events.close();
    };
  }, [initialResults.id]);

  return { results, isLive };
}
