import { Request, Response } from 'express';
import { UserService } from '@/modules/user/user.service';
import { catchAsync } from '@/utils/catchAsync';
import logger from '@/config/logger';

export const UserController = {
  getProfile: catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getProfile(req.params['id'] as string);

    logger.info('profile accessed for User ID: ' + user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  }),
};
