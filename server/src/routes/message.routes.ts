import { Router } from 'express';
import { getConversations, getMessages, sendMessage, getAvailableTeachers } from '../controllers/message.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/conversations/:userId', getMessages);
router.post('/', sendMessage);
router.get('/teachers', roleMiddleware('STUDENT'), getAvailableTeachers);

export default router;
