export function createExecutionLogService(client) {
    return {
        list: filters => client.listExecutionLogs(filters),
        create: entry => client.createExecutionLog(entry)
    };
}
