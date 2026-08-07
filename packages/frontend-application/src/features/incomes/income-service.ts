export type IncomeService<C extends Record<string, any>> = {
  list(taxYear?: number): Promise<Awaited<ReturnType<C['listIncomes']>>>;
  create(source: Parameters<C['createIncome']>[0]): Promise<Awaited<ReturnType<C['createIncome']>>>;
  update(source: Parameters<C['updateIncome']>[0]): Promise<Awaited<ReturnType<C['updateIncome']>>>;
  remove(id: Parameters<C['deleteIncome']>[0]): Promise<Awaited<ReturnType<C['deleteIncome']>>>;
};

export function createIncomeService<C extends Record<string, any>>(client: C): IncomeService<C> {
  return {
    list: taxYear => client.listIncomes(taxYear),
    create: source => client.createIncome(source),
    update: source => client.updateIncome(source),
    remove: id => client.deleteIncome(id)
  };
}
