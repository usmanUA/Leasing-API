// src/handlers/lease/create-lease.ts

import { LeaseInputSchema } from "@/lib/validation";
import { createLease } from "@/persistence/lease-repository";
import { HttpRequest, InvocationContext } from "@azure/functions";
import { parseLease } from "@/application/lease-service";
import { LeaseInput, Lease } from "@/domain/lease";
import { logger } from "@/lib/logger";
import { NotFoundError, ValidationError } from "@/errors/api-errors";

// NOTE: handle create lease path, errors are thrown heere and caught by the azure
// NOTE: function to be handler by handlerError wrapper
export async function handleCreateLease(context: InvocationContext, request: HttpRequest): Promise<Lease> {
    const requestId = context.invocationId;

    const validatedLeaseInput = LeaseInputSchema.safeParse(await request.json());
    if (validatedLeaseInput.success === false) {
	const errorDetails = validatedLeaseInput.error.errors.map(err => ({
	    field: err.path.join('.'),
	    message: err.message
	}));

	logger.error("Create lease response validation failed", {
	    errorCount: errorDetails.length
	});
	    throw new ValidationError("Invalid id in get lease request", errorDetails);
    }

    logger.info("Fetching lease", {
	id: requestId
    });

    const leaseInput: LeaseInput = validatedLeaseInput.data;
    const lease: Lease = parseLease(leaseInput);
    const leaseResponse = await createLease(lease);
    if (!leaseResponse) {
	logger.warn("Lease not found in the database", { leaseId: lease.id });
	throw new NotFoundError("Lease", lease.id)
    }

    logger.info("Fetched lease data", {
	leaseId: leaseResponse.id,
	companyId: leaseResponse.companyId
    });

    return leaseResponse;
};
