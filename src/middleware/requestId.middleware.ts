import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Use x-request-id header if provided, otherwise generate a new one
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();

  req.id = requestId;

  // Add to response headers for client tracking
  res.setHeader('x-request-id', requestId);

  next();
};
