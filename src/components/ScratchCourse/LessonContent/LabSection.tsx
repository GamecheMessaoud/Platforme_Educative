import React from 'react';
import { ExternalLink, FlaskConical } from 'lucide-react';

interface props {
    labUrl: string;
}

const LabSection: React.FC<props> = ({ labUrl }) => {
    if (!labUrl) return null;

    return (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-xl text-white mb-10 animate-fade-in relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center md:text-right">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                        <FlaskConical size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black mb-1">المختبر البرمجي</h3>
                        <p className="text-white/80 font-medium">ابدأ تطبيق ما تعلمته في البيئة البرمجية المباشرة</p>
                    </div>
                </div>

                <a
                    href={labUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-50 hover:scale-105 transition-all group/btn"
                >
                    فتح المختبر <ExternalLink size={20} className="group-hover/btn:translate-x-[-4px] transition-transform" />
                </a>
            </div>
        </div>
    );
};

export default LabSection;
