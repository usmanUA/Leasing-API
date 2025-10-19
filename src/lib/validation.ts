import { Money } from '../domain/lease';
import { z } from 'zod';

export const LeaseInputSchema = z.object({
    companyId: z.string().min(1, "Company ID can not be less than 1"),
    itemId: z.string().min(1, "Item ID can not be less than 1"),
    price: z.number().positive("Price must be positive"),
    termMonths: z.number()
		    .int("Term must be an integer")
		    .positive("Term must be positive")
		    .max(48, "Term can not be more than 48 months"),
    nominalRatePct: z.number()
		    .min(0, "Interest rate can not be negative")
		    .max(30, "Interest rate must be between 0 and 30 percent"),
    startDate: z.string().datetime("Invalid date formate"),
    upfrontFee: z.number()
		    .min(0, "Upfront fee can not be negative"),
    monthlyFee: z.number()
		    .min(0, "Monthly fee can not be negatve")
});

export const LeaseIdSchema = z.string().uuid("Invalid lease ID format")

export const PaymentInputSchema = z.object({
    leaseId: z.string().uuid("Invalid lease ID format"),
    amount: z.number().positive("Payment amount must be positive")
});

export const QuoteInputSchema = z.object({
    price: z.number().positive("Price must be positive"),
    termMonths: z.number()
		.int("Term must be an integer")
		.positive("Term must be positive")
		.max(48, "Term can not be more than 48 months"),
    nominalRatePct: z.number()
		    .min(0, "Interest rate can not be negative")
		    .max(30, "Interest rate must be between 0 and 30 percent"),
    upfrontFee: z.number()
		    .min(0, "Upfront fee can not be negative"),
    monthlyFee: z.number()
		    .min(0, "Monthly fee can not be negatve")
})


export function roundToCents(amount: Money): Money {
    return Math.round(amount * 100) / 100;
} 
