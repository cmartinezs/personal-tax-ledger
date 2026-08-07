export type ReferenceLike = {
    authority: string;
    title: string;
    appliesTo: string;
};
export type TaxRuleSourceLike = {
    ruleKey: string;
    institution: string;
    title?: string | null;
};
export declare function filterReferences<T extends ReferenceLike>(references: T[], query: string): T[];
export declare function filterTaxRuleSources<T extends TaxRuleSourceLike>(sources: T[], query: string): T[];
