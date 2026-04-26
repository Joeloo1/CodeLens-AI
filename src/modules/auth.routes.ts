import { Router } from 'express';
import { AuthController } from '@/modules/auth.controller';
import { validateRequest } from '@/middleware/validation.middleware';
import { SignupSchema, LoginSchema } from '@/modules/auth.schema';

const router: Router = Router();

router.post('/signup', validateRequest(SignupSchema), AuthController.signup);
router.post('/login', validateRequest(LoginSchema), AuthController.login);
router.post('/logout', AuthController.logout);

export default router;
