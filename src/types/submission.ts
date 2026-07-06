export interface FileSubmission {
    id?: string;
    lessonId: number;
    studentId: string;
    studentName: string;
    studentEmail: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    submittedAt: Date;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected';
    professorFeedback?: string;
    submissionType: 'scratch-project' | 'code-file' | 'project-zip';
    description?: string;
}

export interface SubmissionResponse {
    success: boolean;
    message: string;
    submission?: FileSubmission;
    error?: string;
}
