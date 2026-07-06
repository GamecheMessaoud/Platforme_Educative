import React from 'react';
import { Target, Clock, Book } from 'lucide-react';

interface CourseHeaderProps {
    progress: number;
    totalLessons: number;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ progress, totalLessons }) => {
    return (
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-[2.5rem] shadow-2xl p-8 lg:p-12 mb-8 text-white relative overflow-hidden" dir="rtl">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-2 border border-white/10 shadow-sm">
                            <span className="text-lg">🎨</span> Scratch 3
                        </span>
                        <span className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-white/5">
                            <Book size={16} /> {totalLessons} دروس
                        </span>
                        <span className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-white/5">
                            <Clock size={16} /> 4 ساعات
                        </span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">
                        دورة الأساسيات - <span className="text-yellow-300">البرمجة المرئية</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-white/80 font-medium max-w-2xl leading-relaxed">
                        تعلم البرمجة بطريقة ممتعة ومبسطة من خلال سحب وإفلات الكتل البرمجية لصنع ألعابك وقصصك التفاعلية!
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-10 bg-black/20 p-5 rounded-2xl border border-white/10 backdrop-blur-sm max-w-xl">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold flex items-center gap-2">
                                <Target size={18} className="text-yellow-300" /> تقدمك في الدورة
                            </span>
                            <span className="text-base font-black text-yellow-300">{progress}%</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden shadow-inner flex">
                            <div
                                className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-full rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex items-center justify-center w-64 h-64 bg-white/10 backdrop-blur-xl rounded-[3rem] border-2 border-white/20 shadow-2xl rotate-3 hover:rotate-6 transition-transform duration-500 relative">
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-2xl rotate-12 flex items-center justify-center text-2xl shadow-lg border-2 border-white">✨</div>
                    <div className="text-[8rem] filter drop-shadow-2xl">🐱</div>
                </div>
            </div>
        </div>
    );
};

export default CourseHeader;
