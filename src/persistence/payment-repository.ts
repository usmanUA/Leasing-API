import prisma from "../lib/prisma";
import { Payment } from "../domain/payment";


export async function registerPayment(paymentRequest: Payment): Promise<string> {
    const newPayment = await prisma.payment.create({
	data: {
	    id: paymentRequest.id,
	    leaseId: paymentRequest.leaseId,
	    paidAt: new Date(paymentRequest.paidAt),
	    amount: paymentRequest.amount,
	}
    })
    return newPayment.id;
}

export async function getPaymentsByLeaseId(leaseId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
	where: { leaseId },
    });
    return payments.map(payment => ({
	...payment,
	paidAt: payment.paidAt.toISOString()
    }));
};
