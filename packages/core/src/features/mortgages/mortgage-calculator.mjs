// Article 55 bis of the Chilean Income Tax Law (Ley sobre Impuesto a la Renta).
// Pure functions, parametrised by tax year. No DB access, no React coupling.
//
// Pipeline followed by the integration engine:
//   1) Sum eligible interests paid in the year across every eligible mortgage.
//   2) Cap the deductible base at mortgage_interest_max_uta (8 UTA for 2026).
//   3) Look up the income in UTA to pick the percentage that applies:
//      - < full_benefit_income_max_uta (90 UTA): 100%
//      - between 90 and 150 UTA: percentage = constant - factor * renta_uta
//        clamped to [0, 100]
//      - > partial_benefit_income_max_uta (150 UTA): 0%
//   4) The base deduction is `monto_base_deducible * percentage / 100`.
//
// IMPORTANT: the engine does NOT compute the marginal tax saving. The annual
// simulation pipeline recomputes Global Complementario with and without the
// deduction and the difference is the real tax saving. This module only reports
// the deduction amount and the rich diagnostics the UI needs.

import { round2, clamp } from '../../shared/util.mjs';
import { TAX_PARAMETER_KEYS } from '../taxation/tax-parameters.mjs';

function numParam(params, key, fallback) {
  if (params && key in params && params[key] != null) return Number(params[key]);
  return Number(fallback || 0);
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : Number(fallback) || 0;
}

// Determine if a loan should be considered eligible after structural checks.
// We separate this from the user-defined `eligibleForArticle55Bis` flag so the
// caller can surface WHY a loan was excluded (e.g., co-ownership without
// beneficiary designation is a soft warning, not a hard exclusion).
export function evaluateLoanEligibility(loan) {
  const reasons = [];
  if (!loan.eligibleForArticle55Bis) reasons.push('El crédito fue marcado como no elegible para el artículo 55 bis.');
  if (loan.ownershipType === 'CO_OWNERSHIP' && !loan.isDesignatedBeneficiary) {
    reasons.push('Copropiedad sin designacion de beneficiario: la rebaja por este crédito debe refrendarse con la documentación del banco.');
  }
  if (loan.purpose === 'REFINANCING_ELIGIBLE_LOAN') {
    reasons.push('Refinanciamiento: solo se admite si el crédito original financiaba una vivienda DFL2; verifique la elegibilidad original.');
  }
  return {
    eligible: loan.eligibleForArticle55Bis,
    warnings: reasons
  };
}

// Compute the article 55 bis benefit for a single loan given its annual
// interest record and the loan ownership percentage. The parameter `applyOwnership`
// controls whether to scale interest by ownership percentage (we keep it separate
// from the eligibility check to enable future rules).
// When no annual record is supplied, the loan header fields (annualInterestPaid,
// annualPrincipalPaid, ...) are used as fallback so the benefit never silently
// drops to zero for a loan that reported its annual values.
export function loanEligibleInterest(loan, annualRecord, applyOwnership = false) {
  if (!loan.eligibleForArticle55Bis) return { interest: 0, principal: 0, insurance: 0, other: 0 };
  const hasRecord = Boolean(annualRecord);
  const interest = Math.max(0, num(hasRecord ? annualRecord.interestPaid : loan.annualInterestPaid, 0));
  const principal = Math.max(0, num(hasRecord ? annualRecord.principalPaid : loan.annualPrincipalPaid, 0));
  const insurance = Math.max(0, num(hasRecord ? annualRecord.insurancePaid : loan.annualInsurancePaid, 0));
  const other = Math.max(0, num(hasRecord ? annualRecord.otherCharges : loan.annualOtherCharges, 0));
  // Only the interest qualifies. Capital, insurance, common expenses and
  // bank fees are explicitly NOT deductible (art. 55 bis LIR).
  let effectiveInterest = interest;
  if (applyOwnership) effectiveInterest = interest * clamp(loan.ownershipPercentage, 0, 1);
  return {
    interest: round2(effectiveInterest),
    principal: round2(principal),
    insurance: round2(insurance),
    other: round2(other)
  };
}

// Compute the article 55 bis benefit across all loans.
// `incomeEstimate` is the annual gross taxable income expressed in CLP (renta bruta
// imponible anual). The function converts it to UTA using utaValue = utm * 12.
//
// Returns:
//   baseDeductibleInterest: clamped to mortgage_interest_max_uta
//   applicablePercentage:   0..100
//   deduction:              baseDeductibleInterest * percentage / 100
//   totalInterestPaid, eligibleInterest, excludedLoans, warnings
export function computeArticle55BisBenefit(loans, annualRecords, context, params) {
  const uta = Math.max(1, Number(context?.utaValue) || 1);
  const income = Math.max(0, Number(context?.incomeEstimate) || 0);
  const incomeUta = income / uta;

  const maxInterestUta = numParam(params, TAX_PARAMETER_KEYS.MORTGAGE_INTEREST_MAX_UTA, 8);
  const fullMaxUta = numParam(params, TAX_PARAMETER_KEYS.MORTGAGE_FULL_BENEFIT_INCOME_MAX_UTA, 90);
  const partialMaxUta = numParam(params, TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_BENEFIT_INCOME_MAX_UTA, 150);
  const constant = numParam(params, TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_CONSTANT, 250);
  const factor = numParam(params, TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_FACTOR, 1.667);

  let totalInterestPaid = 0;
  let eligibleInterest = 0;
  let totalPrincipal = 0;
  let totalInsurance = 0;
  let totalOther = 0;
  const included = [];
  const excluded = [];
  const warnings = [];

  for (const loan of loans || []) {
    const evaluation = evaluateLoanEligibility(loan);
    const record = (annualRecords || []).find(r => r.mortgageLoanId === loan.id);
    // Prefer the annual record (canonical source); fall back to the loan header
    // fields when no record exists so the benefit never drops to zero for a loan
    // that reported its annual values (e.g. via the dividend schedule widget).
    const hasRecord = Boolean(record);
    const interest = round2(Math.max(0, num(hasRecord ? record.interestPaid : loan.annualInterestPaid, 0)));
    totalInterestPaid += interest;
    totalPrincipal += round2(Math.max(0, num(hasRecord ? record.principalPaid : loan.annualPrincipalPaid, 0)));
    totalInsurance += round2(Math.max(0, num(hasRecord ? record.insurancePaid : loan.annualInsurancePaid, 0)));
    totalOther += round2(Math.max(0, num(hasRecord ? record.otherCharges : loan.annualOtherCharges, 0)));
    const eligibleInterestForLoan = loan.eligibleForArticle55Bis ? interest : 0;
    eligibleInterest += eligibleInterestForLoan;
    if (loan.eligibleForArticle55Bis) {
      included.push({ loanId: loan.id, propertyAlias: loan.propertyAlias, interest, eligibleInterestForLoan, exclusions: evaluation.warnings });
      if (evaluation.warnings.length) warnings.push(...evaluation.warnings.map(w => ({ loanId: loan.id, message: w })));
    } else {
      excluded.push({
        loanId: loan.id,
        propertyAlias: loan.propertyAlias,
        interest,
        reasons: evaluation.warnings.length ? evaluation.warnings : ['Crédito no elegible para el artículo 55 bis.']
      });
    }
  }

  // Cap the deductible base at 8 UTA. The cap is applied to the sum across loans
  // before computing the percentage (the article treats borrower globally).
  const capInterest = maxInterestUta * uta;
  const baseDeductibleInterest = round2(Math.min(eligibleInterest, capInterest));
  const rejectedInterestOverCap = round2(Math.max(0, eligibleInterest - capInterest));

  // Percentage bracket
  let applicablePercentage;
  let bracket;
  if (incomeUta < fullMaxUta) {
    applicablePercentage = 100;
    bracket = 'FULL';
  } else if (incomeUta >= fullMaxUta && incomeUta <= partialMaxUta) {
    bracket = 'PARTIAL';
    const raw = constant - factor * incomeUta;
    applicablePercentage = clamp(round2(raw), 0, 100);
  } else {
    applicablePercentage = 0;
    bracket = 'EXCLUDED';
  }

  // At exactly 90 UTA the partial formula yields (250 - 1.667*90) = 100.03 (rounded
  // to 100.03 then clamped to 100). We keep the discrete branches for explicitness
  // and tests but surface the computed percentage in the diagnostics.

  const deduction = round2(baseDeductibleInterest * applicablePercentage / 100);

  return {
    incomeEstimate: round2(income),
    incomeUta: round2(incomeUta),
    bracket,
    applicablePercentage: round2(applicablePercentage),
    totalInterestPaid: round2(totalInterestPaid),
    eligibleInterest: round2(eligibleInterest),
    capInterest: round2(capInterest),
    baseDeductibleInterest,
    rejectedInterestOverCap,
    deduction,
    included,
    excluded,
    principalPaidTotal: round2(totalPrincipal),
    insurancePaidTotal: round2(totalInsurance),
    otherChargesTotal: round2(totalOther),
    warnings,
    formula: {
      constant,
      factor,
      fullMaxUta,
      partialMaxUta,
      maxInterestUta
    }
  };
}
