import { Router } from 'express';
import { AuthController } from '@/modules/auth/auth.controller';
import { validateRequest } from '@/middleware/validation.middleware';
import { SignupSchema, LoginSchema, RefreshTokenSchema } from '@/modules/auth/auth.schema';
import { authMiddleware } from '@/middleware/auth.moddleware';

const router: Router = Router();

router.post('/signup', validateRequest(SignupSchema), AuthController.signup);
router.post('/login', validateRequest(LoginSchema), AuthController.login);
router.post('/refresh', validateRequest(RefreshTokenSchema), AuthController.refresh);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;
