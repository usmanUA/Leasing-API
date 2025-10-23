// src/handlers/lease/get-lease.ts

import { getLeaseById } from "../../../src/persistence/lease-repository";
import { HttpRequest } from "@azure/functions";
import { LeaseIdSchema } from "../../../src/lib/validation";
import { getPaymentsByLeaseId } from "../../../src/persistence/payment-repository";
import { calculateRemainigBalance } from "../../../src/application/payment-service";
import { logger } from "../../../src/lib/logger";
import { LeaseReponse } from "../..//domain/lease";
import { NotFoundError, ValidationError } from "../../errors/api-errors";

// NOTE: handle get lease path, errors are thrown heere and caught by the azure
// NOTE: function to be handler by handlerError wrapper
export async function handleGetLease(request: HttpRequest): Promise<LeaseReponse> {

    const validatedLeaseId = LeaseIdSchema.safeParse(request.params.id);
    if (validatedLeaseId.success === false) {
	const errorDetails = validatedLeaseId.error.errors.map(err => ({
	    field: err.path.join('.'),
	    message: err.message
	}));

	logger.error("Create lease response validation failed", {
	    errorCount: errorDetails.length
	});
	throw new ValidationError("Invalid id in get lease request", errorDetails);
    };

    const leaseId = validatedLeaseId.data;
    logger.info("Fetching lease", {
	id: leaseId
    });

    const lease = await getLeaseById(validatedLeaseId.data);

    if (!lease) {
	logger.warn("Lease not found", { leaseId });
	throw new NotFoundError("Lease", leaseId)
    }
    const payments = await getPaymentsByLeaseId(validatedLeaseId.data);

    if (!payments) {
	logger.warn("Payment not found for this lease", { leaseId });
    }

    logger.info("Fetched lease data", {
	leaseId,
	paymentCount: payments?.length
    });

    const remainingBalance = calculateRemainigBalance(lease, payments);

    const leaseResponse: LeaseReponse = {
	...lease,
	remainingBalance
    };

    return leaseResponse;
};
