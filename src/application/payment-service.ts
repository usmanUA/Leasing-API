import { v4 as uuid } from "uuid";
import { Payment } from "../domain/payment";
import { Lease } from "../domain/lease";

export function parsePayment(leaseId: string, amount: number): Payment {
    return {
	id: uuid(),
	leaseId,
	paidAt: new Date().toISOString(),
	amount
    }
};

export function calculateRemainigBalance(lease: Lease, payments: Payment[]) : number {
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalDue = lease.totals.totalPayments;
    return Math.max(0, totalDue - totalPaid);
};

