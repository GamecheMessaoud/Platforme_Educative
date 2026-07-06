import { useState, useEffect } from 'react';
import type { Lesson } from '../types/lesson';
import api from '../lib/api';

export const useLessons = (courseId?: string) => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLessons = async () => {
            try {
                setLoading(true);
                let targetCourseId = courseId;
                
                // If no courseId provided (e.g. from standalone ScratchCourse page), 
                // fetch public courses to find the scratch course ID
                if (!targetCourseId) {
                    const publicCourses = await api.get('/courses/public');
                    const scratchCourse = publicCourses.data.find((c: any) => c.category?.slug === 'scratch' || c.category?.slug === 'scratch-3');
                    if (scratchCourse) {
                        targetCourseId = scratchCourse.id;
                    }
                }

                if (targetCourseId) {
                    const response = await api.get(`/lessons/course/${targetCourseId}`);
                    setLessons(response.data);
                } else {
                    console.warn('No course ID found for lessons');
                    setLessons([]);
                }
            } catch (error) {
                console.error('Error loading lessons:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLessons();
    }, [courseId]);

    return { lessons, loading };
};
