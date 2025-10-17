import { Installment } from "./payment";

export type Money = number;


export type LeaseInput = {
    companyId: string;
    itemId: string;
    price: Money;
    termMonths: number;
    nominalRatePct: number;
    startDate: string; // ISO Date string
    upfrontFee: Money;
    monthlyFee: Money;
};

export type Lease = LeaseInput & {
    id: string;
    createdAt: string; // ISO Date string
    schedule: Installment[];
    totals: { totalPayments: Money; totalInterest: Money; totalFees: Money};
};
