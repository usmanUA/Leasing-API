import { getLeaseById } from "../../persistence/lease-repository";
import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateApiKey } from "../../lib/api-key-middleware";
import { LeaseIdSchema } from "../../lib/validation";
import { getPaymentsByLeaseId } from "../../persistence/payment-repository";
import { calculateRemainigBalance } from "../../application/payment-service";
import { logger } from "../../../src/lib/logger";

export async function handleGetLease(context: InvocationContext, request: HttpRequest): Promise<HttpResponseInit> {
    const requestId = context.invocationId;

    try {
	if (validateApiKey(request) === false) {
	    logger.error(`[${requestId}] Unauthorized get lease attempt`)
	    return {
		status: 401, 
		jsonBody: { error: "Unauthorized"}
	    };
	};

	const validatedLeaseId = LeaseIdSchema.safeParse(request.params.id);
	if (validatedLeaseId.success === false) {
	    logger.info(`[${requestId}] Invalid lease ID: ${validatedLeaseId.data}`)
	    return {
		status: 400,
		jsonBody: { error: "Invalid lease ID", details: validatedLeaseId.error.message }
	    }
	}
	logger.info(`[${requestId}] Fetching lease with ID: ${validatedLeaseId.data}`)
	const lease = await getLeaseById(validatedLeaseId.data);
	const payments = await getPaymentsByLeaseId(validatedLeaseId.data);
	const remainingBalance = calculateRemainigBalance(lease, payments);
	return {
	    status: 200,
	    jsonBody: { ...lease, remainingBalance }
	};
    } catch (error) {
	if (error instanceof Error) {
	    return {
		status: 500,
		jsonBody: { error: "Failed to get lease", details: error.message}
	    }
	} else {
	    return {
		status: 500,
		jsonBody: { error: "Failed to get lease", details: String(error)}
	    }
	}
    }
};
