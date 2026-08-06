import type { IncomeSource } from './types';

export type IncomeService = {
  list(taxYear?: number): Promise<IncomeSource[]>;
  create(source: IncomeSource): Promise<IncomeSource>;
  update(source: IncomeSource): Promise<IncomeSource>;
  remove(id: number): Promise<void>;
};

export function createIncomeService(client: Pick<IncomeService, keyof IncomeService>): IncomeService {
  return {
    list: taxYear => client.list(taxYear),
    create: source => client.create(source),
    update: source => client.update(source),
    remove: id => client.remove(id)
  };
}
