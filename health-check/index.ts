import { AzureFunction, Context } from "@azure/functions";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Remove unused 'req' parameter
export const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        
        context.res = {
            status: 200,
            body: {
                status: "healthy",
                database: "connected", 
                timestamp: new Date().toISOString(),
                version: "1.0.0"
            }
        };
    } catch (error) {
        // Type guard for error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        context.res = {
            status: 503,
            body: {
                status: "unhealthy",
                database: "disconnected",
                error: errorMessage,
                timestamp: new Date().toISOString()
            }
        };
    }
};
