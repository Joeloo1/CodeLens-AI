import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import ratelimit from 'express-rate-limit';

import { config } from '@/config/env';
import logger from '@/config/logger';
import AppError from '@/utils/appError';
import router from '@/routes';
import { errorHandler } from '@/middleware/error.middleware';

const app: Express = express();

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

const limiter = ratelimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
app.use('/api', router);

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
