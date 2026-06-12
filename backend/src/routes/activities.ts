import { Router } from 'express';
import { listActivities } from '../controllers/activityController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', listActivities);

export default router;
