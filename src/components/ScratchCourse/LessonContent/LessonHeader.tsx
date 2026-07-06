import React from 'react';
import type { Lesson } from '../../../types';

interface props {
    lesson: Lesson;
}

const LessonHeader: React.FC<props> = ({ lesson }) => {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8" dir="rtl">
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold border border-indigo-100">
                    الدرس {lesson.id}
                </span>
                <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold border border-purple-100">
                    {lesson.difficulty}
                </span>
                <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold flex items-center gap-1.5 border border-amber-100">
                    ⭐ +{lesson.xp} XP
                </span>
            </div>

            <h2 className="text-3xl font-black text-slate-800 mb-4 flex items-center gap-3">
                {lesson.title} <span className="text-4xl">{lesson.emoji}</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {lesson.description}
            </p>
        </div>
    );
};

export default LessonHeader;
