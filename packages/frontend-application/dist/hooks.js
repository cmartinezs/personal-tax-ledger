import { useCallback, useState } from 'react';
export function useAsyncAction() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const clearError = useCallback(() => setError(''), []);
    const run = useCallback(async (action) => {
        setBusy(true);
        setError('');
        try {
            return await action();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            return null;
        }
        finally {
            setBusy(false);
        }
    }, []);
    return { busy, error, run, clearError };
}
