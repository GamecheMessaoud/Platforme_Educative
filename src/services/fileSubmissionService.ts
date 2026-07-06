import type { FileSubmission } from '../types/submission';

// Use same base URL pattern as other API calls
const API_BASE = 'http://localhost:5000/api';
export const submitFile = async (formData: FormData, studentId: string): Promise<FileSubmission> => {
    const token = localStorage.getItem('sadeem_access_token');

    // Explicitly using fetch with FormData (browser sets boundary automatically)
    const response = await fetch(`${API_BASE}/submissions/upload/${studentId}`, {
        method: 'POST',
        body: formData,
        headers: {
            ...(token && { Authorization: `Bearer ${token}` })
            // Note: Content-Type is intentionally omitted so browser sets multipart/form-data boundary
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في رفع الملف');
    }

    const data = await response.json();
    return {
        ...data.submission,
        submittedAt: new Date(data.submission.submittedAt),
        reviewedAt: data.submission.reviewedAt ? new Date(data.submission.reviewedAt) : undefined
    };
};

export const getStudentSubmissions = async (
    lessonId: string,
    studentId: string
): Promise<FileSubmission[]> => {
    const token = localStorage.getItem('sadeem_access_token');
    const response = await fetch(
        `${API_BASE}/submissions/student/${studentId}?lesson_ref_id=${lessonId}`,
        {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` })
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في تحميل التسليمات');
    }

    const data = await response.json();
    return data.submissions.map((sub: any) => ({
        ...sub,
        submittedAt: new Date(sub.submittedAt),
        reviewedAt: sub.reviewedAt ? new Date(sub.reviewedAt) : undefined
    }));
};

export const getTeacherSubmissions = async (courseSlug: string, status?: string): Promise<any[]> => {
    const token = localStorage.getItem('sadeem_access_token');
    const url = new URL(`${API_BASE}/submissions/teacher/course/${courseSlug}`);
    if (status) {
        url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` })
        }
    });

    if (!response.ok) {
        throw new Error('فشل في تحميل التسليمات للمعلم');
    }

    const data = await response.json();
    return data.submissions.map((sub: any) => ({
        ...sub,
        submittedAt: new Date(sub.submittedAt),
        reviewedAt: sub.reviewedAt ? new Date(sub.reviewedAt) : undefined
    }));
}

export const reviewSubmission = async (
    id: string,
    status: string,
    feedback?: string
): Promise<FileSubmission> => {
    const token = localStorage.getItem('sadeem_access_token');
    const response = await fetch(`${API_BASE}/submissions/${id}/review`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
            status,
            professor_feedback: feedback
        })
    });

    if (!response.ok) {
        throw new Error('فشل في تحديث حالة التسليم');
    }

    const data = await response.json();
    return {
        ...data.submission,
        submittedAt: new Date(data.submission.submittedAt),
        reviewedAt: data.submission.reviewedAt ? new Date(data.submission.reviewedAt) : undefined
    };
}
