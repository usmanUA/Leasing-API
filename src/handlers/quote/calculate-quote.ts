// src/handlers/quote/calculate-quote.ts

import { HttpRequest } from "@azure/functions";
import { QuoteInputSchema } from "@/lib/validation";
import { calculateQuote } from "@/application/quote-service";
import { QuoteInput, Quote } from "@/domain/quote";
import { logger } from "@/lib/logger";
import { ValidationError } from "@/errors/api-errors";


export async function handleCalculateQuote(request: HttpRequest): Promise<Quote> {

    const quoteParams: QuoteInput = {
	price: parseFloat(request.query.get('price') || ''),
	termMonths: parseInt(request.query.get('termMonths') || '', 10),
	nominalRatePct: parseFloat(request.query.get('nominalRatePct') || ''),
	upfrontFee: parseFloat(request.query.get('upfrontFee') || '0'),
	monthlyFee: parseFloat((request.query.get('monthlyFee') || '0'))
    };

    const validatedQuoteInput = QuoteInputSchema.safeParse(quoteParams);

    if (validatedQuoteInput.success === false) {
	const errorDetails = validatedQuoteInput.error.errors.map(err => ({
	    field: err.path.join('.'),
	    message: err.message
	}));

	// WARN: Why calculate field and message for each error when use only length?
	// WARN: Why only price and termMOnths in logger?
	logger.error("Qoute request validation failed", {
	    errorCount: errorDetails.length,
	    price: quoteParams.price,
	    termMonths: quoteParams.termMonths
	});

	throw new ValidationError('Invalid parameters in quote', errorDetails);
    }

    logger.info('calculatin quote', { 
	price: validatedQuoteInput.data.price,
	termMonths: validatedQuoteInput.data.termMonths,
	nominalRatePct: validatedQuoteInput.data.nominalRatePct
    });

    const quote = calculateQuote(validatedQuoteInput.data);

    logger.info('Qoute has been calculated successfully', {
	monthlyPayment: quote.monthlyPayment,
	totalPayments: quote.totalPayments
    });

    return quote;
}
