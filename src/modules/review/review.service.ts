import { prisma } from '@/config/database';
import { CreateSubmissionInput } from '@/modules/review/review.schema';
import AppError from '@/utils/appError';
import logger from '@/config/logger';
import { reviewQueue } from '@/queues/review.queue';

export const ReviewService = {
  async createSubmission(userId: string, input: CreateSubmissionInput) {
    const { code, language } = input;

    const submission = await prisma.submission.create({
      data: {
        userId,
        code,
        language,
        status: 'PENDING',
      },
    });

    await reviewQueue.add('review', {
      submissionId: submission.id,
      code,
      language,
      userId,
    });

    return submission;
  },

  async getSubmission(submissionId: string, userId: string) {
    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
        userId,
      },
      include: {
        review: true,
      },
    });

    if (!submission) {
      logger.warn(`Submission not found: ${submissionId}`);
      throw new AppError('Submission not found', 404);
    }

    return submission;
  },

  async getUserSubmission(userId: string) {
    const submissions = await prisma.submission.findMany({
      where: { userId },
      include: {
        review: {
          select: {
            summary: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return submissions;
  },

  async deleteSubmission(submissionId: string, userId: string) {
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, userId },
    });

    if (!submission) {
      logger.warn(`Submission not found: ${submissionId}`);
      throw new AppError('Submission not found', 404);
    }

    if (submission.status === 'PROCESSING') {
      logger.warn(`Cannot delete submission while processing: ${submissionId}`);
      throw new AppError('Cannot delete submission while processing', 400);
    }

    await prisma.submission.delete({
      where: { id: submissionId },
    });

    return { message: 'Submission deleted successfully' };
  },
};
