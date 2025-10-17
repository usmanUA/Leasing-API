import { Context, HttpRequest } from "@azure/functions";
import { validateApiKey } from "../../lib/api-key-middleware";
import { parsePayment } from "../../application/payment-service";
import { PaymentInputSchema } from "../../lib/validation";
import { registerPayment } from "../../persistence/payment-repository";

export async function handleRecordPayment(context: Context, req: HttpRequest) {

    if (validateApiKey(req) === false) {
	context.res = { status: 401, detail: { error: "Unauthorized"}};
	return;
    };

    const validatedPaymentInput = PaymentInputSchema.safeParse(req.body);
    if (validatedPaymentInput.success === false) {
	context.res = {
	    status: 400,
	    body: { error: "Invalid input", details: validatedPaymentInput.error.message }
	}
	return;
    }
    try {
	const payment = parsePayment(validatedPaymentInput.data.leaseId, validatedPaymentInput.data.amount);
	await registerPayment(payment);
	context.res = { status: 200, body: payment }
    } catch (error) {
	if (error instanceof Error) {
	    context.res = {
		status: 500,
		body: { error: "Failed to register payment", details: error.message }
	    }
	} else {
	    context.res = {
		status: 500,
		body: { error: "Failed to register payment", details: String(error) }
	    }
	}
    };
};
