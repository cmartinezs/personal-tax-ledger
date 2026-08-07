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

export function filterReferences<T extends ReferenceLike>(references: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return references;
  return references.filter(r => r.authority.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.appliesTo.toLowerCase().includes(q));
}

export function filterTaxRuleSources<T extends TaxRuleSourceLike>(sources: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return sources;
  return sources.filter(s => s.ruleKey.toLowerCase().includes(q) || s.institution.toLowerCase().includes(q) || (s.title || '').toLowerCase().includes(q));
}
