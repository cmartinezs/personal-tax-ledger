export function isRegimeA(result) {
    return Number(result.totals?.apvAContributions) > 0;
}
export function isRegimeB(result) {
    return Number(result.totals?.apvBAccepted) > 0;
}
export function baselineAnnualTax(scenarios) {
    return Number(scenarios.find(s => s.key === 'base')?.result.totals?.annualTax) || 0;
}
export function scenarioApvBenefit(scenario, scenarios) {
    const t = scenario.result.totals;
    if (isRegimeA(scenario.result))
        return Number(t?.apvABonus) || 0;
    if (isRegimeB(scenario.result))
        return Number(t?.annualTax) - baselineAnnualTax(scenarios);
    return 0;
}
