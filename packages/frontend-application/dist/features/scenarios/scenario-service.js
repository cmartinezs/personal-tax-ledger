export function createScenarioService(client) {
    return { build: payload => client.buildScenarios(payload) };
}
