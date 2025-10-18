import { handleRecordPayment } from "../../src/handlers/payment/record-payment";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { logger } from "../../src/lib/logger";

export async function registerPayment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
	if (request.method === "POST") {
	    const paymentResponse = await handleRecordPayment(context, request);
	    return {
		status: 200,
		jsonBody: paymentResponse
	    };
	} else {
	    return {
		status: 405,
		jsonBody: { error: "This method is not allowed."}
		};
	}
    } catch (error) {
	logger.error("Error getting lease")
	return {
	    status: 500,
	    jsonBody: { error: "Internal Server Error"}
	};
    }
}

app.http("registerPayment", {
    route: "payments",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: registerPayment
})
