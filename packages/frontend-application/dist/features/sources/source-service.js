export function createSourceService(client) {
    return {
        list: filters => client.listTaxRuleSources(filters),
        create: source => client.createTaxRuleSource(source),
        remove: id => client.deleteTaxRuleSource(id)
    };
}
