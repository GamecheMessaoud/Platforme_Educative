import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export interface StudentStats {
    total_xp: number;
    current_level: number;
    current_streak: number;
    xp_to_next_level: number;
    rank: number;
    completed_lessons_count: number;
}

export function useStudentStats() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (user?.role !== 'STUDENT') {
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get('/gamification/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch student stats:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.role]);

    useEffect(() => {
        fetchStats();
    }, [user?.id]);

    // Auto-refresh whenever a lesson is completed anywhere in the app
    useEffect(() => {
        const handler = () => fetchStats();
        window.addEventListener('lesson-completed', handler);
        return () => window.removeEventListener('lesson-completed', handler);
    }, [fetchStats]);

    return { stats, loading, refreshStats: fetchStats };
}
