import { LeaseInputSchema } from "../../lib/validation";
import { validateApiKey } from "../../lib/api-key-middleware";
import { createLease } from "../../persistence/lease-repository";
import { Context, HttpRequest } from "@azure/functions";
import { parseLease } from "../../application/lease-service";
import { LeaseInput, Lease } from "../../domain/lease";
import { logger } from "@/lib/logger";

export async function handleCreateLease(context: Context, req: HttpRequest): Promise<void> {
    const requestId = context.invocationId;

    try {
	if (validateApiKey(req) === false) {
	    logger.error(`[${requestId}] Unauthorized lease creation attempt`)
	    context.res = {
		    status: 401,
		    body: { error: "Unauthorized", message: "Invalid or missing API key"}
		};
	    return;
	}

	const validatedLeaseInput = LeaseInputSchema.safeParse(req.body);
	if (validatedLeaseInput.success === false) {
	    context.res = {
		status: 400,
		body: { error: "Invalid input", details: validatedLeaseInput.error.message}
	    };
	    return;
	}

	logger.info(`[${requestId}] Creating lease for company: ${validatedLeaseInput.data.companyId}`)

	const leaseInput: LeaseInput = validatedLeaseInput.data;
	const lease: Lease = parseLease(leaseInput);
	const leaseId = await createLease(lease);
	logger.info(`[${requestId}] Lease created successfully: ${leaseId}`);

	context.res = {
	    status: 200,
	    Headers: {
		"Content-Type": "applicatoin/json",
		"Location": `/api/lease/%{leaseId}`
	    },
	    body: lease
	};
    } catch (error) {
	if (error instanceof Error) {
	context.res = {
	    status: 500,
	    body: { error: "Failed to create lease", details: error.message}
	};
    } else {
	    context.res = {
		status: 500,
		body: { error: "Failed to create lease", details: String(error)}
	    }
	}
    };
};
