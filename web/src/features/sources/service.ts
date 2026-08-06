export function createSourcesFeatureService(client: typeof import('../../api').api) {
  return { list: client.listTaxRuleSources, create: client.createTaxRuleSource, remove: client.deleteTaxRuleSource };
}
