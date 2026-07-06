import { Router } from 'express';
import { createCheckoutSession, handleWebhook } from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/checkout', authMiddleware, createCheckoutSession);
router.post('/webhook', handleWebhook);

export default router;
