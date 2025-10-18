import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateApiKey } from "../../lib/api-key-middleware";
import { parsePayment } from "../../application/payment-service";
import { PaymentInputSchema } from "../../lib/validation";
import { registerPayment } from "../../persistence/payment-repository";
import { PaymentInput } from "../../domain/payment";
import { logger } from "../../../src/lib/logger";

export async function handleRecordPayment(context: InvocationContext, request: HttpRequest): Promise<HttpResponseInit> {
    const requestId = context.invocationId;

    try {
	if (validateApiKey(request) === false) {
	    logger.error(`[${requestId}] Unauthorized register payment attempt`)
	    return {
		status: 401, 
		jsonBody: { error: "Unauthorized"}
	    };
	}

	const validatedPaymentInput = PaymentInputSchema.safeParse(request.body);
	if (validatedPaymentInput.success === false) {
	    logger.info(`[${requestId}] Invalid payment data`)
	    return {
		status: 400,
		jsonBody: { error: "Invalid input", details: validatedPaymentInput.error.message }
	    };
	}
	logger.info(`[${requestId}] Registering payment for lease ID: ${validatedPaymentInput.data.leaseId}`);
	const paymentInput: PaymentInput = validatedPaymentInput.data
	const payment = parsePayment(paymentInput);
	await registerPayment(payment);
	logger.info(`[${requestId}] Payment for lease ID: ${validatedPaymentInput.data.leaseId} succussfully registered`);
	return {
	    status: 200,
	    jsonBody: payment
	};
    } catch (error) {
	if (error instanceof Error) {
	    return {
		status: 500,
		jsonBody: { error: "Failed to register payment", details: error.message }
	    };
	} else {
	    return {
		status: 500,
		jsonBody: { error: "Failed to register payment", details: String(error) }
	    };
	}
    }
};
