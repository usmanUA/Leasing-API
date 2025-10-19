import { parseLease } from "../../../src/application/lease-service";
import { calculateRemainigBalance, PaymentCalculationError } from "../../../src/application/payment-service";
import { Payment } from "../../../src/domain/payment"
import { LeaseInput } from "../../../src/domain/lease"


describe('Payment Service', () => {
    const mockLeaseInput: LeaseInput = {
	companyId: "a1b2c3",
	itemId: "item786",
	price: 1200,
	termMonths: 24,
	nominalRatePct: 5.1,
	startDate: "2025-11-01",
	upfrontFee: 50,
	monthlyFee: 10
    };

    const mockLease = parseLease(mockLeaseInput);
    
    test('calculates remaining balance correctly', () => {
	const totalDue = mockLease.totals.totalPayments;
	const mockPayments: Payment[] = [
	    { id: 'payment1', leaseId: 'lease786', paidAt: '2025-10-17', amount: 70.35},
	    { id: 'payment2', leaseId: 'lease786', paidAt: '2025-11-17', amount: 70.35}
	];

	const remainingDue = totalDue - (70.35 * 2);
	const remainingBalance = calculateRemainigBalance(mockLease, mockPayments)
	expect(remainingBalance).toBeCloseTo(remainingDue);
    });

    test('remaining balance is never negative', () => {
	const totalDue = mockLease.totals.totalPayments;
	const paymentAmount = totalDue / 2;
        const mockPayments: Payment[] = [
            { id: 'payment1', leaseId: 'lease786', paidAt: '2025-10-15', amount: paymentAmount },
            { id: 'payment2', leaseId: 'lease786', paidAt: '2025-11-15', amount: paymentAmount }
        ];

	const  remainingBalance = calculateRemainigBalance(mockLease, mockPayments);
	expect(remainingBalance).toBeCloseTo(0, 2);
    });

    test('throws PaymentCalculationError upon overpayment', () => {
	const totalDue = mockLease.totals.totalPayments;

	const mockPayments: Payment[] = [
        { id: 'payment1', leaseId: 'lease786', paidAt: '2025-10-15', amount: totalDue + 5 } ];

	expect(() => calculateRemainigBalance(mockLease, mockPayments)).toThrow(PaymentCalculationError);
    });

    test("returns full amount with no payment yet", () => {
	const mockPayment: Payment[] = [];
	const remainingBalance = calculateRemainigBalance(mockLease, mockPayment);
	expect(remainingBalance).toBeCloseTo(mockLease.totals.totalPayments, 2);
    });

    test("return 0 with total payment is done", () => {
	const totalDue = mockLease.totals.totalPayments;
	const mockPayment: Payment[] = [
	    { id: 'payment1', leaseId: 'lease786', paidAt: '2025-10-15', amount: totalDue }];
	const remainingBalance = calculateRemainigBalance(mockLease, mockPayment);
	expect(remainingBalance).toBeCloseTo(0);
    })
});
