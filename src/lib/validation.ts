import { z } from 'zod';

export const LeaseInputSchema = z.object({
    companyId: z.string(),
    itemId: z.string().min(1, "Item ID can not be less than 1"),
    price: z.number().positive("Price must be positive"),
    termMonths: z.number().int().positive().max(48, "Term can not be more than 48 months"),
    nominalRatePct: z.number().min(0).max(30, "Interest rate must be between 0 and 30 percent"),
    startDate: z.string().datetime("Invalid date formate"),
    upfrontFee: z.number().min(0, "Upfront fee can not be negative"),
    monthlyFee: z.number().min(0, "Monthly fee can not be negatve")
});

export const LeaseIdSchema = z.string()

export const PaymentInputSchema = z.object({
    leaseId: z.string(),
    amount: z.number().positive()
});

export const QuoteInputSchema = z.object({
    price: z.number().positive(),
    termMonths: z.number().int().positive(),
    nominalRatePct: z.number(),
    upfrontFee: z.number(),
    monthlyFee: z.number(),
})
