import { Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import AppError from '@/utils/appError';
import { catchAsync } from '@/utils/catchAsync';
import { verifyToken } from '@/utils/jwt';
import { isPasswordChangedAfter } from '@/utils/password';
import { jwtPayload } from '@/types/auth.types';
import { AuthRequest } from '@/types/authRequest';

export const authMiddleware = catchAsync<AuthRequest>(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.get('authorization');
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      logger.warn('No token provided in the request');
      return next(
        new AppError(
          'You are not logged in. Please log in to get access.',
          401,
        ),
      );
    }

    const decoded = verifyToken(token) as jwtPayload;

    if (!decoded.id) {
      logger.warn('Invalid token: missing user ID');
      return next(new AppError('Invalid token, Please login again', 401));
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      logger.warn(`User with ID ${decoded.id} not found`);
      return next(
        new AppError('The user belonging to this token does not exist.', 401),
      );
    }

    if (isPasswordChangedAfter(currentUser.password_changed_at, decoded.iat)) {
      logger.warn(
        'Unauthorized access attempt - password changed after token issued',
        { userId: currentUser.id },
      );
      return next(
        new AppError('You recently changed password, please log in again', 401),
      );
    }

    req.user = currentUser;
    next();
  },
);
