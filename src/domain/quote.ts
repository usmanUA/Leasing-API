// src/domain/quote.ts

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
    monthlyPayment: Money;
    totalPayments: Money;
    totalInterest: Money;
    totalFee: Money;
    schedule: Installment[];
}

export class QuoteCalculationError extends Error {
    constructor(message: string) {
	super(message);
	this.name = 'QuoteCalculationError';
    }
}
