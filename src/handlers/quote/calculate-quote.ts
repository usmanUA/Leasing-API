import { Context, HttpRequest } from "@azure/functions";
import { validateApiKey } from "../../lib/api-key-middleware";
import { QuoteInputSchema } from "../../lib/validation";
import { calculateQuote } from "../../application/quote-service";
import { QuoteInput } from "@/domain/quote";


export async function handleCalculateQuote(context: Context, req: HttpRequest) {

    if (validateApiKey(req) === false) {
	context.res = { status: 401, body: { error: "Unauthorized"}};
	return;
    }

    const validatedQuoteInput = QuoteInputSchema.safeParse(req.body);
    if (validatedQuoteInput.success === false) {
	context.res = {
	    status: 400,
	    body: { error: "Invalid input", details: validatedQuoteInput.error.message }
	}
	return;
    }
    try {
	const quoteInput: QuoteInput = validatedQuoteInput.data;
	const quote = calculateQuote(quoteInput);
	context.res = { status: 200, body: quote };
    } catch (error) {
	if (error instanceof Error) {
	    context.res = {
		status: 500,
		body: { error: "Failed to calculate quote", details: error.message }
	    }
	} else {
	    context.res = {
		status: 500,
		body: { error: "Failed to calculate quote", details: String(error) }
	    }
	}
    };
}
