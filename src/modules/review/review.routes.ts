import { Router } from 'express';
import { ReviewController } from '@/modules/review/review.controller';
import { authMiddleware } from '@/middleware/auth.moddleware';
import { createSubmissionSchema, getUserSubmissionsSchema } from '@/modules/review/review.schema';
import { validateRequest } from '@/middleware/validation.middleware';

const router: Router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validateRequest(createSubmissionSchema),
  ReviewController.createSubmission,
);

router.get('/', validateRequest(getUserSubmissionsSchema), ReviewController.getAll);
router.get('/:id', ReviewController.getOne);
router.delete('/:id', ReviewController.deleteSubmission);

export default router;
