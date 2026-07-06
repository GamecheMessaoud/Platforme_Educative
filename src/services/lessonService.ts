import api from '../lib/api';

export const getCourseLessons = async (courseId: string) => {
    try {
        const response = await api.get(`/lessons/course/${courseId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch lessons');
    }
};

export const createLesson = async (lessonData: any) => {
    try {
        const response = await api.post('/lessons', lessonData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create lesson');
    }
};

export const updateLesson = async (id: string, lessonData: any) => {
    try {
        const response = await api.put(`/lessons/${id}`, lessonData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update lesson');
    }
};

export const deleteLesson = async (id: string) => {
    try {
        const response = await api.delete(`/lessons/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to delete lesson');
    }
};

export const uploadLessonPdf = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('pdf', file);
        const response = await api.post('/lessons/upload-pdf', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data; // { url: '...' }
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to upload PDF');
    }
};
