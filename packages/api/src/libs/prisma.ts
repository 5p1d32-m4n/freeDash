import { PrismaClient, AccountType, TransactionType, TransactionStatus } from '../../prisma/generated/client';

// This prevents Prisma Client from being initialized multiple times in development
// due to hot-reloading, which can exhaust database connections.
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;