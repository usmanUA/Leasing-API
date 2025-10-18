import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
    var prisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
    return new PrismaClient({
	log: [
	    { level: 'error', emit: 'event' }
	]
    });
};

const prisma = global.prisma ?? createPrismaClient();

prisma.$on('error', (e) => {
    logger.error('Prisma error', { message: e.message });
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;
