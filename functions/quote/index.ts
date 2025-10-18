import { handleCalculateQuote } from "../../src/handlers/quote/calculate-quote";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { logger } from "@/lib/logger";

export const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
    try {
	if (req.method === "GET") {
	    await handleCalculateQuote(context, req);
	} else {
	    context.res = {
		status: 405,
		body: { error: "This method is not allowed."}
		};
	    }
    } catch (error) {
	logger.error("Error getting quote")
	context.res = {
	    status: 500,
	    body: { error: "Internal Server Error"}
	}
    }
}
