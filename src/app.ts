import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import ratelimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { config } from '@/config/env';
import logger from '@/config/logger';
import AppError from '@/utils/appError';
import router from '@/routes';
import { errorHandler } from '@/middleware/error.middleware';
import { requestIdMiddleware } from '@/middleware/requestId.middleware';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { reviewQueue } from './queues/review.queue';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(reviewQueue)],
  serverAdapter,
});

const app: Express = express();

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Add request ID to all requests
app.use(requestIdMiddleware);

// Limit payload sizes to prevent DoS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(helmet());

// Explicit CORS configuration
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  }),
);

app.use(cookieParser());

const limiter = ratelimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for authentication endpoints
const authLimiter = ratelimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many login/signup attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/api', limiter);
app.use('/api/auth', authLimiter);
app.use('/api', router);

// add this before your routes
app.use('/admin/queues', serverAdapter.getRouter());
/*
 * Handling unhandled Routes
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.warn(`Can't find ${req.originalUrl} on this server`);
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server`, 404),
  );
});

app.use(errorHandler);

export default app;
