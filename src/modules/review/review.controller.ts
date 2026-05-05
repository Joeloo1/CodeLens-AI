import { Request, Response } from 'express';
import { ReviewService } from '@/modules/review/review.service';
import logger from '@/config/logger';
import { catchAsync } from '@/utils/catchAsync';

export const ReviewController = {
  createSubmission: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const submission = await ReviewService.createSubmission(userId!, req.body);

    logger.info(`Created submission ${submission.id} for user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: {
        submission,
      },
    });
  }),

  getAll: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;

    const result = await ReviewService.getUserSubmission(userId!, page, limit);

    logger.info(
      `Fetched ${result.submissions.length} submissions for user ${userId} (page ${page})`,
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }),

  getOne: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const submissionId = req.params['id'] as string;

    const submission = await ReviewService.getSubmission(submissionId, userId!);

    logger.info(`Fetched submission ${submissionId} for user ${userId}`);

    res.status(200).json({
      status: 'success',
      data: {
        submission,
      },
    });
  }),

  deleteSubmission: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const submissionId = req.params['id'] as string;

    await ReviewService.deleteSubmission(submissionId, userId!);

    logger.info(`Dalete submission  by the ID: ${submissionId}`);

    res.status(200).json({
      status: 'success',
      message: 'Submission deleted successfully',
      data: null,
    });
  }),
};
