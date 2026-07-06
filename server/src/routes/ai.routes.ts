import { Router } from 'express';
import { chatWithCoddy, chatWithExpert, uploadRagDocument, getRagHealth } from '../controllers/ai.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Public health check (frontend polls this to show RAG status indicator)
router.get('/health', getRagHealth as any);

// Authenticated chat endpoints
router.post('/chat', authMiddleware as any, chatWithCoddy as any);
router.post('/chat/expert', authMiddleware as any, chatWithExpert as any);

// RAG upload endpoint (Admin only)
router.post(
    '/rag/upload',
    authMiddleware as any,
    roleMiddleware('ADMIN') as any,
    upload.single('file'),
    uploadRagDocument as any
);

export default router;
