export type IncomeKind = 'SALARY' | 'HONORARIA' | 'BONUS' | 'OTHER';
export type IncomeSource = {
  id?: number;
  taxYear: number;
  active: boolean;
  name: string;
  kind: IncomeKind;
  amount: number;
  inputMode: 'GROSS' | 'NET';
  frequency: 'MONTHLY' | 'ANNUAL' | 'ONE_TIME';
  months: number;
  taxable: boolean;
  withholdingRate: number;
  afpName: string;
  afpCommissionRate: number | null;
  healthSystem: 'FONASA' | 'ISAPRE' | 'NONE';
  healthPlanAmount: number;
  contractType: 'INDEFINITE' | 'FIXED';
  apvRegime: 'NONE' | 'A' | 'B';
  apvPaymentMethod: 'PAYROLL' | 'DIRECT';
  apvMonthly: number;
  notes: string;
};

export type Settings = Record<string, string | number | boolean> & {
  year: number;
  ufValue: number;
  utmValue: number;
  honorariosRetentionRate: number;
  honorariosExpenseMethod: 'PRESUMED' | 'ACTUAL';
  honorariosActualAnnualExpenses: number;
  feeRecognitionMode: 'ISSUE_DATE' | 'PAID_ONLY';
  mortgageInterestMaxUta: number;
  mortgageFullBenefitIncomeMaxUta: number;
  mortgagePartialBenefitIncomeMaxUta: number;
  mortgagePartialFormulaConstant: number;
  mortgagePartialFormulaFactor: number;
};

export type AnnualResult = {
  totalTaxableIncome: number;
  payrollApvContribution: number;
  directApvContribution: number;
  totalApvRegimeBContribution: number;
  finalTaxableBase: number;
  estimatedAnnualTax: number;
  totalWithholdings: number;
  estimatedBalance: number;
};

export type Simulation = {
  annualResult: AnnualResult;
  totals: Record<string, number | string>;
  components: Record<string, number>;
  salaryBreakdown: Array<Record<string, number | string>>;
  warnings: string[];
  feeSummary?: FeeSummary | null;
  mortgageSummary?: MortgageBenefit | null;
  explanations: CalculationExplanation[];
  audit: { generatedAt: string; taxYear: number; ruleVersion: string };
};

export type CalculationUnit = 'CLP' | 'UF' | 'UTM' | 'UTA' | 'PERCENT' | 'MONTHS' | 'NONE';
export type CalculationOrigin = 'USER_INPUT' | 'DERIVED' | 'TAX_CONFIGURATION' | 'OFFICIAL_SOURCE' | 'SYSTEM_DEFAULT';
export type CalculationExplanation = {
  key: string;
  title: string;
  shortDescription: string;
  detailedDescription?: string;
  formulaLabel?: string;
  formulaExpression?: string;
  appliedExpression?: string;
  inputs: { key: string; label: string; value: number | string | boolean | null; formattedValue: string; unit?: CalculationUnit; description?: string; origin: CalculationOrigin }[];
  steps?: { order: number; label: string; description?: string; expression?: string; appliedExpression?: string; result?: number; formattedResult?: string }[];
  result: { label: string; value: number | string | boolean | null; formattedValue: string; interpretation?: string };
  rounding?: { method: 'ROUND' | 'FLOOR' | 'CEIL' | 'TRUNCATE' | 'NONE'; decimals: number; stage: 'EACH_STEP' | 'FINAL_RESULT'; description: string };
  assumptions?: string[];
  warnings?: string[];
  taxYear?: number;
  ruleVersion?: string;
  sourceRefs?: string[];
  generatedAt?: string;
};

export type SimulationAuditExport = {
  simulationId: string;
  generatedAt: string;
  taxYear: number;
  ruleVersion: string;
  inputs: unknown;
  results: unknown;
  explanations: CalculationExplanation[];
  sources: unknown[];
};

export type Reference = { id: number; authority: string; title: string; url: string; appliesTo: string };

export type ExecutionLog = {
  id: number;
  kind: 'SYNC' | 'ASYNC';
  operation: string;
  status: 'OK' | 'ERROR';
  message?: string | null;
  auditMessage?: string | null;
  durationMs: number;
  createdAt: string;
};

export type ExecutionLogPage = {
  items: ExecutionLog[];
  total: number;
  page: number;
  pageSize: number;
};

export type WithholdingMode = 'WITHHELD_BY_RECIPIENT' | 'PPM_PAID_BY_ISSUER' | 'NO_WITHHOLDING';

export type FeeReceipt = {
  id?: string;
  taxYear: number;
  issueDate: string;
  folio?: string | null;
  clientName: string;
  clientTaxId?: string | null;
  description?: string | null;
  amountInputType: 'GROSS' | 'NET';
  grossAmount: number;
  netAmount: number;
  withholdingMode: WithholdingMode;
  withholdingRate: number;
  withheldAmount: number;
  ppmPaidAmount: number;
  taxable: boolean;
  status: 'ACTIVE' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID';
  paymentDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FeeReceiptComputed = Pick<FeeReceipt, 'grossAmount' | 'netAmount' | 'withheldAmount' | 'ppmPaidAmount' | 'withholdingRate'>;

export type FeeSummary = {
  recognitionMode: 'ISSUE_DATE' | 'PAID_ONLY';
  utaValue: number;
  totalGrossIssued: number;
  totalGrossPaid: number;
  grossPaidByWithholdingMode: Record<WithholdingMode, number>;
  totalWithheldByThirds: number;
  totalPPMPaidByIssuer: number;
  totalNetReceived: number;
  activeCount: number;
  pendingCount: number;
  cancelledCount: number;
  recognizedGrossForTax: number;
  recognizedWithheldForTax: number;
  recognizedPPMForTax: number;
  recognizedNetForTax: number;
};

export type FeeExpenseSettings = {
  id?: string;
  taxYear: number;
  expenseMode: 'PRESUMED' | 'ACTUAL';
  actualAnnualExpenses: number;
  notes?: string | null;
};

export type MortgagePurpose = 'PURCHASE' | 'CONSTRUCTION' | 'REFINANCING_ELIGIBLE_LOAN';
export type OwnershipType = 'SOLE_OWNER' | 'CO_OWNERSHIP' | 'SPOUSAL_COMMUNITY';

export type MortgageLoan = {
  id?: string;
  taxYear: number;
  institutionName: string;
  institutionTaxId?: string | null;
  operationNumber?: string | null;
  propertyAlias: string;
  propertyAddress?: string | null;
  propertyRole?: string | null;
  purpose: MortgagePurpose;
  ownershipType: OwnershipType;
  ownershipPercentage: number;
  isDesignatedBeneficiary: boolean;
  originalPrincipal?: number | null;
  outstandingPrincipal?: number | null;
  monthlyPayment?: number | null;
  annualInterestPaid: number;
  annualPrincipalPaid?: number | null;
  annualInsurancePaid?: number | null;
  annualOtherCharges?: number | null;
  certificateReference?: string | null;
  certificateDate?: string | null;
  eligibleForArticle55Bis: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MortgageAnnualRecord = {
  id?: string;
  mortgageLoanId?: string;
  taxYear: number;
  interestPaid: number;
  principalPaid?: number | null;
  insurancePaid?: number | null;
  otherCharges?: number | null;
  certificateReference?: string | null;
  certificateDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MortgageBenefit = {
  incomeEstimate: number;
  incomeUta: number;
  bracket: 'FULL' | 'PARTIAL' | 'EXCLUDED';
  applicablePercentage: number;
  totalInterestPaid: number;
  eligibleInterest: number;
  capInterest: number;
  baseDeductibleInterest: number;
  rejectedInterestOverCap: number;
  deduction: number;
  included: { loanId: string; propertyAlias: string; interest: number; eligibleInterestForLoan: number; exclusions: string[] }[];
  excluded: { loanId: string; propertyAlias: string; interest: number; reasons: string[] }[];
  principalPaidTotal: number;
  insurancePaidTotal: number;
  otherChargesTotal: number;
  warnings: { loanId: string; message: string }[];
  formula: {
    constant: number;
    factor: number;
    fullMaxUta: number;
    partialMaxUta: number;
    maxInterestUta: number;
  };
};

export type TaxParameter = { ruleKey: string; value: number | string; type: string; description: string | null; updatedAt: string };

export type TaxRuleSource = {
  id: string;
  ruleKey: string;
  taxYear: number;
  institution: string;
  title: string;
  sourceUrl: string;
  retrievedAt: string;
  notes?: string | null;
};

export type Scenario = {
  key: string;
  label: string;
  result: Simulation;
  liquidityCommitted: number;
  accumulatedPensionSaving: number;
  diff: number;
};
