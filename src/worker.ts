import { reviewWorker } from './queues/review.worker';
import logger from './config/logger';

logger.info('Worker process started — listening for jobs...');

const shutdown = async () => {
  logger.info('Shutting down worker gracefully...');
  await reviewWorker.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
