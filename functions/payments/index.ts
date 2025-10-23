import '../../src/create-paths';
import { handleRecordPayment } from "@/handlers/payment/record-payment";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { logger } from "@/lib/logger";
import { handleError } from "@/lib/error-handler";
import { withAuth } from "@/lib/api-key-middleware";

export async function registerPayment(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    const correlationId = request.headers.get('x-correlation-id') || context.invocationId;

    try {
	if (request.method === "POST") {
	    logger.info("Processing register payment", { correlationId });
	    const paymentResponse = await handleRecordPayment(request);
	    return {
		status: 200,
		jsonBody: {
		  id: paymentResponse.id,
		  leaseId: paymentResponse.leaseId,
		  amount: paymentResponse.amount,
		  paidAt: paymentResponse.paidAt
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

	logger.error("Error registering payment")
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
}

app.http("registerPayment", {
    route: "payments",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: withAuth(registerPayment)
})
