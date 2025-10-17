import { calculateInstallmentSchedule, parseLease } from "../../../src/application/lease-service";
import { LeaseInput } from "../../../src/domain/lease";


describe("Lease Service", () => {
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

    test('calculates number of installments correctly', () => {
	const schedule = calculateInstallmentSchedule(mockLeaseInput);
	expect(schedule).toHaveLength(24);
    });

    test('calculates interest for first installment correctly', () => {
	const schedule = calculateInstallmentSchedule(mockLeaseInput);
	const expectedInterestAmount = 1200 * (5.1 / 100 / 12);
	expect(schedule[0].interest).toBeCloseTo(expectedInterestAmount, 2);
    });

    test('last installment balance is zero', () => {
	const schedule = calculateInstallmentSchedule(mockLeaseInput);
	expect(schedule[23].balanceAfter).toBe(0);
    });

    test('total payments equal total interest and total fee with total principal', () => {
	const lease = parseLease(mockLeaseInput);
	const totalPrincipal = mockLeaseInput.price;
	const totalInterest = lease.totals.totalInterest;
	const totalFees = lease.totals.totalFees;

	expect(lease.totals.totalPayments).toBeCloseTo(
	    totalPrincipal + totalInterest + totalFees, 2
	);
    });

})
