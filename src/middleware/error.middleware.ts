import { Request, Response, NextFunction } from 'express';
import AppError from '@/utils/appError';
import logger from '@/config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error(`[${req.id}] ${err.message}`);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      requestId: req.id,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    requestId: req.id,
  });
};
