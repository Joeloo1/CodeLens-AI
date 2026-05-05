import { Queue } from 'bullmq';
import { redis } from '@/config/redis';
import logger from '@/config/logger';

export interface ReviewJobData {
  submissionId: string;
  code: string;
  language: string;
  userId: string;
}

const defaultQueueOptions = {
  attempts: 3,
  backoffs: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
};

export const reviewQueue = new Queue<ReviewJobData>('review', {
  connection: redis,
  defaultJobOptions: defaultQueueOptions,
});

reviewQueue.on('error', (err) => logger.error('Review Queue Error', err));
