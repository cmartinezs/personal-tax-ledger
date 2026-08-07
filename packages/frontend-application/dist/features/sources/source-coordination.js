export function filterReferences(references, query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return references;
    return references.filter(r => r.authority.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.appliesTo.toLowerCase().includes(q));
}
export function filterTaxRuleSources(sources, query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return sources;
    return sources.filter(s => s.ruleKey.toLowerCase().includes(q) || s.institution.toLowerCase().includes(q) || (s.title || '').toLowerCase().includes(q));
}
