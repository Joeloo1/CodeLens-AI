import { Router } from 'express';
import { healthCheck } from '@/controller/health.controller';

const router: Router = Router();

router.get('/', healthCheck);

export default router;
