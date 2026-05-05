import { Worker, Job, UnrecoverableError } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { openaiService } from '../services/openai.service';
import { TokenService } from '@/services/token.service';
import { ReviewJobData } from './review.queue';
import logger from '../config/logger';

const MAX_TOKENS = 8000;

const processReview = async (job: Job<ReviewJobData>) => {
  const { submissionId, code, language, userId } = job.data;

  logger.info(`Processing job ${job.id} — submission ${submissionId}`);

  // --- OPTIMIZED IMPLEMENTATION ---
  // Step 1 — mark as processing
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'PROCESSING' },
  });

  // Step 2 — count tokens
  const tokenCount = TokenService.count(code);
  logger.info(`Token count for submission ${submissionId}: ${tokenCount}`);

  // Step 3 — reject if too large
  if (tokenCount > MAX_TOKENS) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'FAILED' },
    });
    throw new UnrecoverableError(
      `Code too large: ${tokenCount} tokens exceeds limit of ${MAX_TOKENS}`,
    );
  }

  // Step 4 & 5 — call OpenAI/Groq
  const start = Date.now();
  const result = await openaiService.reviewCode(code, language);
  const processingMs = Date.now() - start;

  // Step 6 & 7 — Consolidate results and status update in one transaction
  await prisma.$transaction([
    prisma.review.create({
      data: {
        submissionId,
        quality: result.quality,
        security: result.security,
        formatting: result.formatting,
        summary: result.summary,
        modelUsed: 'llama-3.3-70b-versatile',
        processingMs,
      },
    }),
    prisma.submission.update({
      where: { id: submissionId },
      data: { 
        status: 'DONE',
        tokenCount 
      },
    }),
  ]);

  logger.info(
    `Job ${job.id} done in ${processingMs}ms — submission ${submissionId}`,
  );

  return { submissionId, userId, result };

  /* --- ORIGINAL IMPLEMENTATION (Commented out for comparison) ---
  // Step 1 — mark as processing
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'PROCESSING' },
  });

  // Step 2 — count tokens
  const tokenCount = TokenService.count(code);
  logger.info(`Token count for submission ${submissionId}: ${tokenCount}`);

  // Step 3 — reject if too large (no point retrying this)
  if (tokenCount > MAX_TOKENS) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'FAILED' },
    });
    throw new UnrecoverableError(
      `Code too large: ${tokenCount} tokens exceeds limit of ${MAX_TOKENS}`,
    );
  }

  // Step 4 — save token count
  await prisma.submission.update({
    where: { id: submissionId },
    data: { tokenCount },
  });

  // Step 5 — call OpenAI
  const start = Date.now();
  const result = await openaiService.reviewCode(code, language);
  const processingMs = Date.now() - start;

  // Step 6 — save review result
  await prisma.review.create({
    data: {
      submissionId,
      quality: result.quality,
      security: result.security,
      formatting: result.formatting,
      summary: result.summary,
      modelUsed: 'gpt-4o',
      processingMs,
    },
  });

  // Step 7 — mark as done
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'DONE' },
  });

  logger.info(
    `Job ${job.id} done in ${processingMs}ms — submission ${submissionId}`,
  );

  return { submissionId, userId, result };
  */
};

// Boot worker
export const reviewWorker = new Worker<ReviewJobData>('review', processReview, {
  connection: redis,
  concurrency: 10, // Increased from 3 to 10
});

// Worker events
reviewWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

reviewWorker.on('failed', async (job, error) => {
  logger.error(`Job ${job?.id} failed: ${error.message}`);

  // only mark FAILED after all retries exhausted
  if (job && job.attemptsMade === job.opts.attempts) {
    await prisma.submission.update({
      where: { id: job.data.submissionId },
      data: { status: 'FAILED' },
    });
  }
});

reviewWorker.on('error', (err) => {
  logger.error('Worker error:', err);
});
