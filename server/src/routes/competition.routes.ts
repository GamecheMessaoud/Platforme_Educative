import { Router } from 'express';
import {
    createCompetition,
    getCompetitions,
    getCompetitionById,
    updateCompetition,
    deleteCompetition,
    joinCompetition
} from '../controllers/competition.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public/Authenticated (Shared)
router.get('/', authMiddleware, getCompetitions);
router.get('/:id', authMiddleware, getCompetitionById);

// Student actions
router.post('/:id/join', authMiddleware, roleMiddleware('STUDENT'), joinCompetition);

// Teacher/Admin actions
router.post('/', authMiddleware, roleMiddleware('TEACHER', 'ADMIN'), createCompetition);
router.put('/:id', authMiddleware, roleMiddleware('TEACHER', 'ADMIN'), updateCompetition);
router.delete('/:id', authMiddleware, roleMiddleware('TEACHER', 'ADMIN'), deleteCompetition);

export default router;
