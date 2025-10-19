// src/lib/logger.ts

import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
    return new PrismaClient({
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
