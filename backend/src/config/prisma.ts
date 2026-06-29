import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

declare global {
  // Allow global `var` declarations
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances in development (hot reload)
const prisma = global.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [{ level: 'query', emit: 'event' }, 'warn', 'error']
    : ['warn', 'error'],
});

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
  // @ts-ignore - Prisma events
  prisma.$on('query', (e: any) => {
    logger.debug(`Query: ${e.query} | Duration: ${e.duration}ms`);
  });
}

export default prisma;
