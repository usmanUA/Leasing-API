import { Money } from "./lease";
import { Installment } from "./payment";

export type QuoteInput = {
    price: Money;
    termMonths: number;
    nominalRatePct: number;
    upfrontFee: Money;
    monthlyFee: Money;
};

export type Quote = {
    monthlyPayment: number;
    totalPayments: Money;
    totalInterest: number;
    schedule: Installment[];
    totalFee: number;
}
