import { Router } from 'express';
import healthRoutes from '@/routes/health.routes';
import authRoutes from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/user/user.routes';
import reviewRoutes from '@/modules/review/review.routes';

const router: Router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/review', reviewRoutes);

export default router;
