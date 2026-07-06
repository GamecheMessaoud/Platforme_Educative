import { Router } from 'express';
import {
    getMyNotifications,
    markAsRead,
    markAllAsRead
} from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.get('/', getMyNotifications as any);
router.put('/:id/read', markAsRead as any);
router.put('/read-all', markAllAsRead as any);

export default router;
