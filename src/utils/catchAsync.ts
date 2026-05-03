import { Request, Response, NextFunction } from 'express';

export type AsyncFunction<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const catchAsync = <T extends Request = Request>(
  fn: AsyncFunction<T>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as T, res, next).catch(next);
  };
};
