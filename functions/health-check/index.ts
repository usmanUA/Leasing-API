import { app, HttpResponseInit } from "@azure/functions";
import { PrismaClient } from '@prisma/client';

// NOTE: Why a new prisma here?
const prisma = new PrismaClient();

export async function healthCheck(): Promise<HttpResponseInit> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        
        return {
            status: 200,
            jsonBody: {
                status: "healthy",
                database: "connected", 
                timestamp: new Date().toISOString(),
                version: "1.0.0"
            }
        };
    } catch (error) {
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
