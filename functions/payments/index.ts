import { handleRecordPayment } from "../src/handlers/payment/record-payment";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { logger } from "@/lib/logger";

export const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
    try {
	if (req.method === "POST") {
	    await handleRecordPayment(context, req);
	} else {
	context.res = {
	    status: 405,
	    body: { error: "This method is not allowed."}
	    };
	}
    } catch (error) {
	logger.error("Error getting lease")
	context.res = {
	    status: 500,
	    body: { error: "Internal Server Error"}
	}
    }
};
