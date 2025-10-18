import { Money } from "./lease";

export type Installment = {
    period: number;
    dueDate: string;
    payment: Money;
    interest: Money;
    principal: Money;
    fee: Money;
    balanceAfter: Money;
}

export type PaymentInput = {
    leaseId: string;
    amount: Money;
}

export type Payment = {
    id: string;
    leaseId: string;
    paidAt: string;
    amount: Money;
}
