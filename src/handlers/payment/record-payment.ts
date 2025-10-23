// src/handlers/payment/record-payment.ts

import { HttpRequest } from "@azure/functions";
import { parsePayment } from "@/application/payment-service";
import { PaymentInputSchema } from "@/lib/validation";
import { registerPayment } from "@/persistence/payment-repository";
import { PaymentInput } from "@/domain/payment";
import { logger } from "@/lib/logger";
import { NotFoundError, ValidationError } from "@/errors/api-errors";
import { Payment } from "@/domain/payment";

// NOTE: handle register payment path, errors are thrown heere and caught by the azure
// NOTE: function to be handler by handlerError wrapper
export async function handleRecordPayment(request: HttpRequest): Promise<Payment> {

    const requestBody = await request.json();
    const validatedPaymentInput = PaymentInputSchema.safeParse(requestBody);
    if (validatedPaymentInput.success === false) {
	const errorDetails = validatedPaymentInput.error.errors.map(err => ({
	    field: err.path.join('.'),
	    message: err.message
	}));

	logger.error("Create lease response validation failed", {
	    errorCount: errorDetails.length
	});
	throw new ValidationError("Invalid id in get lease request", errorDetails);
    }

    logger.info("Registering lease", {
	id: validatedPaymentInput.data.leaseId,
	amount: validatedPaymentInput.data.amount
    });

    const paymentInput: PaymentInput = validatedPaymentInput.data
    // NOTE: any error handling for the following functions?
    const payment = parsePayment(paymentInput);
    const registeredPayment = await registerPayment(payment);
    if (!registeredPayment) {
	logger.warn("Payment not found", { leaseId: payment.leaseId });
	throw new NotFoundError("Lease", payment.leaseId);
    }
    logger.info("Fetched lease data", {
	leaseId: registeredPayment.leaseId,
	amount: registeredPayment.amount
    });
    return registeredPayment;
};
