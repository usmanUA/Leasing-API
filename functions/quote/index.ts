import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

import '../../src/create-paths';
import { withAuth } from "@/lib/api-key-middleware";

app.http("calculateQuote", {
    route: "quote",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: withAuth(async function (
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

	const { handleCalculateQuote } = await import("@/handlers/quote/calculate-quote");
	const { logger } = await import("@/lib/logger");
	const { handleError } = await import("@/lib/error-handler");
	const correlationId = request.headers.get('x-correlation-id') || context.invocationId;

	try {
	    logger.info('Processing quote request', { correlationId });
	    if (request.method === "GET") {
		const quote = await handleCalculateQuote(request);
		return {
		    status: 200,
		    jsonBody: {
		      monthlyPayment: quote.monthlyPayment,
		      totalPayments: quote.totalPayments,
		      totalInterest: quote.totalInterest,
		      totalFee: quote.totalFee,
		      schedule: quote.schedule
		    },
		    headers: {
			'Context-Type': 'application/json',
			'X-Correlation-Id': correlationId
		    }
		};
	    } else {
		// WARNING: Should I check for this in else statement?
		return {
		    status: 405,
		    jsonBody: {
			error: {
			    code: 'METHOD_NOT_ALLOWED',
			    message: "This method is not allowed."
			    }
			},
		    headers: {
			'Context-Type': 'application/json',
			'X-Correlation-Id': correlationId
		    }
		};
	    }
	} catch (error) {
	    if (error instanceof Error) {
		return handleError(error, correlationId);
	    }

	    logger.error("Error getting quote", { correlationId });

	    return {
		status: 500,
		jsonBody: {
		    error: {
			code: 'INTERNAL_ERROR',
			message: 'An unexpected error occured'
		    }
		},
		headers: {
		    'X-Correlation-Id': correlationId
		}
	    };
	}
    })
});
