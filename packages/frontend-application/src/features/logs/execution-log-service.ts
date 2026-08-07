export type ExecutionLogService<C extends Record<string, any>> = {
  list(filters?: Parameters<C['listExecutionLogs']>[0]): Promise<Awaited<ReturnType<C['listExecutionLogs']>>>;
  create(entry: Parameters<C['createExecutionLog']>[0]): Promise<Awaited<ReturnType<C['createExecutionLog']>>>;
};

export function createExecutionLogService<C extends Record<string, any>>(client: C): ExecutionLogService<C> {
  return {
    list: filters => client.listExecutionLogs(filters),
    create: entry => client.createExecutionLog(entry)
  };
}
