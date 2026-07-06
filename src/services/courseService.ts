import api from '../lib/api';

export const getTeacherCourses = async () => {
    try {
        const response = await api.get('/courses/teacher');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch courses');
    }
};

export const createCourse = async (data: { title_ar: string, title_en?: string, title_fr?: string, categoryType: string, thumbnail?: string, description?: string, difficulty?: string, level?: string | number, xp_reward?: string | number }) => {
    try {
        const response = await api.post('/courses', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create course');
    }
};

export const updateCourse = async (id: string, data: { title_ar?: string, title_en?: string, title_fr?: string, categoryType?: string, thumbnail?: string, description?: string, status?: 'published' | 'draft', difficulty?: string, level?: string | number, xp_reward?: string | number }) => {
    try {
        const response = await api.put(`/courses/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update course');
    }
};

export const deleteCourse = async (id: string) => {
    try {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to delete course');
    }
};
