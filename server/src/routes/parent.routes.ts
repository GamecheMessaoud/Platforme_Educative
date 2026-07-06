import { Router } from 'express';
import { getChildrenProgress, linkChild } from '../controllers/parent.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware as any);
router.use(roleMiddleware('PARENT') as any);

router.get('/children', getChildrenProgress as any);
router.post('/link', linkChild as any);

export default router;
