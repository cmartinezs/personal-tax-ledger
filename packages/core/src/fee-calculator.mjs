// Tax calculations for fee receipts (boletas de honorarios). Pure functions, no DB
// access. Pure module that depends only on parameters passed by the caller.
//
// Rounding strategy: amounts are stored as CLP rounded to 2 decimal places (centésimos)
// using "half away from zero" via Math.round. CLP in practice does not use cents but
// boletas sometimes carry decimal honourable fractions from cash desk UIs; we keep the
// 2-decimal rounding for accounting fidelity and format to 0 decimals at presentation.

import { round2, clamp } from './util.mjs';
import { TAX_PARAMETER_KEYS } from './tax-parameters.mjs';

// Compute gross/net/withholding/ppm from a single receipt given parameters for the year.
// Returns the canonical recomputed values, ignoring whatever the user provided for
// grossAmount/netAmount to keep the source of truth in the calculator.
export function computeFeeReceiptAmounts(receipt, params) {
  const rate = clamp(numParam(params, TAX_PARAMETER_KEYS.FEE_WITHHOLDING_RATE, receipt.withholdingRate), 0, 1);
  const withholdingMode = receipt.withholdingMode || 'WITHHELD_BY_RECIPIENT';

  if (receipt.amountInputType === 'NET') {
    // Solve for gross: gross = net / (1 - rate) when withheld by recipient.
    // For NO_WITHHOLDING or PPM_PAID_BY_ISSUER the user entering net is interpreted
    // as 'the net the client paid me', which equals gross when no withholding applies,
    // or equals gross minus PPM when the issuer pays PPM themselves.
    const netInput = Math.max(0, Number(receipt.netAmount) || 0);
    let gross;
    let retained = 0;
    let ppm = 0;
    if (withholdingMode === 'WITHHELD_BY_RECIPIENT') {
      gross = netInput / Math.max(0.0001, 1 - rate);
      retained = gross - netInput;
    } else if (withholdingMode === 'PPM_PAID_BY_ISSUER') {
      // The user wants net cash = netInput. PPM is paid separately by issuer.
      gross = netInput / Math.max(0.0001, 1 - rate);
      ppm = gross - netInput;
    } else {
      // NO_WITHHOLDING: gross = net.
      gross = netInput;
    }
    return {
      grossAmount: round2(gross),
      netAmount: round2(netInput),
      withheldAmount: round2(retained),
      ppmPaidAmount: round2(ppm),
      withholdingRate: rate
    };
  }

  // GROSS input
  const gross = Math.max(0, Number(receipt.grossAmount) || 0);
  let retained = 0;
  let ppm = 0;
  let effectiveRate = rate;
  if (withholdingMode === 'WITHHELD_BY_RECIPIENT') retained = gross * rate;
  else if (withholdingMode === 'PPM_PAID_BY_ISSUER') ppm = gross * rate;
  else effectiveRate = 0; // NO_WITHHOLDING: rate must be 0 for downstream consistency.
  const net = gross - retained;
  return {
    grossAmount: round2(gross),
    netAmount: round2(net),
    withheldAmount: round2(retained),
    ppmPaidAmount: round2(ppm),
    withholdingRate: effectiveRate
  };
}

// Returns the consolidated fee receipt totals for a given tax year, applying the
// recognition policy (ISSUE_DATE vs PAID_ONLY) and excluding CANCELLED receipts.
// `settings.feeRecognitionMode` controls the policy.
export function consolidateFeeReceipts(receipts, settings, params) {
  const utaValue = Number(settings.utmValue) * 12;
  const recognitionMode = settings.feeRecognitionMode === 'PAID_ONLY' ? 'PAID_ONLY' : 'ISSUE_DATE';

  let totalGrossIssued = 0; // gross of every ACTIVE receipt (regardless of payment status)
  let totalGrossPaid = 0;   // gross of receipts recognized under the active policy
  let totalWithheldByThirds = 0;
  let totalPPMPaidByIssuer = 0;
  let totalGrossNoWithholding = 0;
  let totalNetReceived = 0;  // net cash the user received when paid
  let activeCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;
  let recognizedGrossForTax = 0; // gross feed to taxable consolidation under recognition mode
  let recognizedWithheldForTax = 0;
  let recognizedPPMForTax = 0;
  let recognizedNetForTax = 0;
  const recognizedReceipts = [];

  for (const r of receipts || []) {
    if (r.status === 'CANCELLED') { cancelledCount += 1; continue; }
    activeCount += 1;
    if (r.paymentStatus === 'PENDING') pendingCount += 1;
    totalGrossIssued += r.grossAmount;
    if (r.paymentStatus === 'PAID') totalGrossPaid += r.grossAmount;
    if (r.withholdingMode === 'NO_WITHHOLDING') totalGrossNoWithholding += r.grossAmount;
    totalWithheldByThirds += r.withheldAmount;
    totalPPMPaidByIssuer += r.ppmPaidAmount;
    totalNetReceived += r.netAmount;

    if (recognitionMode === 'ISSUE_DATE') {
      recognizedReceipts.push(r);
    } else if (recognitionMode === 'PAID_ONLY' && r.paymentStatus === 'PAID') {
      recognizedReceipts.push(r);
    }
  }

  for (const r of recognizedReceipts) {
    if (r.taxable === false) continue;
    recognizedGrossForTax += r.grossAmount;
    recognizedWithheldForTax += r.withheldAmount;
    recognizedPPMForTax += r.ppmPaidAmount;
    recognizedNetForTax += r.netAmount;
  }

  return {
    recognitionMode,
    utaValue: round2(utaValue),
    totalGrossIssued: round2(totalGrossIssued),
    totalGrossPaid: round2(totalGrossPaid),
    grossPaidByWithholdingMode: {
      WITHHELD_BY_RECIPIENT: round2(receipts.filter(r => r.status === 'ACTIVE' && r.withholdingMode === 'WITHHELD_BY_RECIPIENT').reduce((s, r) => s + r.grossAmount, 0)),
      PPM_PAID_BY_ISSUER: round2(receipts.filter(r => r.status === 'ACTIVE' && r.withholdingMode === 'PPM_PAID_BY_ISSUER').reduce((s, r) => s + r.grossAmount, 0)),
      NO_WITHHOLDING: round2(totalGrossNoWithholding)
    },
    totalWithheldByThirds: round2(totalWithheldByThirds),
    totalPPMPaidByIssuer: round2(totalPPMPaidByIssuer),
    totalNetReceived: round2(totalNetReceived),
    activeCount,
    pendingCount,
    cancelledCount,
    recognizedGrossForTax: round2(recognizedGrossForTax),
    recognizedWithheldForTax: round2(recognizedWithheldForTax),
    recognizedPPMForTax: round2(recognizedPPMForTax),
    recognizedNetForTax: round2(recognizedNetForTax)
  };
}

// Computes the accepted fee expense following the annual settings.
// PRESUMED: min(gross * rate, cap_uta * uta). On ACTUAL, the user provides a number,
// we clamp it to a maximum of gross and a minimum of zero.
export function computeAcceptedFeeExpense(grossHonorarios, settings, params) {
  const mode = settings.honorariosExpenseMethod === 'ACTUAL' ? 'ACTUAL' : 'PRESUMED';
  const utaValue = Number(settings.utmValue) * 12;
  if (mode === 'ACTUAL') {
    const declared = Math.max(0, Number(settings.honorariosActualAnnualExpenses) || 0);
    return {
      mode,
      acceptedExpense: round2(Math.min(declared, Math.max(0, grossHonorarios))),
      warning: 'Gastos efectivos requieren respaldo documental. Deben acreditarse ante el SII.'
    };
  }
  const rate = numParam(params, TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_RATE, settings.honorariosPresumedExpenseRate);
  const capUta = numParam(params, TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_MAX_UTA, settings.honorariosPresumedExpenseCapUta);
  const presumed = grossHonorarios * rate;
  const capped = capUta * utaValue;
  return {
    mode,
    acceptedExpense: round2(Math.min(presumed, capped)),
    warning: null
  };
}

function numParam(params, key, fallback) {
  if (params && key in params && params[key] != null) return Number(params[key]);
  if (fallback != null) return Number(fallback);
  return 0;
}
