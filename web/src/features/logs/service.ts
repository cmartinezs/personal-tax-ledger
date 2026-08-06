export function createLogsFeatureService(client: typeof import('../../api').api) {
  return { list: client.listExecutionLogs, create: client.createExecutionLog };
}
