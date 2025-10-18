import { handleCalculateQuote } from "../../src/handlers/quote/calculate-quote";
import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { logger } from "../../src/lib/logger";

// TODO: use context logs? logger?
export async function getQuote(request: HttpRequest): Promise<HttpResponseInit> {
    try {
	if (request.method === "GET") {
	    const quote = await handleCalculateQuote(request);
	    return {
		status: 200,
		jsonBody: quote,
		};
	} else {
	    return {
		status: 405,
		jsonBody: { error: "This method is not allowed."}
		};
	}
    } catch (error) {
	logger.error("Error getting quote")
	return {
	    status: 500,
	    jsonBody: { error: "Internal Server Error"}
	};
    }
}

app.http("calculateQuote", {
    route: "quote",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getQuote
});
