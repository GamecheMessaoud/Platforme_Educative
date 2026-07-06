import { Router } from 'express';
import {
    register,
    login,
    getMe,
    refreshToken,
    socialLogin,
    forgotPassword,
    verifyOtp,
    resetPassword,
    uploadAvatar,
} from '../controllers/auth.controller';
import { updateProfile, changePassword, updateSkillLevel, getPublicProfile } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { imageUpload } from '../middlewares/imageUpload.middleware';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.get('/student/:id', getPublicProfile as any);
router.post('/token/refresh', refreshToken);
router.post('/social-login', socialLogin);

// Password recovery (3-step flow)
router.post('/forgot-password', forgotPassword);   // Step 1: send OTP email
router.post('/verify-otp', verifyOtp);             // Step 2: verify 6-digit OTP → get reset_token
router.post('/reset-password', resetPassword);      // Step 3: set new password

// ── Protected ─────────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, getMe as any);
router.put('/profile', authMiddleware, updateProfile as any);
router.post('/profile/avatar', authMiddleware, imageUpload.single('avatar'), uploadAvatar as any);
router.put('/update-skill', authMiddleware, updateSkillLevel as any);
router.put('/password', authMiddleware, changePassword as any);

export default router;
