import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export interface Notification {
    id: string;
    type: string;
    title_ar: string;
    body_ar: string;
    icon: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef<Socket | null>(null);

    const loadNotifications = async () => {
        const token = localStorage.getItem('sadeem_access_token');
        if (!token) return; // Prevent 401 errors on public pages

        try {
            const { data } = await api.get<Notification[]>('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    const setupSocket = () => {
        if (socketRef.current) return;

        const token = localStorage.getItem('sadeem_access_token');
        if (!token) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected to real-time server');
            // Join the user-specific room for private notifications
            const userStr = localStorage.getItem('sadeem_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                socket.emit('join', user.id);
            }
        });

        socket.on('notification', (notif: Notification) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // PFE Presentation Secret: Confetti on milestones!
            if (notif.type === 'BADGE' || notif.type === 'LEVEL_UP' || notif.type === 'ACHIEVEMENT') {
                window.dispatchEvent(new CustomEvent('show-confetti'));
            }
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message);
        });

        socketRef.current = socket;
    };

    useEffect(() => {
        loadNotifications();
        setupSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    return { notifications, unreadCount, markAsRead, markAllAsRead };
}
