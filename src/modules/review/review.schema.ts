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

export type CreateSubmissionInput = z.infer<
  typeof createSubmissionSchema
>['body'];
