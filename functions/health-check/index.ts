import { checkDatabaseHealth } from "../../src/lib/health-check";
import { logger } from "../../src/lib/logger";
import { handleError } from "../../src/lib/error-handler";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function healthCheck(
    request: HttpRequest,
    context: InvocationContext,
): Promise<HttpResponseInit> {
    const correlationId = request.headers.get('x-correlation-id') || context.invocationId;

    const startTime = Date.now();

    try {
	logger.info("Checking health", { correlationId });
	context.log("DATABASE_URL exists: ", !!process.env.DATABASE_URL);
	const dbHealth = await checkDatabaseHealth(correlationId);
	const responseTime = Date.now() - startTime;

	if (dbHealth.status === 'healthy') {
	    return {
		status: 200,
		jsonBody: {
		    status: "healthy",
		    timestamp: new Date().toISOString(),
		    checks: {
			database: 'connected',
			responseTime: `${responseTime}ms`
		    },
		    version: process.env.APP_VERSION || "1.0.0"
		}
	    };
	}
	return {
	    status: 503,
	    jsonBody: {
		status: "unhealthy",
		timestamp: new Date().toISOString(),
		checks: {
		    database: dbHealth.status,
		    error: dbHealth.error,
		    responseTime: `${responseTime}ms`
		}
	    }
	};
    } catch (error) {
	if (error instanceof Error) {
	    handleError(error, correlationId);
	}

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return {
            status: 503,
            jsonBody: {
                status: "unhealthy",
                database: "disconnected",
                error: errorMessage,
                timestamp: new Date().toISOString()
            }
        };
    }
};

app.http("healthCheck", {
    route: "health-check",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: healthCheck
})
