import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        // Find all users the current user has messaged or been messaged by
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { sender_id: userId as string },
                    { receiver_id: userId as string }
                ]
            },
            include: {
                sender: { select: { id: true, first_name: true, last_name: true, avatar_url: true, role: true } },
                receiver: { select: { id: true, first_name: true, last_name: true, avatar_url: true, role: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        // Group by user
        const conversationsMap = new Map();
        for (const msg of messages) {
            const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
            if (!conversationsMap.has(otherUser.id)) {
                conversationsMap.set(otherUser.id, {
                    user: otherUser,
                    lastMessage: msg,
                    unreadCount: msg.receiver_id === userId && !msg.is_read ? 1 : 0
                });
            } else {
                if (msg.receiver_id === userId && !msg.is_read) {
                    const data = conversationsMap.get(otherUser.id);
                    data.unreadCount += 1;
                }
            }
        }

        res.json(Array.from(conversationsMap.values()));
    } catch (error: any) {
        res.status(500).json({ error: 'Error fetching conversations' });
    }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const otherUserId = req.params.userId;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { sender_id: userId as string, receiver_id: otherUserId as string },
                    { sender_id: otherUserId as string, receiver_id: userId as string }
                ]
            },
            orderBy: { created_at: 'asc' }
        });

        // Mark as read
        await prisma.message.updateMany({
            where: {
                sender_id: otherUserId as string,
                receiver_id: userId as string,
                is_read: false
            },
            data: { is_read: true }
        });

        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const senderId = req.user?.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            res.status(400).json({ error: 'Receiver ID and content are required' });
            return;
        }

        const message = await prisma.message.create({
            data: {
                sender_id: senderId as string,
                receiver_id: receiverId,
                content
            }
        });

        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ error: 'Error sending message' });
    }
};

export const getAvailableTeachers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Students can message any teacher
        const teachers = await prisma.user.findMany({
            where: { role: 'TEACHER', is_active: true },
            select: { id: true, first_name: true, last_name: true, avatar_url: true }
        });
        res.json(teachers);
    } catch (error: any) {
        res.status(500).json({ error: 'Error fetching teachers' });
    }
};
