import { Router } from 'express';
import { getGamificationStats, getLeaderboard, recordXpTransaction, getPublicProfile, migrateAllStudentLevels } from '../controllers/gamification.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Route to get current user's stats
router.get('/stats', authMiddleware, roleMiddleware('STUDENT'), getGamificationStats);

// Route to get the global student leaderboard
router.get('/leaderboard', authMiddleware, getLeaderboard);

// Route for fetching a public student profile
router.get('/profile/:id', getPublicProfile);

// Route to reward a user with XP
router.post('/reward', authMiddleware, roleMiddleware('TEACHER'), recordXpTransaction);

// ADMIN: Migrate all student levels to the new XP formula
router.post('/admin/migrate-levels', authMiddleware, roleMiddleware('ADMIN'), migrateAllStudentLevels);


export default router;
