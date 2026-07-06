export * from './lesson';
export * from './submission';
export type StudentSkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Course {
    id: string;
    title: string;
    title_en?: string;
    title_fr?: string;
    description: string;
    description_en?: string;
    description_fr?: string;
    learning_objectives?: string;
    estimated_duration?: number;
    thumbnail: string;
    category: string;
    status: 'published' | 'draft';
    difficulty: string;
    xp_reward: number;
    studentsCount: number;
    rating: number;
    createdAt?: Date;
}
export * from './verification';
