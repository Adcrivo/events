import { PrismaClient } from '@prisma/client';
import { logInfo, logError } from '../utils/logger';

let prisma: PrismaClient;

// Initialize database connection
export const initDatabase = async () => {
  try {
    if (!prisma) {
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
    }
    await prisma.$connect();
    logInfo('Database connection established successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`Unable to connect to the database: ${errorMessage}`);
    throw error;
  }
};

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
};

export default getPrisma;
