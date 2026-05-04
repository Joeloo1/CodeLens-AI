import { z } from 'zod';

export const SignupSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(3, 'Name is required and must beat least 3 characters long')
        .max(100, 'Name must be less than 50 characters long'),
      email: z
        .string()
        .min(1, 'Email is required')
        .email({ message: 'please enter a valid email address' })
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
          message:
            'Please enter a valid email address (Ex: johndoe@domain.com).',
        }),
      password: z
        .string()
        .min(1, { message: 'Password is required' })
        .max(128, {
          message: 'Password must be a maximum of 8 characters long',
        })
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          {
            message:
              'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
          },
        ),
      confirmPassword: z
        .string()
        .min(1, { message: 'Password confirmation is required' })
        .max(128, {
          message:
            'password confirmation must be a maximum of 8 characters long',
        }),
      is_subscribed: z.boolean().default(false),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Your passwords don't match",
      path: ['confirmPassword'],
    }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email({ message: 'please enter a valid email address' })
      .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Please enter a valid email address (Ex: johndoe@domain.com).',
      }),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .max(128, { message: 'Password must be a maximum of 8 characters long' })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
        },
      ),
  }),
});

export const RefreshTokenSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Refresh token is required'),
  }),
});

export type SignupInput = z.infer<typeof SignupSchema>['body'];
export type LoginInput = z.infer<typeof LoginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>['body'];
