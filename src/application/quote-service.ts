import { calculateInstallmentSchedule } from "./lease-service";
import { QuoteInput, Quote } from "../domain/quote";


export function calculateQuote(input: QuoteInput) : Quote {
    const schedule = calculateInstallmentSchedule({
	...input,
	companyId: "",
	itemId: "",
	startDate: new Date().toISOString().split("T")[0]
    });

    const totalInterest = schedule.reduce((sum, installment) => sum + installment.interest, 0);
    const totalFee = input.upfrontFee + input.monthlyFee * input.termMonths;
    const totalPayments = input.upfrontFee + schedule.reduce((sum, installment) => sum + installment.payment, 0);

    return {
	monthlyPayment: schedule[0].payment,
	totalPayments,
	totalInterest,
	schedule,
	totalFee
    }
};
