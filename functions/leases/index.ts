import { logger } from "@/lib/logger";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { handleCreateLease } from "../../src/handlers/lease/create-lease";
import { handleGetLease } from "../../src/handlers/lease/get-lease";


export const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
    const method = req.method;

    try {
	if (method === "POST") {
	    await handleCreateLease(context, req);
	} else if (req.method === "GET") {
	    await handleGetLease(context, req);
	} else {
	context.res = {
	    status: 405,
	    body: { error: "This method is not allowed."}
	    };
	}
    } catch (error) {
	logger.error("Error in lease creating endpoint")
	context.res = {
	    status: 500,
	    body: { error: "Internal Server Error"}
	}
    }
};
