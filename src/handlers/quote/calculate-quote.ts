import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { validateApiKey } from "../../lib/api-key-middleware";
import { QuoteInputSchema } from "../../lib/validation";
import { calculateQuote } from "../../application/quote-service";
import { QuoteInput } from "../../domain/quote";


export async function handleCalculateQuote(request: HttpRequest): Promise<HttpResponseInit> {

    if (validateApiKey(request) === false) {
	return { status: 401, jsonBody: { error: "Unauthorized"}};
    }

    const validatedQuoteInput = QuoteInputSchema.safeParse(await request.json());
    if (validatedQuoteInput.success === false) {
	return {
	    status: 400,
	    jsonBody: { error: "Invalid input", details: validatedQuoteInput.error.message }
	};
    }
    try {
	const quoteInput: QuoteInput = validatedQuoteInput.data;
	const quote = calculateQuote(quoteInput);
	return { status: 200, jsonBody: quote };
    } catch (error) {
	if (error instanceof Error) {
	    return {
		status: 500,
		jsonBody: { error: "Failed to calculate quote", details: error.message }
	    }
	} else {
	    return {
		status: 500,
		jsonBody: { error: "Failed to calculate quote", details: String(error) }
	    }
	}
    };
}
