import app from '@/app';
import { config } from '@/config/env';
import logger from '@/config/logger';
import { connectDatabase, disconnectDatabase } from '@/config/database';

const bootstrap = async () => {
  const port = config.PORT;
  logger.info('Starting database connection...');
  await connectDatabase();

  const server = app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
  });

  let isShuttingDown = false;

  const closeServer = () =>
    new Promise<void>((resolve, reject) => {
      server.close((err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`${signal} received. Starting graceful shutdown...`);

    try {
      await closeServer();
      logger.info('⛔ HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('unhandledRejection', (err: unknown) => {
    logger.error('💥 UNHANDLED REJECTION!');
    logger.error(err);
    shutdown('UNHANDLED_REJECTION');
  });

  process.on('uncaughtException', (err: unknown) => {
    logger.error('💥 UNCAUGHT EXCEPTION!');
    logger.error(err);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
});
