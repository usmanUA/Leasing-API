import { LeaseInputSchema } from "../../lib/validation";
import { validateApiKey } from "../../lib/api-key-middleware";
import { createLease } from "../../persistence/lease-repository";
import { Context, HttpRequest } from "@azure/functions";
import { parseLease } from "../../application/lease-service";
import { LeaseInput, Lease } from "../../domain/lease";

export async function handleCreateLease(context: Context, req: HttpRequest) {

    if (validateApiKey(req) === false) {
	context.res = { status: 401, body: { error: "Unauthorized"}};
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

    try {
	const leaseInput: LeaseInput = validatedLeaseInput.data;
	const lease: Lease = parseLease(leaseInput);
	await createLease(lease);
	context.res = { status: 200, body: lease };
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
    }
}
