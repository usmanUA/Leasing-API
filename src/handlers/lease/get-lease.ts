import { getLeaseById } from "../../persistence/lease-repository";
import { HttpRequest } from "@azure/functions";
import { LeaseIdSchema } from "../../lib/validation";
import { getPaymentsByLeaseId } from "../../persistence/payment-repository";
import { calculateRemainigBalance } from "../../application/payment-service";
import { logger } from "../../../src/lib/logger";
import { LeaseReponse } from "../../domain/lease";
import { NotFoundError, ValidationError } from "../../errors/api-errors";

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

    // NOTE: Any error handling for the following functions?
    const lease = await getLeaseById(validatedLeaseId.data);

    if (!lease) {
	logger.warn("Lease not found", { leaseId });
	throw new NotFoundError("Lease", leaseId)
    }
    const payments = await getPaymentsByLeaseId(validatedLeaseId.data);

    if (!payments) {
	logger.warn("Payment not found", { leaseId });
	throw new NotFoundError("Lease", leaseId)
    }

    logger.info("Fetched lease data", {
	leaseId,
	paymentCount: payments.length
    });

    const remainingBalance = calculateRemainigBalance(lease, payments);

    const leaseResponse: LeaseReponse = {
	...lease,
	remainingBalance
    };

    return leaseResponse;
};
