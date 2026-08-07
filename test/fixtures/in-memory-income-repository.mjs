import { assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createInMemoryIncomeRepository() {
  let nextId = 1;
  const records = new Map();

  return {
    async list(context, taxYear) {
      assertWorkspaceContext(context);
      const all = [...records.values()];
      return taxYear == null ? all : all.filter(record => Number(record.taxYear) === Number(taxYear));
    },
    async get(context, id) {
      assertWorkspaceContext(context);
      return records.get(Number(id)) || null;
    },
    async create(context, input) {
      assertWorkspaceContext(context);
      const id = nextId++;
      const record = { ...input, id, taxYear: Number(input.taxYear) };
      records.set(id, record);
      return record;
    },
    async update(context, id, input) {
      assertWorkspaceContext(context);
      if (!records.has(Number(id))) return null;
      const record = { ...input, id: Number(id), taxYear: Number(input.taxYear) };
      records.set(Number(id), record);
      return record;
    },
    async remove(context, id) {
      assertWorkspaceContext(context);
      return records.delete(Number(id));
    },
    async copy(context, fromTaxYear, toTaxYear) {
      assertWorkspaceContext(context);
      const from = Number(fromTaxYear);
      const to = Number(toTaxYear);
      if (from === to) return [...records.values()].filter(record => Number(record.taxYear) === to);
      const destExists = [...records.values()].some(record => Number(record.taxYear) === to);
      if (destExists) return null;
      const copiedRecords = [];
      for (const record of records.values()) {
        if (Number(record.taxYear) !== from) continue;
        const id = nextId++;
        const copiedRecord = { ...record, id, taxYear: to };
        records.set(id, copiedRecord);
        copiedRecords.push(copiedRecord);
      }
      return copiedRecords;
    }
  };
}
