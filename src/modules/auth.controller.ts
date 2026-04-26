import { Request, Response } from 'express';
import logger from '@/config/logger';
import { AuthService } from '@/modules/auth.service';
import { catchAsync } from '@/utils/catchAsync';
import { config } from '@/config/env';

export const AuthController = {
  signup: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.signup(req.body);

    logger.info('User signed up successfully with email: ' + result.user.email);

    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 /* 7 days */,
    });

    res.status(201).json({
      status: 'success',
      data: result,
    });
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    logger.info('User logged in successfully with email: ' + result.user.email);

    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 /* 7 days */,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }),

  logout: catchAsync(async (_req: Request, res: Response) => {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    logger.info('User logged out successfully');

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }),
};
