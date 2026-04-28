import { prisma } from '@/config/database';
import AppError from '@/utils/appError';
import logger from '@/config/logger';

export const UserService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn('Profile access attempt for non-existing user ID: ' + userId);
      throw new AppError('User not found', 404);
    }

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return sanitizedUser;
  },
};
