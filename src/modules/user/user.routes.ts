import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '@/middleware/auth.moddleware';

const router: Router = Router();

router.use(authMiddleware);

router.get('profile/:id', UserController.getProfile);

export default router;
