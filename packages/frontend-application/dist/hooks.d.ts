export type AsyncActionState = {
    busy: boolean;
    error: string;
    run: <T>(action: () => Promise<T>) => Promise<T | null>;
    clearError: () => void;
};
export declare function useAsyncAction(): AsyncActionState;
