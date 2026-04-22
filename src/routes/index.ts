import { Router } from 'express';
import healthRoutes from '@/routes/health.routes';

const router: Router = Router();

router.use('/health', healthRoutes);

export default router;
