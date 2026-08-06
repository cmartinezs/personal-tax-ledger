export function createScenarioFeatureService(client: typeof import('../../api').api) {
  return { simulate: client.simulate, compareApv: client.compareApv, buildScenarios: client.buildScenarios, article55Bis: client.article55Bis };
}
