import { create } from 'zustand';
import api from '../lib/api';

// ── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    role: UserRole;
    avatar_url?: string;
    avatar?: string;
    xp?: number;
    studentProfile?: {
        id: string;
        total_xp: number;
        current_streak: number;
        current_level: number;
        placement_completed?: boolean;
        subscription_status?: string;
        subscription_end_date?: string | null;
    };
}

interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    // Backend accepts uppercase role; lowercase is normalised before sending
    role: 'STUDENT' | 'TEACHER';
    age?: number;
    gender?: 'male' | 'female';
    interests?: string[];
}

interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    /** Rehydrate auth state from localStorage (call once on app mount). */
    initAuth: () => Promise<void>;

    login: (email: string, password: string) => Promise<AuthUser>;
    register: (data: RegisterData) => Promise<AuthUser>;
    socialLogin: (provider: string, email: string, name: string) => Promise<void>;
    logout: () => void;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    setUser: (user: AuthUser | null) => void;
    refreshUser: () => Promise<void>;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,

    setUser: (user) =>
        set({ user, isAuthenticated: user !== null, isLoading: false }),

    // ── refreshUser ───────────────────────────────────────────────────────────
    refreshUser: async () => {
        try {
            const res = await api.get<AuthUser>('/auth/me');
            set({ user: res.data, isAuthenticated: true });
        } catch (err) {
            console.error('Failed to refresh user profile:', err);
        }
    },

    // ── initAuth ──────────────────────────────────────────────────────────────
    initAuth: async () => {
        const token = localStorage.getItem('sadeem_access_token');
        if (!token) return;

        set({ isLoading: true });
        try {
            const res = await api.get<AuthUser>('/auth/me');
            set({ user: res.data, isAuthenticated: true, isLoading: false });
        } catch {
            localStorage.removeItem('sadeem_access_token');
            localStorage.removeItem('sadeem_refresh_token');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    // ── login ─────────────────────────────────────────────────────────────────
    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await api.post<{ token: string; refresh_token: string; user: AuthUser }>(
                '/auth/login',
                { email, password }
            );
            const { token, refresh_token, user } = res.data;
            localStorage.setItem('sadeem_access_token', token);
            localStorage.setItem('sadeem_refresh_token', refresh_token);
            set({ user, isAuthenticated: true, isLoading: false });
            return user;
        } catch (err: any) {
            set({ isLoading: false });
            const msg = err.response?.data?.message || err.response?.data?.detail || 'فشل تسجيل الدخول';
            throw new Error(msg);
        }
    },

    // ── register ──────────────────────────────────────────────────────────────
    register: async (data) => {
        set({ isLoading: true });
        try {
            const payload = { ...data, role: data.role.toUpperCase() };
            const res = await api.post<{ token: string; refresh_token: string; user: AuthUser }>(
                '/auth/register',
                payload
            );
            const { token, refresh_token, user } = res.data;
            localStorage.setItem('sadeem_access_token', token);
            localStorage.setItem('sadeem_refresh_token', refresh_token);
            set({ user, isAuthenticated: true, isLoading: false });
            return user;
        } catch (err: any) {
            set({ isLoading: false });
            const msg = err.response?.data?.message || err.response?.data?.detail || 'حدث خطأ أثناء إنشاء الحساب';
            throw new Error(msg);
        }
    },

    // ── socialLogin ───────────────────────────────────────────────────────────
    socialLogin: async (provider, email, name) => {
        set({ isLoading: true });
        try {
            const res = await api.post<{ token: string; refresh_token: string; user: AuthUser }>(
                '/auth/social-login',
                { provider, email, name }
            );
            const { token, refresh_token, user } = res.data;
            localStorage.setItem('sadeem_access_token', token);
            localStorage.setItem('sadeem_refresh_token', refresh_token);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
            throw err;
        }
    },

    // ── logout ────────────────────────────────────────────────────────────────
    logout: () => {
        localStorage.removeItem('sadeem_access_token');
        localStorage.removeItem('sadeem_refresh_token');
        localStorage.removeItem('sadeem_remember');
        set({ user: null, isAuthenticated: false, isLoading: false });
    },

    // ── forgotPassword ────────────────────────────────────────────────────────
    forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
            await api.post('/auth/forgot-password', { email });
            set({ isLoading: false });
        } catch (err) {
            set({ isLoading: false });
            throw err;
        }
    },

    // ── resetPassword ─────────────────────────────────────────────────────────
    resetPassword: async (token, password) => {
        set({ isLoading: true });
        try {
            await api.post('/auth/reset-password', { token, password });
            set({ isLoading: false });
        } catch (err) {
            set({ isLoading: false });
            throw err;
        }
    },
}));
