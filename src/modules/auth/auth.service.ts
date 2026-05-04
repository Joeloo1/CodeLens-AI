import { prisma } from '@/config/database';
import { SignupInput, LoginInput, RefreshTokenInput } from '@/modules/auth/auth.schema';
import { hashPassword, comparePassword } from '@/utils/password';
import AppError from '@/utils/appError';
import logger from '@/config/logger';
import { generateToken, verifyToken } from '@/utils/jwt';
import { jwtPayload } from '@/types/auth.types';
import { redis } from '@/config/redis';

export const AuthService = {
  async signup(input: SignupInput) {
    const { email, password, name, confirmPassword } = input;

    if (password !== confirmPassword) {
      logger.warn(
        'Signup attempt with non-matching passwords for email: ' + email,
      );
      throw new AppError('Passwords do not match', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn('Signup attempt with existing email: ' + email);
      throw new AppError('Email already in use or user already exists', 400);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const accessToken = generateToken({ id: user.id, type: 'access' }, '15m');
    const refreshToken = generateToken({ id: user.id, type: 'refresh' }, '7d');

    // Store refresh token in Redis for revocation capability
    await redis.setex(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken,
    );

    logger.info('New user signed up with email: ' + email);

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: sanitizedUser, accessToken, refreshToken };
  },

  async login(input: LoginInput) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn('Login attempt with non-existing email: ' + email);
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password for email: ' + email);
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = generateToken({ id: user.id, type: 'access' }, '15m');
    const refreshToken = generateToken({ id: user.id, type: 'refresh' }, '7d');

    // Store refresh token in Redis for revocation capability
    await redis.setex(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken,
    );

    logger.info('User logged in successfully with email: ' + email);

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: sanitizedUser, accessToken, refreshToken };
  },

  async refreshToken(input: RefreshTokenInput) {
    const { token } = input;

    try {
      const decoded = verifyToken(token) as jwtPayload;

      if (decoded.type !== 'refresh') {
        logger.warn('Invalid token type for refresh');
        throw new AppError('Invalid refresh token', 401);
      }

      // Verify refresh token exists in Redis
      const storedToken = await redis.get(`refresh_token:${decoded.id}`);
      if (storedToken !== token) {
        logger.warn(`Refresh token mismatch for user ${decoded.id}`);
        throw new AppError('Refresh token has been revoked', 401);
      }

      // Generate new access token
      const newAccessToken = generateToken(
        { id: decoded.id, type: 'access' },
        '15m',
      );

      logger.info(`Token refreshed for user ${decoded.id}`);

      return { accessToken: newAccessToken };
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.warn(`Invalid refresh token: ${err}`);
      throw new AppError('Invalid refresh token', 401);
    }
  },
};
