import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLessons } from '../../hooks/useLessons';
import { useProgress } from '../../hooks/useProgress';
import type { VerificationResult } from '../../types';

import CourseHeaderNav from './Header';
import CourseHeader from './CourseHeader';
import LessonSidebar from './LessonSidebar';
import LessonContent from './LessonContent';
import Loading from '../Loading';
import Notification from '../Notification';

const ScratchCourse: React.FC = () => {
    const { user } = useAuthStore();
    const { lessons, loading } = useLessons();

    // Custom hooks for state
    const {
        completedLessons,
        totalXP,
        progress,
        completeLesson,
        addXP
    } = useProgress(user?.id || 'demo');

    // Local UI state
    const [currentLessonId, setCurrentLessonId] = useState<string>('1');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    // Set the first incomplete lesson as current, or lesson 1 if all complete
    useEffect(() => {
        if (lessons.length > 0) {
            const firstIncomplete = lessons.find(l => !completedLessons.includes(l.id));
            if (firstIncomplete) {
                setCurrentLessonId(firstIncomplete.id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessons]); // Only run when lessons load initially

    if (loading) return <Loading />;

    const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];
    const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
    const isCompleted = completedLessons.includes(currentLessonId);

    const handleVerified = (result: VerificationResult) => {
        if (result.isCorrect && !isCompleted) {
            completeLesson(currentLessonId);
            addXP(result.reward || 0);
            setNotification({
                message: result.feedback,
                type: 'success'
            });
        } else if (!result.isCorrect) {
            setNotification({
                message: result.feedback,
                type: 'warning'
            });
        }
    };

    const goToNextLesson = () => {
        if (currentIndex < lessons.length - 1) {
            setCurrentLessonId(lessons[currentIndex + 1].id);
            window.scrollTo(0, 0);
        }
    };

    const goToPrevLesson = () => {
        if (currentIndex > 0) {
            setCurrentLessonId(lessons[currentIndex - 1].id);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <CourseHeaderNav
                totalXP={totalXP}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main Layout */}
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Container */}
                <div className={`
          absolute lg:relative w-80 h-[calc(100vh-4rem)] bg-white z-30 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-[100%] lg:translate-x-0'}
          right-0
        `}>
                    <LessonSidebar
                        lessons={lessons}
                        currentLessonId={currentLessonId}
                        completedLessons={completedLessons}
                        onSelectLesson={setCurrentLessonId}
                        progress={progress}
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="w-full h-full p-4 lg:p-8 xl:p-12">

                        {/* Show course header only on lesson 1, or can show a smaller version elsewhere. Let's just show it at top always. */}
                        {currentIndex === 0 && (
                            <CourseHeader progress={progress} totalLessons={lessons.length} />
                        )}

                        <LessonContent
                            lesson={currentLesson}
                            isCompleted={isCompleted}
                            onVerified={handleVerified}
                            onPrevious={goToPrevLesson}
                            onNext={goToNextLesson}
                            hasPrevious={currentIndex > 0}
                            hasNext={currentIndex < lessons.length - 1}
                            isNextDisabled={!isCompleted}
                        />
                    </div>
                </div>
            </div>

            {notification && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm">
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default ScratchCourse;
