import { useCallback, useState } from 'react';

export type AsyncActionState = {
  busy: boolean;
  error: string;
  run: <T>(action: () => Promise<T>) => Promise<T | null>;
  clearError: () => void;
};

export function useAsyncAction(): AsyncActionState {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | null> => {
    setBusy(true);
    setError('');
    try {
      return await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, run, clearError };
}
