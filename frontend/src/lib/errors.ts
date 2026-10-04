export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 400, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export interface ClientErrorResponse {
    error: string;
    statusCode: number;
}

/**
 * Logs the full error details on the server side and returns a sanitized
 * error message for client consumption.
 * @param error The original error thrown
 */
export function toClientError(error: unknown): ClientErrorResponse {
    // Log the full original error on the server side
    console.error('[Server Error Logger]:', error);

    if (error instanceof AppError) {
        return {
            error: error.message,
            statusCode: error.statusCode,
        };
    }

    // If it's a standard Error or unknown, return a generic user-friendly message
    return {
        error: 'An internal server error occurred. Please try again later.',
        statusCode: 500,
    };
}
