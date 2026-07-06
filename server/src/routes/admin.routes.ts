import { Router } from 'express';
import {
    getDashboardStats,
    getUsers,
    getCourses,
    getPayments,
    getStoreSummary,
    getSettings,
    updateSetting,
    toggleUserStatus,
    updateUser,
    deleteUser,
    deleteCourse,
    getReports,
    activateUserVip,
    getSubscriptions,
    approveSubscription
} from '../controllers/admin.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.post('/users/:id/activate-vip', activateUserVip);
router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions/:id/approve', approveSubscription);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/courses', getCourses);
router.delete('/courses/:id', deleteCourse);
router.get('/payments', getPayments);
router.get('/store', getStoreSummary);
router.get('/settings', getSettings);
router.post('/settings', updateSetting);
router.get('/reports', getReports);

export default router;
