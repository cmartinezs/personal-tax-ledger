export type MortgageLoanInput = {
    id?: string;
    institutionName: string;
    propertyAlias: string;
    originalPrincipal?: number | null;
    outstandingPrincipal?: number | null;
    monthlyPayment?: number | null;
    annualInterestPaid: number;
    annualPrincipalPaid?: number | null;
    annualInsurancePaid?: number | null;
    annualOtherCharges?: number | null;
};
export declare function sanitizeMortgageLoan<T extends MortgageLoanInput>(loan: T): T;
export type AnnualRecordLike = {
    mortgageLoanId?: string;
    taxYear: number;
    interestPaid: number;
};
export declare function annualRecordsByLoan<T extends AnnualRecordLike>(loanId: string, records: T[]): T[];
export declare function findAnnualInterest(loanId: string, records: AnnualRecordLike[]): number;
export type DividendScheduleInput = {
    initialBalance: number;
    annualRate: number;
    dividends: (number | null)[];
};
export type DividendSchedule = {
    rows: {
        month: number;
        dividend: number;
        interest: number;
        principal: number;
        balance: number;
    }[];
    totals: {
        dividend: number;
        interest: number;
        principal: number;
    };
    paidMonths: number;
    finalBalance: number;
};
export declare function buildDividendSchedule({ initialBalance, annualRate, dividends }: DividendScheduleInput): DividendSchedule;
