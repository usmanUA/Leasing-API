// src/lib/error-handler.ts

import { LeaseCalculationError } from "../domain/lease";
import { QuoteCalculationError } from "../domain/quote";
import { isAPIError, ValidationErrorDetails } from "../errors/api-errors"
import { HttpResponseInit } from "@azure/functions";
import { LeaseRepositoryError, PaymentCalculationError, PaymentRepositoryError } from "..";
import { logger } from "./logger";

type ErrorResponse = {
    error: {
	code: string;
	message: string;
	details?: ValidationErrorDetails[];
    };
};

export function handleError(error: Error, correlationId: string): HttpResponseInit {
    if (isAPIError(error)) {
	logger.error(`API Error: ${error.code}`, {
	    correlationId,
	    code: error.code,
	    message: error.message,
	    ...(error.details && { detailsCount: error.details.length })
	});

	const responseBody: ErrorResponse = {
	    error: {
		code: error.code,
		message: error.message,
		...(error.details && { details: error.details })
	    }
	};

	return {
	    status: error.statusCode,
	    jsonBody: responseBody,
	    headers: {
		'X-correlation-Id': correlationId
	    }
	};
    }

    if (
	error instanceof QuoteCalculationError ||
	error instanceof LeaseCalculationError ||
	error instanceof PaymentCalculationError
    ) {
	logger.error('Business logic error', {
	    correlationId,
	    errorType: error.name,
	    message: error.message
	});

	const responseBody: ErrorResponse = {
	    error: {
		code: error.name.replace('Error', '').toUpperCase(),
		message: error.message
	    }
	};

	return {
	    status: 422,
	    jsonBody: responseBody,
	    headers: {
		'X-Correlation-Id': correlationId
	    }
	};
    }
    
    if (
	error instanceof LeaseRepositoryError ||
	error instanceof PaymentRepositoryError
    ) {
	logger.error('Database error', {
            correlationId,
            errorType: error.name,
            message: error.message
        });

    const responseBody: ErrorResponse = {
        error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to access database'
        }
    };

    return {
        status: 500,
        jsonBody: responseBody,
        headers: {
            'X-Correlation-Id': correlationId
	    }
	};
    }

    logger.error('Unexpected error', {
    correlationId,
    name: error.name,
    message: error.message,
    stack: error.stack || 'No stack trace'
    });

    const responseBody: ErrorResponse = {
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
        }
    };

    return {
        status: 500,
        jsonBody: responseBody,
        headers: {
            'X-Correlation-Id': correlationId
        }
    };
}
