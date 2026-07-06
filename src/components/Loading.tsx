import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse" dir="rtl">جاري التحميل...</p>
        </div>
    );
};

export default Loading;
