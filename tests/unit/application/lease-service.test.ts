import { LeaseInputSchema } from "../../../src/lib/validation";
import { calculateInstallmentSchedule } from "../../../src/application/lease-service";
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

    test('calculates correct number of installments', () => {
	const schedule = calculateInstallmentSchedule(mockLeaseInput);
	expect(schedule).toHaveLength(mockLeaseInput.termMonths);
    });

    test('calculates correct interest for first installment', () => {
	const schedule = calculateInstallmentSchedule(mockLeaseInput);
	const expectedInterestAmount = +(1200 * (5.1 / 100 / 12)).toFixed(2);

	expect(schedule[0].interest).toBeCloseTo(expectedInterestAmount, 2);
    });

    test("last installment payment should make balanceAfter zeri", () => {
	const schedule = calculateInstallmentSchedule(mockLeaseInput);
	const lastInstallment = schedule[schedule.length - 1];

	expect(lastInstallment.balanceAfter).toBeCloseTo(0);
    });

    test("calculates total principal correctly", () => {
	const schedule = calculateInstallmentSchedule(mockLeaseInput);
	const totalPrincipal = schedule.reduce((sum, installment) => sum + installment.principal, 0);

	expect(totalPrincipal).toBeCloseTo(mockLeaseInput.price, 2);
    });


    test("zod validation rejects negative price", () => {
	const incorrectPricedLeaseInput = { ...mockLeaseInput, price: -599 };

	const result = LeaseInputSchema.safeParse(incorrectPricedLeaseInput);
	expect(result.success).toBe(false);
    });

    test("accepts 0 as nominalRatePct", () => {
	const zeroNomincalRatePctLeaseInput = { ...mockLeaseInput, nominalRatePct: 0 };
	const schedule = calculateInstallmentSchedule(zeroNomincalRatePctLeaseInput);

	expect(schedule.every(installment => installment.interest === 0)).toBe(true);
    });

    test("rounds values to cents", () => {
	const schedule = calculateInstallmentSchedule(mockLeaseInput);
	for (const installment of schedule) {
	    const values = [installment.payment, installment.interest, installment.principal, installment.fee, installment.balanceAfter];
	    for (const val of values) {
		expect(val).toBeCloseTo(parseFloat(val.toFixed(2)), 3);
	    }
	}

    });
})
