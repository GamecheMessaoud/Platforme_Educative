import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createSubscriptionCheckout, getCurrentSubscription, verifySubscriptionTesting } from '../controllers/subscription.controller';

const router = Router();

router.post('/checkout', authMiddleware, createSubscriptionCheckout);
router.get('/my', authMiddleware, getCurrentSubscription);
router.post('/verify-mock', authMiddleware, verifySubscriptionTesting);

export default router;
