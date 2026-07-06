import React from 'react';
import { PlayCircle, Award, CheckCircle, Lock } from 'lucide-react';
import type { Lesson } from '../../types';

interface SidebarProps {
    lessons: Lesson[];
    currentLessonId: string;
    completedLessons: string[];
    onSelectLesson: (id: string) => void;
    progress: number;
}

const LessonSidebar: React.FC<SidebarProps> = ({
    lessons,
    currentLessonId,
    completedLessons,
    onSelectLesson,
    progress
}) => {
    return (
        <div className="w-full lg:w-80 bg-white border-l border-slate-200 h-[calc(100vh-4rem)] overflow-y-auto hidden lg:flex flex-col z-30" dir="rtl">

            <div className="p-6 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                    <Award className="text-indigo-600" /> مسار الدورة
                </h2>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                    <span>اكتمل {progress}%</span>
                    <span>{completedLessons.length} / {lessons.length}</span>
                </div>
            </div>

            <div className="flex-1 p-3 space-y-2">
                {lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isCurrent = currentLessonId === lesson.id;

                    // A lesson is accessible if it's the first one, or the previous one is completed
                    const isAccessible = index === 0 || completedLessons.includes(lessons[index - 1].id) || isCompleted;

                    return (
                        <button
                            key={lesson.id}
                            onClick={() => isAccessible && onSelectLesson(lesson.id)}
                            disabled={!isAccessible}
                            className={`w-full text-right p-4 rounded-xl transition-all relative overflow-hidden group ${isCurrent
                                ? 'bg-indigo-50 border-2 border-indigo-600 shadow-sm'
                                : isAccessible
                                    ? 'bg-white border-2 border-transparent hover:bg-slate-50 hover:border-slate-200'
                                    : 'bg-slate-50 opacity-60 cursor-not-allowed border-2 border-transparent'
                                }`}
                        >
                            {isCurrent && (
                                <div className="absolute top-0 right-0 w-1 h-full bg-indigo-600 rounded-l-full" />
                            )}

                            <div className="flex items-start gap-4">
                                <div className={`p-2.5 rounded-xl shrink-0 ${isCompleted ? 'bg-emerald-100 text-emerald-600' :
                                    isCurrent ? 'bg-indigo-100 text-indigo-600' :
                                        isAccessible ? 'bg-slate-100 text-slate-500' :
                                            'bg-slate-200 text-slate-400'
                                    }`}>
                                    {isCompleted ? <CheckCircle size={20} className="fill-emerald-100" /> :
                                        isAccessible ? <PlayCircle size={20} /> :
                                            <Lock size={20} />}
                                </div>

                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xs font-bold text-slate-400">الدرس {index + 1}</span>
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                            {lesson.duration}
                                        </span>
                                    </div>
                                    <h3 className={`font-bold text-sm truncate ${isCurrent ? 'text-indigo-900' : 'text-slate-700'
                                        }`}>
                                        {lesson.title} {lesson.emoji}
                                    </h3>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LessonSidebar;
