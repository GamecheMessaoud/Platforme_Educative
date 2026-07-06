import { useState } from 'react';
import type { FileSubmission } from '../types/submission';
import { submitFile, getStudentSubmissions } from '../services/fileSubmissionService';

export const useFileSubmission = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (formData: FormData, studentId: string): Promise<FileSubmission> => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await submitFile(formData, studentId);
            return result;
        } catch (err: any) {
            const errorMessage = err.message || 'Upload failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getSubmissions = async (
        lessonId: string,
        studentId: string
    ): Promise<FileSubmission[]> => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await getStudentSubmissions(lessonId, studentId);
            return result;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load submissions';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { uploadFile, getSubmissions, isLoading, error };
};
