import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createAndSendNotification } from './notification.controller';

/**
 * Get community posts (Galaxy and Arena)
 */
export const getCommunityPosts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (type) {
            where.type = type;
        }

        const posts = await prisma.communityPost.findMany({
            where,
            include: {
                author: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                avatar_url: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        reactions: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: Number(limit)
        });

        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching posts' });
    }
};

/**
 * Create a new community post
 */
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            res.status(403).json({ error: 'Student profile not found' });
            return;
        }

        const { type, title, content, media_url } = req.body;

        if (!title || !content || !type) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const post = await prisma.communityPost.create({
            data: {
                author_id: student.id,
                type,
                title,
                content,
                media_url
            }
        });

        res.status(201).json(post);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error creating post' });
    }
};

/**
 * Like/Reaction toggle
 */
export const toggleReaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { postId } = req.params;
        const { type = 'LIKE' } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            res.status(403).json({ error: 'Student profile not found' });
            return;
        }

        const existing = await prisma.reaction.findUnique({
            where: {
                post_id_user_id: {
                    post_id: postId as string,
                    user_id: student.id
                }
            }
        });

        if (existing) {
            await prisma.reaction.delete({
                where: { id: existing.id }
            });
            res.json({ message: 'Reaction removed' });
        } else {
            await prisma.reaction.create({
                data: {
                    post_id: postId as string,
                    user_id: student.id,
                    type: type as any
                }
            });
            res.json({ message: 'Reaction added' });

            // Notify Post Author
            try {
                const post = await prisma.communityPost.findUnique({
                    where: { id: postId as string },
                    include: { author: true }
                });
                
                if (post && post.author.user_id !== userId) {
                    createAndSendNotification(
                        post.author.user_id,
                        'REACTION',
                        'تفاعل جديد!',
                        `قام ${(req.user as any)?.first_name || 'بطل'} بالتفاعل مع منشورك.`,
                        '❤️',
                        '/community'
                    );
                }
            } catch (err) { console.error('Reaction Notification Error:', err); }
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error toggling reaction' });
    }
};

/**
 * Add a comment to a post
 */
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { postId } = req.params;
        const { content } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            res.status(403).json({ error: 'Student profile not found' });
            return;
        }

        if (!content) {
            res.status(400).json({ error: 'Comment content is required' });
            return;
        }

        const comment = await prisma.comment.create({
            data: {
                post_id: postId as string,
                author_id: student.id,
                content
            }
        });

        res.status(201).json(comment);

        // Notify Post Author
        try {
            const post = await prisma.communityPost.findUnique({
                where: { id: postId as string },
                include: { author: true }
            });
            
            if (post && post.author.user_id !== userId) {
                createAndSendNotification(
                    post.author.user_id,
                    'COMMENT',
                    'تعليق جديد!',
                    `قام ${(req.user as any)?.first_name || 'بطل'} بالتعليق على منشورك.`,
                    '💬',
                    '/community'
                );
            }
        } catch (err) { console.error('Comment Notification Error:', err); }
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error adding comment' });
    }
};

/**
 * Get comments for a post
 */
export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;

        const comments = await prisma.comment.findMany({
            where: { post_id: postId as string },
            include: {
                author: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                avatar_url: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'asc' }
        });

        res.json(comments);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching comments' });
    }
};

/**
 * Get a single post by ID
 */
export const getPostById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;

        const post = await prisma.communityPost.findUnique({
            where: { id: postId as string },
            include: {
                author: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                avatar_url: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        reactions: true
                    }
                }
            }
        });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        res.json(post);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching post' });
    }
};

/**
 * Delete a post (Admin, Teacher, or Author)
 */
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const { postId } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const post = await prisma.communityPost.findUnique({
            where: { id: postId as string }
        });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        // Check permissions: Admin/Teacher can delete anyone's, Student can only delete their own
        if (role === 'ADMIN' || role === 'TEACHER') {
            // Authorized
        } else {
            const student = await prisma.student.findUnique({ where: { user_id: userId } });
            if (!student || post.author_id !== student.id) {
                res.status(403).json({ error: 'Unauthorized to delete this post' });
                return;
            }
        }

        await prisma.communityPost.delete({
            where: { id: postId as string }
        });

        res.json({ message: 'Post deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error deleting post' });
    }
};

/**
 * Delete a comment (Admin, Teacher, or Author)
 */
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const { commentId } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const comment = await prisma.comment.findUnique({
            where: { id: commentId as string }
        });

        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        // Check permissions
        if (role === 'ADMIN' || role === 'TEACHER') {
            // Authorized
        } else {
            const student = await prisma.student.findUnique({ where: { user_id: userId } });
            if (!student || comment.author_id !== student.id) {
                res.status(403).json({ error: 'Unauthorized to delete this comment' });
                return;
            }
        }

        await prisma.comment.delete({
            where: { id: commentId as string }
        });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error deleting comment' });
    }
};

// ── Image Upload ─────────────────────────────────────────────────────────────
export const uploadCommunityImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'غير مصرح' });
            return;
        }

        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'يرجى إرفاق صورة' });
            return;
        }

        const publicUrl = `/uploads/images/${file.filename}`;
        
        res.json({ 
            message: 'تم رفع الصورة بنجاح', 
            imageUrl: publicUrl 
        });
    } catch (error: any) {
        console.error('uploadCommunityImage error:', error);
        res.status(500).json({ error: 'خطأ في الخادم أثناء رفع الصورة' });
    }
};
