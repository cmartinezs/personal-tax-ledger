export type WorkspaceContext = { workspaceId: string; actorId: string };
export type IncomeSourceRecord = Record<string, unknown> & { id?: number; taxYear: number; name: string; kind: string; amount: number };
export interface IncomeSourceRepository {
  list(context: WorkspaceContext, taxYear?: number): Promise<IncomeSourceRecord[]>;
  get(context: WorkspaceContext, id: number): Promise<IncomeSourceRecord | null>;
  create(context: WorkspaceContext, input: IncomeSourceRecord): Promise<IncomeSourceRecord>;
  update(context: WorkspaceContext, id: number, input: IncomeSourceRecord): Promise<IncomeSourceRecord | null>;
  remove(context: WorkspaceContext, id: number): Promise<boolean>;
  copy(context: WorkspaceContext, fromTaxYear: number, toTaxYear: number): Promise<IncomeSourceRecord[] | null>;
}
export const LOCAL_WORKSPACE_CONTEXT: WorkspaceContext;
export const INCOME_REPOSITORY_METHODS: readonly string[];
export function assertWorkspaceContext(context: unknown): WorkspaceContext;
export function assertIncomeRepositoryContract(repository: unknown): IncomeSourceRepository;

export type SettingsRecord = Record<string, unknown> & { year: number };
export interface SettingsRepository {
  get(context: WorkspaceContext): Promise<SettingsRecord>;
  update(context: WorkspaceContext, data: SettingsRecord): Promise<SettingsRecord>;
}
export const SETTINGS_REPOSITORY_METHODS: readonly string[];
export function assertSettingsRepositoryContract(repository: unknown): SettingsRepository;

export type ExecutionLogEntry = {
  kind: 'SYNC' | 'ASYNC';
  operation: string;
  status: 'OK' | 'ERROR';
  message?: string | null;
  auditMessage?: string | null;
  durationMs?: number;
};
export type ExecutionLogRecord = ExecutionLogEntry & { id: number; createdAt: string };
export type ExecutionLogFilters = { kind?: string; status?: string; operation?: string; q?: string; page?: number | string; pageSize?: number | string };
export type ExecutionLogPage = { items: ExecutionLogRecord[]; total: number; page: number; pageSize: number };
export interface ExecutionLogRepository {
  create(context: WorkspaceContext, entry: ExecutionLogEntry): Promise<ExecutionLogRecord>;
  list(context: WorkspaceContext, filters?: ExecutionLogFilters): Promise<ExecutionLogPage>;
}
export const EXECUTION_LOG_REPOSITORY_METHODS: readonly string[];
export function assertExecutionLogRepositoryContract(repository: unknown): ExecutionLogRepository;

export type FeeReceiptRecord = Record<string, unknown> & { id?: string; taxYear: number; clientName: string };
export type FeeReceiptFilters = { taxYear?: number | string; clientName?: string; status?: string; paymentStatus?: string; withholdingMode?: string };
export interface FeeReceiptRepository {
  list(context: WorkspaceContext, filters?: FeeReceiptFilters): Promise<FeeReceiptRecord[]>;
  get(context: WorkspaceContext, id: string): Promise<FeeReceiptRecord | null>;
  create(context: WorkspaceContext, input: FeeReceiptRecord): Promise<FeeReceiptRecord>;
  update(context: WorkspaceContext, id: string, input: FeeReceiptRecord): Promise<FeeReceiptRecord | null>;
  remove(context: WorkspaceContext, id: string): Promise<boolean>;
  duplicate(context: WorkspaceContext, id: string): Promise<FeeReceiptRecord | null>;
}
export const FEE_RECEIPT_REPOSITORY_METHODS: readonly string[];
export function assertFeeReceiptRepositoryContract(repository: unknown): FeeReceiptRepository;

export type FeeExpenseSettingsRecord = Record<string, unknown> & { id?: string; taxYear: number };
export interface FeeExpenseSettingsRepository {
  list(context: WorkspaceContext): Promise<FeeExpenseSettingsRecord[]>;
  get(context: WorkspaceContext, taxYear: number): Promise<FeeExpenseSettingsRecord | null>;
  upsert(context: WorkspaceContext, taxYear: number, data: FeeExpenseSettingsRecord): Promise<FeeExpenseSettingsRecord>;
}
export const FEE_EXPENSE_SETTINGS_REPOSITORY_METHODS: readonly string[];
export function assertFeeExpenseSettingsRepositoryContract(repository: unknown): FeeExpenseSettingsRepository;
