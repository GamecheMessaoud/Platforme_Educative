import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useProgress = (studentId: string) => {
    const [completedLessons, setCompletedLessons] = useLocalStorage<string[]>(
        `sadeem_${studentId}_completed_lessons`,
        []
    );

    const [totalXP, setTotalXP] = useLocalStorage<number>(
        `sadeem_${studentId}_total_xp`,
        0
    );

    const completeLesson = useCallback((lessonId: string) => {
        setCompletedLessons(prev => {
            if (prev.includes(lessonId)) return prev;
            return [...prev, lessonId];
        });
    }, [setCompletedLessons]);

    const addXP = useCallback((xp: number) => {
        setTotalXP(prev => prev + xp);
    }, [setTotalXP]);

    const progress = Math.round((completedLessons.length / 10) * 100);

    return {
        completedLessons,
        totalXP,
        progress,
        completeLesson,
        addXP
    };
};
