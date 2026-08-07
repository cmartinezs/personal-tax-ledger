export type ScenarioService<C extends Record<string, any>> = {
  build(payload: Parameters<C['buildScenarios']>[0]): Promise<Awaited<ReturnType<C['buildScenarios']>>>;
};

export function createScenarioService<C extends Record<string, any>>(client: C): ScenarioService<C> {
  return { build: payload => client.buildScenarios(payload) };
}
