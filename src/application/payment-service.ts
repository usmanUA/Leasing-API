// src/application/payment-service.ts

import { v4 as uuid } from "uuid";
import { Payment, PaymentCalculationError, PaymentInput } from "../domain/payment";
import { Lease, Money } from "../domain/lease";
import { logger } from "../../src/lib/logger";
import { roundToCents } from "..";

export function parsePayment(paymentInput: PaymentInput): Payment {
    // NOTE: make up the payment for saving to the database
    return {
	id: uuid(),
	leaseId: paymentInput.leaseId,
	paidAt: new Date().toISOString(),
	amount: paymentInput.amount
    }
};

export function calculateRemainigBalance(lease: Lease, payments: Payment[]) : Money {
    // NOTE: already paid
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // NOTE: yet to be paid
    const totalDue = lease.totals.totalPayments;

    // NOTE: overpayment verification
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

