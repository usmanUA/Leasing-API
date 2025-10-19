// src/lib/logger.ts
type LogValue = string | number | boolean | LogValue[] | { [key: string]: LogValue } | null | undefined;

type LogContext = {
    [key: string]: LogValue;
}

function formatLog(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    
    if (!context) {
	return `[${timestamp}] [${level}] ${message}`;
    }

    const contextStr = JSON.stringify(context);
    return `[${timestamp}] [${level}] ${message} ${contextStr}`;
}

export const logger = {
    info: (msg: string, context?: LogContext) => {
	console.log(formatLog("INFO", msg, context));
    },

    error: (msg: string, context?: LogContext) => {
	console.error(formatLog("ERROR", msg, context));
    },

    warn: (msg: string, context?: LogContext) => {
	console.warn(formatLog("WARN", msg, context));
    },

    debug: (msg: string, context?: LogContext) => {
	if (process.env.LOG_LEVEL === 'debug') {
	console.debug(formatLog("INFO", msg, context));
	}
    },
};
