export type WorkspaceContext = { workspaceId: string; actorId: string };
export type IncomeSourceRecord = Record<string, unknown> & { id?: number; taxYear: number; name: string; kind: string; amount: number };
export interface IncomeSourceRepository {
  list(context: WorkspaceContext, taxYear?: number): Promise<IncomeSourceRecord[]>;
  get(context: WorkspaceContext, id: number): Promise<IncomeSourceRecord | null>;
  create(context: WorkspaceContext, input: IncomeSourceRecord): Promise<IncomeSourceRecord>;
  update(context: WorkspaceContext, id: number, input: IncomeSourceRecord): Promise<IncomeSourceRecord | null>;
  remove(context: WorkspaceContext, id: number): Promise<boolean>;
}

export function incomeSourceRepositoryContract(
  createRepository: () => Promise<IncomeSourceRepository> | IncomeSourceRepository,
  createContext: () => WorkspaceContext
): Promise<void>;
