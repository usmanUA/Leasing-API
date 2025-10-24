// src/lib/logger.ts

import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

const url = process.env.DATABASE_URL as string;

const createPrismaClient = (): PrismaClient => {
    return new PrismaClient({
	datasources: { db: { url }},
	log: [ 'error' ]
    });
};

const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;
