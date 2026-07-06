import api from '../lib/api';

export const getTeacherStudents = async () => {
    try {
        const response = await api.get('/teacher/students');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch students');
    }
};

export const getTeacherAnalytics = async () => {
    try {
        const response = await api.get('/teacher/analytics');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch analytics');
    }
};
