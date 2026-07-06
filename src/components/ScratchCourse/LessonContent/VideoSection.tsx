import React from 'react';
import { Play } from 'lucide-react';

interface props {
    lessonId: string;
}

const VideoSection: React.FC<props> = ({ }) => {
    // In a real app, you'd use the lesson's actual video URL/embed.  
    // Using a cool placeholder representing a standard player format.
    return (
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl aspect-video relative group mb-10 w-full" dir="rtl">
            {/* Decorative gradient behind the player placeholder */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-slate-800 to-purple-900 opacity-80" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-2xl">
                    <Play size={36} className="text-white fill-white ml-2" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">فيديو الشرح التفاعلي</h3>
                <p className="text-slate-300 max-w-sm mx-auto">اضغط للتشغيل لرؤية كيفية عمل الكتل البرمجية وتطبيقها عملياً</p>
            </div>

            {/* Fake player controls */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end px-6 pb-4">
                <div className="w-full flex items-center justify-between opacity-50">
                    <div className="flex gap-4">
                        <div className="w-4 h-4 rounded-full bg-white/80" />
                        <div className="w-4 h-4 rounded-full bg-white/80" />
                    </div>
                    <div className="w-full max-w-[60%] h-1.5 bg-white/30 rounded-full overflow-hidden mx-6">
                        <div className="w-1/3 h-full bg-red-500 rounded-full" />
                    </div>
                    <div className="w-4 h-4 rounded-full bg-white/80" />
                </div>
            </div>
        </div>
    );
};

export default VideoSection;
