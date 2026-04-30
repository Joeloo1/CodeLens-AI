import Redis, { RedisOptions } from 'ioredis';
import { config } from '@/config/env';

const redisConfig: RedisOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  db: config.REDIS_DB,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 50, 2000),
};

export const redis = new Redis(redisConfig);
