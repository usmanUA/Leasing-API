import { v4 as uuid } from "uuid";
import { Installment } from "../domain/payment";
import { LeaseInput, Lease, Money } from "../domain/lease";
import { logger } from "../lib/logger";
import { roundToCents } from "..";

export class LeaseCalculationError extends Error {
    constructor(message: string) {
	super(message);
	this.name = "LeaseCalculationError";
    }
}


function addMonths(date: string, months: number): string {
    const d = new Date(date + 'T00:00:00.000Z');
    d.setUTCMonth(d.getUTCMonth() + months);

    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() +1).padStart(2, '0');
    const day = String(d.getUTCDay() + 1).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export function calculateInstallmentSchedule(input: LeaseInput) : Installment[] {

    const { price, termMonths, nominalRatePct, startDate, monthlyFee } = input;

    const monthlyInterestRate = nominalRatePct / 100 / 12;

    let basePayment: Money;

    if (monthlyInterestRate === 0) {
	basePayment = price / termMonths;
    } else {
	const annuityFactor = (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / 
	(Math.pow(1 + monthlyInterestRate, termMonths) - 1);
	basePayment = price * annuityFactor;
    }

    basePayment = roundToCents(basePayment);

    let remainingBalance = price;
    const installments: Installment[] = [];



    for (let month: number = 1; month <= termMonths; month++) {
	const interest = roundToCents(remainingBalance * monthlyInterestRate);

	let principal: Money;

	if (month === termMonths) {
	    principal =  remainingBalance
	} else {
	    principal = roundToCents(basePayment - interest);
	    if (principal > remainingBalance) {
		principal = remainingBalance;
	    }
	}


	const fee = roundToCents(monthlyFee);
	const payment = roundToCents(basePayment + fee);

	const balanceAfter = month === termMonths
	    ? 0
	    : roundToCents(remainingBalance - principal);

	if (balanceAfter < 0 && month !== termMonths) {
	    logger.error('Error in calculations with negative balance', {
		month,
		balanceAfter,
		remainingBalance,
		principal
	    });
	    throw new LeaseCalculationError(
		`Calculation error in month ${month}: with negative balance`
	    );
	}

	installments.push({
	    period: month,
	    dueDate: addMonths(startDate, month),
	    payment,
	    interest,
	    principal,
	    fee,
	    balanceAfter
	});
	remainingBalance = balanceAfter;
    }

    const finalBalance = installments[installments.length - 1].balanceAfter;
    if (finalBalance !== 0) {
	logger.error(`Error in calculations with final balance not being zero`, {
	    finalBalance,
	    termMonths,
	    price
	});

	throw new LeaseCalculationError('Error in calculation with final balance not being zero');
    }

    return installments;
};

export function parseLease (input: LeaseInput) : Lease {
    const id = uuid();
    const createdAt = new Date().toISOString();
    const schedule = calculateInstallmentSchedule(input);
    const totalInterest = schedule.reduce((sum, installment) => sum + installment.interest, 0);
    const totalFees = input.upfrontFee + (input.monthlyFee * input.termMonths);
    const totalPayments = input.upfrontFee + schedule.reduce((sum, installment) => sum + installment.payment, 0);

    const expectedTotal = input.price + totalInterest + totalFees;
    const difference = Math.abs(totalPayments - expectedTotal);
    const toleratedDifference = input.termMonths;

    if (difference > toleratedDifference) {
	logger.error("Total payments not matching in calculations", {
	    totalPayments,
	    expectedTotal,
	    difference,
	    toleratedDifference
	});

	throw new LeaseCalculationError(
	    'Error in calculations with total payment being incorrect'
	);
    }

    const totals = { totalPayments, totalInterest, totalFees };
    return { id, createdAt, ...input, schedule, totals };
};
