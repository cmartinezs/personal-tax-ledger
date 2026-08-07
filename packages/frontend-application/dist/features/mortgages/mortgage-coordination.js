export function sanitizeMortgageLoan(loan) {
    return {
        ...loan,
        institutionName: loan.institutionName.trim(),
        propertyAlias: loan.propertyAlias.trim(),
        originalPrincipal: loan.originalPrincipal === null || loan.originalPrincipal == null ? null : Math.max(0, Number(loan.originalPrincipal)),
        outstandingPrincipal: loan.outstandingPrincipal === null || loan.outstandingPrincipal == null ? null : Math.max(0, Number(loan.outstandingPrincipal)),
        monthlyPayment: loan.monthlyPayment === null || loan.monthlyPayment == null ? null : Math.max(0, Number(loan.monthlyPayment)),
        annualInterestPaid: Math.max(0, Number(loan.annualInterestPaid) || 0),
        annualPrincipalPaid: loan.annualPrincipalPaid === null || loan.annualPrincipalPaid == null ? null : Math.max(0, Number(loan.annualPrincipalPaid)),
        annualInsurancePaid: loan.annualInsurancePaid === null || loan.annualInsurancePaid == null ? null : Math.max(0, Number(loan.annualInsurancePaid)),
        annualOtherCharges: loan.annualOtherCharges === null || loan.annualOtherCharges == null ? null : Math.max(0, Number(loan.annualOtherCharges))
    };
}
export function annualRecordsByLoan(loanId, records) {
    return records.filter(r => r.mortgageLoanId === loanId).sort((a, b) => (b.taxYear || 0) - (a.taxYear || 0));
}
export function findAnnualInterest(loanId, records) {
    return records.find(r => r.mortgageLoanId === loanId)?.interestPaid || 0;
}
const round2 = (n) => Math.round(n * 100) / 100;
export function buildDividendSchedule({ initialBalance, annualRate, dividends }) {
    const monthlyRate = Math.max(0, Number(annualRate) || 0) / 100 / 12;
    let saldo = Number(initialBalance);
    const rows = dividends.map((div, i) => {
        const d = Math.max(0, Number(div) || 0);
        let interest = 0;
        let principal = 0;
        if (d > 0 && saldo > 0) {
            interest = round2(Math.min(d, saldo * monthlyRate));
            principal = round2(Math.max(0, d - interest));
            saldo = round2(saldo - principal);
        }
        return { month: i, dividend: d, interest, principal, balance: saldo };
    });
    const totals = rows.reduce((acc, r) => ({
        dividend: acc.dividend + r.dividend,
        interest: acc.interest + r.interest,
        principal: acc.principal + r.principal
    }), { dividend: 0, interest: 0, principal: 0 });
    const paidMonths = rows.filter(r => r.dividend > 0).length;
    return { rows, totals, paidMonths, finalBalance: saldo };
}
