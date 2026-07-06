import React from 'react';
import { Lightbulb } from 'lucide-react';

interface props {
    concepts: string[];
}

const ConceptsSection: React.FC<props> = ({ concepts }) => {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 mb-8 border border-indigo-100 shadow-sm" dir="rtl">
            <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                <Lightbulb className="text-amber-500 fill-amber-500" /> مفاهيم سنتعلمها
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {concepts.map((concept, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-black flex items-center justify-center shrink-0">
                            {index + 1}
                        </div>
                        <p className="font-bold text-slate-700 mt-1">{concept}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConceptsSection;
