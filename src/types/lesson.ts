export interface Lesson {
    id: string;
    course_id?: string;
    title_ar?: string;
    title_en?: string;
    title_fr?: string;
    content_ar?: string;
    content_en?: string;
    content_fr?: string;
    video_url?: string;
    youtube_url?: string;
    lab_url?: string;
    guide_content?: string;
    extra_qcm?: any;
    lesson_type?: string;
    xp_reward?: number;
    order_index?: number;
    pdf_url?: string;
    submission_url_example?: string;
    // Scratch legacy fields
    videoPlaceholder?: boolean;
    concepts?: any[];
    blocks?: any[];
    challenge?: any;
    hints?: string[];
    // Mock properties for constants
    title?: string;
    emoji?: string;
    duration?: string;
    xp?: number;
    difficulty?: string;
    description?: string;
}

export interface LessonState {
    currentLessonId: string | null;
    completedLessons: string[];
    isLoading: boolean;
    error: string | null;
}
