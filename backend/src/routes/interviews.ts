import { Router } from 'express';
import { createInterview, deleteInterview, listInterviews } from '../controllers/interviewController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', listInterviews);
router.post('/', createInterview);
router.delete('/:id', deleteInterview);

export default router;
