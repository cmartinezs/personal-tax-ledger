export type ExecutionLogService<C extends Record<string, any>> = {
    list(filters?: Parameters<C['listExecutionLogs']>[0]): Promise<Awaited<ReturnType<C['listExecutionLogs']>>>;
    create(entry: Parameters<C['createExecutionLog']>[0]): Promise<Awaited<ReturnType<C['createExecutionLog']>>>;
};
export declare function createExecutionLogService<C extends Record<string, any>>(client: C): ExecutionLogService<C>;
