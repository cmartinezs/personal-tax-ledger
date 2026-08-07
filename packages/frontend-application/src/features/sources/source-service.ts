export type SourceService<C extends Record<string, any>> = {
  list(filters?: Parameters<C['listTaxRuleSources']>[0]): Promise<Awaited<ReturnType<C['listTaxRuleSources']>>>;
  create(source: Parameters<C['createTaxRuleSource']>[0]): Promise<Awaited<ReturnType<C['createTaxRuleSource']>>>;
  remove(id: Parameters<C['deleteTaxRuleSource']>[0]): Promise<Awaited<ReturnType<C['deleteTaxRuleSource']>>>;
};

export function createSourceService<C extends Record<string, any>>(client: C): SourceService<C> {
  return {
    list: filters => client.listTaxRuleSources(filters),
    create: source => client.createTaxRuleSource(source),
    remove: id => client.deleteTaxRuleSource(id)
  };
}
