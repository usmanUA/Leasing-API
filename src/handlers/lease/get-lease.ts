import { Context, HttpRequest } from "@azure/functions";
import { getLeaseById } from "../../persistence/lease-repository";
import { validateApiKey } from "../../lib/api-key-middleware";
import { LeaseIdSchema } from "../../lib/validation";
import { getPaymentsByLeaseId } from "../../persistence/payment-repository";
import { calculateRemainigBalance } from "../../application/payment-service";

export async function handleGetLease(context: Context, req: HttpRequest) {

    if (validateApiKey(req) === false) {
	context.res = { status: 401, detail: { error: "Unauthorized"}};
	return;
    };

    const validatedLeaseId = LeaseIdSchema.safeParse(req.params.id);
    if (validatedLeaseId.success === false) {
	context.res = {
	    status: 400,
	    body: { error: "Invalid lease ID", details: validatedLeaseId.error.message }
	}
	return;
    }
    try {
	const lease = await getLeaseById(validatedLeaseId.data);
	const payments = await getPaymentsByLeaseId(validatedLeaseId.data);
	const remainingBalance = calculateRemainigBalance(lease, payments);
	context.res = {
	    status: 200,
	    body: { ...lease, remainingBalance }
	};
    } catch (error) {
	if (error instanceof Error) {
	    context.res = {
		status: 500,
		body: { error: "Failed to get lease", details: error.message}
	    }
	} else {
	    context.res = {
		status: 500,
	    body: { error: "Failed to get lease", details: String(error)}
	    }
	}
    }
};
