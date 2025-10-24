// src/lib/health-check.ts

import { handleError } from "./error-handler";
import { logger } from "./logger";
import prisma from "./prisma";

type HealthStatus = 'healthy' | 'unhealthy';

type HealthCheckResult = {
    status: HealthStatus;
    error?: string;
};
export async function checkDatabaseHealth(correlationId: string): Promise<HealthCheckResult> {
    try {
	    logger.info("Health check started", { correlationId });
	    await prisma.$queryRaw`SELECT 1`;
	    return { status: 'healthy' };
    } catch (error) {
	if (error instanceof Error) {
	    handleError(error, correlationId);
	}

	logger.error("Database health check failed", { correlationId });

	return {
	    status: 'unhealthy',
	    };
    }
}
