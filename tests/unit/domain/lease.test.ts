// tests/unit/domain/lease.test.ts

import { calculateInstallmentSchedule } from "../../../src/application/lease-service";
describe('Lease Domain', () => {
    it("ensures domain calculations correctness", () => {
    const schedule = calculateInstallmentSchedule({
      companyId: "testCo",
      itemId: "item1",
      price: 1000,
      termMonths: 12,
      nominalRatePct: 5,
      startDate: "2025-01-01",
      upfrontFee: 50,
      monthlyFee: 5,
	});

    const totalPrincipal = schedule.reduce((sum, s) => sum + s.principal, 0);
    const totalInterest = schedule.reduce((sum, s) => sum + s.interest, 0);
    const totalFees = schedule.reduce((sum, s) => sum + s.fee, 0);
    const totalPayments = schedule.reduce((sum, s) => sum + s.payment, 0);

    expect(totalPayments).toBeCloseTo(totalPrincipal + totalInterest + totalFees, 1);
    expect(schedule.at(-1)?.balanceAfter).toBe(0);
    })
});
