export type ScenarioTotalsLike = Record<string, number | string>;

export type ScenarioLike = {
  key: string;
  result: { totals?: ScenarioTotalsLike };
};

export function isRegimeA(result: { totals?: ScenarioTotalsLike }): boolean {
  return Number(result.totals?.apvAContributions) > 0;
}

export function isRegimeB(result: { totals?: ScenarioTotalsLike }): boolean {
  return Number(result.totals?.apvBAccepted) > 0;
}

export function baselineAnnualTax(scenarios: ScenarioLike[]): number {
  return Number(scenarios.find(s => s.key === 'base')?.result.totals?.annualTax) || 0;
}

export function scenarioApvBenefit<T extends ScenarioLike>(scenario: T, scenarios: T[]): number {
  const t = scenario.result.totals as ScenarioTotalsLike | undefined;
  if (isRegimeA(scenario.result)) return Number(t?.apvABonus) || 0;
  if (isRegimeB(scenario.result)) return Number(t?.annualTax) - baselineAnnualTax(scenarios);
  return 0;
}
