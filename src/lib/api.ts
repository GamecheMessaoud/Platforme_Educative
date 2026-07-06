import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BASE_URL = API_BASE.replace('/api', '');

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: Attach JWT access token ──────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sadeem_access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // CRITICAL: If body is FormData, remove the default JSON Content-Type
    // so the browser sets it automatically with the correct multipart boundary.
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

// ── Response interceptor: Auto-refresh on 401 ────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt a refresh once per request to avoid infinite retry loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem('sadeem_refresh_token');

            if (refresh) {
                try {
                    const res = await axios.post(`${API_BASE}/auth/token/refresh`, { refresh });
                    const newAccess = res.data.access;
                    localStorage.setItem('sadeem_access_token', newAccess);
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return api(originalRequest);
                } catch {
                    // Refresh also failed — clear only auth-related keys, not all of localStorage
                    localStorage.removeItem('sadeem_access_token');
                    localStorage.removeItem('sadeem_refresh_token');
                    localStorage.removeItem('sadeem_remember');
                    
                    // Only redirect if they are not already on a public/home page
                    const publicPaths = ['/', '/signin', '/signup', '/courses', '/course-info'];
                    const isPublic = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/course-info/'));
                    if (!isPublic) {
                        window.location.href = '/signin';
                    }
                }
            } else {
                // No refresh token at all — only redirect if they are trying to reach a protected page
                const protectedPaths = ['/student-dashboard', '/teacher-dashboard', '/admin-dashboard', '/course-viewer', '/checkout', '/submissions', '/profile'];
                const isProtected = protectedPaths.some(p => window.location.pathname.startsWith(p));
                if (isProtected) {
                    window.location.href = '/signin';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
