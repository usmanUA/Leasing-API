import { v4 as uuid } from "uuid";
import { Installment } from "../domain/payment";
import { LeaseInput, Lease } from "../domain/lease";

export function calculateInstallmentSchedule(input: LeaseInput) : Installment[] {

    const { price, termMonths, nominalRatePct, startDate, monthlyFee } = input;

    const monthlyInterestRate = nominalRatePct / 100 / 12;
    const annuityFactor = (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, input.termMonths)) / 
    (Math.pow(1 + monthlyInterestRate, input.termMonths) - 1);

    const basePayment = price * annuityFactor;

    let remainingBalance = price;
    const installments: Installment[] = [];

    const addMonths = (date: string, months: number) => {
	const d = new Date(date);
	d.setMonth(d.getMonth() + months);
	return d.toISOString().split("T")[0];
    };

    const roundToTwoDecimals = (num: number) => Math.round(num * 100) / 100;

    for (let month = 1; month <= termMonths; month++) {
	const interest = roundToTwoDecimals(remainingBalance * monthlyInterestRate);
	// WARN: If its the last month, there's no interest or monthly fee?
	const principal = month === termMonths
	? roundToTwoDecimals(remainingBalance)
	: roundToTwoDecimals(basePayment - interest);


	const fee = roundToTwoDecimals(monthlyFee);
	const payment = roundToTwoDecimals(basePayment + fee);
	const balanceAfter = month === termMonths
	? 0
	: roundToTwoDecimals(remainingBalance - principal);

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
    return installments;
};

export function parseLease (input: LeaseInput) : Lease {
    const id = uuid();
    const createdAt = new Date().toISOString();
    const schedule = calculateInstallmentSchedule(input);
    const totalInterest = schedule.reduce((sum, installment) => sum + installment.interest, 0);
    const totalFees = input.upfrontFee + (input.monthlyFee * input.termMonths);
    const totalPayments = input.upfrontFee + schedule.reduce((sum, installment) => sum + installment.payment, 0);
    const totals = { totalPayments, totalInterest, totalFees };
    return { id, createdAt, ...input, schedule, totals };
};
