// src/lib/api-key-middleware.ts

import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { logger } from "./logger";

export const validateApiKey = (req: HttpRequest): { isValid: boolean} => {
    const apiKey = req.headers.get("x-api-key");
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
	logger.error("API_KEY is not configured in environment");
	return { isValid: false };
    };

    if (!apiKey) {
	logger.error("Request is missing x-api-key header");
	return { isValid: false };
    };
    return { isValid: true };
};

type AzureFunctionHandler = (
    request: HttpRequest,
    context: InvocationContext
) => Promise<HttpResponseInit>;

export function withAuth(handler: AzureFunctionHandler): AzureFunctionHandler {
    return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
	const validation = validateApiKey(request);

	if (validation.isValid === false) {
	    const correlationId = request.headers.get('x-correlation-id') || context.invocationId;

	    logger.error('Unauthorized request', {
		correlationId,
		path: request.url
	    });

	    // NOTE: The function return type is httpresponseinit but what is being returned here?
	    return {
		status: 401,
		jsonBody: {
		    error: {
			code: 'UNAUTHORIZED',
			message: 'Invalid or missing API key'
		    }
		},
		headers: {
		    'X-CorrelationId': correlationId
		}
	    };
	}
	return handler(request, context);
    }
};
