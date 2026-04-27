import { prisma } from '@/config/database';
import { SignupInput, LoginInput } from '@/modules/auth/auth.schema';
import { hashPassword, comparePassword } from '@/utils/password';
import AppError from '@/utils/appError';
import logger from '@/config/logger';
import { generateToken } from '@/utils/jwt';

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

    const token = generateToken({ userId: user.id });

    logger.info('New user signed up with email: ' + email);

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: sanitizedUser, token };
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

    const token = generateToken({ userId: user.id });

    logger.info('User logged in successfully with email: ' + email);

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: sanitizedUser, token };
  },
};
