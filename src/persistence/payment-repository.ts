import prisma from "../lib/prisma";
import { Payment } from "../domain/payment";
import { logger } from "../lib/logger";

export class PaymentRepositoryError extends Error {
    constructor(message: string, public readonly cause?: Error) {
	super(message);
	this.name = "PaymentRepositoryError";
    }
}

export async function registerPayment(paymentRequest: Payment): Promise<Payment | null> {
    try {
	const newPayment = await prisma.payment.create({
	    data: {
		id: paymentRequest.id,
		leaseId: paymentRequest.leaseId,
		paidAt: new Date(paymentRequest.paidAt),
		amount: paymentRequest.amount,
	    }
	})

	if (!newPayment) {
	    return null;
	}
	logger.info("Payment registered in the database", {
            paymentId: newPayment.id,
            leaseId: paymentRequest.leaseId,
            amount: paymentRequest.amount
        });

	const payment: Payment = {
	    id: newPayment.id,
	    leaseId: newPayment.leaseId,
	    paidAt: newPayment.paidAt.toISOString(),
	    amount: newPayment.amount
	}
	return payment;
    } catch (error) {
	const errorMessage = error instanceof Error ? error.message : "Unknown database error";
        
        logger.error("Failed to register payment in the database", {
            paymentId: paymentRequest.id,
            leaseId: paymentRequest.leaseId,
            amount: paymentRequest.amount,
            error: errorMessage
        });

        throw new PaymentRepositoryError(
            `Failed to register the payment: ${errorMessage}`,
            error instanceof Error ? error : undefined
        );
    }
}

export async function getPaymentsByLeaseId(leaseId: string): Promise<Payment[] | null> {
    try {
	const payments = await prisma.payment.findMany({
	    where: { leaseId },
	});

	if (!payments) {
	    logger.info("Lease not found in the database", { leaseId: leaseId });
	    return null;
	}

	logger.info("Payments fetched from the database", {
            leaseId,
            paymentCount: payments.length
        });
	
	return payments.map(payment => ({
	    ...payment,
	    paidAt: payment.paidAt.toISOString()
	}));
    } catch (error) {
	const errorMessage = error instanceof Error ? error.message : "Unknown database error";
        
        logger.error("Failed to fetch requested payments from the database", {
            leaseId,
            error: errorMessage
        });

        throw new PaymentRepositoryError(
            `Failed to get payments from the database: ${errorMessage}`,
            error instanceof Error ? error : undefined
        );
    }
};
