// src/application/quote-service.ts

import { calculateInstallmentSchedule } from "./lease-service";
import { QuoteInput, Quote, QuoteCalculationError } from "@/domain/quote";
import { Installment } from "@/domain/payment";
import { Money } from "@/domain/lease";


export function calculateQuote(input: QuoteInput): Quote {

    if (input.termMonths === 0) {
	throw new QuoteCalculationError('Term months must be greate than zero');
    }

    const schedule: Installment[] = calculateInstallmentSchedule({
	...input,
	companyId: "quote",
	itemId: "quote",
	startDate: new Date().toISOString().split("T")[0]
    });

    if (schedule.length === 0) {
	throw new QuoteCalculationError('Failed to generate payment schedule');
    }

    const totalInterest: Money = schedule.reduce(
	(sum, installment) => sum + installment.interest, 
	0
    );

    const totalFee: Money = input.upfrontFee + (input.monthlyFee * input.termMonths);
    const totalPayments: Money = input.upfrontFee + schedule.reduce(
	(sum, installment) => sum + installment.payment,
	0
    );
    const monthlyPayment: Money = schedule[0].payment;
	
    return {
	monthlyPayment,
	totalPayments,
	totalInterest,
	totalFee,
	schedule
    }
};
