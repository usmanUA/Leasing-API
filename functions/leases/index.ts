
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

import { withAuth } from "../../src/lib/api-key-middleware";

app.http("handleCreateLeases", {
    route: "leases",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: withAuth(async function (
    request: HttpRequest,
    context: InvocationContext
    ): Promise<HttpResponseInit> {
	const { logger } = await import("../../src/lib/logger");
	const { handleError } = await import("../../src/lib/error-handler");
	const { handleCreateLease } = await import("../../src/handlers/lease/create-lease");
	const correlationId = request.headers.get('x-correlationId') || context.invocationId;
	try {

	    if (request.method === "POST") {
		logger.info("Processing create lease request", { correlationId });
		const leaseResponse = await handleCreateLease(context, request);
		return {
		    status: 200,
		    jsonBody: {
			id: leaseResponse.id,
		      companyId: leaseResponse.companyId,
		      itemId: leaseResponse.itemId,
		      price: leaseResponse.price,
		      termMonths: leaseResponse.termMonths,
		      nominalRatePct: leaseResponse.nominalRatePct,
		      startDate: leaseResponse.startDate,
		      upfrontFee: leaseResponse.upfrontFee,
		      monthlyFee: leaseResponse.monthlyFee,
		      createdAt: leaseResponse.createdAt,
		      schedule: leaseResponse.schedule,
		      totals: leaseResponse.totals
		    },
		    headers: {
			'Content-Type': 'application/json',
			'X-Correlation-Id': correlationId 
		    }
		};
	    } else {
		return {
		    status: 405,
		    jsonBody: {
			error: {
			    code: 'METHOD_NOT_ALLOWED',
			    message: "This method is not allowed."
			    }
			},
		    headers: {
			'Context-Type': 'application/json',
			'X-Correlation-Id': correlationId
		    }
		};
	    }
	} catch (error) {
	    if (error instanceof Error) {
		return handleError(error, correlationId);
	    }

	    logger.error("Error creating lease", { correlationId });
	    return {
		status: 500,
		jsonBody: {
		error: {
		    code: 'INTERNAL_ERROR',
		    message: 'An unexpected error occured'
		    }
		},
		headers: {
		    'ContentType': 'application/json',
		    'X-Correlation-Id': correlationId
		}
	    };
	}
    })
});

app.http("handleGetLeases", {
    route: "leases/{id}",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: withAuth(async function (
	request: HttpRequest,
	context: InvocationContext
    ): Promise<HttpResponseInit> {
	const { logger } = await import("../../src/lib/logger");
	const { handleError } = await import("../../src/lib/error-handler");
	const { handleGetLease } = await import("../../src/handlers/lease/get-lease");
	const correlationId = request.headers.get('x-correlationId') || context.invocationId;

	try {
	    if (request.method === "GET") {
		logger.info("Processing get lease request", { correlationId });
		const lease = await handleGetLease(request);
		return {
		    status: 200,
		    jsonBody: {
		      id: lease.id,
		      companyId: lease.companyId,
		      itemId: lease.itemId,
		      price: lease.price,
		      termMonths: lease.termMonths,
		      nominalRatePct: lease.nominalRatePct,
		      startDate: lease.startDate,
		      upfrontFee: lease.upfrontFee,
		      monthlyFee: lease.monthlyFee,
		      createdAt: lease.createdAt,
		      schedule: lease.schedule,
		      totals: lease.totals,
		      remainingBalance: lease.remainingBalance
		    },
		    headers: {
			'Content-Type': 'application/json',
			'X-Correlation-Id': correlationId 
		    }
		};
	    } else {
		return {
		    status: 405,
		    jsonBody: {
			error: {
			    code: 'METHOD_NOT_ALLOWED',
			    message: "This method is not allowed."
			    }
			},
		    headers: {
			'Context-Type': 'application/json',
			'X-Correlation-Id': correlationId
		    }
		};
	    }
	} catch (error) {
	    if (error instanceof Error) {
		return handleError(error, correlationId);
	    }
	    logger.error("Error in lease creating endpoint", { correlationId });
	    return {
		status: 500,
		jsonBody: {
		error: {
		    code: 'INTERNAL_ERROR',
		    message: 'An unexpected error occured'
		    }
		},
		headers: {
		    'ContentType': 'application/json',
		    'X-Correlation-Id': correlationId
		}
	    };
	}
    })
});

module.exports = {};
