import { Router } from 'express';
import {
    getCommunityPosts,
    createPost,
    toggleReaction,
    addComment,
    getComments,
    getPostById,
    deletePost,
    deleteComment,
    uploadCommunityImage
} from '../controllers/community.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { imageUpload } from '../middlewares/imageUpload.middleware';

const router = Router();

// Public/Authenticated feed
router.get('/posts', getCommunityPosts);
router.get('/posts/:postId', getPostById);
router.get('/posts/:postId/comments', getComments);

// Authenticated actions
router.post('/posts/upload', authMiddleware, imageUpload.single('image'), uploadCommunityImage as any);
router.post('/posts', authMiddleware, createPost);
router.delete('/posts/:postId', authMiddleware, deletePost);
router.post('/posts/:postId/react', authMiddleware, toggleReaction);
router.post('/posts/:postId/comments', authMiddleware, addComment);
router.delete('/comments/:commentId', authMiddleware, deleteComment);

export default router;
