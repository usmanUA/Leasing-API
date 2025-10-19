import { v4 as uuid } from "uuid";
import { Payment, PaymentInput } from "../domain/payment";
import { Lease, Money } from "../domain/lease";
import { logger } from "../../src/lib/logger";
import { roundToCents } from "..";

export class PaymentCalculationError extends Error {
    constructor(message: string) {
	super(message);
	this.name = "RemainingPaymentCalculationError";
    }
}
export function parsePayment(paymentInput: PaymentInput): Payment {
    return {
	id: uuid(),
	leaseId: paymentInput.leaseId,
	paidAt: new Date().toISOString(),
	amount: paymentInput.amount
    }
};

export function calculateRemainigBalance(lease: Lease, payments: Payment[]) : Money {
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalDue = lease.totals.totalPayments;

    if (totalPaid > totalDue) {
	logger.warn('Customer overpaid', {
	    leaseId: lease.id,
	    totalDue,
	    totalPaid,
	    overpayment: totalPaid - totalDue
	});
	throw new PaymentCalculationError(`Overpayment detected: paid ${totalPaid}, due ${totalDue}`);
    }

    const remaining = roundToCents(totalDue - totalPaid);
    return Math.max(0, remaining);
};

