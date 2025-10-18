import { LeaseInputSchema } from "../../lib/validation";
import { validateApiKey } from "../../lib/api-key-middleware";
import { createLease } from "../../persistence/lease-repository";
import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { parseLease } from "../../application/lease-service";
import { LeaseInput, Lease } from "../../domain/lease";
import { logger } from "../../../src/lib/logger";

export async function handleCreateLease(context: InvocationContext, request: HttpRequest): Promise<HttpResponseInit> {
    const requestId = context.invocationId;

    try {
	if (validateApiKey(request) === false) {
	    logger.error(`[${requestId}] Unauthorized lease creation attempt`)
	    return {
		    status: 401,
		    jsonBody: { error: "Unauthorized", message: "Invalid or missing API key"}
		};
	}

	const validatedLeaseInput = LeaseInputSchema.safeParse(await request.json());
	if (validatedLeaseInput.success === false) {
	    logger.info(`[${requestId}] Invalid lease data`)
	    return {
		status: 400,
		jsonBody: { error: "Invalid input", details: validatedLeaseInput.error.message}
	    };
	}

	logger.info(`[${requestId}] Creating lease for company: ${validatedLeaseInput.data.companyId}`)

	const leaseInput: LeaseInput = validatedLeaseInput.data;
	const lease: Lease = parseLease(leaseInput);
	const leaseId = await createLease(lease);
	logger.info(`[${requestId}] Lease created successfully: ${leaseId}`);

	return {
	    status: 200,
	    jsonBody: lease
	};
    } catch (error) {
	if (error instanceof Error) {
	return {
	    status: 500,
	    jsonBody: { error: "Failed to create lease", details: error.message}
	};
    } else {
	    return {
		status: 500,
		jsonBody: { error: "Failed to create lease", details: String(error)}
	    }
	}
    };
};
