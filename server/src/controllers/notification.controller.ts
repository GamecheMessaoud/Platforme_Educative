import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { io } from '../server'; // Import the Socket.io instance

/**
 * Creates an SSE stream connection.
 * Client connects here and stays connected for real-time notifications.
 */
// [REMOVED SSE STREAM ENDPOINT - MIGRATING TO SOCKET.IO]

/**
 * Get the history of notifications for the user
 */
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const notifications = await (prisma as any).notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 50 // Limit to most recent 50
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error retrieving notifications' });
    }
};

/**
 * Mark a specific notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const notificationId = req.params.id;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const updated = await (prisma as any).notification.updateMany({
            where: { 
                id: notificationId,
                user_id: userId
            },
            data: { is_read: true }
        });

        res.json({ success: true, updated: updated.count });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};

/**
 * Mark all user's notifications as read
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const updated = await (prisma as any).notification.updateMany({
            where: { 
                user_id: userId,
                is_read: false
            },
            data: { is_read: true }
        });

        res.json({ success: true, updated: updated.count });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all notifications as read' });
    }
};

/**
 * Internal helper to create a Notification DB record and then send SSE
 */
export const createAndSendNotification = async (
    userId: string,
    type: string,
    title_ar: string,
    body_ar: string,
    icon: string = '🔔',
    link: string | null = null
) => {
    try {
        // Save to Database
        const notification = await (prisma as any).notification.create({
            data: {
                user_id: userId,
                type,
                title_ar,
                body_ar,
                icon,
                link
            }
        });

        // Send Real-time via Socket.io
        io.to(userId).emit('notification', notification);
        console.log(`[Socket] Notification emitted to user ${userId}`);
    } catch (error) {
        console.error('Failed to create notification inside helper:', error);
    }
};
