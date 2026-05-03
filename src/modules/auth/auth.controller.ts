import { Request, Response } from 'express';
import logger from '@/config/logger';
import { AuthService } from '@/modules/auth/auth.service';
import { catchAsync } from '@/utils/catchAsync';
import { config } from '@/config/env';
import { redis } from '@/config/redis';

export const AuthController = {
  signup: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.signup(req.body);

    logger.info('User signed up successfully with email: ' + result.user.email);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 /* 15 minutes */,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 /* 7 days */,
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    logger.info('User logged in successfully with email: ' + result.user.email);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 /* 15 minutes */,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 /* 7 days */,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }),

  refresh: catchAsync(async (req: Request, res: Response): Promise<any> => {
    const refreshToken = req.cookies['refreshToken'] || req.body.refreshToken;

    if (!refreshToken) {
      logger.warn('Refresh attempted without token');
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token provided',
      });
    }

    const result = await AuthService.refreshToken({
      token: refreshToken,
    });

    logger.info('Token refreshed successfully');

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 /* 15 minutes */,
    });

    res.status(200).json({
      status: 'success',
      data: {
        accessToken: result.accessToken,
      },
    });
  }),

  logout: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (userId) {
      // Revoke refresh token
      await redis.del(`refresh_token:${userId}`);
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info('User logged out successfully');

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }),
};
