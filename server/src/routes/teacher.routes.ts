import { Router } from 'express';
import { getTeacherStudents, getTeacherAnalytics } from '../controllers/teacher.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Only TEACHER roles should access these routes
router.use(authMiddleware);
router.use(roleMiddleware('TEACHER'));

router.get('/students', getTeacherStudents);
router.get('/analytics', getTeacherAnalytics);

export default router;
