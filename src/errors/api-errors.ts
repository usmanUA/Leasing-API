// src/errors/api-errors.ts

export type ValidationErrorDetails = {
    field: string;
    message: string;
};

export class APIError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: ValidationErrorDetails[] | undefined;

    constructor(
	statusCode: number,
	code: string,
	message: string,
	details?: ValidationErrorDetails[] | undefined
    ) {
	super(message);
	this.name = 'APIError';
	this.statusCode = statusCode;
	this.code = code;
	this.details = details;
    }
}

export class ValidationError extends APIError {
    constructor(message: string, details: ValidationErrorDetails[]) {
	super(400, 'VALIDATION_ERROR', message, details);
	this.name = 'ValidationError';
    }
}

export class UnauthorizedError extends APIError {
    constructor(message: string = 'Invalid or missing API key') {
	super(401, 'UNAUTHORIZED', message);
	this.name = 'UnauthorizedError';
    }
}

export class NotFoundError extends APIError {
    constructor(resource: string, id: string) {
	super(404, "NOT_FOUND", `${resource} with ID ${id} not found`);
	this.name = 'NotFoundError';
    }
}

export class BusinessRuleErro extends APIError {
    constructor(code: string, message: string) {
	super(422, code, message);
	this.name = "BusinessRuleError";
    }
}

export function isAPIError(error: Error): error is APIError {
    return error instanceof APIError;
}
