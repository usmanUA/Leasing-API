import { logger } from "../../src/lib/logger";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { handleCreateLease } from "../../src/handlers/lease/create-lease";
import { handleGetLease } from "../../src/handlers/lease/get-lease";

export async function createLease(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
	if (request.method === "POST") {
	    const leaseResponse = await handleCreateLease(context, request);
	    return {
		status: 200,
		jsonBody: leaseResponse
	    };
	} else {
	    return {
		status: 200,
		jsonBody: { error: "This method is not allowed."}
	    };
	}
    } catch (error) {
	logger.error("Error in lease creating endpoint")
	    return {
		status: 200,
		jsonBody: { error: "Internal Server Error"}
	    };
    }
}

export async function getLease(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
	if (request.method === "GET") {
	    const lease = await handleGetLease(context, request);
	    return {
		status: 200,
		jsonBody: lease
	    };
	} else {
	    return {
		status: 200,
		jsonBody: { error: "This method is not allowed."}
	    };
	}
    } catch (error) {
	logger.error("Error in lease creating endpoint")
	    return {
		status: 200,
		jsonBody: { error: "Internal Server Error"}
	    };
    }
}

app.http("handleCreateLeases", {
    route: "leases",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: createLease
})

app.http("handleGetLeases", {
    route: "leases/{id}",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getLease
})
