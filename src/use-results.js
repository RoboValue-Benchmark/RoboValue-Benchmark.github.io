import { useEffect, useState } from 'react';

// The homepage and full leaderboard read the same manuscript results.
export function useResults() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch('/data/results.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw Error('Results unavailable'); return response.json(); })
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(error => { if (error.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [attempt]);
  return { data, error, retry: () => setAttempt(value => value + 1) };
}
