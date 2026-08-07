export type ScenarioTotalsLike = Record<string, number | string>;
export type ScenarioLike = {
    key: string;
    result: {
        totals?: ScenarioTotalsLike;
    };
};
export declare function isRegimeA(result: {
    totals?: ScenarioTotalsLike;
}): boolean;
export declare function isRegimeB(result: {
    totals?: ScenarioTotalsLike;
}): boolean;
export declare function baselineAnnualTax(scenarios: ScenarioLike[]): number;
export declare function scenarioApvBenefit<T extends ScenarioLike>(scenario: T, scenarios: T[]): number;
