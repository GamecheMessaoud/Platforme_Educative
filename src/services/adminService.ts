import api from '../lib/api';

export const getAdminStats = async () => {
    try {
        const response = await api.get('/admin/stats');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch admin stats');
    }
};

export const getAdminUsers = async () => {
    try {
        const response = await api.get('/admin/users');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
};

export const getAdminCourses = async () => {
    try {
        const response = await api.get('/admin/courses');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch courses');
    }
};

export const getAdminPayments = async () => {
    try {
        const response = await api.get('/admin/payments');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch payments');
    }
};

export const getAdminStore = async () => {
    try {
        const response = await api.get('/admin/store');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch store data');
    }
};

export const getAdminSettings = async () => {
    try {
        const response = await api.get('/admin/settings');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch settings');
    }
};

export const updateAdminSetting = async (key: string, value: string) => {
    try {
        const response = await api.post('/admin/settings', { key, value });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update setting');
    }
};

export const toggleUserStatus = async (id: string) => {
    try {
        const response = await api.patch(`/admin/users/${id}/toggle-status`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to toggle user status');
    }
};

export const adminDeleteCourse = async (id: string) => {
    try {
        const response = await api.delete(`/admin/courses/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to delete course');
    }
};

export const updateAdminUser = async (id: string, data: any) => {
    try {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update user');
    }
};

export const deleteAdminUser = async (id: string) => {
    try {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
};

export const getAdminReports = async () => {
    try {
        const response = await api.get('/admin/reports');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch reports');
    }
};

export const activateStudentVip = async (id: string) => {
    try {
        const response = await api.post(`/admin/users/${id}/activate-vip`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to activate VIP pass');
    }
};

export const getAdminSubscriptions = async () => {
    try {
        const response = await api.get('/admin/subscriptions');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch subscriptions');
    }
};

export const approveAdminSubscription = async (id: string) => {
    try {
        const response = await api.post(`/admin/subscriptions/${id}/approve`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to approve subscription');
    }
};
