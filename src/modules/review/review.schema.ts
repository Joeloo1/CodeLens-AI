import { z } from 'zod';

export const createSubmissionSchema = z.object({
  body: z.object({
    code: z
      .string({ message: 'Code is required' })
      .min(10, 'Code is too short')
      .max(10000, 'Code exceeds maximum allowed length of 10,000 characters'),
    language: z
      .string({ message: 'Language is required' })
      .min(1, 'Language is required')
      .toLowerCase(),
  }),
});

export const getSubmissionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid submission ID'),
  }),
});

export const getUserSubmissionsSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int('Page must be an integer')
      .min(1, 'Page must be at least 1')
      .default(1),
    limit: z.coerce
      .number()
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
  }),
});

export type CreateSubmissionInput = z.infer<
  typeof createSubmissionSchema
>['body'];
export type GetUserSubmissionsInput = z.infer<
  typeof getUserSubmissionsSchema
>['query'];
