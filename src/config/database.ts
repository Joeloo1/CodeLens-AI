import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';

import { config } from '@/config/env';
import logger from '@/config/logger';

// Configure connection pool for better performance
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20, // Maximum pool size
  min: 5, // Minimum pool size
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Connection timeout
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
    logger.info(`Connection pool initialized: max=${pool.options.max}, min=${pool.options.min}`);
  } catch (error) {
    logger.error('Database connection failed', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  await pool.end();
  logger.info('Database disconnected');
};
