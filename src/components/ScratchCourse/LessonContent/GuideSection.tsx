import React from 'react';
import { BookOpen } from 'lucide-react';

interface props {
    content: string;
}

const GuideSection: React.FC<props> = ({ content }) => {
    if (!content) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center">
                    <BookOpen className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black dark:text-white">دليل العمل والخطوات</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">اتبع الخطوات لإكمال المشروع بنجاح</p>
                </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none 
                prose-headings:font-black prose-p:font-medium prose-p:leading-relaxed text-slate-700 dark:text-slate-300">
                {content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>
        </div>
    );
};

export default GuideSection;
