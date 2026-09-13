export type WorkspaceContext = { workspaceId: string; actorId: string };
export type AnnualWorkspaceContext = WorkspaceContext & { annualWorkspaceId: string; commercialYear: number };
export type ResolveActiveAnnualContext = () => Promise<AnnualWorkspaceContext>;
type AsyncUseCase = (...args: unknown[]) => Promise<unknown>;
type YearScopedOptions = { repository: unknown; resolveActiveContext?: ResolveActiveAnnualContext };

export function createIncomeUseCases(options: YearScopedOptions): Record<string, AsyncUseCase>;
export function createSettingsUseCases(options: { repository: unknown }): Record<string, AsyncUseCase>;
export function createExecutionLogUseCases(options: YearScopedOptions): Record<string, AsyncUseCase>;
export function createFeeReceiptUseCases(options: YearScopedOptions): Record<string, AsyncUseCase>;
export function createFeeExpenseSettingsUseCases(options: YearScopedOptions): Record<string, AsyncUseCase>;
export function createMortgageUseCases(options: YearScopedOptions): Record<string, AsyncUseCase>;
export function createMortgageAnnualRecordUseCases(options: YearScopedOptions): Record<string, AsyncUseCase>;
export function createTaxParameterUseCases(options: { repository: unknown }): Record<string, AsyncUseCase>;
export function createTaxRuleSourceUseCases(options: { repository: unknown }): Record<string, AsyncUseCase>;
export function createReferenceUseCases(options: { repository: unknown }): Record<string, AsyncUseCase>;
export function createYearUseCases(options: { repository: unknown }): Record<string, AsyncUseCase>;
export function createSnapshotUseCases(options: { repository: unknown }): Record<string, AsyncUseCase>;
export function createSystemUseCases(options: Record<string, unknown>): Record<string, AsyncUseCase>;
export function createAnnualWorkspaceUseCases(options: { repository: unknown }): Record<string, AsyncUseCase>;
export function createAnnualWorkspaceFlowUseCases(options: {
  repository: unknown;
  settingsUseCases: Record<string, AsyncUseCase>;
  supportedYearPolicyUseCases: Record<string, AsyncUseCase>;
  now?: () => string;
}): Record<string, AsyncUseCase>;
export function createActiveAnnualWorkspaceContextResolver(options: {
  settingsRepository: unknown;
  annualWorkspaceRepository: unknown;
  baseContext: WorkspaceContext;
}): ResolveActiveAnnualContext;
export function createSupportedYearPolicyUseCases(options: {
  taxParameterRepository: unknown;
  taxRuleSourceRepository: unknown;
  requiredRuleKeys?: readonly string[];
}): Record<string, AsyncUseCase>;
export function createTaxApplicabilityProfileUseCases(options: {
  repository: unknown;
  resolveActiveContext?: ResolveActiveAnnualContext;
  now?: () => string;
}): Record<string, AsyncUseCase>;
export const TAX_APPLICABILITY_REVIEW_STATE: Readonly<{ OK: 'OK'; PENDING: 'PENDING'; NEEDS_REVIEW: 'NEEDS_REVIEW' }>;
export const TAX_FACT_PRESENCE: Readonly<{ PRESENT: 'PRESENT'; NOT_PRESENT: 'NOT_PRESENT'; UNAVAILABLE: 'UNAVAILABLE' }>;
export function createTaxApplicabilityProfileReviewUseCases(options: {
  profileUseCases: Record<string, AsyncUseCase>;
  readCanonicalFactPresence: (context: AnnualWorkspaceContext) => Promise<Record<string, string>>;
}): Record<string, AsyncUseCase>;
