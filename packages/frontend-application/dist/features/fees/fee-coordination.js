export function computeFeeReceiptPreview(receipt, settings) {
    const rate = Number(receipt.withholdingRate) || Number(settings.honorariosRetentionRate) || 0;
    if (receipt.amountInputType === 'NET') {
        const net = Math.max(0, Number(receipt.netAmount) || 0);
        if (receipt.withholdingMode === 'WITHHELD_BY_RECIPIENT' && rate > 0) {
            const gross = net / (1 - rate);
            return { grossAmount: gross, netAmount: net, withholdingRate: rate, withheldAmount: gross - net, ppmPaidAmount: 0 };
        }
        if (receipt.withholdingMode === 'PPM_PAID_BY_ISSUER' && rate > 0) {
            const gross = net / (1 - rate);
            return { grossAmount: gross, netAmount: net, withholdingRate: rate, withheldAmount: 0, ppmPaidAmount: gross - net };
        }
        return { grossAmount: net, netAmount: net, withholdingRate: 0, withheldAmount: 0, ppmPaidAmount: 0 };
    }
    const gross = Math.max(0, Number(receipt.grossAmount) || 0);
    if (receipt.withholdingMode === 'WITHHELD_BY_RECIPIENT')
        return { grossAmount: gross, netAmount: gross - gross * rate, withholdingRate: rate, withheldAmount: gross * rate, ppmPaidAmount: 0 };
    if (receipt.withholdingMode === 'PPM_PAID_BY_ISSUER')
        return { grossAmount: gross, netAmount: gross, withholdingRate: rate, withheldAmount: 0, ppmPaidAmount: gross * rate };
    return { grossAmount: gross, netAmount: gross, withholdingRate: 0, withheldAmount: 0, ppmPaidAmount: 0 };
}
export function computeFeeSummary(receipts, settings) {
    let totalGrossIssued = 0, totalGrossPaid = 0;
    let totalWithheld = 0, totalPPM = 0, noWithholdingGross = 0, totalNet = 0;
    let activeCount = 0, pendingCount = 0, cancelledCount = 0;
    for (const r of receipts) {
        if (r.status === 'CANCELLED') {
            cancelledCount += 1;
            continue;
        }
        activeCount += 1;
        if (r.paymentStatus === 'PENDING')
            pendingCount += 1;
        totalGrossIssued += Number(r.grossAmount) || 0;
        if (r.paymentStatus === 'PAID')
            totalGrossPaid += Number(r.grossAmount) || 0;
        if (r.withholdingMode === 'NO_WITHHOLDING')
            noWithholdingGross += Number(r.grossAmount) || 0;
        totalWithheld += Number(r.withheldAmount) || 0;
        totalPPM += Number(r.ppmPaidAmount) || 0;
        totalNet += Number(r.netAmount) || 0;
    }
    return {
        recognitionMode: settings.feeRecognitionMode || 'ISSUE_DATE',
        utaValue: 0,
        totalGrossIssued, totalGrossPaid, totalWithheldByThirds: totalWithheld, totalPPMPaidByIssuer: totalPPM,
        totalNetReceived: totalNet, activeCount, pendingCount, cancelledCount,
        grossPaidByWithholdingMode: {
            WITHHELD_BY_RECIPIENT: receipts.filter(r => r.status === 'ACTIVE' && r.withholdingMode === 'WITHHELD_BY_RECIPIENT').reduce((s, r) => s + Number(r.grossAmount || 0), 0),
            PPM_PAID_BY_ISSUER: receipts.filter(r => r.status === 'ACTIVE' && r.withholdingMode === 'PPM_PAID_BY_ISSUER').reduce((s, r) => s + Number(r.grossAmount || 0), 0),
            NO_WITHHOLDING: noWithholdingGross
        },
        recognizedGrossForTax: 0, recognizedWithheldForTax: 0, recognizedPPMForTax: 0, recognizedNetForTax: 0
    };
}
export function filterFeeReceipts(receipts, filters, sortBy) {
    let list = receipts.slice();
    if (filters.clientName)
        list = list.filter(r => r.clientName?.toLowerCase().includes(filters.clientName.toLowerCase()));
    if (filters.status)
        list = list.filter(r => r.status === filters.status);
    if (filters.paymentStatus)
        list = list.filter(r => r.paymentStatus === filters.paymentStatus);
    if (filters.withholdingMode)
        list = list.filter(r => r.withholdingMode === filters.withholdingMode);
    if (sortBy === 'date')
        list.sort((a, b) => (a.issueDate || '').localeCompare(b.issueDate || ''));
    else
        list.sort((a, b) => (Number(b.grossAmount) || 0) - (Number(a.grossAmount) || 0));
    return list;
}
